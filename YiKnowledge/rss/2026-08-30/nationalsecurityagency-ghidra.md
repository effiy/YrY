---
title: NationalSecurityAgency/ghidra
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/NationalSecurityAgency/ghidra
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Ghidra is a software reverse engineering (SRE) framework</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://www.nsa.gov/ghidra">https://www.nsa.gov/ghidra</a></p><hr /><img src="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/Ghidra/Features/Base/src/main/resources/images/GHIDRA_3.png" width="400" /> 
<h1>Ghidra Software Reverse Engineering Framework</h1> 
<p>Ghidra is a software reverse engineering (SRE) framework created and maintained by the <a href="https://www.nsa.gov">National Security Agency</a> Research Directorate. This framework includes a suite of full-featured, high-end software analysis tools that enable users to analyze compiled code on a variety of platforms including Windows, macOS, and Linux. Capabilities include disassembly, assembly, decompilation, graphing, and scripting, along with hundreds of other features. Ghidra supports a wide variety of processor instruction sets and executable formats and can be run in both user-interactive and automated modes. Users may also develop their own Ghidra extension components and/or scripts using Java or Python.</p> 
<p>In support of NSA's Cybersecurity mission, Ghidra was built to solve scaling and teaming problems on complex SRE efforts, and to provide a customizable and extensible SRE research platform. NSA has applied Ghidra SRE capabilities to a variety of problems that involve analyzing malicious code and generating deep insights for SRE analysts who seek a better understanding of potential vulnerabilities in networks and systems.</p> 
<p>If you are a U.S. citizen interested in projects like this, to develop Ghidra and other cybersecurity tools for NSA to help protect our nation and its allies, consider applying for a <a href="https://www.intelligencecareers.gov/nsa">career with us</a>.</p> 
<h2>Security Warning</h2> 
<p><strong>WARNING:</strong> There are known security vulnerabilities within certain versions of Ghidra. Before proceeding, please read through Ghidra's <a href="https://github.com/NationalSecurityAgency/ghidra/security/advisories">Security Advisories</a> for a better understanding of how you might be impacted.</p> 
<h2>Install</h2> 
<p>To install an official pre-built multi-platform Ghidra release:</p> 
<ul> 
 <li>Install <a href="https://adoptium.net/temurin/releases">JDK 21 64-bit</a></li> 
 <li>Download a Ghidra <a href="https://github.com/NationalSecurityAgency/ghidra/releases">release file</a> 
  <ul> 
   <li><strong>NOTE:</strong> The official multi-platform release file is named <code>ghidra_&lt;version&gt;_&lt;release&gt;_&lt;date&gt;.zip</code> which can be found under the "Assets" drop-down. Downloading either of the files named "Source Code" is not correct for this step.</li> 
  </ul> </li> 
 <li>Extract the Ghidra release file 
  <ul> 
   <li><strong>NOTE:</strong> Do not extract on top of an existing installation</li> 
  </ul> </li> 
 <li>Launch Ghidra: <code>./ghidraRun</code> (<code>ghidraRun.bat</code> for Windows) 
  <ul> 
   <li>or launch <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/Ghidra/Features/PyGhidra/README.md">PyGhidra</a>: <code>./support/pyghidraRun</code> (<code>support\pyghidraRun.bat</code> for Windows)</li> 
  </ul> </li> 
</ul> 
<p>For additional information and troubleshooting tips about installing and running a Ghidra release, please refer to the <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/GhidraDocs/GettingStarted.md">Getting Started</a> document which can be found at the root of a Ghidra installation directory.</p> 
<h2>Build</h2> 
<p><a href="https://github.com/NationalSecurityAgency/ghidra/actions/workflows/build-ghidra.yml"><img alt="Build Ghidra" src="https://github.com/NationalSecurityAgency/ghidra/actions/workflows/build-ghidra.yml/badge.svg?sanitize=true" /></a></p> 
<p>To create the latest development build for your platform from this source repository:</p> 
<h5>Install build tools:</h5> 
<ul> 
 <li><a href="https://adoptium.net/temurin/releases">JDK 25 64-bit</a></li> 
 <li><a href="https://gradle.org/releases/">Gradle 9.1.0+</a> (or provided Gradle wrapper if Internet connection is available)</li> 
 <li><a href="https://www.python.org/downloads/">Python3</a> (version 3.9 to 3.14) with bundled pip</li> 
 <li>GCC or Clang, and make (Linux/macOS-only)</li> 
 <li><a href="https://visualstudio.microsoft.com/vs/community/">Microsoft Visual Studio</a> 2017+ or <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/">Microsoft C++ Build Tools</a> with the following components installed (Windows-only): 
  <ul> 
   <li>MSVC</li> 
   <li>Windows SDK</li> 
   <li>C++ ATL</li> 
  </ul> </li> 
