<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <text class="title">{{task.taskName}}</text>
        <text class="time">{{task.createTime}}</text>
      </view>
      
      <view class="detail-section">
        <view class="section-title">申请信息</view>
        <view class="detail-item">
          <text class="label">申请人：</text>
          <text class="value">{{task.applicantName}}</text>
        </view>
        <view class="detail-item">
          <text class="label">物品名称：</text>
          <text class="value">{{task.itemName}}</text>
        </view>
        <view class="detail-item">
          <text class="label">物品数量：</text>
          <text class="value">{{task.quantity}} 个</text>
        </view>
        <view class="detail-item">
          <text class="label">物品单价：</text>
          <text class="value">¥{{task.price}}</text>
        </view>
        <view class="detail-item">
          <text class="label">物品类别：</text>
          <text class="value">{{task.category}}</text>
        </view>
        <view class="detail-item">
          <text class="label">申请理由：</text>
          <text class="value">{{task.reason}}</text>
        </view>
      </view>
      
      <view class="comment-section">
        <view class="section-title">审批意见</view>
        <textarea class="comment-input" v-model="comment" placeholder="请输入审批意见"></textarea>
      </view>
      
      <view class="actions">
        <button class="btn-approve" @click="approveTask">同意</button>
        <button class="btn-reject" @click="rejectTask">拒绝</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      taskId: '',
      task: {
        taskId: '',
        taskName: '',
        createTime: '',
        processInstanceId: '',
        applicantName: '',
        itemName: '',
        quantity: 0,
        price: 0,
        category: '',
        reason: ''
      },
      comment: '',
      approvalHistory: []
    }
  },
  onLoad(options) {
    if (options.taskId) {
      this.taskId = options.taskId
      
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
        
        // 检查用户权限
        if (userInfo.role === '普通用户') {
          uni.showToast({
            title: '您没有权限访问此页面',
            icon: 'none'
          })
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
          return
        }
        
        this.loadTaskDetail()
      } else {
        // 未登录，跳转到登录页
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }
    } else {
      this.showToast('任务ID不存在')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    loadTaskDetail() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 获取路由参数
      let eventChannel = null
      if (typeof this.getOpenerEventChannel === 'function') {
        eventChannel = this.getOpenerEventChannel()
      }
      
      // 监听页面跳转时传递的参数
      if (eventChannel) {
        eventChannel.on('taskDetail', (data) => {
          this.task = data
          
          // 获取当前进程的审批历史
          this.loadApprovalHistory(data.processInstanceId)
        })
      } else {
        // 尝试从URL参数中获取任务ID并加载数据
        if (this.taskId) {
          // 从本地存储获取任务数据
          const allTasks = uni.getStorageSync('tasks') || []
          const taskData = allTasks.find(function(t) { 
            return t.taskId === this.taskId 
          }.bind(this))
          
          if (taskData) {
            this.task = taskData
            // 获取当前进程的审批历史
            this.loadApprovalHistory(taskData.processInstanceId)
          } else {
            this.showToast('获取任务详情失败')
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        } else {
          this.showToast('获取任务详情失败')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      }

      // 隐藏加载
      uni.hideLoading()
    },
    
    loadApprovalHistory(processId) {
      // 显示加载中
      uni.showLoading({
        title: '加载历史记录...'
      })
      
      // 从本地存储获取审批历史
      const allHistories = uni.getStorageSync('histories') || {}
      this.approvalHistory = allHistories[processId] || []
      
      // 隐藏加载
      uni.hideLoading()
    },
    approveTask() {
      if (!this.comment.trim()) {
        this.showToast('请输入审批意见')
        return
      }
      
      this.completeTask(1, this.comment)
    },
    rejectTask() {
      if (!this.comment.trim()) {
        this.showToast('请输入审批意见')
        return
      }
      
      this.completeTask(2, this.comment)
    },
    completeTask(result, comment) {
      // 显示加载中
      uni.showLoading({
        title: result === 1 ? '审批中...' : '拒绝中...'
      })
      
      const data = {
        taskId: this.task.taskId,
        processInstanceId: this.task.processInstanceId,
        userId: this.userInfo.userId,
        userName: this.userInfo.name,
        comment: comment,
        result: result
      }
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading()
        
        // 提交成功
        uni.showModal({
          title: '审批完成',
          content: result === 1 ? '您已同意该申请' : '您已拒绝该申请',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 返回上一页
              uni.navigateBack()
            }
          }
        })
      }, 1500)
      
      // 实际项目中应该调用后端API
      // const url = 'http://localhost:8080/api/process/complete'
      // uni.request({
      //   url: url,
      //   method: 'POST',
      //   data: data,
      //   success: (res) => {
      //     uni.hideLoading()
      //     if (res.data.code === 200) {
      //       uni.showModal({
      //         title: '审批完成',
      //         content: result === 1 ? '您已同意该申请' : '您已拒绝该申请',
      //         showCancel: false,
      //         success: (modalRes) => {
      //           if (modalRes.confirm) {
      //             uni.navigateBack()
      //           }
      //         }
      //       })
      //     } else {
      //       this.showToast(res.data.message || '审批失败')
      //     }
      //   },
      //   fail: (err) => {
      //     uni.hideLoading()
      //     this.showToast('网络错误，请重试')
      //     console.error(err)
      //   }
      // })
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
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #007aff;
}

.detail-section {
  margin-bottom: 30rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 15rpx;
}

.label {
  width: 160rpx;
  font-size: 26rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.comment-section {
  margin-bottom: 30rpx;
}

.comment-input {
  width: 100%;
  height: 200rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.btn-approve, .btn-reject {
  width: 48%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.btn-approve {
  background-color: #007aff;
  color: #fff;
}

.btn-reject {
  background-color: #ff3b30;
  color: #fff;
}
</style> 