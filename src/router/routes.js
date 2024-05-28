const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Home.vue'), name: 'home' },
      { path: '/About', component: () => import('pages/About.vue'), name: 'about' },
      {path : '/Acount', component:()=> import('pages/Acount.vue'),name:'acount'},
      {path : '/User', component:()=> import('pages/User.vue'),name:'user'}
    ]
    
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
