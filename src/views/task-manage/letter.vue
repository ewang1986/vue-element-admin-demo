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
          <span>{{ getGnameByGid(scope.row.Gid) }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="只发新增">
        <template slot-scope="scope">
          <span>  {{
            (() => {
              switch (JSON.parse(scope.row.Config).send_only) {
              case 1:
                return '√';
              default:
                return '';
              }
            })()
          }}</span>
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

    <!-- 弹窗创建私信任务  -->
    <el-dialog :visible.sync="visible" title="创建私信任务" width="60%">
      <el-form :model="letterTask" label-width="auto">
        <el-form-item label="账号分组：">
          <el-select v-model="letterTask.group" placeholder="请选择">
            <el-option v-for="item in accountGroupList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="随机表情：">
          <el-select v-model="letterTask.rand_bq" placeholder="请选择">
            <el-option label="关闭" value="0" />
            <el-option label="开启" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="增量模式：">
          <el-select v-model="letterTask.send_all" placeholder="请选择">
            <el-option label="只发新增" value="0" />
            <el-option label="全量发送" value="1" />
            <el-option label="发送24H回关用户" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="私信方式：">
          <el-select v-model="letterTask.msg_type_def" placeholder="请选择">
            <el-option label="私信方式1" value="1" />
            <el-option v-show="false" label="私信方式2" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="私信模式：">
          <el-select v-model="letterTask.msg_send_type" placeholder="请选择">
            <el-option label="消息组包(改为按顺序发送多条，新模式)" value="0" />
            <el-option label="消息列表随机( 消息进行随机抽取发送，一条，老模式)" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送国家：">
          <el-select v-model="letterTask.region" placeholder="请选择">
            <el-option label="所有" value="" />
            <el-option v-for="item in country" :key="item.short" :label="item.name" :value="item.short.toLowerCase()" />
          </el-select>
        </el-form-item>
        <el-form-item label="私信数量：">
          <el-input v-model="letterTask.message_num" style="width: 200px" />
        </el-form-item>
        <el-form-item label="私信分组：">
          <el-select v-model="letterTask.rgid" placeholder="请选择" @change="getLetterListByGroupId(letterTask.rgid)">
            <el-option v-for="item in letterList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-transfer
          v-model="defaultRight"
          :data="leftData"
          :titles="['组内消息', '发送消息']"
          @change="handleTransferChange"
        />
        <el-form-item label="代理配置：">
          <el-select v-model="letterTask.proxy_id" placeholder="请选择">
            <el-option v-show="false" label="系统代理" value="-1" />
            <el-option label="固定IP" value="-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理配置：">
          <el-select v-model="letterTask.proxy_id_1" placeholder="请选择">
            <el-option v-for="item in fixedIPList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createLetterTaskSubmit">创建任务</el-button>
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
import { createTask, fetchTaskList, GetFollowSearchList, GetRecouseGroupList, GetResourceList } from '@/api/article'
import country from '@/country'

export default {
  components: { Pagination },
  data() {
    return {
      country: country,
      // 穿梭框数据源
      leftData: [],
      // 默认选中 出现在右边
      defaultRight: [],

      visible: false,
      // 创建私信任务 参数对象
      letterTask: {
        'task_type': 1,
        'version': 1,
        'msgs': []
      },
      // 账号分组数据源
      accountGroupList: [],
      // 采集分组数据源
      collBatchList: [],
      // 私信分组
      letterList: {},
      // 固定IP分组
      fixedIPList: {},
      // 创建任务
      taskData: {
        task_id: 0,
        version: 1
      },
      list: null,
      total: 0,
      listLoading: true,
      // {"task_type":1,"page":1,"pageSize":13,"pageCount":27}
      listQuery: {
        page: 1,
        pageSize: 13,
        pageCount: 27,
        task_type: 1
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
    this.getSearchList()
    // 获取私信分组
    this.getResGroupList(3)
    // 获取固定IP分组
    this.getResGroupList(4)
  },
  methods: {
    // 获取指定私信分组下的组内消息
    getLetterListByGroupId(gid) {
      const resParams = {
        'gtype': 3,
        'gid': gid,
        'pageSize': -1,
        'page': 1
      }
      GetResourceList(resParams).then(response => {
        console.log(response)
        if (response.status === 0) {
          this.leftData = response.data.map(item => {
            return {
              key: item.id,
              label: item.id + '_消息_' + item.resource_content
            }
          })
        } else {
          this.$message.error('请求异常')
        }
      })
    },
    // TODO 穿梭框事件
    handleTransferChange(value, direction, movedKeys) {
      console.log('__handleTransferChange__')
      console.log(value, direction, movedKeys)
      this.letterTask.msgs = value
    },
    // TODO 创建私信任务
    createLetterTaskSubmit() {
      console.log('__createLetterTaskSubmit__')
      createTask(this.letterTask).then(response => {
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
      this.getSearchList()
      // 获取私信分组
      this.getResGroupList(3)
      // 获取固定IP分组
      this.getResGroupList(4)
    },
    showCreateTaskWindow() {
      this.visible = true
    },
    // 动态获取账号分组名称
    getGnameByGid(gid) {
      const group = this.accountGroupList.find(item => item.id === gid)
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
            this.letterList = response.rgroup
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
