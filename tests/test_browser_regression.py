from __future__ import annotations

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

import pytest
from playwright.sync_api import Browser, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PROJECTS = json.loads((ROOT / "projects.json").read_text(encoding="utf-8"))
PROJECT_SLUGS = [project["demo_url"].split("/projects/", 1)[1].strip("/") for project in PROJECTS]


class QuietStaticHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


@pytest.fixture(scope="session")
def site_url() -> str:
    handler = partial(QuietStaticHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    server.daemon_threads = True
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    host, port = server.server_address
    try:
        yield f"http://{host}:{port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


@pytest.fixture(scope="session")
def browser() -> Browser:
    with sync_playwright() as playwright:
        instance = playwright.chromium.launch()
        yield instance
        instance.close()


def open_local_page(
    browser: Browser,
    *,
    width: int = 1365,
    height: int = 900,
) -> tuple[object, Page]:
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce",
    )
    page = context.new_page()
    # External fonts, scripts and stock images are not part of the local UI regression.
    page.route("https://**/*", lambda route: route.abort())
    return context, page


def test_main_portfolio_renders_projects_and_recalculates_brief(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser)
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    try:
        page.goto(f"{site_url}/", wait_until="domcontentloaded")
        page.locator("#projects-grid .project-card").nth(4).wait_for()

        assert page.locator("#projects-grid .project-card").count() == 5
        assert page.locator("#project-count").inner_text() == "05 / 05"
        assert page.locator("#brief-result-price").inner_text() == "от 8 000 ₽"

        page.locator('input[name="brief-format"][value="company"]').check()
        assert page.locator("#brief-result-price").inner_text() == "от 15 000 ₽"
        assert "до четырёх страниц" in page.locator("#brief-result-description").inner_text().lower()

        page.locator('input[name="brief-task"][value="redesign"]').check()
        assert page.locator("#brief-result-title").inner_text() == "Редизайн и доработка"
        assert page.locator("#brief-result-price").inner_text() == "от 5 000 ₽"
        assert page.locator('input[name="brief-format"]').first.is_disabled()
        assert page_errors == []
    finally:
        context.close()


def test_main_mobile_menu_supports_escape_and_restores_focus(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser, width=390, height=844)
    try:
        page.goto(f"{site_url}/", wait_until="domcontentloaded")
        toggle = page.locator(".menu-toggle")
        menu = page.locator("#mobile-nav")

        toggle.click()
        assert toggle.get_attribute("aria-expanded") == "true"
        assert menu.is_visible()

        page.keyboard.press("Escape")
        assert toggle.get_attribute("aria-expanded") == "false"
        assert not menu.is_visible()
        assert page.evaluate("document.activeElement === document.querySelector('.menu-toggle')")
    finally:
        context.close()


@pytest.mark.parametrize("slug", PROJECT_SLUGS)
def test_demo_pages_render_on_mobile_without_horizontal_overflow(
    browser: Browser,
    site_url: str,
    slug: str,
) -> None:
    context, page = open_local_page(browser, width=390, height=844)
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    try:
        page.goto(f"{site_url}/projects/{slug}/", wait_until="domcontentloaded")
        page.locator("h1").first.wait_for(state="visible")

        assert page.locator("title").count() == 0 or page.title().strip()
        has_horizontal_overflow = page.evaluate(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
        )
        assert not has_horizontal_overflow, f"{slug} overflows a 390px viewport"
        assert page_errors == [], f"{slug} raised browser errors: {page_errors}"
    finally:
        context.close()


def test_noir_menu_filter_and_mobile_keyboard_navigation(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser, width=390, height=844)
    try:
        page.goto(f"{site_url}/projects/noir-coffee/", wait_until="domcontentloaded")
        toggle = page.locator(".mobile-toggle")
        nav = page.locator("#noir-navigation")

        toggle.click()
        assert toggle.get_attribute("aria-expanded") == "true"
        assert nav.is_visible()
        page.keyboard.press("Escape")
        assert toggle.get_attribute("aria-expanded") == "false"
        assert not nav.is_visible()
        assert page.evaluate("document.activeElement === document.querySelector('.mobile-toggle')")

        page.locator('button[data-category="coffee"]').click()
        assert page.locator(".menu-card:visible").count() == 3
        assert page.locator('.menu-card[data-category="special"]:visible').count() == 0
    finally:
        context.close()


