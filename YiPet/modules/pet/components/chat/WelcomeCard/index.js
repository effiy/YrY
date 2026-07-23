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

  /**
   * Extract common metadata from a session object for welcome card rendering
   * @param {Object} session
   * @param {Function} formatDate - date formatter (e.g. manager.formatDate)
   */
  function extractMeta (session, formatDate) {
    const sessionTags = (session && Array.isArray(session.tags) ? session.tags.filter(function (t) { return t && t.trim() }) : [])
    const sessionMessages = (session && Array.isArray(session.messages) ? session.messages : [])
    const sessionCreatedAt = (session && session.createdAt ? session.createdAt : null)
    const sessionUpdatedAt = (session && session.updatedAt ? session.updatedAt : null)
    const hasSessionUrl = !!(session && session.url && session.url.trim())

    // User & assistant message counts
    const userCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      const role = m.role || (m.type === 'user' ? 'user' : null)
      return role === 'user'
    }).length

    const assistantCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      const role = m.role || (m.type === 'pet' ? 'pet' : (m.type === 'assistant' ? 'assistant' : null))
      return role === 'assistant' || role === 'pet'
    }).length

    // Date info
    const createdDate = sessionCreatedAt ? new Date(sessionCreatedAt) : null
    const updatedDate = sessionUpdatedAt ? new Date(sessionUpdatedAt) : null
    const hasValidCreated = createdDate && !isNaN(createdDate.getTime())
    const hasValidUpdated = updatedDate && !isNaN(updatedDate.getTime())
    const isSameTime = hasValidCreated && hasValidUpdated &&
      Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000

    // Detail text
    const detailParts = []
    if (userCount > 0) detailParts.push('\u7528\u6237 ' + userCount)
    if (assistantCount > 0) detailParts.push('\u52A9\u624B ' + assistantCount)
    const detailText = detailParts.length > 0 ? '\uFF08' + detailParts.join(' / ') + '\uFF09' : ''

    // Meta items
    const metaParts = []
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
   * Build footer meta HTML
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
   * Escape HTML text
   */
  function escapeHtml (text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Build welcome card HTML string
   * @param {Object} ctx - context object with { pageInfo, session, renderMarkdown, formatDate }
   */
  function buildHtml (ctx) {
    const pageInfo = ctx.pageInfo || {}
    const session = ctx.session || null
    const renderMarkdown = ctx.renderMarkdown || function (s) { return escapeHtml(String(s || '')) }
    const formatDate = ctx.formatDate
    const meta = extractMeta(session, formatDate)

    const shouldShowUrl = !session || meta.hasSessionUrl
    let html = '<div class="welcome-card">'

    const titleText = pageInfo.title && pageInfo.title.trim() ? pageInfo.title.trim() : '\u5F53\u524D\u9875\u9762'
    const safeTitle = escapeHtml(titleText)
    const iconUrl = pageInfo.iconUrl && pageInfo.iconUrl.trim() ? pageInfo.iconUrl.trim() : ''

    html += [
      '<div class="welcome-card-header">',
      '<div class="welcome-card-header-left">',
      iconUrl ? '<img class="welcome-card-favicon" src="' + escapeHtml(iconUrl) + '" alt="" />' : '',
      '<div class="welcome-card-title" title="' + safeTitle + '">' + safeTitle + '</div>',
      '</div>',
      '</div>'
    ].join('')

    const hasUrl = shouldShowUrl && pageInfo.url && pageInfo.url.trim()
    if (hasUrl) {
      const urlId = 'welcome-url-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
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
      const descId = 'welcome-desc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
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
      const tagsHtml = meta.tags.map(function (tag) {
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
    const pageInfo = ctx.pageInfo || {}
    const session = ctx.session || null
    const renderMarkdown = ctx.renderMarkdown || function (s) { return escapeHtml(String(s || '')) }
    const formatDate = ctx.formatDate
    const meta = extractMeta(session, formatDate)

    const titleText = pageInfo.title && pageInfo.title.trim() ? pageInfo.title.trim() : '\u5F53\u524D\u9875\u9762'
    const iconUrl = pageInfo.iconUrl && pageInfo.iconUrl.trim() ? pageInfo.iconUrl.trim() : ''
    const shouldShowUrl = !session || meta.hasSessionUrl
    const url = shouldShowUrl && pageInfo.url && pageInfo.url.trim() ? pageInfo.url.trim() : ''
    const descriptionText = pageInfo.description && pageInfo.description.trim() ? pageInfo.description.trim() : ''
    const descriptionHtml = descriptionText ? (renderMarkdown(descriptionText) || '') : ''

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
    const renderMarkdown = (ctx && ctx.renderMarkdown) || function (s) { return s }
    const processTabs = (ctx && ctx.processTabs)

    // Copy buttons
    const copyButtons = container.querySelectorAll('[data-copy-target], [data-copy-text]')
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault()
        e.stopPropagation()

        let textToCopy = ''
        const copyTarget = btn.getAttribute('data-copy-target')
        if (copyTarget) {
          const targetElement = container.querySelector('#' + copyTarget)
          if (targetElement) {
            textToCopy = targetElement.textContent || targetElement.innerText || ''
          }
        }
        if (!textToCopy) {
          const copyText = btn.getAttribute('data-copy-text')
          if (copyText) textToCopy = copyText
        }
        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy)
            const icon = btn.querySelector('i')
            if (icon) {
              const originalClass = icon.className
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
    const toggleButtons = container.querySelectorAll('.welcome-card-toggle-btn')
    toggleButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        const targetId = btn.getAttribute('data-toggle-target')
        const previewText = btn.getAttribute('data-preview-text')
        const fullText = btn.getAttribute('data-full-text')
        if (!targetId) return

        const targetElement = container.querySelector('#' + targetId)
        const icon = btn.querySelector('i')
        if (!targetElement) return

        const isExpanded = targetElement.classList.contains('expanded')
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
    extractMeta: extractMeta,
    buildFooterHtml: buildFooterHtml,
    escapeHtml: escapeHtml,
    buildHtml: buildHtml,
    buildModel: buildModel,
    bindEvents: bindEvents
  }
})()
