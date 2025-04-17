<template>
  <div class="app-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="220px" class="app-sidebar">
        <div class="logo-container">
          <h2 class="logo-text">物品审批系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#fff"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Menu /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/apply">
            <el-icon><Plus /></el-icon>
            <span>申请物品</span>
          </el-menu-item>
          <el-menu-item index="/my-applies">
            <el-icon><Document /></el-icon>
            <span>我的申请</span>
          </el-menu-item>
          <el-menu-item index="/my-tasks">
            <el-icon><List /></el-icon>
            <span>我的任务</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="app-header">
          <div class="header-left">
            <el-icon class="toggle-icon"><Fold /></el-icon>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click">
              <span class="user-dropdown">
                {{ username }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="app-main">
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const username = computed(() => userStore.username);
const activeMenu = computed(() => route.path);

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

onMounted(() => {
  // 如果本地有用户信息但没有获取过详细信息，则获取
  if (userStore.userId && !userStore.username) {
    userStore.fetchUserInfo().catch(() => {
      // 如果获取用户信息失败，可能是token过期，重定向到登录页
      userStore.logout();
      router.push('/login');
    });
  }
});
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
}

.app-sidebar {
  background-color: #304156;
  height: 100%;
  overflow-y: auto;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  background-color: #2b3649;
}

.logo-text {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
}

.user-dropdown {
  cursor: pointer;
  color: #303133;
  display: flex;
  align-items: center;
}

.app-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.el-menu-vertical {
  border-right: none;
}
</style> 