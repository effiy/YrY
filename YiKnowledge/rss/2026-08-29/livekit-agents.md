---
title: livekit/agents
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-29'
source: https://github.com/livekit/agents
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>A framework for building realtime voice AI agents 🤖🎙️📹</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://docs.livekit.io/agents">https://docs.livekit.io/agents</a></p><hr /> 
 <source media="(prefers-color-scheme: dark)" /> 
 <source media="(prefers-color-scheme: light)" /> 
 <img alt="The LiveKit icon, the name of the repository and some sample code in the background." src="https://raw.githubusercontent.com/livekit/agents/main/.github/banner_light.png" style="width: 100%;" /> 
 
<!--END_BANNER_IMAGE--> 
<br /> 
<p><img alt="PyPI - Version" src="https://img.shields.io/pypi/v/livekit-agents" /> <a href="https://pepy.tech/projects/livekit-agents"><img alt="PyPI Downloads" src="https://static.pepy.tech/badge/livekit-agents/month" /></a> <a href="https://livekit.io/join-slack"><img alt="Slack community" src="https://img.shields.io/endpoint?url=https%3A%2F%2Flivekit.io%2Fbadges%2Fslack" /></a> <a href="https://twitter.com/livekit"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/livekit" /></a> <a href="https://deepwiki.com/livekit/agents"><img alt="Ask DeepWiki for understanding the codebase" src="https://deepwiki.com/badge.svg?sanitize=true" /></a> <a href="https://github.com/livekit/livekit/raw/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/livekit/livekit" /></a></p> 
<br /> 
<p>Looking for the JS/TS library? Check out <a href="https://github.com/livekit/agents-js">AgentsJS</a></p> 
<h2>What is Agents?</h2> 
<!--BEGIN_DESCRIPTION--> 
<p>The Agent Framework is designed for building realtime, programmable participants that run on servers. Use it to create conversational, multi-modal voice agents that can see, hear, and understand.</p> 
<!--END_DESCRIPTION--> 
<h2>Features</h2> 
<ul> 
 <li><strong>Flexible integrations</strong>: A comprehensive ecosystem to mix and match the right STT, LLM, TTS, and Realtime API to suit your use case.</li> 
 <li><strong>Integrated job scheduling</strong>: Built-in task scheduling and distribution with <a href="https://docs.livekit.io/agents/build/dispatch/">dispatch APIs</a> to connect end users to agents.</li> 
 <li><strong>Extensive WebRTC clients</strong>: Build client applications using LiveKit's open-source SDK ecosystem, supporting all major platforms.</li> 
 <li><strong>Telephony integration</strong>: Works seamlessly with LiveKit's <a href="https://docs.livekit.io/sip/">telephony stack</a>, allowing your agent to make calls to or receive calls from phones.</li> 
 <li><strong>Exchange data with clients</strong>: Use <a href="https://docs.livekit.io/home/client/data/rpc/">RPCs</a> and other <a href="https://docs.livekit.io/home/client/data/">Data APIs</a> to seamlessly exchange data with clients.</li> 
 <li><strong>Semantic turn detection</strong>: Uses a transformer model to detect when a user is done with their turn, helps to reduce interruptions.</li> 
 <li><strong>MCP support</strong>: Native support for MCP. Integrate tools provided by MCP servers with one line of code.</li> 
 <li><strong>Builtin test framework</strong>: Write tests and use judges to ensure your agent is performing as expected.</li> 
 <li><strong>Open-source</strong>: Fully open-source, allowing you to run the entire stack on your own servers, including <a href="https://github.com/livekit/livekit">LiveKit server</a>, one of the most widely used WebRTC media servers.</li> 
