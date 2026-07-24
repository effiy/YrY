;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  var TEMPLATE_PATH = 'cdn/components/pet/settings/RobotSettings/index.html'
  var templates = Object.create(null)
  var loaded = false

  /**
   * 一次性加载 index.html 中所有 <template> 标签
   * @returns {Promise<boolean>}
   */
  async function loadAllTemplates() {
    if (loaded) return true
    try {
      var url = ''
      if (typeof chrome !== 'undefined' && chrome && chrome.runtime && chrome.runtime.getURL) {
        url = chrome.runtime.getURL(TEMPLATE_PATH)
      }
      if (!url) return false
      var res = await fetch(url)
      if (!res.ok) {
        console.warn('[RobotSettings] load templates failed:', res.status)
        return false
      }
      var html = await res.text()
      var doc = new DOMParser().parseFromString(html, 'text/html')
      var tplNodes = doc.querySelectorAll('template[id]')
      for (var i = 0; i < tplNodes.length; i++) {
        templates[tplNodes[i].id] = tplNodes[i].innerHTML
      }
      loaded = true
      return true
    } catch (err) {
      console.warn('[RobotSettings] load templates error:', err)
      return false
    }
  }

  /**
   * 渲染模板：将 {key} 占位符替换为实际值
   * @param {string} tplId - template 元素 id
   * @param {Object} [data] - 键值对
   * @returns {string}
   */
  function render(tplId, data) {
    var tpl = templates[tplId]
    if (!tpl) {
      console.warn('[RobotSettings] template not found:', tplId)
      return ''
    }
    if (!data) return tpl
    var result = tpl
    Object.keys(data).forEach(function (k) {
      result = result.split('{' + k + '}').join(data[k] == null ? '' : String(data[k]))
    })
    return result
  }

  /**
   * 渲染机器人列表项
   * @param {Object} config
   * @param {string} config.id
   * @param {string} config.icon
   * @param {string} config.name
   * @param {string} config.webhookUrl
   * @returns {string}
   */
  function renderListItem(config) {
    var name = esc(String(config.name || '未命名机器人'))
    var url = config.webhookUrl ? esc(String(config.webhookUrl).substring(0, 30) + '...') : '未配置 Webhook'
    return render('yi-pet-robot-list-item-template', {
      id: esc(String(config.id || '')),
      icon: esc(String(config.icon || '🤖')),
      name: name,
      url: url
    })
  }

  /**
   * 渲染编辑表单
   * @param {Object} config
   * @param {string} config.id
   * @param {string} config.name
   * @param {string} config.icon
   * @param {string} config.webhookUrl
   * @returns {string}
   */
  function renderForm(config) {
    return render('yi-pet-robot-form-template', {
      name: esc(String(config.name || '')),
      icon: esc(String(config.icon || '')),
      webhookUrl: esc(String(config.webhookUrl || ''))
    })
  }

  function esc(text) {
    var s = String(text != null ? text : '')
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  window.PetManager.Components.RobotSettings = {
    loadAllTemplates: loadAllTemplates,
    render: render,
    renderListItem: renderListItem,
    renderForm: renderForm,
    MODAL_TPL_ID: 'yi-pet-robot-settings-modal-template',
    LIST_EMPTY_TPL_ID: 'yi-pet-robot-list-empty-template',
    FORM_EMPTY_TPL_ID: 'yi-pet-robot-form-empty-template'
  }
})()
