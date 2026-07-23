;(function () {
  'use strict'
  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}

  /**
   * create(options) -> { element, update(count), setDeleting(bool), destroy() }
   * options: { onSelectAll, onDelete, onCancel }
   */
  function create(options) {
    var onSelectAll = options && options.onSelectAll
    var onDelete = options && options.onDelete
    var onCancel = options && options.onCancel

    // ---- DOM 构建 ----
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
    selectAllText.textContent = '全选'

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
    batchDeleteBtn.title = '删除选中会话'

    var deleteIcon = document.createElement('i')
    deleteIcon.className = 'fas fa-trash-alt'
    var deleteText = document.createTextNode(' 删除')
    batchDeleteBtn.appendChild(deleteIcon)
    batchDeleteBtn.appendChild(deleteText)

    var cancelBatchBtn = document.createElement('button')
    cancelBatchBtn.type = 'button'
    cancelBatchBtn.className = 'batch-action-btn batch-cancel-btn'
    cancelBatchBtn.textContent = '取消'
    cancelBatchBtn.title = '退出批量模式'

    rightSection.appendChild(batchDeleteBtn)
    rightSection.appendChild(cancelBatchBtn)

    toolbar.appendChild(leftSection)
    toolbar.appendChild(rightSection)

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
    function update(count) {
      var n = typeof count === 'number' ? count : 0
      if (n > 0) {
        selectedCount.textContent = '已选 ' + n + ' 项'
        selectedCount.classList.remove('js-hidden')
        batchDeleteBtn.disabled = false
      } else {
        selectedCount.textContent = ''
        selectedCount.classList.add('js-hidden')
        batchDeleteBtn.disabled = true
      }
    }

    function setDeleting(isDeleting) {
      if (isDeleting) {
        batchDeleteBtn._originalContent = batchDeleteBtn.innerHTML
        batchDeleteBtn.disabled = true
        batchDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 删除中...'
      } else {
        batchDeleteBtn.disabled = false
        batchDeleteBtn.innerHTML = batchDeleteBtn._originalContent || batchDeleteBtn.innerHTML
      }
    }

    function destroy() {
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

  window.PetManager.Components.BatchToolbar = { create: create }
})()
