/**
 * app/mermaid.js — Mermaid rendering and fallback handling.
 */
(function () {
    'use strict';

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};

    function mermaidTheme() {
        return document.documentElement.getAttribute('data-yry-theme') === 'light' ? 'default' : 'dark';
    }

    function normalizeSource(source) {
        var text = String(source || '').replace(/\r\n?/g, '\n').trim();
        text = text.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim();
        text = text.replace(/^%%\{[\s\S]*?\}%%\s*/, '').trim();
        return text;
    }

    function clearError(element) {
        element.classList.remove('is-error');
        element.removeAttribute('data-mermaid-error');
        var note = element.parentNode && element.parentNode.querySelector('.mermaid-error-note');
        if (note && note.parentNode) {
            note.parentNode.removeChild(note);
        }
    }

    function showError(element, err, source) {
        var message = (err && err.message) ? err.message : String(err || 'Unknown Mermaid error');
        clearError(element);
        element.classList.add('is-error');
        element.setAttribute('data-mermaid-error', message);
        element.removeAttribute('data-processed');
        element.innerHTML = '';
        element.textContent = source;

        var note = document.createElement('div');
        note.className = 'mermaid-error-note';
        note.textContent = 'Mermaid render failed — showing source instead. ' + message;
        if (element.parentNode) {
            element.parentNode.appendChild(note);
        }
    }

    function waitForMermaid() {
        if (typeof window.mermaid === 'object' && window.mermaid && typeof window.mermaid.render === 'function') {
            return Promise.resolve(window.mermaid);
        }

        var loadPromise = (typeof window.__mermaidLoadPromise === 'object' &&
            window.__mermaidLoadPromise &&
            typeof window.__mermaidLoadPromise.then === 'function')
            ? window.__mermaidLoadPromise
            : Promise.resolve();

        return loadPromise.catch(function () {
            return null;
        }).then(function () {
            return new Promise(function (resolve, reject) {
                var waited = 0;
                var timer = setInterval(function () {
                    waited += 100;
                    if (typeof window.mermaid === 'object' && window.mermaid && typeof window.mermaid.render === 'function') {
                        clearInterval(timer);
                        resolve(window.mermaid);
                        return;
                    }
                    if (waited >= 5000) {
                        clearInterval(timer);
                        reject(new Error(
                            'window.mermaid was not ready within 5000ms. ' +
                            'The local copy and the CDN fallback both failed to load — ' +
                            'check the Network tab and confirm the report is allowed to ' +
                            'reach cdn.jsdelivr.net.'
                        ));
                    }
                }, 100);
            });
        });
    }

    function renderOne(mermaidApi, element, idx) {
        var source = normalizeSource(element.getAttribute('data-mermaid-src'));
        if (!source) return Promise.resolve();

        clearError(element);
        element.removeAttribute('data-processed');
        element.innerHTML = '';

        var renderId = 'yry-test-mermaid-' + idx + '-' + Date.now();
        return Promise.resolve(
            typeof mermaidApi.parse === 'function' ? mermaidApi.parse(source) : true
        ).then(function () {
            return mermaidApi.render(renderId, source);
        }).then(function (result) {
            var svg = result && result.svg ? result.svg : result;
            if (!svg) throw new Error('Mermaid returned empty SVG output.');
            element.innerHTML = svg;
            if (result && typeof result.bindFunctions === 'function') {
                try {
                    result.bindFunctions(element);
                } catch (e) {}
            }
            element.setAttribute('data-processed', 'true');
        }).catch(function (err) {
            console.warn('[yry-report-test] mermaid render failed:', err);
            showError(element, err, source);
        });
    }

    RuiSelfTestApp.renderMermaidDiagrams = function renderMermaidDiagrams() {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('.scene-mermaid.mermaid'));
        if (!nodes.length) return;

        function populateSources() {
            for (var i = 0; i < nodes.length; i++) {
                var element = nodes[i];
                var source = normalizeSource(element.getAttribute('data-mermaid-src'));
                if (!source) continue;
                if (element.getAttribute('data-render-source') !== source) {
                    element.removeAttribute('data-processed');
                    element.setAttribute('data-render-source', source);
                }
                if (element.getAttribute('data-processed') !== 'true') {
                    element.textContent = source;
                }
            }
        }

        function renderAll(mermaidApi) {
            mermaidApi.initialize({
                startOnLoad: false,
                theme: mermaidTheme(),
                securityLevel: 'loose',
                flowchart: { htmlLabels: true, useMaxWidth: true },
            });
            populateSources();
            return Promise.all(nodes.map(function (element, idx) {
                return renderOne(mermaidApi, element, idx);
            }));
        }

        waitForMermaid()
            .then(renderAll)
            .catch(function (err) {
                console.warn('[yry-report-test] Mermaid unavailable:', err);
                populateSources();
                for (var i = 0; i < nodes.length; i++) {
                    showError(nodes[i], err, normalizeSource(nodes[i].getAttribute('data-mermaid-src')));
                }
            });
    };
})();
