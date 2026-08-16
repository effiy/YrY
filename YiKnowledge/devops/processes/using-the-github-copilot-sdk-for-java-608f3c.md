---
title: Using the GitHub Copilot SDK for Java
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-16'
source: https://github.blog/engineering/using-the-github-copilot-sdk-for-java/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Mon, 10 Aug 2026 19:30:00 +0000
author: Edward Burns
---

<p class="wp-block-paragraph">Java developers no longer have to rely on Java framework-specific approaches to drive AI from their enterprise apps.</p>



<p class="wp-block-paragraph">While it is true that Langchain4j empowered developers by disintermediating specific AI vendors, you still had a dependency on Langchain4j. And with Spring AI, well, of course you had a dependency on design choices made by Spring, if not on Spring itself.</p>



<p class="wp-block-paragraph">Now, GitHub Copilot SDK for Java is the first truly framework agnostic way to drive AI from Java. And with its BYOK support, GitHub Copilot SDK for Java is also AI vendor neutral.</p>



<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>&#128161; Even though it&rsquo;s called GitHub Copilot SDK, you can use it with any direct model provider, such as OpenAI, Azure, Anthropic, or OpenAI-compatible endpoints, by passing a <code>provider</code>/<code>ProviderConfig</code> with your own <code>baseUrl</code> + <code>apiKey</code> (or bearer token). No Copilot subscription required.</td></tr></tbody></table></figure>



<p class="wp-block-paragraph">The GitHub Copilot SDK for Java is a client library that empowers your server-side Java code to create Copilot agent sessions, register tools, send prompts, and receive structured responses&mdash;all programmatically. It works in server environments, including Jakarta EE and Spring. If you&rsquo;ve been building enterprise Java for any length of time, this SDK will feel like home: <code>CompletableFuture</code>, annotations, lambdas, virtual threads, it&rsquo;s all here.</p>



<p class="wp-block-paragraph">This post shows you how to use the SDK, walks through a complete Jakarta EE 11 sample application, and leaves you with concrete next steps to try it yourself. I chose Jakarta EE 11 for my demo because I was the lead release coordinator for that release. I believe in open standards as the best way to empower developers. For more on Jakarta EE 11 see <a href="https://www.infoq.com/news/2025/07/jakarta-ee-11-updates/">this InfoQ article</a>.</p>



<p class="wp-block-paragraph">This sample app is an agent harness using Jakarta EE 11. But, of course, developers can build their own agent harness using the well-known Java frameworks and libraries of their choice.</p>



<p class="wp-block-paragraph"><a href="https://github.com/microsoft/Build26-BRK206-your-agent-anywhere-multiclient-multidevice-with-github-copilot-sdk">Clone the sample app and try it yourself &gt;</a></p>



<h2 class="wp-block-heading" id="h-where-to-get-it">Where to get it</h2>



<p class="wp-block-paragraph">The SDK is available as a Maven dependency:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>&lt;dependency&gt;
    &lt;groupId&gt;com.github&lt;/groupId&gt;
    &lt;artifactId&gt;copilot-sdk-java&lt;/artifactId&gt;
    &lt;version&gt;1.0.7-preview.1&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph"><strong>Prerequisites:</strong></p>



<ul class="wp-block-list">
<li>JDK 17 or 25 (25 recommended &mdash; unlocks virtual threads and other modern features)</li>



<li>Maven 3.9+</li>



<li>A GitHub account with an active Copilot subscription</li>



<li>The Copilot CLI installed locally at version 1.0.71 or later.</li>
</ul>



<h2 class="wp-block-heading" id="h-walk-through-the-sample-app">Walk through the sample app</h2>



<p class="wp-block-paragraph">The best way to see the SDK in action is to run <a href="https://github.com/microsoft/Build26-BRK206-your-agent-anywhere-multiclient-multidevice-with-github-copilot-sdk">this sample application</a>.</p>



<h3 class="wp-block-heading" id="h-get-the-code">Get the code</h3>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>git clone https://github.com/microsoft/Build26-BRK206-your-agent-anywhere-multiclient-multidevice-with-github-copilot-sdk.git
cd Build26-BRK206-your-agent-anywhere-multiclient-multidevice-with-github-copilot-sdk/src/java-agent-orchestrator
mvn clean package liberty:run
# Open http://localhost:9080/index.xhtml</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The Java demo is built on:</p>



