---
title: swoole/typephp
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/swoole/typephp
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Compile PHP to Native Binaries</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://swoole.com/aot/">https://swoole.com/aot/</a></p><hr /><p><a href="https://raw.githubusercontent.com/swoole/typephp/master/README.md">English</a> | <a href="https://raw.githubusercontent.com/swoole/typephp/master/README-CN.md">简体中文</a></p> 
<div align="center"> 
 <h1>TypePHP</h1> 
 <p><strong>A native AOT compiler for PHP</strong></p> 
 <p>Compile PHP source code into native machine code ahead of time — producing native executables, PHP extensions, and shared libraries — while keeping the PHP syntax you already know.</p> 
 <p><a href="https://github.com/swoole/typephp/actions/workflows/linux-x64.yml"><img alt="Linux x64" src="https://github.com/swoole/typephp/actions/workflows/linux-x64.yml/badge.svg?sanitize=true" /></a> <a href="https://github.com/swoole/typephp/actions/workflows/linux-arm64.yml"><img alt="Linux ARM64" src="https://github.com/swoole/typephp/actions/workflows/linux-arm64.yml/badge.svg?sanitize=true" /></a> <a href="https://github.com/swoole/typephp/actions/workflows/macos-arm64.yml"><img alt="macOS ARM64" src="https://github.com/swoole/typephp/actions/workflows/macos-arm64.yml/badge.svg?sanitize=true" /></a> <a href="https://github.com/swoole/typephp/actions/workflows/windows-build.yml"><img alt="Windows x64" src="https://github.com/swoole/typephp/actions/workflows/windows-build.yml/badge.svg?sanitize=true" /></a> <a href="https://www.php.net/"><img alt="PHP 8.4–8.5" src="https://img.shields.io/badge/PHP-8.4--8.5-777bb4.svg?sanitize=true" /></a> <a href="https://raw.githubusercontent.com/swoole/typephp/master/LICENSE"><img alt="License: GPL-3.0" src="https://img.shields.io/badge/License-GPL--3.0-blue.svg?sanitize=true" /></a></p> 
</div> 
<hr /> 
<h2>What is TypePHP?</h2> 
<p>TypePHP is an Ahead-Of-Time (AOT) compiler that translates PHP source code into C++ and then into native machine code. Unlike a bytecode cache or a VM, it does not interpret opcodes at runtime: it generates optimized native binaries that run directly on the CPU.</p> 
<p>It keeps familiar PHP syntax and adds compile-time type information, so the compiler can emit fast, statically-typed C++ for hot paths. Dynamic PHP values, internal functions, reflection, and object metadata continue to interoperate with the Zend runtime through PHPX; user functions are not executed as Zend opcodes after they have been compiled.</p> 
<p>TypePHP is <strong>written entirely in PHP</strong> and is <strong>fully self-hosting</strong>: the <code>tpc</code> compiler binary is built by compiling the compiler's own PHP source code with TypePHP. The bootstrap chain is pure PHP — no C or C++ glue in the compiler itself.</p> 
<p>TypePHP is under active development. It intentionally supports a defined, testable subset of PHP rather than claiming drop-in compatibility with every dynamic PHP program. Read <a href="https://raw.githubusercontent.com/swoole/typephp/master/#compatibility-model">Compatibility model</a> and the <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/INCOMPATIBLE_PHP_FEATURES.md">incompatible-feature list</a> before adopting it for an existing application.</p> 
<h2>How it works</h2> 
<pre><code class="language-text">PHP source + .stub.php declarations + optional C/C++ sources
                         │
                         ▼
        parse, validate, and collect declarations
                         │
                         ▼
       lower function bodies and constants to C++17
                         │
                         ▼
       native compiler + reusable object/PCH caches
                         │
                         ▼
 executable | PHP extension | shared library | WASI component
