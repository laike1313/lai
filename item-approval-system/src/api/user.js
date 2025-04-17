import request from './request';

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  });
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  });
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data
  });
}

// 获取用户信息
export function getUserInfo(userId) {
  return request({
    url: `/user/info/${userId}`,
    method: 'get'
  });
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  });
}

// 获取验证码
export function getVerifyCode(email) {
  return request({
    url: `/user/verify-code?email=${email}`,
    method: 'get'
  });
} 