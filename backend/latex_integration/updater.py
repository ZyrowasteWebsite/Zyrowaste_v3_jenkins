"""LaTeX financial table updates and appendix snippets."""

import re
from pathlib import Path


def _project_root() -> Path:
    """Backend root; data/reports/ lives here in the new layout."""
    return Path(__file__).resolve().parents[1]


def default_financials_tex_path() -> Path:
    """Default path to Chapter 5 financials.

    New layout:  backend/data/reports/SwaroopFormulations_V0/Chapter5/Financials.tex
    Legacy path: <repo-root>/SwaroopFormulations_V0/Chapter5/Financials.tex
    """
    backend = _project_root()
    new = backend / "data" / "reports" / "SwaroopFormulations_V0" / "Chapter5" / "Financials.tex"
    legacy = backend.parent / "SwaroopFormulations_V0" / "Chapter5" / "Financials.tex"
    return new if new.is_file() else legacy


def _row_pattern(metric: str) -> re.Pattern[str]:
    escaped = re.escape(metric)
    return re.compile(rf"^{escaped}\s+&.*\\\\\s*$", re.MULTILINE)


def _format_row(metric: str, year_1: str, year_3: str, year_5: str, average: str) -> str:
    return f"{metric:<17} & {year_1} & {year_3} & {year_5} & {average} \\\\"


def update_financial_tables(data: dict, tex_path: str) -> None:
    """
    Replace known metric rows in a ``Financials.tex`` chapter file with values from ``data``.

    Typical path: ``SwaroopFormulations_V0/Chapter5/Financials.tex`` (see ``default_financials_tex_path()``).

    ``data`` maps metric names (e.g. ``Sales``, ``EBITDA``, ``Net Profit``, ``DSCR``, ``ROI (Est.)``)
    to dicts with keys ``year_1``, ``year_3``, ``year_5``, ``average`` (string cell values, may include
    LaTeX like ``\\textasciitilde10.5``).

    Reads and writes ``tex_path`` as UTF-8 (e.g. values synced from PostgreSQL or an in-memory dict).
    """
    path = Path(tex_path)
    content = path.read_text(encoding="utf-8")
    for metric, cols in data.items():
        if not isinstance(cols, dict):
            continue
        y1 = str(cols.get("year_1", ""))
        y3 = str(cols.get("year_3", ""))
        y5 = str(cols.get("year_5", ""))
        avg = str(cols.get("average", ""))
        new_line = _format_row(str(metric), y1, y3, y5, avg)
        pat = _row_pattern(str(metric))
        if not pat.search(content):
            continue
        content = pat.sub(new_line, content, count=1)
    path.write_text(content, encoding="utf-8", newline="\n")


def generate_appendix(title: str, content: str) -> str:
    """Return a LaTeX appendix section fragment (not a full document)."""
    safe_title = title.strip()
    body = content.strip()
    return (
        f"\\section{{{safe_title}}}\n"
        f"\\begin{{quote}}\n{body}\n\\end{{quote}}\n"
    )

