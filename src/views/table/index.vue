<template>
  <div class="app-container">
    <div class="filter-container">
      <!--
        placeholder:占位符、输入用的
        $t:国际化
        @keyup.enter.native:回车触发
        v-waves:水波纹
        margin-left：块距离
        clearable：输入框右边有一个删除小按钮~
      -->
      <!-- 输入框-->
      <el-input v-model="documentModel.name" :placeholder="$t('table.name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- 资源类型-->
      <el-select v-model="documentModel.dClass" :placeholder="$t('table.type')" clearable style="width: 90px; margin-left:15px;" class="filter-item">
        <el-option v-for="(label, i) in dClass" :key="i + label" :label="label" :value="label" />
      </el-select>
      <!-- 国籍选项-->
      <el-select v-model="documentModel.authorNational" :placeholder="$t('table.national')" clearable class="filter-item" style="width: 130px; margin-left:15px;">
        <el-option v-for="(national, i) in nationals" :key="i + national" :label="national" :value="national" />
      </el-select>
      <!-- 搜索-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" style="margin-left:10px;">
        {{ $t('table.search') }}
      </el-button>
      <!-- 添加-->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <!-- 导出Excel-->
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleExport">
        {{ $t('table.export') }}
      </el-button>
      <!-- 最后修改时间[打勾]-->
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.lastModifiedDate') }}
      </el-checkbox>
    </div>
    <!--    <el-button type="primary" @click="handleAddDocument">新增</el-button>-->
    <!--
      max-height：超过此高度会出现滚动条,可以固定表头
      margin-top：上边距宽度
      fixed：可以固定左右
      sortable：排序
      default-sort：设置默认排序
      border：显示所有边框
    -->
    <el-table :key="tableKey" v-loading="listLoading" :data="documentList" element-loading-text="Loading" border max-height="450" style="width: 100%;margin-top:30px;">
      <!-- 此column设置 selection是为了设置全选~-->
      <!--
        prop相当于绑定字段~
      -->
      <el-table-column type="selection" width="45" />
      <el-table-column align="center" label="ID" width="45" type="index" fixed />
      <el-table-column prop="name" label="名称" width="180" align="center" fixed />
      <el-table-column prop="author" label="作者" width="80" align="center" />
      <el-table-column prop="authorNational" label="作者国籍" width="70" align="center" />
      <el-table-column prop="intro" label="简介" width="300" align="center" />
      <el-table-column prop="dformat" label="文件格式" width="70" align="center" />
      <el-table-column prop="dclass" label="文件类型" width="80" align="center" />
      <el-table-column prop="createBy" label="创建者" width="80" align="center" />
      <el-table-column prop="createDate" label="创建时间" width="210" align="center" sortable>
        <template slot-scope="scope">
          <span>{{ myTimeToLocal(scope.row.createDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="最后修改时间" width="210" align="center">
        <template slot-scope="scope">
          <span style="color:#e80909;">{{ myTimeToLocal(scope.row.lastModifiedDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope)">修改</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope)">删除</el-button>
          <el-button size="mini" type="danger" @click="handleDownload(scope)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :total="total" :page.sync="params.pageNum" :limit.sync="params.pageSize" @pagination="handleDocumentList" />

  </div>
</template>

<script>
import { deleteById, exportExcel, getAllDClass, getList, searchData } from '@/api/table'
import { myTimeToLocal } from '@/utils/TimeUtil'
import Pagination from '@/components/Pagination.vue'
import waves from '@/directive/waves'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      // 展示列表
      documentList: null,
      // 水波纹
      downloadLoading: false,
      listLoading: true,
      // 类型列表
      dClass: [],
      // 国家列表
      nationals: [],
      // 搜索时用到的DTO
      documentModel: {
        id: '',
        name: '',
        author: '',
        authorNational: '',
        intro: '',
        dFormat: '',
        dClass: '',
        page: 1,
        limit: 20
      },
      // 隐藏字段
      showReviewer: false,
      // 用于鉴别新建和修改弹出来的框
      dialogStatus: '',
      //
      dialogFormVisible: false,
      // 总条数
      total: 0,
      directives: { waves },
      // 分页搜索
      params: {
        pageNum: 1,
        pageSize: 20
      }
    }
  },
  created() {
    this.handleDocumentList()
    this.getAllType()
  },
  methods: {
    myTimeToLocal,
    // 展示列表页
    handleDocumentList() {
      this.listLoading = true
      getList(this.params).then(response => {
        this.documentList = response.data.documentDataList
        this.total = response.data.total
        this.listLoading = false
        this.nationals = [... new Set(response.data.documentDataList.map(d => d.authorNational))]
      })
    },
    // 获取所有类型
    getAllType() {
      getAllDClass().then(response => {
        this.dClass = response.data
      })
    },
    // 删除数据
    handleDelete({ $index, row }) {
      // 弹框
      this.$confirm('确定要删除此条数据吗？', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          deleteById(row.id).then(response => {
            if (response.data === true) {
              this.documentList.splice($index, 1)
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    // 处理回车
    handleFilter() {
      this.searchData()
    },
    // 搜索数据
    searchData() {
      // 若什么都没有输入，
      searchData(this.documentModel).then(response => {
        this.documentList = response.data
      })
    },
    // 导出Excel
    handleExport() {
      this.downloadLoading = true
      exportExcel(this.documentList)
        .catch(() => { this.downloadLoading = false }
        )
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        remoteAddr: '',
        author: '',
        authorNational: '',
        intro: '',
        dClass: ''
      }
    },
    // 新建
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      // 当数据被修改后使用这个方法,会回调获取更新后的dom再渲染出来
      this.$nextTick(() => {
        // $refs 是所有注册过 ref 的集合（对象）
        this.$refs['dataForm'].clearValidate()
      })
    }
  }
}
</script>
