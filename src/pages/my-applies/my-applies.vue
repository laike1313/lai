<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ userInfo && userInfo.role === '普通用户' ? '我的申请' : '已办任务' }}</text>
    </view>
    
    <!-- 角色切换 -->
    <view class="tab-container" v-if="userInfo && userInfo.role !== '普通用户'">
      <view class="tab-item" 
        :class="{ active: activeTab === 'done' }" 
        @click="switchTab('done')">已办任务</view>
      <view class="tab-item" 
        :class="{ active: activeTab === 'applies' }" 
        @click="switchTab('applies')">我的申请</view>
    </view>
    
    <!-- 普通用户或已办任务为空 -->
    <view class="empty-tip" v-if="(activeTab === 'applies' && items.length === 0) || (activeTab === 'done' && doneList.length === 0)">
      <image class="empty-icon" src="/static/empty.png"></image>
      <text class="empty-text">{{ activeTab === 'applies' ? '暂无申请记录' : '暂无已办任务' }}</text>
    </view>
    
    <!-- 我的申请列表 -->
    <view class="list" v-if="activeTab === 'applies' && items.length > 0">
      <view class="list-item" v-for="(item, index) in items" :key="index" @click="viewDetail(item)">
        <view class="item-header">
          <text class="item-name">{{item.name}}</text>
          <text class="item-status" :class="['status-' + item.status]">{{getStatusText(item.status)}}</text>
        </view>
        <view class="item-info">
          <view class="info-row">
            <text class="info-label">申请时间：</text>
            <text class="info-value">{{item.applyTime}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">物品类别：</text>
            <text class="info-value">{{item.category}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">数量：</text>
            <text class="info-value">{{item.quantity}} 个</text>
          </view>
          <view class="info-row">
            <text class="info-label">单价：</text>
            <text class="info-value">¥{{item.price}}</text>
          </view>
        </view>
        <view class="item-footer">
          <view class="btn-view-history" @click.stop="viewHistory(item)">查看审批历史</view>
        </view>
      </view>
    </view>
    
    <!-- 已办任务列表 -->
    <view class="list" v-if="activeTab === 'done' && doneList.length > 0">
      <view class="list-item" v-for="(item, index) in doneList" :key="index">
        <view class="item-header">
          <text class="item-name">{{item.taskName}}</text>
          <text class="item-status" :class="{'status-1': item.result === 1, 'status-2': item.result === 2}">
            {{item.result === 1 ? '已同意' : '已拒绝'}}
          </text>
        </view>
        <view class="item-info">
          <view class="info-row">
            <text class="info-label">审批时间：</text>
            <text class="info-value">{{item.approvalTime}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">申请人：</text>
            <text class="info-value">{{item.applicantName || '未知'}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">审批意见：</text>
            <text class="info-value">{{item.comment}}</text>
          </view>
        </view>
        <view class="item-footer">
          <view class="btn-view-history" @click.stop="viewHistory({processInstanceId: item.processInstanceId})">查看详情</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      items: [],
      doneList: [],
      activeTab: 'done' // 默认显示已办任务
    }
  },
  onShow() {
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = userInfo
      
      // 普通用户默认显示申请记录
      if (userInfo.role === '普通用户') {
        this.activeTab = 'applies'
      }
      
      this.loadData()
    } else {
      // 未登录，跳转到登录页
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  methods: {
    debug(title, data) {
      console.log(`=============== ${title} ===============`)
      console.log(JSON.stringify(data, null, 2))
      console.log('=======================================')
    },
    
    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab
      this.loadData()
    },
    
    // 加载数据
    loadData() {
      if (this.activeTab === 'applies') {
        this.loadApplies()
      } else {
        this.loadDoneTasks()
      }
    },
    
    // 加载申请记录
    loadApplies() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 打印用户信息用于调试
      this.debug('用户信息', this.userInfo)
      
      // 从本地存储获取申请数据
      const allApplies = uni.getStorageSync('applies') || []
      this.debug('所有申请', allApplies)
      
      // 筛选当前用户的申请 - 修复类型不匹配的问题
      this.items = allApplies.filter(item => {
        // 确保比较的是字符串类型
        const itemAppId = String(item.applicantId || '')
        const userID = String(this.userInfo.userId || '')
        const isMatch = itemAppId === userID
        console.log(`申请ID: ${item.id}, 申请人ID类型: ${typeof item.applicantId}, 值: ${itemAppId}, 当前用户ID类型: ${typeof this.userInfo.userId}, 值: ${userID}, 是否匹配: ${isMatch}`)
        return isMatch
      })
      this.debug('筛选后申请', this.items)
      
      // 隐藏加载
      uni.hideLoading()
    },
    
    // 加载已办任务
    loadDoneTasks() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 从本地存储获取审批历史
      const allHistories = uni.getStorageSync('histories') || {}
      let userDoneTasks = []
      
      // 遍历所有流程实例的历史记录
      Object.keys(allHistories).forEach(processId => {
        const processHistories = allHistories[processId] || []
        
        // 筛选当前用户处理过的任务
        const userHistories = processHistories.filter(history => 
          String(history.userId) === String(this.userInfo.userId)
        )
        
        // 将用户处理过的任务添加到列表中
        userDoneTasks = userDoneTasks.concat(userHistories)
      })
      
      // 查找每个任务对应的申请信息
      const applies = uni.getStorageSync('applies') || []
      userDoneTasks.forEach(task => {
        const apply = applies.find(a => a.processInstanceId === task.processInstanceId)
        if (apply) {
          task.applicantName = apply.applicantName
          task.itemName = apply.name
        }
      })
      
      // 按时间倒序排序
      userDoneTasks.sort((a, b) => {
        return new Date(b.approvalTime) - new Date(a.approvalTime)
      })
      
      this.doneList = userDoneTasks
      this.debug('已办任务', this.doneList)
      
      // 隐藏加载
      uni.hideLoading()
    },
    
    viewDetail(item) {
      // 查看申请详情
      uni.navigateTo({
        url: `/pages/item-detail/item-detail?id=${item.id}`
      })
    },
    
    viewHistory(item) {
      // 查看审批历史
      uni.navigateTo({
        url: `/pages/approval-history/approval-history?processInstanceId=${item.processInstanceId}`
      })
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '审批中',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知状态'
    },
    
    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 标签页样式 */
.tab-container {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  color: #007aff;
  border-bottom-color: #007aff;
  font-weight: bold;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 200rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
}

.list-item {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.item-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.status-0 {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-1 {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-2 {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.item-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 10rpx;
}

.info-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.item-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1px solid #eee;
}

.btn-view-history {
  font-size: 26rpx;
  color: #007aff;
  padding: 10rpx 20rpx;
  border: 1px solid #007aff;
  border-radius: 30rpx;
}
</style> 