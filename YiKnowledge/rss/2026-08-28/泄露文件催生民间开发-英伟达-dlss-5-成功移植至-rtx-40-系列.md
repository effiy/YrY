---
title: 泄露文件催生民间开发，英伟达 DLSS 5 成功移植至 RTX 40 系列
tags:
- IT之家
category: life/lifestyle
created: '2026-08-29'
source: https://www.ithome.com/0/995/821.htm
type: rss
source_name: IT之家
source_url: https://www.ithome.com/rss/
published: Fri, 28 Aug 2026 16:02:23 GMT
---

<p>IT之家 8 月 29 日消息，据 Tom's Hardware 今日报道，在 DLSS 5 的 <span class="link-text-start-with-http">nvngx_dlssnr.dll</span> 文件泄露后，有开发者尝试将这项技术移植到更多游戏中。</p><p>此前，相关开发者已经成功让 DLSS 5 在《控制》中运行，目前又进一步扩展到了其他游戏。</p><p style="text-align: center;"><img class="no-alt-img" src="https://img.ithome.com/newsuploadfiles/2026/8/fab0dd86-db4e-468e-82c2-c9408b06c9f3.jpg?x-bce-process=image/format,f_auto" /></p><p>此次泄露的文件来自《NBA 2K27》抢先体验版本，其中包含用于启用神经渲染功能的新文件。RenoDX Discord 社区目前成为相关移植工作的主要讨论和开发场所，开发者利用 ReShade 与 RenoDX 对相关文件进行加载，从而在其他游戏中激活神经渲染功能。</p><p>不过，当前泄露版本存在明显的硬件限制，原始 <span class="link-text-start-with-http">nvngx_dlssnr.dll</span> 仅能运行于采用 Blackwell 架构的 RTX 50 系列显卡。值得注意的是，其中使用的 AI 模型采用 FP8 数据格式，而 Ada Lovelace 架构本身具备读取和执行 FP8 的能力，因此硬件架构并非唯一限制因素。</p><p style="text-align: center;"><img class="no-alt-img" src="https://img.ithome.com/newsuploadfiles/2026/8/99ddcab5-0f8e-4454-a3aa-5c2a1a7ce7d2.jpg?x-bce-process=image/format,f_auto" /></p><p>根据 TechPowerUp 的解释，问题主要出在部分 CUDA 二进制代码只能由 Blackwell GPU 执行。由于这些二进制文件并未针对上一代架构进行适配，导致原始 DLL 无法直接运行在 RTX 40 系列显卡上。</p><p>随后，RTX Remix 模组作者“Uncle Burrito”对 DLL 文件进行了修改，通过识别其中不兼容 Ada Lovelace 的 CUDA 二进制代码，并替换为能够在 Ada 架构上运行的版本，使 DLSS 5 得以运行。</p><p>Uncle Burrito 表示，其主要工作是检查 DLL 实际调用的二进制文件，找出与 Ada 架构不兼容的部分，然后自行替换为新的兼容版本。他认为，《NBA 2K27》中的 <span class="link-text-start-with-http">nvngx_dlssnr.dll</span> 很可能属于早期开发版本，因此当时可能尚未针对 Ada Lovelace 构建对应的二进制文件。</p><p>随后，Tom's Hardware 使用英伟达 GeForce RTX 4080 对该补丁进行了验证，确认修改后的版本能够在 Ada Lovelace 硬件上运行。目前，RenoDX Discord 社区中的其他开发者也开始制作更多版本的补丁。</p><p>目前，英伟达是否会正式为非 Blackwell GPU 提供 DLSS 5 支持仍未确定。不过，模组作者已经证明现有 DLSS 5 文件经过适配后可以在 RTX 40 系列显卡上运行。</p><p>IT之家注：对于 RTX 30 系列 Ampere 及更早架构的显卡而言，移植难度可能更高，因为这些 GPU 并不原生支持 FP8。</p><p><strong>相关阅读：</strong></p><ul class="small-size list-paddingleft-2"><li><p>《<a href="https://www.ithome.com/0/995/197.htm" target="_blank">英伟达 DLSS-NR DLL 首度现身〈NBA 2K27〉游戏文件，体积暴增预示功能重大升级</a>》</p></li><li><p>《<a href="https://www.ithome.com/0/994/261.htm" target="_blank">NVIDIA DLSS 4.5 光线重建更新实测：提升游戏画面质感的“大杀器”</a>》</p></li><li><p>《<a href="https://www.ithome.com/0/979/861.htm" target="_blank">英伟达演示 DLSS 5 改进：3 种模型细节，场景可按需切换</a>》</p></li></ul>