</ul> 
<h2>Installation</h2> 
<p>To install the core Agents library, along with plugins for popular model providers:</p> 
<pre><code class="language-bash">pip install "livekit-agents[openai,deepgram,cartesia]"
</code></pre> 
<h2>Docs and guides</h2> 
<p>Documentation on the framework and how to use it can be found <a href="https://docs.livekit.io/agents/">here</a></p> 
<h3>Building with AI coding agents</h3> 
<p>If you're using an AI coding assistant to build with LiveKit Agents, we recommend the following setup for the best results:</p> 
<ol> 
 <li> <p><strong>Install the <a href="https://docs.livekit.io/mcp">LiveKit Docs MCP server</a></strong> — Gives your coding agent access to up-to-date LiveKit documentation, code search across LiveKit repositories, and working examples.</p> </li> 
 <li> <p><strong>Install the <a href="https://github.com/livekit/agent-skills">LiveKit Agent Skill</a></strong> — Provides your coding agent with architectural guidance and best practices for building voice AI applications, including workflow design, handoffs, tasks, and testing patterns.</p> <pre><code class="language-shell">npx skills add livekit/agent-skills --skill livekit-agents
</code></pre> </li> 
</ol> 
<p>The Agent Skill works best alongside the MCP server: the skill teaches your agent <em>how to approach</em> building with LiveKit, while the MCP server provides the <em>current API details</em> to implement it correctly.</p> 
<h2>Core concepts</h2> 
<ul> 
 <li>Agent: An LLM-based application with defined instructions.</li> 
 <li>AgentSession: A container for agents that manages interactions with end users.</li> 
 <li>entrypoint: The starting point for an interactive session, similar to a request handler in a web server.</li> 
 <li>AgentServer: The main process that coordinates job scheduling and launches agents for user sessions.</li> 
</ul> 
<h2>Usage</h2> 
<h3>Simple voice agent</h3> 
<hr /> 
<pre><code class="language-python">from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    inference,
)


@function_tool
async def lookup_weather(
    context: RunContext,
    location: str,
):
    """Used to look up weather information."""

    return {"weather": "sunny", "temperature": 70}


server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        vad=inference.VAD(),
        # any combination of STT, LLM, TTS, or realtime API can be used
        # this example shows LiveKit Inference, a unified API to access different models via LiveKit Cloud
        # to use model provider keys directly, replace with the following:
        # from livekit.plugins import deepgram, openai, cartesia
        # stt=deepgram.STT(model="nova-3"),
        # llm=openai.LLM(model="gpt-4.1-mini"),
        # tts=cartesia.TTS(model="sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"),
        stt=inference.STT("deepgram/nova-3", language="multi"),
        llm=inference.LLM("google/gemma-4-31b-it"),  # low-latency gemma, hosted on LiveKit
        tts=inference.TTS("cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"),
    )

    agent = Agent(
        instructions="You are a friendly voice assistant built by LiveKit.",
        tools=[lookup_weather],
    )

    await session.start(agent=agent, room=ctx.room)
    await session.generate_reply(instructions="greet the user and ask about their day")


if __name__ == "__main__":
    cli.run_app(server)
</code></pre> 
<p>You'll need the following environment variables for this example:</p> 
<ul> 
 <li>LIVEKIT_URL</li> 
 <li>LIVEKIT_API_KEY</li> 
 <li>LIVEKIT_API_SECRET</li> 
</ul> 
<h3>Multi-agent handoff</h3> 
<hr /> 
<p>This code snippet is abbreviated. For the full example, see <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/multi_agent.py">multi_agent.py</a></p> 
<pre><code class="language-python">...
class IntroAgent(Agent):
    def __init__(self) -&gt; None:
        super().__init__(
            instructions=f"You are a story teller. Your goal is to gather a few pieces of information from the user to make the story personalized and engaging."
            "Ask the user for their name and where they are from"
        )

    async def on_enter(self):
        self.session.generate_reply(instructions="greet the user and gather information")

    @function_tool
    async def information_gathered(
        self,
        context: RunContext,
        name: str,
        location: str,
    ):
        """Called when the user has provided the information needed to make the story personalized and engaging.

        Args:
            name: The name of the user
            location: The location of the user
        """

        context.userdata.name = name
        context.userdata.location = location

        story_agent = StoryAgent(name, location)
        return story_agent, "Let's start the story!"


