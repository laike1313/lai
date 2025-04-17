<template>
  <AppLayout>
    <div class="task-detail-container">
      <div class="page-header">
        <h1 class="page-title">任务详情</h1>
        <div class="header-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="viewHistory">查看审批历史</el-button>
        </div>
      </div>
      
      <el-card v-loading="loading" class="detail-card">
        <template v-if="task">
          <!-- 申请信息 -->
          <div class="info-section">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              申请信息
            </h2>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="物品名称">{{ task.itemName }}</el-descriptions-item>
              <el-descriptions-item label="申请人">{{ task.applicantName }}</el-descriptions-item>
              <el-descriptions-item label="物品数量">{{ task.quantity }}</el-descriptions-item>
              <el-descriptions-item label="物品价格">¥ {{ task.price.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="申请理由" :span="2">{{ task.reason }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 任务信息 -->
          <div class="info-section">
            <h2 class="section-title">
              <el-icon><Tickets /></el-icon>
              任务信息
            </h2>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="任务ID">{{ task.taskId }}</el-descriptions-item>
              <el-descriptions-item label="任务名称">{{ task.taskName }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ task.createTime }}</el-descriptions-item>
              <el-descriptions-item label="流程实例ID">{{ task.processInstanceId }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 审批操作 -->
          <div class="approve-section">
            <h2 class="section-title">
              <el-icon><Edit /></el-icon>
              审批操作
            </h2>
            
            <el-form :model="approvalForm" ref="approvalFormRef" label-width="100px">
              <el-form-item label="审批意见" prop="comment" :rules="[{ required: true, message: '请输入审批意见', trigger: 'blur' }]">
                <el-input
                  v-model="approvalForm.comment"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您的审批意见"
                />
              </el-form-item>
              
              <el-form-item label="审批结果" prop="result" :rules="[{ required: true, message: '请选择审批结果', trigger: 'change' }]">
                <el-radio-group v-model="approvalForm.result">
                  <el-radio :label="1">同意</el-radio>
                  <el-radio :label="2">拒绝</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" :loading="submitting" @click="submitApproval">提交审批</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </template>
        
        <el-empty v-else description="未找到任务详情数据" />
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Tickets, Edit } from '@element-plus/icons-vue';
import AppLayout from '../../layout/AppLayout.vue';
import { useUserStore } from '../../store/user';
import { useProcessStore } from '../../store/process';
import { getTaskDetail, completeTask } from '../../api/process';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const processStore = useProcessStore();
const loading = ref(false);
const submitting = ref(false);
const task = ref(null);
const approvalFormRef = ref(null);

// 审批表单
const approvalForm = reactive({
  taskId: '',
  processInstanceId: '',
  userId: userStore.userId,
  userName: userStore.username,
  comment: '',
  result: ''
});

// 获取任务详情
const fetchTaskDetail = async () => {
  loading.value = true;
  
  try {
    const taskId = route.params.taskId;
    
    // 如果store中已有当前任务数据，直接使用
    if (processStore.currentTask && processStore.currentTask.taskId == taskId) {
      task.value = processStore.currentTask;
    } else {
      // 否则从API获取
      const res = await getTaskDetail(taskId);
      if (res.code === 200) {
        task.value = res.data;
        processStore.setCurrentTask(res.data);
      }
    }
    
    // 初始化审批表单
    if (task.value) {
      approvalForm.taskId = task.value.taskId;
      approvalForm.processInstanceId = task.value.processInstanceId;
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    ElMessage.error('获取任务详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 提交审批
const submitApproval = () => {
  if (!approvalFormRef.value) return;
  
  approvalFormRef.value.validate(valid => {
    if (valid) {
      // 确认提交
      const resultText = approvalForm.result === 1 ? '同意' : '拒绝';
      
      ElMessageBox.confirm(
        `您确定要${resultText}此申请吗？`,
        '审批确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        submitting.value = true;
        
        // 确保用户信息
        approvalForm.userId = userStore.userId;
        approvalForm.userName = userStore.username;
        
        completeTask(approvalForm)
          .then(res => {
            ElMessage.success('审批提交成功');
            router.push('/my-tasks');
          })
          .catch(error => {
            console.error('审批提交失败:', error);
            ElMessage.error('审批提交失败，请稍后重试');
          })
          .finally(() => {
            submitting.value = false;
          });
      }).catch(() => {
        // 取消操作
      });
    }
  });
};

// 重置表单
const resetForm = () => {
  if (approvalFormRef.value) {
    approvalFormRef.value.resetFields();
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 查看审批历史
const viewHistory = () => {
  if (task.value) {
    router.push(`/approval-history/${task.value.processInstanceId}`);
  }
};

onMounted(() => {
  fetchTaskDetail();
});
</script>

<style scoped>
.task-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-card {
  margin-bottom: 20px;
}

.info-section, .approve-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
}
</style> 