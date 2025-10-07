import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 仅类型导入

// 定义路由
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('../layouts/default/Default.vue'),
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('../views/Home.vue'),
            },
            {
                path: 'random-groups',
                name: 'random-groups',
                component: () => import('../views/RandomGroups.vue'),
            },
            {
                path: 'manage-list',
                name: 'manage-list',
                component: () => import('../views/ManageList.vue'),
            },
            {
                path: 'about',
                name: 'about',
                component: () => import('../views/About.vue'),
            },
        ],
    },
]

// 创建路由实例
const router = createRouter({
    history: createWebHashHistory(), // Electron 用 hash 模式最稳定
    routes,
})

export default router
