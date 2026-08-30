---
title: bilawalsidhu/gods-eye-view
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/bilawalsidhu/gods-eye-view
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>A spy satellite simulator in your browser, except the data is real. Live open source spatial intelligence on a photorealistic 3D globe.</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://maptheworld.ai/">https://maptheworld.ai/</a></p><hr /><div align="center"> 
 <h1>🌐 God's Eye View</h1> 
 <h3>A spy-satellite simulator in your browser — then you realize the sources are public and the data is real.</h3> 
 <p>Photorealistic 3D globe. Live aircraft, ships, satellites, earthquakes, traffic, and public cameras, with clearly labeled modeled views where a live feed is unavailable. Hands-free voice control powered by a realtime AI agent.</p> 
 <p><em>No place left behind.</em></p> 
 <p><img alt="Orbital HUD, a tracked live globe, FLIR terrain — then OPEN SOURCED" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/hero-open-source-reveal.gif" /></p> 
 <a href="https://www.youtube.com/@bilawalsidhu"> <img alt="The God's Eye View video series on YouTube" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/youtube-popular-videos.png" width="100%" /> </a> 
 <p>▶️ <strong>From the project behind the viral God's Eye View series</strong> <em>(formerly WorldView)</em> — <a href="https://youtube.com/playlist?list=PL6qSg2I-7_koPbDnSMo0QeeHX_RknA2uv&amp;si=nBGYMoHWQw41v93Q">5M+ on YouTube</a></p> 
</div> 
<hr /> 
<div align="center"> 
 <p><strong><a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-quick-start">Quick Start</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-the-first-five-minutes">First Five Minutes</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-talk-to-it">Talk to It</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-whats-on-the-globe">What's Live</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-under-the-hood">Under the Hood</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-api-keys">Keys</a> · <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-what-it-actually-costs">Costs</a></strong></p> 
</div> 
<hr /> 
<h2>🌍 Why This Exists</h2> 
<p><strong>You asked, so it's happening.</strong> God's Eye View is open source. Track the world live. Talk to it. Break it. Extend it.</p> 
<p>Most open-source intelligence is a pile of browser tabs. The signals are abundant, but the <em>interface</em> is the bottleneck. God's Eye View turns those signals into a <strong>place</strong>: the world is already broadcasting — flight transponders, ship beacons, orbital elements, seismographs, public cameras — and this makes it visible on a photorealistic 3D Earth in real time. No classified clearance required; it's public signal all the way down, and the interface runs in your browser, under your control.</p> 
<blockquote> 
 <p>Half the magic is that it looks like a forbidden cockpit. The other half is that every line of code is inspectable.</p> 
</blockquote> 
<p>The live layers are grounded in public feeds: the airliner crossing your screen is reporting telemetry, the camera is installed at a published location, and the ISS position is propagated from current orbital elements. The client deliberately renders flights one polling interval behind real time so it can interpolate smoothly. Some experiences are modeled rather than live: keyless traffic is labeled as a simulation, camera poses are estimated until calibrated, and launch ascent playback is marked <code>RECONSTRUCTED ESTIMATE</code>. Each layer keeps its source and freshness state visible, including partial, delayed, simulated, and unavailable states.</p> 
<hr /> 
<h2>🎛️ What This Thing Does</h2> 
<div align="center"> 
 <p><a href="https://www.youtube.com/watch?v=GRJaKcXZS94"><img alt="YouTube video about the God's Eye View open source release" src="https://img.youtube.com/vi/GRJaKcXZS94/maxresdefault.jpg" /></a></p> 
 <p>▶️ <strong><a href="https://www.youtube.com/watch?v=GRJaKcXZS94">The full walkthrough of everything below, on YouTube</a></strong></p> 
</div> 
<ul> 
 <li><strong>🛩️ Cockpit view:</strong> Ride inside a tracked flight — the camera holds the terrain under you all the way down.</li> 
 <li><strong>📡 Contacts:</strong> A 250 km roster of everything near your target — step through live aircraft and drop into any cockpit.</li> 
 <li><strong>🎯 Click-to-track anything:</strong> Camera locks on, draws a fading trail, surfaces full metadata — and a tracked fire or vessel hands you off to the nearest live camera in one click.</li> 
 <li><strong>🖊️ Voice whiteboard:</strong> Speak annotations onto the world — real boundary polygons, marks, and routes.</li> 
 <li><strong>🛫 3D hangar:</strong> Real per-class aircraft models — 787, ATR-72, Citation, Bell 206, MQ-9 — and a tracked contact swaps from glyph to 3D model as you close in.</li> 
 <li><strong>🎨 Reskin reality:</strong> GLSL sensor looks over the normal globe — CRT, NVG, FLIR/thermal, Noir, Snow.</li> 
 <li><strong>🟩 Detection overlay:</strong> Screen-space bounding boxes and IDs on everything in view.</li> 
 <li><strong>🎖️ Military HUD:</strong> Tactical heads-up display with intelligence-style telemetry.</li> 
 <li><strong>🌐 Global Context:</strong> Stage the full situational picture with one switch — and get your exact view back when you leave.</li> 
 <li><strong>🎥 Scene director:</strong> Capture cinematic camera tours for clips and demos.</li> 
 <li><strong>🔗 Share Links:</strong> Camera, style, layers, and even one tracked target serialize into a URL — a live target is a handoff, not a bookmark.</li> 
 <li><strong>🏠 Reset Globe:</strong> One control — or one sentence — back to the full Earth.</li> 
