---
title: "Multimodal RAG: Image+Text Retrieval, Cross-Modal Embeddings, and Multi-Modal Evaluation"
aliases:
  - multimodal RAG
  - multimodal retrieval
  - cross-modal embeddings
  - image-text retrieval
  - multi-modal RAG
  - visual RAG
tags:
  - AI
  - methodology
  - RAG
  - multimodal
  - retrieval
  - embeddings
  - vision
category: ai-engineer/methodology
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Build RAG systems that retrieve and reason over images, charts, and documents -- not just text -- for applications like visual Q&A, document understanding, and product search"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - rag-design-patterns.md
  - llm-evaluation-methods.md
  - ../platform/multimodal-model-services.md
  - ../platform/embedding-model-selection.md
  - ../platform/vector-db-comparison.md
  - ../foundations/multimodal-fusion.md
tacit: false
---

# Multimodal RAG

> **As an** AI engineer, **I want to** implement multimodal RAG patterns, **so that** my application can retrieve and reason over images, charts, and documents alongside text, providing richer and more accurate responses.

> Multimodal RAG extends text-only RAG to handle images, charts, tables, and diagrams -- the key challenge is aligning embeddings across modalities so that text queries can retrieve relevant images and vice versa.

## Summary

- Multimodal RAG extends standard RAG to retrieve and generate across multiple modalities: text + images, text + charts, text + document layouts, and text + tables.
- Three main architectural patterns: (1) text-only retrieval with multimodal generation (retrieve text, feed text + images to a VLM), (2) multimodal retrieval with cross-modal embeddings (embed both text and images in a shared space), and (3) hybrid retrieval (separate text and image indexes, fuse results).
- Cross-modal embeddings (CLIP, SigLIP, ImageBind) are the key enabler: they map text and images to the same vector space, so a text query can retrieve relevant images and an image query can retrieve relevant text.
- Image preprocessing for RAG is critical: images must be chunked, captioned, and embedded with metadata (page number, section, figure caption) to enable effective retrieval.
- Multimodal RAG evaluation is more complex than text-only RAG: it requires evaluating both text relevance and image relevance, often using multimodal LLM judges.

## Core viewpoints

### 1. The simplest multimodal RAG is often the best: text-only retrieval + VLM generation

For many applications (document Q&A, report generation), the most practical approach is to retrieve text chunks that reference images, then feed both the text and the referenced images to a Vision-Language Model (VLM) for generation. This avoids the complexity of cross-modal embeddings and dual indexes. The text chunk should include: the image reference (e.g., `[image: fig_3.png]`), the image caption, and any extracted text from the image (OCR). The VLM receives the text context and the actual image file, and generates a response that integrates both.

### 2. Cross-modal embeddings are essential for "find images like this" and "find text about this image"

When the use case requires finding images based on visual similarity to a query image, or finding text that visually describes a given image, cross-modal embeddings are required. CLIP (Contrastive Language-Image Pre-training) and its variants (SigLIP, EVA-CLIP) are the standard: they are trained on image-text pairs with a contrastive loss that pulls matching pairs together and pushes non-matching pairs apart. The key limitation: CLIP is trained on natural images, so it underperforms on charts, diagrams, and screenshots. For document-specific use cases, use ColPali or DocOwl, which are trained on document images.

### 3. Image chunking and preprocessing is the most underappreciated challenge in multimodal RAG

Text chunking is a well-understood problem. Image chunking for multimodal RAG is not. Strategies: (a) per-page chunking (each page of a PDF is one image chunk), (b) figure/table detection (use layout detection models to extract individual figures and tables), (c) sliding window (overlap image crops for dense visual search), (d) hierarchical (full page + extracted figures). Each image chunk must be stored with: the image file, a generated caption, extracted OCR text, metadata (page number, document source, section heading), and the embedding vector. The caption is critical for retrieval quality -- a CLIP embedding of a chart without a caption is nearly useless.

### 4. Multimodal RAG evaluation requires multimodal judges

Text-only RAG evaluation (RAGAS, TruLens) cannot evaluate whether the retrieved images are relevant or whether the generated response correctly integrates visual information. Multimodal RAG evaluation requires: (a) a multimodal LLM judge (GPT-4V, Claude Vision) that can assess both text and image relevance, (b) human evaluation for the gold standard, and (c) task-specific metrics (e.g., "did the answer correctly reference Figure 3?"). The evaluation dataset must include image-text pairs with ground-truth annotations for both retrieval and generation quality.

## Key info

### Multimodal RAG architecture patterns

| Pattern | Retrieval | Generation | Complexity | Best for |
|---|---|---|---|---|
| Text-only retrieval + VLM gen | Text chunks + image references | VLM with text + images | Low | Document Q&A, reports |
| Cross-modal embeddings | Unified (text + image embeddings) | VLM with retrieved images + text | Medium | Visual search, image-focused Q&A |
| Dual index + fusion | Separate text and image indexes, RRF fusion | VLM with fused results | Medium | Mixed text/image content |
| Full multimodal pipeline | Image captioning + embedding + text embedding + fusion | VLM with full context | High | Complex document understanding |

### Image preprocessing pipeline

```
Raw Document (PDF, web page, presentation)
    |
    v
Layout Detection (LayoutLM, DocTR, unstructured.io)
    |
    +--> Extract text blocks (paragraphs, headings)
    +--> Extract figures and tables (bounding boxes)
    +--> Extract charts (with axis labels, legends)
    |
    v
For each figure/chart:
    1. Crop the image from the page
    2. Generate a caption (BLIP-2, LLaVA, or VLM API)
    3. Extract OCR text (Tesseract, PaddleOCR, or VLM)
    4. Create metadata: {page, section, figure_number, caption, ocr_text}
    5. Embed the image + caption (CLIP/SigLIP) or caption only
    6. Store in vector DB with metadata
```

