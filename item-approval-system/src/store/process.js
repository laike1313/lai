import { defineStore } from 'pinia';
import { getMyApplies, getMyTasks, getApprovalHistory } from '../api/process';

export const useProcessStore = defineStore('process', {
  state: () => ({
    myApplies: [],
    myTasks: [],
    approvalHistory: [],
    currentItem: null,
    currentTask: null
  }),
  
  getters: {
    pendingApplies: (state) => state.myApplies.filter(item => item.status === 0),
    approvedApplies: (state) => state.myApplies.filter(item => item.status === 1),
    rejectedApplies: (state) => state.myApplies.filter(item => item.status === 2)
  },
  
  actions: {
    // 获取我的申请列表
    async fetchMyApplies(applicantId) {
      try {
        const res = await getMyApplies(applicantId);
        if (res.code === 200) {
          this.myApplies = res.data;
          return Promise.resolve(res);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 获取我的待办任务
    async fetchMyTasks(userId) {
      try {
        const res = await getMyTasks(userId);
        if (res.code === 200) {
          this.myTasks = res.data;
          return Promise.resolve(res);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 获取审批历史
    async fetchApprovalHistory(processInstanceId) {
      try {
        const res = await getApprovalHistory(processInstanceId);
        if (res.code === 200) {
          this.approvalHistory = res.data;
          return Promise.resolve(res);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 设置当前物品
    setCurrentItem(item) {
      this.currentItem = item;
    },
    
    // 设置当前任务
    setCurrentTask(task) {
      this.currentTask = task;
    },
    
    // 清除状态
    clearState() {
      this.myApplies = [];
      this.myTasks = [];
      this.approvalHistory = [];
      this.currentItem = null;
      this.currentTask = null;
    }
  }
}); 