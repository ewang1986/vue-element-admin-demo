<template>
  <div class="app-container">
    <el-button v-show="false" type="primary" @click="showCreateTaskWindow">导入账号</el-button>
    <el-button type="primary" @click="showAccountRefreshWindow">账号数据刷新</el-button>
    <el-button type="primary" @click="refreshPage">刷新页面数据</el-button>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top: 15px">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_uname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="uid">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_uid }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="昵称">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_nickname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="关注数">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_follow }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="粉丝数">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_fans }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="视频数">
        <template slot-scope="scope">
          <span>{{ scope.row.tt_post }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="账号状态">
        <template slot-scope="scope">
          <span v-if="false">{{ scope.row.account_status }}</span>
          <span>  {{
            (() => {
              switch (scope.row.account_status) {
              case 10:
                return '正常';
              case 11:
                return '失效';
              default:
                return '';
              }
            })()
          }}</span>

        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="批次">
        <template slot-scope="scope">
          <span>{{ scope.row.batch }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="分组">
        <template slot-scope="scope">
          <span>{{ scope.row.gname }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-dropdown>
            <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right" /></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="showFormDialog(scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="stopGather">停止采集</el-dropdown-item>
              <el-dropdown-item @click.native="reStartGather(scope.row.Id)">重新采集</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 弹窗同步账号  -->
    <el-dialog :visible.sync="account_refresh_window_visible" title="同步账号" width="30%">
      <el-form :model="syncAccount" label-width="auto">
        <el-form-item label="账号分组：">
          <el-select v-model="syncAccount.group" placeholder="请选择">
            <el-option v-for="item in accountGroupList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="代理配置：">
          <el-select v-model="syncAccount.proxy_id" placeholder="请选择">
            <el-option label="系统代理" value="-1" />
            <el-option v-show="false" label="固定IP" value="-2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="accountDataRefreshSubmit">同步数据</el-button>
      </div>
    </el-dialog>

    <!-- 弹窗创建采集任务  -->
    <el-dialog :visible.sync="visible" title="创建采集任务" width="30%">
      <el-form :model="taskData" label-width="auto">
        <el-form-item label="使用方式：">
          <el-select v-model="taskData.task_type" placeholder="请选择">
            <el-option label="只用一次" value="4" />
            <el-option label="采集池循环" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集目标：">
          <el-input v-model="taskData.batch" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createTaskSubmit">创建任务</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: justify;
  line-height: 1.5;
}
</style>
<script>
import Pagination from '@/components/Pagination/index.vue'
import { createTask, GetAccountList, GetAccountSearchList, GetRecouseGroupList } from '@/api/article'

export default {
  components: { Pagination },
  data() {
    return {
      visible: false,
      account_refresh_window_visible: false,
      // 另类的创建任务，同一个接口，不同的参数名 默认系统代理{"task_type":2,"version":1,"group":33123,"proxy_id":"-1"}
      syncAccount: {
        'task_type': 2,
        'version': 1,
        'group': 33123,
        'proxy_id': '-1'
      },
      // 账号分组列表数据源
      accountGroupList: {},
      recouseGroupList: {},
      taskData: {
        'task_type': 2,
        'batch': '',
        'version': 1
      },
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 13,
        pageCount: 320
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
    this.getSearchList()
  },
  methods: {
    showCreateTaskWindow() {
      this.visible = true
    },
    // 账号数据刷新弹出窗口
    showAccountRefreshWindow() {
      this.account_refresh_window_visible = true
    },
    // 账号数据刷新  同步数据  固定IP {"task_type":2,"version":1,"group":33123,"proxy_id":"-2","proxy_id_1":17238}
    // 系统代理 {"task_type":2,"version":1,"group":33123,"proxy_id":"-1"}
    accountDataRefreshSubmit() {
      // createTask(this.syncAccount).then(response => {
      //   console.log(response)
      //   if (response.status === 0) {
      //     console.log('创建成功')
      //     this.account_refresh_window_visible = false
      //     this.refreshPage()
      //   } else {
      //     this.$message.error(response.msg)
      //   }
      // })
    },
    // 刷新页面数据
    refreshPage() {
      this.getList()
      this.getSearchList()
      // this.getResGroupList()
    },
    getList() {
      this.listLoading = true
      GetAccountList(this.listQuery).then(response => {
        console.log(response)
        this.listLoading = false
        if (response.status === 0) {
          this.list = response.data
          this.total = response.count
        } else {
          this.$message.error('请求异常')
        }
      })
    },
    getResGroupList() {
      const recouseGroupParams = { 'gtype': 4 }
      GetRecouseGroupList(recouseGroupParams).then(response => {
        if (response.status === 0) {
          this.recouseGroupList = response.rgroup
        } else {
          this.$message.error('请求异常')
        }
      })
    },
    // 获取账号搜索辅助信息列表
    getSearchList() {
      GetAccountSearchList().then(response => {
        this.accountGroupList = response.groups.map(({ gname, id }) => ({ gname, id }))
        console.log(this.accountGroupList)
      })
    }
  }
}
</script>
