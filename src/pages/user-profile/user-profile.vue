<template>
  <view class="container">
    <view class="profile-card">
      <view class="header">
        <text class="title">个人信息</text>
      </view>
      
      <view class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="userInfo.username" disabled />
        </view>
        
        <view class="form-item">
          <text class="label">姓名</text>
          <input class="input" v-model="userInfo.name" placeholder="请输入姓名" />
        </view>
        
        <view class="form-item">
          <text class="label">角色</text>
          <input class="input" v-model="userInfo.role" disabled />
        </view>
        
        <view class="form-item">
          <text class="label">所属部门</text>
          <picker @change="departmentChange" :value="departmentIndex" :range="departments">
            <view class="picker">
              <text v-if="userInfo.department">{{userInfo.department}}</text>
              <text v-else class="placeholder">请选择部门</text>
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="label">电子邮箱</text>
          <input class="input" v-model="userInfo.email" placeholder="请输入电子邮箱" />
        </view>
        
        <view class="form-item">
          <text class="label">手机号码</text>
          <input class="input" v-model="userInfo.phone" placeholder="请输入手机号码" />
        </view>
      </view>
      
      <view class="actions">
        <button class="btn-save" @click="saveProfile">保存信息</button>
        <button class="btn-logout" @click="showLogoutConfirm">注销用户</button>
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
        role: '',
        department: '',
        email: '',
        phone: ''
      },
      originalDepartment: '', // 记录原部门
      departments: ['部门一', '部门二', '部门三', '部门四', '部门五', '部门六'],
      departmentIndex: 0
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = {...userInfo}
        
        // 记录原部门
        this.originalDepartment = this.userInfo.department
        
        // 设置部门下拉框索引
        if (this.userInfo.department) {
          const index = this.departments.findIndex(d => d === this.userInfo.department)
          if (index !== -1) {
            this.departmentIndex = index
          }
        }
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
    departmentChange(e) {
      this.departmentIndex = e.detail.value
      this.userInfo.department = this.departments[this.departmentIndex]
    },
    saveProfile() {
      // 验证信息
      if (!this.userInfo.name) {
        this.showToast('请输入姓名')
        return
      }
      
      // 无论是否更换部门，都先从所有部门中删除当前用户
      this.removeUserFromAllDepartments()
      
      // 保存用户信息
      uni.setStorageSync('userInfo', this.userInfo)
      
      // 更新用户列表中的信息
      this.updateUserInList()
      
      // 显示保存成功
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
    updateUserInList() {
      // 获取所有用户
      const allUsers = uni.getStorageSync('registeredUsers') || []
      
      // 查找当前用户并更新
      const index = allUsers.findIndex(u => u.id === this.userInfo.userId)
      if (index !== -1) {
        allUsers[index] = {
          ...allUsers[index],
          name: this.userInfo.name,
          department: this.userInfo.department,
          email: this.userInfo.email,
          phone: this.userInfo.phone
        }
        
        // 保存回存储
        uni.setStorageSync('registeredUsers', allUsers)
      }
      
      // 更新部门成员信息
      this.updateDepartmentMembers()
    },
    updateDepartmentMembers() {
      if (!this.userInfo.department) return
      
      // 获取部门成员列表
      let departmentMembers = uni.getStorageSync('departmentMembers') || {}
      
      // 如果部门不存在，创建新部门
      if (!departmentMembers[this.userInfo.department]) {
        departmentMembers[this.userInfo.department] = []
      }
      
      // 构建成员信息
      const memberInfo = {
        userId: this.userInfo.userId,
        username: this.userInfo.username,
        name: this.userInfo.name,
        role: this.userInfo.role,
        email: this.userInfo.email,
        phone: this.userInfo.phone
      }
      
      // 将用户添加到新部门中
      departmentMembers[this.userInfo.department].push(memberInfo)
      
      // 保存部门成员列表
      uni.setStorageSync('departmentMembers', departmentMembers)
      
      console.log(`用户已添加到${this.userInfo.department}`)
    },
    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      })
    },
    showLogoutConfirm() {
      uni.showModal({
        title: '确认注销',
        content: '您确定要注销用户吗？',
        success: (res) => {
          if (res.confirm) {
            this.logout()
          }
        }
      })
    },
    logout() {
      // 获取当前用户信息
      const currentUserId = this.userInfo.userId
      const currentUsername = this.userInfo.username
      
      // 获取所有用户
      const allUsers = uni.getStorageSync('registeredUsers') || []
      
      // 找到并删除当前用户
      const updatedUsers = allUsers.filter(user => user.id !== currentUserId)
      
      // 保存更新后的用户列表
      uni.setStorageSync('registeredUsers', updatedUsers)
      
      // 更新部门成员列表
      this.removeUserFromDepartment(currentUserId)
      
      // 将用户名添加到已注销用户列表中
      const deactivatedUsers = uni.getStorageSync('deactivatedUsers') || []
      if (!deactivatedUsers.includes(currentUsername)) {
        deactivatedUsers.push(currentUsername)
        uni.setStorageSync('deactivatedUsers', deactivatedUsers)
      }
      
      // 清除当前用户信息
      uni.removeStorageSync('userInfo')
      
      // 显示注销成功
      uni.showToast({
        title: '注销成功',
        icon: 'success'
      })
      
      // 返回登录页面
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }, 1500)
    },
    removeUserFromDepartment(userId) {
      // 获取部门成员列表
      let departmentMembers = uni.getStorageSync('departmentMembers') || {}
      
      // 遍历所有部门，移除用户
      Object.keys(departmentMembers).forEach(dept => {
        departmentMembers[dept] = departmentMembers[dept].filter(member => member.userId !== userId)
      })
      
      // 保存更新后的部门成员列表
      uni.setStorageSync('departmentMembers', departmentMembers)
    },
    removeUserFromAllDepartments() {
      // 获取部门成员列表
      let departmentMembers = uni.getStorageSync('departmentMembers') || {}
      
      // 从所有部门中移除当前用户
      Object.keys(departmentMembers).forEach(dept => {
        departmentMembers[dept] = departmentMembers[dept].filter(member => member.userId !== this.userInfo.userId)
      })
      
      // 保存更新后的部门成员列表
      uni.setStorageSync('departmentMembers', departmentMembers)
      
      console.log('已从所有部门中移除用户')
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

.profile-card {
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
}

.form {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.input[disabled] {
  background-color: #f0f0f0;
  color: #666;
}

.picker {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
}

.placeholder {
  color: #999;
}

.actions {
  margin-top: 40rpx;
}

.btn-save {
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

.btn-logout {
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