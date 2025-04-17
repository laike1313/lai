<template>
  <AppLayout>
    <div class="my-tasks-container">
      <h1 class="page-title">我的任务</h1>
      
      <!-- 筛选器 -->
      <el-card class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="物品名称">
            <el-input v-model="filterForm.itemName" placeholder="请输入物品名称" clearable />
          </el-form-item>
          
          <el-form-item label="申请人">
            <el-input v-model="filterForm.applicantName" placeholder="请输入申请人" clearable />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="filterTasks">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 任务列表 -->
      <el-card class="list-container">
        <template #header>
          <div class="card-header">
            <span>待办任务</span>
            <el-button type="primary" @click="refreshTasks">刷新</el-button>
          </div>
        </template>
        
        <el-table
          v-loading="loading"
          :data="filteredTasks"
          style="width: 100%"
          border
        >
          <el-table-column prop="taskId" label="任务ID" width="80" />
          <el-table-column prop="taskName" label="任务名称" width="120" />
          <el-table-column prop="itemName" label="物品名称" />
          <el-table-column prop="applicantName" label="申请人" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              {{ formatPrice(scope.row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleTask(scope.row)">处理</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <el-empty v-if="myTasks.length === 0" description="暂无待办任务" />
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="myTasks.length > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppLayout from '../../layout/AppLayout.vue';
import { useUserStore } from '../../store/user';
import { useProcessStore } from '../../store/process';
import { getMyTasks } from '../../api/process';

const router = useRouter();
const userStore = useUserStore();
const processStore = useProcessStore();
const loading = ref(false);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 筛选表单
const filterForm = reactive({
  itemName: '',
  applicantName: ''
});

// 任务列表
const myTasks = ref([]);

// 筛选后的任务列表
const filteredTasks = computed(() => {
  let result = [...myTasks.value];
  
  // 按物品名称筛选
  if (filterForm.itemName) {
    result = result.filter(item => 
      item.itemName.toLowerCase().includes(filterForm.itemName.toLowerCase())
    );
  }
  
  // 按申请人筛选
  if (filterForm.applicantName) {
    result = result.filter(item => 
      item.applicantName.toLowerCase().includes(filterForm.applicantName.toLowerCase())
    );
  }
  
  // 计算总数
  total.value = result.length;
  
  // 分页
  return result.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
});

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true;
  
  try {
    const res = await getMyTasks(userStore.userId);
    if (res.code === 200) {
      myTasks.value = res.data;
      total.value = res.data.length;
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 格式化价格
const formatPrice = (price) => {
  return `¥ ${price.toFixed(2)}`;
};

// 筛选任务
const filterTasks = () => {
  currentPage.value = 1; // 重置到第一页
};

// 重置筛选
const resetFilter = () => {
  filterForm.itemName = '';
  filterForm.applicantName = '';
  currentPage.value = 1;
};

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 刷新任务列表
const refreshTasks = () => {
  fetchTasks();
};

// 处理任务
const handleTask = (row) => {
  processStore.setCurrentTask(row);
  router.push(`/task-detail/${row.taskId}`);
};

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.my-tasks-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.list-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 