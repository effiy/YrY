---
title: Fast, On Device Agentic AI with Muse Glimmer on ExecuTorch
tags:
- PyTorch Blog
category: aier/foundations
created: '2026-08-29'
source: https://pytorch.org/blog/fast-ondevice-agentic-ai-with-executorch/
type: rss
source_name: PyTorch Blog
source_url: https://pytorch.org/blog/feed.xml
published: Mon, 10 Aug 2026 13:42:54 +0000
author: ExecuTorch Team at Meta
---

<p>Today, Meta <a href="https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model">introduced Muse Glimmer</a>, an open-weight, 30-billion-parameter model distilled from Meta’s Muse Spark for on-device agentic workflows. Alongside, ExecuTorch is adding end-to-end support for running Muse Glimmer on NVIDIA GPUs and Macs with Apple silicon.</p>
<h2>Why ExecuTorch?</h2>
<p>Most local AI frameworks rewrite models in other non-Python languages. That scaled well when LLMs were standard text transformers, but today&#8217;s models are becoming more complex &#8211; novel architectures, multimodal inputs and outputs, advanced decoding algorithms like <a href="https://arxiv.org/abs/2602.06036">DFlash</a> (parallel diffusion-based speculative decoding) for low latency. Reimplementing these across different backends doesn&#8217;t scale.</p>
<p><a href="https://pytorch.org/blog/introducing-executorch-1-0/">ExecuTorch</a> takes a different approach. As machine learning engineers and researchers, you implement the model (and its decoding strategy) in PyTorch. Once you&#8217;re ready for deployment, you export to ExecuTorch, and the framework handles backend-specific lowering, Triton on CUDA, MLX-native and custom Metal on Apple silicon. Ahead-of-time compilation optimizes the full execution path end-to-end, not just individual ops.</p>
<p>This is how we ship Muse Glimmer’s text and image inputs, direct GGUF export, native K-quant execution, 128K+-token context, and DFlash speculative decoding features. We have released prebuilt PTE artifact bundles that you can download and run on supported NVIDIA GPUs or Macs with Apple silicon using the ExecuTorch runtime.</p>
<h2>Quickstart</h2>
<h3>Getting the PTEs</h3>
<p>A PTE is the serialized artifact produced ahead of time from a model&#8217;s PyTorch graph by the ExecuTorch Python stack, and optimized for a target backend.</p>
<h4>Download (Preferred)</h4>
<p>We have published verified PTEs on Hugging Face for NVIDIA CUDA and Apple Silicon (Metal). This includes text-only and text-plus-image artifacts, with and without DFlash speculative decoding. Download them here: <a href="https://huggingface.co/meta-models/Muse-Glimmer-30B-ExecuTorch-PTE/tree/main">link</a>.</p>
<h4>Build your own</h4>
<p>Starting with a prebuilt PTE is the fastest way to get running. To build your own, follow the ExecuTorch Muse Glimmer <a href="https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md">README</a>, and select the backend, modality, context length, and whether to use DFlash. ExecuTorch exports directly from the released GGUF checkpoints through its torch.export-based ahead-of-time stack. CUDA export compiles and autotunes Triton kernels for the detected GPU architecture. For the best results, export on the same GPU architecture that will run the artifact.</p>
<h3>Executing the PTEs</h3>
<h4>1. Build the runtime</h4>
<p>ExecuTorch ships CMake presets for both the <a href="https://docs.pytorch.org/executorch/stable/backends/cuda/cuda-overview.html">CUDA</a> and <a href="https://pytorch.org/blog/running-pytorch-models-on-apple-silicon-gpus-with-the-executorch-mlx-delegate/">MLX backends</a> for this model runner(s). Follow ExecuTorch installation instructions <a href="https://docs.pytorch.org/executorch/stable/getting-started.html">here</a>, and then use CMake to build the runners with or without speculative decoding for the PTE you selected. Both, with and without DFlash, runners support text and image modalities and are compatible with the example llm_server in ExecuTorch for agentic use cases.</p>
<pre><code>### Build the runtime ###

