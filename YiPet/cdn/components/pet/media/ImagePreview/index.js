;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/media/ImagePreview/index.html'
  const TEMPLATE_ID = '#yi-pet-image-preview-template'
  let templateCache = ''

  /**
   * 预加载模板
   */
  async function loadTemplate () {
    if (templateCache) return templateCache
    try {
      var dh = window.DomHelper || window.TemplateHelper
      if (dh && typeof dh.loadHtmlTemplate === 'function') {
        templateCache = await dh.loadHtmlTemplate(TEMPLATE_PATH, TEMPLATE_ID, 'Failed to load ImagePreview template')
      }
    } catch (_) {}
    return templateCache
  }

  /**
   * 从模板克隆 DOM
   */
  function cloneFromTemplate (templateHtml) {
    var tpl = document.createElement('template')
    tpl.innerHTML = templateHtml
    return tpl.content.cloneNode(true)
  }

  var IMAGE_PREVIEW_DOM_TPL = `<div class="image-preview-modal">
    <div class="image-preview-container">
      <div class="image-preview-loading"></div>
      <img class="js-image-preview-img" alt="">
    </div>
    <div class="image-preview-button-container">
      <button class="image-preview-close-btn js-image-preview-close">✕</button>
    </div>
  </div>`

  /**
   * 创建 DOM（降级方案）
   */
  function createLegacy () {
    var tpl = document.createElement('template')
    tpl.innerHTML = IMAGE_PREVIEW_DOM_TPL
    var fragment = tpl.content.cloneNode(true)
    var modal = fragment.firstElementChild

    return {
      modal: modal,
      titleBar: null,
      img: modal.querySelector('.js-image-preview-img'),
      loadingIndicator: modal.querySelector('.image-preview-loading'),
      downloadBtn: null,
      closeBtn: modal.querySelector('.js-image-preview-close')
    }
  }

  // 预加载模板
  loadTemplate()

  /**
   * 显示图片预览弹窗
   * @param {Object} options
   * @param {string} options.imageUrl - 图片URL或DataURL
   * @param {string} [options.fileName=''] - 文件名（可选）
   */
  function show ({ imageUrl, fileName = '' }) {
    // 如果已有预览弹窗，先关闭
    var existingModal = document.querySelector('.image-preview-modal')
    if (existingModal) {
      existingModal.remove()
    }

    var modal, img, loadingIndicator, titleBar, downloadBtn, closeBtn

    if (templateCache) {
      try {
        var fragment = cloneFromTemplate(templateCache)
        modal = fragment.firstElementChild

        if (modal) {
          titleBar = modal.querySelector('.js-image-preview-title')
          img = modal.querySelector('.js-image-preview-img')
          loadingIndicator = modal.querySelector('.image-preview-loading')
          downloadBtn = modal.querySelector('.js-image-preview-download')
          closeBtn = modal.querySelector('.js-image-preview-close')
        }
      } catch (_) {}
    }

    // 降级处理
    if (!modal) {
      var legacy = createLegacy()
      modal = legacy.modal
      img = legacy.img
      loadingIndicator = legacy.loadingIndicator
      titleBar = legacy.titleBar
      downloadBtn = legacy.downloadBtn
      closeBtn = legacy.closeBtn
    }

    // 图片加载
    if (img) {
      img.alt = fileName || '图片预览'

      img.onload = function () {
        if (loadingIndicator) loadingIndicator.classList.add('js-hidden')
        img.classList.add('js-loaded')
      }

      img.onerror = function () {
        if (loadingIndicator) loadingIndicator.classList.add('js-hidden')
        var existingError = modal.querySelector('.image-preview-error')
        if (!existingError) {
          var errorMsg = document.createElement('div')
          errorMsg.className = 'image-preview-error'
          errorMsg.textContent = '图片加载失败'
          img.parentNode.appendChild(errorMsg)
        }
      }

      img.src = imageUrl
    }

    // 标题栏
    if (titleBar && fileName) {
      titleBar.textContent = fileName
      titleBar.style.display = ''
    } else if (titleBar) {
      titleBar.style.display = 'none'
    }

    // 下载按钮
    if (downloadBtn && fileName) {
      downloadBtn.style.display = ''
      downloadBtn.addEventListener('click', function (e) {
        e.stopPropagation()
        var link = document.createElement('a')
        link.href = imageUrl
        link.download = String(fileName || 'image.png').replace(/\s+/g, '_')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    } else if (downloadBtn) {
      downloadBtn.style.display = 'none'
    }

    // 关闭按钮
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation()
        modal.remove()
      })
    }

    // 点击背景关闭
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.remove()
      }
    })

    // 按ESC键关闭
    var handleKeyDown = function (e) {
      if (e.key === 'Escape') {
        modal.remove()
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    document.body.appendChild(modal)
  }

  window.PetManager.Components.ImagePreview = {
    loadTemplate: loadTemplate,
    show: show
  }
})()
