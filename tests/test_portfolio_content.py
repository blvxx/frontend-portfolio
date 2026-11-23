from __future__ import annotations

import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceCollector(HTMLParser):
    """Collect local href/src references from the main portfolio page."""

    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        name = "src" if tag in {"script", "img"} else "href" if tag in {"a", "link"} else None
        value = attributes.get(name) if name else None
        if value:
            self.references.append(value)


class PortfolioContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.projects = json.loads((ROOT / "projects.json").read_text(encoding="utf-8"))
        cls.index_html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.script = (ROOT / "script.js").read_text(encoding="utf-8")

    def test_project_catalogue_has_unique_ids_and_complete_case_data(self) -> None:
        self.assertEqual(len(self.projects), 5, "The portfolio README advertises five demo projects")
        ids = [project["id"] for project in self.projects]
        self.assertEqual(len(ids), len(set(ids)), "Project IDs must be unique")

        required_fields = (
            "title",
            "description",
            "status",
            "case_goal",
            "case_solution",
            "case_scope",
            "demo_url",
            "url",
        )
        for project in self.projects:
            with self.subTest(project=project.get("title")):
                for field in required_fields:
                    self.assertTrue(project.get(field), f"Missing {field}")
                self.assertTrue(project.get("highlights"), "Each case needs implementation highlights")
                self.assertTrue(project.get("tech"), "Each case needs a technology list")

    def test_every_demo_and_source_link_maps_to_a_local_project(self) -> None:
        for project in self.projects:
            with self.subTest(project=project["title"]):
                demo = urlsplit(project["demo_url"])
                self.assertEqual(demo.netloc, "blvxx.github.io")
                prefix = "/web-development-portfolio/projects/"
                self.assertTrue(demo.path.startswith(prefix), demo.path)
                slug = demo.path[len(prefix):].strip("/")
                self.assertTrue(slug, "Demo URL must identify a project folder")

                source = urlsplit(project["url"])
                expected_source_path = (
                    f"/blvxx/web-development-portfolio/tree/main/projects/{slug}"
                )
                self.assertEqual(source.netloc, "github.com")
                self.assertEqual(source.path, expected_source_path)

                project_dir = ROOT / "projects" / slug
                self.assertTrue(project_dir.is_dir(), f"Missing project folder: {slug}")
                page = project_dir / "index.html"
                self.assertTrue(page.is_file(), f"Missing demo page: {page}")

                html = page.read_text(encoding="utf-8")
                self.assertRegex(html, re.compile(r"<title[^>]*>.+?</title>", re.I | re.S))
                self.assertRegex(html, re.compile(r'name=["']viewport["']', re.I))

                preview = project.get("preview", {})
                self.assertEqual(preview.get("type"), "iframe")
                self.assertEqual(preview.get("src"), project["demo_url"])
                self.assertTrue(preview.get("alt"), "Preview iframe needs an accessible title")

    def test_main_page_exposes_expected_project_ui(self) -> None:
        for selector in ('id="project-filters"', 'id="project-count"', 'id="projects-grid"'):
            with self.subTest(selector=selector):
                self.assertIn(selector, self.index_html)
        self.assertIn('id="main"', self.index_html)
        self.assertIn('class="menu-toggle"', self.index_html)
        self.assertIn('class="mobile-nav"', self.index_html)

    def test_local_assets_referenced_by_main_page_exist(self) -> None:
        collector = LocalReferenceCollector()
        collector.feed(self.index_html)

        missing: list[str] = []
        for reference in collector.references:
            parsed = urlsplit(reference)
            if parsed.scheme or parsed.netloc or reference.startswith("#"):
                continue
            path = unquote(parsed.path)
            if not path:
                continue
            target = (ROOT / path.lstrip("/")).resolve()
            if not target.is_file():
                missing.append(reference)

        self.assertEqual(missing, [], f"Broken local references in index.html: {missing}")

    def test_live_project_previews_are_sandboxed_and_links_are_safe(self) -> None:
        self.assertIn("setAttribute('sandbox','allow-scripts allow-forms')", self.script)
        self.assertIn("rel = 'noopener noreferrer'", self.script)
        self.assertIn("frame.title = preview.alt", self.script)
        self.assertIn("frame.loading = 'lazy'", self.script)
        self.assertIn("frame.referrerPolicy = 'no-referrer'", self.script)


if __name__ == "__main__":
    unittest.main()
