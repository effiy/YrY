/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryMiniQuiz · 交互式小测验 脚本
   零依赖 vanilla JS — 从 JSON 数据渲染互动测验

   数据格式 (放在 <script type="application/json" id="..."> 中):
   {
     "title": "测验标题",
     "questions": [
       {
         "id": "q1",
         "text": "题目文本",
         "options": [
           { "letter": "A", "text": "选项 A" },
           { "letter": "B", "text": "选项 B" }
         ],
         "answer": "B",
         "feedback": "选择 B 的原因解释"
       }
     ]
   }

   使用方式:
     <script type="application/json" id="quiz-data">
     { "title": "...", "questions": [...] }
     </script>
     <yry-mini-quiz></yry-mini-quiz>
     <script src="yry-mini-quiz/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-mini-quiz';

  var YryMiniQuiz = function () {
    return Reflect.construct(HTMLElement, [], YryMiniQuiz);
  };
  YryMiniQuiz.prototype = Object.create(HTMLElement.prototype);

  YryMiniQuiz.prototype.connectedCallback = function () {
    var self = this;

    // Read config from preceding <script type="application/json">
    var dataEl = this.previousElementSibling;
    if (!dataEl || dataEl.tagName !== 'SCRIPT' || dataEl.type !== 'application/json') {
      var id = this.id;
      if (id) {
        dataEl = document.querySelector('script[type="application/json"][id="' + id + '-data"]');
      }
    }

    var cfg;
    if (dataEl) {
      try { cfg = JSON.parse(dataEl.textContent); }
      catch (e) { cfg = null; }
    }
    if (!cfg || !cfg.questions || !cfg.questions.length) {
      this.innerHTML = '<div style="text-align:center;padding:24px;color:var(--yry-text3,#888)">❓ 无测验数据</div>';
      return;
    }

    var title = cfg.title || '';
    var questions = cfg.questions;
    var answered = {};
    var totalCorrect = 0;
    var totalAnswered = 0;

    // Build UI
    var wrap = document.createElement('div');
    wrap.className = 'quiz-wrap';

    if (title) {
      var titleEl = document.createElement('div');
      titleEl.className = 'quiz-title';
      titleEl.textContent = '❓ ' + title;
      wrap.appendChild(titleEl);
    }

    var list = document.createElement('div');
    list.className = 'quiz-list';

    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var card = document.createElement('div');
      card.className = 'quiz-card';
      card.setAttribute('data-qid', q.id);

      // Question text
      var qHead = document.createElement('div');
      qHead.className = 'quiz-q';
      qHead.innerHTML = '<span class="q-num">' + (i + 1) + '</span><span>' + escapeHtml(q.text) + '</span>';
      card.appendChild(qHead);

      // Options
      var opts = document.createElement('div');
      opts.className = 'quiz-opts';

      for (var j = 0; j < q.options.length; j++) {
        var opt = q.options[j];
        var optEl = document.createElement('div');
        optEl.className = 'quiz-opt';
        optEl.setAttribute('data-letter', opt.letter);
        optEl.innerHTML =
          '<span class="opt-letter">' + escapeHtml(opt.letter) + '</span>' +
          '<span class="opt-text">' + escapeHtml(opt.text) + '</span>';

        (function (qid, letter, card, optEl) {
          optEl.addEventListener('click', function () {
            if (answered[qid]) return;
            answered[qid] = letter;
            totalAnswered++;

            var allOpts = card.querySelectorAll('.quiz-opt');
            var isCorrect = (letter === q.answer);

            // Disable all options
            for (var k = 0; k < allOpts.length; k++) {
              allOpts[k].classList.add('disabled');
            }

            // Mark selected
            optEl.classList.add('selected');

            if (isCorrect) {
              optEl.classList.add('correct');
              totalCorrect++;
            } else {
              optEl.classList.add('wrong');
              // Highlight correct answer
              var correctEl = card.querySelector('.quiz-opt[data-letter="' + q.answer + '"]');
              if (correctEl) correctEl.classList.add('correct');
            }

            // Show feedback
            var fb = card.querySelector('.quiz-feedback');
            if (fb && q.feedback) {
              fb.innerHTML = '<strong>' + (isCorrect ? '✅ 正确！' : '❌ 错误！') + '</strong> ' + escapeHtml(q.feedback);
              fb.classList.add('show');
            }

            // Check if all answered
            if (totalAnswered >= questions.length) {
              var scoreEl = wrap.querySelector('.quiz-score');
              if (scoreEl) {
                var pct = Math.round((totalCorrect / questions.length) * 100);
                var emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
                scoreEl.querySelector('.qs-big').textContent = emoji + ' ' + totalCorrect + '/' + questions.length + ' (' + pct + '%)';
                scoreEl.classList.add('show');
              }
            }
          });
        })(q.id, opt.letter, card, optEl);

        opts.appendChild(optEl);
      }
      card.appendChild(opts);

      // Feedback area
      var fb = document.createElement('div');
      fb.className = 'quiz-feedback';
      card.appendChild(fb);

      list.appendChild(card);
    }

    wrap.appendChild(list);

    // Score board
    var score = document.createElement('div');
    score.className = 'quiz-score';
    score.innerHTML =
      '<div class="qs-big">0/' + questions.length + '</div>' +
      '<div class="qs-sub">完成所有题目后显示总分</div>';
    wrap.appendChild(score);

    this.appendChild(wrap);
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryMiniQuiz);
  }
})();
