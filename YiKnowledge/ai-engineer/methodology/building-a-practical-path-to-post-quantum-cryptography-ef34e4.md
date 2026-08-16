---
title: Building a practical path to post-quantum cryptography
tags:
- MIT Technology Review
category: ai-engineer/methodology
created: '2026-08-16'
source: https://www.technologyreview.com/2026/08/13/1141041/building-a-practical-path-to-post-quantum-cryptography/
type: rss
source_name: MIT Technology Review
source_url: https://www.technologyreview.com/feed/
published: Thu, 13 Aug 2026 18:11:42 +0000
author: Jesse Schrater
---

<p>Quantum computing has alternated between breakthrough darling and overhyped promise in technology circles. Its powerful new capabilities come with a threat to break current cryptography, but for business leaders navigating the noise, the signal should be clear: post-quantum cryptography (PQC) is a manageable evolution, not a crisis.</p>



<figure class="wp-block-image size-full"><img alt="" class="wp-image-1141917" height="705" src="https://wp.technologyreview.com/wp-content/uploads/2026/08/Intel-contributed-iStock-2259858626.jpg" width="1254" /></figure>



<p>The mathematics behind today&#8217;s encrypted digital transactions may yield to quantum computers one day, but the transition to quantum-resistant algorithms is neither sudden nor insurmountable. For executives concerned about disruption, cost, or complexity, a structured and phased approach exists with trusted technology partners like Intel that are already beginning to deliver the infrastructure to make it possible.</p>



<h3 class="wp-block-heading"><strong>A natural evolution, not a cliff edge</strong></h3>



<p>The &#8220;quantum threat&#8221; narrative often swings between two extremes: imminent catastrophe or distant irrelevance. The reality occupies a more pragmatic middle ground. Quantum computers are highly specialized accelerators that exploit quantum physics to solve specific hard problems. They have the potential to crack modern encryption, but they will not replace classic servers overnight, nor will they instantly break every encryption protocol on the internet. What they will do is gradually shift the security landscape, much as previous cryptographic transitions have done over the past three decades.</p>



<p>In late 2024, the <a href="https://globalriskinstitute.org/mp-files/quantum-threat-timeline-report-2024.pdf/">Global Risk Institute</a>, a Toronto-based financial services think tank, surveyed 32 quantum computing experts on when a quantum computer could break a 2048-bit RSA key within 24 hours. An average of optimistic and pessimistic estimates from the experts gave it an even 50-50 probability of reaching this code-breaking milestone by 2040. This timeline, uncertain but measurable, creates space for deliberate planning rather than emergency reaction. The near-term focus should be on &#8220;harvest now, decrypt later&#8221; scenarios, where adversaries collect encrypted data today and then hold it for future decryption later when that capability becomes possible. This is particularly applicable for information requiring confidentiality beyond 10 years.</p>



<p>For most enterprises, this can be a manageable risk when addressed through methodical modernization.</p>



<h3 class="wp-block-heading"><strong>Government signals as confidence builders</strong></h3>



<p>The U.S. government has issued new directives for National Security Systems (NSS), which would likely be first on the list for potential quantum attack. Beginning January 2027, <a href="http://www.cnss.gov/CNSS/issuances/Policies.cfm">CNSSP-15 states</a> new NSS acquisitions must be capable of supporting <a href="https://media.defense.gov/2022/Sep/07/2003071836/-1/-1/0/CSI_CNSA_2.0_FAQ_.PDF">Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) requirements</a> for PQC algorithms standardized by the National Institute of Standards and Technology (NIST) and selected by the National Security Agency, the U.S. intelligence agency responsible for signals intelligence and information assurance. Implementation for new systems (with certain exceptions) is then required by 2031, with 100% adoption targeted by 2035.</p>



<p>For commercial enterprises, these timelines are not mandates, but could be signposts. They indicate where vendors, standards bodies, and auditors are headed, providing a reference architecture for responsible stewardship. Organizations can borrow this discipline without necessarily copying the exact timelines, using government guidance to calibrate their own risk tolerance and investment cadence.</p>



