<template>
  <AppLayout>
    <div class="my-applies-container">
      <h1 class="page-title">我的申请</h1>
      
      <!-- 筛选器 -->
      <el-card class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="物品名称">
            <el-input v-model="filterForm.name" placeholder="请输入物品名称" clearable />
          </el-form-item>
          
          <el-form-item label="申请状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="审批中" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已拒绝" :value="2" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="filterApplies">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 申请列表 -->
      <el-card class="list-container">
        <template #header>
          <div class="card-header">
            <span>申请列表</span>
            <el-button type="primary" @click="goToApply">新建申请</el-button>
          </div>
        </template>
        
        <el-table
          v-loading="loading"
          :data="filteredApplies"
          style="width: 100%"
          border
        >
          <el-table-column prop="id" label="申请ID" width="80" />
          <el-table-column prop="name" label="物品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              {{ formatPrice(scope.row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="category" label="类别" width="100" />
          <el-table-column prop="applyTime" label="申请时间" width="160" />
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
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" text size="small" @click="viewDetail(scope.row)">详情</el-button>
              <el-button type="primary" text size="small" @click="viewHistory(scope.row)">审批历史</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <el-empty v-if="myApplies.length === 0" description="暂无申请记录" />
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="myApplies.length > 0">
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
import { getMyApplies } from '../../api/process';

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
  name: '',
  status: ''
});

// 申请列表
const myApplies = ref([]);

// 筛选后的申请列表
const filteredApplies = computed(() => {
  let result = [...myApplies.value];
  
  // 按物品名称筛选
  if (filterForm.name) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(filterForm.name.toLowerCase())
    );
  }
  
  // 按状态筛选
  if (filterForm.status !== '') {
    result = result.filter(item => item.status === filterForm.status);
  }
  
  // 计算总数
  total.value = result.length;
  
  // 分页
  return result.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
});

// 获取申请列表
const fetchApplies = async () => {
  loading.value = true;
  
  try {
    const res = await getMyApplies(userStore.userId);
    if (res.code === 200) {
      myApplies.value = res.data;
      total.value = res.data.length;
    }
  } catch (error) {
    console.error('获取申请列表失败:', error);
    ElMessage.error('获取申请列表失败，请稍后重试');
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

// 格式化价格
const formatPrice = (price) => {
  return `¥ ${price.toFixed(2)}`;
};

// 筛选申请
const filterApplies = () => {
  currentPage.value = 1; // 重置到第一页
};

// 重置筛选
const resetFilter = () => {
  filterForm.name = '';
  filterForm.status = '';
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

// 查看详情
const viewDetail = (row) => {
  processStore.setCurrentItem(row);
  router.push(`/apply-detail/${row.id}`);
};

// 查看审批历史
const viewHistory = (row) => {
  router.push(`/approval-history/${row.processInstanceId}`);
};

// 新建申请
const goToApply = () => {
  router.push('/apply');
};

onMounted(() => {
  fetchApplies();
});
</script>

<style scoped>
.my-applies-container {
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