<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th>Concern</th><th>Technology</th></tr></thead><tbody><tr><td>Runtime</td><td>Open Liberty 26.0.0.5</td></tr><tr><td>Platform</td><td>Jakarta EE 11 (Faces 4.1, CDI 4.1, WebSocket 2.2, Data 1.0, Persistence 3.2)</td></tr><tr><td>UI</td><td>PrimeFaces 15.0.16</td></tr><tr><td>AI orchestration</td><td>Copilot SDK for Java 1.0.7-preview.1</td></tr><tr><td>Database</td><td>H2 in-memory (10 seed property listings)</td></tr></tbody></table></figure>



<h3 class="wp-block-heading" id="h-what-the-app-does">What the app does</h3>



<p class="wp-block-paragraph">The application is a real-estate lead-management agent pipeline. A customer submits an enquiry (&ldquo;I&rsquo;m looking for a 3-bedroom house in London under &pound;800,000&rdquo;), and the system spins up an isolated Copilot Agent on a virtual thread to process it through a pipeline:</p>



<figure class="wp-block-image size-large"><img alt="Application flow diagram showing the pipeline stages: Customer Enquiry flows to QUEUED, then VALIDATING, which branches to either SEARCHING (if genuine) or REJECTED (if spam/off-topic). SEARCHING leads to WRITING_REPORT (if matches found) or NO MATCHES. WRITING_REPORT completes at DONE." class="wp-image-98000" height="173" src="https://github.blog/wp-content/uploads/2026/08/figure-01-app-flow-diagram.png?resize=1024%2C173" width="1024" /></figure>



<p class="wp-block-paragraph">The architecture uses Jakarta WebSocket to push real-time status updates from the server to the browser, so you can watch agents progress through phases as the model calls tools:</p>



<figure class="wp-block-image size-large"><img alt="Application architecture diagram showing Browser with Pipeline Dashboard connecting to Open Liberty server containing AppState, CopilotClient in EMPTY mode, virtual thread agents, and WebSocket push for real-time UI updates." class="wp-image-98001" height="628" src="https://github.blog/wp-content/uploads/2026/08/figure-02-app-architecture-diagram.png?resize=1024%2C628" width="1024" /></figure>



<p class="wp-block-paragraph">Submit multiple inquiries simultaneously to see concurrent virtual-thread agents in action. Each one processes independently with its own Copilot session.</p>



<figure class="wp-block-image size-large"><img alt="Screenshot of the sample application showing the pipeline dashboard with multiple enquiries being processed concurrently." class="wp-image-98002" height="940" src="https://github.blog/wp-content/uploads/2026/08/figure-03-sample-app-01.png?resize=1024%2C940" width="1024" /></figure>



<figure class="wp-block-image size-large"><img alt="Screenshot of the sample application showing detailed agent event log and property search results." class="wp-image-98003" height="1024" src="https://github.blog/wp-content/uploads/2026/08/figure-04-sample-app-02.png?resize=778%2C1024" width="778" /></figure>



<h3 class="wp-block-heading" id="h-sdk-features-in-action">SDK features in action</h3>



<p class="wp-block-paragraph">Let&rsquo;s walk through the key SDK features as they appear in the sample code.</p>



<h4 class="wp-block-heading" id="h-defining-tools-with-copilottool">Defining tools with <code>@CopilotTool</code></h4>



<p class="wp-block-paragraph">This is the headline API. If you&rsquo;ve ever written a <code>@GET</code> endpoint in JAX-RS or an <code>@MessageDriven</code> bean, this will feel instantly familiar:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>@CopilotTool(value = "Sets the current phase of the agent. Use this to report progress.",
             name = "set_current_phase")
public String setCurrentPhase(
        @CopilotToolParam("The phase to transition to (VALIDATING, SEARCHING, "
                + "WRITING_REPORT, REJECTED_GARBAGE, REJECTED_NO_MATCHES, or DONE)")
        String phaseName) {
    phase = Phase.valueOf(phaseName.trim().toUpperCase(Locale.ROOT));
    notifyUi();
    return "Phase set to " + phase.getLabel();
}</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The <code>@CopilotTool</code> annotation declares the method as a tool the model can call. The <code>@CopilotToolParam</code> annotation describes each parameter so the model knows what to pass. The SDK handles all the JSON Schema generation, argument parsing, and dispatch. You just write a normal Java method.</p>



<p class="wp-block-paragraph"><strong>Two build prerequisites for <code>@CopilotTool</code>.</strong> The annotation-based tool API is currently an experimental feature of the SDK, so you need to configure two things in your Maven build:</p>



