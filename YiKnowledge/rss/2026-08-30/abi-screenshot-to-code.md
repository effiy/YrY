---
title: abi/screenshot-to-code
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/abi/screenshot-to-code
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Drop in a screenshot and convert it to clean code (HTML/Tailwind/React/Vue)</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://screenshottocode.com">https://screenshottocode.com</a></p><hr /><h1>screenshot-to-code</h1> 
<p>Convert screenshots, mockups, Figma designs, and screen recordings into clean, functional code using AI. The easiest way to try this is using <a href="https://screenshottocode.com/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=oss_readme&amp;utm_content=top_cta" rel="noopener noreferrer" target="_blank">the official, hosted product at screenshottocode.com →</a></p> 
<p><a href="https://github.com/user-attachments/assets/ec08a5e6-9606-41c5-b03a-1bf47dfeba75">https://github.com/user-attachments/assets/ec08a5e6-9606-41c5-b03a-1bf47dfeba75</a></p> 
<p>Supported stacks:</p> 
<ul> 
 <li>HTML + Tailwind</li> 
 <li>HTML + CSS</li> 
 <li>React + Tailwind</li> 
 <li>Vue + Tailwind</li> 
 <li>Bootstrap</li> 
 <li>Ionic + Tailwind</li> 
</ul> 
<p>Default AI models:</p> 
<ul> 
 <li>Gemini 3 Flash Preview and Gemini 3.1 Pro Preview - the best models</li> 
 <li>GPT-5.5 and GPT-5.4 Mini</li> 
 <li>Claude Opus 4.6, Claude Opus 4.8</li> 
 <li>z-image-turbo (using Replicate) for image generation</li> 
</ul> 
<p>See the <a href="https://raw.githubusercontent.com/abi/screenshot-to-code/main/#-examples">Examples</a> section below for more demos.</p> 
<p>Screenshot to Code also supports taking a screen recording of a website in action and turning that into a functional prototype.</p> 
<p><img alt="google in app quick 3" src="https://github.com/abi/screenshot-to-code/assets/23818/8758ffa4-9483-4b9b-bb66-abd6d1594c33" /></p> 
<h2>🛠 Getting Started</h2> 
<p>Choose the path that fits what you want to do:</p> 
<ul> 
 <li><strong>Run locally:</strong> best if you want to customize, self-host, or contribute.</li> 
 <li><strong>Use the hosted app:</strong> the fastest way to try Screenshot to Code with no local setup. <a href="https://screenshottocode.com/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=oss_readme&amp;utm_content=getting_started_cta" rel="noopener noreferrer" target="_blank">Open the hosted app →</a></li> 
</ul> 
<p>Running locally requires API keys and a backend/frontend setup. The app has a React/Vite frontend and a FastAPI backend.</p> 
<h3>API keys</h3> 
<p>You need <strong>at least one</strong> model provider key (OpenAI, Anthropic, or Gemini). <strong>Gemini and Replicate are strongly recommended for the best quality of screenshot-to-code accuracy</strong> — Gemini powers asset extraction (reusing the real logos/images from your screenshot) and Replicate powers image generation, background removal, and image editing. Adding all four keys gives the best results and lets you compare multiple models per generation.</p> 
<table> 
 <thead> 
  <tr> 
   <th>Key</th> 
   <th>Required?</th> 
   <th>What it unlocks</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>OPENAI_API_KEY</code></td> 
   <td>One of these three</td> 
   <td>GPT code-gen variants (GPT-5.5, GPT-5.4 Mini)</td> 
  </tr> 
  <tr> 
   <td><code>ANTHROPIC_API_KEY</code></td> 
   <td>One of these three</td> 
   <td>Claude code-gen variants (Opus 5, Opus 4.8, Fable 5, Sonnet 4.6)</td> 
  </tr> 
  <tr> 
   <td><code>GEMINI_API_KEY</code></td> 
   <td>One of these three — <strong>strongly recommended</strong></td> 
   <td>Gemini code-gen variants (3 Flash, 3.1 Pro); extracts real assets from the screenshot; required for video mode</td> 
  </tr> 
  <tr> 
   <td><code>REPLICATE_API_KEY</code></td> 
   <td><strong>Strongly recommended</strong></td> 
   <td>Image editing, background removal, and Replicate-backed image generation — without it, <code>edit_images</code> and <code>remove_backgrounds</code> are unavailable</td> 
  </tr> 
 </tbody> 
