<template>
  <div class="forgot-container">
    <div class="forgot-form">
      <div class="forgot-title">
        <h2>物品审批系统</h2>
        <p>重置密码</p>
      </div>
      
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 30px;">
        <el-step title="验证邮箱" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>
      
      <!-- 步骤1：验证邮箱 -->
      <el-form v-if="activeStep === 0" ref="emailFormRef" :model="emailForm" :rules="emailRules" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入注册邮箱">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="验证码" prop="code">
          <div class="verify-code-container">
            <el-input v-model="emailForm.code" placeholder="请输入验证码">
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" :disabled="codeButtonDisabled" @click="getCode">
              {{ codeButtonText }}
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="verifyEmail" style="width: 100%">下一步</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 步骤2：重置密码 -->
      <el-form v-if="activeStep === 1" ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top">
        <el-form-item label="新密码" prop="password">
          <el-input 
            v-model="passwordForm.password" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="resetPassword" style="width: 100%">确认重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 步骤3：完成 -->
      <div v-if="activeStep === 2" class="reset-success">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h3>密码重置成功</h3>
        <p>您的密码已经重置成功，请使用新密码登录。</p>
        <el-button type="primary" @click="goToLogin" style="width: 100%">返回登录</el-button>
      </div>
      
      <div class="form-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Message, Key, Lock, CircleCheck } from '@element-plus/icons-vue';
import { getVerifyCode, resetPassword as resetPwd } from '../../api/user';

const router = useRouter();
const loading = ref(false);
const activeStep = ref(0);
const emailFormRef = ref(null);
const passwordFormRef = ref(null);

// 验证码按钮状态
const codeButtonDisabled = ref(false);
const codeButtonText = ref('获取验证码');
let timer = null;

// 邮箱表单
const emailForm = reactive({
  email: '',
  code: ''
});

// 密码表单
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
});

// 验证邮箱格式
const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'));
  } else {
    callback();
  }
};

// 验证密码是否一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 邮箱表单验证规则
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 获取验证码
const getCode = () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址');
    return;
  }
  
  codeButtonDisabled.value = true;
  let countdown = 60;
  
  // 调用获取验证码接口
  getVerifyCode(emailForm.email)
    .then(res => {
      ElMessage.success('验证码已发送到您的邮箱');
      
      // 倒计时
      timer = setInterval(() => {
        countdown--;
        codeButtonText.value = `${countdown}秒后重新获取`;
        
        if (countdown <= 0) {
          clearInterval(timer);
          codeButtonDisabled.value = false;
          codeButtonText.value = '获取验证码';
        }
      }, 1000);
    })
    .catch(error => {
      codeButtonDisabled.value = false;
      ElMessage.error('验证码发送失败，请稍后重试');
    });
};

// 验证邮箱
const verifyEmail = () => {
  if (!emailFormRef.value) return;
  
  emailFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true;
      
      // 模拟验证码验证
      setTimeout(() => {
        loading.value = false;
        activeStep.value = 1; // 进入第二步
      }, 1000);
      
      // 实际应该调用验证接口
      // validateEmailCode(emailForm)
      //   .then(res => {
      //     loading.value = false;
      //     activeStep.value = 1;
      //   })
      //   .catch(error => {
      //     loading.value = false;
      //     ElMessage.error('验证码验证失败，请检查后重试');
      //   });
    }
  });
};

// 重置密码
const resetPassword = () => {
  if (!passwordFormRef.value) return;
  
  passwordFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true;
      
      const resetData = {
        email: emailForm.email,
        code: emailForm.code,
        password: passwordForm.password
      };
      
      resetPwd(resetData)
        .then(res => {
          loading.value = false;
          activeStep.value = 2; // 进入完成步骤
        })
        .catch(error => {
          loading.value = false;
          ElMessage.error('密码重置失败，请稍后重试');
        });
    }
  });
};

// 返回登录页
const goToLogin = () => {
  router.push('/login');
};

// 组件销毁时清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.forgot-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.forgot-form {
  width: 450px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.forgot-title {
  text-align: center;
  margin-bottom: 20px;
}

.forgot-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.forgot-title p {
  color: #909399;
  margin-top: 10px;
}

.verify-code-container {
  display: flex;
  gap: 10px;
}

.verify-code-container .el-input {
  flex: 1;
}

.reset-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 50px;
  color: #67C23A;
  margin-bottom: 20px;
}

.reset-success h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 10px;
}

.reset-success p {
  color: #606266;
  margin-bottom: 20px;
}

.form-footer {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.form-footer a {
  color: #409EFF;
  text-decoration: none;
}
</style> 