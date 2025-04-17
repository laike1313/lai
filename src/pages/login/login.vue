<template>
  <view class="login-container">
    <view class="logo-area">
      <image class="logo" src="/static/logo.png"></image>
      <text class="title">物品审批系统</text>
    </view>
    
    <view class="form-area">
      <view class="input-item">
        <text class="label">用户名</text>
        <input type="text" v-model="username" placeholder="请输入用户名" />
      </view>
      <view class="input-item">
        <text class="label">密码</text>
        <input type="password" v-model="password" placeholder="请输入密码" />
      </view>
      
      <button class="login-btn" @click="handleLogin">登录</button>
      
      <view class="register-link" @click="goToRegister">还没有账号？点击注册</view>
      
      <view class="tips">
        <text>提示: 可用的测试账号</text>
        <view class="account-list">
          <text>普通用户: zhangsan / 123456 (提交物品申请)</text>
          <text>部门一: bumen1 / 123456 (审批)</text>
          <text>部门二: bumen2 / 123456 (审批)</text>
          <text>部门分管领导: fgleader / 123456 (审批)</text>
          <text>行政科: xingzheng / 123456 (审批)</text>
          <text>行政科领导: xzleader / 123456 (审批)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      userList: [
        { id: '10001', username: 'zhangsan', password: '123456', name: '张三', role: '普通用户' },
        { id: '20001', username: 'bumen1', password: '123456', name: '部门一', role: '部门一' },
        { id: '20002', username: 'bumen2', password: '123456', name: '部门二', role: '部门二' },
        { id: '20003', username: 'bumen3', password: '123456', name: '部门三', role: '部门三' },
        { id: '20004', username: 'bumen4', password: '123456', name: '部门四', role: '部门四' },
        { id: '20005', username: 'bumen5', password: '123456', name: '部门五', role: '部门五' },
        { id: '20006', username: 'bumen6', password: '123456', name: '部门六', role: '部门六' },
        { id: '30001', username: 'fgleader', password: '123456', name: '分管领导', role: '部门分管领导' },
        { id: '50001', username: 'xingzheng', password: '123456', name: '行政科', role: '行政科' },
        { id: '60001', username: 'xzleader', password: '123456', name: '行政科领导', role: '行政科领导' }
      ]
    }
  },
  onLoad() {
    // 加载已注册用户
    this.loadRegisteredUsers()
  },
  methods: {
    loadRegisteredUsers() {
      // 从本地存储获取已注册用户
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      console.log('从存储中读取已注册用户数量:', registeredUsers.length)
      
      // 获取已注销用户列表
      const deactivatedUsers = uni.getStorageSync('deactivatedUsers') || []
      
      // 过滤预设用户列表，移除已注销的用户名
      const filteredUserList = this.userList.filter(user => !deactivatedUsers.includes(user.username))
      
      // 过滤已注册用户列表，移除已注销的用户名
      const filteredRegisteredUsers = registeredUsers.filter(user => !deactivatedUsers.includes(user.username))
      console.log('过滤后的已注册用户数量:', filteredRegisteredUsers.length)
      
      // 将未被注销的已注册用户添加到用户列表中
      if (filteredRegisteredUsers.length > 0) {
        this.userList = [...filteredUserList, ...filteredRegisteredUsers]
        
        // 打印合并后的用户列表以供调试
        console.log('合并后的用户列表数量:', this.userList.length)
        console.log('已注册用户名列表:', filteredRegisteredUsers.map(u => u.username).join(', '))
      } else {
        this.userList = filteredUserList
        console.log('仅使用预设用户列表, 数量:', this.userList.length)
      }
    },
    handleLogin() {
      if (!this.username.trim()) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return
      }
      if (!this.password.trim()) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      
      // 检查用户名是否已被注销
      const deactivatedUsers = uni.getStorageSync('deactivatedUsers') || []
      if (deactivatedUsers.includes(this.username)) {
        uni.showToast({
          title: '该用户已被注销，请重新注册',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 重新加载最新的用户列表
      this.loadRegisteredUsers()
      
      console.log('尝试登录:', this.username, '可用用户列表数量:', this.userList.length)
      
      // 验证用户名和密码
      const user = this.userList.find(item => item.username === this.username && item.password === this.password)
      
      // 打印匹配结果用于调试
      if (user) {
        console.log('找到匹配用户:', user.username, user.name)
      } else {
        // 查找是否有用户名匹配但密码不匹配的情况
        const userWithSameUsername = this.userList.find(item => item.username === this.username)
        
        if (userWithSameUsername) {
          uni.showToast({
            title: '密码错误',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: '用户名不存在',
            icon: 'none'
          })
        }
      }
      
      if (user) {
        uni.showLoading({
          title: '登录中...'
        })
        
        // 存储用户信息到本地存储
        uni.setStorageSync('userInfo', {
          userId: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || ''
        })
        
        setTimeout(() => {
          uni.hideLoading()
          // 跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        uni.showToast({
          title: '用户名或密码错误',
          icon: 'none'
        })
      }
    },
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
}
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx 30rpx;
  height: 100vh;
  background-color: #f8f8f8;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.form-area {
  width: 100%;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.input-item {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

input {
  width: 100%;
  height: 90rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #f5f7fa;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 32rpx;
  margin-top: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 45rpx;
}

.register-link {
  font-size: 28rpx;
  color: #007aff;
  text-align: center;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.tips {
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #999;
  text-align: center;
}

.account-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.account-list text {
  margin-bottom: 10rpx;
  color: #666;
}
</style> 