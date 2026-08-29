---
title: tailscale/tailcat
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-29'
source: https://github.com/tailscale/tailcat
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>like netcat, but over Tailscale's data plane, without Tailscale's control plane</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://tailscale.com/tailcat">https://tailscale.com/tailcat</a></p><hr /><p align="center"> <img alt="Tailcat" height="176" src="https://raw.githubusercontent.com/tailscale/tailcat/main/tailcat.png" width="149" /> </p> 
<p align="center"><em>"Tailscale without Tailscale, by Tailscale"</em></p> 
<h1>Tailcat</h1> 
<p>Tailcat is a remix of Tailscale open source pieces to act like <a href="https://en.wikipedia.org/wiki/Netcat">netcat</a>, but over Tailscale's data plane, without Tailscale's control plane. Tailscale's data plane (<code>magicsock</code>, internally) gives you point-to-point WireGuard®-encrypted tunnels between two machines with DERP as the NAT-hole-punching communication side channel and the ultimate relay-of-last-resort if NAT traversal fails. Instead of using the Tailscale control plane, all <code>tailcat</code> connection metadata is exchanged out of band, however you want.</p> 
<p>The <code>tailcat</code> CLI (in <code>cmd/tailcat</code>) is built on the <code>tailcat</code> Go library (importable as <a href="https://pkg.go.dev/github.com/tailscale/tailcat"><code>github.com/tailscale/tailcat</code></a>).</p> 
<p>Whether you use <code>tailcat</code> as a CLI tool or library, one side runs a <code>tailcat</code> server (listener) and gets back a short connection token. The other side passes that token to <code>tailcat</code>'s client side to connect. All traffic between the two is encrypted end-to-end with WireGuard. The initial connection bootstraps through a DERP server (<a href="https://raw.githubusercontent.com/tailscale/tailcat/main/#bring-your-own-derp-relay">see below</a>), and then magicsock performs NAT traversal to upgrade to a direct peer-to-peer UDP connection when possible (usually!).</p> 
<p>You don't need a Tailscale account, root/admin access on the machine (it doesn't alter your machine's routing tables, DNS, etc.). It's just a userspace library and CLI tool.</p> 
<p>And it's all open source.</p> 
<p>You can use our free rate-limited DERP relays (the default DERP map is <a href="https://tailcat.dev/derpmap.json">https://tailcat.dev/derpmap.json</a>) or you can <a href="https://github.com/tailscale/tailscale/tree/main/cmd/derper#derp">run your own</a>.</p> 
<p>There's also an experimental in-browser web demo (tailcat compiled to WebAssembly) at <a href="https://tailscale.github.io/tailcat/">https://tailscale.github.io/tailcat/</a> that can send and receive files or text, interoperating with the CLI. Browser traffic is relayed over DERP only, with no direct connections until WebRTC support (<a href="https://github.com/tailscale/tailcat/issues/4">#4</a>).</p> 
<h2>Install</h2> 
<pre><code class="language-sh">$ go install github.com/tailscale/tailcat/cmd/tailcat@latest
</code></pre> 
<p>Or with Nix flakes, run it directly or install it:</p> 
<pre><code class="language-sh">$ nix run github:tailscale/tailcat
$ nix profile install github:tailscale/tailcat
</code></pre> 
<h2>Usage</h2> 
<h3>Pipe stdin/stdout between two machines</h3> 
<p>Server starts, printing out its ephemeral address:</p> 
<pre><code class="language-sh">$ tailcat
# Selected bootstrap relay region 302, San Francisco
# 🐈 Server listening with new address: tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
(hangs, waiting...)
</code></pre> 
<p>And then the client can:</p> 
<pre><code class="language-sh">$ echo hello | tailcat tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
$ 
</code></pre> 
<p>Then the server unblocks:</p> 
<pre><code class="language-sh">$ tailcat
# Selected bootstrap relay region 302, San Francisco
# 🐈 Server listening with new address: tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
hello
$
</code></pre> 
<h3>Expose local ports through the tunnel</h3> 
<p>Or you can serve a local TCP port, forwarded to localhost:</p> 
<pre><code class="language-sh">$ tailcat --serve=8080,8443 # or --serve=all
# 🐈 Server listening with new address: tcXXXXXXXXX
</code></pre> 
<p>And then the client:</p> 
<pre><code class="language-sh">$ tailcat tcXXXXXXXXX 8080
GET / HTTP/1.1
Host: foo

HTTP/1.1 200 OK
....
</code></pre> 
<h3>Auth-free SSH server</h3> 
<p>On Linux and macOS, you can run an SSH server too with no auth. (If you want auth, you can just <code>tailcat --serve=22</code> and proxy to your system SSH server)</p> 
<pre><code class="language-sh">$ tailcat --serve=no-auth-ssh
# 🐈 Server listening with new address: tcXXXXXXXXX
</code></pre> 
<p>And on the client side:</p> 
<pre><code class="language-sh">$ tailcat ssh tcXXXXXXXXX
$ tailcat ssh tcXXXXXXXXX ls -la
</code></pre> 
<h3>Misc commands</h3> 
<p>Ping to test connectivity; each pong reports whether it arrived via a DERP relay or a direct path. <code>--until-direct</code> keeps pinging (up to <code>--timeout</code>, default 10s) until a direct path works, exiting non-zero if one doesn't:</p> 
<pre><code class="language-sh">$ tailcat ping --until-direct &lt;token&gt;
pong in 42.1ms via DERP(sfo)
pong in 1.2ms via 203.0.113.7:41641
</code></pre> 
<p>Run a command through a SOCKS5 proxy routed over the tunnel:</p> 
<pre><code class="language-sh">$ tailcat socks &lt;token&gt; curl http://server.tailcat:8081/
</code></pre> 
<p>Tokens also work directly as URL hostnames: the SOCKS proxy recognizes and dials them, so the token argument is optional. (Tokens are case-sensitive; this works with curl and most CLI tools, but not with browsers, which lowercase hostnames.)</p> 
<pre><code class="language-sh">$ tailcat socks curl http://&lt;token&gt;:8081/
</code></pre> 
<p>Act as an exit node so the client can reach the server's network:</p> 
<pre><code class="language-sh">$ tailcat --serve=exit-node
</code></pre> 
<p>Parse a connection token and print its contents (the server's WireGuard public key and DERP info) as JSON, without connecting to anything:</p> 
<pre><code class="language-sh">$ tailcat parse tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
{
    "ServerPublic": "nodekey:9c8d2e6728da80a1dd37e275a82595b42d9a838610bc53f74a7670d1610f2e34",
    "RegionID": 302
}
</code></pre> 
<p>Resolve a short token (which references a DERP region by ID, requiring clients to fetch the DERP map) into a longer self-contained one with the DERP server info embedded, letting clients connect more quickly:</p> 
<pre><code class="language-sh">$ tailcat resolve tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFygaFhToGjYWhudGMzMDJhLmlwbi5kZXZhNG0yMDguMTExLjM5LjM4YTZzMjYwNzpmNzQwOjA6M2Y6OjcyMA
</code></pre> 
<p>Parsing that resolved token shows the embedded DERP info:</p> 
<pre><code class="language-sh">$ tailcat parse tcomFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFygaFhToGjYWhudGMzMDJhLmlwbi5kZXZhNG0yMDguMTExLjM5LjM4YTZzMjYwNzpmNzQwOjA6M2Y6OjcyMA
{
    "ServerPublic": "nodekey:9c8d2e6728da80a1dd37e275a82595b42d9a838610bc53f74a7670d1610f2e34",
    "Region": [
        {
            "Nodes": [
                {
                    "HostName": "tc302a.ipn.dev",
                    "IPv4": "208.111.39.38",
                    "IPv6": "2607:f740:0:3f::720"
                }
            ]
        }
    ]
}
</code></pre> 
<p>A server can print the long self-contained form directly with the <code>--full-address</code> flag.</p> 
<h2>Key Management</h2> 
<p>A server's address (connection token) is derived from its WireGuard key, so the key you use determines who can reach you:</p> 
<ul> 
 <li> <p><strong>Ephemeral keys (the default):</strong> each server run generates a fresh key in memory and prints an address nobody has ever seen. When the process exits, the key is discarded and the address is dead forever. This is the safe default: sharing that address only ever refers to that one run.</p> </li> 
 <li> <p><strong>Saved keys:</strong> <code>tailcat genkey</code> generates a key saved to disk so the address stays stable across restarts. The flip side: anyone you've <em>ever</em> shared that address with can connect to any future server using that key, unless you restrict clients with <code>--allow</code> (see <code>tailcat genkey --client</code>).</p> </li> 
</ul> 
<p>The CLI says at startup which kind it's using, so you know whether you're starting a fresh single-use server or re-listening on an address you may have shared in the past.</p> 
<pre><code class="language-sh">$ tailcat genkey --region=nyc
# prints the token; key saved to ~/.config/tailcat/keys/default.private.json

# later; the key named "default" is used automatically once it exists:
$ tailcat --serve=8080
# 🐈 Server listening with saved key "default": tcXXXXXXXXX

# ... unless you force a one-off ephemeral key:
$ tailcat --serve=8080 --key=new
# 🐈 Server listening with new address: tcXXXXXXXXX
</code></pre> 
<p>That is, <code>default</code> is a magic key name: once it exists, plain <code>tailcat</code> silently uses it instead of generating an ephemeral key, and the startup line above is what tells you which happened. Use <code>--key=new</code> to get an ephemeral key anyway, <code>--key=&lt;name&gt;</code> to use a different saved key, or <code>tailcat genkey --delete --key=default</code> to remove the saved default key. <code>tailcat genkey --list</code> lists your saved keys.</p> 
<p>Tokens can also be published as DNS TXT records and looked up by name; a DNS name works anywhere the CLI takes a token:</p> 
<pre><code class="language-sh"># If example.com has a TXT record "tailcat=tc..."
$ tailcat example.com 8080
$ tailcat ssh example.com
$ tailcat ping example.com
</code></pre> 
<h2>Examples</h2> 
<h3>Protected SSH server over DNS</h3> 
<p>Who needs port forwarding or port knocking? This runs an SSH server reachable from anywhere by name, with no open inbound ports on the server, where WireGuard authenticates the client before the SSH server ever sees a packet.</p> 
<p>On the client machine, generate a client identity keypair. It prints the public key, which is all the server needs to know:</p> 
<pre><code class="language-sh">client$ tailcat genkey --client
# wrote file to ~/.config/tailcat/keys/client-default.private.json
nodekey:cfb6bfa77a0654d7450947fd6acef17d2cd848da1d30b2540b13dac272ddfd16
</code></pre> 
<p>On the server, generate a server keypair pinned to its nearest DERP region (see why below), then serve SSH to only that client:</p> 
<pre><code class="language-sh">server$ tailcat genkey --fixed-region
# wrote file to ~/.config/tailcat/keys/default.private.json
tcXXXXXXXXX

server$ tailcat --serve=22 --allow=nodekey:cfb6bf...ddfd16
# 🐈 Server listening with saved key "default": tcXXXXXXXXX
</code></pre> 
<p>Publish the token in DNS as a TXT record:</p> 
<pre><code>my-server.example.com. 300 IN TXT "tailcat=tcXXXXXXXXX"
</code></pre> 
<p>And then the client side is just:</p> 
<pre><code class="language-sh">client$ tailcat ssh my-server.example.com
</code></pre> 
<p>Client modes automatically use the saved <code>client-default</code> key when it exists, so no extra flags are needed to present the allowed identity. Anyone else's handshake is silently ignored: they can't reach the SSH server, or even learn that one is running.</p> 
<p>Why <code>--fixed-region</code>: it discovers the nearest DERP region once, at genkey time, and bakes its ID into both the printed token and the saved key file, so server restarts bind to the same region (keeping the published token valid) without re-probing. Plain <code>tailcat genkey</code> defaults to <code>--region=auto</code>, which instead bakes in "pick at startup": fine for one-off use, but a token published in DNS should name a fixed region so clients and future server restarts all rendezvous in the same place. (<code>--region=&lt;name&gt;</code> pins an explicit one instead; <code>--region=list</code> shows the choices.)</p> 
<p>TODO: make the client more robust here if the DERP map changes over time: <a href="https://github.com/tailscale/tailcat/issues/7">https://github.com/tailscale/tailcat/issues/7</a></p> 
<h3>Bring your own DERP relay</h3> 
<p>Nothing requires Tailscale's relays: <a href="https://github.com/tailscale/tailscale/tree/main/cmd/derper#derp">run your own DERP server</a> (it needs a hostname with a TLS certificate, which derper can get itself via Let's Encrypt), then generate a server key that uses it by passing its hostname (or several, comma-separated) as the region:</p> 
<pre><code class="language-sh">server$ tailcat genkey --region=derp.example.com
tcomFwWCCAIsKOqPUux6ClG2RM4A_vOq4VBzGgHGGjq9OsJuFKSWFygaFhToGhYWhwZGVycC5leGFtcGxlLmNvbQ

server$ tailcat --serve=22
</code></pre> 
<p>The token embeds your relay's hostname:</p> 
<pre><code class="language-sh">$ tailcat parse tcomFwWCCAIsKOqPUux6ClG2RM4A_vOq4VBzGgHGGjq9OsJuFKSWFygaFhToGhYWhwZGVycC5leGFtcGxlLmNvbQ
{
    "ServerPublic": "nodekey:8022c28ea8f52ec7a0a51b644ce00fef3aae150731a01c61a3abd3ac26e14a49",
    "Region": [
        {
            "Nodes": [
                {
                    "HostName": "derp.example.com"
                }
            ]
        }
    ]
}
</code></pre> 
<p>so clients need no extra flags and never contact Tailscale's DERP map server or relays, and the only rate limits are yours. Alternatively, if you run a whole fleet of relays, serve your own DERP map JSON and point both sides at it with <code>--derpmap-url</code>.</p> 
<h3>Go library</h3> 
<p>A minimal server that answers any TCP port through the tunnel and prints its token. The zero value Server picks defaults for anything unset: a fresh ephemeral key, the nearest region of the default DERP map, and <code>log.Printf</code> logging (set <code>Logf</code> to <code>logger.Discard</code> for quiet):</p> 
<pre><code class="language-go">package main

import (
	"fmt"
	"log"
	"net"

	"github.com/tailscale/tailcat"
)

func main() {
	s := &amp;tailcat.Server{
		OnTCP: func(port uint16) func(net.Conn) {
			return func(c net.Conn) {
				fmt.Fprintf(c, "hello from port %v\n", port)
				c.Close()
			}
		},
	}
	if err := s.Start(); err != nil {
		log.Fatal(err)
	}
	fmt.Println(s.ConnBlob())
	select {}
}
</code></pre> 
<p>And a minimal client that dials it, given that token as its argument. Like Server, the Client zero value works with just its Server token field set (<code>tailcat.NewClient</code> is shorthand for exactly that), and the tunnel is established lazily by the first dial:</p> 
<pre><code class="language-go">package main

import (
	"context"
	"io"
	"log"
	"os"

	"github.com/tailscale/tailcat"
)

func main() {
	cl := tailcat.NewClient(tailcat.ConnBlob(os.Args[1]))
	defer cl.Close()
	c, err := cl.DialTCPPort(context.Background(), 80)
	if err != nil {
		log.Fatal(err)
	}
	io.Copy(os.Stdout, c)
}
</code></pre> 
<pre><code class="language-sh">$ ./client tcomFwWCAWf933BLELdzd3RkHiOufJ...
hello from port 80
</code></pre> 
<h2>How it works</h2> 
<h3>Connection tokens</h3> 
<p>A Tailcat server is identified by a <strong>connection token</strong> (called a ConnBlob internally). It looks like <code>tcXYZ...</code> and is a <code>"tc"</code> prefix followed by base64-encoded <a href="https://cbor.io/">CBOR</a> containing:</p> 
<ul> 
 <li>The server's WireGuard public key (Curve25519, 32 bytes)</li> 
 <li>DERP info. Either: 
  <ol> 
   <li>a small integer referencing one of the default <a href="https://tailcat.dev/derpmap.json">Tailscale-run tailcat servers</a>), or</li> 
   <li>full DERP server metadata, to either use a custom DERP server, or to avoid the client needing a potential round-trip to fetch the latest DERP map (the server's <code>--full-address</code> flag and the <code>tailcat resolve</code> subcommand produce this form)</li> 
  </ol> </li> 
</ul> 
<p>A typical token with just an integer region ID is around 50 bytes. With embedded DERP node details it's longer but self-contained.</p> 
<h3>Network stack</h3> 
<p>Tailcat reuses Tailscale's client networking components but without the control plane.</p> 
<ul> 
 <li><strong>WireGuard</strong> -- a userspace WireGuard implementation for encrypting all tunnel traffic. It doesn't use a kernel TUN/TAP device (nor does it configure any networking routes or DNS settings), so <code>root</code> isn't required.</li> 
 <li><strong>magicsock</strong> -- Tailscale's transport layer that multiplexes traffic over direct UDP and DERP relays. It handles STUN-based endpoint discovery and UDP hole-punching for NAT traversal.</li> 
 <li><strong>Netstack</strong> (gVisor) -- a userspace TCP/IP stack that terminates TCP connections inside the process. This is what lets Tailcat accept inbound connections and dial outbound ones without any OS network configuration.</li> 
 <li><strong>DERP relay</strong> -- Tailscale's encrypted relay protocol, used as a rendezvous channel and as a fallback data path when direct connectivity isn't possible.</li> 
</ul> 
<h3>Connection flow</h3> 
<ol> 
 <li> <p><strong>Server starts.</strong> It generates (or loads) a WireGuard keypair, connects to a DERP relay, and prints its connection token to stderr. It then waits for clients.</p> </li> 
 <li> <p><strong>Client parses the token</strong> to learn the server's public key and DERP region. It generates its own ephemeral keypair and connects to the same DERP relay.</p> </li> 
 <li> <p><strong>Discovery handshake.</strong> The client sends a "<strong>Meow</strong>" ping message to the server through the DERP relay. This message carries the client's node public key. The server receives it, adds the client to its WireGuard peer list and network map, reconfigures the WireGuard engine, and replies with a "<strong>Meowed</strong>" acknowledgment.</p> </li> 
 <li> <p><strong>WireGuard tunnel.</strong> With both sides configured as WireGuard peers, the standard WireGuard handshake proceeds (routed through DERP initially). Once complete, the tunnel is up and encrypted traffic can flow.</p> </li> 
 <li> <p><strong>NAT traversal.</strong> In parallel, each side advertises its UDP endpoints (public IP:port learned via STUN, plus local interface addresses) to the other in disco call-me-maybe messages over DERP, re-advertising whenever they change. Both sides then run Tailscale's disco protocol and attempt UDP hole-punching. If successful, traffic upgrades from the DERP relay to a direct peer-to-peer path. If hole-punching fails, DERP continues as a fallback and the connection still works, just with rate-limited throughput if you're using our public hosted DERP relays.</p> </li> 
 <li> <p><strong>Data transfer.</strong> The client dials a TCP port on the server through the tunnel. gVisor's TCP/IP stack on both sides handles connection setup. On the server, the incoming connection is dispatched to a handler based on the port: forwarding to localhost, piping to stdout, running an SSH session, etc.</p> </li> 
</ol> 
<h3>Addressing</h3> 
<p>Each peer currently derives a deterministic IPv6 address from its WireGuard public key, but that's an implementation detail not exposed to end users and might change. (e.g. we might remove those bytes from the IP headers entirely and recover that redundant MTU)</p> 
<h2>Stability</h2> 
<p>Tailcat is free to use, but it comes with no API or CLI stability promises: the Go API, the CLI flags and output, and the wire format may all change. The public rate-limited Tailcat DERP relays have no uptime SLAs or throughput targets, and we may revoke access to them at any time, for any reason. Everything is provided best effort, without a contractual relationship (e.g. dedicated DERP relays and/or support) saying otherwise.</p> 
<h2>Contact Sales?</h2> 
<p>If you don't want to run and support things on your own, or want any help, <a href="https://tailscale.com/contact/sales">contact sales</a> and we can exchange money for <a href="https://www.youtube.com/watch?v=A81DYZh6KaQ">goods and services</a>.</p> 
<h2>History</h2> 
<p>Tailcat began life in September 2023 as "derpcat", written on a long flight while catching up on bad movies: the first sketch was commit <a href="https://github.com/tailscale/tailcat/commit/9e4d925cc">9e4d925cc</a> ("cmd/dc: start of derpcat tool"), and it first worked in commit <a href="https://github.com/tailscale/tailcat/commit/911915fbb">911915fbb</a> ("derpcat: it's alive!", whose commit message notes "UA 605 PDX-ORD en route to Ireland. yay not buying the wifi."). Back then it lived inside a fork of the <a href="https://github.com/tailscale/tailscale">tailscale.com</a> repo and it bitrot several times as the Tailscale internals moved on without it. We've since brought it back to life and refactored it to be a regular Go module client of the <a href="http://tailscale.com">tailscale.com</a> repo instead of a fork of it.</p> 
<p>It was open sourced August 2026 at the <a href="https://tailscale.com/tailscaleup">TailscaleUp conference</a>.</p>