</code></pre> 
<p>The prepare phase builds the complete symbol model without allocating runtime cache IDs. Constants and declaration defaults retain their AST until the convert phase, where they are lowered after all project symbols are known. This two-phase design keeps multi-file and self-hosted builds deterministic.</p> 
<h2>Features</h2> 
<ul> 
 <li><strong>Self-hosting, written in PHP</strong> — the TypePHP compiler is implemented entirely in PHP and bootstraps itself: <code>tpc</code> compiles the compiler's own source into a native binary.</li> 
 <li><strong>True AOT compilation</strong> — PHP is lowered to C++17, then to native machine code. No interpreter, no opcode cache, no JIT warm-up.</li> 
 <li><strong>Three native build modes</strong> — build a native <code>bin</code> executable, a loadable PHP <code>ext</code> extension, or a reusable <code>lib</code> shared library from the same codebase.</li> 
 <li><strong>Native type system</strong> — <code>int</code>, <code>float</code>, and <code>bool</code> map directly to C++ scalar types (<code>int64_t</code>, <code>double</code>, <code>bool</code>) for orders-of-magnitude speedups on numeric code.</li> 
 <li><strong>High-precision numerics</strong> — <code>bigInt</code> (GMP), <code>decimal</code> (libmpdec), and <code>bigFloat</code> (MPFR), with typed operators and method APIs.</li> 
 <li><strong>Strongly-typed containers</strong> — <code>std::array</code>, <code>std::vector</code>, <code>std::map</code>, and <code>std::ordered_map</code> with compile-time element types; up to <strong>10×</strong> faster than PHP arrays and on par with C++ <code>std::vector</code>.</li> 
 <li><strong>Universal methods</strong> — call methods directly on primitives (<code>$s-&gt;upper()</code>, <code>$arr-&gt;contains()</code>, <code>$big-&gt;mul(2)</code>); statically-known calls are resolved directly at compile time.</li> 
 <li><strong>Mixed C++ / PHP</strong> — call C++ functions from PHP (and vice versa) for performance-critical kernels.</li> 
 <li><strong>Compile-time functions &amp; keywords</strong> — <code>any()</code>, <code>refval()</code>, <code>objval()</code>, <code>expected()</code>, <code>unexpected()</code>, plus <code>toInt()</code>, <code>toString()</code>, <code>toArray()</code> and friends.</li> 
 <li><strong>Compile-time safety</strong> — <code>#[Immutable]</code> read-only contracts and <code>#[ArrayDef]</code> array-shape metadata, checked at compile time with zero runtime cost.</li> 
 <li><strong>Compile-time code generation</strong> — <code>#[Getter]</code>, <code>#[Setter]</code>, <code>#[With]</code>, <code>#[Constructor]</code>, <code>#[Printer]</code>, and <code>#[Arrayable]</code> generate type-safe methods from property declarations.</li> 
 <li><strong>Modern PHP support</strong> — PHP 8.4 property hooks, asymmetric visibility, PHP 8.5 <code>clone()</code>-with, and <code>(void)</code> discard expressions.</li> 
 <li><strong>Cross-platform &amp; WASM</strong> — Linux, Windows, and macOS targets for x64 and ARM64, plus WASI 0.2 and browser (Jco) output.</li> 
 <li><strong>Python bridge</strong> — generate IDE helpers for Python modules and convert Python scripts to TypePHP.</li> 
</ul> 
<h2>Why TypePHP?</h2> 
<table> 
 <thead> 
  <tr> 
   <th></th> 
   <th>TypePHP AOT</th> 
   <th>Opcode cache (OPcache)</th> 
   <th>JIT (PHP 8+)</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>Compilation target</td> 
   <td>Native machine code</td> 
   <td>Bytecode</td> 
   <td>Machine code (trace)</td> 
  </tr> 
  <tr> 
   <td>Startup / warm-up</td> 
   <td>None (already compiled)</td> 
   <td>Per-process warm-up</td> 
   <td>JIT warm-up</td> 
  </tr> 
  <tr> 
   <td>Type-driven optimization</td> 
   <td>Compile-time, full-program</td> 
   <td>None</td> 
   <td>Limited, trace-based</td> 
  </tr> 
  <tr> 
   <td>Native executable output</td> 
   <td>Yes</td> 
   <td>No</td> 
   <td>No</td> 
  </tr> 
  <tr> 
   <td>Source code protection</td> 
   <td>Compiled to machine code</td> 
   <td>Bytecode (reversible)</td> 
   <td>Bytecode (reversible)</td> 
  </tr> 
  <tr> 
   <td>Deterministic performance</td> 
   <td>Yes</td> 
   <td>No</td> 
   <td>No</td> 
  </tr> 
 </tbody> 
</table> 
<p><strong>Strengths over plain PHP:</strong></p> 
<ul> 
 <li><strong>Near-native performance.</strong> Numeric and container-heavy hot paths compile down to the same machine code a C++ program would produce. See the <a href="https://raw.githubusercontent.com/swoole/typephp/master/#benchmark">benchmark</a> below.</li> 
 <li><strong>Source protection.</strong> Your source is compiled away — shipped artifacts are native binaries, not readable PHP files.</li> 
 <li><strong>Native process entry.</strong> Binary mode starts directly from a native executable and does not require the PHP CLI or a separate interpreter process. The executable still embeds/links PHPX, <code>libphp</code>, and any configured native libraries, which must be available in the deployment package.</li> 
 <li><strong>Gradual typing that actually pays off.</strong> Add <code>use native_types</code>, <code>std::</code> containers, and type declarations only where performance matters; the rest stays ordinary PHP.</li> 
 <li><strong>Zend ecosystem interop.</strong> Extension mode loads as a standard PHP extension, and projects can call supported internal functions and require other Zend extensions explicitly.</li> 
