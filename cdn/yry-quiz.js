/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · Quiz 自测交互

   依赖: DOM 中需存在 .quiz-card / .quiz-opt / .quiz-feedback / .quiz-score 元素
   用法: <script src="../yry-quiz.js"></script> (DOMContentLoaded 后自动绑定)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    document.querySelectorAll('.quiz-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var card = this.closest('.quiz-card');
        if (!card || card.classList.contains('answered')) return;
        card.classList.add('answered');
        var isCorrect = this.dataset.answer === 'correct';
        this.classList.add(isCorrect ? 'correct' : 'wrong');
        var fb = card.querySelector('.quiz-feedback');
        if (fb) fb.classList.add('show');
        card.querySelectorAll('.quiz-opt').forEach(function (o) { o.classList.add('disabled'); });
        if (isCorrect) {
          card.dataset.score = '1';
        }
        updateScore();
      });
    });
  }

  function updateScore() {
    var total = document.querySelectorAll('.quiz-card').length;
    var score = document.querySelectorAll('.quiz-card[data-score="1"]').length;
    var el = document.querySelector('.quiz-score');
    if (el) {
      el.classList.add('show');
      var big = el.querySelector('.qs-big');
      if (big) big.textContent = score + '/' + total;
    }
  }
})();
