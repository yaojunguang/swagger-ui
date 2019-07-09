import Vue from 'vue'
import Router from 'vue-router'
import SwaggerUi from '../views/SwaggerUi'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SwaggerUi',
      component: SwaggerUi
    }
  ]
})
