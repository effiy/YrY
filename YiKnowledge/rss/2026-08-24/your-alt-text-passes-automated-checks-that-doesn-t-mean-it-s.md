---
title: Your alt text passes automated checks. That doesn’t mean it’s any good.
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/engineering/user-experience/your-alt-text-passes-automated-checks-that-doesnt-mean-its-any-good/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Mon, 24 Aug 2026 20:56:32 +0000
author: Taarik Ashenafi
---

<p class="wp-block-paragraph">More than one in four images on the web&rsquo;s most popular home pages have alt text that&rsquo;s missing, vague, or copied from adjacent images.</p>



<p class="wp-block-paragraph">That&rsquo;s from WebAIM&rsquo;s 2026 <a href="https://webaim.org/projects/million/#alttext">WebAIM Million</a> report, which found that alt text,an HTML attribute containing text describing the content of an image,  was missing on 16.2% of images across the top million home pages. Among the images that <em>did</em> have alt text, another 10.8% provided an undescriptive attribute, such as <code>alt="image"</code>, a raw filename, or a description duplicated from a neighbor.</p>



<p class="wp-block-paragraph">While automated tooling reliably flags missing alt text, it isn&rsquo;t as good at fixing poorly written alt text. Most alt text checkers test whether an accessible name for an image exists, not whether the provided alt text says anything useful about the associated image, and that&rsquo;s a deliberate design choice: a quality-oriented rule with false positives is a rule teams switch off. So <code>alt="IMG_2847.png"</code> passes. So does the same <code>alt="3/5 stars"</code> on five different star-shaped icons.</p>



<p class="wp-block-paragraph">We built an <a href="https://github.com/github/accessibility-scanner-alt-text-plugin">alt text plugin</a> for the <a href="https://github.com/github/accessibility-scanner">GitHub Accessibility Scanner</a> to help improve your alt text. This post covers where we drew the line between what a checker can prove and what it can only suspect, why our worst bug turned out to be a layout problem rather than a parsing one, and what changed once we let a model into the loop.</p>



<p class="wp-block-paragraph">If you&rsquo;re building automated checks of your own, for accessibility or otherwise, the tradeoffs should transfer.</p>



<h2 class="wp-block-heading" id="h-proving-a-string-is-wrong-without-seeing-the-picture">Proving a string is wrong without seeing the picture</h2>



<p class="wp-block-paragraph">Presence of alt text is an objective fact; the attribute is there or it isn&rsquo;t. Quality is often a judgment call. A machine can&rsquo;t <em>prove</em> whether a sentence adequately describes a picture in context from markup.</p>



<p class="wp-block-paragraph">However, not all quality is subjective. There&rsquo;s several checks you can perform based on the alt text alone, with no need to consult the image content:</p>



<ul class="wp-block-list">
<li>The attribute is absent (not empty) or whitespace-only.</li>



<li>The alt is a filename, such as <code>hero.png</code>, <code>IMG_2847.jpg</code>.</li>



<li>The alt is a placeholder somebody meant to replace, such as <code>TODO</code>, <code>tbd</code>.</li>



<li>The alt is one generic word naming the medium instead of the content, such as <code>image</code>, <code>logo</code>, <code>chart</code>.</li>



<li>The same alt repeats across adjacent images.</li>
</ul>



<p class="wp-block-paragraph">Every one of those is a claim about a string, and that became our dividing line. Five deterministic rules run by default which need no credentials for running AI models or network calls. One opt-in rule calls a model with provided image content and surrounding context, for judgments an alt text string can&rsquo;t support on its own.</p>



<p class="wp-block-paragraph">First, we had to determine which images to judge on a scanned webpage. We use Playwright&rsquo;s role-based locator rather than <code>querySelectorAll('img')</code>, so anything not included in the browser&rsquo;s <a href="https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree">accessibility tree</a> drops out, including anything carrying <code>alt=""</code>. That last exclusion matters most. An empty alt is the author explicitly saying the image is decorative, and flagging it would punish exactly the behavior you want to encourage.</p>



<p class="wp-block-paragraph">So, how strict should it be? A quality checker lives or dies on false positives, so we chose closed sets over clever heuristics. The vague-alt rule normalizes a string, then checks it against a curated list of words that carry no information on their own. It fires only on an exact match:</p>



<ul class="wp-block-list">
<li><code>alt="image"</code> gets flagged.</li>



<li><code>alt="image of the login screen with the SSO button highlighted"</code> doesn&rsquo;t.</li>
</ul>



<p class="wp-block-paragraph">Rules this literal miss plenty of bad alt text. We took the miss over the false positive, because a reliable checker that developers enable beats one that gets switched off.</p>



<h2 class="wp-block-heading" id="repetition-is-a-layout-problem-not-a-dom-problem">Repetition is a layout problem, not a DOM problem</h2>



