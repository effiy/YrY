import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const STORAGE_KEY = 'yiweb-bg-animation-enabled';

function detectEnvironment() {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
    return 'local';
  }
  try {
    const envFromStorage = localStorage.getItem('env');
    if (envFromStorage === 'local' || envFromStorage === 'prod') {
      return envFromStorage;
    }
  } catch (_) {}
  const params = new URLSearchParams(window.location.search);
  const envFromParam = params.get('env');
  if (envFromParam === 'local' || envFromParam === 'prod') {
    return envFromParam;
  }
  return 'prod';
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

function applyBodyClass(enabled) {
  if (enabled) {
    document.body.classList.add('bg-animation-enabled');
  } else {
    document.body.classList.remove('bg-animation-enabled');
  }
}

const compDef = {
  name: 'yryHeaderActions',
  html: '/cdn/components/business/HeaderActions/template.html',
  css: '/cdn/components/business/HeaderActions/index.css',
  props: {
    showClearCache: { type: Boolean, default: true },
    showAuthButton: { type: Boolean, default: true },
    showEnvBadge: { type: Boolean, default: true },
    showBgAnimationToggle: { type: Boolean, default: true },
  },
  emits: ['clear-cache', 'open-auth'],
  data() {
    return {
      bgAnimationEnabled: readStored(),
      envType: detectEnvironment()
    };
  },
  computed: {
    envLabel() {
      return this.envType === 'local' ? 'LOCAL' : 'PROD';
    }
  },
  methods: {
    toggleBgAnimation() {
      this.bgAnimationEnabled = !this.bgAnimationEnabled;
      try {
        localStorage.setItem(STORAGE_KEY, String(this.bgAnimationEnabled));
      } catch (_) {}
      applyBodyClass(this.bgAnimationEnabled);
    },
    openAuth(event) {
      this.$emit('open-auth', event);
      if (typeof window.openAuth === 'function') {
        window.openAuth(event);
      }
    }
  },
  mounted() {
    applyBodyClass(this.bgAnimationEnabled);
  }
};
registerGlobalComponent(compDef);
export default compDef;
