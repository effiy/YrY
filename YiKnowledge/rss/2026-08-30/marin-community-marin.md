---
title: marin-community/marin
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/marin-community/marin
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Open-source framework for the research and development of foundation models.</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://marin.community">https://marin.community</a></p><hr /><h1><img align="top" alt="Marin" height="36" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/marin-logo.svg?sanitize=true" /> Marin</h1> 
<a href="https://marin.readthedocs.io/en/latest/?badge=latest"> <img alt="Documentation" src="https://readthedocs.org/projects/marin/badge/?version=latest" /> </a> 
<a href=""> <img alt="License" src="https://img.shields.io/github/license/marin-community/marin?color=blue" /> </a> 
<!--marin-intro-start--> 
<blockquote> 
 <p>"<em>I am not afraid of storms, for I am learning how to sail my ship.</em>"<br /> – Louisa May Alcott</p> 
</blockquote> 
<p><a href="https://marin.community">Marin</a> is a research program, software platform, and community for the research and development of <a href="https://en.wikipedia.org/wiki/Foundation_model">foundation models</a>.</p> 
<p>Marin's concern is training large language models. This includes data curation, transformation, filtering, tokenization, pretraining, posttraining, and evaluation. Beyond the artifacts, software, and infrastructure, behind these models, Marin is committed to openly sharing <em>all</em> of the process knowledge required to build these models.</p> 
<p>Marin's core value is <strong><a href="https://openathena.ai/blog/open-development-of-frontier-ai/">open development</a></strong>. We document our processes, experiments, and decisions as they happen. Every step, from raw data to the final model, is recorded. Failed experiments are part of that record.</p> 
<p>Marin has also been used for building <a href="https://github.com/marin-community/marin/issues/1699">audio-text models</a>, <a href="https://github.com/Open-Athena/marin-dna">DNA</a>, and <a href="https://github.com/Open-Athena/MarinFold">protein models</a>. We encourage this work through the use of Marin as a library, in <a href="https://github.com/marin-community/marin-experiments">marin/experiments</a>.</p> 
<h2>Current work</h2> 
<h3>Frontier mixture-of-experts</h3> 
<p>Our current focus is pretraining, from scratch, and posttraining a large (5e24 model-FLOPs, 500 billion+ total parameters) mixture-of-experts model to succeed on tasks of importance to scientists and researchers.</p> 
<h3>Scaling suite</h3> 
<p><a href="https://openathena.ai/blog/delphi/">Delphi</a> is Marin's open scaling suite scaling a LLM recipe from 3e18 to 1e23 FLOPs, inspired by <a href="https://github.com/eleutherai/pythia">Pythia</a>. It has three parts: a scaling recipe that maps compute budgets to model configurations, a scaling suite trained from that recipe on the Google TPU Research Cloud, and a scaling law that uses the smaller Delphi models to predict the larger ones.</p> 
<p>We released:</p> 
<ul> 
 <li><strong>Checkpoints</strong> for every run, available on Hugging Face at <a href="https://huggingface.co/collections/marin-community/delphi-69f93cbd09845c03b070bae9">marin-community/delphi</a></li> 
 <li><strong>Training mixture pipelines</strong> that deterministically reproduce the mix from the public Nemotron-CC, StarCoderData, and ProofPile 2 in the <a href="https://github.com/marin-community/marin/raw/67099b9aa5aa468155f0ce430276be72b39a3bd2/experiments/pretraining_datasets/nemotron.py">Marin repo</a></li> 
 <li><strong>Recipe code</strong> as a forkable <a href="https://github.com/marin-community/marin/raw/78ae89a5324e09ddd9d0bc39af8565da40cfb3e9/experiments/scaling_law_sweeps/completed_adamh.py#L96"><code>CompletedAdamHParams</code> class</a> in the Marin repo</li> 
 <li><strong>Development methodology</strong> as the <a href="https://github.com/marin-community/marin/raw/main/docs/recipes/add_scaling_heuristic.md"><code>add_scaling_heuristic</code> agent skill</a> in the Marin repo</li> 
 <li><strong>Plot-ready data</strong> for the Delphi figures, with one config per figure and a <code>wandb_url</code> on every row, at <a href="https://huggingface.co/datasets/marin-community/delphi-blog-data">marin-community/delphi-blog-data</a></li> 
