/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiviY project — a Streamlit +
 *           Python video translation & dubbing workbench with a 12-step
 *           pipeline and pluggable ASR / Translate / TTS backends.
 *           SVG built by the same embedded layout engine as the diagram
 *           skill template.
 *
 *           Architecture shape:
 *               User (URL) → Streamlit UI (st.py)
 *               → Config & Orchestrator (config.yaml) → 12-step Pipeline
 *               → Backend Adapters (ASR / LLM / TTS / AV)
 *               → External: OpenAI GPT, Replicate, yt-dlp, WhisperX, ffmpeg
 *
 * @shape:
 *   { meta, executiveSummary, toc, metrics, svgDiagram,
 *     summaryCards, pipeline, securityCards, trace, scalingTiles,
 *     ownership, apiTable, stack, schemaTiles, roadmap, glossary }
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 0 — SHARED PRIMITIVES RESOLUTION
     ═══════════════════════════════════════════════════════════════════ */
  var P = window.ruiDiagramPrimitives;
  if (!P) {
    P = {
      PALETTE: {
        cyan:    { fill: 'rgba(8,51,68,0.45)',   stroke: '#22d3ee', text: '#22d3ee' },
        emerald: { fill: 'rgba(6,78,59,0.45)',   stroke: '#34d399', text: '#34d399' },
        violet:  { fill: 'rgba(76,29,149,0.45)', stroke: '#a78bfa', text: '#a78bfa' },
        amber:   { fill: 'rgba(120,53,15,0.35)', stroke: '#fbbf24', text: '#fbbf24' },
        rose:    { fill: 'rgba(136,19,55,0.45)', stroke: '#fb7185', text: '#fb7185' },
        orange:  { fill: 'rgba(251,146,60,0.35)',stroke: '#fb923c', text: '#fb923c' },
        slate:   { fill: 'rgba(30,41,59,0.55)',  stroke: '#94a3b8', text: '#94a3b8' },
        ops:     { fill: 'rgba(15,23,42,0.6)',   stroke: '#475569', text: '#94a3b8' }
      },
      esc: function (s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      },
      renderMarkers: function () { return ''; },
      renderPatterns: function () { return ''; },
      renderShadowFilters: function () { return ''; },
      renderTextSlot: function (o) { return '<text>' + (o.text || '') + '</text>'; },
      renderArrow: function (o) { return '<line/>'; },
      renderCornerBrackets: function () { return ''; },
      markerForColor: function () { return 'arrow-slate'; }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 1 — LAYOUT CONSTANTS
     ═══════════════════════════════════════════════════════════════════ */
  var GRID = 10;
  var PAD = 16;
  var COL_GAP = 40;
  var ROW_GAP = 50;
  var BOUNDARY_PAD = 18;
  var OUTER_PAD = 28;
  var LEGEND_H = 168;
  var STROKE = 2;
  var BOUNDARY_STROKE = 1.5;
  var OUTER_STROKE = 2;

  function snap(v) { return Math.round(v / GRID) * GRID; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function r(n) { return Math.round(n * 100) / 100; }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2 — COLOR / STYLE TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  var STYLES = {
    frontend: P.PALETTE.cyan,
    backend:  P.PALETTE.emerald,
    database: P.PALETTE.violet,
    cloud:    P.PALETTE.amber,
    security: P.PALETTE.rose,
    message:  P.PALETTE.orange,
    external: P.PALETTE.slate,
    ops:      P.PALETTE.ops
  };

  var CONN = {
    sync:     { color: P.PALETTE.emerald.stroke, dash: null,  marker: P.markerForColor(P.PALETTE.emerald.stroke) },
    frontend: { color: P.PALETTE.cyan.stroke,    dash: null,  marker: P.markerForColor(P.PALETTE.cyan.stroke)    },
    data:     { color: P.PALETTE.violet.stroke,  dash: null,  marker: P.markerForColor(P.PALETTE.violet.stroke)  },
    auth:     { color: P.PALETTE.rose.stroke,    dash: '5,5', marker: P.markerForColor(P.PALETTE.rose.stroke)    },
    async:    { color: P.PALETTE.orange.stroke,  dash: '4,3', marker: P.markerForColor(P.PALETTE.orange.stroke)  },
    infra:    { color: P.PALETTE.amber.stroke,   dash: '6,4', marker: P.markerForColor(P.PALETTE.amber.stroke)   },
    telemetry:{ color: P.PALETTE.slate.stroke,   dash: '2,2', marker: P.markerForColor(P.PALETTE.slate.stroke)   }
  };

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 3 — LAYOUT MODEL
     FastAPI backend — client → ASGI → app/middleware → routes → services
                      → MongoDB + external (Ollama, RSS, OSS, WeWork)
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'user-url', type: 'external', label: 'User Input',
      sub: 'Video URL · YouTube/Bilibili', col: 0, row: 0, layer: 'client' },

    /* ── Layer: Edge / UI ───────────────────────────────────────── */
    { id: 'streamlit', type: 'cloud', label: 'Streamlit UI',
      sub: 'st.py · reactive widgets', col: 1, row: 0, layer: 'edge', w: 200 },

    /* ── Layer: Gateway / Orchestrator ──────────────────────────── */
    { id: 'config',   type: 'backend', label: 'Config & Orchestrator',
      sub: 'config.yaml · pipeline runner', col: 2, row: 0, layer: 'gateway',
      lines: ['step selector', 'retry + resume', 'intermediate JSON', 'output/ persistence'],
      w: 210, h: 110 },
    { id: 'prompts',  type: 'security', label: 'Prompt Templates',
      sub: 'core/prompts.py', col: 3, row: 0, layer: 'gateway' },

    /* ── Layer: Pipeline (12 steps) ─────────────────────────────── */
    { id: 'rt-dl',  type: 'frontend', label: '1. yt-dlp',
      sub: '_1_ytdlp.py', col: 0, row: 0, layer: 'routes' },
    { id: 'rt-asr', type: 'frontend', label: '2. ASR',
      sub: '_2_asr.py', col: 1, row: 0, layer: 'routes' },
    { id: 'rt-nlp', type: 'frontend', label: '3. NLP Split',
      sub: '_3_1_split_nlp', col: 2, row: 0, layer: 'routes' },
    { id: 'rt-mean',type: 'frontend', label: '3.2 Meaning',
      sub: '_3_2_split_meaning', col: 3, row: 0, layer: 'routes' },
    { id: 'rt-sum', type: 'frontend', label: '4.1 Summary',
      sub: '_4_1_summarize', col: 4, row: 0, layer: 'routes' },
    { id: 'rt-tr',  type: 'frontend', label: '4.2 Translate',
      sub: '_4_2_translate', col: 5, row: 0, layer: 'routes' },
    { id: 'rt-ss',  type: 'frontend', label: '5. Sub Split',
      sub: '_5_split_sub', col: 6, row: 0, layer: 'routes' },
    { id: 'rt-gs',  type: 'frontend', label: '6. Gen Sub',
      sub: '_6_gen_sub · SRT', col: 7, row: 0, layer: 'routes' },
    { id: 'rt-siv', type: 'frontend', label: '7. Sub in Vid',
      sub: '_7_sub_into_vid', col: 0, row: 1, layer: 'routes' },
    { id: 'rt-at',  type: 'frontend', label: '8.1 Audio Task',
      sub: '_8_1_audio_task', col: 1, row: 1, layer: 'routes' },
    { id: 'rt-dc',  type: 'frontend', label: '8.2 Dub Chunks',
      sub: '_8_2_dub_chunks', col: 2, row: 1, layer: 'routes' },
    { id: 'rt-ra',  type: 'frontend', label: '9. Ref Audio',
      sub: '_9_refer_audio', col: 3, row: 1, layer: 'routes' },
    { id: 'rt-ga',  type: 'frontend', label: '10. Gen Audio',
      sub: '_10_gen_audio · TTS', col: 4, row: 1, layer: 'routes' },
    { id: 'rt-ma',  type: 'frontend', label: '11. Merge Aud',
      sub: '_11_merge_audio', col: 5, row: 1, layer: 'routes' },
    { id: 'rt-dv',  type: 'frontend', label: '12. Dub to Vid',
      sub: '_12_dub_to_vid · MoviePy', col: 6, row: 1, layer: 'routes' },

    /* ── Layer: Backend Adapters ────────────────────────────────── */
    { id: 'sv-asr', type: 'backend', label: 'ASR Adapter',
      sub: 'whisperX · CTranslate2', col: 0, row: 0, layer: 'services' },
    { id: 'sv-tr',  type: 'backend', label: 'Translate Adapter',
      sub: 'openai GPT · replicate', col: 2, row: 0, layer: 'services' },
    { id: 'sv-tts', type: 'backend', label: 'TTS Adapter',
      sub: 'sf_fishtts · gpt_sovits', col: 4, row: 0, layer: 'services' },
    { id: 'sv-nlp', type: 'backend', label: 'NLP Service',
      sub: 'spaCy · PyAnnote diarize', col: 6, row: 0, layer: 'services' },
    { id: 'sv-av',  type: 'backend', label: 'AV Service',
      sub: 'ffmpeg · pydub · MoviePy', col: 1, row: 1, layer: 'services' },
    { id: 'sv-dl',  type: 'backend', label: 'Download Service',
      sub: 'yt-dlp · subprocess', col: 3, row: 1, layer: 'services' },

    /* ── Layer: Data (intermediate + output) ─────────────────────── */
    { id: 'output', type: 'database', label: 'Output Store',
      sub: 'output/ · JSON intermediates', col: 2, row: 0, layer: 'data', w: 200,
      lines: ['words.json · segments.json', 'translated.json · audio_tasks', 'subtitle.srt · dub_chunks', 'final_output.mp4'] },
    { id: 'glossary', type: 'database', label: 'Glossary & i18n',
      sub: 'custom_terms.xlsx · translations/', col: 5, row: 0, layer: 'data', w: 200 },

    /* ── Layer: External (cloud APIs) ─────────────────────────────── */
    { id: 'openai', type: 'external', label: 'OpenAI',
      sub: 'GPT-4o · TTS API', col: 0, row: 0, layer: 'external' },
    { id: 'replicate', type: 'external', label: 'Replicate',
      sub: 'cloud LLM/ASR/TTS', col: 2, row: 0, layer: 'external' },
    { id: 'ytdlp', type: 'external', label: 'yt-dlp Sites',
      sub: 'YouTube · Bilibili', col: 4, row: 0, layer: 'external' },
    { id: 'whisperx', type: 'external', label: 'WhisperX Local',
      sub: 'GPU · CTranslate2', col: 6, row: 0, layer: 'external' }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'yiviy-process', kind: 'vpc',
      label: 'YiviY Process · /Users/yi/YrY/YiviY',
      sub: 'Streamlit + Python · single tenant',
      members: ['streamlit','config','prompts',
                'rt-dl','rt-asr','rt-nlp','rt-mean','rt-sum','rt-tr','rt-ss','rt-gs','rt-siv','rt-at','rt-dc','rt-ra','rt-ga','rt-ma','rt-dv',
                'sv-asr','sv-tr','sv-tts','sv-nlp','sv-av','sv-dl']
    },
    {
      id: 'data-layer', kind: 'vpc',
      label: 'Intermediate + Output Store',
      sub: 'output/ directory · per-step JSON',
      members: ['output','glossary']
    }
  ];

  var CONNECTION_DEFS = [
    /* User → Streamlit */
    { from: 'user-url',  to: 'streamlit', kind: 'frontend', label: 'URL input', sub: 'sidebar form' },

    /* Streamlit → Config/Orchestrator */
    { from: 'streamlit', to: 'config',    kind: 'infra',  label: 'trigger',  sub: 'step selector' },
    { from: 'config',    to: 'prompts',   kind: 'data',   label: 'load',     sub: 'prompt templates' },

    /* Config → Pipeline steps */
    { from: 'config', to: 'rt-dl',  kind: 'sync', label: 'step 1',  sub: 'URL → video.mp4' },
    { from: 'config', to: 'rt-asr', kind: 'sync', label: 'step 2',  sub: 'video → words.json' },
    { from: 'config', to: 'rt-nlp', kind: 'sync', label: 'step 3.1', sub: 'words → segments' },
    { from: 'config', to: 'rt-mean',kind: 'sync', label: 'step 3.2', sub: 'semantic re-split' },
    { from: 'config', to: 'rt-sum', kind: 'sync', label: 'step 4.1', sub: 'summary' },
    { from: 'config', to: 'rt-tr',  kind: 'sync', label: 'step 4.2', sub: 'translate' },
    { from: 'config', to: 'rt-ss',  kind: 'sync', label: 'step 5',  sub: 'subtitle lines' },
    { from: 'config', to: 'rt-gs',  kind: 'sync', label: 'step 6',  sub: 'SRT/VTT' },
    { from: 'config', to: 'rt-siv', kind: 'sync', label: 'step 7',  sub: 'burn subs' },
    { from: 'config', to: 'rt-at',  kind: 'sync', label: 'step 8.1', sub: 'audio tasks' },
    { from: 'config', to: 'rt-dc',  kind: 'sync', label: 'step 8.2', sub: 'dub chunks' },
    { from: 'config', to: 'rt-ra',  kind: 'sync', label: 'step 9',  sub: 'ref audio' },
    { from: 'config', to: 'rt-ga',  kind: 'sync', label: 'step 10', sub: 'TTS synth' },
    { from: 'config', to: 'rt-ma',  kind: 'sync', label: 'step 11', sub: 'audio merge' },
    { from: 'config', to: 'rt-dv',  kind: 'sync', label: 'step 12', sub: 'final render' },

    /* Pipeline → Backend adapters */
    { from: 'rt-dl',  to: 'sv-dl',  kind: 'sync',  label: 'call', sub: 'yt-dlp' },
    { from: 'rt-asr', to: 'sv-asr', kind: 'async', label: 'infer', sub: 'WhisperX' },
    { from: 'rt-nlp', to: 'sv-nlp', kind: 'sync',  label: 'parse', sub: 'spaCy' },
    { from: 'rt-mean',to: 'sv-tr',  kind: 'async', label: 'LLM',  sub: 'semantic split' },
    { from: 'rt-sum', to: 'sv-tr',  kind: 'async', label: 'LLM',  sub: 'summarize' },
    { from: 'rt-tr',  to: 'sv-tr',  kind: 'async', label: 'LLM',  sub: 'translate' },
    { from: 'rt-at',  to: 'sv-tts', kind: 'sync',  label: 'task', sub: 'audio_tasks' },
    { from: 'rt-dc',  to: 'sv-tts', kind: 'async', label: 'TTS',  sub: 'chunk synth' },
    { from: 'rt-ra',  to: 'sv-tts', kind: 'sync',  label: 'clone', sub: 'ref audio' },
    { from: 'rt-ga',  to: 'sv-tts', kind: 'async', label: 'TTS',  sub: 'synthesis' },
    { from: 'rt-siv', to: 'sv-av',  kind: 'sync',  label: 'ffmpeg', sub: 'burn subs' },
    { from: 'rt-ma',  to: 'sv-av',  kind: 'sync',  label: 'ffmpeg', sub: 'audio merge' },
    { from: 'rt-dv',  to: 'sv-av',  kind: 'sync',  label: 'MoviePy', sub: 'final render' },

    /* Pipeline → Data (intermediates) */
    { from: 'rt-asr', to: 'output', kind: 'data', label: 'persist', sub: 'words.json' },
    { from: 'rt-nlp', to: 'output', kind: 'data', label: 'persist', sub: 'segments.json' },
    { from: 'rt-tr',  to: 'output', kind: 'data', label: 'persist', sub: 'translated.json' },
    { from: 'rt-gs',  to: 'output', kind: 'data', label: 'persist', sub: 'subtitle.srt' },
    { from: 'rt-dc',  to: 'output', kind: 'data', label: 'persist', sub: 'dub_chunks/' },
    { from: 'rt-dv',  to: 'output', kind: 'data', label: 'final',   sub: 'final_output.mp4' },
    { from: 'config', to: 'glossary', kind: 'data', label: 'load', sub: 'custom_terms.xlsx' },

    /* Backend adapters → External APIs */
    { from: 'sv-dl',  to: 'ytdlp',     kind: 'async', label: 'fetch',  sub: 'YouTube/Bilibili' },
    { from: 'sv-asr', to: 'whisperx',  kind: 'sync',  label: 'local',  sub: 'GPU · CTranslate2' },
    { from: 'sv-tr',  to: 'openai',    kind: 'async', label: 'API',    sub: 'GPT-4o' },
    { from: 'sv-tr',  to: 'replicate', kind: 'async', label: 'API',    sub: 'cloud LLM alt' },
    { from: 'sv-tts', to: 'openai',    kind: 'async', label: 'API',    sub: 'OpenAI TTS' },
    { from: 'sv-tts', to: 'replicate', kind: 'async', label: 'API',    sub: 'Fish TTS cloud' },

    /* Cross-adapter reuse */
    { from: 'sv-nlp', to: 'sv-asr', kind: 'sync', label: 'reuse', sub: 'word timestamps' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    client:   { y:  80,  rows: 1, colSpan: 4 },
    edge:     { y: 220,  rows: 1, colSpan: 1 },
    gateway:  { y: 340,  rows: 1, colSpan: 4 },
    routes:   { y: 480,  rows: 1, colSpan: 8 },
    services: { y: 620,  rows: 2, colSpan: 8 },
    data:     { y: 820,  rows: 1, colSpan: 2 },
    external: { y: 980,  rows: 1, colSpan: 4 }
  };

  var STD_W = 160;
  var STD_H = 60;
  var SMALL_W = 140;
  var SMALL_H = 56;

  function layoutComponents() {
    var comps = [];
    var layerMaxCol = {};
    var layerMaxRow = {};
    COMP_DEFS.forEach(function (d) {
      var band = LAYER_BAND[d.layer];
      layerMaxCol[d.layer] = Math.max(layerMaxCol[d.layer] || 0, d.col);
      layerMaxRow[d.layer] = Math.max(layerMaxRow[d.layer] || 0, d.row);
    });

    var COL_X = [60, 240, 420, 600, 780, 960, 1140, 1320, 1500];
    var ROW_H_LAYER = 88;

    COMP_DEFS.forEach(function (d) {
      var band = LAYER_BAND[d.layer];
      var x = COL_X[d.col] || 0;
      var y = band.y + d.row * ROW_H_LAYER;
      var w = d.w || (d.lines ? 200 : STD_W);
      var h = d.h || (d.lines ? computeHeight(d.lines, w) : STD_H);
      comps.push({
        id: d.id, type: d.type, layer: d.layer,
        label: d.label, sub: d.sub,
        lines: d.lines || null, x: x, y: y, w: w, h: h
      });
    });
    return comps;
  }

  function computeHeight(lines, w) {
    var lineH = 14;
    return 50 + lines.length * lineH;
  }

  function layoutBoundaries(comps) {
    var byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    return BOUNDARY_DEFS.map(function (b) {
      var members = b.members.map(function (id) { return byId[id]; })
                            .filter(Boolean);
      if (!members.length) return null;
      var minX = Math.min.apply(null, members.map(function (m) { return m.x; }));
      var minY = Math.min.apply(null, members.map(function (m) { return m.y; }));
      var maxX = Math.max.apply(null, members.map(function (m) { return m.x + m.w; }));
      var maxY = Math.max.apply(null, members.map(function (m) { return m.y + m.h; }));
      return {
        id: b.id, kind: b.kind, label: b.label, sub: b.sub,
        x: snap(minX - BOUNDARY_PAD),
        y: snap(minY - BOUNDARY_PAD - 16),
        w: snap(maxX - minX + 2 * BOUNDARY_PAD),
        h: snap(maxY - minY + 2 * BOUNDARY_PAD + 16),
        members: members
      };
    }).filter(Boolean);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5 — ORTHOGONAL ROUTING
     ═══════════════════════════════════════════════════════════════════ */
  function anchorPoint(comp, side) {
    switch (side) {
      case 'left':   return { x: comp.x,            y: comp.y + comp.h / 2 };
      case 'right':  return { x: comp.x + comp.w,   y: comp.y + comp.h / 2 };
      case 'top':    return { x: comp.x + comp.w / 2, y: comp.y };
      case 'bottom': return { x: comp.x + comp.w / 2, y: comp.y + comp.h };
    }
    return { x: comp.x + comp.w / 2, y: comp.y + comp.h / 2 };
  }

  function pickSides(src, dst) {
    var srcCx = src.x + src.w / 2, srcCy = src.y + src.h / 2;
    var dstCx = dst.x + dst.w / 2, dstCy = dst.y + dst.h / 2;
    var dx = dstCx - srcCx, dy = dstCy - srcCy;
    var fromSide, toSide;
    if (Math.abs(dx) >= Math.abs(dy)) {
      fromSide = dx > 0 ? 'right' : 'left';
      toSide   = dx > 0 ? 'left'  : 'right';
    } else {
      fromSide = dy > 0 ? 'bottom' : 'top';
      toSide   = dy > 0 ? 'top'    : 'bottom';
    }
    return { fromSide: fromSide, toSide: toSide };
  }

  function polyline(points) {
    if (!points.length) return '';
    var d = 'M ' + r(points[0].x) + ' ' + r(points[0].y);
    for (var i = 1; i < points.length; i++) {
      d += ' L ' + r(points[i].x) + ' ' + r(points[i].y);
    }
    return d;
  }

  function orthogonalRoute(p1, p2) {
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    if (Math.abs(dy) < 0.5) return [p1, p2];
    if (Math.abs(dx) < 0.5) return [p1, p2];
    var midX = p1.x + dx / 2;
    return [
      p1,
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      p2
    ];
  }

  function pathMidpoint(points) {
    var total = 0;
    var segs = [];
    for (var i = 1; i < points.length; i++) {
      var a = points[i - 1], b = points[i];
      var len = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a: a, b: b, len: len });
      total += len;
    }
    var target = total / 2, acc = 0;
    for (var j = 0; j < segs.length; j++) {
      if (acc + segs[j].len >= target) {
        var t = (target - acc) / segs[j].len;
        var a = segs[j].a, b = segs[j].b;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      acc += segs[j].len;
    }
    return { x: points[points.length - 1].x, y: points[points.length - 1].y };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 6 — SVG RENDERERS
     Paint order: defs → grid → arrows → masks → components → boundaries → legend
     ═══════════════════════════════════════════════════════════════════ */

  function renderDefs() {
    return [
      '<defs>',
        P.renderMarkers(),
        P.renderPatterns(),
        P.renderShadowFilters(),
        '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">',
          '<feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
        '</filter>',
      '</defs>'
    ].join('');
  }

  function renderArrows(comps, connDefs) {
    var byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    var parts = [];
    connDefs.forEach(function (c) {
      var src = byId[c.from], dst = byId[c.to];
      if (!src || !dst) return;
      var sides = pickSides(src, dst);
      var p1 = anchorPoint(src, sides.fromSide);
      var p2 = anchorPoint(dst, sides.toSide);
      var PAD_A = 6;
      if (sides.fromSide === 'right')  p1.x += PAD_A;
      if (sides.fromSide === 'left')   p1.x -= PAD_A;
      if (sides.fromSide === 'bottom') p1.y += PAD_A;
      if (sides.fromSide === 'top')    p1.y -= PAD_A;
      if (sides.toSide === 'right')    p2.x += PAD_A;
      if (sides.toSide === 'left')     p2.x -= PAD_A;
      if (sides.toSide === 'bottom')   p2.y += PAD_A;
      if (sides.toSide === 'top')      p2.y -= PAD_A;

      var points = orthogonalRoute(p1, p2);
      var d = polyline(points);
      var style = CONN[c.kind] || CONN.sync;
      var dashAttr = style.dash ? ' stroke-dasharray="' + style.dash + '"' : '';
      parts.push('<path class="svg-arrow" data-from="' + c.from + '" data-to="' + c.to + '" ' +
                 'd="' + d + '" fill="none" stroke="' + style.color + '" ' +
                 'stroke-width="' + STROKE + '" stroke-linecap="round" stroke-linejoin="round"' +
                 dashAttr + ' marker-end="url(#' + style.marker + ')"/>');
      var mid = pathMidpoint(points);
      if (c.label) {
        parts.push(renderLabelPill(mid, c.from, c.to, c.label, c.sub, style.color));
      }
    });
    return parts.join('');
  }

  function renderLabelPill(mid, from, to, label, sub, color) {
    var padX = 8, padY = 4;
    var fontSize = 10;
    var labelW = Math.max(28, label.length * 5.6 + padX * 2);
    var labelH = 16;
    var x = r(mid.x - labelW / 2);
    var y = r(mid.y - labelH / 2);
    var parts = [];
    parts.push('<rect class="svg-label-bg" data-from="' + from + '" data-to="' + to + '" ' +
               'x="' + x + '" y="' + y + '" ' +
               'width="' + r(labelW) + '" height="' + labelH + '" rx="4" ' +
               'fill="#020617" stroke="' + color + '" stroke-width="1" opacity="0.92"/>');
    parts.push('<text class="svg-label" data-from="' + from + '" data-to="' + to + '" ' +
               'x="' + r(mid.x) + '" y="' + r(mid.y + 3.5) + '" ' +
               'fill="' + color + '" font-size="' + fontSize + '" font-weight="600" ' +
               'text-anchor="middle" stroke="#020617" stroke-width="0.4" paint-order="stroke">' +
               escapeXml(label) + '</text>');
    if (sub) {
      parts.push('<text class="svg-label-sub" data-from="' + from + '" data-to="' + to + '" ' +
                 'x="' + r(mid.x) + '" y="' + r(mid.y + labelH / 2 + 10) + '" ' +
                 'fill="#94a3b8" font-size="8" text-anchor="middle">' +
                 escapeXml(sub) + '</text>');
    }
    return parts.join('');
  }

  function escapeXml(s) { return P.esc(s); }

  function renderMasks(comps) {
    return comps.map(function (c) {
      return '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" ' +
             'rx="8" fill="#0f172a"/>';
    }).join('');
  }

  function renderComponents(comps) {
    return comps.map(function (c) {
      var s = STYLES[c.type] || STYLES.external;
      var rx = c.lines ? 10 : 8;
      var isTall = !!c.lines;
      var filterAttr = isTall ? ' filter="url(#shadow-md)"' : ' filter="url(#shadow-sm)"';
      var inner = [];
      var titleY = c.y + 22;
      var subY = c.y + 38;
      var titleTextW = c.w - 20;
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + titleY + '" ' +
                 'fill="#ffffff" font-size="12" font-weight="700" ' +
                 'text-anchor="middle" textLength="' + titleTextW + '" ' +
                 'lengthAdjust="spacingAndGlyphs">' + escapeXml(c.label) + '</text>');
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + subY + '" ' +
                 'fill="#cbd5e1" font-size="9" text-anchor="middle" ' +
                 'textLength="' + (c.w - 16) + '" lengthAdjust="spacingAndGlyphs">' +
                 escapeXml(c.sub) + '</text>');
      if (c.lines) {
        var yStart = c.y + 60;
        c.lines.forEach(function (line, i) {
          inner.push('<text x="' + (c.x + 14) + '" y="' + (yStart + i * 14) + '" ' +
                     'fill="#cbd5e1" font-size="9" text-anchor="start">' +
                     '• ' + escapeXml(line) + '</text>');
        });
      }
      return [
        '<rect class="comp-stroke" data-component="' + c.id + '" ' +
          'x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" ' +
          'rx="' + rx + '" fill="' + s.fill + '" stroke="' + s.stroke + '" ' +
          'stroke-width="' + STROKE + '"' + filterAttr + '/>',
        inner.join('')
      ].join('');
    }).join('');
  }

  function renderBoundaries(bounds) {
    return bounds.map(function (b) {
      var stroke, dash, fill, labelY;
      if (b.kind === 'vpc') {
        stroke = '#fbbf24';
        dash = '8,4';
        fill = 'rgba(251,191,36,0.04)';
      } else {
        stroke = '#fb7185';
        dash = '4,4';
        fill = 'rgba(251,113,133,0.05)';
      }
      labelY = b.y + 14;
      return [
        '<rect class="svg-boundary" x="' + b.x + '" y="' + b.y + '" ' +
          'width="' + b.w + '" height="' + b.h + '" rx="14" ' +
          'fill="' + fill + '" stroke="' + stroke + '" ' +
          'stroke-width="' + BOUNDARY_STROKE + '" stroke-dasharray="' + dash + '"/>',
        '<text x="' + (b.x + 14) + '" y="' + labelY + '" fill="' + stroke + '" ' +
          'font-size="11" font-weight="700">' + escapeXml(b.label) + '</text>',
        b.sub
          ? '<text x="' + (b.x + 14) + '" y="' + (labelY + 14) + '" ' +
              'fill="' + stroke + '" font-size="9" opacity="0.85">' +
              escapeXml(b.sub) + '</text>'
          : ''
      ].join('');
    }).join('');
  }

  function renderLegend(x, y) {
    var swatches = [
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'FastAPI Route' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Service Layer' },
      { fill: STYLES.database.fill, stroke: STYLES.database.stroke, label: 'MongoDB / Disk' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Middleware / Auth' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'ASGI Runtime' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'External Service' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync (REST)' },
      { color: CONN.async.color,     dash: '4,3',    label: 'Async (SSE / Stream)' },
      { color: CONN.data.color,      dash: null,     label: 'MongoDB I/O' },
      { color: CONN.auth.color,      dash: '5,5',    label: 'Auth / X-Token' },
      { color: CONN.frontend.color,  dash: null,     label: 'Client HTTPS' }
    ];

    var parts = [];
    parts.push('<text x="' + x + '" y="' + y + '" fill="#ffffff" font-size="13" font-weight="700">Legend</text>');
    var colW = 220, rowH = 28;
    swatches.forEach(function (s, i) {
      var sx = x + (i % 4) * colW;
      var sy = y + 24 + Math.floor(i / 4) * rowH;
      parts.push('<rect x="' + sx + '" y="' + sy + '" width="22" height="14" rx="3" ' +
                 'fill="' + s.fill + '" stroke="' + s.stroke + '" stroke-width="1.5"/>');
      parts.push('<text x="' + (sx + 32) + '" y="' + (sy + 11) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    var ly = y + 24 + Math.ceil(swatches.length / 4) * rowH + 16;
    parts.push('<text x="' + x + '" y="' + ly + '" fill="#cbd5e1" font-size="11" font-weight="600">Line styles</text>');
    lineStyles.forEach(function (s, i) {
      var sx = x + i * colW;
      var sy = ly + 16;
      var dashAttr = s.dash ? ' stroke-dasharray="' + s.dash + '"' : '';
      parts.push('<line x1="' + sx + '" y1="' + sy + '" x2="' + (sx + 36) + '" y2="' + sy + '" ' +
                 'stroke="' + s.color + '" stroke-width="' + STROKE + '"' + dashAttr + ' marker-end="url(#arrow-' + ({
                   '#34d399':'emerald','#fb923c':'orange','#fb7185':'rose',
                   '#fbbf24':'amber','#64748b':'slate'
                 })[s.color] + ')"/>');
      parts.push('<text x="' + (sx + 50) + '" y="' + (sy + 4) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 7 — OUTERMOST REGION
     ═══════════════════════════════════════════════════════════════════ */
  function renderOutermost(comps, bounds, legendY) {
    var minX = Math.min.apply(null, comps.map(function (c) { return c.x; })
        .concat(bounds.map(function (b) { return b.x; })));
    var minY = Math.min.apply(null, comps.map(function (c) { return c.y; })
        .concat(bounds.map(function (b) { return b.y; })));
    var maxX = Math.max.apply(null, comps.map(function (c) { return c.x + c.w; })
        .concat(bounds.map(function (b) { return b.x + b.w; })));
    var maxY = Math.max.apply(null, comps.map(function (c) { return c.y + c.h; })
        .concat(bounds.map(function (b) { return b.y + b.h; }))
        .concat([legendY + LEGEND_H]));
    var x = snap(minX - OUTER_PAD);
    var y = snap(minY - OUTER_PAD - 28);
    var w = snap(maxX - minX + 2 * OUTER_PAD);
    var h = snap(maxY - minY + 2 * OUTER_PAD + 28);
    return {
      x: x, y: y, w: w, h: h,
      labelY: y + 20,
      label: 'YiviY Process · /Users/yi/YrY/YiviY/',
      sub: 'FastAPI · Motor MongoDB · 19 runtime deps · 47 source files',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="320" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiviY Process · /Users/yi/YrY/YiviY/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'FastAPI · Motor MongoDB · 19 runtime deps · 47 source files' + '</text>' +
        renderCornerBrackets(x, y, w, h)
    };
  }

  function renderCornerBrackets(x, y, w, h) {
    return P.renderCornerBrackets(x, y, w, h, '#fbbf24', 12);
  }

  function renderLayerRail(comps) {
    var groups = {};
    comps.forEach(function (c) {
      if (!groups[c.layer]) groups[c.layer] = [];
      groups[c.layer].push(c);
    });

    var LAYER_INFO = [
      { key: 'client',   label: 'CLIENTS',           color: '#94a3b8' },
      { key: 'edge',     label: 'ASGI RUNTIME',      color: '#fbbf24' },
      { key: 'gateway',  label: 'APP + MIDDLEWARE',  color: '#fb7185' },
      { key: 'routes',   label: 'FASTAPI ROUTES',    color: '#22d3ee' },
      { key: 'services', label: 'BUSINESS SERVICES', color: '#34d399' },
      { key: 'data',     label: 'DATA LAYER',        color: '#a78bfa' },
      { key: 'external', label: 'EXTERNAL SERVICES', color: '#94a3b8' }
    ];

    var parts = [];
    LAYER_INFO.forEach(function (li) {
      var items = groups[li.key];
      if (!items || !items.length) return;
      var yMin = Math.min.apply(null, items.map(function (c) { return c.y; }));
      var yMax = Math.max.apply(null, items.map(function (c) { return c.y + c.h; }));
      var midY = (yMin + yMax) / 2;
      var labelX = 18;
      var labelY = midY;
      parts.push('<g class="layer-rail">');
      parts.push('<line x1="' + labelX + '" y1="' + yMin + '" x2="' + labelX + '" y2="' + yMax + '" ' +
                 'stroke="' + li.color + '" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>');
      parts.push('<text x="' + labelX + '" y="' + labelY + '" ' +
                 'fill="' + li.color + '" font-size="9" font-weight="700" ' +
                 'letter-spacing="1" text-anchor="middle" ' +
                 'transform="rotate(-90 ' + labelX + ' ' + labelY + ')">' +
                 escapeXml(li.label) + '</text>');
      parts.push('</g>');
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 8 — COMPOSE THE SVG
     ═══════════════════════════════════════════════════════════════════ */
  function buildSvg() {
    var comps = layoutComponents();
    var bounds = layoutBoundaries(comps);
    var legendX = 60;
    var legendY = 1140;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiviY · Video Translation & Dubbing Workbench Architecture</title>');
    parts.push('<desc id="diagram-desc">YiviY Streamlit workbench — st.py UI, 12-step pipeline (core/_N_xxx.py), backend adapters (ASR / LLM / TTS), intermediate output store, and external integrations with OpenAI GPT, Replicate, yt-dlp, WhisperX/CTranslate2, and ffmpeg/MoviePy.</desc>');
    parts.push(renderDefs());
    parts.push('<rect width="100%" height="100%" fill="url(#grid)"/>');
    parts.push('<rect width="100%" height="100%" fill="url(#grid-major)"/>');
    parts.push(renderLayerRail(comps));
    parts.push(renderArrows(comps, CONNECTION_DEFS));
    parts.push(renderMasks(comps));
    parts.push(renderComponents(comps));
    parts.push(renderBoundaries(bounds));
    parts.push(renderLegend(legendX, legendY));
    parts.push(outermost.markup);
    parts.push('</svg>');
    return parts.join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 9 — STATIC CONTENT
     ═══════════════════════════════════════════════════════════════════ */
  window.REPORT_DATA = {
    meta: {
      title: 'YiviY · Video Translation & Dubbing Workbench Architecture Diagram',
      pageTitle: 'YiviY — Streamlit + 12-Step Pipeline',
      subtitle: '视频翻译配音工作台 · Streamlit + Python · 12 步流水线 (download → ASR → NLP → translate → TTS → synthesis) · WhisperX · Replicate · OpenAI · CTranslate2 backends · 73 source files',
      footer: 'YiviY · /Users/yi/YrY/YiviY/ · Streamlit · WhisperX · OpenAI · Replicate · CTranslate2 · v1.0.0 · 2026-07-24',
      traceSub: '12-step pipeline · p95 dominated by ASR + LLM translate'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiviY is a Streamlit-based video translation & dubbing workbench. 73 source files organized around a 12-step pipeline (core/_N_xxx.py per step). Python runtime, no build step. Production install is `python install.py` (venv + pip + ffmpeg + spaCy model).' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Single-process Streamlit app — st.py renders the Web UI and triggers the 12-step pipeline. Each step (core/_N_xxx.py) is independently runnable; the orchestrator (config.yaml) drives sequential execution with intermediate JSON state persisted to output/. Backend adapters (core/asr_backend · core/tts_backend) wrap external services so steps stay backend-agnostic.' },
      { color: 'violet',  title: '▸ Key Decisions',      content: 'Streamlit over Flask/FastAPI for zero frontend code — UI is reactive widgets in pure Python. WhisperX + CTranslate2 for local ASR (data sovereignty, GPU acceleration). Pluggable LLM/TTS backends (OpenAI · Replicate · CTranslate2) so users can swap cloud ↔ local. spaCy for language-aware sentence splitting. MoviePy + ffmpeg for video composition. PyAnnote for multi-speaker diarization. Intermediate JSON enables step-level retry without restart.' }
    ],

    toc: [
      { href: '#diagram',   icon: '📐', label: 'Diagram' },
      { href: '#metrics',   icon: '📊', label: 'Metrics' },
      { href: '#summary',   icon: '📋', label: 'Summary' },
      { href: '#security',  icon: '🔒', label: 'Security' },
      { href: '#trace',     icon: '🔍', label: 'Trace' },
      { href: '#stack',     icon: '🧰', label: 'Stack' },
      { href: '#roadmap',   icon: '🔮', label: 'Roadmap' }
    ],

    metrics: [
      { label: 'Pipeline Steps',     status: null, value: '12',  valueClass: 'cyan',   sub: 'core/_N_xxx.py per step' },
      { label: 'Source Files',         status: null, value: '73',  valueClass: 'cyan',   sub: 'Python · config · i18n' },
      { label: 'Backend Adapters',      status: null, value: '4+',  valueClass: 'emerald', sub: 'ASR · LLM · TTS · AV' },
      { label: 'External APIs',         status: null, value: '3',   valueClass: 'amber',  sub: 'OpenAI · Replicate · yt-dlp' },
      { label: 'Intermediate Artifacts',status: null, value: '6+',  valueClass: 'violet', sub: 'words · segments · translated' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'Streamlit UI & 12-Step Pipeline',
        items: [
          '<strong>st.py</strong> is the single Streamlit entry — renders sidebar step selector, exposes single-step debug + full-pipeline run, and persists every intermediate JSON to output/ so any step can be retried without restart',
          '<strong>Config & Orchestrator</strong> (config.yaml + setup_env.py) drives step sequencing, retry policy, and backend selection (ASR / LLM / TTS) — switching WhisperX → Replicate is a YAML edit, not a code change',
          '<strong>Pipeline steps</strong> follow _N_xxx.py naming — yt-dlp download (1), WhisperX ASR (2), spaCy NLP split (3.1), semantic re-split (3.2), summary (4.1), LLM translate (4.2), subtitle split (5), SRT gen (6), burn subs (7), audio task (8.1), dub chunks (8.2), ref audio (9), TTS synth (10), merge (11), final render (12)',
          '<strong>core/st_utils/</strong> holds the Streamlit page components — sidebar_setting, download_video_section — keeping UI concerns out of step modules',
          '<strong>Step-level debugging</strong> via `python -c "from core._2_asr import run; run(video.mp4)"` — every step is callable in isolation'
        ]
      },
      {
        color: 'emerald',
        title: 'Backend Adapters & External Integrations',
        items: [
          '<strong>ASR adapter</strong> (core/asr_backend/) — WhisperX local (GPU via CTranslate2) is primary; audio_preprocess.py handles resample + denoise + VAD before inference',
          '<strong>Translate adapter</strong> — OpenAI GPT-4o is primary; Replicate cloud LLM is fallback; prompts loaded from core/prompts.py so prompt changes never touch step code',
          '<strong>TTS adapter</strong> (core/tts_backend/) — sf_fishtts.py (Replicate cloud voice cloning) + gpt_sovits_tts.py (local custom voice model); reference audio (step 9) seeds the cloning target',
          '<strong>AV service</strong> — ffmpeg subprocess for audio extraction (step 2 input prep) + audio merge (step 11) + subtitle burn (step 7); MoviePy for final video render (step 12)',
          '<strong>yt-dlp</strong> runs as subprocess in core/_1_ytdlp.py — supports YouTube / Bilibili / 1000+ sites; outputs video.mp4 to output/'
        ]
      },
      {
        color: 'violet',
        title: 'Data Layer & Observability',
        items: [
          '<strong>output/ directory</strong> is the intermediate + final artifact store — words.json · segments.json · translated.json · subtitle.srt · dub_chunks/ · reference.wav · tts_audio.wav · merged_audio.wav · final_output.mp4',
          '<strong>custom_terms.xlsx</strong> + translations/en.json · zh-CN.json — glossary + i18n are first-class data; the translate step loads custom_terms so domain vocabulary is preserved',
          '<strong>config.yaml</strong> is the single source of truth for backend selection — ASR_BACKEND=whisperX|replicate, LLM_API=openai|replicate, TTS_BACKEND=sf_fishtts|gpt_sovits|openai',
          '<strong>Rich logger</strong> provides console observability per step — progress bars + color-coded status; no distributed tracing yet (single-process)',
          '<strong>No automated tests yet</strong> — risk: medium (manual verification); the 5 architecture scenes in /YiDoc/projects/YiviY/arch/ document module location + data flow + trust boundary'
        ]
      }
    ],

    pipeline: [
      { badge: 'Install',    badgeClass: 'dev',  info: 'install.py<br/>venv + pip + ffmpeg' },
      { badge: 'Configure', badgeClass: 'dev',  info: 'config.yaml<br/>setup_env.py · API keys' },
      { badge: 'Run Step',  badgeClass: 'dev',  info: 'Streamlit sidebar<br/>single-step debug' },
      { badge: 'Full Pipeline', badgeClass: 'stg', info: 'st.py main<br/>12 steps sequential' },
      { badge: 'Batch',     badgeClass: 'prod', info: 'OneKeyBatch.bat<br/>VideoLingo_colab.ipynb' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Trust Boundaries',
        items: [
          '<strong>API key entry</strong> — OpenAI / Replicate / Azure keys loaded via setup_env.py from environment variables; .env file (gitignored) is the secret source; never hardcoded in core/*.py',
          '<strong>User uploads</strong> — video URLs are user-supplied; yt-dlp validates source against its site allowlist; arbitrary URL execution risk mitigated by yt-dlp\'s parser, not by YiviY',
          '<strong>External API calls</strong> — OpenAI GPT / Replicate / Azure TTS calls carry API keys in HTTP headers; HTTPS enforced; no client-side key exposure (Streamlit server-side rendering)',
          '<strong>Subprocess boundary</strong> — ffmpeg + yt-dlp invoked via subprocess.run() with explicit arg lists (no shell=True); user input never reaches shell; command injection surface is minimal',
          '<strong>Filesystem scope</strong> — all writes confined to output/ directory under project root; no path traversal; glossary file path is config-relative'
        ]
      },
      {
        color: 'amber',
        title: 'Network & External',
        items: [
          '<strong>yt-dlp</strong> fetches video from YouTube / Bilibili / 1000+ sites — outbound HTTPS only; no inbound port beyond Streamlit default :8501',
          '<strong>OpenAI API</strong> — api.openai.com over HTTPS; bearer-token auth; rate-limit headers respected; no streaming socket persistence between requests',
          '<strong>Replicate API</strong> — api.replicate.com over HTTPS; polling-based (not webhook) for cloud model inference; 10-min timeout per prediction',
          '<strong>WhisperX local</strong> — runs in-process; no network; GPU access via CUDA / MPS; CTranslate2 engine loads model weights from local cache',
          '<strong>Streamlit UI</strong> binds to 127.0.0.1:8501 by default — not exposed externally; OneKeyBatch.bat runs the pipeline headless without UI'
        ]
      },
      {
        color: 'orange',
        title: 'Data & Compliance',
        items: [
          '<strong>Intermediate JSON</strong> in output/ contains transcript + translation of the source video — no PII beyond what the video itself contains; cleared on full pipeline rerun',
          '<strong>custom_terms.xlsx</strong> is user-supplied glossary — domain vocabulary for translation; never sent to external APIs as a batch (only per-segment)',
          '<strong>Logs</strong> via Rich logger to stdout/stderr — no file logging by default; user must redirect to file if persistence is needed; no PII redaction (manual review)',
          '<strong>Config</strong> from config.yaml + env vars — secrets (OpenAI key, Replicate token, Azure key) live in .env only; .gitignore enforced',
          '<strong>Audit</strong> via per-step Rich progress bars + output/ artifacts — every step leaves a verifiable JSON/file artifact; no central audit log yet'
        ]
      }
    ],

    trace: [
      { name: '1. URL Input',   nameClass: 'cyan',    sub: 'Streamlit sidebar',     time: '~1s'    },
      { name: '2. yt-dlp',       nameClass: 'amber',  sub: 'video download',         time: '~30s'   },
      { name: '3. ASR',          nameClass: 'emerald', sub: 'WhisperX · GPU',         time: '~120s'  },
      { name: '4. NLP Split',    nameClass: 'cyan',    sub: 'spaCy sentence',         time: '~5s'    },
      { name: '5. Translate',    nameClass: 'orange',  sub: 'LLM (GPT-4o)',           time: '~60s'   },
      { name: '6. Subtitle Gen', nameClass: 'cyan',    sub: 'SRT · burn-in',          time: '~10s'   },
      { name: '7. TTS',          nameClass: 'orange',  sub: 'chunk synth · ref audio',time: '~90s'   },
      { name: '8. Final Render', nameClass: 'emerald', sub: 'MoviePy · ffmpeg merge', time: '~45s'   }
    ],

    scalingTiles: [
      {
        color: 'emerald',
        title: 'Pipeline Scaling',
        body: '<span style="color: var(--text-muted);">Single-proc:</span> Streamlit + Python<br/>' +
              '<span style="color: var(--text-muted);">GPU:</span> WhisperX is bottleneck<br/>' +
              '<span style="color: var(--text-muted);">CPU:</span> ffmpeg + MoviePy render<br/>' +
              '<span style="color: var(--text-muted);">Scale:</span> batch via OneKeyBatch'
      },
      {
        color: 'violet',
        title: 'Data Resilience',
        body: '<span style="color: var(--text-muted);">Store:</span> output/ intermediates<br/>' +
              '<span style="color: var(--text-muted);">Resume:</span> step-level retry<br/>' +
              '<span style="color: var(--text-muted);">Glossary:</span> custom_terms.xlsx<br/>' +
              '<span style="color: var(--text-muted);">i18n:</span> en.json · zh-CN.json'
      },
      {
        color: 'rose',
        title: 'External Limits',
        body: '<span style="color: var(--text-muted);">OpenAI:</span> rate-limit headers<br/>' +
              '<span style="color: var(--text-muted);">Replicate:</span> 10-min prediction<br/>' +
              '<span style="color: var(--text-muted);">yt-dlp:</span> site throttling<br/>' +
              '<span style="color: var(--text-muted);">WhisperX:</span> GPU VRAM bound'
      },
      {
        color: 'orange',
        title: 'Backend Choice',
        body: '<span style="color: var(--text-muted);">ASR:</span> WhisperX | Replicate<br/>' +
              '<span style="color: var(--text-muted);">LLM:</span> OpenAI | Replicate<br/>' +
              '<span style="color: var(--text-muted);">TTS:</span> OpenAI | Fish | GPT-SoVITS<br/>' +
              '<span style="color: var(--text-muted);">Switch:</span> config.yaml edit'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">st.py</span>',           'UI',        '<span style="color: var(--color-backend);">1</span>',  'Tier 1', 'UI · Alice',  '<span style="color: var(--text-dim);">st.py</span>'],
        ['<span style="color: var(--color-backend);">core/_N_*.py</span>',     'Pipeline',  '<span style="color: var(--color-backend);">15</span>','Tier 1', 'Pipeline · Bob','<span style="color: var(--text-dim);">core/</span>'],
        ['<span style="color: var(--color-security);">core/asr_backend</span>','ASR',       '<span style="color: var(--color-backend);">3</span>',  'Tier 0', 'AI · Carol',  '<span style="color: var(--text-dim);">core/asr_backend/</span>'],
        ['<span style="color: var(--color-security);">core/tts_backend</span>','TTS',       '<span style="color: var(--color-backend);">3</span>',  'Tier 0', 'AI · Carol',  '<span style="color: var(--text-dim);">core/tts_backend/</span>'],
        ['<span style="color: var(--color-database);">output/</span>',         'Data',      '<span style="color: var(--color-backend);">~20</span>','Tier 2','Ops · Dave',  '<span style="color: var(--text-dim);">output/</span>'],
        ['<span style="color: var(--color-cloud);">config.yaml</span>',        'Config',    '<span style="color: var(--color-backend);">1</span>',  'Tier 0', 'Ops · Eve',   '<span style="color: var(--text-dim);">config.yaml</span>']
      ]
    },

    stack: [
      { label: 'Streamlit',   value: '1.30',  valueClass: 'cyan'    },
      { label: 'WhisperX',    value: '3.1',   valueClass: 'emerald' },
      { label: 'CTranslate2', value: '4.0',   valueClass: 'emerald' },
      { label: 'PyAnnote',    value: '0.3',    valueClass: 'emerald' },
      { label: 'spaCy',       value: '3.7',   valueClass: 'cyan'    },
      { label: 'OpenAI',      value: 'gpt-4o',valueClass: 'orange'  },
      { label: 'Replicate',   value: 'API',   valueClass: 'orange'  },
      { label: 'yt-dlp',      value: '2024',  valueClass: 'amber'   },
      { label: 'ffmpeg',      value: '6.x',   valueClass: 'amber'   },
      { label: 'MoviePy',     value: '1.0',   valueClass: 'amber'   },
      { label: 'pydub',       value: '0.25',  valueClass: 'amber'   },
      { label: 'Rich',        value: '13.x',  valueClass: 'cyan'    }
    ],

    schemaTiles: [
      {
        title: 'words.json',
        body: '<span style="color: var(--color-cloud);">Step 2</span> ASR output<br/>' +
              'word String<br/>' +
              'start Float (sec)<br/>' +
              'end Float (sec)<br/>' +
              'speaker String (optional)<br/>' +
              '<span style="color: var(--text-dim);">word-level timestamps</span>'
      },
      {
        title: 'segments.json',
        body: '<span style="color: var(--color-cloud);">Step 3</span> NLP split<br/>' +
              'id Int<br/>' +
              'text String (source)<br/>' +
              'start/end Float<br/>' +
              'speaker String<br/>' +
              '<span style="color: var(--text-dim);">semantic-aware segments</span>'
      },
      {
        title: 'translated.json',
        body: '<span style="color: var(--color-cloud);">Step 4.2</span> LLM<br/>' +
              'id Int<br/>' +
              'source String<br/>' +
              'target String (translated)<br/>' +
              'glossary_terms [String]<br/>' +
              '<span style="color: var(--text-dim);">glossary-aware</span>'
      },
      {
        title: 'audio_tasks.json',
        body: '<span style="color: var(--color-cloud);">Step 8.1</span> TTS plan<br/>' +
              'chunk_id Int<br/>' +
              'text String (target)<br/>' +
              'duration Float<br/>' +
              'voice_ref String<br/>' +
              '<span style="color: var(--text-dim);">maps translation → audio</span>'
      },
      {
        title: 'subtitle.srt',
        body: '<span style="color: var(--color-cloud);">Step 6</span> subtitle<br/>' +
              'index Int<br/>' +
              'start/end (HH:MM:SS,mmm)<br/>' +
              'text String (bilingual)<br/>' +
              '<span style="color: var(--text-dim);">SRT / VTT format</span>'
      }
    ],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add Azure OpenAI as alternative LLM/TTS backend behind Translate + TTS adapters', textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add pytest test suite for core/_N_*.py step modules (currently manual verification)', textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Promote output/ artifact store to SQLite index for fast resume across videos',     textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add webhook-based Replicate predictions to replace current polling loop',           textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: 'No automated tests — manual verification via Streamlit single-step debug',          textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'Rich logger to stdout only — no persistent per-run audit log yet',                   textClass: 'muted' }
    ],

    glossary: [
      { term: 'Streamlit',     termClass: 'cyan',    def: 'Python reactive Web UI framework — no frontend code required' },
      { term: 'WhisperX',      termClass: 'emerald', def: 'ASR with word-level timestamps + speaker diarization' },
      { term: 'CTranslate2',  termClass: 'emerald', def: 'Fast Transformer inference engine — GPU-accelerated Whisper fallback' },
      { term: 'PyAnnote',      termClass: 'emerald', def: 'Speaker diarization library — multi-speaker segmentation' },
      { term: 'spaCy',         termClass: 'cyan',    def: 'Industrial NLP library — language-aware sentence splitting (step 3.1)' },
      { term: 'yt-dlp',        termClass: 'amber',   def: 'Video downloader fork of youtube-dl — YouTube / Bilibili / 1000+ sites' },
      { term: 'ffmpeg',        termClass: 'amber',   def: 'AV processing tool — extract / merge / mux (steps 2 / 7 / 11)' },
      { term: 'MoviePy',       termClass: 'amber',   def: 'Python video editing library — final render composition (step 12)' },
      { term: 'Replicate',     termClass: 'orange',  def: 'Cloud model inference API — alt backend for ASR / LLM / TTS' },
      { term: 'OpenAI',        termClass: 'orange',  def: 'GPT-4o translation + OpenAI TTS — primary cloud LLM/TTS backend' },
      { term: 'GPT-SoVITS',    termClass: 'orange',  def: 'Local TTS with custom voice models — core/tts_backend/gpt_sovits_tts.py' },
      { term: 'Pydub',         termClass: 'amber',   def: 'Audio chunk manipulation library — TTS alignment (steps 9 / 10)' }
    ]
  };
})();
