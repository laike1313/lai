<template>
  <AppLayout>
    <div class="detail-container">
      <div class="page-header">
        <h1 class="page-title">申请详情</h1>
        <div class="header-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="viewHistory">查看审批历史</el-button>
        </div>
      </div>
      
      <el-card v-loading="loading" class="detail-card">
        <template v-if="item">
          <!-- 基本信息 -->
          <div class="info-section">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              基本信息
            </h2>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="申请ID">{{ item.id }}</el-descriptions-item>
              <el-descriptions-item label="申请状态">
                <el-tag :type="getStatusType(item.status)">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="物品名称">{{ item.name }}</el-descriptions-item>
              <el-descriptions-item label="物品类别">{{ item.category }}</el-descriptions-item>
              <el-descriptions-item label="物品数量">{{ item.quantity }}</el-descriptions-item>
              <el-descriptions-item label="物品价格">¥ {{ item.price.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="申请人" :span="2">{{ item.applicantName }}</el-descriptions-item>
              <el-descriptions-item label="申请时间" :span="2">{{ item.applyTime }}</el-descriptions-item>
              <el-descriptions-item label="申请理由" :span="2">{{ item.reason }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 流程信息 -->
          <div class="info-section">
            <h2 class="section-title">
              <el-icon><Connection /></el-icon>
              流程信息
            </h2>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="流程实例ID">{{ item.processInstanceId }}</el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-steps :active="getActiveStep(item.status)" finish-status="success" simple>
                  <el-step title="已提交" />
                  <el-step title="部门审批" />
                  <el-step title="分管领导审批" />
                  <el-step title="行政科审批" />
                  <el-step title="完成" />
                </el-steps>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
        
        <el-empty v-else description="未找到申请详情数据" />
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Connection } from '@element-plus/icons-vue';
import AppLayout from '../../layout/AppLayout.vue';
import { useProcessStore } from '../../store/process';
import { getItemDetail } from '../../api/process';

const router = useRouter();
const route = useRoute();
const processStore = useProcessStore();
const loading = ref(false);
const item = ref(null);

// 获取申请详情
const fetchItemDetail = async () => {
  loading.value = true;
  
  try {
    const id = route.params.id;
    
    // 如果store中已有当前物品数据，直接使用
    if (processStore.currentItem && processStore.currentItem.id == id) {
      item.value = processStore.currentItem;
    } else {
      // 否则从API获取
      const res = await getItemDetail(id);
      if (res.code === 200) {
        item.value = res.data;
        processStore.setCurrentItem(res.data);
      }
    }
  } catch (error) {
    console.error('获取申请详情失败:', error);
    ElMessage.error('获取申请详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取状态样式
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info';
    case 1: return 'success';
    case 2: return 'danger';
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '审批中';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 获取当前步骤
const getActiveStep = (status) => {
  if (status === 1) {
    return 4; // 审批通过
  } else if (status === 2) {
    return 1; // 审批拒绝，只走到第一步
  } else {
    return 1; // 默认处于部门审批阶段
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 查看审批历史
const viewHistory = () => {
  if (item.value) {
    router.push(`/approval-history/${item.value.processInstanceId}`);
  }
};

onMounted(() => {
  fetchItemDetail();
});
</script>

<style scoped>
.detail-container {
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

.info-section {
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