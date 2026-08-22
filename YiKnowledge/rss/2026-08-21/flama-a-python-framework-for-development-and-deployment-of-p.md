---
title: 'Flama: a Python framework for development and deployment of production-ready
  APIs, machine learning, and LLM services'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18733
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jos\'e A. Perdiguero L\'opez, Miguel A. Dur\'an-Olivencia
---

arXiv:2608.18733v1 Announce Type: cross 
Abstract: We present Flama, an open-source Python framework for developing and deploying production-ready web APIs, machine learning services, and large-language-model (LLM) applications. Built on the Asynchronous Server Gateway Interface (ASGI), Flama offers a type-driven, async-first programming model that unifies REST API development, predictive model serving, and generative AI inference in one architecture.
  It is organised around seven subsystems: a component-based dependency injection system resolving handler parameters from type annotations at startup; a pluggable schema layer supporting Pydantic, Marshmallow and Typesystem behind a single adapter; an automatic CRUD generator turning a SQLAlchemy table and a schema class into REST endpoints backed by the Repository and Unit of Work patterns; a portable binary format (.flm) packaging models from scikit-learn, TensorFlow, PyTorch and Hugging Face Transformers with their metadata for zero-code deployment; a multi-backend LLM server running vLLM (Linux/CUDA) or MLX (Apple Silicon) and exposing four wire protocols (OpenAI, Anthropic, Ollama, and a native streaming dialect) through a shared codec; a Rust-accelerated core compiled via Maturin for routing, JSON encoding, compression and parsing; and a Model Context Protocol module turning any application into an MCP server over JSON-RPC 2.0.
  Built-in capabilities include JWT authentication, two pagination strategies, background tasks in threads or processes, WebSocket endpoints, Server-Sent Event and NDJSON streaming, OpenAPI 3.2.0 generation from handler signatures, and a command-line interface for running applications and for serving, packaging and inspecting models.
  We describe the architecture, present the programming model through worked examples, and compare Flama with existing frameworks, model serving platforms and LLM inference engines.