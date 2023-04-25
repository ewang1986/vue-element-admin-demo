<template>
  <div class="app-container">
    <el-form :model="groupData" label-width="auto">
      <div style="display: flex; align-items: center;">
        <el-col :span="3">
          <el-input v-model="groupData.gname" />
        </el-col>
        <el-button type="info" @click="addGroupSubmit">添加分组</el-button>
        <el-button type="primary" @click="showImportAccountWindow">导入账号</el-button>
      </div>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top: 15px">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="分组名字">
        <template slot-scope="scope">
          <span>{{ scope.row.gname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="账号数量">
        <template slot-scope="scope">
          <span>{{ scope.row["10"] }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="关注/粉丝">
        <template slot-scope="scope">
          <span>{{ scope.row.follow }}/{{ scope.row.fans }}</span>
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
              <el-dropdown-item v-show="false" @click.native="showFormDialog(scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item v-show="false" @click.native="stopGather">停止采集</el-dropdown-item>
              <el-dropdown-item @click.native="deleteOneGroup(scope.row.id)">删除分组</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :visible.sync="visible" title="导入账号" width="30%">
      <el-form :model="accountData" label-width="auto">

        <el-form-item label="账号分组：">
          <el-select v-model="accountData.account_group" placeholder="请选择">
            <el-option v-for="gname in accountGroupList" :key="gname" :label="gname" :value="gname" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件格式：">
          <el-select v-model="accountData.file_type" placeholder="请选择">
            <el-option label="IOS-压缩包格式(zip)" value="1" />
            <el-option label="Android-单文本格式(txt)" value="2" />
            <el-option label="Web账号(txt)" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号备注：">
          <el-input v-model="accountData.batch" />
        </el-form-item>
        <el-upload
          class="upload-demo"
          drag
          action="http://ui.ziqiao.top/pai/UploadFile"
          multiple
          :headers="{ Authorization: 'Bearer ' + token }"
          @success="handleUploadSuccess"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传txt/zip文件，且不超过20Mb</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importAccountSubmit">上传数据</el-button>
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
import { CreateGroup, DeleteGroup, GetAccountGroupList, GetAccountSearchList, UploadAccount } from '@/api/article'
import { getToken } from '@/utils/auth'

export default {
  components: { Pagination },
  data() {
    return {
      token: '',
      visible: false,
      // 上传文件 http://www.ttstar.cyou/UploadFile  file: （二进制） {"file": "1681197987445008951_小程序规则_txt","status": 0}
      // 导入账号 {"account_group":"测试分组1","file_type":"3","batch":"测试备注1","file":"1681197987445008951_小程序规则_txt"}
      accountData: {
        account_group: '',
        file: ''
      },
      // 账号分组列表数据源
      accountGroupList: [],
      // 添加分组
      groupData: {},
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        limit: 20
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
    this.getSearchList()
    this.token = getToken()
  },
  methods: {
    // 添加分组
    addGroupSubmit() {
      const that = this
      CreateGroup(this.groupData).then(response => {
        console.log('__create_group__')
        console.log(response)
        if (response.status === 0) {
          // 刷新页面
          that.$message.success(response.msg)
          that.getList()
          that.getSearchList()
        } else {
          that.$message.error(response.msg)
        }
      })
    },
    // 显示导入账号窗口
    showImportAccountWindow() {
      this.visible = true
    },
    // 导入账号
    importAccountSubmit() {
      UploadAccount(this.accountData).then(response => {
        console.log(response)
        this.visible = false
        this.$message.success(response.msg)
      })
    },
    // 账号文件上传成功回调方法
    handleUploadSuccess(response, file, fileList) {
      // 处理上传成功后的逻辑
      console.log('__handle_upload_success__')
      if (response.status === 0) {
        this.accountData.file = response.file
      } else {
        this.$message.error('文件上传失败！')
      }
      console.log(response)
      console.log(file)
      console.log(fileList)
    },
    // 获取账号分组列表
    getList() {
      this.listLoading = true
      GetAccountGroupList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.count
        // console.log('__list_data_mark__')
        // console.log(this.list)
        this.listLoading = false
      })
    },
    // 获取账号搜索辅助信息列表
    getSearchList() {
      GetAccountSearchList().then(response => {
        this.accountGroupList = response.groups.map(group => group.gname)
        console.log(this.accountGroupList)
      })
    },
    // 删除分组 {"gid":33116,"status":-1}
    deleteOneGroup(id) {
      const that = this
      const deleteGroupParams = {
        'gid': id,
        'status': -1
      }
      DeleteGroup(deleteGroupParams).then(response => {
        // {"msg": "删除分组成功","status": 0}
        console.log(response)
        that.getList()
        that.getSearchList()
        that.$message.success(response.msg)
      })
    }
  }
}
</script>
