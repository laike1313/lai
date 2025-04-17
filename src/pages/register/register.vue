<template>
  <view class="container">
    <view class="register-card">
      <view class="header">
        <text class="title">用户注册</text>
      </view>
      
      <view class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="form.username" placeholder="请输入用户名" @blur="checkUsername"/>
          <text v-if="usernameExists && form.username" class="error-tip">该用户名已被注册，请更换其他用户名</text>
          <text v-if="usernameDeactivated && form.username" class="error-tip">该用户名已被注销，不能再次使用</text>
          <text v-if="usernameAvailable && form.username" class="success-tip">用户名可用</text>
        </view>
        
        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" v-model="form.password" type="password" placeholder="请输入密码" />
        </view>
        
        <view class="form-item">
          <text class="label">确认密码</text>
          <input class="input" v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
          <text v-if="passwordError" class="error-tip">两次输入的密码不一致</text>
        </view>
        
        <view class="form-item">
          <text class="label">姓名</text>
          <input class="input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        
        <view class="form-item">
          <text class="label">选择角色</text>
          <picker @change="roleChange" :value="roleIndex" :range="roles" range-key="roleName">
            <view class="picker">
              <text v-if="selectedRole">{{selectedRole.roleName}}</text>
              <text v-else class="placeholder">请选择角色</text>
            </view>
          </picker>
          <text v-if="selectedRole" class="role-desc">{{selectedRole.description}}</text>
        </view>
        
        <view class="form-item">
          <text class="label">电子邮箱</text>
          <input class="input" v-model="form.email" placeholder="请输入电子邮箱" />
        </view>
        
        <view class="form-item">
          <text class="label">手机号码</text>
          <input class="input" v-model="form.phone" placeholder="请输入手机号码" />
        </view>
        
        <view class="form-item">
          <text class="label">所属部门</text>
          <input class="input" v-model="form.department" placeholder="请输入所属部门" />
        </view>
      </view>
      
      <view class="actions">
        <button class="btn-register" @click="handleRegister" :disabled="!formValid">注册</button>
        <view class="login-link" @click="goToLogin">已有账号？点击登录</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      usernameAvailable: true,
      usernameDeactivated: false,
      usernameExists: false,
      roleIndex: 0,
      roles: [
        // 这里应该是从后端获取的角色列表
        // 暂时使用静态数据，根据Flowable流程图更新
        {
          roleId: '1',
          roleName: '普通用户',
          description: '可以提交物品申请'
        },
        {
          roleId: '2',
          roleName: '部门一',
          description: '负责处理部门一的申请审批'
        },
        {
          roleId: '3',
          roleName: '部门二',
          description: '负责处理部门二的申请审批'
        },
        {
          roleId: '4',
          roleName: '部门三',
          description: '负责处理部门三的申请审批'
        },
        {
          roleId: '5',
          roleName: '部门四',
          description: '负责处理部门四的申请审批'
        },
        {
          roleId: '6',
          roleName: '部门五',
          description: '负责处理部门五的申请审批'
        },
        {
          roleId: '7',
          roleName: '部门六',
          description: '负责处理部门六的申请审批'
        },
        {
          roleId: '8',
          roleName: '部门分管领导',
          description: '负责各部门初审后的审批'
        },
        {
          roleId: '9',
          roleName: '行政科',
          description: '负责分管领导审批后的审批'
        },
        {
          roleId: '10',
          roleName: '行政科领导',
          description: '负责最终审批'
        }
      ],
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        roleId: '',
        email: '',
        phone: '',
        department: ''
      }
    }
  },
  computed: {
    selectedRole() {
      return this.roles[this.roleIndex] || null
    },
    passwordError() {
      if (!this.form.confirmPassword) return false
      return this.form.password !== this.form.confirmPassword
    },
    formValid() {
      return this.form.username && 
             this.form.password && 
             this.form.password === this.form.confirmPassword && 
             this.form.name && 
             this.selectedRole && 
             this.usernameAvailable && 
             !this.usernameDeactivated && 
             !this.usernameExists
    }
  },
  onLoad() {
    // 获取角色列表
    this.loadRoles()
  },
  onShow() {
    // 每次页面显示时更新用户名检查
    if (this.form.username) {
      this.checkUsername()
    }
  },
  watch: {
    // 监听用户名变化，实时检查
    'form.username': function(newVal) {
      if (newVal) {
        this.checkUsername()
      } else {
        // 用户名为空时重置状态
        this.usernameAvailable = true
        this.usernameDeactivated = false
        this.usernameExists = false
      }
    }
  },
  methods: {
    loadRoles() {
      // 实际项目中应该从后端加载角色列表
      // 这里使用示例数据
      uni.showLoading({
        title: '加载中...'
      })
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading()
        // 在实际项目中应该使用下面的代码获取角色列表
        // uni.request({
        //   url: 'http://localhost:8080/api/user/roles',
        //   method: 'GET',
        //   success: function(res) {
        //     if (res.data.code === 200) {
        //       this.roles = res.data.data.roles
        //     } else {
        //       this.showToast(res.data.message || '获取角色列表失败')
        //     }
        //   },
        //   fail: function() {
        //     this.showToast('网络错误，请重试')
        //   },
        //   complete: function() {
        //     uni.hideLoading()
        //   }
        // })
      }, 500)
    },
    roleChange(e) {
      this.roleIndex = e.detail.value
      if (this.selectedRole) {
        this.form.roleId = this.selectedRole.roleId
      }
    },
    checkUsername() {
      if (!this.form.username) return
      
      uni.showLoading({
        title: '检查中...'
      })
      
      // 获取已注册用户列表
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      console.log('检查用户名可用性:', this.form.username, '已注册用户数量:', registeredUsers.length)
      
      // 获取预设用户列表（与登录页面保持一致）
      const presetUsers = [
        { username: 'zhangsan' },
        { username: 'bumen1' },
        { username: 'bumen2' },
        { username: 'bumen3' },
        { username: 'bumen4' },
        { username: 'bumen5' },
        { username: 'bumen6' },
        { username: 'fgleader' },
        { username: 'xingzheng' },
        { username: 'xzleader' }
      ]
      
      // 检查用户名是否已被注册 (包括预设用户和已注册用户)
      const registeredUser = registeredUsers.find(user => user.username === this.form.username)
      const presetUser = presetUsers.find(user => user.username === this.form.username)
      
      const isUsernameTaken = registeredUser !== undefined || presetUser !== undefined
      
      if (registeredUser) {
        console.log('用户名已存在于已注册用户中:', this.form.username)
      }
      if (presetUser) {
        console.log('用户名已存在于预设用户中:', this.form.username)
      }
      
      // 获取已注销用户列表
      const deactivatedUsers = uni.getStorageSync('deactivatedUsers') || []
      
      // 检查用户名是否已被注销
      const isUsernameDeactivated = deactivatedUsers.includes(this.form.username)
      if (isUsernameDeactivated) {
        console.log('用户名已被注销:', this.form.username)
      }
      
      // 设置用户名可用状态
      this.usernameAvailable = !isUsernameTaken && !isUsernameDeactivated
      
      // 设置具体的错误类型
      if (isUsernameDeactivated) {
        this.usernameDeactivated = true
        this.usernameExists = false
      } else if (isUsernameTaken) {
        this.usernameDeactivated = false
        this.usernameExists = true
      } else {
        this.usernameDeactivated = false
        this.usernameExists = false
      }
      
      uni.hideLoading()
      
      // 如果用户名不可用，显示提示
      if (!this.usernameAvailable) {
        const message = this.usernameDeactivated ? 
          '该用户名已被注销，不能再次使用' : 
          '该用户名已被注册，请更换其他用户名'
        
        uni.showToast({
          title: message,
          icon: 'none',
          duration: 2000
        })
      }
    },
    handleRegister() {
      if (!this.formValid) {
        this.showToast('请完成所有必填项')
        return
      }
      
      // 再次检查用户名是否可用
      this.checkUsername()
      
      // 如果用户名不可用，停止注册
      if (!this.usernameAvailable) {
        return
      }
      
      uni.showLoading({
        title: '注册中...'
      })
      
      const data = {
        username: this.form.username,
        password: this.form.password,
        name: this.form.name,
        roleId: this.form.roleId,
        email: this.form.email,
        phone: this.form.phone,
        department: this.form.department
      }
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading()
        
        // 保存注册用户到本地存储
        const registeredUsers = uni.getStorageSync('registeredUsers') || []
        
        // 创建新用户对象，确保与login页面中的用户结构一致
        const newUser = {
          id: 'user-' + Date.now(),
          username: this.form.username,
          password: this.form.password,
          name: this.form.name || this.form.username, // 确保有名称
          role: this.selectedRole.roleName, // 使用角色名称而不是ID
          email: this.form.email || '',
          phone: this.form.phone || '',
          department: this.form.department || ''
        }
        
        console.log('注册新用户:', JSON.stringify(newUser))
        
        // 添加到本地存储
        registeredUsers.push(newUser)
        uni.setStorageSync('registeredUsers', registeredUsers)
        
        // 更新已注册用户名列表 (可选，用于提高性能)
        const registeredUsernames = uni.getStorageSync('registeredUsernames') || []
        if (!registeredUsernames.includes(this.form.username)) {
          registeredUsernames.push(this.form.username)
          uni.setStorageSync('registeredUsernames', registeredUsernames)
        }
        
        // 注册成功
        uni.showModal({
          title: '注册成功',
          content: '您已成功注册，现在可以登录系统',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              this.goToLogin()
            }
          }.bind(this)
        })
        
        // 在实际项目中应该使用下面的代码提交注册
        // uni.request({
        //   url: 'http://localhost:8080/api/user/register',
        //   method: 'POST',
        //   data: data,
        //   success: function(res) {
        //     if (res.data.code === 200) {
        //       // 保存到本地存储
        //       const registeredUsers = uni.getStorageSync('registeredUsers') || []
        //       const newUser = {
        //         id: res.data.data.userId,
        //         username: this.form.username,
        //         password: this.form.password,
        //         name: res.data.data.name,
        //         role: res.data.data.role,
        //         email: this.form.email,
        //         phone: this.form.phone,
        //         department: this.form.department
        //       }
        //       registeredUsers.push(newUser)
        //       uni.setStorageSync('registeredUsers', registeredUsers)
        //       
        //       uni.showModal({
        //         title: '注册成功',
        //         content: '您已成功注册，现在可以登录系统',
        //         showCancel: false,
        //         success: function(modalRes) {
        //           if (modalRes.confirm) {
        //             this.goToLogin()
        //           }
        //         }.bind(this)
        //       })
        //     } else {
        //       this.showToast(res.data.message || '注册失败')
        //     }
        //   }.bind(this),
        //   fail: function() {
        //     this.showToast('网络错误，请重试')
        //   }.bind(this),
        //   complete: function() {
        //     uni.hideLoading()
        //   }
        // })
      }, 1500)
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
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

.register-card {
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

.role-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.error-tip {
  font-size: 24rpx;
  color: #ff3b30;
  margin-top: 10rpx;
  display: block;
}

.success-tip {
  font-size: 24rpx;
  color: #007aff;
  margin-top: 10rpx;
  display: block;
}

.actions {
  margin-top: 40rpx;
}

.btn-register {
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

.btn-register[disabled] {
  background-color: #ccc;
  color: #fff;
}

.login-link {
  font-size: 28rpx;
  color: #007aff;
  text-align: center;
  margin-top: 30rpx;
}
</style> 