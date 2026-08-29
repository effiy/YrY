---
title: How to evaluate LLMs before production
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/ai-and-ml/llms/how-to-evaluate-llms-before-production/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Tue, 25 Aug 2026 21:35:11 +0000
author: Mariko Wakabayashi
---

<p class="wp-block-paragraph">A language model can perform well on a clean benchmark and still struggle with the cases that matter in production.</p>



<p class="wp-block-paragraph">Benchmarks and curated datasets are useful when prototyping an LLM-based system. They help teams compare models, test an initial prompt, and determine whether an idea is technically plausible.</p>



<p class="wp-block-paragraph">But as a system moves closer to production, the evaluation problem changes.</p>



<p class="wp-block-paragraph">Real inputs are often ambiguous. Labels may be inconsistent. Important context may be missing or truncated. The evaluation set may not reflect the production distribution. Edge cases that rarely appear in benchmarks can become common sources of failure. Even when offline metrics improve, those results may not translate cleanly into production behavior.</p>



<p class="wp-block-paragraph">We encountered these challenges while evaluating an LLM-based system designed to reduce false positives in GitHub secret scanning.</p>



<p class="wp-block-paragraph">Secret scanning identifies credentials such as tokens and keys that may have been committed to a repository. Because some candidate strings resemble secrets, but don&rsquo;t actually represent real credentials, developers may spend time investigating alerts that don&rsquo;t require remediation.</p>



<p class="wp-block-paragraph">Rather than determine whether an LLM could classify a string correctly, we needed to understand whether the system could reduce noisy alerts while preserving enough recall to remain safe for a security workflow.</p>



<p class="wp-block-paragraph">In this post, we share the practices that helped us move from promising prototype results to production. The lessons apply broadly to LLM-powered systems in code analysis, developer tools, security, data analysis, and other production workflows.</p>



<figure class="wp-block-image size-large"><img alt="Diagram titled &ldquo;The LLM evaluation lifecycle&rdquo; showing seven stages connected by arrows: product decision, representative dataset, offline evaluation, error analysis, targeted change, regression evaluation, and online experiment. A dashed feedback loop labeled &ldquo;Iterate and learn&rdquo; connects regression evaluation back to the dataset and targeted-change stages." class="wp-image-98319" height="441" src="https://github.blog/wp-content/uploads/2026/08/633085615-8fa1a231-a731-4c36-b53d-007d212d811d-1.png?resize=1024%2C441" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-1-start-with-the-product-decision-not-the-model">1. Start with the product decision, not the model</h2>



<p class="wp-block-paragraph">When an LLM system doesn&rsquo;t perform as expected, the first instinct is often to adjust its technical components.</p>



<p class="wp-block-paragraph">Teams may rewrite the prompt, add context, introduce another reasoning step, adjust the surrounding pipeline, or switch models. Before making any of these changes, they should define the decision the evaluation is meant to support.</p>



<p class="wp-block-paragraph">For our secret-scanning work, we asked:</p>



<p class="wp-block-paragraph"><em>Can the system reduce false positives while preserving enough recall to be safe in a production security workflow?</em></p>



<p class="wp-block-paragraph">To answer this question, teams must decide which mistakes are acceptable, which metrics should drive the product decision, and which guardrails must remain within their defined thresholds.</p>



<p class="wp-block-paragraph">In secret scanning, incorrectly suppressing a real credential can be more consequential than asking a developer to review an additional alert. We therefore did not treat precision and recall as equally interchangeable metrics.</p>



<p class="wp-block-paragraph">Our primary objective was to reduce false positives and improve precision. Recall served as a safety constraint: an experiment could advance only if any decrease remained within a predefined acceptable range. This gave us a clear way to evaluate tradeoffs. We selected the configuration that achieved the strongest false-positive reduction while satisfying the recall requirement and meeting our operational guardrails.</p>



<p class="wp-block-paragraph" id="h-">We organized the evaluation criteria into three levels:</p>



<h3 class="wp-block-heading" id="h-primary-outcome">Primary outcome</h3>



<p class="wp-block-paragraph">This measured the user benefit we were trying to improve:</p>



<ul class="wp-block-list">
<li>False-positive reduction</li>



<li>Precision</li>
</ul>



<h3 class="wp-block-heading" id="h-safety-constraint">Safety constraint</h3>