<p class="wp-block-paragraph">Repeated alt text presented an interesting problem. Picture a row of five star-shaped icons that each say <code>"3/5 stars"</code>. A screen reader user hears the same thing five times and learns nothing new from four of them.</p>



<p class="wp-block-paragraph">Our first version walked the images in document order and flagged any run sharing the same normalized alt. It caught things it shouldn&rsquo;t have. For example, a footer &ldquo;GitHub&rdquo; logo and a header &ldquo;GitHub&rdquo; logo might sit next to each other in the extracted list but nowhere near each other on screen, so nobody experiences them as a group.</p>



<p class="wp-block-paragraph">What matters is where images land on screen, not where they sit in the markup. So the rule now checks page layout, and only extends a run when the gap between two bounding boxes is small compared to the boxes themselves:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>const gap = Math.max(horizontalGap, verticalGap) 
const largerDim = Math.max(a.boundingBox.width, a.boundingBox.height, 
                           b.boundingBox.width, b.boundingBox.height) 
return gap &gt; GAP_MULTIPLIER * largerDim</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Two details worth noting:</p>



<ul class="wp-block-list">
<li><strong>The multiplier is a judgment call</strong>, not a number we derived from anything. It&rsquo;s the kind of value you tune against real pages instead of trusting from a spec.</li>



<li><strong>When either image has no measurable box, the check fails open</strong> and the run continues. A missing finding is invisible; a wrong one isn&rsquo;t.</li>
</ul>



<h2 class="wp-block-heading" id="getting-a-model-to-act-like-a-reviewer-not-a-critic">Getting a model to act like a reviewer, not a critic</h2>



<p class="wp-block-paragraph">Deterministic rules only need the alt string. Anything smarter needs to know what the page is about, and none of that is tracked by the image element. Whether <code>alt="a smiling person"</code> is fine depends entirely on what surrounds it: on a generic mood shot, it&rsquo;s probably works. But under a heading where a specific person is named, it doesn&rsquo;t provide enough detail.</p>



<p class="wp-block-paragraph">In our optional <code>alt-text-quality</code>check, we extract page context alongside each image: the nearest heading, the page title, any <code>&lt;figcaption&gt;</code>, whether the image sits inside a link or button, and up to 600 characters of nearby prose.</p>



<p class="wp-block-paragraph">The link signal matters most, because when an image is a link&rsquo;s only content, its alt becomes the link&rsquo;s accessible name. The right alt then names the destination instead of describing the picture.</p>



<p class="wp-block-paragraph"><strong>One caution:</strong> The plugin only records that an image sits inside a link. We don&rsquo;t check whether it&rsquo;s the link&rsquo;s only content, which is the part that actually turns alt into a link name. So right now both cases look identical to the model.</p>



<p class="wp-block-paragraph">That context, the alt, and the image go to a vision model through <a href="https://github.com/marketplace/models">GitHub Models</a>. Our failure modes were rarely the model misreading a picture. They were the model having opinions. Given perfectly good alt text, our first version of the checker would suggest different alt text, because &ldquo;could this be better?&rdquo; is a question a language model always answers yes to. Every image becomes a finding, so the signal disappears.</p>



<p class="wp-block-paragraph">Three changes fixed it:</p>



<ul class="wp-block-list">
<li><strong>A decision procedure instead of an instruction.</strong> The prompt walks four ordered steps, stops at the first that matches, and emits that step&rsquo;s verdict: decorative, redundant with a caption, functional, or informative.</li>



<li><strong>Explicit anti-nitpick rules.</strong> Trust the author&rsquo;s framing. Separate redundant prefixes (&ldquo;Image of&hellip;&rdquo;) from semantic ones (&ldquo;Photograph of&hellip;&rdquo;). Treat a short alt as <em>correct</em> when the surrounding prose already analyzes the image.</li>



<li><strong>Structured output with a forced field order,</strong> so <code>reasoning</code> is generated before <code>verdict</code> and the model has to build an argument before it picks a label.</li>
</ul>



<p class="wp-block-paragraph">None of that makes the model unfailingly correct. It makes it consistent enough to iterate against. The repository carries an offline grading harness built from published teaching material: <a href="https://webaim.org/techniques/alttext/">WebAIM</a>, the <a href="https://www.w3.org/WAI/tutorials/images/">W3C images tutorial</a>, and <a href="https://poet.bornaccessible.org/">POET</a>. The rule and the harness share one prompt, so what you tune offline is what runs in CI. That harness only tests the model&rsquo;s judgment, though, not the whole pipeline. A case can score perfectly there and never reach the model in a real scan.</p>



<h2 class="wp-block-heading" id="sending-images-to-a-model-is-a-privacy-and-cost-decision">Sending images to a model is a privacy and cost decision</h2>



<p class="wp-block-paragraph">The moment a check calls an external model with webpage data, it stops being just a lint rule and requires careful data flow design. A few things follow from that:</p>



