'use strict'


import Vue from 'vue'
import VueRouter from 'vue-router'
import AskView from '../views/AskView.vue'
import HomeView from '../views/HomeView.vue'
import Answers from '@/views/Answers.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/ask',
    name: 'AskView',
    component: AskView
  },
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },  
  {
    path: '/answers',
    name: 'Answers',
    component: Answers
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})

export default router
