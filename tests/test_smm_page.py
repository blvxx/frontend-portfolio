from __future__ import annotations

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


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
        self.title_text = False

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
        self.assertEqual(self.inspector.html_lang, "ru")
        self.assertTrue(self.inspector.has_viewport)
        self.assertIn('property="og:url"', self.html)
        self.assertIn("https://blvxx.github.io/web-development-portfolio/smm/", self.html)

    def test_all_three_experience_entries_are_present(self) -> None:
        for term in (
            "Independent Digital Practice",
            "Delivery Club",
            "East West Fitness",
            "Апрель 2026",
            "Сентябрь 2024",
            "Декабрь 2022",
            "ChatGPT",
            "Claude",
            "Midjourney",
            "DALL·E",
            "Google Sheets",
            "Python",
            "Яндекс Картах",
        ):
            with self.subTest(term=term):
                self.assertIn(term, self.html)

    def test_east_west_case_discloses_reconstruction_and_missing_metrics(self) -> None:
        self.assertIn("О реконструкции кейса", self.html)
        self.assertIn("Оригинальные исходники, публикации и архив статистики не сохранились", self.html)
        self.assertIn("Количественные результаты не заявляются", self.html)
        self.assertIn("демонстрационной контент-матрицы", self.html)

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
        self.assertIn('class="skip"', self.html)
        self.assertIn('aria-label="Открыть меню"', self.html)
        self.assertIn('aria-controls="mobile-menu"', self.html)
        self.assertIn("@media(max-width:700px)", self.html)
        self.assertIn("prefers-reduced-motion", self.html)


if __name__ == "__main__":
    unittest.main()
