---
title: 'FP8 Training on AMD GPUs with TorchTitan and TorchAO: Upstreaming Performance
  Improvements'
tags:
- PyTorch Blog
category: aier/foundations
created: '2026-08-29'
source: https://pytorch.org/blog/fp8-training-on-amd-gpus-with-torchtitan-and-torchao-upstreaming-performance-improvements/
type: rss
source_name: PyTorch Blog
source_url: https://pytorch.org/blog/feed.xml
published: Thu, 13 Aug 2026 16:00:31 +0000
author: 'AMD: Rishi Sinha, Yuankai Chen, Liz Li, Shekhar Pandey, Wen Chen, Xiaobo
  Chen, Yao Fu, Zhenyu Gu, Andy Luo, Peng Sun META: Matthias Reso, Hamid Shojanazeri,
  TorchAO team, TorchTitan team'
---

<p><span style="font-weight: 400;">At the PyTorch Conference 2025, we demonstrated linear scaling beyond 1,000 GPUs on AMD Instinct clusters using Primus-Turbo, an AMD optimization library for training frameworks such as TorchTitan. We have since upstreamed those AMD optimizations so TorchTitan supports AMD Instinct(<img alt="™" class="wp-smiley" src="https://s.w.org/images/core/emoji/17.0.2/72x72/2122.png" style="height: 1em;" />) GPUs directly, with competitive FP8 performance out of the box. All contributions mentioned have been merged into upstream pytorch/AO and pytorch/TorchTitan.</span></p>
<p><span style="font-weight: 400;">On dense models, FP8 training delivers a 13.4% throughput gain over BF16 on Llama3-8B (</span><a href="https://github.com/pytorch/ao/pull/2736"><span style="font-weight: 400;">#2736</span></a><span style="font-weight: 400;">) as shown in Figure 1. On MOE architectures like DeepSeek-V3 671B, FP8 quantization initially added significant overhead. Through fused Triton quantization kernels, we recovered 89% of the FP8 quantization overhead on DeepSeek-V3 671B MoE shapes (</span><a href="https://github.com/pytorch/ao/pull/4311"><span style="font-weight: 400;">#4311</span></a><span style="font-weight: 400;">), with individual kernel optimizations delivering up to a 6.2× speedup (</span><a href="https://github.com/pytorch/ao/pull/4113"><span style="font-weight: 400;">#4113</span></a><span style="font-weight: 400;">). </span></p>
<p><span style="font-weight: 400;">This blog covers the FP8 optimizations that deliver these gains, from major kernel acceleration to the Triton fusion pipeline that narrowed the quantization overhead gap on MoE models. Getting there took three pieces of work: </span></p>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Adding native support for AMD&#8217;s FP8 number format </span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Enabling grouped GEMM for Mixture-of-Experts models on ROCm</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Building a Triton fusion pipeline that reduced the quantization overhead</span></li>
</ol>
<p>&nbsp;</p>
<table>
<tbody>
<tr>
<td><b>Workload</b></td>
<td><b>Optimization</b></td>
<td><b>Result</b></td>
<td><b>PR</b></td>
</tr>
<tr>
<td><span style="font-weight: 400;">Llama3-8B (dense)</span></td>
<td><span style="font-weight: 400;">Rowwise FP8 vs BF16</span></td>
<td><span style="font-weight: 400;">+13.4% throughput</span></td>
<td><a href="https://github.com/pytorch/ao/pull/2736"><span style="font-weight: 400;">#2736</span></a></td>
</tr>
<tr>
<td><span style="font-weight: 400;">DeepSeek-MoE-16B</span></td>
<td><span style="font-weight: 400;">Backward transpose removal + fusion</span></td>
<td><span style="font-weight: 400;">4.2x backward pass</span></td>
<td><a href="https://github.com/pytorch/ao/pull/3972"><span style="font-weight: 400;">#3972</span></a><span style="font-weight: 400;">, </span><a href="https://github.com/pytorch/ao/pull/4069"><span style="font-weight: 400;">#4069</span></a></td>
</tr>
<tr>
<td><span style="font-weight: 400;">DeepSeek-V3 671B</span></td>
<td><span style="font-weight: 400;">Colwise scales coalescing</span></td>
<td><span style="font-weight: 400;">6.2x per MoE layer (7,290→1,170µs)</span></td>
<td><a href="https://github.com/pytorch/ao/pull/4113"><span style="font-weight: 400;">#4113</span></a></td>
</tr>
<tr>
<td><span style="font-weight: 400;">DeepSeek-V3 671B</span></td>
<td><span style="font-weight: 400;">Forward pass fusion</span></td>
<td><span style="font-weight: 400;">+17% end-to-end; recovers 89% of FP8 gap</span></td>
<td><a href="https://github.com/pytorch/ao/pull/4311"><span style="font-weight: 400;">#4311</span></a></td>
</tr>
</tbody>
</table>
<p><i><span style="font-weight: 400;"><img alt="Rowwise FP8 training throughput on 8×MI300X GPU with Llama3-8B" class="alignnone size-large wp-image-154235" height="544" src="https://pytorch.org/wp-content/uploads/2026/08/Rowwise-FP8-training-throughput-on-8×MI300X-GPU-with-Llama3-8B-e1786571048745-1024x544.png" width="1024" /></span></i><em><span style="font-weight: 400;">Figure 1: Rowwise FP8 training throughput on 8×MI300X GPU with Llama3-8B (batch size 1, seq len 8192, 100 steps, torch.compile, FSDP2, per-op selective activation checkpointing). Rowwise FP8 with a high-precision weight-gradient recipe (the weight-update GEMM stays in BF16 while the forward and gradient-input GEMMs use FP8) delivers a 13.4% throughput gain over BF16, with peak memory nearly identical (~39 GB). The win comes from faster FP8 matrix cores, not memory savings. All numbers come from TorchAO PR </span><a href="https://github.com/pytorch/ao/pull/2736"><span style="font-weight: 400;">#2736.</span></a></em></p>
<h2><b>AMD FP8 format in TorchAO</b></h2>
<p><span style="font-weight: 400;">Each linear layer performs three matrix multiplications: the forward pass, gradient input, and gradient weight update. FP8 training quantizes these operations from 16 bits to 8 bits, greatly improving throughput. AMD Instinct GPUs implement a variant of the FP8 formats called FNUZ (Finite, No NaN, Unsigned Zero) which is illustrated in the table below</span></p>
<table>
<thead>
<tr>
<th><span style="font-weight: 400;">Property</span></th>
<th><span style="font-weight: 400;">e4m3fnuz (AMD)</span></th>
</tr>
</thead>
<tbody>
<tr>
<td><span style="font-weight: 400;">Max value</span></td>
<td><span style="font-weight: 400;">240</span></td>
</tr>
<tr>
<td><span style="font-weight: 400;">NaN/Inf encodings</span></td>
<td><span style="font-weight: 400;">No</span></td>
</tr>
<tr>
<td><span style="font-weight: 400;">Hardware</span></td>
<td><span style="font-weight: 400;">MI300X, MI325X, MI350X</span></td>
</tr>
</tbody>
</table>
<p><span style="font-weight: 400;">The FP8 capabilities demonstrated in Primus-Turbo were upstreamed directly to TorchAO and TorchTitan as displayed in Figure 2, spanning three areas: hardware-aware FP8 format support, MoE grouped GEMM enablement on ROCm, a Triton kernel fusion pipeline that reduced quantization overhead.</span></p>
<p><i><span style="font-weight: 400;"><img alt="TorchTitan FP8 training software stack on ROCm" class="alignnone size-large wp-image-154236" height="626" src="https://pytorch.org/wp-content/uploads/2026/08/TorchTitan-FP8-training-software-stack-on-ROCm-1024x626.png" width="1024" /></span></i><em><span style="font-weight: 400;">Figure 2: The TorchTitan FP8 training software stack on ROCm. AMD&#8217;s upstream contributions span TorchAO (FP8 dtype support, Triton kernel optimizations) and TorchTitan (MFU fixes, loss baselines, scaling recipes)</span></em></p>
<p><span style="font-weight: 400;">The TorchAO library initially did not support the same numerical format as AMD so it was computing scales against a different max value. On AMD Instinct GPU, where e4m3fnuz has a max of 240, this produced silently wrong results: tensors were scaled into a range that exceeded the hardware&#8217;s representable values, clipping activations and corrupting gradients. Because e4m3fnuz has no NaN/Inf encodings, the overflow did not raise an error; it degraded model quality instead. Selecting the correct format is therefore a correctness requirement, not a tuning option. We added hardware auto-detection so TorchAO selects the correct format automatically. Getting there took a cluster of format-correctness fixes across TorchAO and TorchTitan:</span></p>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">Auto-detect the platform and select the correct FP8 dtype and max value, instead of hardcoding NVIDIA e4m3fn: TorchAO </span><a href="https://github.com/pytorch/ao/pull/1142"><span style="font-weight: 400;">#1142</span></a><span style="font-weight: 400;">, </span><a href="https://github.com/pytorch/ao/pull/1150"><span style="font-weight: 400;">#1150</span></a><span style="font-weight: 400;">, </span><a href="https://github.com/pytorch/ao/pull/2225"><span style="font-weight: 400;">#2225</span></a></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Report correct MI300X peak FLOPS so MFU numbers are accurate : TorchTitan </span><a href="https://github.com/pytorch/torchtitan/pull/920"><span style="font-weight: 400;">#920</span></a></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Add platform-specific loss baselines for FNUZ numerics : TorchTitan </span><a href="https://github.com/pytorch/torchtitan/pull/2156"><span style="font-weight: 400;">#2156</span></a></li>
</ul>
<p><span style="font-weight: 400;">FP8 scaling can be applied at different granularities: a single scale per tensor (tensorwise, fastest but coarsest), a scale per row (rowwise, better accuracy), per fixed-size tile (blockwise), or per group packed alongside the data (MXFP8). TorchAO and TorchTitan support all four strategies. For AMD GPUs, we ensured each quantization strategy works correctly with AMD specific numerics and contributed blockwise kernel support for MI300 and MI350 GPUs (</span><a href="https://github.com/pytorch/ao/pull/3996"><span style="font-weight: 400;">#3996</span></a><span style="font-weight: 400;">).</span></p>
<h2><b>Scaling FP8 to MoE Architectures</b></h2>
<p><span style="font-weight: 400;">Mixture-of-Experts (MoE) models like DeepSeek V3 and Llama 4 route each token to a subset of experts, producing variable-size batches that must be processed through a grouped GEMM (Figure 3). Unlike dense models, where every linear layer has the same shape, grouped GEMM requires per-row scales on activations, per-expert-column scales on weights, and an offset tensor routing rows to the correct expert.</span></p>
<p><span style="font-weight: 400;">We enabled FP8 grouped GEMM on ROCm by adapting the quantization pipeline to use the correct dtype and dispatch for AMD via the Composable Kernel backend (#3955).</span></p>
<p><i><span style="font-weight: 400;"><img alt="MoE FP8 grouped GEMM pipeline on ROCm" class="alignnone size-large wp-image-154237" height="412" src="https://pytorch.org/wp-content/uploads/2026/08/MoE-FP8-grouped-GEMM-pipeline-on-ROCm-1024x412.png" width="1024" /></span></i><em><span style="font-weight: 400;">Figure 3: MoE FP8 grouped GEMM pipeline on ROCm. (A) Tokens are routed to experts via offsets, quantized by fused Triton kernels, and dispatched through Composable Kernel in a single launch. (B) Grouped GEMM requires per-row, per-expert-column scales and offset-based routing, which is more complex than dense GEMM uniform scaling.</span></em></p>
<h2><b>Triton Kernel Optimization</b></h2>
<p><span style="font-weight: 400;">With correctness established, we turned to performance. The FP8 quantization pipeline in TorchAO converts tensors to FP8 through a multi-step chain:</span></p>
<ol>
<li style="font-weight: 400;"><span style="font-weight: 400;">Compute per-row/column absolute max (absmax)</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Derive the scale factor and apply it</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Clamp and cast to FP8</span></li>
</ol>
<p><span style="font-weight: 400;">Each step is a separate kernel launch, and materializes an intermediate tensor to High Bandwidth Memory (HBM) between steps. For MoE models with dozens of expert weight tensors per layer, these extra round-trips dominate the FP8 overhead. On these shapes, FP8 quantization is memory-bound: the 8-bit math is cheap, but the kernel launches and HBM round-trips around it are not. The optimizations below reduce data movement rather than arithmetic, at three levels of granularity: launching fewer kernels (Level 1), making each remaining kernel move memory efficiently (Level 2), and removing unnecessary low-level synchronization (Level 3).</span></p>
<p><b>Level 1: Launch fewer kernels:</b></p>
<p><b>Backward pass:</b></p>
<p><span style="font-weight: 400;"> Figure 4 illustrates how fp8 quantization was improved through fusion. The backward pass had two compounding problems. First, a </span><span style="font-weight: 400;">.t().contiguous().t()</span><span style="font-weight: 400;"> pattern forced a full tensor copy through HBM to convert weight layout for GEMM compatibility. We removed these redundant copies in </span><a href="https://github.com/pytorch/ao/pull/3972"><span style="font-weight: 400;">#3972</span></a><span style="font-weight: 400;">. Second, the multi-step scale-and-cast chain launched separate kernels with intermediate tensors materialized to HBM between them. We fused this chain into single Triton kernels in multiple places (</span><a href="https://github.com/pytorch/ao/pull/4069"><span style="font-weight: 400;">#4069</span></a><span style="font-weight: 400;">). On 8xMI300X GPUs with DeepSeek-MoE-16B, these backward fusions delivered a 4.2x backward pass throughput improvement.</span></p>
<p><i><span style="font-weight: 400;"><img alt="Backward-pass FP8 quantization before and after optimization" class="alignnone size-large wp-image-154238" height="689" src="https://pytorch.org/wp-content/uploads/2026/08/Backward-pass-FP8-quantization-before-and-after-optimization-1024x689.png" width="1024" /></span></i><em><span style="font-weight: 400;">Figure 4: Backward-pass FP8 quantization before and after optimization. The upstream code launches five generic kernels per quantization call with a redundant transpose copy, materializing intermediate tensors to HBM between each. PR </span><a href="https://github.com/pytorch/ao/pull/3972"><span style="font-weight: 400;">#3972</span></a><span style="font-weight: 400;"> eliminates the transpose, and PR </span><a href="https://github.com/pytorch/ao/pull/4069"><span style="font-weight: 400;">#4069</span></a><span style="font-weight: 400;"> fuses the remaining chain into a single kernel with a companion dual-kernel for simultaneous grad_output + activation quantization.</span></em></p>
<p><b>Forward pass:</b></p>
<p><span style="font-weight: 400;">The same multi-kernel pattern applied to the forward path. Quantizing expert weights launched five generic kernels per call, and with 24 calls per step, this added ~90 ms/step of overhead. We replaced the entire chain with a single fused Triton kernel (</span><a href="https://github.com/pytorch/ao/pull/4311"><span style="font-weight: 400;">#4311</span></a><span style="font-weight: 400;">) that parallelizes across both experts and output-dimension blocks (Figure 5). Collapsing five launches into one also let the surrounding GEMMs issue sooner. On 8x MI325X GPU with DeepSeek-V3 671B: this change delivered a 17% end-to-end throughput improvement (5,996 → 7,027 tok/s).   </span></p>
<table>
<thead>
<tr>
<th><span style="font-weight: 400;">FP8 forward before optimization </span></th>
</tr>
</thead>
<tbody>
<tr>
<td><img alt="FP8 forward before optimization" class="alignnone size-full wp-image-154239" height="454" src="https://pytorch.org/wp-content/uploads/2026/08/FP8-forward-before-optimization.png" width="927" /></td>
</tr>
<tr>
<td><span style="font-weight: 400;">Fused FP8 forward</span></td>
</tr>
<tr>
<td><img alt="Fused FP8 forward" class="alignnone size-large wp-image-154240" height="397" src="https://pytorch.org/wp-content/uploads/2026/08/Fused-FP8-forward-1024x397.png" width="1024" /></td>
</tr>
</tbody>
</table>
<p><em><span style="font-weight: 400;">Figure 5: Perfetto trace comparison (8xMI325X GPU, DeepSeek-V3 671B). Left: FP8 (before forward optimization) showing the 5-kernel eager chain repeated across experts. Right: fused FP8 (after optimization) showing a single </span><span style="font-weight: 400;">triton_fp8_colwise_3d_scale_and_cast</span><span style="font-weight: 400;"> kernel replacing the chain. Performance in forward goes from ~19 ms to ~7 ms</span></em></p>
<p><em><span style="font-weight: 400;"><img alt="Per-category GPU time breakdown across three configurations" class="alignnone size-large wp-image-154241" height="499" src="https://pytorch.org/wp-content/uploads/2026/08/Per-category-GPU-time-breakdown-across-three-configurations-1024x499.png" width="1024" />Figure 6: Per-category GPU time breakdown across three configurations on 8xMI325X GPU with DeepSeek-V3 671B (4-layer MoE). The FP8 upstream configuration (V2) adds 127 ms/step, 92% of which lands in &#8220;Others&#8221; (generic quantization kernels). The fused Triton kernel (V4) eliminates most of this overhead, recovering 89% of the BF16→FP8 gap.</span></em></p>
<p><b>Level 2: Make each kernel move memory efficiently:</b><span style="font-weight: 400;"> The colwise scales kernel used in the backward pass had non-coalesced memory writes (</span><a href="https://github.com/pytorch/ao/pull/4113"><span style="font-weight: 400;">#4113</span></a><span style="font-weight: 400;">): consecutive SIMD lanes wrote to addresses K bytes apart, each triggering a separate memory transaction. We fixed this by transposing the output tile through LDS (Local Data Share) before storing, and added a fused single-pass variant that eliminates a redundant HBM read. On an MI300X GPU with DeepSeek-V3 671B shapes: 7,290μs → 1,170μs per MoE layer (</span><b>6.2x speedup</b><span style="font-weight: 400;">).</span></p>
<p><b>Level 3: Strip synchronization the hardware never needed:</b><span style="font-weight: 400;"> We also addressed hardware-level inefficiencies. Triton&#8217;s atomic operations (</span><span style="font-weight: 400;">atomic_add</span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">atomic_max</span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">atomic_min</span><span style="font-weight: 400;">) default to acquire-release memory ordering, which on AMD GPU inserts memory fences before and after every atomic, which are expensive synchronization points that are unnecessary for commutative reductions. We switched these to relaxed ordering on AMD GPU (</span><a href="https://github.com/pytorch/ao/pull/3945"><span style="font-weight: 400;">#3945</span></a><span style="font-weight: 400;">), guarded by a </span><span style="font-weight: 400;">torch.version.hip</span><span style="font-weight: 400;"> check so NVIDIA behavior is unchanged.</span></p>
<p><b>What didn&#8217;t work: autotuning the search space.</b><span style="font-weight: 400;"> We expanded the Triton autotune search space for MoE FP8 kernels from 1 to 8–16 candidate configurations (</span><a href="https://github.com/pytorch/ao/pull/3952"><span style="font-weight: 400;">#3952</span></a><span style="font-weight: 400;">), expecting the wider search to find faster tile sizes on AMD wavefront-based architecture. However,  benchmarking on Llama 4 shapes on MI300X GPU showed no measurable improvement, and the extra configs increased first-iteration compile time. We reverted it (</span><a href="https://github.com/pytorch/ao/pull/4024"><span style="font-weight: 400;">#4024</span></a><span style="font-weight: 400;">). The takeaway: autotuning search spaces should be shaped by hardware constraints (wavefront size, LDS capacity, register pressure), not expanded to more candidates by default.</span></p>
<p><span style="font-weight: 400;">Attacking data movement at all three levels compounds on top of the baseline FP8 throughput gains shown in Figure 1. On DeepSeek-V3 671B shapes, the forward-pass kernel fusion alone recovered 89% of the quantization overhead (5,996 → 7,027 tok/s vs 7,156 BF16 baseline on 8xMI325X GPU), and the colwise scales optimization delivered a 6.2× speedup per MoE layer.</span></p>
<h2><b>Summary and Next Steps</b></h2>
<p><span style="font-weight: 400;">This blog described how we optimized FP8 training on AMD Instinct GPUs across TorchAO and TorchTitan: kernel speedups, numerical stability fixes, and support for MoE architectures. </span></p>
<p><span style="font-weight: 400;">Work continues on next-generation hardware. We are developing MXFP8 grouped GEMM and quantization kernels for forward and backward passes on MI355X GPUs; results will follow in a future blog. The kernel fusion pipeline (#3972 → #4069 → #4113 → #4311) continues with further Triton optimizations.</span></p>
<p><span style="font-weight: 400;">These FP8 gains are now available in the standard PyTorch training stack: teams with AMD Instinct GPUs get them by upgrading TorchAO and TorchTitan, with nothing AMD-specific to install. This work was a collaboration between AMD and Meta/PyTorch engineers. All contributions have been merged into mainline pytorch/ao and pytorch/torchtitan, ensuring that FP8 training on AMD GPUs works out of the box for the broader PyTorch community.</span></p>
<h2><b>Additional Resources</b></h2>
<ul>
<li style="font-weight: 400;"><a href="https://github.com/pytorch/ao/tree/main/torchao/float8"><span style="font-weight: 400;">TorchAO float8 README</span></a><span style="font-weight: 400;">, including benchmark reproduction instructions</span></li>
<li style="font-weight: 400;"><a href="https://github.com/pytorch/torchtitan"><span style="font-weight: 400;">TorchTitan</span></a></li>
<li style="font-weight: 400;"><a href="https://rocm.docs.amd.com/en/latest/what-is-rocm.html"><span style="font-weight: 400;">AMD ROCm Documentation</span></a><span style="font-weight: 400;">: Learn more about the ROCm software stack</span></li>
<li style="font-weight: 400;"><a href="https://www.amd.com/en/developer/ai-dev-program.html?utm_source=Pytorch&amp;utm_medium=pytorch-blog&amp;utm_campaign=adp-aig&amp;utm_id=adp-aig&amp;utm_content=aig-blog"><span style="font-weight: 400;">AMD AI Developer Program</span></a><span style="font-weight: 400;">: </span><span style="font-weight: 400;">Access free cloud GPU resources and developer tools to get started with ROCm and PyTorch on AMD Instinct GPUs</span></li>
</ul>