<p class="wp-block-paragraph">This prevented an apparent improvement from introducing unacceptable security risk:</p>



<ul class="wp-block-list">
<li>Recall</li>
</ul>



<h3 class="wp-block-heading" id="h-operational-guardrails">Operational guardrails</h3>



<p class="wp-block-paragraph">These determined whether the result was practical to deploy:</p>



<ul class="wp-block-list">
<li>Latency</li>



<li>Cost</li>



<li>Reliability</li>



<li>Production compatibility</li>
</ul>



<p class="wp-block-paragraph">This distinction prevented us from treating every metric as interchangeable. A change that reduced false positives but significantly lowered recall wasn&rsquo;t automatically an improvement. Neither was a change that improved quality while making the system too slow, expensive, or difficult to integrate.</p>



<p class="wp-block-paragraph">Consider two hypothetical experiment results:</p>



<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th><strong>Experiment</strong>&nbsp;</th><th><strong>Precision</strong>&nbsp;</th><th><strong>Recall</strong>&nbsp;</th><th><strong>Latency</strong>&nbsp;</th><th><strong>Decision</strong>&nbsp;</th></tr></thead><tbody><tr><td>Experiment A&nbsp;</td><td>Large improvement&nbsp;</td><td>Falls below the safety guardrail&nbsp;</td><td>Acceptable&nbsp;</td><td>Don&rsquo;t&nbsp;advance&nbsp;</td></tr><tr><td>Experiment B&nbsp;</td><td>Moderate improvement&nbsp;</td><td>Remains within the guardrail&nbsp;</td><td>Acceptable&nbsp;</td><td>Continue testing&nbsp;</td></tr></tbody></table></figure>



<p class="wp-block-paragraph">Experiment A may look stronger if precision is viewed in isolation. Experiment B is more aligned with the product goal because it improves the developer experience without violating the recall guardrail.</p>



<p class="wp-block-paragraph">Before evaluating an LLM system, decide what success means for the user and which guardrails the system must respect. We want to generate evidence that supports a product decision.</p>



<h2 class="wp-block-heading" id="h-2-treat-offline-evaluation-like-integration-testing">2. Treat offline evaluation like integration testing</h2>



<p class="wp-block-paragraph">An LLM-based system continues to change after its first successful evaluation, so evaluation should not be a one-time exercise. Teams revise prompts, adopt new models, change how inputs and context are constructed, and refine the surrounding business logic.</p>



<p class="wp-block-paragraph">Any of these changes can improve the system, introduce a regression, or shift its behavior in an unexpected way.</p>



<p class="wp-block-paragraph">For that reason, we treated offline evaluation similarly to an end-to-end integration test. We reran it whenever we made a meaningful change to the prompt, model, input construction, or broader system logic.</p>



<p class="wp-block-paragraph">The evaluation also needed to be repeatable enough that each new result could be compared against a known baseline. For every run, we recorded the prompt, model, dataset version, and system configuration.</p>



<p class="wp-block-paragraph">This made it possible to answer questions such as:</p>



<ul class="wp-block-list">
<li>Did the new prompt improve precision without reducing recall?</li>



<li>Did the model upgrade help across the dataset or only within certain categories?</li>



<li>Did a change to the input or context fix one error pattern while introducing another?</li>



<li>Did a change to the surrounding logic improve the result consistently, or simply shift where errors appeared?</li>
</ul>



<p class="wp-block-paragraph">Without this discipline, teams can easily compare results generated under different conditions and attribute an improvement to the wrong change.</p>



<h3 class="wp-block-heading" id="h-change-one-major-variable-at-a-time">Change one major variable at a time</h3>



<p class="wp-block-paragraph">Repeatability alone is not enough. Experiments also need to be designed so that the cause of a result is clear.</p>



<p class="wp-block-paragraph">We changed one major variable at a time and compared each run against a known baseline. For example, we evaluated a prompt revision separately from a model upgrade before testing the two together.</p>



<p class="wp-block-paragraph">This mattered because even small prompt changes could shift model behavior, while a model upgrade could affect quality, cost, latency, or output consistency. If both changed in the same experiment, we would not know which one caused the improvement or regression.</p>



<p class="wp-block-paragraph">We treated prompts and evaluation configurations like code. We versioned them, recorded what changed, kept previous configurations reproducible, and made rollback possible.</p>