</ul> 
<p>Progress was tracked in <a href="https://github.com/marin-community/marin/issues/1337">GitHub issue #1337</a>.</p> 
<h3>Other learnings</h3> 
<p>Some additional consolidated learnings can be found on the <a href="https://openathena.ai/blog/">Open Athena blog</a>. A selection, below:</p> 
<ul> 
 <li><a href="https://openathena.ai/blog/cluster-scheduling-with-iris/">Cluster Scheduling with Iris</a> · scheduling jobs across heterogeneous clusters</li> 
 <li><a href="https://openathena.ai/blog/pretraining-speedup/">Improving our LLM Pretraining Efficiency</a> · squeezing more throughput from pretraining</li> 
 <li><a href="https://openathena.ai/blog/delphi/">Scaling Laws That Extrapolate 300× Past the Fit (Delphi)</a> · predicting big models from small</li> 
 <li><a href="https://openathena.ai/blog/quantile-balancing/">Mixture of Experts Quantile Balancing: Validated at 32B-A5B (1e22 FLOPs) Scale</a> · keeping MoE experts load balanced</li> 
</ul> 
<h3>Other models</h3> 
<p>Previously, we used Marin to train an 8B parameter model that outperformed Llama 3.1 8B on our <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/reports/marin-8b-retro.md#base-model-results">base-model benchmark suite</a>. You can see the <a href="https://github.com/marin-community/marin/raw/ee163702c5bc71c9bbba3238db84b6ee86e826a7/experiments/tootsie/exp600_tootsie.py">training script</a> or read the <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/reports/marin-8b-retro.md">retrospective</a>. We also trained <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/reports/marin-32b-retro.md">Marin 32B</a>.</p> 
<!--marin-intro-end--> 
<h2>Learning more &amp; using Marin</h2> 
<p>The documentation for Marin is available on <a href="https://marin.readthedocs.io/en/latest/">ReadTheDocs</a> or in the <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/"><code>docs/</code></a> folder.</p> 
<!--marin-first-steps-start--> 
<p>To get started with Marin:</p> 
<ul> 
 <li><a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/tutorials/installation.md">Install</a> Marin.</li> 
 <li>Train a <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/tutorials/first-experiment.md">tiny language model</a> using Marin.</li> 
 <li>See how to run a much larger <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/tutorials/train-an-lm.md">DCLM 1B/1x</a> experiment using Marin.</li> 
 <li>See a <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/reports/index.md">summary of the experiments</a> we've run.</li> 
 <li>Join the <a href="https://discord.gg/J9CTk7pqcM">Marin Discord</a> to chat with the community.</li> 
</ul> 
<!--marin-first-steps-end--> 
<h3>Example</h3> 
<p>Marin experiments are defined as a set of steps that can depend on each other and are executed in a topological order, like a Makefile.</p> 
<p>As a brief example of how you can use Marin, here is a complete script for training a tiny model on <a href="https://huggingface.co/datasets/roneneldan/TinyStories">TinyStories</a>. You can check out the <a href="https://github.com/marin-community/marin/raw/main/experiments/tutorials/train_tiny_model.py">full script</a> for more details.</p> 
<!--marin-example-start--> 
<pre><code class="language-python">from fray.cluster import ResourceConfig
from levanter.optim import AdamConfig
from marin.execution.lazy import lower
from marin.execution.step_runner import StepRunner
from marin.experiment.data import tokenized
from marin.experiment.train import train_lm

from experiments.llama import llama_nano
from experiments.marin_tokenizer import marin_tokenizer

