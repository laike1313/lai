<template>
  <AppLayout>
    <div class="apply-container">
      <h1 class="page-title">申请物品</h1>
      
      <el-card class="form-container">
        <el-form 
          ref="applyFormRef" 
          :model="applyForm" 
          :rules="applyRules" 
          label-position="top"
          label-width="120px"
        >
          <el-form-item label="物品名称" prop="name">
            <el-input v-model="applyForm.name" placeholder="请输入物品名称" />
          </el-form-item>
          
          <el-form-item label="物品数量" prop="quantity">
            <el-input-number 
              v-model="applyForm.quantity" 
              :min="1" 
              :controls="true" 
              style="width: 100%;"
            />
          </el-form-item>
          
          <el-form-item label="物品价格 (元)" prop="price">
            <el-input-number
              v-model="applyForm.price"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 100%;"
            />
          </el-form-item>
          
          <el-form-item label="物品类别" prop="category">
            <el-select v-model="applyForm.category" placeholder="请选择物品类别" style="width: 100%;">
              <el-option label="办公设备" value="办公设备" />
              <el-option label="办公用品" value="办公用品" />
              <el-option label="电子产品" value="电子产品" />
              <el-option label="生活用品" value="生活用品" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="申请理由" prop="reason">
            <el-input
              v-model="applyForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请详细说明申请理由"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="submitApply">提交申请</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppLayout from '../../layout/AppLayout.vue';
import { useUserStore } from '../../store/user';
import { startProcess } from '../../api/process';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const applyFormRef = ref(null);

// 申请表单
const applyForm = reactive({
  name: '',
  quantity: 1,
  price: 0,
  category: '',
  reason: '',
  applicantId: userStore.userId,
  applicantName: userStore.username
});

// 表单验证规则
const applyRules = {
  name: [
    { required: true, message: '请输入物品名称', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入物品数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入物品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择物品类别', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
  ]
};

// 提交申请
const submitApply = () => {
  if (!applyFormRef.value) return;
  
  applyFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true;
      
      // 确保用户信息
      applyForm.applicantId = userStore.userId;
      applyForm.applicantName = userStore.username;
      
      startProcess(applyForm)
        .then(res => {
          ElMessage.success('申请提交成功');
          router.push('/my-applies');
        })
        .catch(error => {
          console.error('申请提交失败:', error);
          ElMessage.error('申请提交失败，请稍后重试');
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};

// 重置表单
const resetForm = () => {
  if (applyFormRef.value) {
    applyFormRef.value.resetFields();
  }
};
</script>

<style scoped>
.apply-container {
  padding: 20px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}
</style> 