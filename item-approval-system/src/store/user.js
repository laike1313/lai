import { defineStore } from 'pinia';
import { login as userLogin, getUserInfo } from '../api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem('userId') || '',
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    roles: JSON.parse(localStorage.getItem('roles') || '[]')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role) => state.roles.includes(role)
  },
  
  actions: {
    // 登录
    async login(userInfo) {
      try {
        const res = await userLogin(userInfo);
        if (res.code === 200) {
          const { token, userId, username, roles } = res.data;
          this.userId = userId;
          this.token = token;
          this.username = username;
          this.roles = roles;
          
          localStorage.setItem('userId', userId);
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          localStorage.setItem('roles', JSON.stringify(roles));
          
          return Promise.resolve(res);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 登出
    logout() {
      this.userId = '';
      this.token = '';
      this.username = '';
      this.roles = [];
      
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      if (!this.userId) return Promise.reject('未登录');
      
      try {
        const res = await getUserInfo(this.userId);
        if (res.code === 200) {
          const { username, roles } = res.data;
          this.username = username;
          this.roles = roles;
          
          localStorage.setItem('username', username);
          localStorage.setItem('roles', JSON.stringify(roles));
          
          return Promise.resolve(res);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
}); 