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

  var _script = document.currentScript;
  var _dataUrl = _script && _script.src ? _script.src.replace(/index\.js(\?[^]*)?$/, 'data.json') : './data.json';
  var _dataCache = null;
  var _dataPromise = fetch(_dataUrl).then(function (r) { return r.json(); }).then(function (d) { _dataCache = d; }).catch(function (err) { console.error('[YrYCytoscapeGraph] data.json load failed:', err); });

  // ── YrY Dark Theme Style ──────────────────────────────────────────────────

  var YRY_CY_STYLE = null;

  // ── Legend configuration ──────────────────────────────────────────────────

  var LEGEND_TYPES = null;

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

  _dataPromise.then(function () {
    if (_dataCache) {
      YRY_CY_STYLE = _dataCache.YRY_CY_STYLE || [];
      LEGEND_TYPES = _dataCache.LEGEND_TYPES || [];
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  });
})();