</ul> 
<h2>Requirements</h2> 
<ul> 
 <li><strong>PHP 8.4 – 8.5</strong> CLI, development headers, and <code>php-config</code></li> 
 <li>The matching <strong>PHP embed library</strong> (<code>libphp.so</code> or <code>libphp.dylib</code>) for binary/shared-library builds on Unix-like systems</li> 
 <li><strong>GCC 9+</strong> (or Clang) with <strong>C++17</strong></li> 
 <li><strong>CMake 3.24+</strong></li> 
 <li><strong>Composer 2</strong></li> 
 <li>High-precision math libraries: <strong>GMP</strong>, <strong>MPFR</strong> (libmpdec is bundled with PHPX)</li> 
</ul> 
<pre><code class="language-shell"># Ubuntu/Debian
sudo apt install build-essential cmake pkg-config libgmp-dev libmpfr-dev

# RHEL/CentOS/Fedora
sudo dnf install gcc gcc-c++ cmake pkgconf-pkg-config gmp-devel mpfr-devel

# Arch Linux
sudo pacman -S base-devel cmake pkgconf gmp mpfr
</code></pre> 
<blockquote> 
 <p>GMP powers <code>bigInt</code> and MPFR powers <code>bigFloat</code>. The <code>decimal</code> type is backed by libmpdec, which is bundled with PHPX — no separate install required.</p> 
</blockquote> 
<p>Linux x64 is the primary development and full-test CI platform. The compiler also has Windows, macOS, ARM64, and WASI backends; availability of PHP embed, toolchain, and third-party libraries still determines which target can be built on a given host.</p> 
<p>Native release assets are built with the latest PHP 8.5 ZTS release. TypePHP publishes Linux x64, Linux ARM64, macOS ARM64, and Windows x64 packages. Native NTS and 32-bit x86 packages are not provided. Linux and macOS archives contain the compiler and production Composer dependencies, while the Windows archive contains the complete matching PHP/PHPX runtime and SDK.</p> 
<h2>Installation</h2> 
<h3>Via Composer</h3> 
<pre><code class="language-bash">composer require --dev swoole/typephp
</code></pre> 
<p>Then compile your project:</p> 
<pre><code class="language-bash">vendor/bin/tpc.php project.yml
</code></pre> 
<p>When working inside the TypePHP source repository, use the local entry point instead:</p> 
<pre><code class="language-bash">bin/tpc.php project.yml
</code></pre> 
<h3>From source</h3> 
<pre><code class="language-bash">git clone https://github.com/swoole/typephp.git
cd typephp
composer install
php bin/tpc.php --help
</code></pre> 
<p><code>PHPX_HOME</code> may point to a separate PHPX checkout or installation. <code>PHP_HOME</code> may point to the PHP embed prefix; it must contain <code>bin/php-config</code>, PHP headers, and <code>lib/libphp.so</code> on Unix-like systems.</p> 
<h3>Building <code>libphp.so</code></h3> 
<p>Binary and shared-library builds require PHP's <code>embed</code> SAPI. If <code>libphp.so</code> is missing on Linux, <code>tpc.php</code> can interactively download the PHP source and build it for you. A PHP extension build resolves Zend symbols from the host SAPI and must not load a second <code>libphp</code>. See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/LIBPHP_INSTALLER.md">Automatic libphp.so build</a>.</p> 
<h2>Quick Start</h2> 
<p>Create <code>hello.php</code>:</p> 
<pre><code class="language-php">&lt;?php

function main(): void
{
    echo "Hello World!\n";
    var_dump(PHP_VERSION);
    var_dump(php_uname());
}
</code></pre> 
<p>Compile and run it:</p> 
<pre><code class="language-bash">bin/tpc.php hello.php
./hello
</code></pre> 
<p>Example output (the exact PHP version and platform strings depend on the linked runtime):</p> 
<pre><code>Hello World!
string(5) "8.x.x"
string(16) "Linux ..."
</code></pre> 
<blockquote> 
 <p>Binary mode requires a global <code>main()</code> function. It may be declared with no parameters, or as <code>main(int $argc, array $argv)</code> to receive command-line arguments, and must return <code>void</code>. Top-level executable statements are not allowed; executable code belongs in a function or method.</p> 
