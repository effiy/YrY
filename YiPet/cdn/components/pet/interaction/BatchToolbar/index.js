;(function () {
  'use strict'
  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/interaction/BatchToolbar/index.html'
  const TEMPLATE_ID = '#yi-pet-batch-toolbar-template'
  let templateCache = ''

  /**
   * 预加载模板
   */
  async function loadTemplate () {
    if (templateCache) return templateCache
    try {
      var dh = window.DomHelper || window.TemplateHelper
      if (dh && typeof dh.loadHtmlTemplate === 'function') {
        templateCache = await dh.loadHtmlTemplate(TEMPLATE_PATH, TEMPLATE_ID, 'Failed to load BatchToolbar template')
      }
    } catch (_) {}
    return templateCache
  }

  /**
   * 从模板克隆 DOM 片段
   */
  function cloneFromTemplate (templateHtml) {
    var tpl = document.createElement('template')
    tpl.innerHTML = templateHtml
    return tpl.content.cloneNode(true)
  }

  /**
   * 降级用的 DOM 模板（当远程模板加载失败时使用）
   * 结构与 createLegacy() 生成的 DOM 完全一致
   */
  var BATCH_TOOLBAR_DOM_TPL = '<div id="batch-toolbar" class="session-batch-toolbar">\
    <div class="batch-toolbar-left">\
      <label class="batch-select-all">\
        <input type="checkbox" id="select-all-checkbox" />\
        <span>全选</span>\
      </label>\
      <span id="selected-count" class="batch-selected-count js-hidden"></span>\
    </div>\
    <div class="batch-toolbar-right">\
      <button type="button" id="batch-delete-btn" class="batch-action-btn batch-delete-btn" disabled title="删除选中会话">\
        <i class="fas fa-trash-alt"></i> 删除\
      </button>\
      <button type="button" class="batch-action-btn batch-cancel-btn" title="退出批量模式">取消</button>\
    </div>\
  </div>'

  /**
   * 创建 DOM 结构（降级方案 - 从内置模板克隆）
   */
  function createLegacy () {
    var fragment = cloneFromTemplate(BATCH_TOOLBAR_DOM_TPL)
    return fragment.firstElementChild
  }

  // 预加载模板
  loadTemplate()

  /**
   * create(options) -> { element, update(count), setDeleting(bool), destroy() }
   * options: { onSelectAll, onDelete, onCancel }
   */
  function create (options) {
    var onSelectAll = options && options.onSelectAll
    var onDelete = options && options.onDelete
    var onCancel = options && options.onCancel

    // 从模板创建或降级
    var toolbar
    if (templateCache) {
      try {
        var fragment = cloneFromTemplate(templateCache)
        toolbar = fragment.firstElementChild
      } catch (_) {
        toolbar = createLegacy()
      }
    }
    if (!toolbar) toolbar = createLegacy()

    // 获取模板中的关键元素
    var selectAllCheckbox = toolbar.querySelector('#select-all-checkbox')
    var selectedCount = toolbar.querySelector('#selected-count')
    var batchDeleteBtn = toolbar.querySelector('#batch-delete-btn')
    var cancelBatchBtn = toolbar.querySelector('.batch-cancel-btn')

    // 降级时，可能某些元素为 null，需要兼容
    if (!selectAllCheckbox) selectAllCheckbox = document.createElement('input')
    if (!selectedCount) selectedCount = document.createElement('span')
    if (!batchDeleteBtn) batchDeleteBtn = document.createElement('button')
    if (!cancelBatchBtn) cancelBatchBtn = document.createElement('button')

    // ---- 事件绑定 ----
    var _onSelectAllChange = null
    var _onDeleteClick = null
    var _onCancelClick = null

    if (typeof onSelectAll === 'function') {
      _onSelectAllChange = function () { onSelectAll() }
      selectAllCheckbox.addEventListener('change', _onSelectAllChange)
    }

    if (typeof onDelete === 'function') {
      _onDeleteClick = function (e) {
        e.preventDefault()
        onDelete()
      }
      batchDeleteBtn.addEventListener('click', _onDeleteClick)
    }

    if (typeof onCancel === 'function') {
      _onCancelClick = function (e) {
        e.preventDefault()
        onCancel()
      }
      cancelBatchBtn.addEventListener('click', _onCancelClick)
    }

    // ---- 对外 API ----
    function update (count) {
      var n = typeof count === 'number' ? count : 0
      if (n > 0) {
        selectedCount.textContent = '\u5DF2\u9009 ' + n + ' \u9879'
        selectedCount.classList.remove('js-hidden')
        batchDeleteBtn.disabled = false
      } else {
        selectedCount.textContent = ''
        selectedCount.classList.add('js-hidden')
        batchDeleteBtn.disabled = true
      }
    }

    function setDeleting (isDeleting) {
      if (isDeleting) {
        batchDeleteBtn._originalContent = batchDeleteBtn.innerHTML
        batchDeleteBtn.disabled = true
        batchDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> \u5220\u9664\u4E2D...'
      } else {
        batchDeleteBtn.disabled = false
        batchDeleteBtn.innerHTML = batchDeleteBtn._originalContent || batchDeleteBtn.innerHTML
      }
    }

    function destroy () {
      if (_onSelectAllChange) {
        selectAllCheckbox.removeEventListener('change', _onSelectAllChange)
        _onSelectAllChange = null
      }
      if (_onDeleteClick) {
        batchDeleteBtn.removeEventListener('click', _onDeleteClick)
        _onDeleteClick = null
      }
      if (_onCancelClick) {
        cancelBatchBtn.removeEventListener('click', _onCancelClick)
        _onCancelClick = null
      }
    }

    return { element: toolbar, update: update, setDeleting: setDeleting, destroy: destroy }
  }

  window.PetManager.Components.BatchToolbar = {
    loadTemplate: loadTemplate,
    create: create
  }
})()
