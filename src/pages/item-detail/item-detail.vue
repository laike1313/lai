<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <text class="title">{{item.name}}</text>
        <text class="status" :class="['status-' + item.status]">{{getStatusText(item.status)}}</text>
      </view>
      
      <view class="item-info">
        <view class="info-item">
          <text class="label">申请时间：</text>
          <text class="value">{{item.applyTime}}</text>
        </view>
        <view class="info-item">
          <text class="label">物品数量：</text>
          <text class="value">{{item.quantity}} 个</text>
        </view>
        <view class="info-item">
          <text class="label">物品单价：</text>
          <text class="value">¥{{item.price}}</text>
        </view>
        <view class="info-item">
          <text class="label">物品类别：</text>
          <text class="value">{{item.category}}</text>
        </view>
        <view class="info-item">
          <text class="label">申请理由：</text>
          <text class="value">{{item.reason}}</text>
        </view>
        <view class="info-item">
          <text class="label">申请人：</text>
          <text class="value">{{item.applicantName}}</text>
        </view>
      </view>
      
      <view class="actions">
        <button class="btn-view-history" @click="viewHistory">查看审批历史</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      itemId: '',
      item: {
        id: 0,
        name: '',
        quantity: 0,
        price: 0,
        category: '',
        reason: '',
        applicantId: '',
        applicantName: '',
        applyTime: '',
        processInstanceId: '',
        status: 0
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.itemId = options.id
      this.loadItemDetail()
    } else {
      this.showToast('物品ID不存在')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    loadItemDetail() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 模拟数据
      setTimeout(() => {
        const id = parseInt(this.itemId) || 1
        
        const date = new Date()
        date.setDate(date.getDate() - id)
        
        this.item = {
          id: id,
          name: ['办公电脑', '打印机', '显示器', '办公桌', '办公椅'][id - 1] || '未知物品',
          quantity: Math.floor(Math.random() * 5) + 1,
          price: (Math.random() * 2000 + 500).toFixed(2),
          category: ['办公设备', '办公用品', '电子产品', '家具', '其他'][Math.floor(Math.random() * 5)],
          reason: '用于日常工作',
          applicantId: '10001',
          applicantName: '张三',
          applyTime: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          processInstanceId: `process-${id}`,
          status: Math.floor(Math.random() * 3) // 0-审批中，1-已通过，2-已拒绝
        }
        
        uni.hideLoading()
      }, 1000)
      
      // 实际项目中应该调用后端API
      // const url = `http://localhost:8080/api/process/item/${this.itemId}`
      // uni.request({
      //   url: url,
      //   method: 'GET',
      //   success: (res) => {
      //     uni.hideLoading()
      //     if (res.data.code === 200) {
      //       this.item = res.data.data
      //     } else {
      //       this.showToast(res.data.message || '获取数据失败')
      //       setTimeout(() => {
      //         uni.navigateBack()
      //       }, 1500)
      //     }
      //   },
      //   fail: (err) => {
      //     uni.hideLoading()
      //     this.showToast('网络错误，请重试')
      //     console.error(err)
      //     setTimeout(() => {
      //       uni.navigateBack()
      //     }, 1500)
      //   }
      // })
    },
    getStatusText(status) {
      const statusMap = {
        0: '审批中',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知状态'
    },
    viewHistory() {
      // 跳转到审批历史页面
      uni.navigateTo({
        url: `/pages/approval-history/approval-history?processInstanceId=${this.item.processInstanceId}`
      })
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

.card {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.status {
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
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  margin-bottom: 15rpx;
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.actions {
  display: flex;
  justify-content: center;
  padding-top: 20rpx;
  border-top: 1px solid #eee;
}

.btn-view-history {
  font-size: 28rpx;
  color: #fff;
  background-color: #007aff;
  padding: 20rpx 60rpx;
  border-radius: 45rpx;
}
</style> 