</blockquote> 
<h2>Compilation Modes</h2> 
<p>TypePHP supports three build modes, selected with <code>-m</code> / <code>--mode</code>:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Mode</th> 
   <th>Flag</th> 
   <th>Output</th> 
   <th>Needs <code>main()</code></th> 
   <th>Typical use</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>Binary</td> 
   <td><code>-m bin</code> (default)</td> 
   <td>Executable</td> 
   <td>Yes</td> 
   <td>CLI tools, long-running services, standalone apps</td> 
  </tr> 
  <tr> 
   <td>Extension</td> 
   <td><code>-m ext</code></td> 
   <td>PHP <code>.so</code> / <code>.dll</code></td> 
   <td>No</td> 
   <td>Loading compiled functions/classes into a PHP SAPI</td> 
  </tr> 
  <tr> 
   <td>Library</td> 
   <td><code>-m lib</code></td> 
   <td>Shared library plus generated <code>.stub.php</code></td> 
   <td>No</td> 
   <td>Reusing a compiled TypePHP API from another project</td> 
  </tr> 
 </tbody> 
</table> 
<pre><code class="language-bash"># Binary (default)
bin/tpc.php app.php -o myapp

# PHP extension
bin/tpc.php extension/ -m ext -o my_extension

# Shared library; also generates mylib.stub.php
bin/tpc.php lib/ -m lib -o mylib
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILATION_MODES.md">Compilation modes</a> for details.</p> 
<h2>Project configuration</h2> 
<p>For multi-file projects, keep repeatable build settings in <code>project.yml</code>:</p> 
<pre><code class="language-yaml">name: myapp
mode: bin
php-version: "8.5"
optimize: 2
job: 8
build-dir: build
cxx-std: c++17

sources:
  - src
  - cpp-src
  - path: src/php85
    if: PHP_VERSION_ID &gt;= 80500
  - path: src/windows
    if: PHP_OS_FAMILY == "Windows"

ignore:
  - src/experimental

include-paths:
  - native/include
defines:
  - FEATURE_FAST_PATH=1
link-paths:
  - native/lib
link-libs:
  - curl

# Zend extension requirements, not native linker libraries.
# `extension-dependencies` is the equivalent long name; do not use both.
ext-deps:
  - pdo_mysql
  - curl
</code></pre> 
<p>Paths are resolved relative to the YAML file. A source entry may be a file or directory; conditional entries support <code>PHP_VERSION</code>, <code>PHP_VERSION_ID</code>, and <code>PHP_OS_FAMILY</code>. CLI arguments override their YAML counterparts. Native linker dependencies belong in <code>link-libs</code>; <code>ext-deps</code> writes <code>ZEND_MOD_REQUIRED</code> entries so Zend can reject loading when a required PHP extension is missing.</p> 
<p>The build directory contains generated C++, dependency objects, and the precompiled-header cache. Reusing it makes incremental builds much faster; use <code>--force</code> only when the reusable PHPX objects must be rebuilt.</p> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILER_CLI.md">Compiler CLI</a> for all project keys and command-line precedence rules.</p> 
<h2>Compatibility model</h2> 
<p>TypePHP follows PHP syntax and runtime behavior where they are compatible with ahead-of-time compilation, but it also makes several deliberate restrictions:</p> 
<ul> 
 <li>global scope is declaration-only; executable statements must be inside a function or method;</li> 
 <li>binary mode has a strict <code>main()</code> signature;</li> 
 <li><code>use native_types</code> opts scalar declarations into fixed native storage, so a value cannot later change to an incompatible type;</li> 
 <li>statically-known calls and properties are compiled directly, while supported dynamic operations use PHPX/Zend runtime fallbacks;</li> 
 <li><code>.stub.php</code> files declare C++ or imported-library APIs and must contain empty bodies; <code>#[Native]</code> classes are not permitted in stub files;</li> 
 <li>some highly dynamic reference, declaration, closure, and reflection patterns remain intentionally unsupported.</li> 
</ul> 
<p>The compatibility boundary is part of the public contract and has both positive and negative tests. Consult <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/INCOMPATIBLE_PHP_FEATURES.md">Incompatible PHP features</a> for the current, specific list instead of assuming that absence from this README means support.</p> 
<h2>Compile-time attributes and code generation</h2> 
<p>TypePHP consumes its built-in code-generation attributes while lowering the class. The generated methods retain the declared property types and take part in the same conflict, inheritance, and final-method checks as explicitly declared methods.</p> 
<table> 
 <thead> 
  <tr> 
   <th>Attribute</th> 
   <th>Target</th> 
   <th>Generated API</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>#[Getter]</code></td> 
   <td>Instance property, including a promoted property</td> 
   <td><code>public function getName(): T</code></td> 
  </tr> 
  <tr> 
   <td><code>#[Setter]</code></td> 
   <td>Mutable instance property, including a promoted property</td> 
   <td><code>public function setName(T $name): void</code></td> 
  </tr> 
  <tr> 
   <td><code>#[With]</code></td> 
   <td>Mutable instance property, including a promoted property</td> 
   <td><code>public function withName(T $name): static</code>; clones the object, updates the clone, and returns it</td> 
  </tr> 
  <tr> 
   <td><code>#[Constructor]</code></td> 
   <td>Declared instance property</td> 
   <td>Adds the property to a generated public <code>__construct()</code></td> 
  </tr> 
  <tr> 
   <td><code>#[Printer]</code></td> 
   <td>Named class</td> 
   <td><code>public function __toString(): string</code></td> 
  </tr> 
  <tr> 
   <td><code>#[Arrayable]</code></td> 
   <td>Named class</td> 
   <td><code>public function toArray(): array</code></td> 
  </tr> 
 </tbody> 
