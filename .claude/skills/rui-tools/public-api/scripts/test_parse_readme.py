"""Unit tests for scripts/parse_readme.py.

Run with:
    python3 -m unittest scripts/test_parse_readme.py

Or directly:
    python3 scripts/test_parse_readme.py
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

# Make the script importable when this file lives alongside it in scripts/.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import parse_readme  # noqa: E402


SAMPLE_README = """\
## Index

(skip me)

### Animals

(skip)

| API | Description | Auth | HTTPS | CORS |
| --- | --- | --- | --- | --- |
| [Cat Facts](https://catfact.ninja) | Random cat facts | No | Yes | Yes |
| [Dog API](https://dog.ceo) | Dog pictures | `apiKey` | Yes | Yes |

### Weather

| API | Description | Auth | HTTPS | CORS |
| --- | --- | --- | --- | --- |
| [Open-Meteo](https://open-meteo.com) | Weather forecast | No | Yes | Yes |
| [OpenWeather](https://openweathermap.org) | Weather data | `apiKey` | Yes | No |

### 🥇 Gold Sponsors

(sponsor section should be filtered out)

| brand | link |
| --- | --- |
| Acme | https://acme.com |

### Geocoding

(blank-line tolerant)

| API | Description | Auth | HTTPS | CORS |
| --- | --- | --- | --- |
| [Nominatim](https://nominatim.org) | OSM geocoder | No | Yes | Yes |

| [ZipCodeAPI](https://www.zipcodeapi.com) | US zip codes | `apiKey` | Yes | Yes |
| [Zippopotam](https://www.zippopotam.us) | World zip codes | No | Yes | Yes |
| [Ziptastic](https://ziptastic.org) | Country/state lookup | No | Yes | Yes |
"""


SAMPLE_SOURCES = {
    "sources": [
        {
            "id": "public-api-lists",
            "label": "Public API Lists",
            "upstream_url": "https://example.com/README.md",
            "homepage": "https://example.com",
            "dialect": "public-api-table",
        }
    ]
}


class ParseMarkdownTests(unittest.TestCase):
    def test_extracts_real_categories(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        names = [c["name"] for c in cats]
        self.assertEqual(
            names,
            ["Animals", "Weather", "Geocoding"],
            "Sponsor h3 should be filtered out",
        )

    def test_resources_have_all_fields(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        animals = next(c for c in cats if c["name"] == "Animals")
        self.assertEqual(len(animals["resources"]), 2)
        r = animals["resources"][0]
        for k in ("title", "url", "description", "auth", "https", "cors"):
            self.assertIn(k, r, f"missing field: {k}")
        self.assertEqual(r["title"], "Cat Facts")
        self.assertEqual(r["url"], "https://catfact.ninja")
        self.assertEqual(r["auth"], "No")

    def test_preserves_backtick_auth(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        dog = next(
            r for c in cats if c["name"] == "Animals"
            for r in c["resources"] if r["title"] == "Dog API"
        )
        # The README has `` `apiKey` `` (backtick-wrapped); preserve as-is.
        self.assertEqual(dog["auth"], "`apiKey`")

    def test_blank_line_tolerance(self) -> None:
        """Upstream README has a blank line between body rows near the end
        of the Geocoding table (lines 651-655 of public-api-lists). The
        parser must not split the table on that blank line.
        """
        md_blank = """\
### Geocoding

| API | Description | Auth | HTTPS | CORS |
| --- | --- | --- | --- | --- |
| [Nominatim](https://nominatim.org) | OSM geocoder | No | Yes | Yes |

| [ZipCodeAPI](https://www.zipcodeapi.com) | US zip codes | `apiKey` | Yes | Yes |
| [Zippopotam](https://www.zippopotam.us) | World zip codes | No | Yes | Yes |
"""
        cats = parse_readme.parse_markdown(md_blank)
        geocoding = next(c for c in cats if c["name"] == "Geocoding")
        titles = [r["title"] for r in geocoding["resources"]]
        self.assertIn("Nominatim", titles)
        self.assertIn("ZipCodeAPI", titles)
        self.assertEqual(len(geocoding["resources"]), 3)

    def test_drops_sponsor_h3(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        names = [c["name"] for c in cats]
        for n in names:
            self.assertNotIn("sponsor", n.lower(), f"sponsor category leaked: {n}")
        self.assertNotIn("Gold Sponsors", names)

    def test_drops_categories_with_no_table(self) -> None:
        md = "### Empty\n\n(no table follows)\n"
        cats = parse_readme.parse_markdown(md)
        self.assertEqual(cats, [])


class BuildIndexTests(unittest.TestCase):
    def test_schema_and_meta(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        idx = parse_readme.build_index(cats, SAMPLE_SOURCES["sources"], "local")
        self.assertEqual(idx["schema"], "public-api-index-v2")
        self.assertEqual(idx["generated_from"], "local")
        self.assertIn("generated_at", idx)
        self.assertEqual(idx["sources"], SAMPLE_SOURCES["sources"])
        self.assertEqual(len(idx["categories"]), 3)

    def test_no_per_resource_source_or_category(self) -> None:
        """v2 schema drops the redundant category/topic/source fields."""
        cats = parse_readme.parse_markdown(SAMPLE_README)
        idx = parse_readme.build_index(cats, SAMPLE_SOURCES["sources"], "local")
        for cat in idx["categories"]:
            for r in cat["resources"]:
                self.assertNotIn("source", r)
                self.assertNotIn("category", r)
                self.assertNotIn("topic", r)


class RenderMarkdownTests(unittest.TestCase):
    def test_includes_summary_table(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        md = parse_readme.render_markdown(
            cats, SAMPLE_SOURCES["sources"], "local"
        )
        self.assertIn("| Category | Topics | Resources |", md)
        self.assertIn("Animals", md)
        self.assertIn("Weather", md)
        self.assertIn("**Total**", md)

    def test_includes_resource_rows(self) -> None:
        cats = parse_readme.parse_markdown(SAMPLE_README)
        md = parse_readme.render_markdown(
            cats, SAMPLE_SOURCES["sources"], "local"
        )
        self.assertIn("[Cat Facts](https://catfact.ninja)", md)
        self.assertIn("[src:public-api-lists]", md)


class CliRoundTripTests(unittest.TestCase):
    def test_end_to_end(self) -> None:
        """Write a sample README + sources, invoke main(), and check the
        emitted files parse and contain the expected categories."""
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            readme = tmp_path / "README.md"
            readme.write_text(SAMPLE_README, encoding="utf-8")
            sources = tmp_path / "sources.json"
            sources.write_text(json.dumps(SAMPLE_SOURCES), encoding="utf-8")
            out_json = tmp_path / "index.json"
            out_md = tmp_path / "index.md"

            rc = parse_readme.main([
                "--readme", str(readme),
                "--sources", str(sources),
                "--out-json", str(out_json),
                "--out-md", str(out_md),
            ])
            self.assertEqual(rc, 0)
            self.assertTrue(out_json.exists())
            self.assertTrue(out_md.exists())

            data = json.loads(out_json.read_text(encoding="utf-8"))
            self.assertEqual(data["schema"], "public-api-index-v2")
            cat_names = {c["name"] for c in data["categories"]}
            self.assertEqual(
                cat_names, {"Animals", "Weather", "Geocoding"}
            )
            self.assertIn("Cat Facts", [
                r["title"]
                for c in data["categories"] for r in c["resources"]
            ])
            self.assertIn("ZipCodeAPI", [
                r["title"]
                for c in data["categories"] for r in c["resources"]
            ])

    def test_missing_readme_returns_error(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            sources = tmp_path / "sources.json"
            sources.write_text(json.dumps(SAMPLE_SOURCES), encoding="utf-8")
            rc = parse_readme.main([
                "--readme", str(tmp_path / "missing.md"),
                "--sources", str(sources),
                "--out-json", str(tmp_path / "out.json"),
                "--out-md", str(tmp_path / "out.md"),
            ])
            self.assertEqual(rc, 1)

    def test_empty_readme_returns_error(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            readme = tmp_path / "README.md"
            readme.write_text("# nothing relevant here\n", encoding="utf-8")
            sources = tmp_path / "sources.json"
            sources.write_text(json.dumps(SAMPLE_SOURCES), encoding="utf-8")
            rc = parse_readme.main([
                "--readme", str(readme),
                "--sources", str(sources),
                "--out-json", str(tmp_path / "out.json"),
                "--out-md", str(tmp_path / "out.md"),
            ])
            self.assertEqual(rc, 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
