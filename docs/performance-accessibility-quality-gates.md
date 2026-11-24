# Web portfolio — performance, responsive and accessibility quality gates

This checklist describes the automated baseline enforced by the portfolio browser tests. It is a technical self-review of the demo pages, not a claim of a third-party Lighthouse certification or commercial SEO result.

## Automated baseline

The Playwright regression suite covers these public demo entry points:

- Main web portfolio.
- ДОМФОРМА service-site concept.
- VÉRA SKIN e-commerce UI concept.
- SMM/content portfolio page.
- Yandex Business local SEO clinic case-study page.

For each entry point, the quality matrix tests viewport widths of **320, 375, 768 and 1440 CSS pixels**. It verifies:

- Non-empty document title and meta description.
- Responsive viewport metadata.
- Exactly one primary h1 and one main landmark.
- Every image has a non-empty alt attribute.
- No horizontal document overflow at the tested width.

The existing browser suite also exercises selected navigation, forms, product filtering/cart behavior, brief calculator interactions, reduced-motion behavior and JavaScript runtime errors.

## Run the checks locally

From the repository root:

~~~bash
python -m pip install -r requirements-test.txt
python -m playwright install chromium
~~~

Run the complete browser suite:

~~~bash
pytest -q tests/test_browser_regression.py
~~~

Run the portfolio content and SMM checks:

~~~bash
python -m unittest discover -s tests -p 'test_portfolio_content.py' -v
python -m unittest discover -s tests -p 'test_smm_page.py' -v
~~~

## Manual Lighthouse review

For a separate page-level performance review, start the static site:

~~~bash
python -m http.server 8000
~~~

Then run Lighthouse against the local pages using Chrome DevTools or the Lighthouse CLI. Review Performance, Accessibility, Best Practices and SEO separately on both desktop and mobile emulation. Record the date, browser version, URL, device profile and raw report before quoting any score.

**No Lighthouse score is published here yet.** Automated responsive/semantic tests above are verified in GitHub Actions; Lighthouse scoring remains a manual follow-up and must not be described as an achieved score until the reports exist.

## Limitations

- External fonts and remote stock images may be blocked in local regression tests; these checks focus on the authored HTML/CSS/JS behavior.
- Alt text presence is checked; semantic quality of the description still needs human review.
- Browser automation does not replace testing on real mobile devices or assistive technologies.
- A passing quality workflow covers only the listed pages, viewports and assertions.