</table> 
<pre><code class="language-php">&lt;?php

#[Printer(fields: ['id', 'name'])]
#[Arrayable(fields: ['id', 'name'])]
final class User
{
    #[Constructor, Getter, With]
    public int $id;

    #[Constructor, Getter, Setter]
    public string $name = 'guest';
}

function main(): void
{
    $user = new User(7);
    $user-&gt;setName('Alice');

    $copy = $user-&gt;withId(8);
    echo $user-&gt;getId();       // 7
    echo $copy-&gt;getId();       // 8
    echo $user;                // User(id=7, name=Alice)
    echo $user-&gt;toArray()['name'];
}
</code></pre> 
<p>Without <code>fields</code>, <code>#[Printer]</code> and <code>#[Arrayable]</code> use the class's own public instance properties. The positional form, such as <code>#[Arrayable(['id'])]</code>, is equivalent to <code>#[Arrayable(fields: ['id'])]</code>.</p> 
<p><code>#[Getter]</code>, <code>#[Setter]</code>, and <code>#[With]</code> cannot target static properties or properties with hooks. <code>#[Setter]</code> and <code>#[With]</code> additionally reject readonly properties. <code>#[Constructor]</code> cannot be used when the class already declares <code>__construct()</code>, and required constructor properties must precede properties with defaults. A generated method name that conflicts with a declared or inherited final method is a compile-time error.</p> 
<h2>Examples</h2> 
<h3>1. Native types — compile-time numeric speedup</h3> 
<pre><code class="language-php">&lt;?php
use native_types;

function fib(int $n): int
{
    if ($n == 1 || $n == 2) {
        return 1;
    }
    return fib($n - 1) + fib($n - 2);
}

function main(int $argc, array $argv): void
{
    $n = (int)$argv[1];
    $begin = microtime(true);
    echo fib($n) . "\n";
    echo "Time: " . (microtime(true) - $begin) . "\n";
}
</code></pre> 
<pre><code class="language-bash">bin/tpc.php fib.php -O3 -o fib
./fib 30
</code></pre> 
<p>With <code>use native_types</code>, <code>int</code> variables become C++ <code>int64_t</code> and arithmetic compiles to plain CPU instructions instead of ZendVM calls.</p> 
<h3>2. High-precision numerics</h3> 
<pre><code class="language-php">&lt;?php
declare(strict_types=1);
use native_types;

function main(): void
{
    // 54-digit integer — automatically detected and stored as bigInt
    $a = std::bigInt("123456789012345678901234567890123456789012345678901234");
    $b = std::bigInt("987654321098765432109876543210987654321098765432109876");

    echo $a-&gt;add($b)-&gt;toString() . "\n";   // exact, no overflow

    // Exact decimal arithmetic — no binary floating-point error
    $c = std::decimal("0.1")-&gt;add(std::decimal("0.2"));
    echo $c-&gt;toString() . "\n";            // "0.3"

    // 256-bit floating point
    $pi = std::bigFloat("3.14159265358979323846264338327950288419716939937510");
    echo $pi-&gt;mul(2)-&gt;toString() . "\n";
}
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/HIGH_PRECISION_TYPES.md">High-precision types</a> and <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/NATIVE_TYPES.md">Native types</a>.</p> 
<h3>3. Strongly-typed containers</h3> 
<pre><code class="language-php">&lt;?php
use native_types;

function main(): void
{
    $vector = std::vector(Type::Int);

    $vector[] = 1;
    $vector[] = 2;
    $vector[] = 3;

    $sum = 0;
    foreach ($vector as $value) {
        $sum += $value;
    }

    echo $sum . "\n";       // 6
    echo $vector[1] . "\n"; // 2

    // key-value map with fixed key/value types
    $map = std::ordered_map(Type::String, Type::Int);
    $map["a"] = 1;
    $map["b"] = 2;
}
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/STD_CONTAINERS.md">Std containers</a>.</p> 
<h3>4. Universal methods</h3> 
<pre><code class="language-php">&lt;?php