class StoryAgent(Agent):
    def __init__(self, name: str, location: str) -&gt; None:
        super().__init__(
            instructions=f"You are a storyteller. Use the user's information in order to make the story personalized."
            f"The user's name is {name}, from {location}",
            # override the default model, switching to Realtime API from standard LLMs
            llm=openai.realtime.RealtimeModel(voice="echo"),
            chat_ctx=chat_ctx,
        )

    async def on_enter(self):
        self.session.generate_reply()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    userdata = StoryData()
    session = AgentSession[StoryData](
        vad=inference.VAD(),
        stt="deepgram/nova-3",
        llm="google/gemma-4-31b-it",  # low-latency gemma, hosted on LiveKit
        tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        userdata=userdata,
    )

    await session.start(
        agent=IntroAgent(),
        room=ctx.room,
    )
...
</code></pre> 
<h3>Testing</h3> 
<p>Automated tests are essential for building reliable agents, especially with the non-deterministic behavior of LLMs. LiveKit Agents include native test integration to help you create dependable agents.</p> 
<pre><code class="language-python">@pytest.mark.asyncio
async def test_no_availability() -&gt; None:
    llm = google.LLM()
    async with AgentSession(llm=llm) as sess:
        await sess.start(MyAgent())
        result = await sess.run(
            user_input="Hello, I need to place an order."
        )
        result.expect.skip_next_event_if(type="message", role="assistant")
        result.expect.next_event().is_function_call(name="start_order")
        result.expect.next_event().is_function_call_output()
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(llm, intent="assistant should be asking the user what they would like")
        )

</code></pre> 
<h2>Examples</h2> 
<p>For more examples and detailed setup instructions, see the <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/">examples directory</a>. For even more examples, see the <a href="https://github.com/livekit-examples/python-agents-examples">python-agents-examples</a> repository.</p> 
<table> 
 <tbody>
  <tr> 
   <td width="50%"> <h3>🎙️ Starter Agent</h3> <p>A starter agent optimized for voice conversations.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/basic_agent.py">Code</a> </p> </td> 
   <td width="50%"> <h3>🔄 Multi-user push to talk</h3> <p>Responds to multiple users in the room via push-to-talk.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/push_to_talk.py">Code</a> </p> </td> 
  </tr> 
  <tr> 
   <td width="50%"> <h3>🎵 Background audio</h3> <p>Background ambient and thinking audio to improve realism.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/background_audio.py">Code</a> </p> </td> 
   <td width="50%"> <h3>🛠️ Dynamic tool creation</h3> <p>Creating function tools dynamically.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/dynamic_tool_creation.py">Code</a> </p> </td> 
  </tr> 
  <tr> 
   <td width="50%"> <h3>☎️ Outbound caller</h3> <p>Agent that makes outbound phone calls</p> <p> <a href="https://github.com/livekit-examples/outbound-caller-python">Code</a> </p> </td> 
   <td width="50%"> <h3>📋 Structured output</h3> <p>Using structured output from LLM to guide TTS tone.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/structured_output.py">Code</a> </p> </td> 
  </tr> 
  <tr> 
   <td width="50%"> <h3>🔌 MCP support</h3> <p>Use tools from MCP servers</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/mcp">Code</a> </p> </td> 
   <td width="50%"> <h3>💬 Text-only agent</h3> <p>Skip voice altogether and use the same code for text-only integrations</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/other/text_only.py">Code</a> </p> </td> 
  </tr> 
  <tr> 
   <td width="50%"> <h3>📝 Multi-user transcriber</h3> <p>Produce transcriptions from all users in the room</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/other/transcription/multi-user-transcriber.py">Code</a> </p> </td> 
   <td width="50%"> <h3>🎥 Video avatars</h3> <p>Add an AI avatar with Tavus, Bithuman, LemonSlice, and more</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/avatar_agents/">Code</a> </p> </td> 
  </tr> 
  <tr> 
   <td width="50%"> <h3>🍽️ Restaurant ordering and reservations</h3> <p>Full example of an agent that handles calls for a restaurant.</p> <p> <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/voice_agents/restaurant_agent.py">Code</a> </p> </td> 
   <td width="50%"> <h3>👁️ Gemini Live vision</h3> <p>Full example (including iOS app) of Gemini Live agent that can see.</p> <p> <a href="https://github.com/livekit-examples/vision-demo">Code</a> </p> </td> 
  </tr> 
 </tbody>
