---
title: google/googletest
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-29'
source: https://github.com/google/googletest
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>GoogleTest - Google Testing and Mocking Framework</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://google.github.io/googletest/">https://google.github.io/googletest/</a></p><hr /><h1>GoogleTest</h1> 
<h3>Announcements</h3> 
<h4>Documentation Updates</h4> 
<p>Our documentation is now live on GitHub Pages at <a href="https://google.github.io/googletest/">https://google.github.io/googletest/</a>. We recommend browsing the documentation on GitHub Pages rather than directly in the repository.</p> 
<h4>Release 1.18.0</h4> 
<p><a href="https://github.com/google/googletest/releases/tag/v1.18.0">Release 1.18.0</a> is now available.</p> 
<p>The 1.18.x branch <a href="https://opensource.google/documentation/policies/cplusplus-support#c_language_standard">requires at least C++17</a>.</p> 
<h4>Continuous Integration</h4> 
<p>We use Google's internal systems for continuous integration.</p> 
<h4>Coming Soon</h4> 
<ul> 
 <li>We are planning to take a dependency on <a href="https://github.com/abseil/abseil-cpp">Abseil</a>.</li> 
</ul> 
<h2>Welcome to <strong>GoogleTest</strong>, Google's C++ test framework!</h2> 
<p>This repository is a merger of the formerly separate GoogleTest and GoogleMock projects. These were so closely related that it makes sense to maintain and release them together.</p> 
<h3>Getting Started</h3> 
<p>See the <a href="https://google.github.io/googletest/">GoogleTest User's Guide</a> for documentation. We recommend starting with the <a href="https://google.github.io/googletest/primer.html">GoogleTest Primer</a>.</p> 
<p>More information about building GoogleTest can be found at <a href="https://raw.githubusercontent.com/google/googletest/main/googletest/README.md">googletest/README.md</a>.</p> 
<h2>Features</h2> 
<ul> 
 <li>xUnit test framework: <br /> Googletest is based on the <a href="https://en.wikipedia.org/wiki/XUnit">xUnit</a> testing framework, a popular architecture for unit testing.</li> 
 <li>Test discovery: <br /> Googletest automatically discovers and runs your tests, eliminating the need to manually register your tests.</li> 
 <li>Rich set of assertions: <br /> Googletest provides a variety of assertions, such as equality, inequality, exceptions, and more, making it easy to test your code.</li> 
 <li>User-defined assertions: <br /> You can define your own assertions with Googletest, making it simple to write tests that are specific to your code.</li> 
 <li>Death tests: <br /> Googletest supports death tests, which verify that your code exits in a certain way, making it useful for testing error-handling code.</li> 
 <li>Fatal and non-fatal failures: <br /> You can specify whether a test failure should be treated as fatal or non-fatal with Googletest, allowing tests to continue running even if a failure occurs.</li> 
 <li>Value-parameterized tests: <br /> Googletest supports value-parameterized tests, which run multiple times with different input values, making it useful for testing functions that take different inputs.</li> 
 <li>Type-parameterized tests: <br /> Googletest also supports type-parameterized tests, which run with different data types, making it useful for testing functions that work with different data types.</li> 
 <li>Various options for running tests: <br /> Googletest provides many options for running tests including running individual tests, running tests in a specific order and running tests in parallel.</li> 
</ul> 
<h2>Supported Platforms</h2> 
<p>GoogleTest follows Google's <a href="https://opensource.google/documentation/policies/cplusplus-support">Foundational C++ Support Policy</a>. See <a href="https://github.com/google/oss-policies-info/raw/main/foundational-cxx-support-matrix.md">this table</a> for a list of currently supported versions of compilers, platforms, and build tools.</p> 
<h2>Who Is Using GoogleTest?</h2> 
<p>In addition to many internal projects at Google, GoogleTest is also used by the following notable projects:</p> 
<ul> 
 <li>The <a href="https://www.chromium.org/">Chromium projects</a> (behind the Chrome browser and Chrome OS).</li> 
 <li>The <a href="https://llvm.org/">LLVM</a> compiler.</li> 
 <li><a href="https://github.com/google/protobuf">Protocol Buffers</a>, Google's data interchange format.</li> 
 <li>The <a href="https://opencv.org/">OpenCV</a> computer vision library.</li> 
</ul> 
<h2>Related Open Source Projects</h2> 
<p><a href="https://github.com/nholthaus/gtest-runner">GTest Runner</a> is a Qt5 based automated test-runner and Graphical User Interface with powerful features for Windows and Linux platforms.</p> 
<p><a href="https://github.com/ospector/gtest-gbar">GoogleTest UI</a> is a test runner that runs your test binary, allows you to track its progress via a progress bar, and displays a list of test failures. Clicking on one shows failure text. GoogleTest UI is written in C#.</p> 
<p><a href="https://github.com/kinow/gtest-tap-listener">GTest TAP Listener</a> is an event listener for GoogleTest that implements the <a href="https://en.wikipedia.org/wiki/Test_Anything_Protocol">TAP protocol</a> for test result output. If your test runner understands TAP, you may find it useful.</p> 
<p><a href="https://github.com/google/gtest-parallel">gtest-parallel</a> is a test runner that runs tests from your binary in parallel to provide significant speed-up.</p> 
<p><a href="https://marketplace.visualstudio.com/items?itemName=DavidSchuldenfrei.gtest-adapter">GoogleTest Adapter</a> is a VS Code extension allowing to view GoogleTest in a tree view and run/debug your tests.</p> 
<p><a href="https://github.com/matepek/vscode-catch2-test-adapter">C++ TestMate</a> is a VS Code extension allowing to view GoogleTest in a tree view and run/debug your tests.</p> 
<p><a href="https://pypi.org/project/cornichon/">Cornichon</a> is a small Gherkin DSL parser that generates stub code for GoogleTest.</p> 
<h2>Contributing Changes</h2> 
<p>Please read <a href="https://github.com/google/googletest/raw/main/CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a> for details on how to contribute to this project.</p> 
<p>Happy testing!</p>