---
description: "HTML test fixture template — standard test page structure with Vue 3 component mounting and assertion patterns."
---

# Test Fixture Template

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test: {{component_name}}</title>
    <link rel="stylesheet" href="{{cdn_path}}/theme/code-dark.css">
    <link rel="stylesheet" href="test.css">
</head>
<body>
    <div id="test-mount"></div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="{{component_path}}/index.js"></script>
    <script src="test.js"></script>
</body>
</html>
```

## test.js

```javascript
// Test: {{component_name}}
(function() {
    'use strict';

    const results = [];
    function assert(description, fn) {
        try {
            const passed = fn();
            results.push({ description, passed, error: null });
        } catch (e) {
            results.push({ description, passed: false, error: e.message });
        }
    }

    // DOM presence
    assert('component renders', () => {
        return document.querySelector('{{selector}}') !== null;
    });

    // Text content
    assert('displays correct title', () => {
        return document.querySelector('{{selector}}').textContent.includes('{{expected_text}}');
    });

    // Report results
    console.table(results);
    window.__testResults = results;
})();
```
