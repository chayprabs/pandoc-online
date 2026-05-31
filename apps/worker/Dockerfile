FROM python:3.12-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    JOB_ROOT=/tmp/pandoc-jobs \
  PANDOC_BIN=pandoc

RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    texlive-xetex \
    texlive-luatex \
    texlive-latex-base \
    texlive-latex-recommended \
    wkhtmltopdf \
    curl \
    ca-certificates \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Typst (optional fast PDF engine)
RUN curl -fsSL https://github.com/typst/typst/releases/download/v0.13.1/typst-x86_64-unknown-linux-musl.tar.xz -o /tmp/typst.tar.xz \
    && tar -xJf /tmp/typst.tar.xz -C /tmp \
    && mv /tmp/typst-x86_64-unknown-linux-musl/typst /usr/local/bin/typst \
    && rm -rf /tmp/typst*

# Pre-warm minimal TeX cache
RUN mkdir -p /root/.cache/texlive && echo '\\documentclass{article}\\begin{document}Hi\\end{document}' > /tmp/warm.tex \
    && xelatex -interaction=nonstopmode -output-directory=/tmp /tmp/warm.tex || true

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://127.0.0.1:8080/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