<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th><strong>Run ID</strong>&nbsp;</th><th><strong>Prompt version</strong>&nbsp;</th><th><strong>Model version</strong>&nbsp;</th><th><strong>Precision</strong>&nbsp;</th><th><strong>Recall</strong>&nbsp;</th><th><strong>Latency</strong>&nbsp;</th><th><strong>Notes</strong>&nbsp;</th></tr></thead><tbody><tr><td>R-001&nbsp;</td><td>v1&nbsp;</td><td>Model A&nbsp;</td><td>0.71&nbsp;</td><td>0.78&nbsp;</td><td>1.2s&nbsp;</td><td>Baseline&nbsp;</td></tr><tr><td>R-002&nbsp;</td><td>v2&nbsp;</td><td>Model A&nbsp;</td><td>0.75&nbsp;</td><td>0.77&nbsp;</td><td>1.2s&nbsp;</td><td>Prompt-only change&nbsp;</td></tr><tr><td>R-003&nbsp;</td><td>v1&nbsp;</td><td>Model B&nbsp;</td><td>0.74&nbsp;</td><td>0.80&nbsp;</td><td>1.0s</td><td>Model-only change&nbsp;</td></tr></tbody></table></figure>



<p class="wp-block-paragraph"><em>The values in the evaluation run tracking table above shown are hypothetical and included only to illustrate how evaluation runs can be tracked and compared.</em></p>



<h3 class="wp-block-heading" id="h-test-model-upgrades-regularly">Test model upgrades regularly</h3>



<p class="wp-block-paragraph">When an LLM system underperforms, developers often respond by adding more instructions to the prompt. Sometimes that helps, but not always. For example, the prompt may be carrying complexity that comes from the model itself.</p>



<p class="wp-block-paragraph">A stronger model may perform better with a simpler prompt than an older model does with extensive tuning. Simpler prompts are also easier to understand, test, and maintain.</p>



<p class="wp-block-paragraph">Model upgrades still need careful evaluation. A new model may improve performance in one category while introducing regressions elsewhere. It may also affect cost, latency, output formatting, or compatibility with the existing pipeline.</p>



<p class="wp-block-paragraph">The evaluation process should be inexpensive and repeatable enough that testing a new model becomes routine. Any meaningful change to the prompt, model, or pipeline should go through offline evaluation before reaching production.</p>



<h2 class="wp-block-heading" id="h-3-keep-offline-evaluation-close-to-production">3. Keep offline evaluation close to production</h2>



<p class="wp-block-paragraph">An offline evaluation is only useful when it resembles the task the system will perform in production.</p>



<p class="wp-block-paragraph">In a secret-scanning workflow, the model is rarely evaluating one clean, isolated value. It may need to assess a specific candidate alongside surrounding code and other information that is relevant, incomplete, or potentially distracting. Differences in how that information is presented can materially affect the result.</p>



<p class="wp-block-paragraph">Our offline evaluation therefore needed to preserve the important characteristics of the production task, including:</p>



<ul class="wp-block-list">
<li>The candidate being evaluated</li>



<li>The surrounding context available to the model</li>



<li>Relevant supporting information</li>



<li>The way inputs are formatted and constrained</li>



<li>The broader system logic around the model</li>
</ul>



<p class="wp-block-paragraph">Even small differences can skew the results. A cleaner dataset may exclude ambiguous cases, provide more complete context, or remove nearby values that could distract the model.</p>



<p class="wp-block-paragraph">Consider a simplified example:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>example_token = "sample_value_for_documentation" 
production_api_key = get_secret_from_environment() 
candidate_value = "flagged_value"</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Suppose <code>candidate_value</code> is the value the system is expected to assess. The model may instead focus on <code>example_token</code> because its variable name appears more security-relevant, producing a plausible explanation about the wrong value.</p>



<p class="wp-block-paragraph">This kind of failure is easy to miss when evaluation examples contain only one obvious candidate. It surfaced because the offline evaluation preserved some of the ambiguity and distractions found in real secret-scanning workflows.</p>



<p class="wp-block-paragraph">The closer the offline pipeline is to the production pipeline, the more useful the evaluation becomes. When the two differ, a strong offline score may simply reflect an easier problem than the one being deployed.</p>



<h2 class="wp-block-heading" id="h-4-treat-production-labels-as-signals-not-unquestionable-truth">4. Treat production labels as signals, not unquestionable truth</h2>



