---
title: Refactoring internal documentation in Notion
tags:
- Irrational Exuberance (Will Larson)
category: leader/leadership
created: '2026-08-29'
source: https://lethain.com/refactoring-internal-docs-notion/
type: rss
source_name: Irrational Exuberance (Will Larson)
source_url: https://lethain.com/feeds.xml
published: Thu, 05 Feb 2026 07:00:00 -0700
---

<p>In our latest developer productivity survey, our documentation
was the area with the second most comments.
This is a writeup of the concrete steps I took to see how much
progress one person could make on improving the organization&rsquo;s
documentation while holding myself to a high standard for making
changes that actually worked instead of optically sounding impressive.</p>
<h2 id="diagnosis">Diagnosis</h2>
<p>There were a handful of issues we were running into:</p>
<ul>
<li>
<p>We migrated from Confluence to Notion in January, 2025,
which had left around a bunch of old pages that were
&ldquo;obviously wrong.&rdquo;</p>
<p>These files created a bad smell around our other docs, as folks
felt like things weren&rsquo;t well maintained.</p>
</li>
<li>
<p>We had inconsistent approach to what we documented in Git-managed files
versus managing in Notion. This led to duplication.</p>
</li>
<li>
<p>Duplication meant that it felt safer to create an <code>N+1</code>th version,
rather than debugging why <code>N</code> versions already existed.</p>
</li>
<li>
<p>We&rsquo;ve had a bunch of new folks join over the past year,
who weren&rsquo;t sure if <em>they</em> were empowered to update documentation
or if someone else was managing any given file</p>
</li>
<li>
<p>We started using Notion AI as the primary mechanism for exposing content,
which meant that hierarchical organization was less important,
and that having inaccurate snippets was harmful even if they were
tucked away into a quiet corner</p>
</li>
</ul>
<p>This was combined with a handful of interesting limitations in Notion itself:</p>
<ul>
<li>You cannot tell if a non-wiki page is verified or not via API.
You <em>can</em> tell if a wiki page is verified via API, but no one uses wiki pages</li>
<li>You cannot retrieve all pages in a Notion Teamspace via API,
you instead have to manually take list of the top-level pages in that Teamspace,
and find the children from those pages</li>
<li>There is no &ldquo;archive&rdquo; functionality in Notion that allows you to exclude a document
from search results</li>
<li>There is no programmatic visibility into views or usage of a page via API <em>except</em>
for how recently it was edited</li>
</ul>
<h2 id="policy">Policy</h2>
<p>The policy we adopted for addressing the above diagnosis was:</p>
<ol>
<li><strong>Optimize for NotionAI results, not manual discovery</strong>: a significant majority of our Notion use
is now via either direct links to a specific page, or via Notion AI, not via manual discovery.
That means that things like “FAQ” pages that duplicate content and go stale are actively harmful,
whereas previously they were very valuable.</li>
<li><strong>Duplication and stale content is worse than nothing</strong>: do not write your own guide to a process.
Link to it instead, or update the source document</li>
<li><strong>Prefer natural documentation in version control</strong>: we’d rather link to a README in Github than
duplicate those instructions in Notion, because the README is more likely to be kept current</li>
<li><strong>Everyone tidies our documentation</strong>: we’d rather be people who try to clean up a document,
even if we make a small mistake, rather than someone who leaves documentation in a poor state</li>
<li><strong>Automatic beats manual every time</strong>: we&rsquo;re a busy team doing a lot of things,
it&rsquo;s always going to be difficult to consistently find time to manually curate content deeply,
focused curation is great, but global is unreasonable</li>
</ol>
<h2 id="implementation">Implementation</h2>
<p>Then the specifics of implementing that policy were:</p>
<ol>
<li>
<p><strong>Create <code>Scheduled to Archive</code> and <code>Archive</code> teamspaces.</strong>
The <code>Archive</code> teamspace is a private teamspace, such that documents added there don&rsquo;t pollute the search index.
Conversely, <code>Scheduled to Archive</code> is public, where anyone can add documents to its root document.</p>
<p>We have a weekly script that migrates everything from <code>Scheduled to Archive</code> to <code>Archive</code>.</p>
<p>This was the most effective mechanism we could find to implement archiving within Notion&rsquo;s constraints.</p>
</li>
<li>
<p><strong>Prune expired pages.</strong> Created a script which recursively builds hierarchy from a root page,
enriches each page with the <code>last_edited_date</code> for each child, and then prunes all pages
where it <em>and all children</em> were last edited more than <code>N</code> days ago.</p>
<p>Using this script on 3-4 most relevant top-level pages, we archived about 1,500 pages of expired documentation.</p>
</li>
<li>
<p><strong>Compact stale hierarchies.</strong> Created a second script which identifies current pages deep in stale hierarchies,
e.g. the one updated page among 15 inaccurate docs. After finding a &ldquo;buried current page&rdquo;, promotes it to the grandparent page,
and move the parent page (and its stale children) to <code>Scheduled to Archive</code>.</p>
<p>This ended up as a script that found all the candidates, and then I worked through approving/rejecting
each suggestion. The biggest issue being the lack of &ldquo;verification&rdquo; status within the API, such that there&rsquo;s
no way to bless given pages and their descendants.</p>
</li>
<li>
<p><strong>Stale link finder.</strong> Created a third script which recursively works through a hierarchy and finds 404s.
It&rsquo;s essential that this script <em>does not</em> have access to the <code>Archive</code> so those scripts show up as 404s,
otherwise you would have to scan through <code>Archived</code> to find things there. Both approaches would work,
just a bit of a matter of preference.</p>
<p>Ran this after the mass migrations to ensure we didn&rsquo;t leave a &ldquo;haunted forest&rdquo; of links into
archived documents that folks can&rsquo;t see, which would make the documentation still feel bad even though
much of the bad content was removed.</p>
</li>
<li>
<p><strong>Manual review of key pages.</strong> After running all of the above steps, I then worked through all
new-hire documentation to ensure it was linked to top-level onboarding guide, stated clear prerequisites,
indicated the Slack channel to get help if folks ran into trouble,
and ensured that instructions did not duplicate our Git-managed READMEs, instead linking to them where
appropriate.</p>
<p>I did a lighter pass of this approach for our top-level engineering and technology pages,
although those were generally in a good place.</p>
</li>
</ol>
<p>Altogether, I think this was about eight hours of my time, but required zero hours of anyone
else&rsquo;s, and will have hopefully significantly improved the quality of our documentation.
There&rsquo;s still a lot more to be done in specific areas, but I&rsquo;m optimistic that having far fewer duplicates,
and more evidence that we&rsquo;re actively maintaining the documentation, will make that easier as well.</p>