---
title: vLLM Sessions at PyTorch Conference North America 2026
tags:
- PyTorch Blog
category: aier/foundations
created: '2026-08-29'
source: https://pytorch.org/blog/vllm-sessions-at-pytorch-conference-north-america-2026/
type: rss
source_name: PyTorch Blog
source_url: https://pytorch.org/blog/feed.xml
published: Fri, 28 Aug 2026 21:30:18 +0000
author: PyTorch Foundation
---

<h3><b>TL;DR</b></h3>
<p>PyTorch Conference North America 2026 features vLLM across sessions on KV cache management and disaggregated serving, hardware portability, kernel optimization, PyTorch integration, Mixture-of-Experts inference, attention, and production serving.</p>
<h3><b>vLLM at #PyTorchCon NA</b></h3>
<p><span style="font-weight: 400;">PyTorch Conference North America 2026 comes to San Jose, CA, October 20–21, with technical talks, live demos, lightning talks, sponsored sessions, a keynote, and a Birds of a Feather discussion featuring vLLM.</span></p>
<p>Across the program, vLLM appears in sessions on serving architecture and KV cache work, hardware portability, kernel and performance optimization, and PyTorch integration. Additional sessions cover Mixture-of-Experts inference, attention, production deployment, broader application stacks, and open source contribution.</p>
<p><a href="https://hubs.ly/Q04tDx8f0"><span style="font-weight: 400;">View the full conference schedule</span></a></p>
<p><a href="https://hubs.ly/Q04tDw_W0"><span style="font-weight: 400;">Register for PyTorch Conference North America 2026</span></a></p>
<h3><strong>Serving Architecture, KV Cache, and Production Inference</strong></h3>
<h4><b>A Developer’s Guide to Attention in vLLM</b></h4>
<p><b>Lucas Wilkinson, Red Hat; Matthew Bonanni, Red Hat</b><b><br />
</b><b>October 20, 11:45 a.m.–12:10 p.m. | LL20AB | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session explains how vLLM represents, serves, and optimizes attention as models adopt approaches including sliding windows, sparsity, compression, linear variants, and hybrid attention.</span></p>
<p><span style="font-weight: 400;">The speakers cover attention backends, KV-cache connectors, and the hybrid memory allocator, along with a recent overhaul of vLLM’s attention abstractions, what changed, and how the new design makes emerging architectures easier and cleaner to support.</span></p>
<h4><b>State-of-the-Art KV Transfer for Disaggregated LLM Serving in vLLM</b></h4>
<p><b>Nicolò Lucchesi, Mistral AI; Sunita Nadampalli, Amazon; Zhanqiu Hu, Red Hat</b><b><br />
</b><b>October 20, 2:15–2:40 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session covers developments in vLLM’s disaggregated serving stack for transferring KV cache between prefill and decode. Topics include hybrid-model transfer with heterogeneous tensor parallelism, bidirectional KV transfer, the KV Push connector, and KV cache leases for reliability.</span></p>
<p><span style="font-weight: 400;">The speakers report that KV Push reduces time to first token and that, on Nemotron, disaggregated prefill/decode Pareto-dominates co-located serving across concurrency levels.</span></p>
<h4><b>Native Tiered KV Cache Offloading in vLLM: From Storage Offloading to Disaggregated Serving</b></h4>
<p><b>Or Ozeri, IBM</b><b><br />
</b><b>October 20, 2:50–3:15 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">This talk presents vLLM’s native tiered KV cache offloading framework, newly integrated upstream with no external dependencies.</span></p>
<p><span style="font-weight: 400;">The framework routes transfers through CPU memory as a universal transport hub. The design minimizes GPU transfer overhead, consolidates I/O through a CPU buffer, avoids specialized transfer APIs, and remains independent of KV cache memory layout across hardware, attention backends, parallelism schemes, and model architectures.</span></p>
<h4><b>LMCache: a cluster-wide open source solution for LLM prompt caching</b></h4>
<p><b>Kuntai Du, Tensormesh, Inc.</b><b><br />
</b><b>October 20, 3:40–3:50 p.m. | LL20CD | Lightning Talk</b></p>
<p><span style="font-weight: 400;">LMCache provides prompt caching across inference engines including vLLM, SGLang, and TensorRT-LLM and storage systems including Mooncake, Redis, and AWS S3.</span></p>
<p><span style="font-weight: 400;">The session includes a tutorial on deploying LMCache in Kubernetes along with the techniques and research behind its prompt-caching approach.</span></p>
<h4><b>vLLM KV Cache Management for Model-Specific Requirements</b></h4>
<p><b>Mengqing Cao, Huawei</b><b><br />
</b><b>October 20, 5:30–5:40 p.m. | LL20CD | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This session addresses KV cache requirements that vary across model architectures including MLA, SWA, Eagle, and DeepSeek-V4.</span></p>
<p><span style="font-weight: 400;">It proposes a model-customized KV Cache Planner built around a default planner plus model-specific planners for requirements such as spec grouping, block-size derivation, cache tensor creation, and </span><span style="font-weight: 400;">max_model_len</span><span style="font-weight: 400;"> adjustment.</span></p>
<h4><b>Elastic Expert Parallelism in vLLM</b></h4>
<p><b>Itay Alroy, NVIDIA</b><b><br />
</b><b>October 21, 2:50–3:15 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">Elastic Expert Parallelism enables vLLM deployments to add or remove workers at runtime and redistribute experts across the updated worker set with minimal interruption to serving.</span></p>
<p><span style="font-weight: 400;">The session covers communication reconfiguration, CUDA Graph recapture, expert rebalancing through the EP Load Balancer, weight transfer to new GPUs, and coordination with model forward execution. It also covers how NIXL EP enables grow and shrink operations under live traffic, fault detection, reporting, and recovery.</span></p>
<h4><b>Prefix Caching for Autoregressive Stages in Multi-Stage Pipelines</b></h4>
<p><b>Ricardo Noriega, Red Hat; Alex Brooks, Red Hat</b><b><br />
</b><b>October 21, 4:20–4:45 p.m. | LL20AB | Breakout Session</b></p>
<p><span style="font-weight: 400;">This talk explores Automatic Prefix Caching for Stage Outputs in vLLM-Omni, an approach for extending vLLM’s prefix caching to multi-stage models while minimizing GPU memory cost.</span></p>
<p><span style="font-weight: 400;">The approach aligns external CPU tensor caches with vLLM’s native block management. The speakers also describe how vLLM-Omni dynamically discovers cacheable tensors without requiring manual configuration.</span></p>
<h3><b>Hardware Portability and Accelerator Backends</b></h3>
<h4><b>Sponsored: Unifying Open Source LLM Serving on Google Cloud TPUs with TorchTPU</b></h4>
<p><b>Rob Mulla, Google</b><b><br />
</b><b>October 20, 10:40–10:50 a.m. | Community Expo | Demo Theater</b></p>
<p><span style="font-weight: 400;">This 10-minute demo shows TorchTPU’s native, high-performance compilation path for PyTorch models on Cloud TPUs.</span></p>
<p><span style="font-weight: 400;">The demo highlights TorchTPU as a unified backend for inference engines including vLLM and SGLang, enabling model deployment through those serving engines with minimal code modifications.</span></p>
<h4><b>Sponsored: PyTorch Ecosystem Running Natively on Trainium</b></h4>
<p><b>Maen Suleiman, Amazon Web Services</b><b><br />
</b><b>October 20, 10:55–11:05 a.m. | Community Expo | Demo Theater</b></p>
<p><span style="font-weight: 400;">This live demo covers PyTorch workflows on Trainium through TorchNeuron, including training with TorchTitan or Hugging Face Transformers v5, serving with vLLM-Neuron, profiling with Neuron Explorer, and adding NKI kernels directly to PyTorch code.</span></p>
<p><span style="font-weight: 400;">The session also demonstrates Neuron Agentic Development, AI-assisted tooling for kernel authoring and optimization.</span></p>
<h4><b>One Model Definition, Many Accelerators: Scaling vLLM Across Hardware Without Forks</b></h4>
<p><b>Thomas Parnell, IBM; Richard Zou, Meta</b><b><br />
</b><b>October 20, 4:20–4:45 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">This talk presents hardware-agnostic model definitions for vLLM, an approach that separates model logic from hardware execution paths so the same model definition can run across accelerators without forks or per-platform maintenance.</span></p>
<p><span style="font-weight: 400;">The design relies on compatibility with </span><span style="font-weight: 400;">torch.compile</span><span style="font-weight: 400;">, well-defined extensibility hooks, and isolation from hardware-specific paths. The speakers show how the approach supports Intel Gaudi/HPU and IBM Spyre without hardware-specific modeling code.</span></p>
<h4><b>Portable PyTorch Across AI Accelerators: A Triton Operator Stack from Eager Mode to vLLM</b></h4>
<p><b>Yonghua Lin, Beijing Academy of Artificial Intelligence</b><b><br />
</b><b>October 20, 4:55–5:20 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session presents FlagOS, an open source system stack using a Triton-based operator, compiler, and runtime layer for PyTorch.</span></p>
<p><span style="font-weight: 400;">FlagGems implements PyTorch eager-mode operators and LLM-critical kernels in Triton, while the same operator layer connects to vLLM through the </span><span style="font-weight: 400;">vllm-plugin-fl</span><span style="font-weight: 400;"> multi-backend plugin.</span></p>
<p>The speakers report testing FlagOS on 20+ AI chips and architectures and say it has enabled Day-0 adaptation of models including Qwen3.5, MiniMax-M3, MiniCPM-5, and DeepSeek-V4. They report 5–40% inference performance improvement over original vendor adaptation.</p>
<h4><b>Efficient MoE LLM Inference on Arm with vLLM and OpenVINO</b></h4>
<p><b>Abhishek Jain, Fujitsu Research of India; N Maajid Khan, Fujitsu Research of India</b><b><br />
</b><b>October 20, 4:55–5:05 p.m. | LL21ABC | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This talk presents a vLLM and OpenVINO inference stack optimized for Arm CPUs, including SVE-optimized SDPA and Paged Attention, U8 KV-cache quantization, operator fusion, KleidiAI integration, and optimized threading for 8-bit and 4-bit inference.</span></p>
<p><span style="font-weight: 400;">For Mixture-of-Experts models, the speakers introduce a NUMA-aware GatherMatMul operator that combines dynamic token and expert selection with matrix multiplication. Benchmarks on AWS Graviton3e show approximately 2x throughput on GPTOSS/Llama models.</span></p>
<h4><b>Integrating the IBM Spyre Accelerator</b></h4>
<p><b>David Grove, IBM; Antoni Viros i Martin, IBM Research; Avery Blanchard, IBM Research</b><b><br />
</b><b>October 20, 4:55–5:20 p.m. | LL21DEF | Breakout Session</b></p>
<p><span style="font-weight: 400;">Torch-Spyre is an open source project that provides a PyTorch PrivateUse1 device with OpenReg, including an Inductor backend, for the IBM Spyre Accelerator.</span></p>
<p><span style="font-weight: 400;">The speakers report that the IBM Spyre Accelerator can now run thousands of models from Hugging Face and vLLM through its PyTorch integration. The session covers the state of Torch-Spyre, functional enablement and performance improvements made in 2026, contributions back to PyTorch, device-specific tensor layouts, and scratchpad-optimized tiling.</span></p>
<h4><b>Keynote: Workload Fungibility in the Age of Agents</b></h4>
<p><b>Bill Jia, Google Cloud</b><b><br />
</b><b>October 21, 9:15–9:25 a.m. | Grand Ballroom | Keynote</b></p>
<p><span style="font-weight: 400;">This keynote uses TorchTPU to show PyTorch workflows across model development, training, and serving, including serving through vLLM and SGLang.</span></p>
<p><span style="font-weight: 400;">The session also demonstrates agentic workflows for moving model workloads from GPUs to TPUs and explores their use for performance optimization tasks including quantization, custom kernel generation, and sharding strategies.</span></p>
<h4><b>PyTorch-Native LLM Serving on TPU: SGLang and vLLM</b></h4>
<p><b>Colin Taylor, Meta; Qi Zhou, Google; Angela Yi, Meta</b><b><br />
</b><b>October 21, 2:15–2:40 p.m. | LL20CD | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session presents SGLang and vLLM running on TPUs through a new PyTorch-native TPU backend while preserving the serving engines’ schedulers, batching systems, OpenAI-compatible APIs, and </span><span style="font-weight: 400;">torch.compile</span><span style="font-weight: 400;"> workflows.</span></p>
<p><span style="font-weight: 400;">The speakers cover </span><span style="font-weight: 400;">torch.compile</span><span style="font-weight: 400;"> lowering to TPU, Pallas attention, tensor and expert parallelism, Mixture-of-Experts execution, FP8 for large MoE models including Qwen3-Coder-480B, multimodal encoders, prefill/decode disaggregation, and speculative decoding. The speakers say both platforms will be open sourced as of the talk.</span></p>
<h3>Kernel and Performance Optimization</h3>
<h4><b>High-Velocity GPU Kernel Authoring with CUTLASS Python</b></h4>
<p><b>Michael Goldfarb, NVIDIA; Guray Ozen, NVIDIA</b><b><br />
</b><b>October 20, 12:20–12:45 p.m. | 210BF | Breakout Session</b></p>
<p><span style="font-weight: 400;">This talk presents new Python-first capabilities for CUTLASS CuTe DSL, which the speakers report has delivered high-performance GPU kernels in projects including FlashAttention 4, TRT-LLM, vLLM, and FlashInfer.</span></p>
<p><span style="font-weight: 400;">The session introduces CuTe DSL extensions, CUTLASS Python Primitives for direct access to low-level hardware instructions, and the Resource and Task Scheduler, a zero-cost metaprogramming framework for static verification of asynchronous primitives.</span></p>
<h4><b>Faster LLM Serving Startup with fastsafetensors</b></h4>
<p><b>Takeshi Yoshimura, IBM</b><b><br />
</b><b>October 20, 3:25–3:35 p.m. | LL20CD | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This talk presents fastsafetensors, an open source library for accelerating safetensors checkpoint loading in PyTorch inference systems including vLLM.</span></p>
<p><span style="font-weight: 400;">fastsafetensors removes per-tensor copies, coalesces fragmented I/O, and skips host staging. The speakers report 4.8x to 7.5x faster model loading and up to 28 GB/s of NVMe read throughput.</span></p>
<p><span style="font-weight: 400;">The session also covers contributions including parallel loading, 3FS integration, ROCm support, a universal wheel with runtime CUDA/ROCm detection, Windows DirectStorage exploration, and unified-memory support.</span></p>
<h4><b>Sponsored: Quantization Showdown: PyTorch Inference Optimization</b></h4>
<p><b>Markell Rawls, Red Hat</b><b><br />
</b><b>October 20, 4:10–4:20 p.m. | Community Expo | Demo Theater</b></p>
<p><span style="font-weight: 400;">This live demo examines quantization and speculative decoding using tools including LLM Compressor and vLLM.</span></p>
<p><span style="font-weight: 400;">The session stress-tests the techniques under load to examine the performance, cost, and quality tradeoffs involved in production deployments.</span></p>
<h4><b>From Weeks to Overnight: Autonomous Day-0 Kernel Bring-Up with Agent Pipelines</b></h4>
<p><b>Xiaogang Gu, Intel; Qun Yang, Intel</b><b><br />
</b><b>October 20, 5:30–5:40 p.m. | 210BF | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This session presents a pipeline-driven autonomous system for GPU kernel optimization, with specialized agents handling profiling, analysis, code generation, verification, fixes, benchmarking, and evaluation in isolated contexts.</span></p>
<p><span style="font-weight: 400;">Using real vLLM inference workloads, the speakers report reducing kernel bring-up and optimization cycles from weeks to overnight unattended runs.</span></p>
<h4><b>Making vLLM Faster on Intel GPUs with Triton Kernels</b></h4>
<p><b>Whitney Tsang, Intel; Artur Fierka, Intel</b><b><br />
</b><b>October 21, 12:20–12:30 p.m. | 210BF | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This talk examines Triton kernels for vLLM on Intel GPUs and where Triton can outperform SYCL on inference workloads.</span></p>
<p><span style="font-weight: 400;">The speakers focus on unified attention, fused MoE, batched MoE, autotuning, tensor-descriptor-oriented kernel structure, and fusion opportunities. They also discuss where these choices improve end-to-end vLLM throughput and latency and where SYCL remains competitive.</span></p>
<h4><b>HiFloat: Democratizing Ultra-Low Precision Training and Inference in PyTorch Ecosystems</b></h4>
<p><b>Yun Zhao, Huawei; Haonan Zhang, Huawei</b><b><br />
</b><b>October 21, 2:50–3:00 p.m. | LL20AB | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This session introduces HiFloat8 and HiFloat4 and demonstrates HiFloat-accelerated LLM workflows within DeepSpeed and vLLM.</span></p>
<p><span style="font-weight: 400;">The implementation uses PyTorch custom ops, Triton-based kernels, and </span><span style="font-weight: 400;">torch.compile</span><span style="font-weight: 400;">. In the benchmarks presented, the speakers report that HiF8 achieves final-loss parity with FP16 while delivering a 1.5x–1.7x GEMM speedup.</span></p>
<h4><b>Portable Paged Attention: From Triton to Helion</b></h4>
<p><b>Burkhard Ringlein, IBM Research</b><b><br />
</b><b>October 21, 3:25–3:50 p.m. | 210BF | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session compares Triton and Helion implementations of Paged Attention and presents an experimental Helion attention backend for vLLM.</span></p>
<p><span style="font-weight: 400;">The speaker covers differences between the two implementations, algorithm changes needed to achieve matching performance, and optimizations enabled by Helion. Early results indicate that the experimental Helion backend can reduce latency by up to 50% and improve end-to-end throughput versus Triton by up to 10%.</span></p>
<h3>PyTorch Integration and Compatibility</h3>
<h4><b>Shipping PyTorch and Its Ecosystem: A Modern Release Story</b></h4>
<p><b>Andrey Talman, Meta</b><b><br />
</b><b>October 20, 11:45–11:55 a.m. | LL21DEF | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This talk covers changes to PyTorch release engineering, including continuous validation of Triton and vLLM against PyTorch nightlies so ecosystem breakage can surface upstream before the release branch is cut.</span></p>
<p><span style="font-weight: 400;">The session also covers a faster, more predictable release process and the use of AI agents to triage CI, separate noise from regressions, and draft fixes, while leaving final decisions with people.</span></p>
<h4><b>Sponsored: Making Enterprise Agentic Inference Production-Ready with PyTorch and vLLM</b></h4>
<p><b>Joseph Groenenboom, Red Hat; Tyler Michael Smith, Red Hat</b><b><br />
</b><b>October 20, 3:25–3:50 p.m. | LL21ABC | Sponsored Session</b></p>
<p><span style="font-weight: 400;">This session examines reliability, observability, KV cache management, and concurrency requirements for enterprise inference systems.</span></p>
<p><span style="font-weight: 400;">The speakers cover a sample of upstream work across PyTorch, vLLM, other Foundation projects, and the broader ecosystem, from core PyTorch build infrastructure to model-serving improvements for tool calling and long-context, multi-turn chat.</span></p>
<h4><b>Clearing the Path Towards an ABI Stable PyTorch C++ Extension Ecosystem</b></h4>
<p><b>Sean McGovern, Red Hat; Chris Leonard, Red Hat; Jane Xu, Meta</b><b><br />
</b><b>October 21, 2:15–2:40 p.m. | LL21ABC | Breakout Session</b></p>
<p><span style="font-weight: 400;">PyTorch’s stable ABI provides a binary-compatible C interface that extensions can target across PyTorch versions without recompilation.</span></p>
<p><span style="font-weight: 400;">This session presents tools for identifying and inventorying unstable API usage and applying source-to-source conversion with LLM-assisted follow-up. The speakers demonstrate the process on libraries including vLLM and SGLang.</span></p>
<h4><b>From Backed to Unbacked: Sound, Predictable, and Controllable Dynamic Shapes in PyTorch</b></h4>
<p><b>Laith Sakka, Meta</b><b><br />
</b><b>October 21, 4:20–4:45 p.m. | LL21ABC | Breakout Session</b></p>
<p><span style="font-weight: 400;">This talk covers unbacked dynamic shapes for explicit graph-capture workflows including vLLM, export, and pre-compilation, as well as JIT deployments where dynamic-shape recompilation is not acceptable.</span></p>
<p><span style="font-weight: 400;">The session covers data-dependent errors and branching, work to close the performance gap with backed shapes across TorchBench and vLLM, and APIs for shape constraints and dispatch across compiled artifacts.</span></p>
<h3><b>vLLM in Broader Applications and Infrastructure</b></h3>
<h4><b>Understanding Modern Vision Language Models</b></h4>
<p><b>Aastha Jhunjhunwala, NVIDIA; Mark Moyou, NVIDIA</b><b><br />
</b><b>October 20, 12:20–12:45 p.m. | LL20AB | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session deconstructs five open source vision-language model architectures, covering image tokenization, vision-language fusion, differences between training and inference, fine-tuning, and multi-GPU training.</span></p>
<p><span style="font-weight: 400;">For production serving, the speakers cover image-token growth, KV-cache pressure, throughput, and where tools including vLLM fit.</span></p>
<h4><b>Sponsored: Hardware-Aware AI: Building Agentic Systems from Cloud to Edge with PyTorch, ExecuTorch</b></h4>
<p><b>Kavya Sri Chennoju, Arm</b><b><br />
</b><b>October 20, 12:20–12:45 p.m. | LL20CD | Sponsored Session</b></p>
<p><span style="font-weight: 400;">This session presents a cloud-to-edge workflow combining PyTorch for model development, ExecuTorch for on-device inference, vLLM for scalable LLM serving, and Arm Device Connect for interaction with heterogeneous hardware.</span></p>
<p><span style="font-weight: 400;">The live workflow shows foundation models reasoning about tasks, invoking edge models, retrieving live sensor data, and coordinating physical devices.</span></p>
<h4><b>Keeping GPUs Busy: High-Speed Storage for PyTorch via fsspec</b></h4>
<p><b>Ankita Luthra, Google; Trinadh Kotturu, Google</b><b><br />
</b><b>October 20, 3:40–3:50 p.m. | LL21DEF | Lightning Talk</b></p>
<p><span style="font-weight: 400;">This talk presents Rapid Storage, which brings Google’s Colossus stateful protocol to PyTorch through </span><span style="font-weight: 400;">fsspec</span><span style="font-weight: 400;"> and uses persistent gRPC streams to the storage layer.</span></p>
<p><span style="font-weight: 400;">The speakers report less than 1 ms random read/write latency, 20x faster data access, 6 TB/s of aggregate throughput, and 10x lower tail latency for random I/O. The integration extends through </span><span style="font-weight: 400;">gcsfs</span><span style="font-weight: 400;"> and the broader </span><span style="font-weight: 400;">fsspec</span><span style="font-weight: 400;"> ecosystem, including vLLM alongside other data and AI frameworks.</span></p>
<h4><b>Sponsored: From Prompt to Physical Action: A Live Hardware-Aware AI Demo with PyTorch, ExecuTorch</b></h4>
<p><b>Kavya Sri Chennoju, Arm</b><b><br />
</b><b>October 20, 3:55–4:05 p.m. | Community Expo | Demo Theater</b></p>
<p><span style="font-weight: 400;">This live demonstration combines PyTorch, ExecuTorch, vLLM, and Arm Device Connect in a workflow spanning cloud, edge, and embedded devices.</span></p>
<p><span style="font-weight: 400;">Starting with a natural-language request, a large language model reasons about the task, discovers available devices, invokes edge AI models, retrieves live sensor data, and coordinates hardware through a unified programming model.</span></p>
<h4><b>From PyTorch to Production: Serving a Physics-Constrained Generative Model with ONNX, Ray, and vLLM</b></h4>
<p><b>Arun Sharma, University of Minnesota</b><b><br />
</b><b>October 21, 2:50–3:15 p.m. | 210AE | Breakout Session</b></p>
<p><span style="font-weight: 400;">This session follows a physics-constrained generative downscaling model from PyTorch training into a served stack.</span></p>
<p><span style="font-weight: 400;">The talk covers model export through </span><span style="font-weight: 400;">torch.onnx</span><span style="font-weight: 400;"> and AOTInductor, rectified-flow sampling, physics constraints at inference, and a Ray Train recipe for scaling. The serving path combines ONNX Runtime in Rust, Temporal in Go, and a vLLM agent that calls the downscaler as a tool.</span></p>
<h3><b>vLLM Community and Contribution</b></h3>
<h4><b>Contributing to Inference OSS That Won’t Stand Still: A BoF on vLLM, llm-d, and the Moving Target</b></h4>
<p><b>Maroon Ayoub, Red Hat; Nili Guy, IBM</b><b><br />
</b><b>October 21, 10:35–11:05 a.m. | Community Expo | Birds of a Feather</b></p>
<p><span style="font-weight: 400;">This Birds of a Feather session focuses on contributing to fast-moving inference projects including vLLM and llm-d.</span></p>
<p><span style="font-weight: 400;">Contributors, maintainers, and prospective contributors will compare approaches to landing a first pull request, onboarding contributors, following technical decisions across project channels, and participating in cross-company open source development.</span></p>
<h3><b>Explore the Full Program</b></h3>
<p><span style="font-weight: 400;">These sessions include both talks centered directly on vLLM and broader sessions where vLLM is part of the serving stack, implementation, hardware integration, optimization work, or application workflow.</span></p>
<p><a href="https://hubs.ly/Q04tDx8f0"><span style="font-weight: 400;">View the full conference schedule</span></a></p>
<p><a href="https://hubs.ly/Q04tDw_W0"><span style="font-weight: 400;">Register for PyTorch Conference North America 2026</span></a></p>