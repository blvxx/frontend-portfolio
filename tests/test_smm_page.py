from __future__ import annotations

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "smm" / "index.html"


class PageInspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.anchor_hrefs: list[str] = []
        self.links_with_target: list[tuple[str, str]] = []
        self.has_viewport = False
        self.html_lang = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.add(element_id)
        if tag == "a" and values.get("href"):
            self.anchor_hrefs.append(values["href"] or "")
            if values.get("target"):
                self.links_with_target.append((values["target"] or "", values.get("rel") or ""))
        if tag == "meta" and values.get("name") == "viewport":
            self.has_viewport = True
        if tag == "html":
            self.html_lang = values.get("lang") or ""


class SmmPortfolioPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = PAGE.read_text(encoding="utf-8")
        cls.inspector = PageInspector()
        cls.inspector.feed(cls.html)

    def test_page_has_basic_document_metadata(self) -> None:
        self.assertRegex(self.html, re.compile(r"<title>.+?</title>", re.I | re.S))
        self.assertIn("SMM-специалист", self.html)
        self.assertEqual(self.inspector.html_lang, "ru")
        self.assertTrue(self.inspector.has_viewport)
        self.assertIn('property="og:url"', self.html)
        self.assertIn("https://blvxx.github.io/web-development-portfolio/smm/", self.html)
        self.assertIn("@tailwindcss/browser@4", self.html)

    def test_visual_showcase_has_three_concept_cards(self) -> None:
        for label in ("Пример поста", "Макет карусели", "Обложка для Reels"):
            with self.subTest(label=label):
                self.assertIn(label, self.html)
        self.assertEqual(self.html.count('class="portfolio-card'), 3)
        self.assertIn("Демонстрационный концепт", self.html)
        self.assertIn("не реальные опубликованные материалы клиентов", self.html)

    def test_resume_experience_and_tools_match_pdf(self) -> None:
        for term in (
            "Independent Digital Practice",
            "East West Fitness",
            "Апрель 2026",
            "Декабрь 2022 — ноябрь 2024",
            "2 года 8 месяцев",
            "GameDev",
            "Яндекс Карты",
            "Python",
            "Google Sheets",
            "ChatGPT",
            "Claude",
            "Midjourney",
            "DALL·E",
            "Adobe Photoshop",
            "WordPress",
            "Telegram",
            "TikTok",
            "YouTube",
            "МГКИТ",
        ):
            with self.subTest(term=term):
                self.assertIn(term, self.html)
        self.assertNotIn("Delivery Club", self.html)

    def test_case_uses_only_supported_facts_and_no_fake_kpis(self) -> None:
        self.assertIn("2 года", self.html)
        self.assertIn("2 канала", self.html)
        self.assertIn("автоматизация выгрузки показателей", self.html)
        self.assertIn("В резюме не указаны подтверждённые проценты роста переходов или часы сэкономленного времени", self.html)
        self.assertNotIn("20%", self.html)
        self.assertNotIn("5 часов", self.html)

    def test_resume_contacts_are_present(self) -> None:
        for term in ("blvxx@inbox.ru", "+7 (916) 198-41-21", "https://t.me/blvlxx", "https://set.ki/account/LmXrzmU"):
            with self.subTest(term=term):
                self.assertIn(term, self.html)

    def test_internal_anchor_links_resolve(self) -> None:
        broken = [
            href for href in self.inspector.anchor_hrefs
            if href.startswith("#") and href[1:] not in self.inspector.ids
        ]
        self.assertEqual(broken, [], f"Broken in-page navigation anchors: {broken}")

    def test_external_new_tab_links_are_protected(self) -> None:
        unsafe = [
            (target, rel)
            for target, rel in self.inspector.links_with_target
            if target == "_blank" and not {"noopener", "noreferrer"}.issubset(set(rel.split()))
        ]
        self.assertEqual(unsafe, [], f"Unsafe target=_blank links: {unsafe}")

    def test_page_has_responsive_and_accessible_navigation(self) -> None:
        self.assertIn('class="skip-link"', self.html)
        self.assertIn('aria-label="Открыть меню"', self.html)
        self.assertIn('aria-controls="mobile-nav"', self.html)
        self.assertIn("@media (max-width: 700px)", self.html)
        self.assertIn("prefers-reduced-motion", self.html)


if __name__ == "__main__":
    unittest.main()
