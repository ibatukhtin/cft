import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import DataPage from '../views/DataPage.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: DataPage
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
