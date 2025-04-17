# 物品审批系统前端对接文档

## 1. 系统概述

该系统是一个基于Flowable的工作流审批系统，主要用于处理物品申请和审批流程。系统使用Spring Boot作为后端框架，Flowable作为工作流引擎，H2数据库作为开发环境的数据库。

## 2. 接口基础信息

- 基础URL: `http://localhost:8080`
- 接口前缀: `/api/process`
- 响应格式: JSON
- 统一响应格式:
  
```json
{
  "code": 200,       // 状态码：200成功，其他为失败
  "message": "操作成功", // 提示信息
  "data": {}         // 返回数据，根据接口不同而不同
}
```

## 3. 接口详情

### 3.1 启动审批流程

- **接口URL**: `/api/process/start`
- **请求方式**: POST
- **请求参数**:

```json
{
  "name": "办公电脑",        // 物品名称
  "quantity": 1,            // 物品数量
  "price": 5000.0,          // 物品价格
  "category": "办公设备",     // 物品类别
  "reason": "用于开发工作",   // 申请理由
  "applicantId": "10001",   // 申请人ID
  "applicantName": "张三"    // 申请人姓名
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "审批流程已启动",
  "data": {
    "id": 1,
    "name": "办公电脑",
    "quantity": 1,
    "price": 5000.0,
    "category": "办公设备",
    "reason": "用于开发工作",
    "applicantId": "10001",
    "applicantName": "张三",
    "applyTime": "2023-06-01 10:30:00",
    "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
    "status": 0  // 0-审批中，1-已通过，2-已拒绝
  }
}
```

### 3.2 获取我的申请列表

- **接口URL**: `/api/process/my-applies/{applicantId}`
- **请求方式**: GET
- **请求参数**: 
  - applicantId: 申请人ID (路径参数)

- **响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "办公电脑",
      "quantity": 1,
      "price": 5000.0,
      "category": "办公设备",
      "reason": "用于开发工作",
      "applicantId": "10001",
      "applicantName": "张三",
      "applyTime": "2023-06-01 10:30:00",
      "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
      "status": 0
    },
    // ...更多物品
  ]
}
```

### 3.3 获取物品详情

- **接口URL**: `/api/process/item/{id}`
- **请求方式**: GET
- **请求参数**: 
  - id: 物品ID (路径参数)

- **响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "办公电脑",
    "quantity": 1,
    "price": 5000.0,
    "category": "办公设备",
    "reason": "用于开发工作",
    "applicantId": "10001",
    "applicantName": "张三",
    "applyTime": "2023-06-01 10:30:00",
    "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
    "status": 0
  }
}
```

### 3.4 获取我的待办任务

- **接口URL**: `/api/process/my-tasks/{userId}`
- **请求方式**: GET
- **请求参数**: 
  - userId: 用户ID (路径参数)

- **响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "taskId": "89f3e5d4-8f0d-11ee-a9e0-0242ac120002",
      "taskName": "部门经理审批",
      "createTime": "2023-06-01 10:35:00",
      "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
      "applicantName": "张三",
      "itemName": "办公电脑",
      "quantity": 1,
      "price": 5000.0,
      "category": "办公设备",
      "reason": "用于开发工作"
    },
    // ...更多任务
  ]
}
```

### 3.5 获取任务详情

- **接口URL**: `/api/process/task/{taskId}`
- **请求方式**: GET
- **请求参数**: 
  - taskId: 任务ID (路径参数)

- **响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "taskId": "89f3e5d4-8f0d-11ee-a9e0-0242ac120002",
    "taskName": "部门经理审批",
    "createTime": "2023-06-01 10:35:00",
    "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
    "applicantName": "张三",
    "itemName": "办公电脑",
    "quantity": 1,
    "price": 5000.0,
    "category": "办公设备",
    "reason": "用于开发工作"
  }
}
```

### 3.6 完成任务（审批）

- **接口URL**: `/api/process/complete`
- **请求方式**: POST
- **请求参数**:

```json
{
  "taskId": "89f3e5d4-8f0d-11ee-a9e0-0242ac120002",  // 任务ID
  "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",  // 流程实例ID
  "userId": "20001",       // 审批人ID
  "userName": "李四",       // 审批人姓名
  "comment": "同意该申请",    // 审批意见
  "result": 1              // 审批结果：1-同意，2-拒绝
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "审批完成",
  "data": true
}
```

### 3.7 获取审批历史

- **接口URL**: `/api/process/history/{processInstanceId}`
- **请求方式**: GET
- **请求参数**: 
  - processInstanceId: 流程实例ID (路径参数)