<ol class="wp-block-list">
<li><strong>Enable experimental APIs</strong>: pass <code>-Acopilot.experimental.allowed=true</code> to the compiler. Without this flag, the annotation processor will refuse to generate the tool metadata. For more details on the experimental APIs see <a href="https://github.com/github/copilot-sdk/tree/main/java#using-experimental-apis">Copilot SDK documentation</a>.</li>



<li><strong>Register the annotation processor</strong>: add the SDK as an <code>annotationProcessorPath</code> so the compiler can find the <code>@CopilotTool</code> processor and generate the <code>$$CopilotToolMeta</code> classes at compile time.</li>
</ol>



<p class="wp-block-paragraph">Both are configured in the <code>maven-compiler-plugin</code>:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>&lt;plugin&gt;
    &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
    &lt;artifactId&gt;maven-compiler-plugin&lt;/artifactId&gt;
    &lt;version&gt;3.15.0&lt;/version&gt;
    &lt;configuration&gt;
        &lt;compilerArgs&gt;
            &lt;arg&gt;-Acopilot.experimental.allowed=true&lt;/arg&gt;
        &lt;/compilerArgs&gt;
        &lt;annotationProcessorPaths&gt;
            &lt;path&gt;
                &lt;groupId&gt;com.github&lt;/groupId&gt;
                &lt;artifactId&gt;copilot-sdk-java&lt;/artifactId&gt;
                &lt;version&gt;1.0.7-preview.1&lt;/version&gt;
            &lt;/path&gt;
        &lt;/annotationProcessorPaths&gt;
    &lt;/configuration&gt;
&lt;/plugin&gt;</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">To register all annotated tools from an object:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>List&lt;ToolDefinition&gt; annotatedTools = ToolDefinition.fromObject(this);</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<h4 class="wp-block-heading" id="h-inline-lambda-tools-with-tooldefinition-from">Inline lambda tools with <code>ToolDefinition.from(...)</code></h4>



<p class="wp-block-paragraph">When you want a tool defined at the call site without a dedicated method, use the lambda style:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>ToolDefinition reportIntentTool = ToolDefinition
        .from("report_intent",
              "Reports the current intent of the agent",
              Param.of(String.class, "intent", "Intent in max 4 words"),
              (String intent) -&gt; {
                  currentIntent = intent;
                  addEvent(Instant.now(), "intent", "Intent updated", intent);
                  notifyUi();
                  return "ok";
              })
        .overridesBuiltInTool(true);</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Notice <code>.overridesBuiltInTool(true)</code>. This tells the SDK that our <code>report_intent</code> tool deliberately replaces a built-in tool of the same name. This is useful when you need custom behaviour for a tool the model already knows about.</p>



<h4 class="wp-block-heading" id="h-cross-class-tool-scanning">Cross-class tool scanning</h4>



<p class="wp-block-paragraph">Tools don&rsquo;t have to live in the same class as your agent logic. Here&rsquo;s <code>searchProperties</code> defined in a separate CDI bean:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>@ApplicationScoped
public class PropertyDatabase {

    @CopilotTool(value = "Searches the real estate listings database. "
                       + "Returns up to 10 matching properties.",
                 name = "search_properties")
    public List&lt;Property&gt; searchProperties(
            @CopilotToolParam("Property type substring (e.g. 'flat', 'house')") String type,
            @CopilotToolParam("City substring (e.g. 'London', 'Bristol')") String city,
            @CopilotToolParam("Minimum number of bedrooms (0 for no minimum)") int minBedrooms,
            @CopilotToolParam("Maximum price in GBP (0 for no maximum)") double maxPriceGbp) {
        // ... filter and return matching properties ...
    }
}</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">You would normally register these with <code>ToolDefinition.fromObject(propertyDatabase)</code>. In the sample app, we use a lambda wrapper instead, because CDI client proxies can obscure the annotation metadata.</p>



<h4 class="wp-block-heading" id="h-customizing-the-system-message">Customizing the system message</h4>



<p class="wp-block-paragraph">The SDK gives you fine-grained control over the system message. Use <code>SystemMessageMode.CUSTOMIZE</code> to replace specific sections while preserving the rest:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>SystemMessageConfig systemMessage = new SystemMessageConfig()
        .setMode(SystemMessageMode.CUSTOMIZE)
        .setSections(Map.of(SystemMessageSections.IDENTITY,
            new SectionOverride()
                .setAction(SectionOverrideAction.REPLACE)
                .setContent("""
                    You are part of a real estate recommendation system.
                    You will receive enquiries from customers, and you must
                    carry out the following workflow...
                    """)));</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The text block (<code>"""..."""</code>) makes multi-line prompts readable without string concatenation. The <code>IDENTITY</code> section override replaces only the model&rsquo;s self-description while leaving safety guardrails intact. If you prefer a simpler approach, <code>SystemMessageMode.APPEND</code> adds your content after the default system message without replacing anything.</p>