<ul class="wp-block-list">
<li><strong>The rule is off by default.</strong> It won&rsquo;t run unless you deliberately enable it in your plugin configuration, and it needs a token with access to GitHub Models.</li>



<li><strong>URLs get redacted.</strong> Image URLs and link <code>href</code>s often carry signed CDN tokens or session identifiers, so query and fragment are stripped from anything entering the model context or the rule&rsquo;s error logs. For the same reason, <code>src</code> and <code>srcset</code> are replaced with <code>(omitted)</code> in the markup we send.</li>



<li><strong>Everything in that context window is untrusted input.</strong> Titles, headings, and prose all come from the page being scanned, and a page can contain text written to steer a model. Structured output constrains the shape of a response, not the reasoning behind it.</li>
</ul>



<p class="wp-block-paragraph"><strong>One caution, because that list is easy to over-read:</strong> findings still carry the real page URL and original HTML into the scanner&rsquo;s normal reporting pipeline. That&rsquo;s on purpose, since you can&rsquo;t fix an image you can&rsquo;t locate. Redaction narrows what reaches the model and the logs, not what lands in your own issues. And if you set up Azure AI Vision credentials, an optional OCR pre-pass sends image bytes to a second place. Nothing requires Azure, but a data-flow review needs to cover both paths.</p>



<p class="wp-block-paragraph">Cost follows the same shape. In the common case this is one model call per image per scan, which on an image-heavy site dominates the cost of the whole run. That&rsquo;s reason enough to put it on a schedule rather than on every commit.</p>



<h2 class="wp-block-heading" id="what-this-still-cant-do">What this still can&rsquo;t do</h2>



<ul class="wp-block-list">
<li><strong>The deterministic rules are literal.</strong> They catch alt text that&rsquo;s obviously unwritten, not alt text that&rsquo;s fluent and wrong. They also read the <code>alt</code> attribute rather than the computed accessible name, so an <code>aria-label</code> that fixes the problem won&rsquo;t stop the finding.</li>



<li><strong>The model-backed rule produces false positives.</strong> Every finding is a prompt for human attention, not a verdict.</li>



<li><strong>Silence isn&rsquo;t coverage.</strong> That rule re-fetches images outside the browser session, so anything behind authentication can fail to load. Fetch and model errors are logged and skipped, which means a page can come back clean because nothing got checked.</li>



<li><strong>Suggested alt text is a draft.</strong> A model that sees the image and a few nearby words can&rsquo;t account for your audience, your house style, or the job that image is doing on the whole page.</li>



<li><strong>Some findings double up with the scanner&rsquo;s built-in checks</strong>, since our <code>missing-alt</code> rule covers the same ground.</li>



<li><strong>We only check HTML</strong> <code>&lt;img&gt;</code> <strong>tags.</strong> SVG, <code>role="img"</code> containers, CSS backgrounds, and canvas aren&rsquo;t covered yet.</li>



<li><strong>This is new code with limited real-world feedback.</strong> Rules like these improve when they meet the variety of markup and content found across real sites. This plugin hasn&rsquo;t had that yet, so treat early findings accordingly.</li>



<li><strong>Passing isn&rsquo;t conformance.</strong> Automated checks are a floor. Testing with people who use assistive tech is the goal.</li>
</ul>



<h2 class="wp-block-heading" id="what-wed-tell-you-if-youre-building-something-similar">What we&rsquo;d tell you if you&rsquo;re building something similar</h2>



<p class="wp-block-paragraph">Separate what you can prove from what you can only suspect, and give them different defaults. Checks that <em>prove</em> something should be cheap, predictable, and on by default. Checks that only <em>suspect</em> something should be opt-in, and should read as a suggestion rather than a verdict. Then, ask what the user experiences rather than what the DOM says. Every gap still open in this plugin has that second shape. We record that an image is inside a link, not that it <em>is</em> the link. We read an attribute, not a computed name.</p>



<p class="wp-block-paragraph">That distance is the real boundary, and a better model doesn&rsquo;t close it. Deciding what the functionality of an image is for a user who can&rsquo;t see it still requires human judgment. What automation buys you is making sure that human is giving the right images a second examination.</p>



<p class="wp-block-paragraph"><strong><a href="https://github.com/github/accessibility-scanner-alt-text-plugin">Try the alt-text plugin in your accessibility scanning workflow.</a> </strong>If it tells you the wrong thing, please report it. Open an <a href="https://github.com/github/accessibility-scanner-alt-text-plugin/issues">issue</a> with the finding and, if public, a link to the affected page.</p>

<p>The post <a href="https://github.blog/engineering/user-experience/your-alt-text-passes-automated-checks-that-doesnt-mean-its-any-good/">Your alt text passes automated checks. That doesn&#8217;t mean it&#8217;s any good.</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>