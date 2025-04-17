import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/user';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    // 如果用户已登录，添加token到请求头
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 统一处理响应
    const res = response.data;
    if (res.code !== 200) {
      // 显示错误消息
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  error => {
    // 处理网络错误
    let message = '网络错误';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录';
          // 可以在这里处理登出逻辑
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求地址不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败: ${error.response.status}`;
      }
    }
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request; 