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
   * 创建 DOM 结构（降级方案 - createElement）
   */
  function createLegacy () {
    var toolbar = document.createElement('div')
    toolbar.id = 'batch-toolbar'
    toolbar.className = 'session-batch-toolbar'

    // 左区域：全选 + 已选数量
    var leftSection = document.createElement('div')
    leftSection.className = 'batch-toolbar-left'

    var selectAllLabel = document.createElement('label')
    selectAllLabel.className = 'batch-select-all'

    var selectAllCheckbox = document.createElement('input')
    selectAllCheckbox.type = 'checkbox'
    selectAllCheckbox.id = 'select-all-checkbox'

    var selectAllText = document.createElement('span')
    selectAllText.textContent = '\u5168\u9009'

    selectAllLabel.appendChild(selectAllCheckbox)
    selectAllLabel.appendChild(selectAllText)
    leftSection.appendChild(selectAllLabel)

    var selectedCount = document.createElement('span')
    selectedCount.id = 'selected-count'
    selectedCount.className = 'batch-selected-count js-hidden'
    selectedCount.textContent = ''
    leftSection.appendChild(selectedCount)

    // 右区域：删除按钮 + 取消按钮
    var rightSection = document.createElement('div')
    rightSection.className = 'batch-toolbar-right'

    var batchDeleteBtn = document.createElement('button')
    batchDeleteBtn.type = 'button'
    batchDeleteBtn.id = 'batch-delete-btn'
    batchDeleteBtn.className = 'batch-action-btn batch-delete-btn'
    batchDeleteBtn.disabled = true
    batchDeleteBtn.title = '\u5220\u9664\u9009\u4E2D\u4F1A\u8BDD'

    var deleteIcon = document.createElement('i')
    deleteIcon.className = 'fas fa-trash-alt'
    var deleteText = document.createTextNode(' \u5220\u9664')
    batchDeleteBtn.appendChild(deleteIcon)
    batchDeleteBtn.appendChild(deleteText)

    var cancelBatchBtn = document.createElement('button')
    cancelBatchBtn.type = 'button'
    cancelBatchBtn.className = 'batch-action-btn batch-cancel-btn'
    cancelBatchBtn.textContent = '\u53D6\u6D88'
    cancelBatchBtn.title = '\u9000\u51FA\u6279\u91CF\u6A21\u5F0F'

    rightSection.appendChild(batchDeleteBtn)
    rightSection.appendChild(cancelBatchBtn)

    toolbar.appendChild(leftSection)
    toolbar.appendChild(rightSection)

    return toolbar
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