</ul> 
<h5>Download and extract the source:</h5> 
<p><a href="https://github.com/NationalSecurityAgency/ghidra/archive/refs/heads/master.zip">Download from GitHub</a></p> 
<pre><code>unzip ghidra-master
cd ghidra-master
</code></pre> 
<p><strong>NOTE:</strong> Instead of downloading the compressed source, you may instead want to clone the GitHub repository: <code>git clone https://github.com/NationalSecurityAgency/ghidra.git</code></p> 
<h5>Download additional build dependencies into source repository:</h5> 
<p><strong>NOTE:</strong> If an Internet connection is available and you did not install Gradle, the <code>./gradlew</code> (or <code>gradlew.bat</code>) command may be used in place of the <code>gradle</code> command in the following instructions.</p> 
<pre><code>gradle -I gradle/support/fetchDependencies.gradle
</code></pre> 
<h5>Create development build:</h5> 
<pre><code>gradle buildGhidra
</code></pre> 
<p>The compressed development build will be located at <code>build/dist/</code>.</p> 
<p>For more detailed information on building Ghidra, please read the <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/DevGuide.md">Developer's Guide</a>.</p> 
<p>For issues building, please check the <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/DevGuide.md#known-issues">Known Issues</a> section for possible solutions.</p> 
<h2>Develop</h2> 
<h3>User Scripts and Extensions</h3> 
<p>Ghidra installations support users writing custom scripts and extensions via the <em>GhidraDev</em> plugin for Eclipse. The plugin and its corresponding instructions can be found within a Ghidra release at <code>Extensions/Eclipse/GhidraDev/</code> or at <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/GhidraBuild/EclipsePlugins/GhidraDev/GhidraDevPlugin/README.md">this link</a>. Alternatively, Visual Studio Code may be used to edit scripts by clicking the Visual Studio Code icon in the Script Manager. Fully-featured Visual Studio Code projects can be created from a Ghidra CodeBrowser window at <em>Tools -&gt; Create VSCode Module project</em>.</p> 
<p><strong>NOTE:</strong> Both the <em>GhidraDev</em> plugin for Eclipse and Visual Studio Code integrations only support developing against fully built Ghidra installations which can be downloaded from the <a href="https://github.com/NationalSecurityAgency/ghidra/releases">Releases</a> page.</p> 
<h3>Advanced Development</h3> 
<p>To develop the Ghidra tool itself, it is highly recommended to use Eclipse, which the Ghidra development process has been highly customized for.</p> 
<h5>Install build and development tools:</h5> 
<ul> 
 <li>Follow the above <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/#build">build instructions</a> so the build completes without errors</li> 
 <li>Install <a href="https://www.eclipse.org/downloads/packages/">Eclipse IDE for Java Developers</a></li> 
</ul> 
<h5>Prepare the development environment:</h5> 
<pre><code>gradle prepdev eclipse buildNatives
</code></pre> 
<h5>Import Ghidra projects into Eclipse:</h5> 
<ul> 
 <li><em>File</em> -&gt; <em>Import...</em></li> 
 <li><em>General</em> | <em>Existing Projects into Workspace</em></li> 
 <li>Select root directory to be your downloaded or cloned ghidra source repository</li> 
 <li>Check <em>Search for nested projects</em></li> 
 <li>Click <em>Finish</em></li> 
</ul> 
<p>When Eclipse finishes building the projects, Ghidra can be launched and debugged with the provided <strong>Ghidra</strong> Eclipse <em>run configuration</em>.</p> 
<p>For more detailed information on developing Ghidra, please read the <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/DevGuide.md">Developer's Guide</a>.</p> 
<h2>Contribute</h2> 
<p>If you would like to contribute bug fixes, improvements, and new features back to Ghidra, please take a look at our <a href="https://raw.githubusercontent.com/NationalSecurityAgency/ghidra/master/CONTRIBUTING.md">Contributor's Guide</a> to see how you can participate in this open source project.</p>