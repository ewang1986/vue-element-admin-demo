<template>
  <div class="app-container">
    <el-button type="primary" @click="showCreateTaskWindow">创建采集任务</el-button>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top: 15px">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.Id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="备注">
        <template slot-scope="scope">
          <span>{{ scope.row.Batch }}</span>
        </template>
      </el-table-column>

      <el-table-column v-show="false" width="120px" align="center" label="过滤条件" />

      <el-table-column v-show="false" width="100px" label="国家代码" />

      <el-table-column class-name="status-col" label="时间限制" width="110">
        <template slot-scope="scope">
          <span>
            {{ JSON.parse(scope.row.Config).follow_time_befor }}
          </span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="采集数量">
        <template slot-scope="scope">
          <span>{{ JSON.parse(scope.row.Config).coll_num }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="任务状态" width="110">
        <template slot-scope="scope">
          <span>  {{
            (() => {
              switch (scope.row.Task_Status) {
              case 1:
                return '采集中';
              default:
                return '未知状态';
              }
            })()
          }}</span>

        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="待使用采集数量">
        <template slot-scope="scope">
          <span>{{ scope.row.Sucess_Num }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="已使用采集数量">
        <template slot-scope="scope">
          <span>{{ scope.row.Faild_Num }}</span>
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
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="showFormDialog(scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="stopGather">停止采集</el-dropdown-item>
              <el-dropdown-item @click.native="reStartGather(scope.row.Id)">重新采集</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 弹窗创建采集任务  -->
    <el-dialog :visible.sync="visible" title="创建采集任务" width="30%">
      <el-form :model="taskData" label-width="auto">
        <el-form-item label="采集备注：">
          <el-input v-model="taskData.batch" />
        </el-form-item>
        <el-form-item label="关注范围：">
          <el-row>
            <el-col :span="11">
              <el-input v-model="taskData.follow_min" />
            </el-col>
            <el-col :span="2" style="text-align: center">
              至
            </el-col>
            <el-col :span="11">
              <el-input v-model="taskData.follow_max" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="粉丝范围：">
          <el-col :span="11">
            <el-input v-model="taskData.fans_min" />
          </el-col>
          <el-col :span="2" style="text-align: center">
            至
          </el-col>
          <el-col :span="11">
            <el-input v-model="taskData.fans_max" />
          </el-col>
        </el-form-item>
        <el-form-item label="发视频数：">
          <el-col :span="11">
            <el-input v-model="taskData.vedio_min" />
          </el-col>
          <el-col :span="2" style="text-align: center">
            至
          </el-col>
          <el-col :span="11">
            <el-input v-model="taskData.vedio_max" />
          </el-col>
        </el-form-item>
        <el-form-item label="国家代码：">
          <el-select v-model="taskData.country" placeholder="请选择">
            <el-option label="所有" value="" />
            <el-option v-for="item in country" :key="item.short" :label="item.name" :value="item.short.toLowerCase()" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集数量：">
          <el-input v-model="taskData.coll_num" />
        </el-form-item>
        <el-form-item label="时间限制：">
          <el-input v-model="taskData.follow_time_befor" />
        </el-form-item>
        <el-form-item label="使用方式：">
          <el-select v-model="taskData.task_type" placeholder="请选择">
            <el-option label="只用一次" value="4" />
            <el-option label="采集池循环" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集目标：">
          <el-input v-model="taskData.tagert_uname" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createTaskSubmit">创建任务</el-button>
      </div>
    </el-dialog>
    <!-- 弹窗修改采集任务  -->
    <el-dialog v-show="false" title="修改采集任务" width="30%">
      <el-form :model="dialogFormData" label-width="80px">
        <el-form-item label="任务编号">
          <el-input v-model="dialogFormData.Id" />
        </el-form-item>
        <el-form-item label="采集备注">
          <el-input v-model="dialogFormData.Batch" />
        </el-form-item>
        <el-form-item label="下拉选择框">
          <el-select v-model="dialogFormData.select" placeholder="请选择">
            <el-option label="选项1" value="1" />
            <el-option label="选项2" value="2" />
            <el-option label="选项3" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="文本域">
          <el-input v-model="dialogFormData.textarea" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { createTask } from '@/api/article'
import { fetchTaskList } from '@/api/article'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import country from '@/country'

export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    // TODO 转换显示
    taskStatusFilter(value) {
      const statusMap = {
        0: '未开始',
        1: '采集中',
        2: '已完成',
        3: '已取消'
      }
      if (typeof value === 'number') {
        return statusMap[value] || ''
      } else {
        return value
      }
    }
  },
  data() {
    return {
      country: country,
      visible: false,
      form: {
        input: '',
        select: '',
        textarea: ''
      },
      // 创建任务
      taskData: {
        task_id: 0,
        version: 1
      },
      // 修改任务
      dialogFormData: {},

      list: null,
      total: 0,
      listLoading: true,
      // TODO 参数配置 {"task_type":4,"page":1,"pageSize":50}
      listQuery: {
        page: 1,
        pageSize: 13,
        task_type: 4
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
  },
  methods: {
    showCreateTaskWindow() {
      this.visible = true
    },
    createTaskSubmit() {
      const that = this
      console.log('__createTask__')
      console.log(this.taskData)
      createTask(this.taskData).then(response => {
        console.log(response)
        if (response.status === 0) {
          console.log('创建成功')
          this.visible = false
          that.getList()
        } else {
          that.$message.error(response.msg)
        }
      })
    },
    showFormDialog(row) {
      console.log('__showFormDialog__')
      this.dialogFormData = row
    },
    submitForm() {
      // 提交表单
      console.log('__submitForm__')
      this.visible = false
    },
    stopGather() {
      console.log('__stopGather__')
    },
    reStartGather(Id) {
      console.log('__reStartGather__')
      console.log(Id)
    },
    getList() {
      this.listLoading = true
      fetchTaskList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.count
        // console.log('__list_data_mark__')
        // console.log(this.list)
        console.log(this.total)
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
