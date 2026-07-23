;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  /**
   * 显示图片预览弹窗
   * @param {Object} options
   * @param {string} options.imageUrl - 图片URL或DataURL
   * @param {string} [options.fileName=''] - 文件名（可选）
   */
  function show ({ imageUrl, fileName = '' }) {
    // 如果已有预览弹窗，先关闭
    const existingModal = document.querySelector('.image-preview-modal')
    if (existingModal) {
      existingModal.remove()
    }

    const modal = document.createElement('div')
    modal.className = 'image-preview-modal'
    // 样式已通过 CSS 类定义

    // 创建图片容器
    const imageContainer = document.createElement('div')
    imageContainer.className = 'image-preview-container'

    // 创建加载指示器
    const loadingIndicator = document.createElement('div')
    loadingIndicator.className = 'image-preview-loading'

    imageContainer.appendChild(loadingIndicator)

    const img = document.createElement('img')
    // 样式已通过 CSS 类定义
    img.alt = fileName || '图片预览'

    // 图片加载成功
    img.onload = () => {
      loadingIndicator.classList.add('js-hidden')
      img.classList.add('js-loaded')
    }

    // 图片加载失败
    img.onerror = () => {
      loadingIndicator.classList.add('js-hidden')
      const errorMsg = document.createElement('div')
      errorMsg.className = 'image-preview-error'
      // 样式已通过 CSS 类定义
      errorMsg.textContent = '图片加载失败'
      imageContainer.appendChild(errorMsg)
    }

    // 直接使用图片地址进行预览
    img.src = imageUrl
    imageContainer.appendChild(img)

    // 创建标题栏（显示文件名）
    let titleBar = null
    if (fileName) {
      titleBar = document.createElement('div')
      titleBar.className = 'image-preview-title-bar'
      titleBar.textContent = fileName
      modal.appendChild(titleBar)
    }

    // 创建按钮容器（下载和关闭按钮）
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'image-preview-button-container'

    // 创建下载按钮（仅当有文件名时显示）
    let downloadBtn = null
    if (fileName) {
      downloadBtn = document.createElement('button')
      downloadBtn.className = 'image-preview-download-btn'
      downloadBtn.innerHTML = '⬇️'
      downloadBtn.title = '下载文件'
      // 样式已通过 CSS 类定义
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        // 通用下载逻辑
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = String(fileName || 'image.png').replace(/\s+/g, '_')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })

      buttonContainer.appendChild(downloadBtn)
    }

    // 创建关闭按钮
    const closeBtn = document.createElement('button')
    closeBtn.className = 'image-preview-close-btn'
    closeBtn.textContent = '✕'
    // 样式已通过 CSS 类定义
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      modal.remove()
    })

    buttonContainer.appendChild(closeBtn)

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    // 按ESC键关闭
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        modal.remove()
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    modal.appendChild(imageContainer)
    modal.appendChild(buttonContainer)
    document.body.appendChild(modal)
  }

  window.PetManager.Components.ImagePreview = { show }
})()
