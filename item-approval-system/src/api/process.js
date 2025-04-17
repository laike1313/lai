import request from './request';

// 启动审批流程
export function startProcess(data) {
  return request({
    url: '/process/start',
    method: 'post',
    data
  });
}

// 获取我的申请列表
export function getMyApplies(applicantId) {
  return request({
    url: `/process/my-applies/${applicantId}`,
    method: 'get'
  });
}

// 获取物品详情
export function getItemDetail(id) {
  return request({
    url: `/process/item/${id}`,
    method: 'get'
  });
}

// 获取我的待办任务
export function getMyTasks(userId) {
  return request({
    url: `/process/my-tasks/${userId}`,
    method: 'get'
  });
}

// 获取任务详情
export function getTaskDetail(taskId) {
  return request({
    url: `/process/task/${taskId}`,
    method: 'get'
  });
}

// 完成任务（审批）
export function completeTask(data) {
  return request({
    url: '/process/complete',
    method: 'post',
    data
  });
}

// 获取审批历史
export function getApprovalHistory(processInstanceId) {
  return request({
    url: `/process/history/${processInstanceId}`,
    method: 'get'
  });
} 