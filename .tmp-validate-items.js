const fs = require('fs');
const path = require('path');

const root = '/Users/ruiyi/Yi/YrY';
const file = path.join(root, 'docs/js/yry-item-cards.js');
const content = fs.readFileSync(file, 'utf8');

// Find the assignment and extract the object
const start = content.indexOf('window.YRY_ITEM_CARDS = {');
const end = content.indexOf('};', start) + 2;
const dataSrc = content.substring(start + 'window.YRY_ITEM_CARDS = '.length, end);
const data = eval('(' + dataSrc + ')');

let total = 0;
Object.entries(data).forEach(([k, v]) => {
  console.log(k + ': ' + v.length + ' items');
  total += v.length;
});
console.log('TOTAL: ' + total + ' items');

// Validate each item has required fields
let issues = 0;
Object.entries(data).forEach(([grid, items]) => {
  items.forEach((item, i) => {
    if (!item.icon) { console.log('  ❌ ' + grid + '[' + i + ']: missing icon'); issues++; }
    if (!item.iconModifier) { console.log('  ❌ ' + grid + '[' + i + ']: missing iconModifier'); issues++; }
    if (!item.name) { console.log('  ❌ ' + grid + '[' + i + ']: missing name'); issues++; }
    if (!['skill','agent','rule','ref'].includes(item.iconModifier)) {
      console.log('  ❌ ' + grid + '[' + i + ']: invalid iconModifier=' + item.iconModifier); issues++;
    }
    if (item.tags) {
      item.tags.forEach((t, j) => {
        if (!t.text) { console.log('  ❌ ' + grid + '[' + i + '].tags[' + j + ']: missing text'); issues++; }
        if (!t.modifier) { console.log('  ❌ ' + grid + '[' + i + '].tags[' + j + ']: missing modifier'); issues++; }
      });
    }
  });
});

if (issues === 0) console.log('✓ All items valid');
else console.log('✗ ' + issues + ' issues found');
