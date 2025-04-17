<template>
  <view class="container">
    <view class="header">
      <view class="welcome">
        <text class="welcome-text">欢迎，{{userInfo.name}}</text>
        <text class="role-text">角色：{{userInfo.role}}</text>
      </view>
      <view class="header-actions">
        <button class="clear-btn" @click="clearAllData">清除数据</button>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
    
    <view class="dashboard">
      <view class="dashboard-cards">
        <view class="card" :class="{'card-active': activeCard === 'apply'}" @click="navigateToWithHighlight('/pages/apply/apply', 'apply')">
          <image class="card-icon" :src="activeCard === 'apply' ? '/static/apply-active.png' : '/static/apply.png'"></image>
          <text class="card-title" :class="{'title-active': activeCard === 'apply'}">物品申请</text>
        </view>
        
        <view class="card" :class="{'card-active': activeCard === 'my-applies'}" @click="navigateToWithHighlight('/pages/my-applies/my-applies', 'my-applies')">
          <image class="card-icon" :src="activeCard === 'my-applies' ? '/static/list-active.png' : '/static/list.png'"></image>
          <text class="card-title" :class="{'title-active': activeCard === 'my-applies'}">我的申请</text>
        </view>
        
        <view class="card" v-if="userInfo.role !== '普通用户'" :class="{'card-active': activeCard === 'my-tasks'}" @click="navigateToWithHighlight('/pages/my-tasks/my-tasks', 'my-tasks')">
          <image class="card-icon" :src="activeCard === 'my-tasks' ? '/static/task-active.png' : '/static/task.png'"></image>
          <text class="card-title" :class="{'title-active': activeCard === 'my-tasks'}">待办任务</text>
        </view>
        
        <view class="card" :class="{'card-active': activeCard === 'user-profile'}" @click="navigateToWithHighlight('/pages/user-profile/user-profile', 'user-profile')">
          <image class="card-icon" :src="activeCard === 'user-profile' ? '/static/home-active.png' : '/static/home.png'"></image>
          <text class="card-title" :class="{'title-active': activeCard === 'user-profile'}">个人信息</text>
        </view>
        
        <view class="card" v-if="userInfo.role.includes('领导') || userInfo.role.startsWith('部门')" :class="{'card-active': activeCard === 'department-members'}" @click="navigateToWithHighlight('/pages/department-members/department-members', 'department-members')">
          <image class="card-icon" :src="activeCard === 'department-members' ? '/static/home-active.png' : '/static/home.png'"></image>
          <text class="card-title" :class="{'title-active': activeCard === 'department-members'}">部门成员</text>
        </view>
      </view>
    </view>
    
    <view class="workflow-info">
      <view class="section-title">
        <text>审批流程</text>
      </view>
      <view class="workflow-steps">
        <view class="workflow-step">
          <view class="step-circle">1</view>
          <text class="step-name">普通用户提交申请</text>
        </view>
        <view class="workflow-step">
          <view class="step-circle">2</view>
          <text class="step-name">对应部门初审</text>
        </view>
        <view class="workflow-step">
          <view class="step-circle">3</view>
          <text class="step-name">部门分管领导审批</text>
        </view>
        <view class="workflow-step">
          <view class="step-circle">4</view>
          <text class="step-name">行政科审批</text>
        </view>
        <view class="workflow-step">
          <view class="step-circle">5</view>
          <text class="step-name">行政科领导审批</text>
        </view>
      </view>
    </view>
    
    <view class="quick-actions">
      <view class="section-title">
        <text>快捷操作</text>
      </view>
      <view class="action-buttons">
        <button class="action-btn apply-btn" @click="navigateTo('/pages/apply/apply')">申请物品</button>
        <button class="action-btn task-btn" @click="navigateTo('/pages/my-tasks/my-tasks')" v-if="userInfo.role !== '普通用户'">处理任务</button>
      </view>
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
      statistics: {
        applyCount: 0,
        taskCount: 0
      },
      activeCard: null
    }
  },
  onLoad() {
    // 默认激活首页卡片
    this.activeCard = 'apply';
  },
  onShow() {
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = userInfo
      this.loadStatistics()
      
      // 根据角色处理界面展示
      this.handleRoleBasedUI(userInfo.role)
    } else {
      // 未登录，跳转到登录页
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  methods: {
    loadStatistics() {
      // 模拟获取统计数据
      // 实际项目中应该调用后端API获取数据
      
      // 获取申请数量
      const applies = uni.getStorageSync('applies') || []
      this.statistics.applyCount = applies.filter(a => a.applicantId === String(this.userInfo.userId || '')).length

      // 获取任务数量
      const tasks = uni.getStorageSync('tasks') || []
      this.statistics.taskCount = tasks.filter(t => t.currentApprover === this.userInfo.role).length
    },
    clearAllData() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有申请和任务数据吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除申请和任务数据
            uni.removeStorageSync('applies')
            uni.removeStorageSync('tasks')
            uni.removeStorageSync('histories')
            
            // 提示用户清除成功
            uni.showToast({
              title: '数据已清除',
              icon: 'success'
            })
            
            // 刷新统计数据
            setTimeout(() => {
              this.loadStatistics()
            }, 500)
          }
        }
      })
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息
            uni.removeStorageSync('userInfo')
            // 跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    },
    handleRoleBasedUI(role) {
      // 使用App实例中的TabBar初始化方法，确保一致性
      // 获取App实例
      const app = getApp();
      if (app && app.initTabBar) {
        // 调用App实例的初始化TabBar方法
        app.initTabBar();
      } else {
        // 如果App实例不可用，使用本地逻辑
        if (role === '普通用户') {
          // 普通用户隐藏待办任务
          uni.hideTabBar({
            animation: false,
            success: () => {
              // 获取TabBar配置
              let tabbarList = [
                {
                  pagePath: "pages/index/index",
                  text: "首页",
                  iconPath: "/static/home.png",
                  selectedIconPath: "/static/home-active.png"
                },
                {
                  pagePath: "pages/apply/apply",
                  text: "申请",
                  iconPath: "/static/apply.png",
                  selectedIconPath: "/static/apply-active.png"
                },
                {
                  pagePath: "pages/my-applies/my-applies",
                  text: "我的申请",
                  iconPath: "/static/list.png",
                  selectedIconPath: "/static/list-active.png"
                }
              ]
              
              // 显示自定义TabBar，不包含待办任务
              uni.showTabBar({
                animation: false,
                success: () => {
                  // 设置TabBar样式
                  uni.setTabBarStyle({
                    color: "#7A7E83",
                    selectedColor: "#007AFF",
                    backgroundColor: "#ffffff",
                    borderStyle: "black"
                  })
                  
                  // 设置TabBar项
                  tabbarList.forEach((item, index) => {
                    uni.setTabBarItem({
                      index: index,
                      text: item.text,
                      pagePath: item.pagePath,
                      iconPath: item.iconPath,
                      selectedIconPath: item.selectedIconPath
                    })
                  })
                }
              })
            }
          })
        } else {
          // 其他角色显示完整TabBar
          uni.showTabBar()
        }
      }
    },
    navigateToWithHighlight(url, card) {
      this.activeCard = card
      this.navigateTo(url)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.welcome {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.role-text {
  font-size: 26rpx;
  color: #666;
  margin-top: 6rpx;
}

.header-actions {
  display: flex;
  gap: 10rpx;
}

.logout-btn, .clear-btn {
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  background-color: #f2f2f2;
  color: #666;
  border-radius: 30rpx;
  line-height: 1.5;
}

.clear-btn {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.dashboard {
  display: flex;
  margin-bottom: 40rpx;
}

.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  gap: 0;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 10rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card {
  width: 20%;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 15rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
  transition: all 0.3s ease;
}

.card:active {
  transform: scale(0.95);
  background-color: #f0f0f0;
}

.card-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
}

.card-title {
  font-size: 24rpx;
  font-weight: normal;
  color: #7A7E83;
  text-align: center;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  border-left: 8rpx solid #007aff;
  padding-left: 20rpx;
}

.workflow-info {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.workflow-steps {
  display: flex;
  flex-direction: column;
}

.workflow-step {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.step-circle {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #007aff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.step-name {
  font-size: 28rpx;
  color: #333;
}

.quick-actions {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
}

.action-btn {
  width: 48%;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.apply-btn {
  background-color: #007aff;
  color: #fff;
}

.task-btn {
  background-color: #ff9500;
  color: #fff;
}

.card-active {
  background-color: #f0f0f0;
}

.title-active {
  color: #007AFF;
  font-weight: bold;
}
</style>
