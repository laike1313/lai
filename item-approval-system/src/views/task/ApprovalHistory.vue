<template>
  <AppLayout>
    <div class="history-container">
      <div class="page-header">
        <h1 class="page-title">审批历史</h1>
        <div class="header-actions">
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
      
      <el-card v-loading="loading" class="history-card">
        <template v-if="historyList.length > 0">
          <el-timeline>
            <el-timeline-item
              v-for="(history, index) in historyList"
              :key="index"
              :type="getResultType(history.result)"
              :color="getResultColor(history.result)"
              :timestamp="history.approvalTime"
              placement="top"
            >
              <el-card class="timeline-card">
                <h4>{{ history.taskName }}</h4>
                <p>
                  <el-tag :type="getResultType(history.result)">
                    {{ getResultText(history.result) }}
                  </el-tag>
                </p>
                <p>审批人: {{ history.userName }}</p>
                <p class="approval-comment">审批意见: {{ history.comment }}</p>
              </el-card>
            </el-timeline-item>
            
            <!-- 申请发起节点 -->
            <el-timeline-item
              type="primary"
              color="#409EFF"
              :timestamp="initiateTime"
              placement="top"
            >
              <el-card class="timeline-card">
                <h4>申请提交</h4>
                <p>申请人: {{ applicantName }}</p>
                <p>物品名称: {{ itemName }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </template>
        
        <el-empty v-else description="暂无审批历史记录" />
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppLayout from '../../layout/AppLayout.vue';
import { getApprovalHistory, getItemDetail } from '../../api/process';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const historyList = ref([]);
const itemInfo = ref(null);

// 获取申请发起时间
const initiateTime = computed(() => {
  return itemInfo.value ? itemInfo.value.applyTime : '';
});

// 获取申请人姓名
const applicantName = computed(() => {
  return itemInfo.value ? itemInfo.value.applicantName : '';
});

// 获取物品名称
const itemName = computed(() => {
  return itemInfo.value ? itemInfo.value.name : '';
});

// 获取审批历史
const fetchHistory = async () => {
  loading.value = true;
  
  try {
    const processInstanceId = route.params.processInstanceId;
    
    // 获取审批历史
    const historyRes = await getApprovalHistory(processInstanceId);
    if (historyRes.code === 200) {
      historyList.value = historyRes.data;
      // 按时间倒序排列
      historyList.value.sort((a, b) => {
        return new Date(b.approvalTime) - new Date(a.approvalTime);
      });
    }
    
    // 获取物品信息（为了显示申请人和物品名称）
    if (historyList.value.length > 0) {
      try {
        const itemId = historyList.value[0].itemId; // 假设历史记录中包含itemId
        if (itemId) {
          const itemRes = await getItemDetail(itemId);
          if (itemRes.code === 200) {
            itemInfo.value = itemRes.data;
          }
        }
      } catch (error) {
        console.error('获取物品信息失败:', error);
      }
    }
  } catch (error) {
    console.error('获取审批历史失败:', error);
    ElMessage.error('获取审批历史失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取审批结果类型
const getResultType = (result) => {
  return result === 1 ? 'success' : 'danger';
};

// 获取审批结果颜色
const getResultColor = (result) => {
  return result === 1 ? '#67C23A' : '#F56C6C';
};

// 获取审批结果文本
const getResultText = (result) => {
  return result === 1 ? '同意' : '拒绝';
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.history-container {
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

.history-card {
  margin-bottom: 20px;
}

.timeline-card {
  margin-bottom: 10px;
}

.timeline-card h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.timeline-card p {
  margin: 5px 0;
  color: #606266;
}

.approval-comment {
  margin-top: 10px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 