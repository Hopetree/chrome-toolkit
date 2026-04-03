import { createRouter, createMemoryHistory } from 'vue-router'

const Home = () => import('@/popup/views/Home.vue')
const ToolPage = () => import('@/popup/views/ToolPage.vue')

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/tool/:id', component: ToolPage },
  ],
})
