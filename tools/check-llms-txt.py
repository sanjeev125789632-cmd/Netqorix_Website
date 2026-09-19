#!/usr/bin/env python3
"""Check llms.txt against the pages it describes.

llms.txt restates prices and facts that live on the HTML pages, so it drifts
silently whenever a rate changes. This re-derives every claim from the pages
and fails loudly when the two disagree.

Nothing here is hardcoded to a particular price or page: the checks are driven
by what llms.txt itself says, so adding a service or a link needs no change to
this script.

Checks:
  1. every link resolves to a real page
  2. every link equals that page's own canonical URL
  3. every link appears in sitemap.xml
  4. every indexable page in sitemap.xml is linked from llms.txt
  5. every rupee range in a link's description appears on that page, as a pair
  6. every standalone rupee amount in a link's description appears on that page
  7. every percentage in a link's description appears on that page
  8. the contact and pricing facts in the header appear somewhere on the site

Known limit: a standalone amount is only checked for presence somewhere on the
page. If the same figure appears in more than one place there and only one of
them is edited, that edit will not be caught. Ranges do not have this weakness
because both ends are matched together. Percentages and the header facts are
presence checks too, and carry the same caveat.

Usage:
    python3 tools/check-llms-txt.py            # from the repository root
    python3 tools/check-llms-txt.py --verbose  # also list what passed

Exit status is 0 when everything agrees and 1 when it does not.
"""

from __future__ import annotations

import argparse
import html
import os
import re
import sys
import xml.etree.ElementTree as ET

BASE = "https://www.netqorix.com/"
SITEMAP_NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# A markdown bullet: "- [Label](url): description"
LINK_LINE = re.compile(r"^-\s*\[([^\]]+)\]\((" + re.escape(BASE) + r"[^)]*)\)\s*:?\s*(.*)$")
AMOUNT = r"₹\d+(?:,\d+)*"
# "₹8,000–₹20,000" as one unit. Checked as a pair because a lone amount often
# recurs on a page, so a bare presence test would miss an edited range.
RUPEE_RANGE = re.compile(AMOUNT + r"\s*[–—-]\s*" + AMOUNT)
RUPEES = re.compile(AMOUNT)
# 15–20%, 25 – 40%, 20%
PERCENT = re.compile(r"\d+(?:\s*[–—-]\s*\d+)?\s*%")

DASHES = str.maketrans({"–": "-", "—": "-", "−": "-"})


def normalise(text: str) -> str:
    """Collapse the differences that are formatting, not meaning.

    The pages write "15 – 20% / yr" where llms.txt writes "15–20%"; both mean
    the same thing, so whitespace goes and every dash becomes a hyphen.
    """
    return re.sub(r"\s+", "", html.unescape(text).translate(DASHES))


def page_text(slug: str) -> str:
    """Raw source of a page, with entities resolved.

    Deliberately not tag-stripped: a figure is just as real in an attribute
    (a title, a meta description) as it is in body copy.
    """
    with open(f"{slug}.html", encoding="utf-8") as fh:
        return html.unescape(fh.read())


def slug_for(url: str) -> str:
    return url[len(BASE):].strip("/") or "index"


def canonical_of(slug: str) -> str | None:
    m = re.search(r'<link rel="canonical" href="([^"]+)"', page_text(slug))
    return m.group(1) if m else None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="also print the checks that passed")
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    for required in ("llms.txt", "sitemap.xml"):
        if not os.path.exists(required):
            print(f"FAIL  {required} not found (run from the repository root)")
            return 1

    with open("llms.txt", encoding="utf-8") as fh:
        lines = fh.read().splitlines()

    sitemap = {u.text for u in ET.parse("sitemap.xml").findall(".//s:loc", SITEMAP_NS)}

    failures: list[str] = []
    passes: list[str] = []
    linked: set[str] = set()

    # ---- per-link checks -------------------------------------------------
    for lineno, line in enumerate(lines, 1):
        m = LINK_LINE.match(line.strip())
        if not m:
            continue
        label, url, description = m.group(1), m.group(2), m.group(3)
        slug = slug_for(url)
        where = f"llms.txt:{lineno} [{label}]"

        if not os.path.exists(f"{slug}.html"):
            failures.append(f"{where}: links to {url}, but {slug}.html does not exist")
            continue

        linked.add(url)

        canonical = canonical_of(slug)
        if canonical is None:
            failures.append(f"{where}: {slug}.html has no canonical link")
        elif canonical != url:
            failures.append(f"{where}: link is {url} but the page's canonical is {canonical}")
        else:
            passes.append(f"{where}: canonical matches")

        if url not in sitemap:
            failures.append(f"{where}: {url} is not listed in sitemap.xml")

        source = normalise(page_text(slug))

        # Ranges first, as a pair, then any amount not already covered by one.
        ranges = RUPEE_RANGE.findall(description)
        for rng in ranges:
            if normalise(rng) in source:
                passes.append(f"{where}: range {rng} found on {slug}.html")
            else:
                failures.append(f"{where}: quotes the range {rng}, "
                                f"which is not on {slug}.html")

        covered = "".join(ranges)
        for amount in RUPEES.findall(RUPEE_RANGE.sub("", description)):
            if amount in covered:
                continue
            if normalise(amount) in source:
                passes.append(f"{where}: {amount} found on {slug}.html")
            else:
                failures.append(f"{where}: quotes {amount}, which is not on {slug}.html")

        for pct in PERCENT.findall(description):
            if normalise(pct) in source:
                passes.append(f"{where}: {pct.strip()} found on {slug}.html")
            else:
                failures.append(f"{where}: quotes {pct.strip()}, which is not on {slug}.html")

    # ---- coverage: every indexable page should be described --------------
    # The homepage is represented by the file's own heading and summary, so it
    # is not expected to appear as a link.
    for url in sorted(sitemap - linked - {BASE}):
        failures.append(f"llms.txt: {url} is in sitemap.xml but is not linked from llms.txt")

    # ---- header facts ----------------------------------------------------
    # Everything above the first "## " heading describes the business itself,
    # so it is checked against the whole site rather than one page.
    header = "\n".join(lines[:next((i for i, l in enumerate(lines) if l.startswith("## ")), len(lines))])
    whole_site = normalise("".join(
        page_text(slug_for(u)) for u in sorted(sitemap)
    ))

    header_claims = RUPEES.findall(header) + [
        m for m in re.findall(r"[\w.+-]+@[\w-]+\.[\w.]+", header)
    ] + re.findall(r"\+91[\d\s]{8,}", header)

    for claim in header_claims:
        if normalise(claim) in whole_site:
            passes.append(f"llms.txt header: {claim.strip()} found on the site")
        else:
            failures.append(f"llms.txt header: states {claim.strip()}, which appears on no page")

    # ---- report ----------------------------------------------------------
    if args.verbose:
        for line in passes:
            print(f"ok    {line}")
        print()

    if failures:
        for line in failures:
            print(f"FAIL  {line}")
        print(f"\n{len(failures)} problem(s); {len(passes)} check(s) passed.")
        print("llms.txt disagrees with the pages. The pages are the source of truth.")
        return 1

    print(f"llms.txt agrees with the pages: {len(passes)} checks passed, "
          f"{len(linked)} links verified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
