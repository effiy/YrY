const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  let authHeader = null;
  let gotResults = false;

  // CRITICAL: Set up request interception BEFORE navigating
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();

    if (url.includes('gateway-int-zk.zeekrlife.com')) {
      const auth = req.headers()['authorization'];
      if (auth && !authHeader) {
        authHeader = auth;
        fs.writeFileSync('/tmp/agile_token.txt', auth);
        console.log('✅ 捕获到完整 Token (已保存到 /tmp/agile_token.txt)');
      }
    }
    route.continue();
  });

  // Also capture the API response body
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('selectAll') && response.status() === 200 && !gotResults) {
      try {
        const body = await response.json();
        if (body.code === 200 && body.data) {
          gotResults = true;
          const { total, records } = body.data;
          const today = new Date().toISOString().split('T')[0];

          // Filter to today's defects
          const todayRecords = records.filter(r => r.createTime && r.createTime.startsWith(today));

          console.log(`\n📋 总缺陷: ${total}, 今天创建: ${todayRecords.length}\n`);

          if (todayRecords.length > 0) {
            console.log('| # | ID | 标题 | 优先级 | 严重程度 | 状态 | 处理人 | 迭代 | 创建时间 |');
            console.log('|---|----|------|--------|----------|------|--------|------|----------|');
            const statusMap = { pending: '待解决', reopened: '重新打开', resolved: '已解决', closed: '已关闭' };
            const priorityMap = { urgent: '紧急', high: '高', medium: '中', low: '低' };
            const severityMap = { fatal: '致命', serious: '严重', general: '一般', slight: '轻微', suggest: '建议' };
            todayRecords.forEach((r, i) => {
              const status = statusMap[r.status] || r.status;
              const priority = priorityMap[r.priority] || r.priority;
              const severity = severityMap[r.defectSeverityLevel] || r.defectSeverityLevel;
              const title = (r.defectName || '').substring(0, 30);
              console.log(`| ${i + 1} | ${r.id} | ${title} | ${priority} | ${severity} | ${status} | ${r.operatorName || '-'} | ${r.iterationName || '-'} | ${r.createTime || '-'} |`);
            });
            fs.writeFileSync('/tmp/agile_defects.json', JSON.stringify(todayRecords, null, 2));
            console.log('\n✅ 数据已保存到 /tmp/agile_defects.json');
          } else {
            // Show all unresolved
            const unresolved = records.filter(r => r.status === 'pending' || r.status === 'reopened');
            console.log(`今天没有新创建的缺陷。当前未解决缺陷共 ${unresolved.length} 条。`);
            fs.writeFileSync('/tmp/agile_defects.json', JSON.stringify(records, null, 2));
          }
        }
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    }
  });

  console.log('🌐 正在打开 Agile MP 缺陷页面...');
  await page.goto('https://agilemp.zeekrlife.com/agile/#/projex/defect?productId=11790486', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  console.log('⏳ 等待 API 请求...');
  await page.waitForTimeout(5000);

  if (!gotResults) {
    console.log('⏳ 再等待 5 秒...');
    await page.waitForTimeout(5000);
  }

  if (!gotResults) {
    console.log('⚠️  未捕获到缺陷数据。请确认页面已加载缺陷列表。');
  }

  console.log('\n浏览器保持打开，按 Ctrl+C 关闭。');
  await new Promise(() => {});
})();