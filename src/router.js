import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/', name: 'index', component: () => import('./components/index'), redirect: '/main',
      children: [
        {path: '/main', name: 'main', component: () => import('./views/main')},
        {path: '/api', name: 'api', component: () => import('./views/api')}
      ]
    }
  ]
})
