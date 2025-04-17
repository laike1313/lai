<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-title">
        <h2>物品审批系统</h2>
        <p>用户登录</p>
      </div>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
        
        <div class="form-footer">
          <router-link to="/register">注册账号</router-link>
          <router-link to="/forgot-password">忘记密码？</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '../../store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const loginFormRef = ref(null);

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = () => {
  if (!loginFormRef.value) return;
  
  loginFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true;
      
      userStore.login(loginForm)
        .then(() => {
          ElMessage.success('登录成功');
          
          // 如果有重定向，则跳转到重定向页面，否则跳转到仪表盘
          const redirectPath = route.query.redirect || '/dashboard';
          router.push(redirectPath);
        })
        .catch(error => {
          console.error('登录失败:', error);
          ElMessage.error('登录失败，请检查用户名和密码');
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-form {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
}

.login-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.login-title p {
  color: #909399;
  margin-top: 10px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
}

.form-footer a {
  color: #409EFF;
  text-decoration: none;
}
</style> 