import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}

/**
 * 获取任务列表
 */
export function fetchTaskList(data) {
  return request({
    url: '/vue-element-admin/GetTaskInfos',
    method: 'post',
    data
  })
}

/**
 * 获取私信资源列表
 */
export function GetResourceList(data) {
  return request({
    url: '/vue-element-admin/GetResourceList',
    method: 'post',
    data
  })
}

/**
 * 获取账号信息列表
 */
export function GetAccountList(data) {
  return request({
    url: '/vue-element-admin/GetAccountList',
    method: 'post',
    data
  })
}

/**
 * 获取RecouseGroup列表
 */
export function GetRecouseGroupList(data) {
  return request({
    url: '/vue-element-admin/GetRecouseGroupList',
    method: 'post',
    data
  })
}

/**
 * 添加资源
 */
export function AddResource(data) {
  return request({
    url: '/AddResource',
    method: 'post',
    data
  })
}

/**
 * 创建任务
 */
export function createTask(data) {
  return request({
    url: '/CreateTask',
    method: 'post',
    data
  })
}

/**
 * 获取账号分组列表
 */
export function GetAccountGroupList(data) {
  return request({
    url: '/vue-element-admin/GetAccountGroupList',
    method: 'post',
    data
  })
}

/**
 * 获取账号搜索信息列表
 */
export function GetAccountSearchList() {
  return request({
    url: '/vue-element-admin/GetAccountSearchList',
    method: 'post'
  })
}

/**
 * 获取账号FollowSearch列表
 */
export function GetFollowSearchList() {
  return request({
    url: '/vue-element-admin/GetFollowSearchList',
    method: 'get'
  })
}

/**
 * 删除分组
 */
export function DeleteGroup(data) {
  return request({
    url: '/DeleteGroup',
    method: 'post',
    data
  })
}

/**
 * 导入账号接口
 */
export function UploadAccount(data) {
  return request({
    url: '/UploadAccount',
    method: 'post',
    data
  })
}

/**
 * 添加分组
 */
export function CreateGroup(data) {
  return request({
    url: '/CreateGroup',
    method: 'post',
    data
  })
}