</ul> 
<hr /> 
<h2>⚡ Quick Start</h2> 
<p>Requires Node.js 24.14.x or 26.x (enforced by <code>package.json</code>).</p> 
<ol> 
 <li>Copy <code>.env.example</code> → <code>.env</code> and set <code>GOOGLE_MAPS_API_KEY</code>.</li> 
 <li>Install and run:</li> 
</ol> 
<pre><code class="language-bash">npm install
npm run dev -- --host localhost --port 4173
</code></pre> 
<ol start="3"> 
 <li>Open <strong><code>http://localhost:4173</code></strong>. Cold start settles in under two seconds on a recent laptop (median 1.86 s in a point-in-time M5/Chrome capture — <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/PERFORMANCE.md">docs/PERFORMANCE.md</a>; a comparison baseline, not a hardware requirement). A first-run card offers to stage a mission for you — <strong>Live Contacts</strong>, <strong>Space Missions</strong>, <strong>Environmental</strong> — or leaves you to explore manually.</li> 
</ol> 
<div class="markdown-alert markdown-alert-tip">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-light-bulb mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
  </svg>Tip</p>
 <p><strong>Not a coder? Have an AI do this whole page for you.</strong> A one-click installer is in the works — until then, install a coding agent (<a href="https://claude.com/claude-code">Claude Code</a>, <a href="https://openai.com/codex/">Codex</a>, <a href="https://cursor.com">Cursor</a>, or <a href="https://antigravity.google">Antigravity</a>) and paste this:</p> 
 <pre><code class="language-text">Clone https://github.com/bilawalsidhu/gods-eye-view and set it up on my machine.
Install everything it needs, walk me through getting the required Google Maps API
key step by step (plus any optional free keys I want), put the keys in .env, and
help me set a billing alert and a usage quota on the Google key so I can't
overspend. Then start the dev server and open it in my browser. I'm not a
developer — explain what you're doing as you go, and ask me before any step
that could cost money.
</code></pre> 
</div> 
<p><strong>That one key is the whole entry fee.</strong> Everything in this README is color-coded — 🟢 needs nothing · 🟡 free key · 🔴 metered — and Google Maps is the only 🔴 you need: it buys the photorealistic planet, and most of the globe lights up 🟢 from there. For typical solo exploring, expect <strong>$0 on most layers</strong> and pocket change on the metered two: Google currently gives <strong>1,000 free 3D-tile sessions a month</strong> — each good for up to three hours of rendering, which is very hard for one person to exhaust — and voice carries a built-in $5 session cap. Full map in <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-api-keys">Keys &amp; Costs</a>, full honest breakdown in <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-what-it-actually-costs">What it actually costs</a>.</p> 
<p>The dev server binds to <strong>localhost</strong> — your keys stay on your machine. Sharing on a LAN safely is covered in <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-sharing-an-instance">Sharing an instance</a> and <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/SECURITY.md">SECURITY.md</a>.</p> 
<p><strong>macOS shortcut:</strong> <code>./scripts/dev-fresh.sh</code> clears the Vite cache and pulls your keys straight from the Keychain.</p> 
<hr /> 
<h2>🕐 The First Five Minutes</h2> 
<p>No account, no signup. The first-run card will offer to stage a mission for you — or run this gauntlet yourself. Somewhere in these five minutes it stops feeling like a demo:</p> 
<ol> 
 <li><strong>Light up the sky.</strong> Take the <strong>Live Contacts</strong> mission (or turn on <strong>Flights</strong> yourself) — thousands of live aircraft, gliding on real telemetry, detection mesh already reading the scene. Click one: the camera locks on, a trail draws behind it, and its live telemetry card comes up.</li> 
 <li><strong>Take the controls.</strong> Hit <strong>COCKPIT</strong> on your tracked plane and ride it down, switching sensors mid-flight: NVG into Ironbow FLIR. The cockpit carries its own briefing strip — nearby live signals, regional headlines, and real local weather, with an opt-in <strong>WX</strong> mode that renders volumetric clouds from actual observations around your aircraft — and <strong>Contacts</strong> keeps the 250 km roster one click (or one sentence) away: jump plane to plane and fall straight into the next cockpit.</li> 
</ol> 
<p><img alt="Riding with a live aircraft in cockpit view while switching sensor modes" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/06-cockpit-ar.gif" /></p> 
<p><img alt="Jumping between live aircraft and falling straight into a cockpit view" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/12-switch-aircraft-cockpit.gif" /></p> 
<ol start="3"> 
 <li><strong>Drop into a busy airport.</strong> Search one and descend to the taxiways with <strong>3D</strong> aircraft on — grounded contacts, taxi trails, the whole apron working in real time.</li> 