</table> 
<h2>Running your agent</h2> 
<h3>Testing in terminal</h3> 
<pre><code class="language-shell">python myagent.py console
</code></pre> 
<p>Runs your agent in terminal mode, enabling local audio input and output for testing. This mode doesn't require external servers or dependencies and is useful for quickly validating behavior.</p> 
<h3>Developing with LiveKit clients</h3> 
<pre><code class="language-shell">python myagent.py dev
</code></pre> 
<p>Starts the agent server and enables hot reloading when files change. This mode allows each process to host multiple concurrent agents efficiently.</p> 
<p>The agent connects to LiveKit Cloud or your self-hosted server. Set the following environment variables:</p> 
<ul> 
 <li>LIVEKIT_URL</li> 
 <li>LIVEKIT_API_KEY</li> 
 <li>LIVEKIT_API_SECRET</li> 
</ul> 
<p>You can connect using any LiveKit client SDK or telephony integration. To get started quickly, try the <a href="https://agents-playground.livekit.io/">Agents Playground</a>.</p> 
<h3>Running for production</h3> 
<pre><code class="language-shell">python myagent.py start
</code></pre> 
<p>Runs the agent with production-ready optimizations.</p> 
<h2>License</h2> 
<p>The Agents framework is licensed under <a href="https://raw.githubusercontent.com/livekit/agents/main/LICENSE">Apache-2.0</a>. The LiveKit turn detection models are licensed under the <a href="https://raw.githubusercontent.com/livekit/agents/main/MODEL_LICENSE">LiveKit Model License</a>.</p> 
<h2>Contributing</h2> 
<p>The Agents framework is under active development in a rapidly evolving field. We welcome and appreciate contributions of any kind, be it feedback, bugfixes, features, new plugins and tools, or better documentation. You can file issues under this repo, open a PR, or chat with us in the <a href="https://docs.livekit.io/intro/community/">LiveKit community</a>.</p> 
<h3>Development setup</h3> 
<p>This project uses <a href="https://docs.astral.sh/uv/">uv</a> for package management. To install dependencies for development:</p> 
<pre><code class="language-shell">uv sync --all-extras --dev
</code></pre> 
<h3>Examples</h3> 
<p>This project includes many examples in the <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/"><code>examples</code></a> directory. To run them, create the file <code>examples/.env</code> with credentials for LiveKit Server and any necessary model providers (see <code>examples/.env.example</code>), then run:</p> 
<pre><code class="language-shell">uv run examples/voice_agents/basic_agent.py dev
</code></pre> 
<p>For more information, see the <a href="https://raw.githubusercontent.com/livekit/agents/main/examples/README.md">examples README</a>.</p> 
<h3>Tests</h3> 
<p>Unit tests are in the <code>tests</code> directory and can be run with:</p> 
<pre><code class="language-shell">uv run pytest --unit
</code></pre> 
<p>Integration tests for each plugin require various API credentials and run automatically in GitHub CI for PRs submitted by project maintainers. See the <a href="https://raw.githubusercontent.com/livekit/agents/main/.github/workflows/tests.yml">tests workflow</a> for details.</p> 
<h3>Formatting</h3> 
<p>This project uses <a href="https://github.com/astral-sh/ruff">ruff</a> for formatting and linting:</p> 
<pre><code class="language-shell">uv run ruff format
uv run ruff check --fix
</code></pre> 
<h3>Documentation</h3> 
<p>To generate docs locally with <a href="https://github.com/pdoc3/pdoc">pdoc</a>:</p> 
<pre><code class="language-shell">uv sync --all-extras --group docs
uv run --active pdoc --skip-errors --html --output-dir=docs livekit
</code></pre> 
<!--BEGIN_REPO_NAV--> 
<p><br /></p>
<p></p>
<table> 
 <thead>
  <tr>
   <th colspan="2">LiveKit Ecosystem</th>
  </tr>
 </thead> 
 <tbody> 
  <tr>
   <td>Agents SDKs</td>
   <td><b>Python</b> · <a href="https://github.com/livekit/agents-js">Node.js</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>LiveKit SDKs</td>
   <td><a href="https://github.com/livekit/client-sdk-js">Browser</a> · <a href="https://github.com/livekit/client-sdk-swift">Swift</a> · <a href="https://github.com/livekit/client-sdk-android">Android</a> · <a href="https://github.com/livekit/client-sdk-flutter">Flutter</a> · <a href="https://github.com/livekit/client-sdk-react-native">React Native</a> · <a href="https://github.com/livekit/rust-sdks">Rust</a> · <a href="https://github.com/livekit/node-sdks">Node.js</a> · <a href="https://github.com/livekit/python-sdks">Python</a> · <a href="https://github.com/livekit/client-sdk-unity">Unity</a> · <a href="https://github.com/livekit/client-sdk-unity-web">Unity (WebGL)</a> · <a href="https://github.com/livekit/client-sdk-esp32">ESP32</a> · <a href="https://github.com/livekit/client-sdk-cpp">C++</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>Starter Apps</td>
   <td><a href="https://github.com/livekit-examples/agent-starter-python">Python Agent</a> · <a href="https://github.com/livekit-examples/agent-starter-node">TypeScript Agent</a> · <a href="https://github.com/livekit-examples/agent-starter-react">React App</a> · <a href="https://github.com/livekit-examples/agent-starter-swift">SwiftUI App</a> · <a href="https://github.com/livekit-examples/agent-starter-android">Android App</a> · <a href="https://github.com/livekit-examples/agent-starter-flutter">Flutter App</a> · <a href="https://github.com/livekit-examples/agent-starter-react-native">React Native App</a> · <a href="https://github.com/livekit-examples/agent-starter-embed">Web Embed</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>UI Components</td>
   <td><a href="https://github.com/livekit/components-js">React</a> · <a href="https://github.com/livekit/components-android">Android Compose</a> · <a href="https://github.com/livekit/components-swift">SwiftUI</a> · <a href="https://github.com/livekit/components-flutter">Flutter</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>Server APIs</td>
   <td><a href="https://github.com/livekit/node-sdks">Node.js</a> · <a href="https://github.com/livekit/server-sdk-go">Golang</a> · <a href="https://github.com/livekit/server-sdk-ruby">Ruby</a> · <a href="https://github.com/livekit/server-sdk-kotlin">Java/Kotlin</a> · <a href="https://github.com/livekit/python-sdks">Python</a> · <a href="https://github.com/livekit/rust-sdks">Rust</a> · <a href="https://github.com/agence104/livekit-server-sdk-php">PHP (community)</a> · <a href="https://github.com/pabloFuente/livekit-server-sdk-dotnet">.NET (community)</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>Resources</td>
   <td><a href="https://docs.livekit.io">Docs</a> · <a href="https://docs.livekit.io/mcp">Docs MCP Server</a> · <a href="https://github.com/livekit/livekit-cli">CLI</a> · <a href="https://cloud.livekit.io">LiveKit Cloud</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>LiveKit Server OSS</td>
   <td><a href="https://github.com/livekit/livekit">LiveKit server</a> · <a href="https://github.com/livekit/egress">Egress</a> · <a href="https://github.com/livekit/ingress">Ingress</a> · <a href="https://github.com/livekit/sip">SIP</a></td>
  </tr>
  <tr></tr> 
  <tr>
   <td>Community</td>
   <td><a href="https://community.livekit.io">Developer Community</a> · <a href="https://livekit.io/join-slack">Slack</a> · <a href="https://x.com/livekit">X</a> · <a href="https://www.youtube.com/@livekit_io">YouTube</a></td>
  </tr> 
 </tbody> 
</table> 
<!--END_REPO_NAV-->