- **响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "taskId": "89f3e5d4-8f0d-11ee-a9e0-0242ac120002",
      "processInstanceId": "76f8e4d3-8f0d-11ee-a9e0-0242ac120002",
      "userId": "20001",
      "userName": "李四",
      "comment": "同意该申请",
      "result": 1,
      "approvalTime": "2023-06-01 11:00:00",
      "taskName": "部门经理审批"
    },
    // ...更多审批历史
  ]
}
```

## 4. 数据模型

### 4.1 物品申请(Item)

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | Long | 物品ID |
| name | String | 物品名称 |
| quantity | Integer | 物品数量 |
| price | Double | 物品价格 |
| category | String | 物品类别 |
| reason | String | 申请理由 |
| applicantId | String | 申请人ID |
| applicantName | String | 申请人姓名 |
| applyTime | String | 申请时间 |
| processInstanceId | String | 流程实例ID |
| status | Integer | 审批状态：0-审批中，1-已通过，2-已拒绝 |

### 4.2 审批任务(TaskDTO)

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| taskId | String | 任务ID |
| taskName | String | 任务名称 |
| createTime | String | 任务创建时间 |
| processInstanceId | String | 流程实例ID |
| applicantName | String | 申请人姓名 |
| itemName | String | 物品名称 |
| quantity | Integer | 物品数量 |
| price | Double | 物品价格 |
| category | String | 物品类别 |
| reason | String | 申请理由 |

### 4.3 审批意见(ApprovalComment)

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | Long | 意见ID |
| taskId | String | 任务ID |
| processInstanceId | String | 流程实例ID |
| userId | String | 审批人ID |
| userName | String | 审批人姓名 |
| comment | String | 审批意见 |
| result | Integer | 审批结果：1-同意，2-拒绝 |
| approvalTime | String | 审批时间 |
| taskName | String | 任务名称 |

## 5. 前端对接指南

### 5.1 推荐技术栈

- Vue 3 + Vite
- Element Plus UI库
- Axios 请求库
- Vue Router
- Pinia 状态管理

### 5.2 页面建议

1. **登录页面**：用户登录系统
2. **首页/仪表盘**：展示待办任务数、已完成任务数等统计信息
3. **物品申请页面**：提交物品申请表单
4. **我的申请列表**：查看自己提交的所有申请及状态
5. **我的待办任务**：查看需要审批的任务列表
6. **审批详情页面**：查看任务详情并进行审批操作
7. **审批历史页面**：查看流程的审批历史记录

### 5.3 状态码说明

| 状态码 | 说明 |
| --- | --- |
| 200 | 操作成功 |
| 500 | 服务器内部错误 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |

### 5.4 接口调用示例(使用Axios)

```javascript
// 示例：创建API服务
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
API.interceptors.request.use(
  config => {
    // 这里可以添加token等认证信息
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
API.interceptors.response.use(
  response => {
    // 统一处理响应
    const res = response.data;
    if (res.code !== 200) {
      // 显示错误消息
      console.error(res.message);
      return Promise.reject(new Error(res.message || '操作失败'));
    }
    return res;
  },
  error => {
    console.error('网络错误:', error);
    return Promise.reject(error);
  }
);

// 示例：启动审批流程
export function startProcess(data) {
  return API.post('/process/start', data);
}

// 示例：获取我的申请列表
export function getMyApplies(applicantId) {
  return API.get(`/process/my-applies/${applicantId}`);
}

// 示例：获取我的待办任务
export function getMyTasks(userId) {
  return API.get(`/process/my-tasks/${userId}`);
}

// 示例：完成任务
export function completeTask(data) {
  return API.post('/process/complete', data);
}
```

## 6. 注意事项和建议

1. 前端需要保存用户登录状态，包括用户ID和用户名，用于发起申请和完成任务。
2. 物品申请表单需要进行必要的校验，如数量必须为正整数，价格必须为正数等。
3. 审批页面需要对审批结果进行区分显示，同意和拒绝有不同的颜色标识。
4. 在展示审批历史时，建议按时间倒序排列，最新的审批记录显示在前面。
5. 对于价格较高的物品申请，可以在UI上用醒目的颜色提示审批人注意。
6. 对接口返回的错误信息，应该友好地展示给用户。

## 7. 部署说明

1. 确保后端服务已启动并运行在正确的端口（默认8080）。
2. 前端项目构建后的静态文件可部署在任何Web服务器上。
3. 若前后端部署在不同域名/IP下，需要处理好跨域问题。
4. 建议使用环境变量来配置API的baseURL，便于不同环境的部署。 