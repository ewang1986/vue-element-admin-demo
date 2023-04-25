<template>
  <div class="app-container">
    <el-button type="primary" @click="showAddResWindow">添加资源</el-button>
    <el-button type="primary" @click="refreshPage">刷新页面数据</el-button>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%; margin-top: 15px">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="分组名字">
        <template slot-scope="scope">
          <span v-show="false">{{ getGnameByGid(scope.row.gid) }}</span>
          <span>{{ scope.row.gname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="资源类型">
        <template slot-scope="scope">
          <span>  {{
            (() => {
              switch (scope.row.resource_type) {
              case 4:
                return '消息';
              case 6:
                return '链接';
              case 7:
                return '名片';
              case 8:
                return '视频';
              default:
                return '未知状态';
              }
            })()
          }}</span>
        </template>
      </el-table-column>

      <el-table-column width="380px" align="center" label="资源参数">
        <template slot-scope="scope">
          <span>{{ scope.row.resource_content }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-dropdown>
            <span class="el-dropdown-link">操作<i class="el-icon-arrow-down el-icon--right" /></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="showFormDialog(scope.row)">删除资源</el-dropdown-item>
              <el-dropdown-item @click.native="reStartGather(scope.row.Id)">编辑资源</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :visible.sync="visible" title="添加资源" width="30%">
      <el-form :model="resData" label-width="auto">
        <el-form-item label="资源分组：">
          <el-select v-model="resData.gid" placeholder="请选择">
            <el-option v-for="item in resGroupList" :key="item.id" :label="item.gname" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型：">
          <el-select v-model="resData.rtype" @change="controlFormItem(resData.rtype)">
            <el-option label="消息" value="4" />
            <el-option label="链接" value="6" />
            <el-option label="名片" value="7" />
            <el-option label="视频" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="linkUI" label="封面图片：">
          <el-input v-model="resData.cover" style="width: 200px" />
        </el-form-item>
        <el-form-item v-show="linkUI" label="封面标题：">
          <el-input v-model="resData.title" style="width: 200px" />
        </el-form-item>
        <el-form-item v-show="linkUI" label="跳转链接：">
          <el-input v-model="resData.url" style="width: 200px" />
        </el-form-item>
        <el-form-item v-show="contentUI" label="资源内容：">
          <el-input v-model="resData.content" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addResSubmit">添加资源</el-button>
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
import { AddResource, GetRecouseGroupList, GetResourceList } from '@/api/article'

export default {
  components: { Pagination },
  data() {
    return {
      visible: false,
      // 添加资源参数对象
      // {"gtype":3,"rid":0,"gid":17484,"rtype":4,"content":"这是消息内容"}
      // {"gtype":3,"rid":0,"gid":17242,"rtype":8,"content":"这是视频类型内容"}
      // {"gtype":3,"rid":0,"gid":17242,"rtype":7,"content":"这是名片类型内容"}
      // {"gtype":3,"rid":0,"gid":17242,"rtype":6,"content":"cover-img|baidu.com|cover-title",
      // "cover":"cover-img","title":"cover-title","url":"baidu.com"}
      resData: {
        gtype: 3,
        rid: 0,
        rtype: '4' // 默认选中资源类型为消息
      },
      autoContent: '',
      // 默认不显示链接类型的表单项
      linkUI: false,
      contentUI: true,
      list: null,
      resGroupList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 13,
        gtype: 3
      },
      resGroupParams: {
        gtype: 3
      }
    }
  },
  created() {
    // 请求列表接口
    console.log('__created__')
    this.getList()
    this.getResGroupList()
  },
  methods: {
    // 控制表单项显示与否
    controlFormItem(type) {
      console.log('__type__')
      console.log(type)
      if (parseInt(type) === 6) {
        this.linkUI = true
        this.contentUI = false
      } else {
        this.linkUI = false
        this.contentUI = true
      }
      console.log(this.linkUI)
      console.log(this.contentUI)
    },
    getGnameByGid(gid) {
      const group = this.resGroupList.find(item => item.id === gid)
      return group ? group.gname : ''
    },
    refreshPage() {
      this.getList()
    },
    showAddResWindow() {
      this.visible = true
    },
    // 获取私信资源列表
    getList() {
      this.listLoading = true
      GetResourceList(this.listQuery).then(response => {
        console.log(response)
        if (response.status === 0) {
          this.list = response.data
          this.total = response.count
        } else {
          this.$message.error('请求异常')
        }
        this.listLoading = false
      })
    },
    getResGroupList() {
      GetRecouseGroupList(this.resGroupParams).then(response => {
        console.log(response)
        if (response.status === 0) {
          this.resGroupList = response.rgroup
        } else {
          this.$message.error('请求异常')
        }
      })
    },
    // 添加资源
    addResSubmit() {
      if (parseInt(this.resData.rtype) === 6) {
        this.autoContent = this.resData.cover + '|' + this.resData.url + '|' + this.resData.title
        this.resData.content = this.autoContent
      }
      AddResource(this.resData).then(response => {
        console.log(response)
        if (response.status === 0) {
          this.$message.success('添加成功')
          this.visible = false
          this.refreshPage()
        } else {
          this.$message.error('请求异常')
        }
      })
    }
  }
}
</script>
