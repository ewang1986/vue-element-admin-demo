<template>
  <div class="app-container">
    <el-button type="primary" @click="showCreateTaskWindow">创建任务</el-button>
    <el-button type="primary" @click="refreshPage">刷新页面数据</el-button>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top: 15px">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.Id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="账号分组">
        <template slot-scope="scope">
          <span v-show="false">{{ getGnameByGid(scope.row.Gid) }}</span>
          <span>{{ scope.row.gname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="采集数据">
        <template slot-scope="scope">
          <span v-show="false">{{ getCollByFollowBatch(JSON.parse(scope.row.Config).follow_batch) }}</span>
          <span>{{ scope.row.gname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="成功数量">
        <template slot-scope="scope">
          <span>{{ scope.row.Sucess_Num }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="失败数量">
        <template slot-scope="scope">
          <span>{{ scope.row.Faild_Num }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="任务状态">
        <template slot-scope="scope">
          <span>  {{
            (() => {
              switch (scope.row.Task_Status) {
              case 1:
                return '执行中';
              case 10:
                return '执行完成';
              case 13:
                return '任务超时';
              case 21:
                return '停止';
              default:
                return '未知状态';
              }
            })()
          }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="关注限制数">
        <template slot-scope="scope">
          <span v-show="false">{{ JSON.parse(scope.row.Config).follow_limit }}</span>
          <span>200</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.Create_Time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{ scope.row.Update_Time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-dropdown>
            <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right" /></span>
            <el-dropdown-menu v-show="false" slot="dropdown">
              <el-dropdown-item @click.native="showFormDialog(scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="stopGather">停止采集</el-dropdown-item>
              <el-dropdown-item @click.native="reStartGather(scope.row.Id)">重新采集</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 弹窗创建关注任务  -->
    <el-dialog :visible.sync="visible" title="创建关注任务" width="30%">
      <el-form :model="followTask" label-width="auto">
        <el-form-item label="账号分组：">
          <el-select v-model="followTask.group" placeholder="请选择">
            <el-option v-for="item in accountGroupList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集分组：">
          <el-select v-model="followTask.coll_batch" placeholder="请选择">
            <el-option v-for="item in collBatchList" :key="item.id" :label="item.batch" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关注数量：">
          <el-input v-model="followTask.follow_num" style="width: 200px" />
        </el-form-item>
        <el-form-item label="代理配置：">
          <el-select v-model="followTask.proxy_id" placeholder="请选择">
            <el-option v-show="false" label="系统代理" value="-1" />
            <el-option label="固定IP" value="-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理配置：">
          <el-select v-model="followTask.proxy_id_1" placeholder="请选择">
            <el-option v-for="item in fixedIPList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createFollowTaskSubmit">创建任务</el-button>
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
import { createTask, fetchTaskList, GetFollowSearchList, GetRecouseGroupList } from '@/api/article'

export default {
  components: { Pagination },
  data() {
    return {
      visible: false,
      // 关注任务 {"task_type":3,"version":1,"group":33123,"coll_batch":733758,
      // "follow_num":"150","proxy_id":"-1","proxy_id_1":17238,"task_proxy_region":""}
      followTask: {
        'task_type': 3,
        'version': 1,
        'proxy_id': '-2'
      },
      // 固定IP分组
      fixedIPList: {},
      // 账号分组数据源
      accountGroupList: [],
      // 采集分组数据源
      collBatchList: [],
      // 创建任务
      taskData: {
        task_id: 0,
        version: 1
      },
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 13,
        pageCount: 41,
        task_type: 3
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
    // this.getSearchList()
    // this.getResGroupList(4)
  },
  methods: {
    // TODO 创建关注任务 {"task_type":3,"version":1,"group":33123,"coll_batch":733758,"follow_num":"150",
    //  "proxy_id":"-1","proxy_id_1":17238,"task_proxy_region":""}
    createFollowTaskSubmit() {
      console.log('__createFollowTaskSubmit__')
      createTask(this.followTask).then(response => {
        console.log(response)
        if (response.status === 0) {
          console.log('创建关注任务成功')
          this.visible = false
          this.refreshPage()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    refreshPage() {
      this.getList()
      // this.getSearchList()
      // this.getResGroupList(4)
    },
    showCreateTaskWindow() {
      this.visible = true
    },
    // 动态获取账号分组名称
    getGnameByGid(gid) {
      const group = this.accountGroupList.find(item => item.id === gid)// 使用find()方法查找具有特定id的对象
      // 如果找到了对象，则返回gname属性，否则返回空字符串
      return group ? group.gname : ''
    },
    // 动态获取采集数据名称
    getCollByFollowBatch(follow_batch) {
      const collBatch = this.collBatchList.find(item => item.id === follow_batch)
      return collBatch ? collBatch.batch : ''
    },
    // GetTaskInfos
    getList() {
      this.listLoading = true
      fetchTaskList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        console.log(response)
        this.listLoading = false
      })
    },
    // 获取账号搜索辅助信息列表
    getSearchList() {
      GetFollowSearchList().then(response => {
        console.log(this.accountGroupList)
        this.accountGroupList = response.group.map(({ gname, id }) => ({ gname, id }))
        this.collBatchList = response.batch
      })
    },
    // TODO 获取资源列表 两次请求传参不一样，返回数据类别也不一样
    getResGroupList(gtype) {
      const params = {
        'gtype': gtype
      }
      GetRecouseGroupList(params).then(response => {
        if (response.status === 0) {
          if (gtype === 3) {
            // this.letterList = response.rgroup
          } else {
            this.fixedIPList = response.rgroup
          }
        } else {
          this.$message.error('请求异常')
        }
      })
    }
  }
}
</script>
