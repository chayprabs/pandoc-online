from typing import Literal

from pydantic import BaseModel, Field


class ConvertSource(BaseModel):
    format: str
    content: str


class ConvertTarget(BaseModel):
    format: str
    engine: str | None = None


class CitationOptions(BaseModel):
    bib: str
    csl_style: str = Field(alias="cslStyle")

    model_config = {"populate_by_name": True}


class ConvertOptions(BaseModel):
    template: str | None = None
    reference_doc: str | None = Field(default=None, alias="referenceDoc")
    citations: CitationOptions | None = None
    math: Literal["katex", "mathjax", "mathml", "plain"] | None = None
    pdf_engine: Literal["xelatex", "lualatex", "pdflatex", "wkhtmltopdf", "typst"] | None = Field(
        default="xelatex", alias="pdfEngine"
    )
    filters: list[str] | None = None
    toc: bool = False
    number_sections: bool = Field(default=False, alias="numberSections")

    model_config = {"populate_by_name": True}


class ConvertAsset(BaseModel):
    name: str
    content_base64: str = Field(alias="contentBase64")

    model_config = {"populate_by_name": True}


class ConvertJob(BaseModel):
    source: ConvertSource
    target: ConvertTarget
    options: ConvertOptions | None = None
    assets: list[ConvertAsset] | None = None


class ConvertResult(BaseModel):
    artifact_url: str = Field(alias="artifactUrl")
    log_url: str = Field(alias="logUrl")
    assets_zip_url: str | None = Field(default=None, alias="assetsZipUrl")
    job_id: str = Field(alias="jobId")
    command: str
    artifact_name: str = Field(alias="artifactName")
    warnings: list[str] = []

    model_config = {"populate_by_name": True, "serialize_by_alias": True}


class InspectJob(BaseModel):
    source: ConvertSource


class InspectResult(BaseModel):
    format: str
    title: str | None = None
    headings: list[dict]
    assets: list[str]