</table> 
<p>With more keys, the app automatically picks a stronger mix of models per variant; with a single key it uses that provider's models only.</p> 
<p>If you'd like to run the app with Ollama open-source models (not recommended due to poor-quality results), <a href="https://github.com/abi/screenshot-to-code/issues/354#issuecomment-2435479853">follow this comment</a>.</p> 
<p>Run the backend (I use Poetry for package management; run <code>pip install --upgrade poetry</code> if you don't have it):</p> 
<pre><code class="language-bash">cd backend
echo "OPENAI_API_KEY=sk-your-key" &gt; .env
echo "ANTHROPIC_API_KEY=your-key" &gt;&gt; .env
echo "GEMINI_API_KEY=your-key" &gt;&gt; .env
echo "REPLICATE_API_KEY=r8_your-key" &gt;&gt; .env
poetry install
# Install the Chromium browser used by the screenshot preview tool.
# On Linux, use `poetry run playwright install --with-deps chromium` to also
# install the required system libraries (needs sudo/apt).
poetry run playwright install chromium
poetry env activate
# run the printed command, e.g. source /path/to/venv/bin/activate
poetry run uvicorn main:app --reload --port 7001
</code></pre> 
<p>You can also set up OpenAI, Anthropic, and Gemini keys using the settings dialog in the frontend (click the gear icon after loading the app). Replicate must be configured in <code>backend/.env</code> as <code>REPLICATE_API_KEY</code>. The Settings dialog also shows whether <strong>screenshot preview</strong> is available on your backend.</p> 
<blockquote> 
 <p><strong>Screenshot preview</strong> (optional) lets the agent render its own generated page in a headless browser and visually check its work. It's enabled automatically once Chromium is installed (the <code>playwright install chromium</code> step above, or automatically in the Docker image). If Chromium is missing, the app just skips the tool — the Settings dialog shows whether it's available.</p> 
</blockquote> 
<p>Run the frontend:</p> 
<pre><code class="language-bash">cd frontend
pnpm install
pnpm dev
</code></pre> 
<p>Open <a href="http://localhost:5173">http://localhost:5173</a> to use the app.</p> 
<p>If you prefer to run the backend on a different port, update <code>VITE_WS_BACKEND_URL</code> in <code>frontend/.env.local</code>.</p> 
<h2>Docker</h2> 
<p>If you have Docker installed, run this from the root directory:</p> 
<pre><code class="language-bash">echo "OPENAI_API_KEY=sk-your-key" &gt; .env
docker-compose up -d --build
</code></pre> 
<p>The app will be up and running at <a href="http://localhost:5173">http://localhost:5173</a>. Note that you can't develop the application with this setup, as file changes won't trigger a rebuild.</p> 
<h2>🙋‍♂️ FAQs</h2> 
<ul> 
 <li><strong>I'm running into an error when setting up the backend. How can I fix it?</strong> <a href="https://github.com/abi/screenshot-to-code/issues/3#issuecomment-1814777959">Try this</a>. If that still doesn't work, open an issue.</li> 
 <li><strong>How do I get an OpenAI API key?</strong> See <a href="https://github.com/abi/screenshot-to-code/raw/main/Troubleshooting.md">https://github.com/abi/screenshot-to-code/blob/main/Troubleshooting.md</a></li> 
 <li><strong>How can I configure an OpenAI proxy?</strong> If you're not able to access the OpenAI API directly, for example because of country restrictions, you can try a VPN or configure the OpenAI base URL to use a proxy. Set <code>OPENAI_BASE_URL</code> in <code>backend/.env</code> or directly in the UI in the settings dialog. Make sure the URL has <code>v1</code> in the path, for example: <code>https://xxx.xxxxx.xxx/v1</code>.</li> 
 <li><strong>How can I update the backend host that my frontend connects to?</strong> Configure <code>VITE_HTTP_BACKEND_URL</code> and <code>VITE_WS_BACKEND_URL</code> in <code>frontend/.env.local</code>. For example, set <code>VITE_HTTP_BACKEND_URL=http://124.10.20.1:7001</code>.</li> 
 <li><strong>Seeing UTF-8 errors when running the backend?</strong> On Windows, open the <code>.env</code> file with Notepad++, then go to Encoding and select UTF-8.</li> 
 <li><strong>How can I provide feedback?</strong> For feedback, feature requests, and bug reports, open an issue or ping me on <a href="https://twitter.com/_abi_">Twitter</a>.</li> 
</ul> 
<h2>📚 Examples</h2> 
<p><strong>NYTimes</strong></p> 
<table> 
 <thead> 
  <tr> 
   <th>Original</th> 
   <th>Replica</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><img alt="Screenshot 2023-11-20 at 12 54 03 PM" src="https://github.com/user-attachments/assets/6b0ae86c-1b0f-4598-a578-c7b62205b3e2" width="1238" /></td> 
   <td><img alt="Screenshot 2026-06-15 at 3 06 37 PM" height="737" src="https://github.com/user-attachments/assets/48f0ab94-5fdc-41e7-ad6e-b4ad7ef69ae1" width="1435" /></td> 
  </tr> 
 </tbody> 
</table> 
<p><strong>Instagram</strong></p> 
<p><a href="https://github.com/user-attachments/assets/a335a105-f9cc-40e6-ac6b-64e5390bfc21">https://github.com/user-attachments/assets/a335a105-f9cc-40e6-ac6b-64e5390bfc21</a></p> 
<p><strong>Hacker News</strong></p> 
<p><a href="https://github.com/user-attachments/assets/205cb5c7-9c3c-438d-acd4-26dfe6e077e5">https://github.com/user-attachments/assets/205cb5c7-9c3c-438d-acd4-26dfe6e077e5</a></p>