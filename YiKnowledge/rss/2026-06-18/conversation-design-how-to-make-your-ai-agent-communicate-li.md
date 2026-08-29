---
title: 'Conversation design: How to make your AI Agent communicate like your team'
tags:
- Intercom Blog
category: producter/frameworks
created: '2026-08-29'
source: https://www.intercom.com/blog/conversation-design-for-your-ai-agent/
type: rss
source_name: Intercom Blog
source_url: https://www.intercom.com/blog/feed
published: Thu, 18 Jun 2026 16:55:07 +0000
author: Fred Walton
---

<p>If nobody on your team has trained your Agent on how to communicate, it&#8217;s going to sound like an LLM when it speaks to your customers (because it is one).</p>
<p>Conversation design is an emerging discipline in AI-first support teams built to solve this exact problem. A conversation designer owns how your Agent communicates: tone, structure, level of detail, customer experience, handoff and escalation process.</p>
<p>Without a dedicated owner defining the communication guidance your Agent should follow, it starts making decisions itself. That could result in it giving too much detail when a short answer would do, replying in a flat tone when a customer is frustrated, or triggering a handoff too late.</p>
<p>The cost of all of these is measurable. Customers who get awkwardly structured responses aren’t likely to trust the answers, even when they’re accurate, so they’ll escalate to a human teammate to hear the same thing said differently. Others will skip the Agent entirely. When the Agent does hand off, a poor transition means the human support rep inherits a customer who’s already frustrated. Every one of these outcomes is avoidable, and conversation design is the discipline that ensures they don’t happen.</p>
<p>We saw this firsthand at Fin. We A/B tested two opening messages, one warm and conversational, the other our older default. The conversational greeting lifted CSAT from 72.8% to 78.4%. A single conversation design change, applied to the first thing a customer sees, made a measurable difference.</p>
<p><img alt="We A/B tested two opening messages, one warm and conversational (right), saying &quot;Hi, you're speaking with Fin AI Agent. I can do much more than other chatbots you've seen before. Tell me as much as you can about your question and I'll do my best to help you in an instant,&quot; and the other our older default (left), saying &quot;Hi, you're speaking with Fin AI Agent. I'm here to answer your questions. You can always talk to the team if you need to. How can I help?&quot;" class="aligncenter wp-image-32191" height="635" src="https://blog.intercomassets.com/blog/wp-content/uploads/2036/06/Group-2147230655.png" width="1545" /></p>
<h2 id="what-conversation-design-covers">What conversation design covers</h2>
<p>The role covers five distinct areas, each shaping a different part of the customer&#8217;s experience:</p>
<table style="width: 100% !important; border-collapse: collapse !important; border: 1px solid #dcdcdc !important; margin: 20px 0 !important; font-family: sans-serif !important;">
<thead>
<tr style="background-color: #0011e6 !important;">
<th style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #ffffff !important; font-weight: 600 !important;">Area</th>
<th style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #ffffff !important; font-weight: 600 !important;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="background-color: #e3f2fd !important; border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; color: #333333 !important; width: 25% !important;">Tone and personality</td>
<td style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #333333 !important;">Voice, level of detail, how formal or casual the Agent sounds, and whether that changes based on the situation.</td>
</tr>
<tr>
<td style="background-color: #e3f2fd !important; border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; color: #333333 !important;">Response structure</td>
<td style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #333333 !important;">Whether the Agent matches the level of detail to what the customer asked.</td>
</tr>
<tr>
<td style="background-color: #e3f2fd !important; border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; color: #333333 !important;">Handoff logic</td>
<td style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #333333 !important;">When to escalate, how to communicate the transition, and what context to carry over.</td>
</tr>
<tr>
<td style="background-color: #e3f2fd !important; border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; color: #333333 !important;">Interaction flow</td>
<td style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #333333 !important;">How a conversation progresses through question, answer, resolution or handoff.</td>
</tr>
<tr>
<td style="background-color: #e3f2fd !important; border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; font-weight: 600 !important; color: #333333 !important;">Response quality</td>
<td style="border: 1px solid #dcdcdc !important; padding: 12px 15px !important; text-align: left !important; color: #333333 !important;">Whether the answer feels clear, helpful, and on-brand, even when it’s technically correct.</td>
</tr>
</tbody>
</table>
<h2 id="how-to-put-it-into-practice">How to put it into practice</h2>
<h3>Start with how the conversation should feel</h3>
<p>Before tuning individual responses, define the voice. Write it down in one paragraph how you want your Agent to sound. You don&#8217;t need a full brand guide, just a reference point you can come back to when making decisions about tone.</p>
<p>Different conversation types may need different registers. A customer locked out of their account needs directness and speed, while someone exploring a new feature might appreciate more context. The voice stays consistent, but the register should adapt.</p>
<h3>Design the handoff carefully</h3>
<p>The transition from Agent to support rep is one of the highest-friction moments. Customers shouldn&#8217;t have to re-explain their issue. The rep should receive the full conversation history, the context behind the issue, what the Agent already did, and why the escalation happened.</p>
<p>The way the Agent communicates the handoff also matters. &#8220;<em>Let me connect you with a teammate who can help with this</em>&#8221; feels different from a silent handover.</p>
<p>Designing a failsafe is essential too. If the Agent can’t resolve the conversation cleanly, you need a fallback approach that still gives the customer a smooth handover experience. A customer may be frustrated with AI at that point, but a well-handled transition can turn that around.</p>
<h3>Don&#8217;t forget the follow-up</h3>
<p>Follow-ups need the same attention as handoffs. If someone dropped off mid-conversation, with your Agent or a support rep, how do you reach back out to make sure they got the help they needed? Most teams don&#8217;t think about this, and customers notice.</p>
<h3>Know when the Agent should stop talking</h3>
<p>One of the most common conversation design mistakes is over-explaining. The Agent has access to a lot of information, and left unguided, it can easily give more detail than the customer needs.</p>
<p>The Agent should match the level of detail to what the customer asked for. Someone asking how to reset their password doesn&#8217;t need three paragraphs. A customer asking about a complex integration might. If there&#8217;s more to share, it should offer it rather than give it all at once.</p>
<h3>Design for the conversation the customer is having</h3>
<p>Customers don&#8217;t follow scripts. They change direction mid-conversation or ask follow-ups unrelated to their original question.</p>
<p>The Agent needs to handle these transitions without forcing the customer back into a fixed flow. When the Agent keeps trying to resolve the original question after the customer has moved on, it can feel like talking to someone who isn&#8217;t listening.</p>
<p>Consider whether the same flow should apply across different channels, and whether different customer segments need different experiences.</p>
<h3>Keep your instructions short</h3>
<p>One of the biggest practical challenges is over-instructing the Agent. Teams keep adding rules every time a new edge case comes up. Before long, the LLM has paragraphs of instructions to process before it can respond.</p>
<p>I&#8217;ve seen this happen at Fin and I&#8217;ve heard the same from other teams. The instinct is always to add more, but the discipline is knowing when to stop.</p>
<p>My rule: if it&#8217;s about content or information, it belongs in the knowledge base. If it&#8217;s about tone or how to handle specific situations, it belongs in your Agent&#8217;s instructions. &#8220;Be direct about pricing&#8221; does more than a paragraph explaining the philosophy behind your pricing communication strategy.</p>
<hr />
<p>If you&#8217;re using Fin, much of this work happens in <a href="https://www.intercom.com/help/en/articles/10210126-provide-fin-ai-agent-with-specific-guidance">Guidance</a>. It’s where conversation design takes shape, helping you define how the Agent should sound, how much it should say, and how it should respond in different situations.</p>
<p><img alt="Fin's Guidance feature" class="aligncenter size-full wp-image-32195" height="1430" src="https://blog.intercomassets.com/blog/wp-content/uploads/2036/06/Screenshot-2026-06-18-at-17.43.49.png" width="2352" /></p>
<h2 id="getting-started-without-a-dedicated-hire">Getting started without a dedicated hire</h2>
<p>Most teams won&#8217;t hire a dedicated conversation designer on day one – that&#8217;s fine. But someone needs to own how the Agent communicates, even if it&#8217;s part of an existing role.</p>
<p>Conversation design often starts within support ops or knowledge management. Someone on the team starts paying attention to how the Agent sounds. Over time, as your Agent handles more conversations, that becomes a formal responsibility, and eventually, a dedicated role.</p>
<h3>Where to start</h3>
<h4>1. Name an owner</h4>
<p>You need someone to be accountable for how the Agent communicates. It doesn’t need to be a new hire, but it does need to be explicit.</p>
<h4>2. Pick one conversation type that isn&#8217;t landing well</h4>
<p>Look at conversations where your Agent answered correctly but the customer still escalated or left negative feedback. Start there.</p>
<p>If you&#8217;re using Fin, <a href="https://www.intercom.com/help/en/articles/10495092-understand-customer-experience-at-scale-with-the-cx-score">CX Score</a> can help you surface these. It shows which topics and conversation types are scoring poorly, and the reasons behind those scores so you can see whether the issue is answer quality, customer effort, or something else.</p>
<p><img alt="Fin's CX Score topics and reasons" class="alignnone" height="1242" src="https://blog.intercomassets.com/blog/wp-content/uploads/2055/11/Image-2-scaled.png" width="2560" /></p>
<h4>3. Audit your Agent&#8217;s instructions</h4>
<p>If they&#8217;ve grown beyond a few focused rules, trim them. Move content into the knowledge base, keep the instructions focused on behavior.</p>
<h4>4. Fix your worst handoff</h4>
<p>Walk through a few conversations where the Agent escalated to a human. Did the customer have to repeat themselves? Did the support rep have enough context? Redesign that single transition first.</p>
<h2 id="small-steps-compound">Small steps compound</h2>
<p>The impact of each of these improvements compounds. A warm opening message improved our CSAT, while trimming instructions made responses sharper. Designing a better handoff meant support reps stopped inheriting frustrated customers.</p>
<p>None of those changes required new knowledge; they required someone paying attention to the conversation itself.</p>
<p><a href="https://fin.ai/blueprint/service/"><img alt="The AI Service Agent Blueprint" class="aligncenter wp-image-32136 size-full" height="921" src="https://blog.intercomassets.com/blog/wp-content/uploads/2025/08/image-10.png" width="1968" /></a></p>