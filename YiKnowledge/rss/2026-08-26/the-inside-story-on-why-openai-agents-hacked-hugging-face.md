---
title: The inside story on why OpenAI agents hacked Hugging Face
tags:
- MIT Technology Review
category: ai-engineer/methodology
created: '2026-08-29'
source: https://www.technologyreview.com/2026/08/26/1143013/the-inside-story-on-why-openai-agents-hacked-hugging-face/
type: rss
source_name: MIT Technology Review
source_url: https://www.technologyreview.com/feed/
published: Wed, 26 Aug 2026 19:00:00 +0000
author: Grace Huckins
---

<div></div>


<p>The models responsible for last month’s agent hack of Hugging Face had been inadvertently trained to cheat and to communicate with each other, according to an <a href="https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf">OpenAI technical report released today</a>. The hack, which a group of agents undertook to find solutions for a cybersecurity test that they were stuck on, has confirmed some experts’ fears that AI models might take actions that defy human desires and expectations. </p>



<p>Since the hack, OpenAI employees—as well as researchers at the AI evaluation nonprofit METR, which <a href="https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/">released its own report</a> on the hack today—have worked to understand what went wrong and how similar missteps might be prevented in the future. OpenAI has already put some preventative measures in place based on what they discovered. But making sure AI models do what we want them to do, or “alignment,” remains a gnarly problem, and some of the root causes of the hack will take much longer than a month to resolve.</p>



<p>“It’s not something you can solve overnight,” says Kai Chen, who runs OpenAI’s alignment research team. “There are challenges we’ve been tracking for a very long time, and we’re now seeing them with much greater precision.”</p>



<p>The Hugging Face hack was a product of months of misbehavior from OpenAI agents, first as they were being trained and then as their abilities were being evaluated. This May, agents in training figured out how to use OpenAI’s infrastructure to communicate with one another and get support with difficult training tasks, including some that were impossible to solve without hacking or otherwise misbehaving. That “message board” was shut down.</p>



<p>Then in July, while being evaluated for their cybersecurity abilities, some models created a new message board. They were supposed to be isolated from the internet, but by working together they managed to get online, hack Hugging Face, and obtain solutions for the cybersecurity problems that had stumped them.</p>





<p>Based on their investigation, OpenAI researchers believe that events during the training phase led directly to the hack. “For almost every behavior that was worrisome at evaluation time, [we were able to] find some sort of associated behavior at training time that actually we think might have contributed to it,” says Eric Wallace, a member of OpenAI’s alignment research team.&nbsp;</p>



<p>When models correctly solve problems during training, the behaviors that led them to that solution are reinforced, and they become more likely to engage in them in the future. So if a model completed a task in May after using the original message board, it became more likely to participate in a new message board later on. This phenomenon, where AI agents misbehave in ways that are reinforced during the training process, is known as <a href="https://www.technologyreview.com/2026/08/03/1141009/heres-why-ai-agents-lie-and-cheat-to-reach-their-goals/">reward hacking</a>.</p>



<p>Reward hacking also helps to explain why the models worked so hard to make their way onto the internet. During its investigation of the incident, the OpenAI team found that, over the course of training, the models became more and more likely to probe their digital environment for weaknesses and use the tools at their disposal in unexpected ways—a sign that these behaviors were being gradually reinforced. By the time the models were facing tricky cybersecurity problems, they had learned that hacking was an effective way to achieve their goals.</p>



<p>These results suggest that the Hugging Face hack could have been avoided if the models weren’t rewarded for misbehaving during training. While researchers don’t yet know how to prevent reward hacking entirely, OpenAI is taking some steps toward mitigating its effects. The company will now look for signs of cheating in all frontier models during training by keeping an eye on their <a href="https://www.technologyreview.com/2026/01/12/1129782/ai-large-language-models-biology-alien-autopsy/">chains of thought</a>—internal notepads where they sketch out their answers and plan their actions.&nbsp;</p>



<p>This solution isn’t as much of a slam dunk as it might seem: In <a href="https://arxiv.org/abs/2503.11926">earlier research</a>, OpenAI showed that punishing models that mention cheating in their chains of thought teaches them to keep their intentions hidden from researchers. But monitoring its models’ thinking does give OpenAI the chance to halt the training process and reassess its approach if models do start learning to reward hack.</p>





<p>If OpenAI stops reinforcing reward hacking in its models—and that’s a huge “if”—that would be a huge step forward. But it wouldn’t solve the alignment problem. The first time a model communicated with other agents or hacked its infrastructure during training, those behaviors had never been reinforced, so agent misbehavior can’t only be attributed to that reinforcement.</p>



<p>Jeffrey Ladish, director of the AI safety nonprofit Palisade Research, compares the agents to a human who commits their first financial crime. “It’s not like they had to do fraud before to figure out that fraud is an effective strategy, and you have the same problem with models,” Ladish says. “Alignment science needs to be understanding how model motivations get shaped, such that we can actually figure out how to get models to care about the consequences of their actions.”</p>



<p>OpenAI’s researchers do have a hypothesis for where some of the misbehavior originated. Before the models formed their first secret message board, they had been trained to communicate and coordinate with subagents—less powerful agents to whom a main agent can delegate tasks.&nbsp;</p>



<p>That learned communication behavior could have transferred to this new setting. The METR report, which investigates the messages that the models sent to one another in detail, supports this hypothesis: One agent on the message board took charge and assigned tasks to the other agents, effectively treating them as subagents. OpenAI could try to prevent agents from secretly communicating with one another by not training this subagent behavior in the future, but that would make the models less useful.&nbsp;</p>



<p>This tension between capability and safety is at the heart of what went wrong with the Hugging Face incident. OpenAI researchers also identified the models’ persistence as a key factor in the hack.&nbsp;</p>



<p>When they were accidentally given unsolvable problems, the models didn’t give up; instead, they strove to find solutions by any means necessary. But persistence is also a virtue, of course, especially if we want agents that can undertake large amounts of difficult work independently.</p>



<p>OpenAI is working on giving models ways to alert humans if they are given impossible tasks. The problem of teaching models when they should deploy their abilities and when they should hold back, however, won’t be settled in a single postmortem. The training strategies that create superhuman coders—rewarding them when they successfully solve problems—might not work to teach models to use their skills judiciously and respect human desires and values.</p>



<p>“I think there’s a bunch of alignment science that still needs to be done where we can move past just using proxies for task completion,” says Ladish. “That will work to make models very capable, but I don’t think it will work to make them aligned.”</p>