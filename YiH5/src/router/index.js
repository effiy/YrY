import { createRouter, createWebHashHistory } from 'vue-router'

import SessionList from '../views/SessionList/index.js'
import NewsList from '../views/NewsList/index.js'
import ChatView from '../views/ChatView/index.js'

const routes = [
  {
    path: '/',
    redirect: '/sessions'
  },
  {
    path: '/sessions',
    name: 'SessionList',
    component: SessionList,
    meta: { title: '会话', keepAlive: true }
  },
  {
    path: '/news',
    name: 'NewsList',
    component: NewsList,
    meta: { title: '新闻', keepAlive: true }
  },
  {
    path: '/chat',
    name: 'ChatView',
    component: ChatView,
    meta: { title: '聊天' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title || 'YiH5'
  next()
})

export default router