function main(): void
{
    $s = "hello world";
    echo $s-&gt;length() . "\n";       // strlen()
    echo $s-&gt;upper() . "\n";        // strtoupper()
    echo $s-&gt;substr(0, 5) . "\n";   // substr()

    $arr = [1, 3, 5, 7, 9];
    echo $arr-&gt;count() . "\n";      // count()
    var_dump($arr-&gt;contains(3));    // in_array()

    $big = std::bigInt("12345678901234567890");
    echo $big-&gt;mul(2)-&gt;toString() . "\n";
}
</code></pre> 
<p>Method calls on primitives are resolved at compile time into direct C/C++ function calls — no vtable lookup, no reflection, no runtime dispatch. See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/UNIVERSAL_METHODS.md">Universal methods</a>.</p> 
<h3>5. Mixed C++ / PHP</h3> 
<p>Write performance-critical kernels in C++ and call them from PHP:</p> 
<pre><code class="language-cpp">// math.cpp
#include &lt;phpx.h&gt;

using namespace php;

Int php_fast_sum(Int a, Int b) {
    return a + b;
}
</code></pre> 
<pre><code class="language-php">&lt;?php
// math.stub.php — declares the C++ function signature
function fast_sum(int $a, int $b): int {}
</code></pre> 
<pre><code class="language-php">&lt;?php
function main(): void
{
    echo fast_sum(3, 4) . "\n";  // 7
}
</code></pre> 
<p>Add <code>math.cpp</code>, <code>math.stub.php</code>, and the calling PHP source to the same project configuration. The <code>php_</code> C++ symbol prefix is the TypePHP callable ABI; stub functions provide type metadata only and must not contain an implementation.</p> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/MIXED_CPP_PHP.md">Mixed C++/PHP</a>.</p> 
<h2>Benchmark</h2> 
<h3>PHP language benchmarks (from php-src)</h3> 
<p>TypePHP runs the official <code>bench.php</code> and <code>micro_bench.php</code> language benchmarks that ship with the PHP source tree, compiled with <code>-O3</code>:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Benchmark</th> 
   <th>Interpreted PHP</th> 
   <th>TypePHP AOT (<code>-O3</code>)</th> 
   <th>Speedup</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>bench.php</code> (total)</td> 
   <td>5.034 s</td> 
   <td><strong>0.603 s</strong></td> 
   <td>~8×</td> 
  </tr> 
  <tr> 
   <td><code>micro_bench.php</code> (total)</td> 
   <td>13.045 s</td> 
   <td><strong>2.021 s</strong></td> 
   <td>~6.5×</td> 
  </tr> 
 </tbody> 
</table> 
<p>Both benchmarks measure core PHP language performance — function calls, object property access, array/hash access, string handling, control flow, and more. The checked-in workloads are <a href="https://raw.githubusercontent.com/swoole/typephp/master/benchmark/bench.php"><code>benchmark/bench.php</code></a> and <a href="https://raw.githubusercontent.com/swoole/typephp/master/benchmark/micro_bench.php"><code>benchmark/micro_bench.php</code></a>. Additional focused performance regressions live in the same <a href="https://raw.githubusercontent.com/swoole/typephp/master/benchmark/"><code>benchmark/</code></a> directory.</p> 
<p>These numbers are a project measurement snapshot, not a performance guarantee. PHP version, compiler, CPU, optimization flags, and enabled extensions can all change the result; compare on the same machine with the same workload before making deployment decisions.</p> 
<h3>std::array vs PHP array</h3> 
<p>A 10000×100000 element update loop, comparing PHP arrays against TypePHP's <code>std::array</code> and native C++:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Implementation</th> 
   <th>Time</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>PHP array (JIT)</td> 
   <td>67.6 s</td> 
  </tr> 
  <tr> 
   <td><code>std::array</code> (TypePHP AOT)</td> 
   <td><strong>6.4 s</strong></td> 
  </tr> 
  <tr> 
   <td>C++ <code>std::vector</code></td> 
   <td>6.2 s</td> 
  </tr> 
 </tbody> 
</table> 
<p><code>std::array</code> is roughly <strong>10× faster</strong> than PHP arrays and performs close to the hand-written C++ result in this workload. See the benchmark in <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/STD_CONTAINERS.md">Std containers</a>.</p> 
<h2>Command Line</h2> 
<pre><code class="language-bash">bin/tpc.php &lt;file|dir|project.yml&gt; [options] [-- program-args...]
</code></pre> 
<p>Common usage:</p> 
<pre><code class="language-bash"># Compile a single file
bin/tpc.php app.php

# Optimize and run, passing args to the program after `--`
bin/tpc.php app.php -O3 -r -- --flag value

# Compile a project defined in project.yml
bin/tpc.php project.yml -O2 -j 8

# Build a PHP extension
bin/tpc.php extension/ -m ext -o my_extension

# Only generate C++ (skip compile &amp; link)
bin/tpc.php app.php --dry --build-dir /tmp/typephp-build

