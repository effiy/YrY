document.querySelector('.tabs').addEventListener('click',function(e){
  var tab=e.target.closest('.tab');if(!tab)return;
  document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('on',t===tab)});
  document.querySelectorAll('.panel').forEach(function(p){
    p.classList.toggle('on',p.id==='panel'+tab.dataset.panel.charAt(0).toUpperCase()+tab.dataset.panel.slice(1))
  });
});
document.addEventListener('click',function(e){
  var head=e.target.closest('.s-head');
  if(head)head.closest('.suite').classList.toggle('open');
});
