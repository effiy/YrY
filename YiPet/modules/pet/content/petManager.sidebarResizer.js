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

    var SidebarResizer = window.PetManager.Components.SidebarResizer
    if (!SidebarResizer) return

    var self = this

    SidebarResizer.create({
      sidebarElement: this.sessionSidebar,
      initialWidth: this.sidebarWidth,
      minWidth: 150,
      maxWidth: 500,
      onWidthChange: function (newWidth) {
        self.sidebarWidth = newWidth
      },
      onSave: function () {
        self.saveSidebarWidth()
      },
      updateTogglePosition: function (newWidth) {
        self.updateToggleButtonPosition(newWidth)
      }
    })
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
