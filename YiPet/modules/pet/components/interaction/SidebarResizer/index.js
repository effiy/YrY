/**
 * SidebarResizer Component
 * Manages the sidebar width resizer handle with drag functionality.
 */
;(function () {
  'use strict'

  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}

  /**
   * Create and attach a sidebar resizer.
   * @param {Object} options
   * @param {HTMLElement} options.sidebarElement - The sidebar DOM element
   * @param {number} [options.initialWidth] - Initial sidebar width
   * @param {number} [options.minWidth] - Minimum width (default 150)
   * @param {number} [options.maxWidth] - Maximum width (default 500)
   * @param {Function} options.onWidthChange - Called with (newWidth) during drag
   * @param {Function} options.onSave - Called to persist the width
   * @param {Function} options.updateTogglePosition - Called with (newWidth) to update toggle button position
   * @returns {HTMLElement} The resizer DOM element
   */
  function create (options) {
    options = options || {}
    var sidebarElement = options.sidebarElement
    var initialWidth = options.initialWidth
    var minWidth = options.minWidth || 150
    var maxWidth = options.maxWidth || 500
    var onWidthChange = options.onWidthChange
    var onSave = options.onSave
    var updateTogglePosition = options.updateTogglePosition

    if (!sidebarElement) return null

    var isResizingSidebar = false

    var resizer = document.createElement('div')
    resizer.className = 'sidebar-resizer'

    // 鼠标悬停效果
    resizer.addEventListener('mouseenter', function () {
      if (!isResizingSidebar) {
        resizer.classList.add('hover')
      }
    })

    resizer.addEventListener('mouseleave', function () {
      if (!isResizingSidebar) {
        resizer.classList.remove('hover')
      }
    })

    // 双击重置宽度
    var lastClickTime = 0
    resizer.addEventListener('click', function (e) {
      var currentTime = Date.now()
      if (currentTime - lastClickTime < 300) {
        // 双击重置为默认宽度
        var defaultWidth = 320
        if (sidebarElement) {
          sidebarElement.style.setProperty('width', defaultWidth + 'px', 'important')
        }
        if (typeof updateTogglePosition === 'function') {
          updateTogglePosition(defaultWidth)
        }
        if (typeof onWidthChange === 'function') {
          onWidthChange(defaultWidth)
        }
        if (typeof onSave === 'function') {
          onSave()
        }
        e.preventDefault()
        e.stopPropagation()
      }
      lastClickTime = currentTime
    })

    // 拖拽开始
    resizer.addEventListener('mousedown', function (e) {
      e.preventDefault()
      e.stopPropagation()

      isResizingSidebar = true
      resizer.classList.add('dragging')
      resizer.classList.remove('hover')

      // 记录初始位置和宽度
      var startX = e.clientX
      var startWidth = initialWidth

      // 添加全局样式，禁用文本选择
      document.body.classList.add('pet-is-resizing')

      // 使用 requestAnimationFrame 优化性能
      var rafId = null
      var pendingWidth = startWidth

      // 更新宽度的辅助函数
      var applyWidth = function (newWidth) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
        pendingWidth = newWidth

        if (rafId === null) {
          rafId = requestAnimationFrame(function () {
            if (sidebarElement) {
              sidebarElement.style.setProperty('width', pendingWidth + 'px', 'important')
            }
            if (typeof onWidthChange === 'function') {
              onWidthChange(pendingWidth)
            }
            if (typeof updateTogglePosition === 'function') {
              updateTogglePosition(pendingWidth)
            }
            rafId = null
          })
        }
      }

      // 拖拽中
      var handleMouseMove = function (e) {
        if (!isResizingSidebar) return

        var diffX = e.clientX - startX
        var newWidth = startWidth + diffX
        applyWidth(newWidth)
      }

      // 防抖保存函数
      var saveTimeout = null
      var debouncedSave = function () {
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }
        saveTimeout = setTimeout(function () {
          if (typeof onSave === 'function') {
            onSave()
          }
        }, 300)
      }

      // 拖拽结束
      var handleMouseUp = function () {
        // 取消待处理的动画帧
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }

        // 确保最终宽度已应用
        if (sidebarElement) {
          sidebarElement.style.setProperty('width', pendingWidth + 'px', 'important')
        }
        if (typeof onWidthChange === 'function') {
          onWidthChange(pendingWidth)
        }
        if (typeof updateTogglePosition === 'function') {
          updateTogglePosition(pendingWidth)
        }

        isResizingSidebar = false
        resizer.classList.remove('dragging')
        resizer.classList.remove('hover')

        // 恢复全局样式
        document.body.classList.remove('pet-is-resizing')

        // 立即保存宽度
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }
        if (typeof onSave === 'function') {
          onSave()
        }

        // 移除事件监听器
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      // 添加全局事件监听器
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })

    sidebarElement.appendChild(resizer)

    return resizer
  }

  window.PetManager.Components.SidebarResizer = {
    create: create
  }
})()
