/* ==========================================================================
   yry-cytoscape-graph/index.js — Zero-config Cytoscape knowledge graph

   Usage:
     <!-- Basic: auto-init from data-elements-url -->
     <div class="yry-cytoscape-graph"
          data-elements-url="elements.json"
          data-layout="breadthfirst"
          style="width:100%;height:600px">
     </div>

     <!-- With inline data -->
     <div class="yry-cytoscape-graph" id="my-graph" style="width:100%;height:600px"></div>
     <script>
       document.getElementById('my-graph').graphData = { nodes: [...], edges: [...] };
     </script>

     <!-- With export toolbar -->
     <div class="yry-cytoscape-graph"
          data-elements-url="elements.json"
          data-export="true"
          data-filename="knowledge-graph"
          style="width:100%;height:600px">
     </div>

   Options (data-* attributes):
     data-elements-url  — URL to fetch graph elements JSON from
     data-layout        — Cytoscape layout name (default: 'breadthfirst')
     data-export        — Show export toolbar ('true' / 'false', default: 'true')
     data-filename      — Base filename for exports (default: 'knowledge-graph')
     data-zoom-min      — Min zoom level (default: 0.3)
     data-zoom-max      — Max zoom level (default: 3)

   Dependencies (must be loaded before this script):
     - cytoscape (window.cytoscape)
     - html2canvas (for export, optional)
     - jspdf (for PDF export, optional)
     - yry-export-toolbar (for export buttons, optional — auto-detected)

   The component exposes graph instances on window.YrYCytoscapeGraph.instances.
   ========================================================================== */

