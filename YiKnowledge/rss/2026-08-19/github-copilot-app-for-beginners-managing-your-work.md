---
title: 'GitHub Copilot app for Beginners: Managing your work'
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-22'
source: https://github.blog/ai-and-ml/github-copilot/github-copilot-app-for-beginners-managing-your-work/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Wed, 19 Aug 2026 17:50:23 +0000
author: Christopher Harrison
---

<p class="wp-block-paragraph">This is the third post in our GitHub Copilot app for Beginners series. If you&rsquo;re just joining us, check out, <a href="https://github.blog/ai-and-ml/github-copilot/github-copilot-app-for-beginners-getting-started/">GitHub Copilot app for beginners: Getting started</a>, where we introduced the app and how it helps you work across multiple agent sessions. Our second post goes deeper on working within a session. Here, we&rsquo;ll look at how to keep all of the requests and work being done on a project organized in one place.</p>



<p class="wp-block-paragraph">If you&rsquo;ve been following along in this series, you know that real development is rarely a straight line. You fix a bug here, review a pull request there, and chase down a new idea somewhere in between. As you continue to assign tasks to Copilot and create new pull requests, you&rsquo;ll quickly find yourself with several proverbial balls in the air.</p>



<p class="wp-block-paragraph">Being able to manage everything from one centralized location is key, and that&rsquo;s exactly why the My work pane exists. Below, we&rsquo;ll cover how you can use it to manage what&rsquo;s currently in flight, what&rsquo;s completed, and what&rsquo;s next.</p>



<h2 class="wp-block-heading" id="h-exploring-the-default-views-for-pull-requests-and-issues">Exploring the default views for pull requests and issues</h2>



<p class="wp-block-paragraph">When you open the My work tab, you&rsquo;ll see three tabs waiting for you. The first is All, which shows all of your pull requests and issues in one place.</p>



<p class="wp-block-paragraph">This list is automatically filtered based on the projects you&rsquo;ve touched inside the Copilot app. It&rsquo;s not every repo you have access to. If there&rsquo;s a repo you&rsquo;d like to see here, just create a quick session pointing to that repo, and it&rsquo;ll show up.</p>



<p class="wp-block-paragraph">Alongside All, you&rsquo;ll find three more built-in views:</p>



<ul class="wp-block-list">
<li>Active shows all of your open pull requests and issues.</li>



<li>Review requests shows the pull requests where someone has requested your review.</li>



<li>Done shows everything that&rsquo;s been closed.</li>
</ul>



<p class="wp-block-paragraph">These give you an at-a-glance sense of what needs your attention right now versus what&rsquo;s already wrapped up.</p>



<h2 class="wp-block-heading" id="creating-your-own-views-and-filters">Creating your own views and filters</h2>



<p class="wp-block-paragraph">The built-in views are a great start, but you can also create your own. Select New view, and you&rsquo;ll get the familiar &ldquo;New view&rdquo; placeholder name, which you can rename to something like &ldquo;My issues.&rdquo;</p>



<p class="wp-block-paragraph">From here, you can build your filter. You can type it out using the angle-bracket syntax you might recognize from GitHub, or use the UI, which is often the friendlier option when you&rsquo;re getting started.</p>



<p class="wp-block-paragraph">For your My issues view, you can add a filter for Is: Issue to grab all issues, then add one more filter for Assignee: Me. Select Save, and now this view shows every issue that&rsquo;s been assigned to you.</p>



<p class="wp-block-paragraph">You can also do some quick filtering. Select the filter at the top and you&rsquo;ll get the same interface. Maybe instead of sorting by Recently updated, you&rsquo;d rather flip it to Ascending so the oldest items float to the top. From there, save your changes to a brand-new view, update the view you&rsquo;re currently on, or discard the changes to revert back.</p>



<h2 class="wp-block-heading" id="customizing-your-list-and-table-layouts">Customizing your list and table layouts</h2>



<p class="wp-block-paragraph">By default, your items show up in a list view, which feels a bit like a set of cards. It&rsquo;s a clean, approachable way to scan through your work.</p>



<p class="wp-block-paragraph">If you&rsquo;d like a little more control, switch to the table view. The table unlocks a few extra features you won&rsquo;t find in the list: choose which columns to display, move them around, and resize them to fit how you like to work.</p>



<p class="wp-block-paragraph">And don&rsquo;t worry about experimenting: you can always reset everything back to the way it was before, and switch right back to the list view whenever you&rsquo;d like.</p>



<h2 class="wp-block-heading" id="starting-agent-sessions-from-issues-and-pull-requests">Starting agent sessions from issues and pull requests</h2>



<p class="wp-block-paragraph">Here&rsquo;s where things really come together. You can bring up any item by selecting it, and from there, start a brand-new session on it. Just tell Copilot, &ldquo;Hey, let&rsquo;s get to work on this,&rdquo; it&rsquo;ll get to work, using the issue as its context.</p>



<p class="wp-block-paragraph">Back in the list view, you can select multiple items at once, choose Actions, and create new sessions from them. This is useful in a couple of ways:</p>



<ul class="wp-block-list">
<li>If you have several independent feature requests, you can spin up an individual session for each one.</li>



<li>If you have a series of bug reports that all point to the same feature, you can bundle them into a single session by selecting New session.</li>
</ul>



<p class="wp-block-paragraph">In either case, you can change the repo that the Copilot app uses for its session, which is perfect for those situations where the repo hosting the issue is separate from the one hosting the code.</p>



<h2 class="wp-block-heading" id="creating-issues-and-changing-your-repository-scope">Creating issues and changing your repository scope</h2>



<p class="wp-block-paragraph">Near the top of the pane, you&rsquo;ll find two more helpful buttons.</p>



<p class="wp-block-paragraph">The first is your repository filter, which is set to All Repositories by default. Remember, even &ldquo;all&rdquo; here is automatically scoped to the repos you&rsquo;ve touched inside the Copilot app.</p>



<p class="wp-block-paragraph">The second is New issue, which lets you create an issue right on the spot. For example, if you want to add a light mode toggle, select Create and you can kick off a brand-new session that starts with that issue as its context.</p>



<h2 class="wp-block-heading" id="take-this-with-you">Take this with you</h2>



<p class="wp-block-paragraph">The My work pane gives you a single, centralized place to manage all of your pull requests and issues. You can create custom views, search to find exactly what you need, and quickly assign tasks to Copilot, so you can stay organized and focus your attention where it&rsquo;s needed most.</p>



<p class="wp-block-paragraph">Learn more by exploring the rest of the videos in this series, or by visiting gh.io/app. We&rsquo;ll see you in the next post!</p>

<p>The post <a href="https://github.blog/ai-and-ml/github-copilot/github-copilot-app-for-beginners-managing-your-work/">GitHub Copilot app for Beginners: Managing your work</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>