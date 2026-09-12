<!--
  SparkGlowDefs — shared SVG filter defs for sparkline crosshair glow + stroke.

  Renders an invisible SVG with four filters:
  - ssb-spark-glow-lg (stdDeviation=0.5) for session sparklines (56x12 viewBox)
  - ssb-spark-glow-sm (stdDeviation=0.3) for pin sparklines (40x8 viewBox)
  - ssb-spark-stroke-lg (dilate=0.5) for session milestone outlines (iter 236)
  - ssb-spark-stroke-sm (dilate=0.3) for pin milestone outlines (iter 236)

  Included once per app mount (in App.vue) to avoid duplicating <defs>.
  Browsers resolve url(#id) to the first matching def in document order —
  since this renders before SessionStatusBar / ChatToolbar, all references
  resolve here.

  Pi-inspired: per-card crosshair has a key-light + halo-glow two-layer rendering;
  this hoists the halo-glow def to a single source of truth. The stroke filter
  adds a same-colored dilated halo for milestone points (fastest / latest /
  stuck) so they read crisply against the blur glow. Iter 241 adds a slight
  feGaussianBlur on the dilated halo — combining solid stroke emphasis
  with soft glow falloff (pi's "key-light + halo-glow" combined pattern). (iter 210, 236, 241)
-->
<template>
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <filter id="ssb-spark-glow-lg" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.5" />
      </filter>
      <filter id="ssb-spark-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.3" />
      </filter>
      <filter id="ssb-spark-stroke-lg" x="-50%" y="-50%" width="200%" height="200%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="0.5" result="strokeAlpha" />
        <feComposite in="SourceGraphic" in2="strokeAlpha" operator="in" result="strokeColored" />
        <feGaussianBlur in="strokeColored" stdDeviation="0.3" result="strokeBlurred" />
        <feMerge>
          <feMergeNode in="strokeBlurred" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="ssb-spark-stroke-sm" x="-50%" y="-50%" width="200%" height="200%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="0.3" result="strokeAlpha" />
        <feComposite in="SourceGraphic" in2="strokeAlpha" operator="in" result="strokeColored" />
        <feGaussianBlur in="strokeColored" stdDeviation="0.2" result="strokeBlurred" />
        <feMerge>
          <feMergeNode in="strokeBlurred" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
</template>

<script setup lang="ts"></script>
