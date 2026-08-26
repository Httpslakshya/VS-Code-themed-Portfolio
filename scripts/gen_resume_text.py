"""One-shot generator: public/resume.pdf -> src/data/resumeText.ts.

Run from the repo root after editing the resume:
    python -X utf8 scripts/gen_resume_text.py
"""
import json

from pypdf import PdfReader

r = PdfReader("public/resume.pdf")
text = "\n".join((p.extract_text() or "") for p in r.pages)
clean = "\n".join(line.rstrip() for line in text.split("\n"))

header = """/**
 * resumeText.ts — plain-text extraction of public/resume.pdf.
 *
 * Generated once at build time (pypdf) so COSMO's knowledge layer can
 * retrieve resume facts without shipping a PDF parser to the browser.
 * If the resume changes, regenerate with: python -X utf8 scripts/gen_resume_text.py
 */

export const RESUME_TEXT = """

with open("src/data/resumeText.ts", "w", encoding="utf-8") as f:
    f.write(header + json.dumps(clean) + ";\n")

print("written", len(clean), "chars")