# Compile to WASI 0.2
bin/tpc.php --wasm app.php

# Compile for the browser (requires jco)
bin/tpc.php --wasm=browser app.php
</code></pre> 
<p>Key options:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Option</th> 
   <th>Description</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>-O &lt;0-3&gt;</code></td> 
   <td>Optimization level (default <code>0</code>)</td> 
  </tr> 
  <tr> 
   <td><code>-d</code>, <code>--debug</code></td> 
   <td>Debug build with symbols and source tracking</td> 
  </tr> 
  <tr> 
   <td><code>-o</code>, <code>--output &lt;file&gt;</code></td> 
   <td>Output file name</td> 
  </tr> 
  <tr> 
   <td><code>-m</code>, <code>--mode &lt;bin|lib|ext&gt;</code></td> 
   <td>Build mode (default <code>bin</code>)</td> 
  </tr> 
  <tr> 
   <td><code>-r</code>, <code>--run</code></td> 
   <td>Run after a successful build</td> 
  </tr> 
  <tr> 
   <td><code>-j</code>, <code>--job &lt;num&gt;</code></td> 
   <td>Parallel compile jobs (default <code>4</code>)</td> 
  </tr> 
  <tr> 
   <td><code>-f</code>, <code>--force</code></td> 
   <td>Rebuild reusable PHPX objects instead of using the cache</td> 
  </tr> 
  <tr> 
   <td><code>--build-dir &lt;dir&gt;</code></td> 
   <td>Directory for generated C++ and intermediates</td> 
  </tr> 
  <tr> 
   <td><code>--dry</code></td> 
   <td>Generate C++ only, skip compile and link</td> 
  </tr> 
  <tr> 
   <td><code>--php-version &lt;8.4|8.5&gt;</code></td> 
   <td>PHP syntax version to accept</td> 
  </tr> 
  <tr> 
   <td><code>--cxx-std &lt;ver&gt;</code></td> 
   <td>C++ standard (e.g. <code>c++17</code>, <code>c++20</code>)</td> 
  </tr> 
  <tr> 
   <td><code>--march &lt;arch&gt;</code></td> 
   <td>Target instruction set (e.g. <code>native</code>)</td> 
  </tr> 
  <tr> 
   <td><code>--target-platform &lt;triple&gt;</code></td> 
   <td>Cross-compilation target triple</td> 
  </tr> 
  <tr> 
   <td><code>--lto</code></td> 
   <td>Enable link-time optimization</td> 
  </tr> 
  <tr> 
   <td><code>--sanitize &lt;type&gt;</code></td> 
   <td>Enable a sanitizer (e.g. <code>address</code>)</td> 
  </tr> 
  <tr> 
   <td><code>--profile</code></td> 
   <td>Enable Linux gperftools profiling</td> 
  </tr> 
  <tr> 
   <td><code>--format</code></td> 
   <td>Format generated C++ with clang-format</td> 
  </tr> 
  <tr> 
   <td><code>--no-literal-strings</code></td> 
   <td>Disable the literal-string table optimization</td> 
  </tr> 
  <tr> 
   <td><code>--no-progress</code>, <code>--no-color</code></td> 
   <td>CI-friendly output controls</td> 
  </tr> 
  <tr> 
   <td><code>-I</code>, <code>-D</code>, <code>-L</code>, <code>-l</code></td> 
   <td>Repeatable native include, define, library path, and library options</td> 
  </tr> 
 </tbody> 
</table> 
<p>Run <code>bin/tpc.php --help</code> for the authoritative, up-to-date list. See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILER_CLI.md">Compiler CLI</a> for details, including Bash completion:</p> 
<pre><code class="language-bash">source &lt;(./tpc --generate-completion=bash)
</code></pre> 
<h2>Troubleshooting</h2> 
<ul> 
 <li><strong><code>libphp.so</code> / <code>libphp.dylib</code> is missing:</strong> install/build the matching PHP embed SAPI, set <code>PHP_HOME</code>, or let <code>bin/tpc.php</code> offer the interactive Linux installer.</li> 
 <li><strong>PHPX cannot be found:</strong> set <code>PHPX_HOME</code> to a PHPX installation containing <code>include/</code> and <code>lib/libphpx.so</code> (or the platform equivalent), then build PHPX before compiling the project.</li> 
 <li><strong>Startup crashes or ABI errors:</strong> the PHP headers, <code>php-config</code>, <code>libphp</code>, and loaded extension ABI must agree on the PHP version and ZTS/NTS mode. Do not mix artifacts from different PHP builds.</li> 
 <li><strong>Incremental builds are unexpectedly slow:</strong> keep a stable <code>--build-dir</code> so object and PCH caches can be reused. When an external test runner already runs several tests concurrently, avoid multiplying that concurrency by an unnecessarily large <code>tpc -j</code> value.</li> 
 <li><strong>A project compiles with <code>bin/tpc.php</code> but fails with <code>tpc</code>:</strong> reproduce with the self-hosted compiler. Bootstrap execution can expose dynamic-call or ABI paths that the PHP-hosted compiler does not exercise.</li> 
