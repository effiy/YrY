/**
 * YiPet Popup — Vue 3 Composition API
 * Self-contained: renders immediately, then async-inits Chrome APIs.
 */
;(function () {
  if (typeof Vue === 'undefined') return

  var V = Vue
  var createApp = V.createApp
  var ref = V.ref
  var reactive = V.reactive
  var computed = V.computed
  var onMounted = V.onMounted
  var onBeforeUnmount = V.onBeforeUnmount

  /* ── Static data (hardcoded, no external files needed) ── */
  var ROLES = ['教师', '医生', '甜品师', '警察']
  var COLORS = [
    { value: 0, label: '量子蓝紫（主色）' },
    { value: 1, label: '靛蓝紫' },
    { value: 2, label: '量子海洋' },
    { value: 3, label: '量子森林' },
    { value: 4, label: '量子日落' }
  ]
  var SIZE_MIN = 80
  var SIZE_MAX = 400
  var SIZE_STEP = 10

  var app = createApp({
    setup: function () {
      /* ── State ── */
      var status = reactive({
        visible: false,
        size: 260,
        role: '教师',
        color: 0,
        model: null
      })

      var displaySize = ref(260)
      var controlsEnabled = ref(false)
      var hintText = ref('连接中…')
      var notification = reactive({ visible: false, message: '', type: 'info' })

      /* ── Computed ── */
      var statusText = computed(function () {
        return status.visible ? '已激活' : '已隐藏'
      })
      var statusDotColor = computed(function () {
        return status.visible ? '#22c55e' : '#f59e0b'
      })

      /* ── Internal ── */
      var currentTab = null
      var syncTimer = null
      var notifyTimer = null

      function clamp(v) {
        v = Number(v)
        if (isNaN(v)) return SIZE_MIN
        return v < SIZE_MIN ? SIZE_MIN : v > SIZE_MAX ? SIZE_MAX : v
      }

      function sendMessage(msg) {
        if (!currentTab || !currentTab.id) return Promise.resolve(null)
        return chrome.tabs.sendMessage(currentTab.id, msg).catch(function () { return null })
      }

      function showNotify(msg, type) {
        clearTimeout(notifyTimer)
        notification.message = msg
        notification.type = type || 'info'
        notification.visible = true
        notifyTimer = setTimeout(function () { notification.visible = false }, 3000)
      }

      function saveState() {
        var key = 'pet_global_state'
        var payload = {}
        payload[key] = {
          visible: status.visible,
          size: status.size,
          role: status.role,
          color: status.color,
          model: status.model
        }
        chrome.storage.local.set(payload).catch(function () {})
      }

      /* ── Actions ── */
      function toggleVisibility() {
        sendMessage({ action: 'toggleVisibility' }).then(function (resp) {
          if (!resp || resp.success === false) { showNotify('操作失败', 'error'); return }
          status.visible = resp.visible !== undefined ? resp.visible : !status.visible
          saveState()
          showNotify(status.visible ? '已显示' : '已隐藏', 'success')
        })
      }

      function previewSize(e) {
        var v = parseInt(e.target.value, 10)
        if (!isNaN(v)) displaySize.value = v
      }

      function updateSize(e) {
        var v = clamp(parseInt(e.target.value, 10))
        displaySize.value = v
        sendMessage({ action: 'changeSize', size: v }).then(function (resp) {
          if (!resp || resp.success === false) { showNotify('操作失败', 'error'); return }
          status.size = resp.size !== undefined ? resp.size : v
          saveState()
          showNotify('大小已更新', 'success')
        })
      }

      function updateRole(e) {
        var role = String(e.target.value || '教师').trim()
        status.role = role
        sendMessage({ action: 'setRole', role: role }).then(function (resp) {
          if (!resp || resp.success === false) { showNotify('操作失败', 'error'); return }
          status.role = resp.role || role
          saveState()
          showNotify('角色已切换', 'success')
        })
      }

      function updateColor(e) {
        var idx = parseInt(e.target.value, 10)
        if (isNaN(idx)) return
        status.color = idx
        sendMessage({ action: 'setColor', color: idx }).then(function (resp) {
          if (resp && resp.success) { showNotify('颜色主题已设置', 'success'); saveState() }
          else { showNotify('操作失败', 'error') }
        })
      }

      /* ── Init ── */
      onMounted(function () {
        chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
          if (!tabs || !tabs.length) { showNotify('无法获取当前标签页', 'error'); return }
          currentTab = tabs[0]

          // Retry content script connection
          var retries = 0
          function tryConnect() {
            sendMessage({ action: 'ping' }).then(function (resp) {
              if (resp) {
                // Connected — load state
                chrome.storage.local.get('pet_global_state').then(function (result) {
                  var stored = result && result.pet_global_state
                  if (stored) {
                    if (stored.visible !== undefined) status.visible = stored.visible
                    if (stored.size !== undefined) { status.size = stored.size; displaySize.value = stored.size }
                    if (stored.role !== undefined) status.role = stored.role
                    if (stored.color !== undefined) status.color = stored.color
                    if (stored.model !== undefined) status.model = stored.model
                  }
                  controlsEnabled.value = true
                  hintText.value = '准备就绪'
                })
              } else if (retries < 3) {
                retries++
                setTimeout(tryConnect, 500 * retries)
              } else {
                showNotify('Content Script 未就绪', 'error')
                controlsEnabled.value = true  // allow UI interaction anyway
                hintText.value = '准备就绪（离线）'
              }
            })
          }
          tryConnect()
        }).catch(function () {
          showNotify('初始化失败', 'error')
        })
      })

      onBeforeUnmount(function () {
        clearInterval(syncTimer)
        clearTimeout(notifyTimer)
      })

      /* ── Expose ── */
      return {
        status: status,
        displaySize: displaySize,
        controlsEnabled: controlsEnabled,
        hintText: hintText,
        notification: notification,
        statusText: statusText,
        statusDotColor: statusDotColor,
        roles: ROLES,
        colors: COLORS,
        sizeMin: SIZE_MIN,
        sizeMax: SIZE_MAX,
        sizeStep: SIZE_STEP,
        toggleVisibility: toggleVisibility,
        previewSize: previewSize,
        updateSize: updateSize,
        updateRole: updateRole,
        updateColor: updateColor
      }
    }
  })

  app.mount('#app')
})()