# 1. Tokenize the dataset as a lazy handle — nothing downloads yet.
tinystories_tokenized = tokenized(
    name="tokenized/tinystories",
    source="roneneldan/TinyStories",
    tokenizer=marin_tokenizer,
    sample_count=1000,  # cap at 1 000 samples per shard to keep the tutorial fast
)

# 2. Train the model — depends on the tokenized dataset above.
nano_tinystories_model = train_lm(
    name="checkpoints/marin-nano-tinystories",
    version="v1",
    model=llama_nano,
    optimizer=AdamConfig(learning_rate=6e-4, weight_decay=0.1),
    # Steps can depend on other steps: nano_tinystories_model depends on tinystories_tokenized
    datasets={tinystories_tokenized: 1.0},
    batch_size=4,
    seq_len=2048,
    num_train_steps=100,
    z_loss_weight=None,
    evals=None,  # no point evaluating such a tiny model
    resources=ResourceConfig.with_cpu(),
)

if __name__ == "__main__":
    StepRunner().run([lower(nano_tinystories_model)])
</code></pre> 
<p>Here, we create two steps, one for tokenizing the dataset and one for training the model. The training step depends on the tokenized dataset step, so it will be executed after the tokenization step is completed.</p> 
<!--marin-example-end--> 
<p>With slight modifications, you can extend this to train a <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/tutorials/train-an-lm.md">larger model on a larger dataset</a>, a <a href="https://raw.githubusercontent.com/marin-community/marin/main/docs/tutorials/train-an-lm.md#mixture-of-sources">mixture of datasets</a>, even scaling to very large GPU or TPU pods (or multislice TPUs!).</p> 
<h3>For Contributors</h3> 
<ul> 
 <li>See <a href="https://raw.githubusercontent.com/marin-community/marin/main/CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a> for project workflow.</li> 
 <li>See <code>.agents/skills/</code> (also <code>.claude/skills/</code>) for loadable agent skills. For example, <code>.agents/skills/add-dataset/</code> has a step-by-step guide to adding new datasets.</li> 
</ul> 
<h2>Core Contributors</h2> 
<p>Marin's core collaborators come from <a href="https://crfm.stanford.edu/">Stanford CRFM</a> and <a href="https://openathena.ai/">Open Athena</a>.</p> 
<p> <a href="https://crfm.stanford.edu/"><img alt="Stanford CRFM" height="48" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/crfm-rgb.png" /></a> &nbsp;&nbsp;&nbsp; <a href="https://openathena.ai/"><img alt="Open Athena" height="48" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/open-athena.svg?sanitize=true" /></a> </p> 
<h2>Supporters</h2> 
<p>Marin's research is made possible by the generous support of our partners.</p> 
<table> 
 <tbody>
  <tr> 
   <td align="center" width="240"><a href="https://sites.research.google/trc/about/"><img alt="Google TPU Research Cloud" height="44" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/google-trc.png" /></a></td> 
   <td align="center" width="240"><img alt="TBA" height="44" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/supporter-tba.svg?sanitize=true" /></td> 
  </tr> 
  <tr> 
   <td align="center"><sub>for TRC accelerators</sub></td> 
   <td align="center"><sub>for GPU clusters</sub></td> 
  </tr> 
  <tr> 
   <td align="center"><a href="https://www.siegelendowment.org/"><img alt="Siegel Family Endowment" height="44" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/supporter-sfe.png" /></a></td> 
   <td align="center"><a href="https://www.schmidtsciences.org/"><img alt="Schmidt Sciences" height="44" src="https://raw.githubusercontent.com/marin-community/marin/main/docs/design/supporter-schmidt-sciences.svg?sanitize=true" /></a></td> 
  </tr> 
  <tr> 
   <td align="center"><sub>for supporting development</sub></td> 
   <td align="center"><sub>for supporting development</sub></td> 
  </tr> 
 </tbody>
</table>