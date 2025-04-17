<template>
  <view class="container">
    <view class="header">
      <text class="title">待办任务</text>
    </view>
    
    <view class="empty-tip" v-if="tasks.length === 0">
      <image class="empty-icon" src="/static/empty.png"></image>
      <text class="empty-text">暂无待办任务</text>
    </view>
    
    <view class="list" v-else>
      <view class="task-item" v-for="(task, index) in tasks" :key="index" @click="handleTask(task)">
        <view class="task-header">
          <text class="task-title">{{task.taskName}}</text>
          <text class="task-time">{{task.createTime}}</text>
        </view>
        
        <view class="task-info">
          <view class="info-row">
            <text class="info-label">申请人：</text>
            <text class="info-value">{{task.applicantName}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">物品名称：</text>
            <text class="info-value">{{task.itemName}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">数量：</text>
            <text class="info-value">{{task.quantity}} 个</text>
          </view>
          <view class="info-row">
            <text class="info-label">单价：</text>
            <text class="info-value">¥{{task.price}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">类别：</text>
            <text class="info-value">{{task.category}}</text>
          </view>
          <view class="info-row">
            <text class="info-label">申请原因：</text>
            <text class="info-value">{{task.reason}}</text>
          </view>
        </view>
        
        <view class="task-actions">
          <button class="btn-primary" @click.stop="approveTask(task)">同意</button>
          <button class="btn-danger" @click.stop="rejectTask(task)">拒绝</button>
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
      tasks: []
    }
  },
  onShow() {
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
      
      this.loadTasks()
    } else {
      // 未登录，跳转到登录页
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  methods: {
    loadTasks() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 从本地存储获取任务数据
      const allTasks = uni.getStorageSync('tasks') || []
      
      // 根据当前用户角色筛选可处理的任务
      const userRole = this.userInfo.role
      
      if (userRole === '部门分管领导') {
        // 部门分管领导可以看到分配给他的所有任务
        this.tasks = allTasks.filter(task => task.currentApprover === '部门分管领导')
      } else if (userRole.startsWith('部门') && !userRole.includes('领导')) {
        // 部门角色只能看到分配给该部门的任务
        this.tasks = allTasks.filter(task => task.currentApprover === userRole)
      } else {
        // 其他角色（行政科等）看到分配给该角色的所有任务
        this.tasks = allTasks.filter(task => task.currentApprover === userRole)
      }
      
      console.log('当前用户角色:', userRole)
      console.log('筛选后任务:', this.tasks)
      
      // 隐藏加载
      uni.hideLoading()
    },
    handleTask(task) {
      // 转到任务详情页
      this.goToTaskDetail(task)
    },
    approveTask(task) {
      this.completeTask(task, 1, '同意申请')
    },
    rejectTask(task) {
      uni.showModal({
        title: '拒绝原因',
        editable: true,
        placeholderText: '请输入拒绝原因',
        success: (res) => {
          if (res.confirm) {
            const comment = res.content || '不予批准'
            this.completeTask(task, 2, comment)
          }
        }
      })
    },
    completeTask(task, result, comment) {
      // 显示加载中
      uni.showLoading({
        title: result === 1 ? '审批中...' : '拒绝中...'
      })
      
      const data = {
        taskId: task.taskId,
        processInstanceId: task.processInstanceId,
        userId: this.userInfo.userId,
        userName: this.userInfo.name,
        comment: comment,
        result: result,
        approvalLevel: task.approvalLevel || 1
      }
      
      // 处理审批逻辑
      const now = new Date()
      const approvalTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      // 添加审批历史记录
      const processId = task.processInstanceId
      const allHistories = uni.getStorageSync('histories') || {}
      
      if (!allHistories[processId]) {
        allHistories[processId] = []
      }
      
      // 创建审批记录
      const history = {
        id: allHistories[processId].length + 1,
        taskId: task.taskId,
        processInstanceId: processId,
        userId: this.userInfo.userId,
        userName: this.userInfo.name,
        comment: comment,
        result: result,
        approvalTime: approvalTime,
        taskName: task.taskName,
        approvalLevel: task.approvalLevel || 1
      }
      
      // 添加到历史记录
      allHistories[processId].unshift(history)
      uni.setStorageSync('histories', allHistories)
      
      // 获取申请信息
      const applies = uni.getStorageSync('applies') || []
      const applyIndex = applies.findIndex(a => a.processInstanceId === processId)
      
      // 从任务列表中删除当前任务
      const tasks = uni.getStorageSync('tasks') || []
      const taskIndex = tasks.findIndex(t => t.taskId === task.taskId)
      
      if (taskIndex >= 0) {
        tasks.splice(taskIndex, 1)
      }
      
      // 如果拒绝，直接更新申请状态为拒绝
      if (result === 2 && applyIndex >= 0) {
        applies[applyIndex].status = 2 // 拒绝
        uni.setStorageSync('applies', applies)
      } 
      // 如果同意，检查是否需要创建下一级审批任务
      else if (result === 1) {
        // 获取当前审批人角色
        const currentRole = this.userInfo.role
        let nextTask = null
        
        // 按照Flowable流程图配置审批流程
        if (currentRole.startsWith('部门') && !currentRole.includes('领导')) {
          // 部门一至部门六初审后，交给部门分管领导
          nextTask = {
            ...task,
            taskId: `task-${task.processInstanceId}-level2-${Date.now()}`,
            taskName: '部门分管领导审批',
            createTime: approvalTime,
            currentApprover: '部门分管领导',
            approvalLevel: 2,
            department: task.department || task.departmentName || currentRole, // 保留部门信息
            departmentName: currentRole // 记录来源部门
          }
          
          // 向部门分管领导任务添加部门来源信息
          console.log('从', currentRole, '流转到部门分管领导')
          console.log('部门分管领导任务数据:', nextTask)
        } else if (currentRole === '部门分管领导') {
          // 部门分管领导审批后，交给行政科
          nextTask = {
            ...task,
            taskId: `task-${task.processInstanceId}-level3-${Date.now()}`,
            taskName: '行政科审批',
            createTime: approvalTime,
            currentApprover: '行政科',
            approvalLevel: 3
          }
        } else if (currentRole === '行政科') {
          // 行政科审批后，交给行政科领导
          nextTask = {
            ...task,
            taskId: `task-${task.processInstanceId}-level4-${Date.now()}`,
            taskName: '行政科领导审批',
            createTime: approvalTime,
            currentApprover: '行政科领导',
            approvalLevel: 4
          }
        } else if (currentRole === '行政科领导' && applyIndex >= 0) {
          // 最终审批级别，更新申请状态为通过
          applies[applyIndex].status = 1 // 已通过
          uni.setStorageSync('applies', applies)
        }
        
        // 如果有下一级任务，添加到任务列表
        if (nextTask) {
          tasks.unshift(nextTask)
        }
      }
      
      // 保存任务列表
      uni.setStorageSync('tasks', tasks)
      
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
              // 重新加载任务列表
              this.loadTasks()
            }
          }
        })
      }, 1500)
    },
    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      })
    },
    // 转到任务详情页
    goToTaskDetail(task) {
      uni.navigateTo({
        url: '/pages/task-detail/task-detail?taskId=' + task.taskId,
        success: function(res) {
          // 通过eventChannel向详情页面传参
          if (res.eventChannel && typeof res.eventChannel.emit === 'function') {
            res.eventChannel.emit('taskDetail', task)
          }
        },
        fail: function() {
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
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

.task-item {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.task-time {
  font-size: 24rpx;
  color: #999;
}

.task-info {
  margin-bottom: 30rpx;
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

.task-actions {
  display: flex;
  justify-content: space-between;
}

.btn-primary, .btn-danger {
  width: 48%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.btn-primary {
  background-color: #007aff;
  color: #fff;
}

.btn-danger {
  background-color: #ff3b30;
  color: #fff;
}
</style> 