### Cross-modal embedding models

| Model | Modalities | Embedding dim | Training data | Strengths | Limitations |
|---|---|---|---|---|---|
| CLIP (ViT-L/14) | Text + Image | 768 | 400M pairs | Strong zero-shot, widely supported | Weak on text-heavy images, charts |
| SigLIP | Text + Image | 768-1024 | 1B+ pairs | Better than CLIP on fine-grained | Same chart/document limitations |
| ImageBind | Text + Image + Audio + Depth + IMU | 1024 | Multi-modal | 6 modalities in one space | Lower accuracy per modality |
| ColPali | Document image + Text | 128 (late interaction) | Academic papers | Excellent for document retrieval | Specialized, smaller ecosystem |
| Jina CLIP v2 | Text + Image | 1024 | 1B+ pairs | Strong on text-heavy images | Relatively new |

### Image retrieval strategies

| Strategy | How it works | Pros | Cons |
|---|---|---|---|
| Image embedding only | Embed image pixels directly | Simple, no caption needed | Poor for charts/diagrams, sensitive to visual noise |
| Caption embedding | Generate caption, embed caption text | Better for charts, interpretable | Caption quality bottleneck, loses visual detail |
| Caption + image embedding | Concatenate or average caption and image embeddings | Best of both | 2x embedding cost, needs good captioner |
| OCR-first | Extract all text from image, embed text | Best for text-heavy images | Loses visual layout, diagram structure |
| Late interaction (ColPali) | Token-level similarity between query and image patches | State-of-the-art for documents | Computationally expensive, larger index |

### Multimodal RAG evaluation

| Dimension | Text-only RAG metric | Multimodal RAG metric |
|---|---|---|
| Retrieval relevance | Recall@k of text chunks | Recall@k of image chunks + text chunks |
| Image relevance | N/A | % of retrieved images that are relevant to the query |
| Generation faithfulness | Does the answer match the retrieved text? | Does the answer correctly reference the retrieved images? |
| Image understanding | N/A | Does the answer correctly interpret chart data, figure content? |
| Cross-modal consistency | N/A | Are text and image references in the answer consistent? |

## Action recommendations

1. Start with the simplest pattern: text-only retrieval + VLM generation. Only add cross-modal embeddings if the use case requires image-based search.
2. Invest in image preprocessing: layout detection, caption generation, and OCR extraction. The quality of this pipeline determines the quality of retrieval.
3. Use CLIP or SigLIP for cross-modal embeddings of natural images; use ColPali for document images with heavy text.
4. Store image metadata (caption, OCR text, source, page number) alongside the image embedding. This metadata is essential for the VLM to understand the image context.
5. Evaluate multimodal RAG with a multimodal LLM judge (GPT-4V, Claude Vision) that can assess both text and image relevance.
6. For document-heavy use cases, use a layout detection model (DocTR, unstructured.io) to separate text, figures, and tables before chunking.
7. Budget 2-3x more for multimodal RAG infrastructure than text-only RAG: image processing, larger storage, and VLM inference are more expensive.

## Anti-patterns

- **Embedding raw images of charts without captions**: CLIP embeddings of charts are near-random. Always generate and embed captions for charts and diagrams.
- **Using text-only RAG evaluation on multimodal RAG**: text-only metrics cannot detect image retrieval failures or incorrect image interpretation.
- **Storing full-page images as single chunks**: a full PDF page contains multiple figures, tables, and text blocks. Extract individual elements for retrieval.
- **Not storing OCR text alongside images**: the VLM needs the OCR text to correctly interpret charts and tables. Do not rely on the VLM to extract text from images at generation time.
- **Using CLIP for document retrieval**: CLIP is trained on natural images, not documents. Use ColPali or Jina CLIP v2 for document-specific use cases.
- **Ignoring the cost of VLM generation**: VLM inference is 2-5x more expensive than text-only LLM inference. Budget accordingly.
- **Not handling missing or broken image references**: if a retrieved text chunk references an image that is not available, the VLM will hallucinate the image content.

## Related

- Same category: [rag-design-patterns-summary.md](./rag-design-patterns.md) (text-only RAG patterns, the foundation), [llm-evaluation-methods-summary.md](./llm-evaluation-methods.md) (evaluation methodology)
- Platform: [../platform/multimodal-model-services-summary.md](../platform/multimodal-model-services.md) (serving multimodal models), [../platform/embedding-model-selection-summary.md](../platform/embedding-model-selection.md) (choosing embedding models), [../platform/vector-db-comparison-summary.md](../platform/vector-db-comparison.md) (vector DBs for multimodal storage)
- Foundations: [../foundations/multimodal-fusion-summary.md](../foundations/multimodal-fusion.md) (how VLMs process images internally)

## References

- Radford et al., 2021 -- *Learning Transferable Visual Models from Natural Language Supervision* (CLIP)
- Zhai et al., 2023 -- *Sigmoid Loss for Language Image Pre-Training* (SigLIP)
- Faysse et al., 2024 -- *ColPali: Efficient Document Retrieval with Vision Language Models*
- RAGAS: https://github.com/explodinggradients/ragas
- Unstructured.io: https://github.com/Unstructured-IO/unstructured