def test_vera_skin_product_filter_and_cart_flow(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser)
    try:
        page.goto(f"{site_url}/projects/vera-skin/", wait_until="domcontentloaded")
        assert page.locator(".product").count() == 4

        page.locator(".product .add").first.click()
        assert page.locator("#cartCount").inner_text() == "1"
        page.locator('button[aria-label="Корзина"]').click()
        assert page.locator("#cartPanel").is_visible()
        assert "Увлажняющий крем" in page.locator("#cartItems").inner_text()
        assert "2" in page.locator("#cartTotal").inner_text()

        page.locator(".close-cart").click()
        page.locator('button[data-filter="serum"]').click()
        assert page.locator(".product:visible").count() == 1
        assert page.locator('.product[data-category="serum"]:visible').count() == 1
    finally:
        context.close()


def test_domforma_request_form_validates_and_shows_demo_confirmation(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser)
    try:
        page.goto(f"{site_url}/projects/domforma/", wait_until="domcontentloaded")
        note = page.locator("#form-note")
        initial_note = note.inner_text()

        page.locator('#request-form button[type="submit"]').click()
        assert note.inner_text() == initial_note

        page.locator('input[name="name"]').fill("Тестовый посетитель")
        page.locator('input[name="contact"]').fill("test@example.com")
        page.locator('select[name="service"]').select_option(label="Ремонт под ключ")
        page.locator('textarea[name="message"]').fill("Проверка формы в браузерном тесте")
        page.locator('#request-form button[type="submit"]').click()

        assert "демонстрация интерфейса" in note.inner_text().lower()
        assert "не отправлен" in note.inner_text().lower()
        assert page.locator('input[name="name"]').input_value() == ""
    finally:
        context.close()


def test_smm_profile_renders_on_mobile_and_navigation_works(
    browser: Browser,
    site_url: str,
) -> None:
    context, page = open_local_page(browser, width=390, height=844)
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    try:
        page.goto(f"{site_url}/smm/", wait_until="domcontentloaded")
        page.locator("h1").first.wait_for(state="visible")

        assert "SMM-специалист" in page.title()
        assert "бренду расти" in page.locator("h1").inner_text()
        assert page.locator(".service-card").count() == 3
        assert page.locator(".portfolio-card").count() == 3
        portfolio = page.locator("#portfolio").inner_text()
        assert "Концепт поста для фитнеса" in portfolio
        assert "Карусель для beauty-бренда" in portfolio
        assert "Обложка Reels для GameDev" in portfolio
        assert page.locator("#portfolio .portfolio-image img").count() == 3
        assert page.locator("#portfolio .portfolio-image img[alt]").count() == 3
        assert "Independent Digital Practice" in page.locator("#about").inner_text()
        assert "East West Fitness" in page.locator("#about").inner_text()
        case_text = page.locator("#case").inner_text()
        assert "+20%" in case_text
        assert "5 ч" in case_text
        assert "Демонстрационные KPI" in case_text
        assert "не фактические результаты" in case_text

        has_horizontal_overflow = page.evaluate(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
        )
        assert not has_horizontal_overflow, "SMM page overflows a 390px viewport"

        toggle = page.locator(".menu-toggle")
        menu = page.locator("#mobile-nav")
        toggle.click()
        assert toggle.get_attribute("aria-expanded") == "true"
        assert menu.is_visible()
        menu.locator('a[href="#portfolio"]').click()
        assert toggle.get_attribute("aria-expanded") == "false"
        assert page_errors == []
    finally:
        context.close()