<p class="wp-block-paragraph">Production data can make an evaluation more representative, but its labels often capture workflow outcomes rather than reliable ground truth. A dismissed or resolved secret-scanning alert, for example, does not necessarily represent a false positive.</p>



<p class="wp-block-paragraph">A developer might resolve an alert because:</p>



<ul class="wp-block-list">
<li>The credential was rotated</li>



<li>The risk was accepted</li>



<li>The alert needed to be cleared to unblock a workflow</li>



<li>The alert was incorrectly classified</li>
</ul>



<p class="wp-block-paragraph">These outcomes may look similar in product data while representing different ground-truth states.</p>



<p class="wp-block-paragraph">Before using production labels, ask:</p>



<ul class="wp-block-list">
<li>How was the label created?</li>



<li>Does it match the question the evaluation is trying to answer?</li>



<li>Are different workflow outcomes being grouped into the same category?</li>
</ul>



<p class="wp-block-paragraph">For important or ambiguous subsets, you may need to complete a manual review. You&rsquo;re not trying to eliminate every imperfect label, but you need to make sure the evaluation data is accurate enough to support the decision being made.</p>



<h2 class="wp-block-heading" id="h-5-use-synthetic-and-open-datasets-to-fill-coverage-gaps">5. Use synthetic and open datasets to fill coverage gaps</h2>



<p class="wp-block-paragraph">Representative production data may be limited, sensitive, or unavailable early in development. Synthetic examples, academic benchmarks, and open datasets can help developers bootstrap an evaluation and expand coverage, but these examples should supplement rather than stand in for production-like data.</p>



<p class="wp-block-paragraph">With that in mind, synthetic examples can greatly help fill in the gaps for testing cases that are rare or difficult to collect, such as ambiguous inputs, missing context, unusual formatting, and underrepresented failure patterns. A list of credential strings, for example, can test whether a model recognizes common formats, but it cannot fully evaluate how the model reasons about a candidate within real code.</p>



<p class="wp-block-paragraph">We adapted external examples to match our task and reviewed labels that did not align with our product definition. We also used realistic failure patterns to create targeted synthetic cases involving nearby credential-like values, test code, placeholders, indirect references, and missing context.</p>



<h2 class="wp-block-heading" id="h-6-use-error-analysis-to-find-what-aggregate-metrics-hide">6. Use error analysis to find what aggregate metrics hide</h2>



<p class="wp-block-paragraph">Aggregate metrics tell you whether a system improved overall. Error analysis tells you what to change next.</p>



<p class="wp-block-paragraph">A higher precision score doesn&rsquo;t reveal whether the remaining errors come from ambiguous inputs, poor prompt framing, missing context, noisy labels, or a narrow dataset.</p>



<p class="wp-block-paragraph">To understand those problems, inspect the failures.</p>



<p class="wp-block-paragraph">We reviewed samples of false positives and false negatives and grouped them by their likely source: the model, prompt, input, pipeline, dataset, or label. The recurring issues included several already discussed, such as reasoning about the wrong candidate, missing context, and labels that did not match the evaluation definition.</p>



<p class="wp-block-paragraph">Each category suggested a different response. Reasoning about the wrong value pointed to prompt or input framing, missing evidence pointed to context construction, and incorrect labels required data cleanup. Repeated domain-specific ambiguity could indicate the need for a clearer product policy or a dedicated evaluation category.</p>



<p class="wp-block-paragraph">Manually reviewing dozens or hundreds of examples takes time, but it often leads to faster progress. Once a recurring failure pattern is clear, the team can make a targeted change and measure whether it solved the problem.</p>



<p class="wp-block-paragraph">A useful question for each error is: <em>Did this failure come from the model, prompt, input, pipeline, dataset, or label?</em></p>



<p class="wp-block-paragraph">That classification turns a vague quality problem into a concrete engineering task.</p>



<h2 class="wp-block-heading" id="h-7-use-llm-as-judge-to-focus-human-review">7. Use LLM-as-judge to focus human review</h2>



<p class="wp-block-paragraph">Reviewing every evaluation example manually may not scale. LLM-as-judge can reduce that burden by classifying clear cases, identifying potentially mislabeled examples, and prioritizing ambiguous cases for human review. Because the judge can also make mistakes or agree with another model for the wrong reason, its output should be treated as another prediction rather than ground truth.</p>



