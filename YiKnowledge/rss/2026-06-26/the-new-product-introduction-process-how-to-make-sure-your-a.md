---
title: 'The new product introduction process: How to make sure your Agent is ready
  every time you ship'
tags:
- Intercom Blog
category: producter/frameworks
created: '2026-08-29'
source: https://www.intercom.com/blog/npi-how-to-ensure-your-agent-is-ready-every-time-you-ship/
type: rss
source_name: Intercom Blog
source_url: https://www.intercom.com/blog/feed
published: Fri, 26 Jun 2026 17:40:52 +0000
author: Sean Reid
---

<p>When you work at a company that’s constantly shipping new product features, keeping your knowledge base up to date can be a challenge.</p>
<p>When you’re using an AI Agent, the consequence of having an out-of-date knowledge base is high. It means every time the product team ships a new feature and customer questions start to land, the Agent doesn&#8217;t have the information it needs to answer. It hands conversations off to a human, and within hours, your team is fielding a backlog of questions the Agent should have handled, right when volume is at its peak.</p>
<p>Over time, your customers start to lose trust in the Agent, and your team loses the capacity it was supposed to gain.</p>
<p>Making sure your Agent is ready for every product launch comes down to following a process that updates your knowledge as part of every new release. At Fin, we call this our “new product introduction” (NPI) process. Here’s what that looks like.</p>
<p><img class="aligncenter" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/06/Two-ways-to-handle-a-product-launch-scaled.png" /></p>
<h2 id="make-agent-readiness-a-prioritized-part-of-the-launch">Make Agent readiness a prioritized part of the launch</h2>
<p>If you’re relying on your customers to find your content gaps and then racing to fill them, you’ll always be one step behind. A more productive approach is to move Agent readiness upstream into the launch process itself. A feature should only be considered “shipped” when the Agent can answer questions about it correctly.</p>
<p>One of the most important changes you can advocate for is getting support involved in the launch planning as early as possible. Have someone from your team join product and engineering walkthroughs and product marketing kick-off calls, and test the new features before they ship.</p>
<p>This level of involvement helps catch bugs and unexpected behavior early and gives your team a firsthand understanding of how the feature actually works. It also makes it easier to see what existing information needs to be deprecated, so you can retire old content as you make updates. At Fin, this is what I take on as our new product introduction (NPI) Manager, but a knowledge manager or support lead could own this too.</p>
<p>The closer support is to product and marketing, the faster Agent readiness becomes a natural part of how launches get done.</p>
<h2 id="the-npi-checklist-how-to-prepare-review-and-test-content-before-launch-day">The NPI checklist: How to prepare, review, and test content before launch day</h2>
<p>Getting your Agent ready ahead of a launch requires you to prepare new content, review what exists and remove anything outdated, and test how your Agent performs before customers start interacting with it post-launch. As NPI Manager, I oversee this process at Fin. However, you could split this responsibility up across the team. Your knowledge manager might own the preparation and review stages, while a QA manager runs testing.</p>
<p>Here’s a checklist for areas to work through at each stage.</p>
<p><img class="aligncenter" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/06/NPI-Checklist-scaled.png" /></p>
<h3>Step 1: Prepare new knowledge</h3>
<p>As you prepare new information for your Agent to learn about your latest launch, you need to ensure your content is as clear and easy to follow as possible. The quality and structure of these articles will be the biggest determinant of how well your Agent answers questions.</p>
<h4>Use the terms your customers are using</h4>
<p>As you draft content for the launch, write in your customers’ language rather than just your internal terminology. For instance, your product team might call a new feature “automated workflow triggers,” but your customers are searching for “how to set up automatic replies.” Use the language your customers will actually use alongside feature names so it’s surfaced properly when they ask about it.</p>
<h4>Be explicit and unambiguous</h4>
<p>Your Agent reads content literally, so make sure your writing is easy for it to understand. Explain internal nuance, spell out acronyms, and define key product terms. If you feed the Agent vague or ambiguous language, it’ll return answers that your customers might find confusing.</p>
<h4>Give your Agent full context</h4>
<p>Don&#8217;t assume your Agent can infer meaning the way a human reader would. If you&#8217;ve just launched a new feature on a specific plan and a customer asks whether they have access, a one-line &#8220;it depends on your plan&#8221; isn’t enough. The Agent needs the full picture: which plans include the feature, what it does, how to access it, and any setup steps required. Write every answer as if your Agent has no surrounding context, because it doesn’t.</p>
<h4>Include explanatory text alongside images and videos</h4>
<p>Your Agent can’t rely on visuals alone. Always pair product screenshots, GIFs, or video walkthroughs with clear written steps covering the same ground.</p>
<h3>Step 2: Review and retire</h3>
<p>Once you’ve mapped out all the new content you need to support the launch, review what’s already in existence, what you’ll need to update, and what you’ll need to remove from your knowledge base entirely.</p>
<h4>Use keyword searches to surface what could be affected</h4>
<p>Search for every article, macro, or any other piece of content related to the launch topic. If your knowledge management tooling can flag stale or contradictory content automatically, use that to speed up the process.</p>
<h4>Check for duplicates</h4>
<p>If the same topic has more than one article, confirm the canonical source is the one you want your Agent using. An outdated duplicate will compete with your new content and introduce inconsistency.</p>
<h3>Step 3: Test before going live</h3>
<p>Before the feature officially ships, test how your Agent handles the new content so you can catch and fix problems before they reach customers.</p>
<h4>Run your full question set at once and rate answers</h4>
<p>Use your knowledge management tooling to generate likely FAQs from your new launch content and fold in any beta feedback or early support conversations if available. These reflect real customer language, not just what you think people might ask. Test how your Agent responds to these in the same environment your customers will use. Rate each answer, and if the results are poor, identify what the root cause is. It’s likely there’s still a content gap, the information exists but it’s inaccurate, or it exists but is too poorly structured to be retrieved. Apply each fix accordingly and then run the tests again.</p>
<h4>Review Agent rules and guidance for edge cases</h4>
<p>Before you go live, check whether the launch introduces nuances the content alone can&#8217;t cover – for example, if a feature is being rolled out to customers in stages, or if specific queries should always route to a human. If the launch has no such conditions, you can skip this step.</p>
<h4>Set your post-launch success metrics</h4>
<p>Decide which metrics you’ll monitor on the launch topic. Start with resolution rate and customer satisfaction score, at a minimum. This will help you catch problems as soon as they surface, rather than discovering them later in aggregate.</p>
<h2 id="in-practice-how-we-do-this-at-fin">In practice: How we do this at Fin</h2>
<p>Ahead of a launch, product managers and engineers submit their new feature along with a “what we built” doc to our product release tracker. This captures who built and manages the feature, beta start date, planned release date, plan availability, product description detailing how it works, and troubleshooting guidance.</p>
<p>Our knowledge managers and I are then looped into calls and Slack threads with the product and engineering teams early to understand the product changes, including walkthroughs and demos. We’re also invited to GTM kick-off meetings to align on messaging and rollout strategy. Any notes, demo summaries, or GTM briefs from these sessions are captured and combined with the “what we built” doc as a single input package for content.</p>
<p>Fully equipped with this input package, we upload it to <a href="https://fin.ai/operator">Operator</a>, our Agent that builds, tests, and ships improvements to Fin on our behalf, with a prompt such as:<img class="aligncenter" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/06/Fin-Operator-prompt.png" /></p>
<p>This prompt helps us identify what existing content needs updating, what Fin might answer incorrectly if it’s only pulling from existing material, and where there are gaps that we need to fill. We then follow up with a secondary prompt that asks Operator to take action and draft new public-facing content and internal guidance for teammates:</p>
<ol>
<li><em>Draft a new public article for any content gap you identified, written for customers, not engineers.</em></li>
<li><em>Draft or update a relevant internal article with any troubleshooting steps or tools provided for teammates.</em></li>
</ol>
<p><strong>Note:</strong> If you’re using Fin, <a href="https://www.intercom.com/help/en/articles/15461132-ai-knowledge-management-workflow-from-setup-to-content-readiness">here’s a full guide</a> to using Operator for knowledge management, including setup, prompts, and the content readiness framework.</p>
<div class="wistia_responsive_padding" style="padding: 56.25% 0 0 0;">
<div class="wistia_responsive_wrapper" style="height: 100%; width: 100%;"></div>
</div>
<p></p>
<p>This produces a content plan with a prioritized list of articles to update and any new drafts. For smaller launches, we publish just ahead of the feature going live. For larger ones, we start earlier and stage content so Fin has fully ingested the changes before new conversations hit the inbox.</p>
<p>With content live, we use Operator to generate a list of likely FAQs and test how Fin handles each one, proposing fixes where answers are poor or incomplete. Where beta feedback or early support conversations are available, we fold these in alongside the generated questions to ensure test coverage reflects real customer language, not just anticipated questions.</p>
<p>We then create a <a href="https://fin.ai/analyze#:~:text=Complete%20control,over%20conversation%20quality">Monitor</a> to catch new conversations about the launch and assess how they were handled using Scorecards. A new feature can span multiple topics or subtopics, making it hard to see all related conversations in one place, but Monitors solve for that. We track Fin’s resolution rate and CX Score for these conversations for up to four weeks for complex launches, or two weeks for standard ones, diving in to make improvements if they fall short of our benchmarks.</p>
<h2 id="start-with-your-next-launch">Start with your next launch</h2>
<p>Keeping your Agent current takes discipline, but once you have a strong process in place, it becomes easier each time.</p>
<p>Pick the next feature shipping from your product team, run through the checklist above, and make note of where your current process needs to be improved. Work with your product, engineering, and GTM teams to build a strong cross-functional muscle around launches, and make Agent readiness a core component of how you operate.</p>
<p>That&#8217;s how you make sure your Agent, and your team, stay ready for any launch, no matter how fast the roadmap moves.</p>
<p>&nbsp;</p>