</ol> 
<p><img alt="Moving from a full airport overhead down to close taxiway inspection with 3D flight models" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/start-here/airport-ground-traffic-google-3d.gif" /></p> 
<ol start="4"> 
 <li><strong>Look through a public camera.</strong> Turn on <strong>CCTV</strong> over Austin, London, or California. The feeds aren't webcam embeds — they project <em>into</em> the 3D city. Cycle coverage to <strong>VIEWSHED</strong> and every camera draws its estimated coverage volume — where it reaches, and where it goes blind.</li> 
</ol> 
<p><img alt="Diving into an Austin intersection with a live public camera projected into the 3D scene" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/03-austin-cctv.gif" /></p> 
<ol start="5"> 
 <li><strong>Paint the streets with rush hour.</strong> Turn on <strong>Traffic</strong> and dive below ~8 km — per-vehicle flow colors to the real jams (with a TomTom key; keyless it's a labeled simulation). Then hit <strong>NEAREST</strong> in the CCTV panel and watch the jam through the camera pointed at it.</li> 
</ol> 
<p><img alt="Diving from city-scale live congestion straight into an intersection's public camera" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/05-traffic-to-cctv.gif" /></p> 
<ol start="6"> 
 <li><strong>Track something in orbit.</strong> Turn on <strong>Satellites</strong> and click the ISS — you ride along at orbital distance, orbit ring and all.</li> 
</ol> 
<p><img alt="Tracking the ISS along its orbital path as it crosses over Ukraine" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/14-iss-over-ukraine.gif" /></p> 
<ol start="7"> 
 <li><strong>Switch the optics.</strong> Tap <code>1</code>–<code>7</code> — CRT, NVG, FLIR — and the whole live planet re-renders through a different sensor.</li> 
</ol> 
<p><img alt="Cycling a dense live globe through CRT, FLIR, and NVG in one continuous view" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/01-style-sweep.gif" /></p> 
<ol start="8"> 
 <li><strong>Talk to it</strong> <em>(needs an OpenAI key)</em>: <em>"Take me to LAX and select the nearest airborne aircraft."</em></li> 
 <li><strong>Come home.</strong> Hit <strong>Reset Globe</strong> — or just say <em>"zoom out to a globe view."</em></li> 
</ol> 
<p><strong>Keyboard:</strong> <code>1</code>–<code>7</code> visual styles · <code>H</code> HUD · <code>D</code> detection · <code>C</code> cockpit · <code>Esc</code> out.</p> 
<hr /> 
<h2>🎙️ Talk to It</h2> 
<blockquote> 
 <p>Voice needs an <strong>OpenAI key</strong>. Without one the entire app still runs — the mic button just reports voice is unavailable. The same key drives the <strong>AI HUD summary</strong>: a terse, five-word intelligence-style readout of the current view that regenerates as you move.</p> 
</blockquote> 
<p>Click <strong>GEV MIC</strong>, grant the microphone, and just talk. This is more than a voice-controlled remote:</p> 
<ul> 
 <li><strong>🧠 It knows what it's looking at.</strong> The agent pulls live scene context before answering — including coordinates, street names, active layers, and view scale. Ask <em>"what city is this?"</em> mid-flight and it knows.</li> 
 <li><strong>🎯 Entity Q&amp;A.</strong> Click any plane, ship, or datacenter and ask <em>"what's this?"</em> It answers using the object's live telemetry.</li> 
 <li><strong>👁️ Visual grounding.</strong> At street level, it reads a viewport screenshot to identify legible signage and building names, and is instructed never to hallucinate labels.</li> 
 <li><strong>🎬 Cinematic framing.</strong> <em>"Show me the planes overhead"</em> pulls the camera back, angles it, and frames the live traffic like a director.</li> 
 <li><strong>🔒 Honest and secure.</strong> The agent only confirms actions that succeeded. Your <code>OPENAI_API_KEY</code> never touches the browser; the client only gets a short-lived session token.</li> 
</ul> 
<p>Twenty-eight tools, four jobs — the commands below come straight from the product's voice test suite and tool playbook:</p> 
<p><strong>🎥 Direct it</strong> — drone-operator camera verbs:</p> 
<blockquote> 
 <p>🗣️ <em>"Take me to Tokyo."</em> · <em>"Orbit around this area slowly."</em> · <em>"Draw the walking route from the Capitol to Zilker Park."</em> → <em>"Fly the route we just drew."</em> · <em>"Zoom out to a globe view."</em></p> 
</blockquote> 
<p><strong>🖊️ Annotate it</strong> — a whiteboard over the real world:</p> 
<blockquote> 
 <p>🗣️ <em>"Outline the state of Texas."</em> · <em>"Annotate the Texas State Capitol and its grounds"</em> — it draws the <strong>actual enclosing boundary</strong>, not a circle. · <em>"How far is the Eiffel Tower from the Louvre?"</em> — a connector arrow appears and it speaks the distance. Everything persists until you say <em>"clear the map."</em></p> 
</blockquote> 
<p><img alt="Zilker Park and Lady Bird Lake drawing onto the 3D city as persistent vector annotations, by voice" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/01-voice-annotate-zilker.gif" /></p> 
<p><img alt="A spoken distance measurement spanning an airport, inspected from orbit" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/04-airport-distance.gif" /></p> 
<p><strong>🔎 Interrogate it</strong> — analyst queries against the live layers:</p> 
<blockquote> 
 <p>🗣️ <em>"How many flights are over Texas right now?"</em> · <em>"Which ships are headed to Oakland?"</em> · <em>"What is the biggest fire near Los Angeles?"</em> · <em>"Is anything flying above forty thousand feet?"</em> · <em>"When does the ISS pass over next?"</em></p> 
</blockquote> 
<p><strong>🎛️ Operate it</strong> — the whole console, hands-free:</p> 
<blockquote> 
 <p>🗣️ <em>"Switch to night vision and turn on the flights layer."</em> · <em>"Turn on the camera viewsheds."</em> · <em>"Play a news radio station near Austin."</em> · <em>"Track that plane."</em> → <em>"Enter Cockpit."</em></p> 
</blockquote> 
<p><strong>And the rapid-fire tier</strong> — one sentence each:</p> 
<blockquote> 
 <p>🗣️ <em>"Show me global infrastructure."</em> (stages the layers and pulls back to the globe) · <em>"Play Orbital Watch."</em> (a full cinematic scene) · <em>"Set detection density to fifty percent."</em> · <em>"Next contact — helicopters only."</em> (mid-cockpit) · <em>"Show me space missions."</em> · <em>"Switch to Bing aerial."</em> · <em>"Sharpen the image a touch."</em> · <em>"Switch to the tactical layout."</em> · <em>"What's turned on right now?"</em></p> 
</blockquote> 
<p><img alt="The globe populating with the world's radio stations as another live layer" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/15-global-radio-layer.gif" /></p> 
<p><em>Ask for radio near anywhere and the globe starts broadcasting — every station is a real place you can fly to.</em></p> 
<hr /> 
<h2>🛰️ What's on the Globe</h2> 
<p>Thirteen live layers. <strong>Ten of them need nothing at all</strong> — no key, no account, no signup.</p> 
<table> 
 <thead> 
  <tr> 
   <th>Layer</th> 
   <th>What you get</th> 
   <th>Source</th> 
   <th>Auth</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>🗺️ <strong>Map Stack</strong></td> 
   <td>Google Photorealistic 3D, Bing aerial, OSM</td> 
   <td>Google / Ion / OSM</td> 
   <td>🔴 Google (required) · 🟡 ion for Bing · 🟢 OSM</td> 
  </tr> 
  <tr> 
   <td>✈️ <strong>Live Flights</strong></td> 
   <td>Thousands of live aircraft + route history</td> 
   <td>OpenSky + adsb.lol</td> 
   <td>🟢 (🟡 optional for more polling credits)</td> 
  </tr> 
  <tr> 
   <td>🎖️ <strong>Military Flights</strong></td> 
   <td>ADS-B military traffic in amber</td> 
   <td>adsb.lol</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>🚢 <strong>Live Vessels</strong></td> 
   <td>Thousands of ships worldwide</td> 
   <td>AISStream</td> 
   <td>🟡</td> 
  </tr> 
  <tr> 
   <td>🛰️ <strong>Satellites</strong></td> 
   <td>A roughly 840-object core catalog, color-coded by class with a live legend — the <strong>DENSE</strong> chip drops in the whole Starlink shell</td> 
   <td>CelesTrak</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>🌍 <strong>Earthquakes</strong></td> 
   <td>Global seismic activity, last 24h</td> 
   <td>USGS</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>🚗 <strong>Traffic</strong></td> 
   <td>Live congestion driving per-vehicle flow at street level — dive below ~8 km and the dots color to real jams. Keyless it's an approximate simulation</td> 
   <td>TomTom + OSM</td> 
   <td>🟢 (🟡 TomTom makes it real — get one)</td> 
  </tr> 
  <tr> 
   <td>📹 <strong>CCTV Mesh</strong></td> 
   <td>~800 public cameras projected <em>into</em> the 3D space — Austin · California (Caltrans) · London (TfL). Positions are published; poses are estimated priors <strong>you calibrate by dragging a gizmo on the camera itself</strong></td> 
   <td>City APIs</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>📻 <strong>Radio</strong></td> 
   <td>Geolocated world radio with an <strong>analog tuner</strong> — drag the needle across up to 750 stations and the globe flies to each broadcaster</td> 
   <td>Radio Browser / broadcasters</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>🚲 <strong>Bikeshare</strong></td> 
   <td>Live station availability</td> 
   <td>GBFS</td> 
   <td>🟢</td> 
  </tr> 
  <tr> 
   <td>🔥 <strong>Active Fires</strong></td> 
   <td>Live NASA FIRMS detections, trailing 24h</td> 
   <td>NASA FIRMS</td> 
   <td>🟡</td> 
  </tr> 
  <tr> 
   <td>🚀 <strong>Space Missions</strong></td> 
   <td>Rolling 30-day launches with payload, stage, and recovery detail</td> 
   <td>Launch Library 2</td> 
   <td>🟢 (🟡 optional token raises the allowance)</td> 
  </tr> 
  <tr> 
   <td>🎖️ <strong>Mapped Installations</strong></td> 
   <td>Viewport-bounded military-site context from community mapping — incomplete by nature, and labeled that way</td> 
   <td>OpenStreetMap</td> 
   <td>🟢</td> 
  </tr> 
 </tbody> 
</table> 
<p><strong>Also on the globe:</strong> neighborhood overlays · an optional cockpit WX cloud effect. <strong>Bundled static infrastructure:</strong> Datacenters (4,351), Dams (704), and Submarine Cables (712).</p> 
<p><strong>Missing a layer you want?</strong> Open an issue — or add it and send the PR.</p> 
<hr /> 
<h2>🎖️ Field Missions</h2> 
<p>Once the basics click, run these:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Mission</th> 
   <th>How</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><strong>🚁 Ask the planet</strong></td> 
   <td><em>"Why are all these military helicopters flying in circles?"</em> Select a military track — it silently backfills ~24 h of real trace history — and see what it's been doing, resolved as stacked 3D loops.</td> 
  </tr> 
  <tr> 
   <td><strong>✈️ Final approach</strong></td> 
   <td>Click-track an airliner lining up for a runway, hop into the <strong>cockpit</strong>, and ride it down.</td> 
  </tr> 
  <tr> 
   <td><strong>🌃 Night watch</strong></td> 
   <td>Fly to your own city, switch to <strong>NVG</strong>, and let the detection mesh and HUD read the scene.</td> 
  </tr> 
  <tr> 
   <td><strong>🚢 Port call</strong></td> 
   <td>Vessels on over the Port of Long Beach. Click a tanker for its tactical card and wake trail — then hit <strong>NEAREST</strong> in the CCTV panel and look at the same water through a public camera.</td> 
  </tr> 
  <tr> 
   <td><strong>📻 Tokyo FM</strong></td> 
   <td>Orbit Shibuya with the <strong>Radio</strong> layer on — then drag the analog tuner needle: every position snaps to a real station and the globe flies to whoever's broadcasting.</td> 
  </tr> 
  <tr> 
   <td><strong>🔥 Fire line</strong></td> 
   <td>FIRMS over California. Click a detection — the camera dives to it — read the intensity, then hit <strong>NEAREST</strong> in the CCTV panel for a ground view.</td> 
  </tr> 
  <tr> 
   <td><strong>🚶 Ask for a walking route</strong> <em>🎙️</em></td> 
   <td>Tell the world where you want to go and watch a real street-following route trace itself through the 3D city — then <em>"fly it"</em>: banked turns, eased ends, a camera that leads the path like a drone shot.</td> 
  </tr> 
  <tr> 
   <td><strong>📏 Measure LAX to DFW</strong> <em>🎙️</em></td> 
   <td><em>"How far is LAX from DFW?"</em> — an arrow spans the country, the distance lands in the caption, and the endpoints stay pinned to the real world as you orbit.</td> 
  </tr> 
  <tr> 
   <td><strong>🚀 Launch replay</strong></td> 
   <td>Open <strong>Space Missions</strong>, pick a launch from the last 30 days, and ride the T-minus countdown through ascent to orbit — scrub it at 0.25×–4×. Labeled <code>RECONSTRUCTED ESTIMATE</code>, because it is one.</td> 
  </tr> 
  <tr> 
   <td><strong>🪦 Walk the boneyard</strong></td> 
   <td>Fly from regional context down into dense, fully resolved rows of retired aircraft.</td> 
  </tr> 
  <tr> 
   <td><strong>🏗️ Orbit Three Gorges</strong></td> 
   <td>Sweep the dam and its terrain at a glance — then flip on the <strong>Dams</strong> layer and find 703 more.</td> 
  </tr> 
  <tr> 
   <td><strong>🌊 Trace the backbone</strong></td> 
   <td>Dive to the Bahamas with <strong>Submarine Cables</strong> on — labeled routes reveal beneath the water, 712 of them worldwide.</td> 
  </tr> 
 </tbody> 
</table> 
<p><em>🎙️ = voice missions — they need an OpenAI key.</em></p> 
<p><img alt="Resolving a selected aircraft's recent flight path into stacked 3D loops above the terrain" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/07-helicopter-loops.gif" /></p> 
<p><em>Ask the planet: a military contact's last ~24 hours of real trace history, resolved as stacked 3D loops.</em></p> 
<p><img alt="Asking for a walking route and flying the generated path through the 3D city" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/10-walking-route-flythrough.gif" /></p> 
<p><em>"Draw the walking route… now fly it" — banked turns, eased ends, the camera leading the path like a drone shot.</em></p> 
<p><img alt="Descending from regional context into dense rows of retired aircraft at the boneyard" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/08-boneyard.gif" /></p> 
<p><em>Walk the boneyard: rows of retired airframes, fully resolved in 3D.</em></p> 
<p><img alt="A reconstructed Falcon 9 ascent climbing and curving into its projected orbit" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/08-falcon9-replay.gif" /></p> 
<p><em>Launch replay: a Falcon 9 ascent, labeled <code>RECONSTRUCTED ESTIMATE</code>, scrubbable 0.25×–4×.</em></p> 
<p><img alt="Diving into the Bahamas and revealing labeled submarine cable routes beneath the globe" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/09-undersea-cables.gif" /></p> 
<p><em>Trace the backbone: the submarine cable routes under the Bahamas.</em></p> 
<hr /> 
<h2>🔧 Under the Hood</h2> 
<p>Some of the engineering that makes it feel real rather than like a tech demo:</p> 
<ul> 
 <li><strong>World-stable icons.</strong> Aircraft and ships point along their <em>true real-world heading</em> at every camera angle — tracked or not, looking straight down or across the horizon — via per-frame screen-space course projection. No spinning, no viewport-locking.</li> 
 <li><strong>Smooth motion from choppy data.</strong> Live feeds arrive every 15–30s; the globe renders one interval behind real time and interpolates between known fixes. Dead reckoning fills the gaps.</li> 
 <li><strong>Honest satellites.</strong> SGP4 propagation with orbit rings that stay locked to their satellites via GMST realignment — no drift, no per-second flicker.</li> 
 <li><strong>Sits on the real ground.</strong> Entity heights run through a real vertical datum — geoid-aware, sampled against the <em>rendered</em> terrain mesh — so aircraft park on aprons and cameras stand on street corners instead of floating.</li> 
 <li><strong>Spends your quota like it's its own.</strong> The paid feeds run behind cached, budget-governed proxies — an OpenSky credit governor, a TomTom daily tile budget, disk-cached TLEs — so an afternoon of exploring doesn't torch an API allowance.</li> 
 <li><strong>Local-first key handling.</strong> Secret-bearing providers such as OpenAI, AISStream, OpenSky OAuth, TomTom, and FIRMS are brokered server-side. Proxy destinations are fixed or allowlisted, and the higher-risk paths add bounded requests, timeouts, response caps, and sanitized errors as appropriate. The only provider credentials intentionally exposed to the browser are Google Maps and Cesium ion; restrict both at the provider.</li> 
 <li><strong>No framework.</strong> Vanilla JavaScript, <strong>CesiumJS</strong>, and <strong>Vite</strong> — plus <strong>Google Photorealistic 3D Tiles</strong> for the planet and the <strong>OpenAI Realtime API</strong> for voice. Fast to read, fast to hack on.</li> 
</ul> 
<pre><code>src/
├── main.js                 # Bootstrap: Google 3D tiles, layer registration
├── ui.js                   # Runtime UI — panels, HUD, styles, control facade
├── hud.js                  # Intelligence HUD + AI scene summary
├── mapStackController.js   # Google 3D / Bing / OSM switching
├── iconOrientation.js      # Screen-projected world-space headings + horizon cull
├── voice/                  # OpenAI Realtime session + 28 voice tools
├── data/                   # One module per layer + management + context store
│   └── local_data/         # Bundled datasets (per-folder provenance)
└── scenes/                 # Cinematic scene director
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/CURRENT-STATE.md"><code>docs/CURRENT-STATE.md</code></a> for the authoritative runtime reference.</p> 
<hr /> 
<h2>🔑 API Keys</h2> 
<p><strong>The legend, one more time:</strong> 🟢 <strong>no signup</strong> — works out of the box · 🟡 <strong>free key</strong> — register, paste, done · 🔴 <strong>metered</strong> — a billing-enabled account; costs are small but real.</p> 
<p>Most of the globe is 🟢: flights (anonymous), military traffic, satellites, earthquakes, CCTV, radio, bikeshare, space missions, mapped installations, and every bundled dataset run with <strong>zero keys</strong>.</p> 
<h3>What you need for the good experience</h3> 
<p>Five keys cover the fully keyed experience. Three currently offer no-cost developer access; Google Maps and OpenAI are usage-metered. Provider prices and allowances change, so use the linked pricing pages before relying on a budget estimate:</p> 
<table> 
 <thead> 
  <tr> 
   <th></th> 
   <th>Key</th> 
   <th>Why</th> 
   <th>Get it</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>🔴</td> 
   <td><strong>Google Maps</strong> <em>(required)</em></td> 
   <td>The photorealistic 3D planet (<a href="https://developers.google.com/maps/documentation/tile">Map Tiles API</a>)</td> 
   <td><a href="https://console.cloud.google.com/">Google Cloud Console</a> — metered; <a href="https://developers.google.com/maps/billing-and-pricing/pricing">check current pricing</a> and URL-restrict it</td> 
  </tr> 
  <tr> 
   <td>🔴</td> 
   <td><strong>OpenAI</strong></td> 
   <td>🎙️ The voice experience + AI HUD summary. Want another provider behind the mic? PRs welcome</td> 
   <td><a href="https://platform.openai.com">platform.openai.com</a> — metered; <a href="https://openai.com/api/pricing/">check current API pricing</a></td> 
  </tr> 
  <tr> 
   <td>🟡</td> 
   <td><strong>AISStream</strong></td> 
   <td>🚢 Live global ships</td> 
   <td><a href="https://aisstream.io">aisstream.io</a> — free, seriously, it's a two-minute signup</td> 
  </tr> 
  <tr> 
   <td>🟡</td> 
   <td><strong>NASA FIRMS</strong></td> 
   <td>🔥 Live active fires</td> 
   <td><a href="https://firms.modaps.eosdis.nasa.gov/api/map_key/">firms.modaps.eosdis.nasa.gov</a> — free</td> 
  </tr> 
  <tr> 
   <td>🟡</td> 
   <td><strong>TomTom</strong></td> 
   <td>🚦 Real traffic instead of an approximate simulation</td> 
   <td><a href="https://developer.tomtom.com">developer.tomtom.com</a> — check the current developer allowance for your account</td> 
  </tr> 
 </tbody> 
</table> 
<p><em>What the TomTom key buys you: step 5 of <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/#-the-first-five-minutes">The First Five Minutes</a> for real — actual rush-hour density painted on the city instead of an approximate simulation.</em></p> 
<h3>Cherry on top</h3> 
<table> 
 <thead> 
  <tr> 
   <th></th> 
   <th>Key</th> 
   <th>Why</th> 
   <th>Get it</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>🟡</td> 
   <td><strong>Cesium ion</strong></td> 
   <td>🗺️ Bing imagery map stacks (public <code>assets:read</code> token)</td> 
   <td><a href="https://cesium.com/ion">cesium.com/ion</a> — <a href="https://cesium.com/platform/cesium-ion/pricing/">check the plan that fits your use</a></td> 
  </tr> 
  <tr> 
   <td>🟡</td> 
   <td><strong>OpenSky</strong></td> 
   <td>✈️ More flight-polling credits (🟢 anonymous works without)</td> 
   <td><a href="https://opensky-network.org">opensky-network.org</a></td> 
  </tr> 
  <tr> 
   <td>🟡</td> 
   <td><strong>Launch Library 2</strong></td> 
   <td>🚀 Higher space-missions request allowance (🟢 works without)</td> 
   <td><a href="https://thespacedevs.com">thespacedevs.com</a></td> 
  </tr> 
 </tbody> 
</table> 
<p>All of them are worth getting. None of them are required to start.</p> 
<pre><code class="language-bash"># Put keys in .env (see .env.example), or pass them as env vars:
OPENAI_API_KEY="…" AISSTREAM_API_KEY="…" npm run dev -- --host localhost --port 4173
</code></pre> 
<p>On macOS you can also keep any key in the Keychain and <code>./scripts/dev-fresh.sh</code> pulls them in — the <code>security add-generic-password</code> service names are documented in <code>.env.example</code>.</p> 
<p>OpenSky can run fully anonymous (<code>OPENSKY_AUTH_MODE=anon</code>), or import OAuth credentials with <code>./scripts/opensky-import-client.sh /path/to/credentials.json</code>.</p> 
<h3>💸 What it actually costs</h3> 
<p>Honest numbers, roughly, as of mid-2026 — always check the provider pricing pages:</p> 
<table> 
 <thead> 
  <tr> 
   <th></th> 
   <th>Cost reality</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><strong>🟢 Most layers</strong></td> 
   <td><strong>$0, no signup.</strong> OpenSky anon, USGS, CelesTrak, adsb.lol, city CCTV, Radio Browser, GBFS, Launch Library 2, bundled datasets.</td> 
  </tr> 
  <tr> 
   <td><strong>🟡 Optional developer access</strong></td> 
   <td>AISStream, FIRMS, TomTom, Cesium ion, and authenticated OpenSky may offer no-cost access, but limits and permitted uses differ. Cesium ion and OpenSky in particular have plan or use restrictions; verify the current provider terms for your deployment.</td> 
  </tr> 
  <tr> 
   <td><strong>🔴 Google 3D tiles</strong></td> 
   <td>More generous than you'd guess: billing counts <strong>root tileset requests</strong> — one buys up to <strong>three hours</strong> of unlimited tile rendering — and the first <strong>1,000 per month are free</strong>, then about <strong>$6 per 1,000</strong> (US pricing; <a href="https://developers.google.com/maps/billing-and-pricing/pricing">check the current page</a>, rates vary by billing region). A solo user rarely leaves the free tier. Still: restrict the key, set quotas, and configure a budget alert before sustained use.</td> 
  </tr> 
  <tr> 
   <td><strong>🔴 OpenAI voice</strong></td> 
   <td>Realtime audio is usage-metered and the total depends on the selected model, conversation length, and audio volume. The app shows a live session estimate, warns at $2, and applies a <strong>$5 in-app session cap</strong>; provider-side usage limits remain the billing backstop.</td> 
  </tr> 
 </tbody> 
</table> 
<h3>🧗 The floor is low on purpose</h3> 
<p>Everything above is the deliberately cheap baseline — enough to get a real taste of geospatial intelligence, GEOINT, and OSINT without ever talking to a sales team. You'll also notice the ceiling: terrestrial AIS goes quiet mid-ocean and satellite AIS costs real money; premium imagery, SAR, and the deeper commercial feeds live behind enterprise contracts. That's not a limit of the architecture — every layer here is a pattern you can point at your own data sources. This repo hands you the foundation; what you fuse into it is up to you.</p> 
<h3>🔒 Sharing an instance</h3> 
<p>By default nobody else can reach your server — it binds to localhost. To share on your LAN, opt in explicitly (<code>npm run dev -- --host 0.0.0.0 --port 4173</code>, or <code>HOST=0.0.0.0 ./scripts/dev-fresh.sh</code> on macOS/Linux) — but know that ⚠️ <strong>a LAN-visible server brokers your configured API keys to anyone who can reach it.</strong> Set the per-IP throttles (<code>GEV_RATELIMIT_OPENAI_PER_MIN</code>, <code>GEV_RATELIMIT_GOOGLE_PER_MIN</code> — see <code>.env.example</code>) and, before anything else, <strong>set provider-side budget caps</strong> (Google Cloud budgets, OpenAI usage limits): the throttles are app-level guards, not billing caps. Full threat model in <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/SECURITY.md">SECURITY.md</a>.</p> 
<hr /> 
<h2>📋 Responsible &amp; Open</h2> 
<p>God's Eye View runs on <strong>public data, clear sources, and local-first execution.</strong> No secrets, no private datasets, no mystery scraping — anything involving a private key is brokered server-side. It has the visual grammar of a classified ops room, built entirely from open signals and inspectable code.</p> 
<p><strong>The line.</strong> This project models <strong>events, assets, infrastructure, and systems</strong> — aircraft, vessels, satellites, fires, cameras, cities. It does not build features for named-person search, face recognition, or tracking individuals, and pull requests that cross that line won't be merged. People are not a query type here.</p> 
<p><strong>Come build it.</strong> This is the canonical live 3D client from the project that kicked off the recent wave of spatial-intelligence tools — and it's a canvas: the layers here are the signals one person could find and fuse. Add a city pack, a data source, a style, a voice tool. It's the window through which you see the world; bring that window to others.</p> 
<p><strong>Status:</strong> An evolving open-source client for exploration and learning — a fast, hackable foundation, not a hardened production service. Released under the <strong><a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/LICENSE">MIT License</a></strong>. Bundled and live datasets carry their own terms — see <strong><a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/DATA_SOURCES.md">DATA_SOURCES.md</a></strong>. Security model: <strong><a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/SECURITY.md">SECURITY.md</a></strong>. Want to contribute? <strong><a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/CONTRIBUTING.md">CONTRIBUTING.md</a></strong>.</p> 
<p><sub>Media note: Bilawal Sidhu created and owns the 17 capture GIFs on this page. He also published the two README PNGs in the existing public project and authorized their continued inclusion here. Any appearance by Bilawal is included with his permission. These files are project documentation, not MIT-licensed standalone assets. Platform interfaces, trademarks, avatars, data, and third-party imagery visible within them remain subject to their respective owners' terms. See <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/README.md">media provenance</a> and <a href="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/DATA_SOURCES.md">source terms</a>.</sub></p> 
<div class="markdown-alert markdown-alert-important">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-report mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
  </svg>Important</p>
 <p>God's Eye View is an exploratory visualization of public and third-party data. Data may be delayed, incomplete, modeled, inferred, or wrong. Do not use it for flight or maritime navigation, emergency response, medical or health decisions, investment decisions, or other safety-critical or operational purposes. Verify important information with authoritative sources.</p> 
</div> 
<hr /> 
<h2>🧭 What's Next</h2> 
<p>First — thank you. To everyone who watched the God-view demos and went off to build their own, and to everyone who kept asking for the code: I'm grateful. And when I polled whether this should go open source, you weren't subtle about it:</p> 
<img alt="Community survey on open-sourcing God's Eye View" src="https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/docs/media/open-source-survey.png" width="460" /> 
<p>So here it is. Step inside the spy-thriller cockpit — except the data is real — and let's turn this into our shared sandbox for making sense of the world, and have fun doing it. This repo is the baseline, it stays open, and the whole point is for you to break things and bolt on layers we haven't thought of yet.</p> 
<p>One heads-up from the inside: build in this space for a week and you learn that <strong>the present is the cheap part</strong>. The moment you try to go back in time — tiling, serving, and scrubbing <em>what happened</em> and <em>what changed</em> at any real resolution — the data gets expensive and the compute gets brutal. For that, we're building something cool. More in the future — <a href="https://halfpixel.ai">halfpixel.ai</a>.</p> 
<hr /> 
<div align="center"> 
 <p>▶️ <a href="https://youtube.com/playlist?list=PL6qSg2I-7_koPbDnSMo0QeeHX_RknA2uv&amp;si=nBGYMoHWQw41v93Q">Watch the God's Eye View series</a> · 📬 <a href="https://maptheworld.ai/">Map the World</a> — the newsletter behind the project</p> 
 <p><strong>🌐 God's Eye View. No place left behind.</strong></p> 
</div>