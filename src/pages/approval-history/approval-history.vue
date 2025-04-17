<template>
  <view class="container">
    <view class="header">
      <text class="title">审批历史</text>
    </view>
    
    <view class="apply-status" v-if="applyInfo">
      <text class="status-label">申请状态：</text>
      <text class="status-value" :class="{
        'status-pending': applyInfo.status === 0,
        'status-approved': applyInfo.status === 1,
        'status-rejected': applyInfo.status === 2
      }">{{getFlowStatusText(applyInfo.status)}}</text>
    </view>
    
    <view class="workflow-steps" v-if="applyInfo">
      <view class="step-item" 
        v-for="(step, index) in workflowSteps" 
        :key="index"
        :class="{
          'step-current': currentStepIndex === index,
          'step-completed': isStepCompleted(index),
          'step-rejected': isStepRejected(index)
        }">
        <view class="step-index">{{index + 1}}</view>
        <view class="step-info">
          <text class="step-name">{{step}}</text>
          <text class="step-status" v-if="getStepStatusText(index)">{{getStepStatusText(index)}}</text>
        </view>
      </view>
    </view>
    
    <view class="divider"></view>
    
    <view class="empty-tip" v-if="historyList.length === 0">
      <image class="empty-icon" src="/static/empty.png"></image>
      <text class="empty-text">暂无审批记录</text>
    </view>
    
    <view class="timeline" v-else>
      <view class="timeline-item" v-for="(item, index) in historyList" :key="index">
        <view class="timeline-dot" :class="{'dot-success': item.result === 1, 'dot-reject': item.result === 2}"></view>
        <view class="timeline-content">
          <view class="timeline-header">
            <text class="task-name">{{item.taskName}}</text>
            <text class="result" :class="{'result-success': item.result === 1, 'result-reject': item.result === 2}">
              {{getResultText(item.result)}}
            </text>
          </view>
          <view class="timeline-body">
            <view class="info-row">
              <text class="info-label">审批人：</text>
              <text class="info-value">{{item.userName}}</text>
            </view>
            <view class="info-row">
              <text class="info-label">审批时间：</text>
              <text class="info-value">{{item.approvalTime}}</text>
            </view>
            <view class="info-row">
              <text class="info-label">审批意见：</text>
              <text class="info-value">{{item.comment}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      processInstanceId: '',
      historyList: [],
      applyInfo: null,
      workflowSteps: ['部门领导审批', '分管领导审批', '行政科审批', '行政科领导审批'],
      currentStepIndex: 0
    }
  },
  onLoad(options) {
    if (options.processInstanceId) {
      this.processInstanceId = options.processInstanceId
      this.loadHistoryData()
    } else {
      this.showToast('流程实例ID不存在')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    loadHistoryData() {
      // 显示加载中
      uni.showLoading({
        title: '加载中...'
      })
      
      // 从本地存储获取审批历史
      const allHistories = uni.getStorageSync('histories') || {}
      this.historyList = allHistories[this.processInstanceId] || []
      
      // 获取申请信息以显示当前状态
      const applies = uni.getStorageSync('applies') || []
      this.applyInfo = applies.find(a => a.processInstanceId === this.processInstanceId)
      
      // 如果没有历史记录但有申请信息，说明尚未审批
      if (this.historyList.length === 0 && this.applyInfo) {
        console.log('该申请尚未有审批记录')
      }
      
      // 按时间倒序排序历史记录
      this.historyList.sort((a, b) => {
        return new Date(b.approvalTime) - new Date(a.approvalTime)
      })
      
      console.log('获取到的审批历史:', this.historyList)
      
      // 计算当前审批步骤
      this.calculateCurrentStep()
      
      uni.hideLoading()
    },
    
    // 计算当前审批步骤
    calculateCurrentStep() {
      if (!this.applyInfo) return
      
      // 如果申请已被拒绝，则当前步骤为最后一个处理的步骤
      if (this.applyInfo.status === 2) {
        // 找到拒绝的那一步
        const rejectedHistory = this.historyList.find(h => h.result === 2)
        if (rejectedHistory) {
          this.currentStepIndex = rejectedHistory.approvalLevel - 1 || 0
        }
        return
      }
      
      // 如果申请已通过，则当前步骤为所有步骤
      if (this.applyInfo.status === 1) {
        this.currentStepIndex = this.workflowSteps.length - 1
        return
      }
      
      // 计算最后一次审批的级别
      const maxLevel = this.historyList.reduce((max, history) => {
        return Math.max(max, history.approvalLevel || 0)
      }, 0)
      
      // 如果是审批中，则当前步骤为最后一次审批后的下一步
      this.currentStepIndex = maxLevel
      
      console.log('当前步骤索引:', this.currentStepIndex)
    },
    
    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      })
    },
    
    // 获取审批历史文本映射
    getFlowStatusText(status) {
      const statusMap = {
        0: '审批中',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取审批结果文本
    getResultText(result) {
      const resultMap = {
        1: '同意',
        2: '拒绝'
      }
      return resultMap[result] || '未处理'
    },
    
    // 获取审批阶段文本
    getLevelText(level) {
      const levelMap = {
        1: '部门领导审批',
        2: '分管领导审批',
        3: '行政科审批',
        4: '行政科领导审批'
      }
      return levelMap[level] || `第${level}级审批`
    },
    
    // 获取步骤状态文本
    getStepStatusText(index) {
      if (!this.applyInfo) return null
      
      // 找到对应级别的审批历史
      const stepHistory = this.historyList.find(h => (h.approvalLevel - 1) === index)
      
      if (stepHistory) {
        return stepHistory.result === 1 ? '已同意' : '已拒绝'
      }
      
      // 当前进行中的步骤
      if (index === this.currentStepIndex && this.applyInfo.status === 0) {
        return '处理中'
      }
      
      // 未开始的步骤
      if (index > this.currentStepIndex) {
        return '等待中'
      }
      
      return null
    },
    
    // 判断步骤是否已完成
    isStepCompleted(index) {
      if (!this.applyInfo) return false
      
      // 如果申请已完成或已拒绝
      if (this.applyInfo.status !== 0) {
        // 找到对应级别的审批历史
        const stepHistory = this.historyList.find(h => (h.approvalLevel - 1) === index)
        return stepHistory && stepHistory.result === 1
      }
      
      // 审批中，检查历史记录
      return this.historyList.some(h => (h.approvalLevel - 1) === index && h.result === 1)
    },
    
    // 判断步骤是否被拒绝
    isStepRejected(index) {
      if (!this.applyInfo) return false
      
      // 找到对应级别的审批历史
      const stepHistory = this.historyList.find(h => (h.approvalLevel - 1) === index)
      return stepHistory && stepHistory.result === 2
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

.apply-status {
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
}

.status-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 10rpx;
}

.status-value {
  font-size: 28rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.workflow-steps {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.step-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  position: relative;
}

.step-item:not(:last-child):after {
  content: '';
  position: absolute;
  left: 20rpx;
  top: 56rpx;
  bottom: 0;
  width: 2rpx;
  background-color: #e8e8e8;
}

.step-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #e8e8e8;
  color: #999;
  font-size: 24rpx;
  line-height: 40rpx;
  text-align: center;
  margin-right: 20rpx;
  position: relative;
  z-index: 1;
}

.step-completed .step-index {
  background-color: #52c41a;
  color: #fff;
}

.step-current .step-index {
  background-color: #1890ff;
  color: #fff;
  box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.2);
}

.step-rejected .step-index {
  background-color: #ff4d4f;
  color: #fff;
}

.step-info {
  flex: 1;
}

.step-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.step-status {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.step-completed .step-status {
  color: #52c41a;
}

.step-current .step-status {
  color: #1890ff;
}

.step-rejected .step-status {
  color: #ff4d4f;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 30rpx 0;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100rpx;
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

.timeline {
  position: relative;
  padding-left: 40rpx;
}

.timeline:before {
  content: '';
  position: absolute;
  left: 10rpx;
  top: 10rpx;
  bottom: 10rpx;
  width: 2rpx;
  background-color: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 40rpx;
}

.timeline-dot {
  position: absolute;
  left: -40rpx;
  top: 16rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #007aff;
  z-index: 1;
}

.dot-success {
  background-color: #52c41a;
}

.dot-reject {
  background-color: #ff4d4f;
}

.timeline-content {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.task-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.result-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.result-reject {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.timeline-body {
  
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
</style> 