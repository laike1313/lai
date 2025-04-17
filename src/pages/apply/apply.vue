<template>
  <view class="container">
    <view class="form-card">
      <view class="form-header">
        <text class="form-title">物品申请表</text>
      </view>
      
      <view class="form-body">
        <view class="form-item">
          <text class="form-label">物品名称</text>
          <input class="form-input" type="text" v-model="formData.name" placeholder="请输入物品名称" />
        </view>
        
        <view class="form-item">
          <text class="form-label">物品数量</text>
          <input class="form-input" type="number" v-model="formData.quantity" placeholder="请输入物品数量" />
        </view>
        
        <view class="form-item">
          <text class="form-label">物品价格</text>
          <input class="form-input" type="digit" v-model="formData.price" placeholder="请输入物品价格" />
        </view>
        
        <view class="form-item">
          <text class="form-label">物品类别</text>
          <picker class="form-picker" mode="selector" :range="categories" @change="onCategoryChange">
            <view class="picker-value">{{formData.category || '请选择物品类别'}}</view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">申请理由</text>
          <textarea class="form-textarea" v-model="formData.reason" placeholder="请输入申请理由"></textarea>
        </view>
      </view>
      
      <view class="form-footer">
        <button class="submit-btn" @click="submitApply">提交申请</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      formData: {
        name: '',
        quantity: '',
        price: '',
        category: '',
        reason: '',
        applicantId: '',
        applicantName: ''
      },
      categories: ['办公设备', '办公用品', '电子产品', '家具', '其他']
    }
  },
  onLoad() {
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = userInfo
      this.formData.applicantId = String(userInfo.userId || '')
      this.formData.applicantName = userInfo.name
      
      console.log('用户信息载入成功：', JSON.stringify(userInfo))
      console.log('表单applicantId类型：', typeof this.formData.applicantId)
    } else {
      // 未登录，跳转到登录页
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  methods: {
    onCategoryChange(e) {
      const index = e.detail.value
      this.formData.category = this.categories[index]
    },
    debug(title, data) {
      console.log(`=============== ${title} ===============`)
      console.log(JSON.stringify(data, null, 2))
      console.log('=======================================')
    },
    submitApply() {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        uni.redirectTo({
          url: '/pages/login/login'
        })
        return
      }
      
      // 检查用户是否已设置部门
      if (!userInfo.department && userInfo.role === '普通用户') {
        uni.showModal({
          title: '提示',
          content: '您还未设置部门，请先到个人信息页面设置部门',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/user-profile/user-profile'
              })
            }
          }
        })
        return
      }
      
      // 验证表单
      if (!this.formData.name.trim()) {
        this.showToast('请输入物品名称')
        return
      }
      if (!this.formData.quantity || this.formData.quantity <= 0) {
        this.showToast('请输入有效的数量')
        return
      }
      if (!this.formData.price || this.formData.price <= 0) {
        this.showToast('请输入有效的单价')
        return
      }
      if (!this.formData.category.trim()) {
        this.showToast('请选择物品类别')
        return
      }
      if (!this.formData.reason.trim()) {
        this.showToast('请输入申请理由')
        return
      }
      
      // 显示加载中
      uni.showLoading({
        title: '提交中...'
      })
      
      // 创建申请记录
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const processInstanceId = `proc-${Date.now()}`
      
      // 确定第一个审批部门 (在实际项目中，这里应该根据申请类型或用户部门来决定)
      // 从用户部门字段或预设的部门中选择
      let initialApprover = '部门一'  // 默认部门一
      
      // 如果用户有部门信息，并且部门以"部门"开头，则使用该部门作为初始审批人
      if (userInfo.department && userInfo.department.startsWith('部门')) {
        if (['部门一', '部门二', '部门三', '部门四', '部门五', '部门六'].includes(userInfo.department)) {
          initialApprover = userInfo.department
        }
      }
      
      // 创建申请对象
      const apply = {
        applyId: `apply-${Date.now()}`,
        processInstanceId: processInstanceId,
        applicantId: userInfo.userId,
        applicantName: userInfo.name,
        itemName: this.formData.name,
        quantity: parseInt(this.formData.quantity),
        price: parseFloat(this.formData.price),
        category: this.formData.category,
        reason: this.formData.reason,
        createTime: dateStr,
        status: 0, // 0-处理中，1-已通过，2-已拒绝
        currentApprover: initialApprover,
        department: userInfo.department || '未设置', // 记录申请人的部门
        departmentName: initialApprover // 记录审批部门名称
      }
      
      // 创建任务对象
      const task = {
        taskId: `task-${processInstanceId}-level1-${Date.now()}`,
        taskName: `${initialApprover}审批`,
        processInstanceId: processInstanceId,
        applicantId: userInfo.userId,
        applicantName: userInfo.name,
        itemName: this.formData.name,
        quantity: parseInt(this.formData.quantity),
        price: parseFloat(this.formData.price),
        category: this.formData.category,
        reason: this.formData.reason,
        createTime: dateStr,
        currentApprover: initialApprover,
        approvalLevel: 1,
        department: userInfo.department || '未设置', // 记录申请人部门
        departmentName: initialApprover // 记录审批部门名称
      }
      
      // 获取并更新申请列表
      const applies = uni.getStorageSync('applies') || []
      applies.unshift(apply)
      uni.setStorageSync('applies', applies)
      
      // 获取并更新任务列表
      const tasks = uni.getStorageSync('tasks') || []
      tasks.unshift(task)
      uni.setStorageSync('tasks', tasks)
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading()
        
        uni.showModal({
          title: '提交成功',
          content: '您的申请已提交，正在等待审批',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 重置表单
              this.resetForm()
              
              // 跳转到我的申请页面
              uni.switchTab({
                url: '/pages/my-applies/my-applies'
              })
            }
          }
        })
      }, 1500)
    },
    resetForm() {
      this.formData = {
        name: '',
        quantity: '',
        price: '',
        category: '',
        reason: '',
        applicantId: String(this.userInfo.userId || ''),
        applicantName: this.userInfo.name
      }
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

.form-card {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  padding: 30rpx;
  background-color: #007aff;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.form-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.form-input, .form-picker {
  width: 100%;
  height: 90rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.picker-value {
  height: 90rpx;
  line-height: 90rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-footer {
  padding: 30rpx;
  border-top: 1px solid #eee;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 