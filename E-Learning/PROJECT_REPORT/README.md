Project report template and supporting files

Files:
- main.tex : LaTeX template containing all required sections. Replace placeholders with your content.
- sql_queries.sql : Example SQL queries used in the project — add your full queries here.
- images/ : Put ERD (`erd.png`), schema (`schema.png`) and screenshots here.

Compile (recommended):

Using pdflatex/xelatex (run twice to resolve references):

```bash
cd "e:/My all Project/DatabaseHub/E-Learning/PROJECT_REPORT"
pdflatex main.tex
pdflatex main.tex
```

Or using latexmk (recommended):

```bash
latexmk -pdf main.tex
```

Notes:
- Fill the Title Page placeholders, update video and GitHub links.
- Place ERD and schema images under `images/` and update filenames in `main.tex` if necessary.
- If you prefer an MS Word template, tell me and I will create a DOCX template with the same sections.
