/**
 * WelcomeCard — Chat welcome card data builder & event binder
 * Extracted from petManager.chat.js + petManager.welcomeCard.js
 *
 * This is a pure data module (not a Vue component) because the welcome card
 * rendering is already handled by the ChatMessages Vue template.
 */
;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/chat/WelcomeCard/index.html'
  const TEMPLATE_ID = '#yi-pet-welcome-card-template'
  let templateCache = ''

  /**
   * 预加载模板
   */
  async function loadTemplate () {
    if (templateCache) return templateCache
    try {
      var dh = window.DomHelper || window.TemplateHelper
      if (dh && typeof dh.loadHtmlTemplate === 'function') {
        templateCache = await dh.loadHtmlTemplate(TEMPLATE_PATH, TEMPLATE_ID, 'Failed to load WelcomeCard template')
      }
    } catch (_) {}
    return templateCache
  }

  // 预加载模板
  loadTemplate()

  /**
   * Extract common metadata from a session object for welcome card rendering
   * @param {Object} session
   * @param {Function} formatDate - date formatter (e.g. manager.formatDate)
   */
  function extractMeta (session, formatDate) {
    var sessionTags = (session && Array.isArray(session.tags) ? session.tags.filter(function (t) { return t && t.trim() }) : [])
    var sessionMessages = (session && Array.isArray(session.messages) ? session.messages : [])
    var sessionCreatedAt = (session && session.createdAt ? session.createdAt : null)
    var sessionUpdatedAt = (session && session.updatedAt ? session.updatedAt : null)
    var hasSessionUrl = !!(session && session.url && session.url.trim())

    // User & assistant message counts
    var userCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      var role = m.role || (m.type === 'user' ? 'user' : null)
      return role === 'user'
    }).length

    var assistantCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      var role = m.role || (m.type === 'pet' ? 'pet' : (m.type === 'assistant' ? 'assistant' : null))
      return role === 'assistant' || role === 'pet'
    }).length

    // Date info
    var createdDate = sessionCreatedAt ? new Date(sessionCreatedAt) : null
    var updatedDate = sessionUpdatedAt ? new Date(sessionUpdatedAt) : null
    var hasValidCreated = createdDate && !isNaN(createdDate.getTime())
    var hasValidUpdated = updatedDate && !isNaN(updatedDate.getTime())
    var isSameTime = hasValidCreated && hasValidUpdated &&
      Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000

    // Detail text
    var detailParts = []
    if (userCount > 0) detailParts.push('\u7528\u6237 ' + userCount)
    if (assistantCount > 0) detailParts.push('\u52A9\u624B ' + assistantCount)
    var detailText = detailParts.length > 0 ? '\uFF08' + detailParts.join(' / ') + '\uFF09' : ''

    // Meta items
    var metaParts = []
    if (sessionMessages.length > 0) {
      metaParts.push('\u6D88\u606F ' + sessionMessages.length + detailText)
    }
    if (hasValidCreated) {
      metaParts.push('\u521B\u5EFA ' + ((typeof formatDate === 'function') ? formatDate(createdDate) : ''))
    }
    if (hasValidUpdated && !isSameTime) {
      metaParts.push('\u66F4\u65B0 ' + ((typeof formatDate === 'function') ? formatDate(updatedDate) : ''))
    }

    return {
      tags: sessionTags,
      messages: sessionMessages,
      messagesCount: sessionMessages.length,
      userCount: userCount,
      assistantCount: assistantCount,
      detailText: detailText,
      metaParts: metaParts,
      hasSessionUrl: hasSessionUrl,
      createdDate: createdDate,
      updatedDate: updatedDate,
      hasValidCreated: hasValidCreated,
      hasValidUpdated: hasValidUpdated,
      isSameTime: isSameTime
    }
  }

  /**
   * Escape HTML text
   */
  function escapeHtml (text) {
    if (!text) return ''
    var div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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
   * Build footer meta HTML (string fallback — used when template unavailable)
   */
  function buildFooterHtml (meta) {
    if (meta.metaParts.length === 0) return ''
    return [
      '<div class="welcome-card-footer">',
      '<div class="welcome-card-meta">',
      meta.metaParts.map(function (part) { return '<span>' + part + '</span>' }).join(''),
      '</div>',
      '</div>'
    ].join('')
  }

  /**
   * Build welcome card HTML string (template-first, string-fallback)
   * @param {Object} ctx - context object with { pageInfo, session, renderMarkdown, formatDate }
   */
  function buildHtml (ctx) {
    var pageInfo = ctx.pageInfo || {}
    var session = ctx.session || null
    var renderMarkdown = ctx.renderMarkdown || function (s) { return escapeHtml(String(s || '')) }
    var formatDate = ctx.formatDate
    var meta = extractMeta(session, formatDate)

    // 优先使用模板
    if (templateCache) {
      try {
        var fragment = cloneFromTemplate(templateCache)
        var root = fragment.firstElementChild
        if (!root) throw new Error('Template parse failed')

        // --- 标题 ---
        var titleEl = root.querySelector('.js-welcome-title')
        var faviconEl = root.querySelector('.js-welcome-favicon')
        var titleText = pageInfo.title && pageInfo.title.trim() ? pageInfo.title.trim() : '\u5F53\u524D\u9875\u9762'

        if (titleEl) {
          titleEl.textContent = titleText
          titleEl.title = titleText
        }
        if (faviconEl) {
          if (pageInfo.iconUrl && pageInfo.iconUrl.trim()) {
            faviconEl.src = pageInfo.iconUrl.trim()
            faviconEl.style.display = ''
          } else {
            faviconEl.style.display = 'none'
          }
        }

        // --- URL 行 ---
        var shouldShowUrl = !session || meta.hasSessionUrl
        var hasUrl = shouldShowUrl && pageInfo.url && pageInfo.url.trim()
        var urlRow = root.querySelector('.js-welcome-url-row')
        var urlEl = root.querySelector('.js-welcome-url')
        if (urlRow) {
          if (hasUrl && urlEl) {
            urlRow.style.display = ''
            urlEl.href = pageInfo.url
            urlEl.textContent = pageInfo.url
            urlEl.id = 'welcome-url-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
            var urlCopyBtn = urlRow.querySelector('.js-welcome-copy-url')
            if (urlCopyBtn) urlCopyBtn.setAttribute('data-copy-target', urlEl.id)
          } else {
            urlRow.style.display = 'none'
          }
        }

        // --- 描述行 ---
        var descRow = root.querySelector('.js-welcome-desc-row')
        var descEl = root.querySelector('.js-welcome-description')
        if (descRow && descEl) {
          if (pageInfo.description && pageInfo.description.trim()) {
            descRow.style.display = ''
            descEl.id = 'welcome-desc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
            descEl.innerHTML = renderMarkdown(pageInfo.description)
            var descCopyBtn = descRow.querySelector('.js-welcome-copy-desc')
            if (descCopyBtn) descCopyBtn.setAttribute('data-copy-text', escapeHtml(pageInfo.description))
          } else {
            descRow.style.display = 'none'
          }
        }

        // --- 标签行 ---
        var tagsRow = root.querySelector('.js-welcome-tags-row')
        var tagsEl = root.querySelector('.js-welcome-tags')
        if (tagsRow && tagsEl) {
          if (meta.tags.length > 0) {
            tagsRow.style.display = ''
            tagsEl.innerHTML = meta.tags.map(function (tag) {
              return '<span class="welcome-card-tag">' + escapeHtml(tag) + '</span>'
            }).join('')
          } else {
            tagsRow.style.display = 'none'
          }
        }

        // --- Footer ---
        var footerEl = root.querySelector('.js-welcome-footer')
        var metaEl = root.querySelector('.js-welcome-meta')
        if (footerEl && metaEl) {
          if (meta.metaParts.length > 0) {
            footerEl.style.display = ''
            metaEl.innerHTML = meta.metaParts.map(function (part) {
              return '<span>' + part + '</span>'
            }).join('')
          } else {
            footerEl.style.display = 'none'
          }
        }

        // 返回 outerHTML
        var wrapper = document.createElement('div')
        wrapper.appendChild(root)
        return wrapper.innerHTML
      } catch (_) {}
    }

    // 降级：字符串拼接方式
    return buildHtmlLegacy(ctx, meta, renderMarkdown, formatDate)
  }

  /**
   * 降级方案：字符串拼接构建 HTML
   */
  function buildHtmlLegacy (ctx, meta, renderMarkdown, formatDate) {
    var pageInfo = ctx.pageInfo || {}
    var session = ctx.session || null

    var shouldShowUrl = !session || meta.hasSessionUrl
    var html = '<div class="welcome-card">'

    var titleText = pageInfo.title && pageInfo.title.trim() ? pageInfo.title.trim() : '\u5F53\u524D\u9875\u9762'
    var safeTitle = escapeHtml(titleText)
    var iconUrl = pageInfo.iconUrl && pageInfo.iconUrl.trim() ? pageInfo.iconUrl.trim() : ''

    html += [
      '<div class="welcome-card-header">',
      '<div class="welcome-card-header-left">',
      iconUrl ? '<img class="welcome-card-favicon" src="' + escapeHtml(iconUrl) + '" alt="" />' : '',
      '<div class="welcome-card-title" title="' + safeTitle + '">' + safeTitle + '</div>',
      '</div>',
      '</div>'
    ].join('')

    var hasUrl = shouldShowUrl && pageInfo.url && pageInfo.url.trim()
    if (hasUrl) {
      var urlId = 'welcome-url-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      html += [
        '<div class="welcome-card-row">',
        '<div class="welcome-card-label">\u7F51\u5740</div>',
        '<div class="welcome-card-value">',
        '<a href="' + escapeHtml(pageInfo.url) + '" target="_blank" rel="noopener noreferrer" class="welcome-card-url" id="' + urlId + '">' + escapeHtml(pageInfo.url) + '</a>',
        '</div>',
        '<button type="button" class="welcome-card-action-btn" data-copy-target="' + urlId + '" title="\u590D\u5236\u7F51\u5740" aria-label="\u590D\u5236\u7F51\u5740">',
        '<i class="fas fa-copy"></i>',
        '</button>',
        '</div>'
      ].join('')
    }

    if (pageInfo.description && pageInfo.description.trim()) {
      var descId = 'welcome-desc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      html += [
        '<div class="welcome-card-row welcome-card-row--multiline">',
        '<div class="welcome-card-label">\u63CF\u8FF0</div>',
        '<div class="welcome-card-value welcome-card-value--stack welcome-card-description">',
        '<div class="markdown-content" id="' + descId + '">' + renderMarkdown(pageInfo.description) + '</div>',
        '</div>',
        '<button type="button" class="welcome-card-action-btn" data-copy-text="' + escapeHtml(pageInfo.description) + '" title="\u590D\u5236\u63CF\u8FF0" aria-label="\u590D\u5236\u63CF\u8FF0">',
        '<i class="fas fa-copy"></i>',
        '</button>',
        '</div>'
      ].join('')
    }

    if (meta.tags.length > 0) {
      var tagsHtml = meta.tags.map(function (tag) {
        return '<span class="welcome-card-tag">' + escapeHtml(tag) + '</span>'
      }).join('')
      html += [
        '<div class="welcome-card-row welcome-card-row--multiline">',
        '<div class="welcome-card-label">\u6807\u7B7E</div>',
        '<div class="welcome-card-value welcome-card-tags">' + tagsHtml + '</div>',
        '</div>'
      ].join('')
    }

    html += buildFooterHtml(meta)
    html += '</div>'
    return html
  }

  /**
   * Build welcome card data model (used by Vue template in ChatMessages)
   * @param {Object} ctx - context object
   */
  function buildModel (ctx) {
    var pageInfo = ctx.pageInfo || {}
    var session = ctx.session || null
    var renderMarkdown = ctx.renderMarkdown || function (s) { return escapeHtml(String(s || '')) }
    var formatDate = ctx.formatDate
    var meta = extractMeta(session, formatDate)

    var titleText = pageInfo.title && pageInfo.title.trim() ? pageInfo.title.trim() : '\u5F53\u524D\u9875\u9762'
    var iconUrl = pageInfo.iconUrl && pageInfo.iconUrl.trim() ? pageInfo.iconUrl.trim() : ''
    var shouldShowUrl = !session || meta.hasSessionUrl
    var url = shouldShowUrl && pageInfo.url && pageInfo.url.trim() ? pageInfo.url.trim() : ''
    var descriptionText = pageInfo.description && pageInfo.description.trim() ? pageInfo.description.trim() : ''
    var descriptionHtml = descriptionText ? (renderMarkdown(descriptionText) || '') : ''

    return {
      titleText: titleText,
      iconUrl: iconUrl,
      url: url,
      descriptionText: descriptionText,
      descriptionHtml: descriptionHtml,
      tags: meta.tags,
      metaParts: meta.metaParts
    }
  }

  /**
   * Bind welcome card interaction events (copy + toggle)
   * @param {HTMLElement} container - the DOM container with welcome card markup
   * @param {Object} ctx - context with { renderMarkdown, processTabs }
   */
  function bindEvents (container, ctx) {
    if (!container) return
    var renderMarkdown = (ctx && ctx.renderMarkdown) || function (s) { return s }
    var processTabs = (ctx && ctx.processTabs)

    // Copy buttons
    var copyButtons = container.querySelectorAll('[data-copy-target], [data-copy-text]')
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault()
        e.stopPropagation()

        var textToCopy = ''
        var copyTarget = btn.getAttribute('data-copy-target')
        if (copyTarget) {
          var targetElement = container.querySelector('#' + copyTarget)
          if (targetElement) {
            textToCopy = targetElement.textContent || targetElement.innerText || ''
          }
        }
        if (!textToCopy) {
          var copyText = btn.getAttribute('data-copy-text')
          if (copyText) textToCopy = copyText
        }
        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy)
            var icon = btn.querySelector('i')
            if (icon) {
              var originalClass = icon.className
              icon.className = 'fas fa-check'
              btn.classList.add('js-copy-success')
              setTimeout(function () {
                icon.className = originalClass
                btn.classList.remove('js-copy-success')
              }, 2000)
            }
          } catch (err) {
            console.error('\u590D\u5236\u5931\u8D25:', err)
          }
        }
      })
    })

    // Toggle buttons
    var toggleButtons = container.querySelectorAll('.welcome-card-toggle-btn')
    toggleButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        var targetId = btn.getAttribute('data-toggle-target')
        var previewText = btn.getAttribute('data-preview-text')
        var fullText = btn.getAttribute('data-full-text')
        if (!targetId) return

        var targetElement = container.querySelector('#' + targetId)
        var icon = btn.querySelector('i')
        if (!targetElement) return

        var isExpanded = targetElement.classList.contains('expanded')
        if (isExpanded) {
          targetElement.classList.remove('expanded')
          targetElement.innerHTML = renderMarkdown(previewText)
          if (typeof processTabs === 'function') processTabs(targetElement)
          if (icon) icon.className = 'fas fa-chevron-down'
        } else {
          targetElement.classList.add('expanded')
          targetElement.innerHTML = renderMarkdown(fullText)
          if (typeof processTabs === 'function') processTabs(targetElement)
          if (icon) icon.className = 'fas fa-chevron-up'
        }
      })
    })
  }

  // ---- Exports ----
  window.PetManager.Components.WelcomeCard = {
    loadTemplate: loadTemplate,
    extractMeta: extractMeta,
    buildFooterHtml: buildFooterHtml,
    escapeHtml: escapeHtml,
    buildHtml: buildHtml,
    buildModel: buildModel,
    bindEvents: bindEvents
  }
})()