<h4 class="wp-block-heading" id="h-the-agentic-loop-sendandwait">The agentic loop: <code>sendAndWait(...)</code></h4>



<p class="wp-block-paragraph">One line kicks off the full agentic loop:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>session = client.createSession(sessionConfig).get();
// ...
AssistantMessageEvent result = session.sendAndWait(escapedEnquiry).get();</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Behind <code>.get()</code>, the model reasons, calls your tools (potentially multiple times), and returns its final response. On a virtual thread, <code>.get()</code> is cheap. No platform thread is consumed while waiting. The SDK dispatches tool calls to your registered handlers automatically and feeds results back to the model until it&rsquo;s done.</p>



<h4 class="wp-block-heading" id="h-real-time-event-handling-with-session-on">Real-time event handling with <code>session.on(...)</code></h4>



<p class="wp-block-paragraph">Subscribe to session events to build responsive UIs:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>sessionSubscription = session.on(event -&gt; {
    captureSessionEvent(event);
    uiUpdateSocket.pushDetailUpdate(id);
});</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Every tool call, every result, every assistant message fires an event. The sample app captures these events and pushes them to the browser via Jakarta WebSocket, so the pipeline dashboard updates in real time. You can use pattern matching to handle specific event types:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>if (event instanceof AssistantMessageEvent msg) {
    finalReport = msg.getData().content();
} else if (event instanceof ToolExecutionStartEvent start) {
    // Tool is being invoked...
}</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<h4 class="wp-block-heading" id="h-headless-client-and-permission-handling">Headless client and permission handling</h4>



<p class="wp-block-paragraph">The client is configured for server-side operation:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>copilotClient = new CopilotClient(
        new CopilotClientOptions()
                .setMode(CopilotClientMode.EMPTY)
                .setCopilotHome(copilotHome)
                .setExecutor(contextualVirtualThreadExecutor));</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph"><code>CopilotClientMode.EMPTY</code> means no IDE integration &mdash; the client talks directly to the Copilot CLI. The custom <code>Executor</code> (discussed below) ensures tool callbacks run with container context.</p>



<p class="wp-block-paragraph">For permission handling, the sample uses:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>sessionConfig.setOnPermissionRequest(PermissionHandler.APPROVE_ALL);</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph"><code>APPROVE_ALL</code> is appropriate for demos and development. In production, implement a real permission policy that validates which tools the model is allowed to invoke.</p>



<h3 class="wp-block-heading" id="h-jakarta-ee-integration-patterns">Jakarta EE integration patterns</h3>



<p class="wp-block-paragraph">The SDK is not a framework island. It composes naturally with Jakarta EE &mdash; and of course also with proprietary frameworks such as Spring.</p>



<p class="wp-block-paragraph"><strong>The <code>Executor</code> parameter is the key integration point.</strong> Jakarta Concurrency (&sect;5.2 in the 3.1 spec) requires that application-created threads be obtained from a <code>ManagedThreadFactory</code> so the container can:</p>



<ol class="wp-block-list">
<li>Track the thread for lifecycle shutdown (<code>@PreDestroy</code> / server stop)</li>



<li>Apply concurrency constraints and policies</li>



<li>Propagate context automatically (without needing manual <code>contextualRunnable</code>)</li>
</ol>



<p class="wp-block-paragraph">Open Liberty 26.x supports virtual-thread <code>ManagedThreadFactory</code> via the <code>virtual</code> attribute in <code>server.xml</code>.</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>&lt;managedThreadFactory jndiName="concurrent/virtualThreadFactory" virtual="true" /&gt;</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Then, in <code>AppState.java</code> we inject the factory:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>@Resource(lookup = "concurrent/virtualThreadFactory")
private ManagedThreadFactory virtualThreadFactory;</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">And use it to create the <code>Executor</code> we pass to the Copilot SDK.</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>// The ManagedThreadFactory (virtual=true) creates container-managed virtual
// threads that automatically propagate CDI, JNDI, and transaction context.
Executor managedVirtualExecutor = runnable -&gt;
    virtualThreadFactory.newThread(runnable).start()

