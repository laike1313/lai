import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

// 路由懒加载
const Login = () => import('../views/auth/Login.vue');
const Register = () => import('../views/auth/Register.vue');
const ForgotPassword = () => import('../views/auth/ForgotPassword.vue');
const Dashboard = () => import('../views/dashboard/Dashboard.vue');
const ItemApply = () => import('../views/application/ItemApply.vue');
const MyApplies = () => import('../views/application/MyApplies.vue');
const ApplyDetail = () => import('../views/application/ApplyDetail.vue');
const MyTasks = () => import('../views/task/MyTasks.vue');
const TaskDetail = () => import('../views/task/TaskDetail.vue');
const ApprovalHistory = () => import('../views/task/ApprovalHistory.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/apply',
    name: 'ItemApply',
    component: ItemApply,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-applies',
    name: 'MyApplies',
    component: MyApplies,
    meta: { requiresAuth: true }
  },
  {
    path: '/apply-detail/:id',
    name: 'ApplyDetail',
    component: ApplyDetail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/my-tasks',
    name: 'MyTasks',
    component: MyTasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/task-detail/:taskId',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/approval-history/:processInstanceId',
    name: 'ApprovalHistory',
    component: ApprovalHistory,
    meta: { requiresAuth: true },
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router; 