---
title: 'GEM Training: How Meta Doubled the Efficiency of Its LLM-Scale Ads Foundation
  Model'
tags:
- Meta Engineering
category: engineer/learn/lessons/wins
created: '2026-08-29'
source: https://engineering.fb.com/2026/08/03/ml-applications/training-gem-at-llm-scale-meta-ads-recommendation-foundation-model/
type: rss
source_name: Meta Engineering
source_url: https://engineering.fb.com/feed/
published: Mon, 03 Aug 2026 18:00:17 +0000
---

<ul>
<li style="font-weight: 400;"><a href="https://engineering.fb.com/2025/11/10/ml-applications/metas-generative-ads-model-gem-the-central-brain-accelerating-ads-recommendation-ai-innovation/"><span style="font-weight: 400;">Meta&#8217;s Generative Ads Recommendation Model (GEM),</span></a><span style="font-weight: 400;"> the foundation model behind ads recommendations across Instagram and Facebook, now trains at LLM scale on several thousand of the latest-generation GPUs. This post goes into the details on how we achieved: doubling end-to-end (E2E) training efficiency to 20–25% Model FLOPs Utilization (MFU) while scaling training FLOPs 4x in 12 months, by co-designing kernels, precision, parallelism, networking, and memory together.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Training GEM presents unique engineering challenges at the intersection of recommendation systems and LLMs as the model combines a hybrid architecture plus recommendations-domain data properties that are unlike typical LLM workloads. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">AI infrastructure optimized for LLM training (kernels, parallelism, low precision recipes etc.) does not directly transfer, requiring significant innovation and hardware/software co-design to reach LLM-scale training for recommendation models efficiently.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">We tackled these challenges through complementary </span><b>compute efficiency</b><span style="font-weight: 400;"> and </span><b>scaling efficiency</b><span style="font-weight: 400;"> innovations:</span>
<ul>
<li style="font-weight: 400;"><b>Compute efficiency</b><span style="font-weight: 400;">: Achieved through a customized recommendation kernel library — Jagged Flash Attention (JFA), Generalized Dot-Product Attention (GDPA), BlockAttention, etc. — and mixed ultra-low precision training (including MXFP8 attention and MLP) optimized for recommendation workloads, purpose-built to exploit latest generation GPU’s architecture.</span></li>
<li style="font-weight: 400;"><b>Scaling efficiency</b><span style="font-weight: 400;">: Topology-aware 5D parallelism with Streaming Multiprocessor (SM)-free collectives — 2D FSDP + Expert Parallelism for dense parameters, combined with Fully Sharded 2D Model Parallelism for sparse parameters — co-designed with Meta&#8217;s multi-tiered network hierarchy to reduce communication overhead. </span></li>
</ul>
</li>
<li style="font-weight: 400;"><span style="font-weight: 400;">The results: we doubled GEM&#8217;s E2E training efficiency to 20-25% MFU while scaling total training FLOPs 4x over the past 12 months.</span></li>
</ul>
<h2><span style="font-weight: 400;">GEM’s Architecture And Its Unique Training Challenges</span></h2>
<p><span style="font-weight: 400;">GEM is the central recommendations foundation model behind Meta’s ads system. It has a hybrid architecture with trillions of sparse embedding parameters and billions of dense parameters. GEM is trained on ad content and user engagement data with two categories of features: </span><b>sequence features </b><span style="font-weight: 400;">(e.g., user activity history) and </span><b>non-sequence features</b><span style="font-weight: 400;"> (e.g., user location, ad creative representation). Customized attention mechanisms are applied to each group independently, while also enabling cross-feature learning. </span></p>
<p><img alt="" class="alignnone wp-image-24317 size-full" height="760" src="https://engineering.fb.com/wp-content/uploads/2026/07/image13.png" width="1480" /></p>
<p><span style="font-weight: 400;">The interplay between this hybrid architecture and rec-domain data properties is what makes GEM&#8217;s training uniquely challenging. </span></p>
<h3><span style="font-weight: 400;">Challenge 1: Achieving High Per-GPU Utilization </span></h3>
<p><span style="font-weight: 400;">Today’s data center GPUs and their software stacks are mostly optimized for LLM workloads, whereas recommendation workloads have a fundamentally different profile due to unique data characteristics and rich user &amp; ads signal interaction patterns that make it extremely difficult to achieve high GPU compute utilization for training a foundational recommendation model of GEM’s size.  </span></p>
<ul>
<li style="font-weight: 400;"><b>Jagged Inputs</b><span style="font-weight: 400;">: Training samples have highly variable sequence length as user activity history can vary wildly. Padding to max length would waste up to 50% compute.  </span></li>
<li style="font-weight: 400;"><b>Diverse interaction patterns and asymmetric sequences</b><span style="font-weight: 400;">: Self-attention operates on extremely long sequences (activity history) but short attention window; cross-attention learns user x ads interaction with long queries but short key/value; pooled multi-head attention (PMA) compress user activity history, resulting in short queries but long key/value. These asymmetric shapes make intra kernel pipelining less effective to saturate compute units.     </span></li>
<li style="font-weight: 400;"><b>Memory-bound</b> <b>operations</b><span style="font-weight: 400;">: e.g., small embedding dimension</span> <span style="font-weight: 400;">for MLP</span> <span style="font-weight: 400;">and</span> <span style="font-weight: 400;">various normalizations</span> <span style="font-weight: 400;">for model quality and training stability leave compute units underutilized.   </span></li>
<li style="font-weight: 400;"><b>Numerical sensitivity</b><span style="font-weight: 400;">: Ads optimization tasks (CTR/CVR prediction) are highly sensitive to numerical change (e.g., precision), making naïve low-precision training prone to quality regression.</span></li>
</ul>
<h3><span style="font-weight: 400;">Challenge 2: Scaling Efficiently Across Thousands of GPUs </span></h3>
<p><span style="font-weight: 400;">Training GEM across thousands of GPUs with trillions of sparse embedding parameters and billions of dense parameters requires scaling efficiently, not just scaling up. Simply adding more GPUs does not translate to proportional speedup. In distributed training, E2E latency per training step is determined by: </span></p>
<p><b>E2E Latency = Max across GPU Rank (Max(Local Compute Time, Communication Time))</b><b><br />
</b></p>
<p><span style="font-weight: 400;">Near-linear scaling requires four conditions: </span></p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Total compute time &gt;&gt; total communication time. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Communication hidden behind compute without contention.  </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Minimal recomputation from memory pressure.  </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Good load balancing across ranks.</span><span style="font-weight: 400;"><br />
</span></li>
</ul>
<p><span style="font-weight: 400;"> GEM&#8217;s workload threatens every one of these: </span></p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">O(Trillion) sparse parameters and O(Billion) dense parameters drive heavy communication with mixed compute patterns.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Architecture diversity across layers makes overlap windows uneven; resource contention between communication and computation makes hiding communication non-trivial.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Long sequences with large activations push memory usage toward its limit, forcing activation recomputation that erodes efficiency.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Jagged sequences across samples create data-driven load skew that varies across ranks. </span></li>
</ul>
<h2><span style="font-weight: 400;">Our Approach and Efficiency Framework</span></h2>
<p><span style="font-weight: 400;">Given the challenges outlined above, we needed a framework that turned a sprawling co-design effort into a small number of technical levers. We measure training efficiency through E2E MFU, which decomposes into two factors:</span></p>
<p><b>E2E MFU = Local MFU (compute efficiency) × Scaling Ratio (scaling efficiency)</b></p>
<p><span style="font-weight: 400;">These factors describe two related but distinct optimization problems.  </span></p>
<p><b>Local MFU (compute efficiency) </b><span style="font-weight: 400;"> measures how well a single GPU&#8217;s compute units are utilized — how close the workload runs to the hardware roofline. It is determined by kernel design, numerical precision, and how well the workload&#8217;s compute patterns (data dimensions, sequence lengths) map onto GPU architecture (Tensor cores, memory hierarchy, streaming multiprocessor scheduling).</span></p>
<p><b>Scaling Ratio (scaling efficiency)</b><span style="font-weight: 400;"> measures how much single-GPU performance is retained when distributing across thousands of GPUs. A scaling ratio of 1.0 means perfect linear scaling; in practice, communication overhead, load imbalance, straggler effects, and activation recomputation from memory pressure all erode it.</span></p>
<p><span style="font-weight: 400;">To isolate local MFU, we run model layers individually on a single GPU and compute a weighted average MFU without activation recomputation or communication exposure. The scaling ratio is derived as the ratio between local and E2E MFU.</span></p>
<p><span style="font-weight: 400;">This decomposition matters because it lets us treat compute efficiency and scaling efficiency as related but distinct optimization problems, each with its own dedicated set of techniques:</span></p>
<ul>
<li style="font-weight: 400;"><b>Compute efficiency</b><span style="font-weight: 400;"> is a kernel-level and numerical-precision problem. The levers are kernel design and ultra-low-precision training — both targeting the per-GPU roofline.</span></li>
<li style="font-weight: 400;"><b>Scaling efficiency</b><span style="font-weight: 400;"> is a distributed-systems problem. The levers are parallelism strategy, network topology mapping, networking efficiency, memory management, and load balancing — all targeting the gap between single-GPU and multi-GPU throughput.</span></li>
</ul>
<p><span style="font-weight: 400;">Both must be addressed to maximize end-to-end MFU. </span></p>
<h2><span style="font-weight: 400;">Optimizing Compute Efficiency With Recommendation Kernels and Ultra-Low-Precision Training</span></h2>
<p><span style="font-weight: 400;">To address the recommendations-system-specific challenges mentioned above and push up GPU FLOPS utilization, we built a custom kernel library and an ultra-low-precision training recipe custom-built and optimized for recommendation workloads on the latest GPU hardware. </span></p>
<ul>
<li style="font-weight: 400;"><b>JFA — eliminates</b><span style="font-weight: 400;"> the up-to-50% compute waste from padding jagged inputs.</span></li>
<li style="font-weight: 400;"><b>BlockAttention</b><span style="font-weight: 400;"> — reduces long user-history self-attention cost from O(L²) to O(L) while preserving model quality and efficiency </span></li>
<li style="font-weight: 400;"><b>GDPA</b><span style="font-weight: 400;"> — unifies and accelerates GEM&#8217;s diverse, asymmetric attention modules where FlashAttention&#8217;s dense long-sequence assumptions break down</span></li>
<li style="font-weight: 400;"><b>MXFP8 attention + MLP</b><span style="font-weight: 400;"> — turns lower-precision Tensor Core throughput into real end-to-end speedups without regressing precision-sensitive CTR/CVR objectives  </span></li>
</ul>
<h3><span style="font-weight: 400;">Inside the Customized Kernel Library for Recommendation   </span></h3>
<h4><span style="font-weight: 400;">Jagged Sequence Flash Attention </span></h4>
<p><span style="font-weight: 400;">FlashAttention is designed for dense, fixed-length sequences common in LLMs. In recommendation models, user sequences are inherently jagged — varying from hundreds to tens of thousands of tokens per sample — and padding to max length could waste up to 50% of compute. </span></p>
<p><span style="font-weight: 400;">Standard FlashAttention implementations assume uniform sequence lengths for efficient tiling and parallelization; with jagged inputs, naive approaches either pad (wasting compute) or leave SMs idle when short sequences finish early. We developed JFA, a custom FlashAttention implementation that operates directly on variable-length jagged tensors, eliminating padding overhead while supporting rec-specific features such as custom attention biases, asymmetric query/key-value lengths, and efficient backward passes.</span></p>
<p><span style="font-weight: 400;">We evolved JFA through four generations, progressively closing the gap from being slower than padded SDPA (scaled dot-product attention) to matching SOTA CUDA/Cutlass performance on latest-generation GPUs:</span></p>
<ul>
<li style="font-weight: 400;"><b>Jagged masking via subtraction scheme</b><span style="font-weight: 400;">: Traditional 2D masking for jagged boundaries (marking invalid positions with -inf) consumes significant non-tensor-core instructions (~28% of executed instructions). We replaced this with a novel subtraction scheme — masking Query/Key with zeros (which the Tensor Memory Accelerator (TMA) does for free) and subtracting the extra exponents — producing numerically equivalent results without the masking overhead.</span></li>
</ul>
<ul>
<li style="font-weight: 400;"><b>Backward parallelization</b><span style="font-weight: 400;">: FlashAttention&#8217;s backward pass requires accumulating dQ across sequence tiles, typically via costly atomic adds. We explored multiple schemes (seq-parallel with atomics, no seq-parallel, seq-parallel with recompute, split dQ/dKdV) and found that for rec workloads with high batch x heads, a non-seq-parallel scheme with split dQ computation delivers 21-40% backward speedup by eliminating both atomic writes and redundant recomputation.</span></li>
<li style="font-weight: 400;"><b>Warp specialization and persistent kernels</b><span style="font-weight: 400;">: Upgrading to Triton Low-Level Extensions (TLX) enabled explicit warp specialization, along with use of TMA, and persistent kernel scheduling — unlocking 30-100% TFLOPS improvement by leveraging the latest hardware feature. </span></li>
</ul>
<p><span style="font-weight: 400;">JFA v4 (TLX) achieves 40-140% TFLOPS improvement over JFA v2, which delivers consistent gains under production jagged distributions (sparsity 0.5), contributing to 18.5% relative local MFU gain and 12% QPS gain.</span></p>
<h4><span style="font-weight: 400;">Generalized Dot-Product Attention (GDPA) </span></h4>
<p><span style="font-weight: 400;">GEM uses diverse attention-like interaction patterns — self-attention, PMA, and cross-attention — that share a common structure: two matrix multiplications with an element-wise activation in between, but replace softmax with activations like GELU or SiLU. We unify these modules under a single GDPA kernel optimized for production RecSys training workloads on latest generation GPUs.</span></p>
<p><span style="font-weight: 400;">Existing FlashAttention kernels are designed for LLM-style dense, long-sequence inputs and perform poorly under real production traffic. We observed a </span><b>2.6x forward performance gap</b><span style="font-weight: 400;"> and up to </span><b>4x worst-case gap</b><span style="font-weight: 400;"> between real-world workloads and synthetic benchmarks driven by short/asymmetric K/V sequences, jagged inputs, and large batch sizes that break pipeline occupancy assumptions.</span></p>
<p><img alt="" class="alignnone wp-image-24319" height="372" src="https://engineering.fb.com/wp-content/uploads/2026/07/image7.png" width="600" /> <img alt="" class="alignnone wp-image-24320" height="354" src="https://engineering.fb.com/wp-content/uploads/2026/07/image6.png" width="600" /></p>
<p><span style="font-weight: 400;">We</span><a href="https://pytorch.org/blog/generalized-dot-product-attention-tackling-real-world-challenges-in-gpu-training-kernels/"><span style="font-weight: 400;"> redesigned the kernel pipeline, scheduling, and math</span></a><span style="font-weight: 400;"> to close the performance gap between real-world traffic and hardware roofline.</span><span style="font-weight: 400;"><br />
</span></p>
<ul>
<li style="font-weight: 400;"><b>Pipeline redesign for non-softmax activations</b><span style="font-weight: 400;">: Eliminating the softmax correction stage frees four warps and their registers. For short K/V sequences, outer-loop software pipelining recovers ~10% performance lost by inner-loop pipelining when the inner loop runs only 1–2 iterations.</span></li>
<li style="font-weight: 400;"><b>Software-level tile scheduling for jagged tensors</b><span style="font-weight: 400;">: precompute valid tiles on CPU, skip empty tiles entirely, and apply zigzag assignment across SMs — reducing workload skew from 6x to near-balanced.</span></li>
<li style="font-weight: 400;"><b>ALU-only activation approximation</b><span style="font-weight: 400;">: Replace GELU&#8217;s SFU-bound tanh with a 6th-order Taylor expansion (ALU-only), accurate within the bounded input range enforced by QK-norm (query/key normalization). Eliminates SFU contention in both forward and backward passes.</span></li>
</ul>
<p><span style="font-weight: 400;">With these optimizations, the </span><a href="https://pytorch.org/blog/generalized-dot-product-attention-tackling-real-world-challenges-in-gpu-training-kernels/#:~:text=Evaluated%20NVIDIA%20B200,SOTA%20attention%20kernel)."><span style="font-weight: 400;">optimized GDPA kernel achieves</span></a><span style="font-weight: 400;"> 2x forward speedup (1,145 BF16 TFLOPs, ~97% Tensor Core utilization) and 1.6x backward speedup over baseline. Under short K/V production settings, it achieves up to 3.5x forward speedup over Flash Attention 4 (FA4). Applied across the full model, these kernels deliver over 30% end-to-end training throughput improvement. </span></p>
<p><img alt="" class="alignnone wp-image-24322" height="371" src="https://engineering.fb.com/wp-content/uploads/2026/07/image1_8a57c9.png" width="600" /></p>
<p><img alt="" class="alignnone wp-image-24323" height="371" src="https://engineering.fb.com/wp-content/uploads/2026/07/image12.png" width="600" /></p>
<h4><span style="font-weight: 400;">BlockAttention  </span></h4>
<p><span style="font-weight: 400;">For GEM self-attention, the core efficiency challenge was scaling long user sequences without paying the quadratic cost of full attention. We first moved the layer from full self-attention to sliding-window attention, limiting each token to nearby events and reducing complexity from O(L</span><span style="font-weight: 400;">2</span><span style="font-weight: 400;">) to O(L * window). This made longer sequences practical. The Sliding Window Attention (SWA) kernel skipped off-window tiles in JFA and </span><a href="https://pytorch.org/blog/tlx-block-attention-a-warp-specialized-blackwell-kernel-for-fixed-block-sparse-self-attention/"><span style="font-weight: 400;">reduced long-sequence self-attention latency by up to 68% </span><span style="font-weight: 400;">with neutral NE (normalized entropy, a model-quality metric)</span></a><span style="font-weight: 400;">.</span></p>
<p><span style="font-weight: 400;">We then pushed the structure further with block-aligned attention. Since GEM could safely use fixed 64-token blocks, each Q block only attends to its corresponding K/V block, turning attention into independent 64&#215;64 problems. This removes the partial-window masking and multi-tile iteration still present in SWA, and lets a dedicated TLX kernel eliminate FlashAttention overheads such as online softmax correction, logsumexp HBM traffic, and separate Di preprocessing. </span></p>
<p><span style="font-weight: 400;">Fusing RoPE backward into the attention epilogue removes another memory-bound kernel and keeps gradients in FP32 registers. Together, </span><a href="https://pytorch.org/blog/tlx-block-attention-a-warp-specialized-blackwell-kernel-for-fixed-block-sparse-self-attention/"><span style="font-weight: 400;">TLX block attention</span></a><span style="font-weight: 400;"> + fused rotary improves self-attention layer MFU by +30.6% over Triton block attention, or roughly +44% over the SWA baseline.</span></p>
<p><img alt="" class="alignnone wp-image-24324 size-full" height="1018" src="https://engineering.fb.com/wp-content/uploads/2026/07/image2.png" width="1820" /></p>
<h3><span style="font-weight: 400;">Mixed Ultra-Low-Precision Training </span></h3>
<p><span style="font-weight: 400;">On a GPU, lower precision directly translates to higher Tensor core throughput. For the latest generation GPU, FP8 delivers 2x peak FLOPS over FP16, and FP4 delivers 4x. We expect the peak FLOPS of low precision to increase faster in next-generation GPUs. This makes low-precision training increasingly attractive as hardware vendors scale low-precision FLOPS faster than FP16. </span></p>
<p><span style="font-weight: 400;">However, making low-precision training work without quality regression — addressing both numerical stability and quantization overhead — remains an industry-wide challenge. We developed MXFP8 Attention and MLP with numerical stability enhancement, which addressed both training stability and quantization overhead.     </span></p>
<h4><span style="font-weight: 400;">Low Precision Flash Attention  </span></h4>
<p><span style="font-weight: 400;">We extended the FA4 kernel with end-to-end MXFP8 blockscaled MMA for both forward and backward passes leveraging latest generation GPUs’ native support for low precision. The main challenge is that low precision attention is not just a datatype swap. Scale factors must be generated along each GEMM’s (General Matrix Multiplications) K dimension, staged through shared memory (SMEM) / tensor memory (TMEM) despite FA4’s already full TMEM footprint, and computed online for intermediates such as softmax P and backward dS. </span></p>
<p><span style="font-weight: 400;">To make the Tensor core speedup survive at module level, quantization was fused into upstream normalization and projection kernels, emitting FP8 activations and tensor-core-friendly scale layouts directly while avoiding extra BF16 global-memory traffic. For GEM’s jagged recommendation workloads, FP8 data stays at unpadded positions and only compact scale factors are scattered/padded for TMA. This turns MXFP8 block-scaled MMA support into practical E2E attention speedups without introducing model quality regressions.</span></p>
<p><img alt="" class="alignnone wp-image-24325 size-full" height="716" src="https://engineering.fb.com/wp-content/uploads/2026/07/image4.png" width="1430" /></p>
<p><span style="font-weight: 400;">To meet our unique requirements we had to develop three new innovations at the kernel level:</span><span style="font-weight: 400;"><br />
</span></p>
<ul>
<li style="font-weight: 400;"><b>TMEM scale factor placement:</b><span style="font-weight: 400;"> The original FA4 fully utilized 512-column TMEM for accumulators, leaving no room for block-scale factors. We solve this by overlapping scale factors with temporarily-unused TMEM regions (e.g., placing S(i) scale factors in the S(1-i) accumulator region), requiring only one additional lightweight barrier that is hidden behind existing GEMM latency.   </span></li>
<li style="font-weight: 400;"><b>Online P-to-MXFP8 conversion:</b><span style="font-weight: 400;"> Softmax output (P) is quantized to MXFP8 in-place within the softmax warp, reusing the row-max already computed for softmax normalization to avoid redundant reductions. Scale factors are derived via optimized PTX bit-manipulation sequences instead of expensive log2/round/clamp operations.</span></li>
<li style="font-weight: 400;"><b>Block-wise Quantization:</b><span style="font-weight: 400;"> We use [32, 32] square quantization computing one scale factor per 32&#215;32 block via redux.sync.max.abs.f32 warp-wide reduction — making quantization transpose-invariant so each tensor is quantized only once. This is useful for the backward pass, where transposed Q,K values are needed.</span><span style="font-weight: 400;"><br />
</span></li>
</ul>
<p><span style="font-weight: 400;">On GEM representative shapes, measured on Meta internal power capped latest generation GPU, we achieved &gt;1.3x speedup for the forward kernel with MXFP8. For the backward kernel, we achieved &gt;1.5x speedup with MXFP8.</span></p>
<p><img alt="" class="alignnone wp-image-24327" height="371" src="https://engineering.fb.com/wp-content/uploads/2026/07/image11.png" width="600" /> <img alt="" class="alignnone wp-image-24328" height="371" src="https://engineering.fb.com/wp-content/uploads/2026/07/image15.png" width="600" /></p>
<h4><span style="font-weight: 400;">Handling Quantization Overhead </span></h4>
<p><span style="font-weight: 400;">Quantization overhead mainly comes from two sources, model parameters (weights) and intermediate tensors (activations). If handled naively, the extra casting, scaling, and data movement can offset the compute speedup from low-precision Tensor cores.</span></p>
<ul>
<li><b>Weight – quantization on Fully Sharded Data Parallel (FSDP) shard</b></li>
</ul>
<ul>
<li>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Pre-all-gather shard quantization: quantize each rank’s local shard </span><i><span style="font-weight: 400;">before</span></i><span style="font-weight: 400;"> FSDP all-gather to amortize the quantization cost across ranks, this avoids re-quantizing the fully gathered weight on every rank.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Quantized FSDP communication: communicate low-precision payloads (vs. BF16) to reduce all-gather volume and cut all-gather latency which further neutralizes the quantization overhead.  </span></li>
</ul>
</li>
</ul>
<ul>
<li><b>Activation – kernel fusion</b></li>
</ul>
<ul>
<li>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Linear modules: Instead of doing a separate quantization step with extra kernel launch + HBM traffic, we fused activation quantization into the preceding normalization (PreNorm fusion) to avoid the overhead. </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Attention modules: In addition to PreNorm fusion, we also fused quantization into the preceding projection so the attention kernel consumes low-precision activations directly with no extra quantization step.</span></li>
</ul>
</li>
</ul>
<h4><img alt="" class="alignnone wp-image-24329 size-full" height="972" src="https://engineering.fb.com/wp-content/uploads/2026/07/image8.png" width="1868" /></h4>
<h4><span style="font-weight: 400;">Addressing Numerical Stability  </span></h4>
<p><span style="font-weight: 400;">Quantization errors, outliers, and rounding bias can make low-precision training  numerically fragile, especially for gradient computation. We addressed these challenges with:</span></p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Outlier mitigation:</span>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">We applied Random Hadamard Transforms spread outliers and smooth distributions prior to low precision quantization.</span></li>
</ul>
</li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Recipe tuning (fine-grained controls):</span>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">We used stochastic rounding to eliminate deterministic rounding bias.</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Skipping / higher-precision weight-gradient (WGrad): We observed activations and gradients can exhibit more severe outlier behavior; selectively skipping WGrad or using higher precision can materially improve model quality.</span></li>
</ul>
</li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Mixed precision: </span>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">We use ultra low precision  where it will have the most benefit  (e.g., large GEMMs) and fall back to BF16 (e.g., later layers in the model are more sensitive to quantization errors) where ultra low  precision is insufficient to meet model quality targets.</span></li>
</ul>
</li>
</ul>
<h2><span style="font-weight: 400;">Scaling Efficiency: 5D Parallelism, Networking, Memory, And Load Balancing </span></h2>
<p><span style="font-weight: 400;">As mentioned above, for large scale distributed training:  </span></p>
<p><b>E2E Latency = Max across GPU Rank (Max(Local Compute Time, Communication Time)) </b></p>
<p><span style="font-weight: 400;">Near-linear scaling requires four conditions: total compute time &gt; communication time, compute / communication overlapping without contention, minimal recomputation, and good load balancing.  Our optimizations address each condition to push up GEM’s scaling efficiency.  </span></p>
<table cellpadding="8" style="border-collapse: collapse; border: 2px solid black;">
<thead>
<tr>
<th style="border: 2px solid black;">Condition</th>
<th style="border: 2px solid black;">GEM&#8217;s Challenges</th>
<th style="border: 2px solid black;">Optimizations</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 2px solid black;">Total compute time &gt; total communication time</td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">O(Trillion) sparse parameters and O(Billion) dense parameters drive heavy communication with mixed compute patterns.</span></td>
<td style="border: 2px solid black;">Topology-aware 5D Parallelism</td>
</tr>
<tr>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Communication hidden behind compute without contention</span></td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Resource contention between communication and computation </span></td>
<td style="border: 2px solid black;">SM Free Communication</td>
</tr>
<tr>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Minimal recomputation from memory pressure  </span></td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Long sequences with large activations push memory usage toward its limit, forcing activation recomputation </span></td>
<td style="border: 2px solid black;">Automatic Activation Checkpointing with Quantization</td>
</tr>
<tr>
<td style="border: 2px solid black;">Good load balancing across ranks</td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Jagged sequences across samples create data-driven load skew that varies across ranks</span></td>
<td style="border: 2px solid black;">Sequence length aware load balancing</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<h3><span style="font-weight: 400;">5D Parallelism, Optimized with Meta&#8217;s Network Topology</span></h3>
<p><span style="font-weight: 400;">GEM&#8217;s hybrid architecture requires distinct parallelism strategies for each component as dense and sparse parameters have different compute and communication patterns. We use 5D parallelism to scale GEM’s training efficiently across thousands of GPUs: 2D FSDP with Expert Parallelism (EP) for dense parameters, and Fully Sharded 2D Model Parallelism for sparse parameters. </span></p>
<p><span style="font-weight: 400;">The design principle is to match communication volume to available bandwidth across the topology hierarchy. When a collective becomes a bottleneck on a given tier, we introduce a new parallelism dimension that reduces message volume or group size on that tier.</span></p>
<p><span style="font-weight: 400;">Meta&#8217;s training cluster used by GEM has a three-tier network hierarchy: Eight GPUs per host connected via NVLink , hosts within an </span><a href="https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/"><span style="font-weight: 400;">AI zone connected via RoCE</span></a><span style="font-weight: 400;">, and AI zones connected via oversubscribed RoCE with bandwidth reduction.  </span></p>
<p><img alt="" class="alignnone wp-image-24331 " height="1122" src="https://engineering.fb.com/wp-content/uploads/2026/07/image14.png" width="1964" /></p>
<h4><span style="font-weight: 400;">Dense Parallelism Evolution: From 1D to 3D Parallelism</span><span style="font-weight: 400;">  </span></h4>
<p><span style="font-weight: 400;">GEM&#8217;s O(Billion) dense parameters are sharded using FSDP. Parameters are distributed across GPUs and reconstructed via all-gather before computation, with gradients synchronized via reduce-scatter. We add two dimensions on top of FSDP — a replica (DDP) dimension (making it 2D FSDP) and EP — for a total of three dense parallelism dimensions (3D dense parallelism).</span><span style="font-weight: 400;"><br />
</span></p>
<table cellpadding="8" style="border-collapse: collapse; border: 2px solid black;">
<thead>
<tr>
<th style="border: 2px solid black;">Parallelism Dimension</th>
<th style="border: 2px solid black;">Collectives</th>
<th style="border: 2px solid black;">Topology Tier</th>
<th style="border: 2px solid black;">Bandwidth</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 2px solid black;">EP (Expert Parallelism)</td>
<td style="border: 2px solid black;">All-gather / reduce-scatter</td>
<td style="border: 2px solid black;">Intra-node NVLink</td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">High</span></td>
</tr>
<tr>
<td style="border: 2px solid black;">FSDP (within group)</td>
<td style="border: 2px solid black;">All-gather / reduce-scatter</td>
<td style="border: 2px solid black;">Inter-node (within AI zone)</td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Medium </span></td>
</tr>
<tr>
<td style="border: 2px solid black;">DDP (across groups)</td>
<td style="border: 2px solid black;">All-reduce</td>
<td style="border: 2px solid black;">Inter-node (potentially cross zone)</td>
<td style="border: 2px solid black;"><span style="font-weight: 400;">Low(Oversubscribed)</span></td>
</tr>
</tbody>
</table>
<p><span style="font-weight: 400;"><br />
This topology-aware distributed training is what makes 3D dense parallelism efficient — each dimension&#8217;s communication cost is matched to the bandwidth available at its topology level.<br />
</span></p>
<p><b>Why 2D FSDP: Reducing Group Size for Better Bandwidth</b></p>
<p><span style="font-weight: 400;">At several thousands GPU scale, standard FSDP requires collectives across the full rank count, where effective bandwidth degrades with group size —  particularly when spanning multiple AI zones. 2D FSDP solves this by splitting the communication into two topology-aware tiers:</span></p>
<ul>
<li style="font-weight: 400;"><b>FSDP shard group :</b><span style="font-weight: 400;"> Parameters are sharded and reconstructed via all-gather / reduce-scatter across a much smaller group (e.g., 128-256 GPUs). The reduced group size achieves higher effective bandwidth. </span></li>
<li style="font-weight: 400;"><b>DDP replica group </b><span style="font-weight: 400;">: Gradients are synchronized via all-reduce across replica groups. Because parameters are already sharded by FSDP, each rank sends only a fraction — the message size is small enough to even tolerate the lower cross-zone bandwidth.</span></li>
</ul>
<p><span style="font-weight: 400;">We aggressively pre-fetch parameter all-gathers, pipelining each module&#8217;s communication with the previous module&#8217;s compute to maximize overlap. This works well for most modules — however, large modules like DHEN (Deep Hierarchical Ensemble Network) experts have parameter sizes where communication time still outweighs neighboring compute time, becoming exposed and slowing down E2E efficiency.</span></p>
<p><b>Adding Expert Parallelism: Pushing Heavy Communication to the Fastest Links</b></p>
<p><span style="font-weight: 400;">To address communication exposure from large dense expert modules, we layer EP on top of 2D FSDP. With EP, each rank holds only one expert, shrinking the FSDP all-gather to a single expert&#8217;s parameters — reducing both group size and message size.</span></p>
<p><span style="font-weight: 400;">The extra EP communication is placed on intra-node NVLink with high bandwidth  making it easily hidden. The forward and backward passes coordinate FSDP and EP collectives:</span></p>
<ul>
<li style="font-weight: 400;"><b>Forward</b><span style="font-weight: 400;">: FSDP all-gather expert params (16-way, inter-node) → EP all-gather activations (2-way, intra-node NVLink) → compute local experts on full batch → EP reduce-scatter outputs (2-way, intra-node NVLink). </span></li>
<li style="font-weight: 400;"><b>Backward</b><span style="font-weight: 400;">: FSDP all-gather expert params (16-way, inter-node) → EP all-gather output gradients (2-way, intra-node NVLink) → compute expert gradients → EP reduce-scatter input gradients (2-way, intra-node NVLink) → FSDP reduce-scatter param gradients (16-way, inter-node). </span></li>
</ul>
<h4><img alt="" class="alignnone wp-image-24332 size-full" height="1098" src="https://engineering.fb.com/wp-content/uploads/2026/07/image16.png" width="1978" /></h4>
<h4><span style="font-weight: 400;">Sparse Parallelism Evolution: From 1D to 2D memory overhead free parallelism </span></h4>
<p><span style="font-weight: 400;">GEM&#8217;s sparse parameters (O(Trillion) embedding tables) present unique scaling challenges distinct from dense parameters. Embedding tables require model-parallel sharding with all-to-all communication for feature distribution, and their sheer size makes memory overhead a primary constraint. We evolved through three generations of sparse parallelism to address these challenges.</span></p>
<table cellpadding="8" style="border-collapse: collapse; border: 2px solid black; height: 255px;" width="805">
<thead>
<tr>
<th style="border: 2px solid black;"></th>
<th style="border: 2px solid black;">Load imbalance</th>
<th style="border: 2px solid black;">Memory overhead</th>
<th style="border: 2px solid black;">Communication cost</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 2px solid black;"><strong>V1: 1D Model Parallelism</strong></td>
<td style="border: 2px solid black;">Poor</td>
<td style="border: 2px solid black;">None</td>
<td style="border: 2px solid black;">Very high &#8211; full rank</td>
</tr>
<tr>
<td style="border: 2px solid black;"><strong>V2: 2D Model Parallelism</strong></td>
<td style="border: 2px solid black;">Good</td>
<td style="border: 2px solid black;">High — each replica group maintains a full copy of sparse parameters O(Trillion)</td>
<td style="border: 2px solid black;">Moderate — reduced group size</td>
</tr>
<tr>
<td style="border: 2px solid black;"><strong>V3: Fully Sharded 2D Model Parallelism</strong></td>
<td style="border: 2px solid black;">Good</td>
<td style="border: 2px solid black;">Near zero</td>
<td style="border: 2px solid black;">Moderate — extra comm through fast NVLink</td>
</tr>
</tbody>
</table>
<p><b> </b></p>
<p><b>V1 → V2: Solving Imbalance and Communication Bottlenecks</b></p>
<p><span style="font-weight: 400;">At several thousands GPU scale, 1D model parallelism hits two fundamental bottlenecks for good efficiency: </span></p>
<ul>
<li style="font-weight: 400;"><b>Load imbalance:</b><span style="font-weight: 400;"> Distributing embedding table shards across thousands of ranks results in severe workload skew — each rank holds too few shards for balanced partitioning.</span></li>
<li style="font-weight: 400;"><b>Communication latency:</b><span style="font-weight: 400;"> All-to-all collective group size scales with total rank count. Cross-node bandwidth degrades rapidly with group size, particularly when jobs span multiple AI zones where bandwidth is oversubscribed </span></li>
</ul>
<p><span style="font-weight: 400;">2D model parallelism addresses both by partitioning ranks into smaller model-parallel groups (e.g., 256 GPUs), with multiple replica groups performing data parallelism. Each replica group independently shards and communicates within a much smaller scope, reducing all-to-all latency and improving load balance — delivering significant QPS gains over 1D at large scale.</span><b></b></p>
<p><b>V2 → V3: Eliminating Memory Overhead</b></p>
<p><span style="font-weight: 400;">The tradeoff of V2 is memory: each replica group must hold a full copy of its assigned shard&#8217;s parameters. For GEM&#8217;s trillion-parameter sparse tables, this O(T) overhead can consume significant HBM — blocking further model scaling.  </span></p>
<p><span style="font-weight: 400;">Fully Sharded 2D removes this overhead by further sharding each replica&#8217;s parameter copy across its groups. Each rank stores only a fraction of the shard, and parameters are reconstructed on-demand:</span></p>
<ul>
<li style="font-weight: 400;"><b>Forward:</b><span style="font-weight: 400;"> All-gather table shards → all-to-all feature distribution → embedding lookup → all-to-all embedding return</span></li>
<li style="font-weight: 400;"><b>Backward:</b><span style="font-weight: 400;"> All-gather table shards → all-to-all gradient exchange → local update → reduce-scatter parameters</span></li>
</ul>
<p><span style="font-weight: 400;">The extra all-gather and reduce-scatter from V3 are mapped to intra-node NVLink. We overlap these collectives with concurrent dense compute through pipelining, and schedule the all-gather to release reconstructed copies before peak memory usage.</span></p>
<p><span style="font-weight: 400;">With these optimizations, we’re able to make sparse scaling nearly overhead-free at GEM&#8217;s training scale with very minimal communication exposure. </span></p>
<p><img alt="" class="alignnone wp-image-24333 size-full" height="954" src="https://engineering.fb.com/wp-content/uploads/2026/07/image3.png" width="1996" /></p>
<h3><span style="font-weight: 400;">Networking Efficiency : Getting Communication Off the SMs</span></h3>
<p><span style="font-weight: 400;">With 5D parallelism, GEM hides most communication behind compute kernels through pipelining. However, communication collectives could also occupy SMs, which creates SM contention. Communication kernels occupy SMs (e.g. ~24 SMs for all-gather, reduce-scatter) that would otherwise be utilized by compute kernels running in parallel, costing up to 15% efficiency. What makes it worse is that compute kernel performance could drop more than SM occupancy loss, since wave scheduling could end up with more waste. </span></p>
<p><span style="font-weight: 400;">Hence, our primary networking efficiency push is SM-free communication — offloading data movement from SMs to dedicated hardware engines.</span></p>
<p><img alt="" class="alignnone wp-image-24334 size-full" height="916" src="https://engineering.fb.com/wp-content/uploads/2026/07/image5.png" width="1999" /></p>
<p><span style="font-weight: 400;">For pure data-movement collectives (e.g., all-gather), we use </span><a href="https://arxiv.org/abs/2510.20171"><span style="font-weight: 400;">NCCLX </span></a><span style="font-weight: 400;">— Meta&#8217;s extension to the NCCL library — for copy-free, SM-free communication. NCCLX leverages hardware features to move data without SM involvement: the Copy Engine (CE) handles intra-node NVLink transfers and RDMA handles inter-node transfers, reducing SM usage from 24 to 1 for all-gather. This reclaims ~23 SMs for compute, yielding ~5% E2E QPS gain at full training scale.</span></p>
<p><span style="font-weight: 400;">For collectives that require reduction (e.g., All-Reduce), we found NVLink SHARP with in-network reduction a viable option to reduce SM usage by offloading the reduction computation from SMs to the network switch hardware.</span></p>
<h3><span style="font-weight: 400;">Memory Efficiency: Large Local Batches Without Paying the Full Memory Bill </span></h3>
<p><span style="font-weight: 400;">Per-GPU memory breaks down into three categories: activations, embedding tables, and dense parameters (including optimizer states). After parallelism shards embedding tables and dense parameters across GPUs, activations dominate per-GPU memory and scale with model and batch size. </span></p>
<p><span style="font-weight: 400;">We used two techniques to address this:</span></p>
<p><b>Compiler-based Automatic Activation Checkpointing (AutoAC) </b></p>
<p><span style="font-weight: 400;">PyTorch&#8217;s compiler-based activation checkpointing already beats traditional all-or-nothing recompute by reasoning over individual nodes in the joint forward–backward graph — saving expensive ops, recomputing cheap pointwise ops. But it still applies a single memory budget across the whole model, which leaves performance on the table when regions (compiled subgraphs between graph breaks) differ in recompute ROI (latency saved per GB of activation). We replaced the global budget with a customized per-region budget schedule, so memory flows to the regions with the highest payoff. This pushes the memory–latency tradeoff past what any uniform budget can achieve.</span><span style="font-weight: 400;"><br />
</span></p>
<p><b>Activation Quantization</b></p>
<p><span style="font-weight: 400;">On top of AutoAC, we further squeeze the memory usage via activation quantization. It operates on the checkpointed tensors — the set of intermediate activation tensors that AutoAC has already determined need to be stowed for the backward pass. When enabled, it quantizes these saved activation nodes (e.g., from BF16 to FP8/MX4) at the boundary between the forward and backward graphs. </span></p>
<p><span style="font-weight: 400;">With these optimizations, we’re able to use large local batch sizes (up to 1K+ samples) with modest activation recompute cost to train the GEM model efficiently. This is important for scaling since small batch size and heavy activation recompute both hurt MFU.</span></p>
<p><img alt="" class="alignnone wp-image-24335 size-full" height="1010" src="https://engineering.fb.com/wp-content/uploads/2026/07/image17.png" width="1934" /></p>
<h3><span style="font-weight: 400;">Load Balancing: A Recommendation-Specific Straggler Problem</span></h3>
<p><span style="font-weight: 400;">LLM training could avoid load balancing by padding all sequences to fixed length. For GEM, user sequences are inherently jagged, and padding wastes 50%+ of compute. Jagged kernels avoid per-rank waste but create a new problem – data-driven compute skew that varies every iteration.</span></p>
<p><img alt="" class="alignnone wp-image-24336 size-full" height="884" src="https://engineering.fb.com/wp-content/uploads/2026/07/image9.png" width="1640" /></p>
<p><span style="font-weight: 400;">The heaviest rank consistently exceeds the average by ~15% each iteration. </span></p>
<p><b>Choosing the Right Rebalancing Strategy </b></p>
<p><span style="font-weight: 400;">We considered local and global rebalancing strategies to address workload imbalance:</span></p>
<table cellpadding="8" style="border-collapse: collapse; border: 2px solid black;">
<thead>
<tr>
<th style="border: 2px solid black;">Approach</th>
<th style="border: 2px solid black;">Mechanism</th>
<th style="border: 2px solid black;">Balancing Quality</th>
<th style="border: 2px solid black;">Overhead</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 2px solid black;"><strong>Local (Intra-Rank)</strong></td>
<td style="border: 2px solid black;">Each rank independently rebalances its own batches.</td>
<td style="border: 2px solid black;">High: 90% of optimal</td>
<td style="border: 2px solid black;">None (zero cross-rank communication).</td>
</tr>
<tr>
<td style="border: 2px solid black;"><strong>Global (Cross-Rank)</strong></td>
<td style="border: 2px solid black;">Ranks exchange samples via all-to-all.</td>
<td style="border: 2px solid black;">Near-perfect</td>
<td style="border: 2px solid black;">Introduces new all-to-all collective per training step.</td>
</tr>
</tbody>
</table>
<p><span style="font-weight: 400;"><br />
The overhead associated with the global approach — a collective on every training step — negates the very efficiency gains it aims to deliver. We developed a new technique that we call Base Batch Shuffling (BBS), where distributed readers generate small sub-batches (128 samples), which are sorted by total sequence length and interleaved (heaviest paired with lightest) when merged into full training batches (1k+ samples per rank) — capturing most of the theoretical optimal balance with zero cross-rank communication. </span></p>
<p><img alt="" class="alignnone wp-image-24338 size-full" height="1078" src="https://engineering.fb.com/wp-content/uploads/2026/07/image10.png" width="1999" /></p>
<p><b>BBS delivered 4% efficiency gain</b><span style="font-weight: 400;"> on GEM training, comprising 4% QPS improvement and 4% peak memory reduction. Upon activation, the maximum-over-average workload gap immediately dropped.</span></p>
<h2><span style="font-weight: 400;">On to the Next Level of Scale and Efficiency   </span><span style="font-weight: 400;">   </span></h2>
<p><span style="font-weight: 400;">Training a foundation model at the intersection of LLMs and recommendation systems is a co-design problem, not a software problem or a hardware problem alone. The 2x efficiency gain we describe here came from carefully considering every layer of the stack for optimization— kernels, precision, parallelism, networking, and memory all had to move together. We expect the next 2x to come in a similar way and with even faster iteration speed as we embrace agents to automate some of the optimization cycles. As we continue to scale the GEM model, we expect to keep pushing system boundaries and extreme co-design across different layers of the AI infra stack to further advance compute and scaling efficiency. We’re sharing this work in the hope that the broader community sees similar opportunities in the workloads they run. </span></p>
<h2><span style="font-weight: 400;">Acknowledgements</span></h2>
<div class="break-words [&amp;&gt;*:last-child]:mb-0">
<p class="mb-2 leading-relaxed"><em>We would like to thank</em> <em>Tianshu Peng,</em> <em>Jiasheng Zhang,</em> <em>Angel Yang,</em> <em>Rikin Shah,</em> <em>Ke Sang,</em> <em>Kevin Tang,</em> <em>Pawel Kadluczka,</em> <em>Jacky Zhou,</em> <em>Han Xu,</em> <em>Enes Palaz,</em> <em>Hao Yan,</em> <em>Jake Siso,</em> <em>Rupert Wu,</em> <em>Liangbei Xu,</em> <em>Yusuo Hu,</em> <em>Serena Liu,</em> <em>Hongtao Yu,</em> <em>Bor-Yiing Su,</em> <em>Santosh Mohan,</em> <em>Min Si,</em> <em>Shali Jiang,</em> <em>Laming Chen,</em> <em>Boyang Liu,</em> <em>Qinghai Zhou,</em> <em>Xiaozhen Xia,</em> <em>Jason Rudy,</em> <em>Jiayi Xu,</em> <em>Dan Chanpuriya,</em> <em>Justin Yang,</em> <em>Mandeep Chadha,</em> <em>Carmen Au,</em> <em>Hairong Kuang,</em> <em>Subodh Iyengar,</em> <em>Balaji Balasubramanian,</em> <em>Anamaya Sullerey,</em> <em>Viral Vimawala,</em> <em>Saket Gur,</em> <em>May Wang,</em> <em>Vibha Sinha,</em> <em>Rustam Hashimov,</em> <em>Ernest Wang,</em> <em>Max Leung,</em> <em>Shuo Chang,</em> <em>Musharaf Sultan,</em> <em>Oana Platon,</em> <em>Jade Nie,</em> <em>Eric Falconer,</em> <em>Ping Chen,</em> <em>Damian Reeves,</em> <em>Xian Chen,</em> <em>Ellie Wen,</em> <em>Chonglin Sun,</em> <em>GP Musumeci,</em> <em>Reva Srinivasan,</em> <em>Brian Hansen,</em> <em>Vivienne Sung,</em> <em>Patrick Phelps,</em> <em>Paolo Massimi,</em> <em>Jie Zheng,</em> <em>Anuj Madan,</em> <em>Nikhil Garg,</em> <em>Xiaorui Gan,</em> <em>John Bocharov,</em> <em>Ritwik Tewari,</em> <em>Wenlin Chen,</em> <em>Rocky Liu,</em> <em>Tak Yan,</em> <em>Santanu Kolay,</em> <em>Sandeep Pandey,</em> <em>Matt Steiner,</em> and the entire v-team behind training Meta&#8217;s largest ads recommendation workloads at scale and efficiently.</p>
</div>
<p>The post <a href="https://engineering.fb.com/2026/08/03/ml-applications/training-gem-at-llm-scale-meta-ads-recommendation-foundation-model/">GEM Training: How Meta Doubled the Efficiency of Its LLM-Scale Ads Foundation Model</a> appeared first on <a href="https://engineering.fb.com">Engineering at Meta</a>.</p>