<p class="wp-block-paragraph">A safer pattern is to use the judge for triage:</p>



<ol class="wp-block-list">
<li>Automatically process clear, low-risk cases.</li>



<li>Route low-confidence, conflicting, or high-impact cases to human reviewers.</li>



<li>Periodically sample high-confidence cases to check for systematic errors.</li>



<li>Track disagreement between the judge, the evaluated system, and human reviewers.</li>



<li>Version and evaluate the judge prompt like any other model component.</li>
</ol>



<p class="wp-block-paragraph">Used this way, the judge concentrates human attention on the cases where review is most likely to change the outcome.</p>



<figure class="wp-block-image size-large"><img alt="Diagram titled &ldquo;Human review triage funnel.&rdquo; All evaluation examples enter the funnel and are sorted into four groups: clear agreement, low confidence, model and label disagreement, and high-impact cases. Clear-agreement examples move to automated processing, while the other three groups go to human review for outcome decisions and label correction. Reviewed examples, corrected labels, and new test cases feed back into the evaluation dataset." class="wp-image-98320" height="692" src="https://github.blog/wp-content/uploads/2026/08/633087173-78b05bce-4a6d-4730-a35a-968bc56ec8a8.png?resize=1024%2C692" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-8-what-secret-scanning-taught-us">8. What secret scanning taught us</h2>



<p class="wp-block-paragraph">Our goal was to reduce false positives while preserving recall in a security-sensitive workflow. Offline evaluation gave us a controlled way to compare prompt, model, input, and pipeline changes before beginning online experimentation.</p>



<p class="wp-block-paragraph">Through repeated evaluation and targeted error analysis, we reached a 95% reduction in false positives on the evaluated offline dataset while keeping recall within our defined guardrail. More importantly, we understood how the result had been produced: the evaluation reflected the production task more closely, changes were measured against reproducible baselines, and the remaining failure patterns were documented.</p>



<p class="wp-block-paragraph">Offline evaluation did not prove how the system would behave in every production scenario. It provided enough structured evidence to justify moving to online experimentation with clearly understood risks and guardrails.</p>



<h2 class="wp-block-heading" id="h-checklist-before-moving-an-llm-system-toward-production">Checklist: Before moving an LLM system toward production</h2>



<p class="wp-block-paragraph">Use this checklist to assess whether your evaluation provides enough evidence to move the system forward. Work through each section to confirm that the goals, data, experiments, and remaining production risks are clearly understood.</p>



<p class="wp-block-paragraph"><strong>Product Goals</strong></p>



<ul class="wp-block-list">
<li>Is the product decision and primary success metric clear?</li>



<li>Are the safety and operational guardrails defined?</li>
</ul>



<p class="wp-block-paragraph"><strong>Data and Labels</strong></p>



<ul class="wp-block-list">
<li>Does the evaluation data resemble the production workflow and include difficult cases?</li>



<li>Do we understand how the labels were created and where human review is needed?</li>
</ul>



<p class="wp-block-paragraph"><strong>Evaluation Rigor</strong></p>



<ul class="wp-block-list">
<li>Are the prompt, model, dataset, and pipeline versions recorded?</li>



<li>Are major changes isolated and compared against a known baseline?</li>
</ul>



<p class="wp-block-paragraph"><strong>Error Analysis and Production Readiness</strong></p>



<ul class="wp-block-list">
<li>Have false positives and false negatives been reviewed by category?</li>



<li>Can we rerun the evaluation and explain where offline results may differ from production?</li>
</ul>



<h2 class="wp-block-heading" id="h-evaluate-before-you-trust">Evaluate before you trust</h2>



<p class="wp-block-paragraph">As LLM-based systems move into production, evaluation should become part of the regular engineering workflow. A strong offline evaluation can show whether the product goal has been met under representative conditions, where uncertainty remains, and whether the system is ready for a controlled production rollout.</p>



<p class="wp-block-paragraph">Production uncertainty is unavoidable. Evaluation makes it visible, measurable, and manageable.</p>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><a href="https://docs.github.com/code-security/concepts/secret-security/secret-scanning">Explore secret scanning documentation &gt;</a></p>
</div>

<p>The post <a href="https://github.blog/ai-and-ml/llms/how-to-evaluate-llms-before-production/">How to evaluate LLMs before production</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>