String copilotHome = Path.of(System.getProperty("user.home"), ".copilot").toString();
CopilotClientOptions copilotClientOptions = new CopilotClientOptions()
        .setMode(CopilotClientMode.EMPTY)
        .setCopilotHome(copilotHome)
        .setExecutor(managedVirtualExecutor);
copilotClient = new CopilotClient(copilotClientOptions);</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">This creates virtual threads that carry the container&rsquo;s context. When the SDK dispatches a tool call to <code>searchProperties()</code>, that method can <code>@Inject</code> a JPA repository and query the database, because the container context is present on the callback thread.</p>



<p class="wp-block-paragraph">Other integration patterns in the sample:</p>



<ul class="wp-block-list">
<li><strong>CDI <code>@ApplicationScoped</code></strong> for the singleton <code>CopilotClient</code> (one client per application lifecycle).</li>



<li><strong>Jakarta Faces <code>f:websocket</code> push</strong> for real-time browser updates via <code>PushContext</code>.</li>



<li><strong>Jakarta Data <code>@Repository</code></strong> for type-safe database queries without raw JPA boilerplate.</li>
</ul>



<p class="wp-block-paragraph"><strong>Fine-grained tool access control with <code>ToolSet</code>.</strong> The <code>SessionConfig</code> lets you specify exactly which tools each session can access:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code"><code>sessionConfig.setAvailableTools(new ToolSet()
        .addCustom("*")           // all registered custom tools
        .addBuiltIn("web_fetch")); // only the web_fetch built-in</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">This is an important production concern. Rather than exposing every built-in tool (file system access, shell execution, etc.), you explicitly opt in to only what the agent needs. In the sample app, we allow all custom tools plus <code>web_fetch</code> so the agent can look up real-time property information during the Search phase.</p>



<h2 class="wp-block-heading" id="h-summary">Summary</h2>



<p class="wp-block-paragraph">Here&rsquo;s what we covered:</p>



<ul class="wp-block-list">
<li><strong>Java-native API</strong>: <code>CompletableFuture</code>, annotations, lambdas, and virtual threads make the SDK feel like idiomatic Java, not a ported-from-another-language afterthought.</li>



<li><strong>Three tool-definition styles</strong>: annotations for enterprise patterns, lambdas for inline convenience, JSON Schema for full control.</li>



<li><strong>System message customization</strong>: section-level overrides give you precise control over agent behaviour.</li>



<li><strong>The agentic loop in one line</strong>: <code>sendAndWait(...)</code> handles the full tool-calling loop automatically.</li>



<li><strong>Real-time event streaming</strong>: <code>session.on(...)</code> enables responsive UIs and observability.</li>



<li><strong>Headless server-side operation</strong>: no IDE required; runs anywhere the Copilot CLI is available.</li>



<li><strong>Natural composition with Jakarta EE</strong>: CDI, JPA, WebSocket, and virtual threads all work together through the <code>Executor</code> integration point.</li>
</ul>



<h2 class="wp-block-heading" id="h-what-to-try-next">What to try next</h2>



<ul class="wp-block-list">
<li><strong>Explore the BYOK support.</strong> The GitHub Copilot SDK can be used directly against model providers, for example OpenAI, Azure, Anthropic, or OpenAI-compatible endpoints, by passing a <code>provider</code>/<code>ProviderConfig</code> with your own <code>baseUrl</code> + <code>apiKey</code> (or bearer token). No Copilot subscription required.</li>



<li><strong>Clone the sample app</strong> and run it locally. Submit multiple enquiries simultaneously to see virtual threads in action.</li>



<li><strong>Swap the model.</strong> Try <code>session.setModel(...)</code> to experiment with different Copilot models.</li>



<li><strong>Add your own tool.</strong> Define a new <code>@CopilotTool</code> method (a mortgage calculator, a school-district lookup) and watch the agent discover and use it.</li>



<li><strong>Deploy to Azure.</strong> Open Liberty runs great on Azure App Service, AKS, or Azure Container Apps. See the Jakarta EE on Azure guidance at <a href="https://aka.ms/java/ee">https://aka.ms/java/ee</a>.</li>
</ul>



<p class="wp-block-paragraph">The Copilot SDK for Java puts the full power of GitHub Copilot behind your Java code with no IDE required and no framework lock-in.</p>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><a href="https://github.com/microsoft/Build26-BRK206-your-agent-anywhere-multiclient-multidevice-with-github-copilot-sdk">Clone the sample app and try it yourself &gt;</a></p>
</div>

<p>The post <a href="https://github.blog/engineering/using-the-github-copilot-sdk-for-java/">Using the GitHub Copilot SDK for Java</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>