# After installing ExecuTorch, build the runners for your backend:

$ cd examples/models/muse-glimmer
$ cmake --workflow --preset muse-glimmer-cuda # use muse-glimmer-mlx for macOS

# This builds solo_runner, dflash_runner, and the serving worker.</code></pre>
<h4>2. Run the PTEs</h4>
<p>Here are some examples of how to run the PTEs, once you have built the runners.</p>
<pre><code>### Example 1: Standalone infereance on cmdline ###

$ PROMPT='&lt;|start|&gt;user&lt;|message|&gt;Describe this image: &lt;img&gt;&lt;|eot|&gt;&lt;|start|&gt;assistant'

$ cmake-out/examples/models/muse-glimmer/dflash_runner \
--model_path artifacts/dflash-vision/model.pte \
--data_path artifacts/dflash-vision/aoti_cuda_blob.ptd \
--tokenizer_path assets/hf/tokenizer.json \
--image_path image.jpg --prompt "$PROMPT" \
--block_length 4 --n_draft 3 --temperature 0 --max_new_tokens 256</code></pre>
<pre><code>### Example 2, step 1/2: Start the agent server ###

$ python -m executorch.examples.models.muse_glimmer.serving.serve \
--model-path artifacts/dflash-vision/model.pte \
--data-path artifacts/dflash-vision/aoti_cuda_blob.ptd \ # only for cuda
--tokenizer-path assets/hf/tokenizer.json --hf-tokenizer assets/hf \
--worker-bin cmake-out/examples/models/muse-glimmer/muse_glimmer_worker \
--tool-parser atem --max-context 131072

# APIs at http://127.0.0.1:8000/v1

### Example 2, step 2/2: Start your agent (use Pi as example) ###
  
$ pi \
--provider muse-glimmer-local \
--model muse-glimmer \
--thinking high \
--tools read,bash,edit,write