(function () {
  'use strict';

  // ── YrY Dark Theme Style ──────────────────────────────────────────────────

  var YRY_CY_STYLE = [
    { selector: 'node',
      style: {
        'background-color': '#3b82f6',
        'label': 'data(label)',
        'color': '#e2e8f0',
        'font-size': '11px',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 6,
        'text-background-color': 'rgba(15,23,42,0.85)',
        'text-background-opacity': 1,
        'text-background-padding': '3px 6px',
        'text-background-shape': 'roundrectangle',
        'border-width': 2,
        'border-color': '#1e40af',
        'width': 36,
        'height': 36
      }
    },
    { selector: 'node[type="story"]',
      style: { 'background-color': '#f59e0b', 'border-color': '#b45309', 'width': 44, 'height': 44, 'font-size': '12px', 'font-weight': 'bold' }
    },
    { selector: 'node[type="scene"]',
      style: { 'background-color': '#8b5cf6', 'border-color': '#5b21b6', 'width': 38, 'height': 38 }
    },
    { selector: 'node[type="source"]',
      style: { 'background-color': '#3b82f6', 'border-color': '#1e40af', 'width': 30, 'height': 30, 'font-size': '10px' }
    },
    { selector: 'node[type="skill"]',
      style: { 'background-color': '#22c55e', 'border-color': '#15803d', 'shape': 'roundrectangle', 'width': 40, 'height': 28 }
    },
    { selector: 'node[type="agent"]',
      style: { 'background-color': '#ec4899', 'border-color': '#9d174d', 'shape': 'diamond', 'width': 32, 'height': 32 }
    },
    { selector: 'node[type="rule"]',
      style: { 'background-color': '#06b6d4', 'border-color': '#0e7490', 'shape': 'rectangle', 'width': 36, 'height': 24, 'font-size': '9px' }
    },
    { selector: 'node[type="doc"]',
      style: { 'background-color': '#a1a1aa', 'border-color': '#52525b', 'shape': 'roundrectangle', 'width': 34, 'height': 24, 'font-size': '9px' }
    },
    { selector: 'node[type="external"]',
      style: { 'background-color': '#ef4444', 'border-color': '#991b1b', 'shape': 'hexagon', 'width': 34, 'height': 34 }
    },
    { selector: 'node:selected',
      style: { 'border-width': 4, 'border-color': '#FFC107', 'border-opacity': 1 }
    },
    { selector: 'node.dimmed',
      style: { 'opacity': 0.2 }
    },
    { selector: 'node.highlighted',
      style: { 'border-width': 3, 'border-color': '#FFC107', 'border-opacity': 1 }
    },
    { selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': 'rgba(148,163,184,0.3)',
        'target-arrow-color': 'rgba(148,163,184,0.4)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'color': '#94a3b8',
        'font-size': '9px',
        'text-rotation': 'autorotate'
      }
    },
    { selector: 'edge[type="depends"]',
      style: { 'line-color': 'rgba(59,130,246,0.4)', 'target-arrow-color': 'rgba(59,130,246,0.5)', 'line-style': 'dashed' }
    },
    { selector: 'edge[type="generates"]',
      style: { 'line-color': 'rgba(34,197,94,0.4)', 'target-arrow-color': 'rgba(34,197,94,0.5)', 'width': 2 }
    },
    { selector: 'edge[type="triggers"]',
      style: { 'line-color': 'rgba(239,68,68,0.4)', 'target-arrow-color': 'rgba(239,68,68,0.5)', 'width': 2, 'line-style': 'dashed' }
    },
    { selector: 'edge[type="references"]',
      style: { 'line-color': 'rgba(139,92,246,0.35)', 'target-arrow-color': 'rgba(139,92,246,0.45)', 'line-style': 'dotted' }
    },
    { selector: 'edge.dimmed',
      style: { 'opacity': 0.08 }
    },
    { selector: 'edge.highlighted',
      style: { 'width': 2.5, 'line-color': 'rgba(255,193,7,0.6)', 'target-arrow-color': 'rgba(255,193,7,0.7)' }
    }
  ];

  // ── Legend configuration ──────────────────────────────────────────────────

  var LEGEND_TYPES = [
    { type: 'story',     label: 'Story',     color: '#f59e0b' },
    { type: 'scene',     label: 'Scene',     color: '#8b5cf6' },
    { type: 'source',    label: 'Source',    color: '#3b82f6' },
    { type: 'skill',     label: 'Skill',     color: '#22c55e' },
    { type: 'agent',     label: 'Agent',     color: '#ec4899' },
    { type: 'rule',      label: 'Rule',      color: '#06b6d4' },
    { type: 'doc',       label: 'Doc',       color: '#a1a1aa' },
    { type: 'external',  label: 'External',  color: '#ef4444' }
  ];

  function buildLegend() {
    var html = '';
    LEGEND_TYPES.forEach(function (t) {
      html += '<span class="yry-cy-legend-item">' +
        '<span class="yry-cy-legend-dot" style="background:' + t.color + '"></span>' +
        t.label +
        '</span>';
    });
    return '<div class="yry-cy-legend">' + html + '</div>';
  }

  // ── Neighborhood Highlight ────────────────────────────────────────────────

  function highlightNeighborhood(cy, node) {
    var neighborhood = node.closedNeighborhood();
    cy.elements().addClass('dimmed');
    neighborhood.removeClass('dimmed');
    neighborhood.addClass('highlighted');
    node.removeClass('dimmed');
    node.addClass('highlighted');
  }

  function clearHighlight(cy) {
    cy.elements().removeClass('dimmed').removeClass('highlighted');
  }

  // ── Export Toolbar integration ───────────────────────────────────────────

  function buildExportToolbar(filename) {
    return '<div class="yry-export-toolbar" data-target=".yry-cy-container" data-filename="' + filename + '" data-bg="#020617" data-scale="2">' +
      '<button data-action="copy-png" title="Copy as PNG">📋 Copy</button>' +
      '<button data-action="download-png" title="Download PNG">🖼 PNG</button>' +
      '<button data-action="download-pdf" title="Download PDF">📄 PDF</button>' +
      '</div>';
  }

  // ── Graph initialization ──────────────────────────────────────────────────

  function initGraph(container) {
    var containerId = container.id || ('yry-cy-' + Math.random().toString(36).slice(2, 8));
    if (!container.id) container.id = containerId;

    // Create inner container
    var cyContainer = document.createElement('div');
    cyContainer.className = 'yry-cy-container';
    cyContainer.id = containerId + '-cy';
    container.appendChild(cyContainer);

    // Add export toolbar
    var showExport = container.getAttribute('data-export') !== 'false';
    if (showExport) {
      var filename = container.getAttribute('data-filename') || 'knowledge-graph';
      container.insertAdjacentHTML('beforeend', buildExportToolbar(filename));
    }

    // Add legend (skip if data-legend="false")
    var showLegend = container.getAttribute('data-legend') !== 'false';
    if (showLegend) {
      container.insertAdjacentHTML('beforeend', buildLegend());
    }

    // Layout options
    var layoutName = container.getAttribute('data-layout') || 'breadthfirst';
    var zoomMin = parseFloat(container.getAttribute('data-zoom-min') || '0.3');
    var zoomMax = parseFloat(container.getAttribute('data-zoom-max') || '3');

    // Create cytoscape instance
    var cy = cytoscape({
      container: cyContainer,
      style: YRY_CY_STYLE,
      elements: container.graphData || { nodes: [], edges: [] },
      layout: { name: layoutName, directed: true, spacingFactor: 1.5, animate: true, animationDuration: 500 },
      minZoom: zoomMin,
      maxZoom: zoomMax,
      wheelSensitivity: 0.3
    });

    // Click/tap → neighborhood highlight
    cy.on('tap', 'node', function (evt) {
      var node = evt.target;
      highlightNeighborhood(cy, node);
    });

    cy.on('tap', function (evt) {
      if (evt.target === cy) {
        clearHighlight(cy);
      }
    });

    // Store instance
    if (!window.YrYCytoscapeGraph) window.YrYCytoscapeGraph = { instances: {} };
    window.YrYCytoscapeGraph.instances[containerId] = { cy: cy, container: container };

    return cy;
  }

  // ── Async initialization with data fetching ──────────────────────────────

  function initGraphAsync(container) {
    var url = container.getAttribute('data-elements-url');
    if (url) {
      return fetch(url)
        .then(function (r) { return r.ok ? r.json() : { nodes: [], edges: [] }; })
        .then(function (data) {
          container.graphData = data;
          return initGraph(container);
        })
        .catch(function () {
          container.graphData = { nodes: [], edges: [] };
          return initGraph(container);
        });
    }
    // Inline data: check if graphData was set before script loaded
    if (!container.graphData) {
      container.graphData = { nodes: [], edges: [] };
    }
    return Promise.resolve(initGraph(container));
  }

  // ── Auto-initialize ──────────────────────────────────────────────────────

  function initAll() {
    var containers = document.querySelectorAll('.yry-cytoscape-graph');
    var promises = [];
    for (var i = 0; i < containers.length; i++) {
      promises.push(initGraphAsync(containers[i]));
    }
    return Promise.all(promises);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