<h3 class="wp-block-heading"><strong>Intel&#8217;s role: Infrastructure ready for the transition</strong></h3>



<p>Intel is at the heart of the AI revolution by delivering quantum-resistant capabilities across our product portfolio. This is not just aspirational roadmap language; it is starting to be shipping technology.</p>



<p>For instance, the Intel Xeon 6 Processor already incorporates quantum-safe memory encryption (AES-256) and microcode signing to protect processor integrity. Upcoming platforms will extend post-quantum algorithms to more firmware and software signing, device interconnects, attestations, and secure boot functions, aligning with the most stringent government and industry directives.</p>



<p>Post-quantum algorithms carry different key sizes and computational overhead than legacy methods. Intel addresses this through dedicated cryptographic accelerators, optimized libraries, and specialized CPU instructions that reduce latency and preserve service-level agreements. Technologies such as Intel QuickAssist Technology offload cryptographic workloads, enabling enterprises to adopt stronger algorithms without sacrificing performance.</p>



<p>PQC is not a processor-alone problem. System builders and application owners must take a comprehensive view spanning solid-state drives, network interface cards, operating systems, hypervisors, applications, and connected services. Intel is delivering its pieces of the stack, while collaborating with ecosystem partners to ensure interoperability and smooth transition paths.</p>



<p>A more in-depth discussion of post-quantum algorithms and attacks can be found in my recent blog posted on Intel’s Community forum: &#8220;<a href="https://community.intel.com/t5/Blogs/Tech-Innovation/Data-Center/Post-Quantum-Crypto-Panic-Like-It-s-1999/post/1752167">Post-Quantum Crypto: Panic Like It&#8217;s 1999?</a>&#8220;</p>



<h3 class="wp-block-heading"><strong>A practical roadmap for enterprises</strong></h3>



<p>The path forward does not require upheaval, just discipline. Organizations can follow a phased approach that mirrors patterns emerging in government and critical infrastructure sectors:</p>



<ul class="wp-block-list">
<li><strong>Approach PQC as modernization, not mitigation.</strong> Frame the transition as an opportunity to strengthen cryptographic foundations, reduce technical debt, and improve system maintainability.</li>



<li><strong>Leverage trusted partners.</strong> Technology suppliers like Intel are already shipping quantum-resistant capabilities with performance acceleration. Evaluate platform readiness and vendor roadmaps as part of procurement decisions.</li>



<li><strong>Start with visibility.</strong> Cryptography is embedded throughout modern technology stacks: not just in database encryption settings but in data at rest, data in transit, digital signatures, code signing, device identity, password hashing, and software update mechanisms. Start by mapping where cryptographic assets live, what algorithms protect them, and which data sets have the longest confidentiality requirements.</li>



<li><strong>Protect long-lived data first.</strong> Not all cryptographic uses age at the same rate. Encryption protecting long-lifespan intellectual property, personal data, or state secrets faces more immediate attention than short-lived session keys or rotating certificates. Focus initial investments on high-value, long-retention data stores and the trust anchors (root certificates, firmware signing keys) that underpin system integrity.</li>



<li><strong>Design for evolution and agility.</strong> Post-quantum algorithms are not simple drop-in replacements. They carry different key sizes, performance characteristics, and integration requirements that ripple through protocols, APIs, and hardware. Design systems that can transition algorithms without business disruption: testing compatibility, ensuring vendor roadmaps align, and engineering for rotation.</li>
</ul>



<h3 class="wp-block-heading"><strong>The bottom line</strong> </h3>



<p>Quantum computing will reshape cryptography, but despite what occasional click-bait headlines say, it will not upend business overnight. The transition to post-quantum algorithms is a measured, multi-year journey, one that organizations can navigate with confidence by partnering with capable technology providers, prioritizing long-lived data, and designing for agility. Leaders who approach this as an engineering evolution rather than a threat response will not only be ready for whatever timeline quantum delivers; they will emerge with more robust, transparent, and maintainable cryptographic foundations across their platforms.</p>



<p><em>This content was produced by Intel. It was not written by MIT Technology Review’s editorial staff.</em></p>