# This will automatically start your pi agent by using your local muse glimmer server.
# Register muse_glimmer-local in ~/.pi/agent/models.json first.
# See the README.md for more details.</code></pre>
<h2>Use cases enabled</h2>
<h3>Image understanding with Muse Glimmer, with and without speculative decoding</h3>
<p><img alt="Muse Glimmer text-image input experiment on M5 Pro" class="alignnone size-large wp-image-153335" height="430" src="https://pytorch.org/wp-content/uploads/2026/08/Muse-Glimmer-text-image-input-experiment-on-M5-Pro.gif" width="1024" /><br />
Figure 1: Muse Glimmer text-image input experiment on M5 Pro (64 GiB). Solo achieves 21.6 tok/s, while our speculative decoding set up (DFlash) reaches 33.0 tok/s, a 52.8% performance improvement without quality regression</p>
<h3>Muse Glimmer powering Pi Coding Agent through ExecuTorch</h3>
<p><img alt="Muse Glimmer agent pipeline on an M5 Pro using the Pi coding agent" class="alignnone size-large wp-image-153336" height="853" src="https://pytorch.org/wp-content/uploads/2026/08/Muse-Glimmer-agent-pipeline-on-an-M5-Pro-using-the-Pi-coding-agent.gif" width="1024" />Figure 2: Muse Glimmer agent pipeline on an M5 Pro (64 GB) using the Pi coding agent. The agent creates a bird-themed game, iteratively refining details through extended reasoning, calling tools to create files, installing required packages, writing and running tests, and proactively asking the user about next steps and additional requirements</p>
<h2>Performance</h2>
<p><img alt="Muse Glimmer performance on ExecuTorch using text-only input with varying context on NVIDIA A100 and Apple Mac" class="alignnone size-large wp-image-153337" height="743" src="https://pytorch.org/wp-content/uploads/2026/08/Muse-Glimmer-performance-on-ExecuTorch-using-text-only-input-with-varying-context-on-NVIDIA-A100-and-Apple-Mac-1024x743.png" width="1024" />Figure 3: Muse Glimmer performance on ExecuTorch using text-only input with varying context on NVIDIA A100 (as a proxy for RTX cards) and Apple Mac with an M5-max measuring prefill and decode performance in tokens/second with and without DFlash using coding prompt, which also has a good acceptance rate for this model, as seen in the decode charts</p>
<h2>Under the Hood</h2>
<p>Muse Glimmer now runs end-to-end on ExecuTorch on both NVIDIA GPUs and Apple Silicon GPUs. Here are some of the key capabilities and optimizations we built.</p>
<h3>Enabling DFlash speculative decoding</h3>
<ul>
<li>We optimized target and draft interoperability through weight sharing, exporting both into a single PTE.</li>
<li>The DFlash block dimension is exported dynamically, allowing one PTE to support runtime-selectable block lengths.</li>
<li>The runtime supports both greedy decoding and rejection sampling.</li>
</ul>
<h3>Supporting GGUF loading and k-quant</h3>
<ul>
<li>We export straight from the GGUF released with the Muse Glimmer.</li>
<li>We map Q4_K/Q5_K/Q6_K to packed INT4/5/6 with dp4a GEMV kernels on CUDA, and to repacked or fused Metal kernels on MLX.</li>
<li>On MLX, for performance, at repack time we merge adjacent sub-blocks whose scale and min are identical into a larger group size, up to 128, whenever the merge is lossless.</li>
</ul>
<h3>Agentic harness and LLM serving</h3>
<ul>
<li>One model load serves multiple isolated conversations, through per-session mutable-state rebinding we added to both backends.</li>
<li>We added Harmony chat templating with reasoning routing.</li>
<li>We added a parser for the model&#8217;s XML tool-call format, including multiple calls in one turn.</li>
</ul>
<h3>Backend-specific performance optimizations</h3>
<p><strong>CUDA</strong></p>
<ul>
<li>We capture decode into a CUDA graph, reducing per-kernel launch overhead into one submission.</li>
<li>Packed K-quant kernels accelerate low-batch decode, while length-aware split-K FlashDecoding++ paths optimize single-token decode and small DFlash verification blocks.</li>
</ul>
<p><strong>MLX</strong></p>
<ul>
<li>RMSNorm, RoPE, SDPA, KV-cache updates, and quantized linear operations are lowered to MLX-native or custom Metal implementations.</li>
<li>GGUF K-quant weights use either repacked MLX-native operations or fused Metal kernels.</li>
</ul>
<h3>Supporting long context</h3>
<p>Muse Glimmer supports a 128K+ token context, and is efficient in how its KV-cache grows: only 13 of its 52 layers are global; the other 39 are sliding-window. ExecuTorch supports this efficiently, making the long context use cases practical on edge devices.</p>
<h2>What’s next</h2>
<ul>
<li>This initial release supports text and image inputs; video input is not yet supported. It is a work in progress.</li>
<li>No cross-session prefix sharing or checkpointing or continuous batching as of now. These are all actively being worked on to make ExecuTorch even more suitable for agentic workflows.</li>
</ul>
<p>Try Muse Glimmer with ExecuTorch and let us know what you think on <a href="https://discord.com/invite/Dh43CKSAdc">Discord</a>. If you run into any issues, feel free to open a Github <a href="https://github.com/pytorch/executorch/issues/new/choose">Issue</a>.</p>
<h2>References</h2>
<p><a href="https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md">Muse Glimmer in ExecuTorch</a> | <a href="https://huggingface.co/meta-models">Muse Glimmer on Hugging Face</a> | <a href="https://docs.pytorch.org/executorch/main/getting-started.html">ExecuTorch Documentation</a> | <a href="https://github.com/pytorch/executorch">ExecuTorch on Github</a></p>