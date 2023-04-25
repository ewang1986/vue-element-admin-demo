const Mock = require('mockjs')

const List = []
const count = 100
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'
for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri
  }))
}

// 采集任务列表
const ListTask = []
for (let i = 0; i < 50; i++) {
  ListTask.push(Mock.mock({
    Id: '@increment',
    Uid: 1554,
    Batch: '0331第一批采集001',
    gname: '第一批采集',
    Task_Type: 4,
    Sucess_Num: '@integer(300, 5000)',
    Faild_Num: '@integer(300, 5000)',
    Version: 1,
    Config: JSON.stringify({
      coll_num: '@integer(300, 5000)',
      country: '',
      fans_max: 0,
      fans_min: 0,
      follow_max: 0,
      follow_min: 0,
      follow_time_befor: 72,
      re_use: 1,
      vedio_max: 0,
      vedio_min: 0 }),
    Gid: 0,
    Task_Status: 1,
    Task_Msg: '',
    Create_Time: +Mock.Random.date('T'),
    Update_Time: +Mock.Random.date('T')
  }))
}

// 账号分组列表
const AccountGroupList = []
for (let i = 0; i < 50; i++) {
  AccountGroupList.push(Mock.mock({
    '10': '@integer(100, 500)',
    create_time: +Mock.Random.date('T'),
    fans: '@integer(300, 5000)',
    follow: '@integer(300, 5000)',
    gname: '0322新增一批001',
    id: '@integer(100, 500)',
    update_time: +Mock.Random.date('T')
  }))
}

// 账号信息列表
const AccountList = []
for (let i = 0; i < 50; i++) {
  AccountList.push(Mock.mock({
    account_status: 11,
    batch: '100',
    create_time: +Mock.Random.date('T'),
    gname: '0323新增一批100',
    id: '@integer(1000, 5000)',
    tt_fans: '@integer(100, 500)',
    tt_follow: '@integer(100, 500)',
    tt_nickname: '@title(1, 1)',
    tt_post: '@integer(10, 50)',
    tt_uid: '7210508693817033734',
    tt_uname: '@title(1, 1)',
    update_time: +Mock.Random.date('T')
  }))
}

// 账号搜索信息列表
const AccountSearchList = []
for (let i = 0; i < 50; i++) {
  AccountSearchList.push(Mock.mock({
    account_status: 11,
    batch: '100',
    create_time: +Mock.Random.date('T'),
    gname: '0323新增一批100',
    id: '@integer(1000, 5000)',
    fans: '@integer(100, 500)',
    follow: '@integer(100, 500)',
    tt_nickname: '@title(5, 10)',
    tt_post: '@integer(10, 50)',
    tt_uid: '7210508693817033734',
    tt_uname: '@title(5, 10)',
    update_time: +Mock.Random.date('T')
  }))
}

// 私信资源列表
const ResourceList = []
for (let i = 0; i < 50; i++) {
  ResourceList.push(Mock.mock({
    account_status: 11,
    batch: '100',
    gname: '0323新增1',
    id: '@integer(1000, 5000)',
    resource_type: '@integer(4, 8)',
    resource_content: '@title(5, 20)',
    create_time: +Mock.Random.date('T'),
    update_time: +Mock.Random.date('T')
  }))
}

module.exports = [
  {
    url: '/vue-element-admin/article/list',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/article/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }, {
    // 采集任务列表
    url: '/vue-element-admin/GetTaskInfos', type: 'post', response: config => {
      console.log('__config__')
      console.log(config)
      const { page = 1, pageSize = 20 } = config.query

      const mockList = ListTask.filter(item => {
        // if (type && item.type !== type) return false
        return true
      })
      const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

      return {
        code: 20000,
        status: 0,
        data: pageList,
        count: mockList.length
      }
    }
  }, {
    // 账号分组列表
    url: '/vue-element-admin/GetAccountGroupList', type: 'post', response: config => {
      console.log('__config__')
      console.log(config)
      const { page = 1, pageSize = 20 } = config.query

      const mockList = AccountGroupList.filter(item => {
        // if (type && item.type !== type) return false
        return true
      })
      const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

      return {
        code: 20000,
        status: 0,
        data: pageList,
        count: mockList.length
      }
    }
  }, {
    // 账号信息列表
    url: '/vue-element-admin/GetAccountList', type: 'post', response: config => {
      console.log('__config__')
      console.log(config)
      const { page = 1, pageSize = 20 } = config.query

      const mockList = AccountList.filter(item => {
        // if (type && item.type !== type) return false
        return true
      })
      const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

      return {
        code: 20000,
        status: 0,
        data: pageList,
        count: mockList.length
      }
    }
  }, {
    // 账号搜索信息列表
    url: '/vue-element-admin/GetAccountSearchList', type: 'post', response: config => {
      console.log('__config__')
      console.log(config)
      const { page = 1, pageSize = 20 } = config.query

      const mockList = AccountSearchList.filter(item => {
        // if (type && item.type !== type) return false
        return true
      })
      const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

      return {
        code: 20000,
        status: 0,
        groups: pageList,
        count: mockList.length
      }
    }
  }, {
    // 私信资源列表
    url: '/vue-element-admin/GetResourceList', type: 'post', response: config => {
      console.log('__config__')
      console.log(config)
      const { page = 1, pageSize = 20 } = config.query

      const mockList = ResourceList.filter(item => {
        // if (type && item.type !== type) return false
        return true
      })
      const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

      return {
        code: 20000,
        status: 0,
        data: pageList,
        count: mockList.length
      }
    }
  }

]

