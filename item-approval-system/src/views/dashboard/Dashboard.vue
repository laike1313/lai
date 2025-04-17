<template>
  <AppLayout>
    <div class="dashboard-container">
      <h1 class="page-title">仪表盘</h1>
      
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="statistic-card">
            <div class="card-icon waiting-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ statistics.pendingCount }}</div>
              <div class="card-label">待审批任务</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="statistic-card">
            <div class="card-icon processing-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ statistics.inProgressCount }}</div>
              <div class="card-label">审批中申请</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="statistic-card">
            <div class="card-icon approved-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ statistics.approvedCount }}</div>
              <div class="card-label">已通过申请</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="statistic-card">
            <div class="card-icon rejected-icon">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ statistics.rejectedCount }}</div>
              <div class="card-label">已拒绝申请</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 快捷操作 -->
      <el-card class="quick-actions">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <div class="actions-container">
          <el-button type="primary" @click="goToApply">
            <el-icon><Plus /></el-icon>
            申请物品
          </el-button>
          <el-button type="success" @click="goToTasks">
            <el-icon><List /></el-icon>
            我的任务
          </el-button>
          <el-button type="info" @click="goToApplies">
            <el-icon><Document /></el-icon>
            我的申请
          </el-button>
        </div>
      </el-card>
      
      <!-- 待办任务列表 -->
      <el-card class="task-list-card">
        <template #header>
          <div class="card-header">
            <span>待办任务</span>
            <el-button v-if="tasks.length > 0" text @click="goToTasks">查看全部</el-button>
          </div>
        </template>
        
        <el-empty v-if="tasks.length === 0" description="暂无待办任务" />
        
        <el-table v-else :data="tasks" style="width: 100%">
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="itemName" label="物品名称" />
          <el-table-column prop="applicantName" label="申请人" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" size="small" @click="goToTaskDetail(scope.row.taskId)">审批</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 最近申请列表 -->
      <el-card class="apply-list-card">
        <template #header>
          <div class="card-header">
            <span>最近申请</span>
            <el-button v-if="applies.length > 0" text @click="goToApplies">查看全部</el-button>
          </div>
        </template>
        
        <el-empty v-if="applies.length === 0" description="暂无申请记录" />
        
        <el-table v-else :data="applies" style="width: 100%">
          <el-table-column prop="name" label="物品名称" />
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="price" label="价格" width="100" />
          <el-table-column prop="applyTime" label="申请时间" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" text size="small" @click="goToApplyDetail(scope.row.id)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Clock, Document, CircleCheck, CircleClose, Plus, List } from '@element-plus/icons-vue';
import AppLayout from '../../layout/AppLayout.vue';
import { useUserStore } from '../../store/user';
import { useProcessStore } from '../../store/process';
import { getMyTasks, getMyApplies } from '../../api/process';

const router = useRouter();
const userStore = useUserStore();
const processStore = useProcessStore();

// 统计数据
const statistics = ref({
  pendingCount: 0,
  inProgressCount: 0,
  approvedCount: 0,
  rejectedCount: 0
});

// 待办任务
const tasks = ref([]);

// 最近申请
const applies = ref([]);

// 获取数据
const fetchData = async () => {
  try {
    // 获取待办任务
    const taskRes = await getMyTasks(userStore.userId);
    if (taskRes.code === 200) {
      tasks.value = taskRes.data.slice(0, 5); // 只显示最近5条
      statistics.value.pendingCount = taskRes.data.length;
    }
    
    // 获取申请列表
    const applyRes = await getMyApplies(userStore.userId);
    if (applyRes.code === 200) {
      applies.value = applyRes.data.slice(0, 5); // 只显示最近5条
      
      // 统计各种状态的申请数量
      statistics.value.inProgressCount = applyRes.data.filter(item => item.status === 0).length;
      statistics.value.approvedCount = applyRes.data.filter(item => item.status === 1).length;
      statistics.value.rejectedCount = applyRes.data.filter(item => item.status === 2).length;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
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

// 页面跳转
const goToApply = () => {
  router.push('/apply');
};

const goToTasks = () => {
  router.push('/my-tasks');
};

const goToApplies = () => {
  router.push('/my-applies');
};

const goToTaskDetail = (taskId) => {
  router.push(`/task-detail/${taskId}`);
};

const goToApplyDetail = (id) => {
  router.push(`/apply-detail/${id}`);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistic-card {
  display: flex;
  align-items: center;
  height: 120px;
  margin-bottom: 20px;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.card-icon .el-icon {
  font-size: 32px;
  color: white;
}

.waiting-icon {
  background-color: #409EFF;
}

.processing-icon {
  background-color: #E6A23C;
}

.approved-icon {
  background-color: #67C23A;
}

.rejected-icon {
  background-color: #F56C6C;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  margin-bottom: 20px;
}

.actions-container {
  display: flex;
  gap: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-list-card {
  margin-bottom: 20px;
}

.apply-list-card {
  margin-bottom: 20px;
}
</style> 