</ul> 
<h2>Python bridge</h2> 
<p>TypePHP ships a Python tool submodule that shares the <code>tpc</code> entry point:</p> 
<pre><code class="language-shell"># Generate IDE helpers for Python modules
./tpc --gen-python-helper math
./tpc --gen-python-helper numpy --output-dir .ide-helper

# Convert a Python script to TypePHP
./tpc --convert-python-to-php script.py &gt; script.php
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/python/tools.md">Python tool submodule</a>.</p> 
<h2>Development and testing</h2> 
<p>Install development dependencies and run the compiler unit suite:</p> 
<pre><code class="language-bash">composer install
PHPX_HOME=/path/to/phpx vendor/bin/phpunit
</code></pre> 
<p>PHPT is the end-to-end suite. Build the self-hosted compiler first and pass it explicitly to the test runner; using the Zend PHP executable as <code>--compiler</code> does not test the deployed compiler:</p> 
<pre><code class="language-bash">PHPX_HOME=/path/to/phpx php bin/tpc.php project.yml --job 2 --no-progress
php run-tests.php -q -j8 --compiler ./tpc tests/compiler
</code></pre> 
<p>Static analysis and the source-derived coverage matrix are separate checks:</p> 
<pre><code class="language-bash">composer analyse
php bin/analyze-test-coverage.php
php bin/analyze-test-coverage.php \
  --format=markdown --output=build/test-coverage.md --strict
</code></pre> 
<p>The coverage tool reports PHP version × feature × positive compilation × runtime semantics × negative diagnostics, plus concrete PHP-parser AST nodes. It intentionally does not publish a single percentage without an explicit denominator. See <a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/TEST_COVERAGE_ANALYZER.md">Test coverage analyzer</a>.</p> 
<p>GitHub Actions runs PHPUnit and self-hosted PHPT on PHP 8.4 and 8.5. Changes to compiler behavior should add a focused PHPUnit test for internal/code-generation rules and a PHPT whenever runtime output or diagnostics are observable.</p> 
<h2>Documentation</h2> 
<ul> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/QUICKSTART.md">Quick Start</a> — minimal compilation flow</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILATION_MODES.md">Compilation modes</a> — <code>bin</code>, <code>ext</code>, <code>lib</code></li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILER_CLI.md">Compiler CLI</a> — CLI arguments and project config</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/INCOMPATIBLE_PHP_FEATURES.md">Incompatible PHP features</a> — current limits</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/NATIVE_TYPES.md">Native types</a> — native scalar types</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/HIGH_PRECISION_TYPES.md">High-precision types</a> — BigInt / Decimal / BigFloat</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/STD_CONTAINERS.md">Std containers</a> — strongly-typed containers</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/UNIVERSAL_METHODS.md">Universal methods</a> — compile-time method resolution</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/COMPILE_TIME_FUNCTIONS.md">Compile-time functions</a> — <code>any()</code>, <code>refval()</code>, <code>objval()</code>, …</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/MIXED_CPP_PHP.md">Mixed C++/PHP</a> — C++/PHP interop</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/IMMUTABLE.md"><code>#[Immutable]</code></a> — compile-time read-only contracts</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/ARRAY_DEF.md"><code>#[ArrayDef]</code></a> — typed array-property contracts</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/PROPERTY_HOOKS.md">Property hooks</a> — PHP 8.4 hook lowering and runtime metadata</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/OBJECT_STORAGE_AND_PASSING_MODELS.md">Object storage models</a> — Zend object, Box, and Native class boundaries</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/YIELD_GENERATOR.md">Generators</a> — generator lowering and lifecycle</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/TEST_COVERAGE_ANALYZER.md">Test coverage analyzer</a> — AST and feature evidence matrix</li> 
 <li><a href="https://raw.githubusercontent.com/swoole/typephp/master/docs/en/WASI_BUILD.md">WASI build</a> — WASI targets</li> 
</ul> 
<h2>License</h2> 
<p>TypePHP is licensed under the <a href="https://raw.githubusercontent.com/swoole/typephp/master/LICENSE">GNU General Public License v3.0</a>.</p> 
<h2>Community</h2> 
<ul> 
 <li>Repository: <a href="https://github.com/swoole/typephp">https://github.com/swoole/typephp</a></li> 
 <li>Copyright © 2026 上海识沃网络科技有限公司 (Swoole)</li> 
</ul>