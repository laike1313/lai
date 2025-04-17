<template>
  <view class="container">
    <view class="header">
      <text class="title">部门成员</text>
      <text class="department-name">{{userInfo.role}}</text>
    </view>
    
    <view class="empty-tip" v-if="members.length === 0">
      <image class="empty-icon" src="/static/empty.png"></image>
      <text class="empty-text">暂无部门成员</text>
    </view>
    
    <view class="member-list" v-else>
      <view class="member-item" v-for="(member, index) in members" :key="index">
        <view class="member-info">
          <text class="member-name">{{member.name}}</text>
          <text class="member-role">{{member.role}}</text>
        </view>
        <view class="member-contact">
          <view class="contact-item" v-if="member.email">
            <text class="label">邮箱：</text>
            <text class="value">{{member.email}}</text>
          </view>
          <view class="contact-item" v-if="member.phone">
            <text class="label">电话：</text>
            <text class="value">{{member.phone}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <button class="refresh-btn" @click="loadMembers" :disabled="isLoading">
        <text v-if="isLoading">刷新中...</text>
        <text v-else>刷新列表</text>
      </button>
      
      <button class="clear-btn" @click="showClearConfirm">清空所有部门成员</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        userId: '',
        username: '',
        name: '',
        role: ''
      },
      members: [],
      isLoading: false,
      isAdmin: false
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
        
        // 判断是否为管理员（这里假设领导角色有管理员权限）
        this.isAdmin = userInfo.role === '部门领导' || userInfo.role === '系统管理员' || userInfo.role.includes('领导')
        console.log('用户角色:', userInfo.role, '是否管理员:', this.isAdmin)
        
        // 验证权限
        if (!userInfo.role.includes('领导') && !userInfo.role.startsWith('部门')) {
          uni.showToast({
            title: '您没有权限访问此页面',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          return
        }
        
        this.loadMembers()
      } else {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }
    },
    loadMembers() {
      this.isLoading = true
      // 从本地存储中获取部门成员
      const departmentMembers = uni.getStorageSync('departmentMembers') || {}
      
      // 确定要查询的部门
      let targetDepartment = ''
      
      if (this.userInfo.role === '部门领导') {
        // 如果是部门领导，需要确定管理哪个部门
        // 这里假设部门领导自己也有部门属性
        if (this.userInfo.department && this.userInfo.department.startsWith('部门')) {
          targetDepartment = this.userInfo.department
        } else {
          // 如果没有指定部门，显示所有部门成员
          // 这种情况实际中不应该发生
          this.members = []
          Object.keys(departmentMembers).forEach(dept => {
            this.members = [...this.members, ...departmentMembers[dept]]
          })
          this.isLoading = false
          this.showRefreshTip()
          return
        }
      } else if (this.userInfo.role.startsWith('部门') && !this.userInfo.role.includes('领导')) {
        // 如果是普通部门角色，显示该部门成员
        targetDepartment = this.userInfo.role
      }
      
      // 获取目标部门的成员
      if (targetDepartment && departmentMembers[targetDepartment]) {
        this.members = departmentMembers[targetDepartment]
        console.log(`加载${targetDepartment}成员：`, this.members.length)
        this.isLoading = false
        this.showRefreshTip()
      } else {
        this.members = []
        console.log('未找到部门成员')
        this.isLoading = false
        this.showRefreshTip()
      }
    },
    showRefreshTip() {
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    },
    showClearConfirm() {
      // 再次验证权限
      if (!this.isAdmin) {
        uni.showToast({
          title: '您没有清空权限',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '确认清空',
        content: '您确定要清空所有部门成员吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            this.clearAllDepartmentMembers()
          }
        }
      })
    },
    clearAllDepartmentMembers() {
      // 清空所有部门成员
      uni.setStorageSync('departmentMembers', {})
      
      // 重新加载列表
      this.members = []
      
      // 显示成功提示
      uni.showToast({
        title: '已清空所有部门成员',
        icon: 'success',
        duration: 1500
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
  display: block;
}

.department-name {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
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

.member-list {
  margin-bottom: 40rpx;
}

.member-item {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.member-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.member-role {
  font-size: 26rpx;
  color: #007aff;
  background-color: rgba(0, 122, 255, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.member-contact {
  margin-top: 10rpx;
}

.contact-item {
  display: flex;
  margin-bottom: 10rpx;
}

.label {
  font-size: 26rpx;
  color: #666;
  width: 100rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.actions {
  margin-top: 40rpx;
}

.refresh-btn {
  width: 100%;
  height: 90rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn {
  width: 100%;
  height: 90rpx;
  background-color: #ff3b30;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}
</style> 