/**
 * PetManager - Sidebar Resizer (extracted from ui.js)
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') return
  const proto = window.PetManager.prototype

  // 创建侧边栏拖拽调整边框
  proto.createSidebarResizer = function () {
    if (!this.sessionSidebar) return

    const resizer = document.createElement('div')
    resizer.className = 'sidebar-resizer'

    // 鼠标悬停效果
    resizer.addEventListener('mouseenter', () => {
      if (!this.isResizingSidebar) {
        resizer.classList.add('hover')
      }
    })

    resizer.addEventListener('mouseleave', () => {
      if (!this.isResizingSidebar) {
        resizer.classList.remove('hover')
      }
    })

    // 双击重置宽度
    let lastClickTime = 0
    resizer.addEventListener('click', (e) => {
      const currentTime = Date.now()
      if (currentTime - lastClickTime < 300) {
        // 双击重置为默认宽度
        const defaultWidth = 320
        this.sidebarWidth = defaultWidth
        if (this.sessionSidebar) {
          this.sessionSidebar.style.setProperty('width', `${defaultWidth}px`, 'important')
        }
        this.updateToggleButtonPosition(defaultWidth)
        this.saveSidebarWidth()
        e.preventDefault()
        e.stopPropagation()
      }
      lastClickTime = currentTime
    })

    // 拖拽开始
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()

      this.isResizingSidebar = true
      resizer.classList.add('dragging')
      resizer.classList.remove('hover')

      // 记录初始位置和宽度
      const startX = e.clientX
      const startWidth = this.sidebarWidth

      // 添加全局样式，禁用文本选择
      document.body.classList.add('pet-is-resizing')

      // 使用 requestAnimationFrame 优化性能
      let rafId = null
      let pendingWidth = startWidth

      // 更新宽度和按钮位置的辅助函数
      const updateWidth = (newWidth) => {
        // 限制宽度范围
        newWidth = Math.max(150, Math.min(500, newWidth))
        pendingWidth = newWidth

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            this.sidebarWidth = pendingWidth
            if (this.sessionSidebar) {
              this.sessionSidebar.style.setProperty('width', `${pendingWidth}px`, 'important')
            }
            this.updateToggleButtonPosition(pendingWidth)
            rafId = null
          })
        }
      }

      // 拖拽中
      const handleMouseMove = (e) => {
        if (!this.isResizingSidebar) return

        const diffX = e.clientX - startX
        const newWidth = startWidth + diffX
        updateWidth(newWidth)
      }

      // 防抖保存函数
      let saveTimeout = null
      // eslint-disable-next-line no-unused-vars -- debouncedSave referenced in event handlers below
      const debouncedSave = () => {
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }
        saveTimeout = setTimeout(() => {
          this.saveSidebarWidth()
        }, 300)
      }

      // 拖拽结束
      const handleMouseUp = () => {
        // 取消待处理的动画帧
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }

        // 确保最终宽度已应用
        if (this.sessionSidebar) {
          this.sessionSidebar.style.setProperty('width', `${pendingWidth}px`, 'important')
        }
        this.sidebarWidth = pendingWidth
        this.updateToggleButtonPosition(pendingWidth)

        this.isResizingSidebar = false
        resizer.classList.remove('dragging')
        resizer.classList.remove('hover')

        // 恢复全局样式
        document.body.classList.remove('pet-is-resizing')

        // 立即保存宽度
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }
        this.saveSidebarWidth()

        // 移除事件监听器
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      // 添加全局事件监听器
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })

    this.sessionSidebar.appendChild(resizer)
  }

  // 更新折叠按钮位置的辅助方法
  // 按钮位置现在由 CSS 控制，始终在 title 左边，不再需要根据侧边栏宽度动态设置
  proto.updateToggleButtonPosition = function (_width) {
    const toggleBtn = this.chatWindow?.querySelector('#sidebar-toggle-btn')
    if (toggleBtn) {
      // 按钮位置由 CSS 控制，始终在 title 左边
      // 只需要确保 transform 样式正确（保留scale用于hover效果）
      const currentTransform = toggleBtn.style.transform
      const baseTransform = 'translateY(-50%)'
      if (!currentTransform.includes('scale')) {
        toggleBtn.style.transform = baseTransform
      } else {
        const scaleMatch = currentTransform.match(/scale\([^)]+\)/)
        if (scaleMatch) {
          toggleBtn.style.transform = `${baseTransform} ${scaleMatch[0]}`
        } else {
          toggleBtn.style.transform = baseTransform
        }
      }
      // 注意：不在这里调用 chatWindowComponent.updateSidebarToggleButton，避免循环调用
      // updateSidebarToggleButton 会在 setSidebarCollapsed 时自动调用
    }
  }
})()
