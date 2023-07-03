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
      <el-select v-model="documentModel.dclass" :placeholder="$t('table.type')" clearable style="width: 90px; margin-left:15px;" class="filter-item">
        <el-option v-for="(label, i) in dclass" :key="i + label" :label="label" :value="label" />
      </el-select>
      <!-- 国籍选项-->
      <el-select v-model="documentModel.authorNational" :placeholder="$t('table.national')" clearable class="filter-item" style="width: 130px; margin-left:15px;">
        <el-option v-for="(national, i) in nationals" :key="i + national" :label="national" :value="national" />
      </el-select>
      <!-- 搜索-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left:10px;" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <!-- 添加-->
      <template v-if="isAdminRole">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          {{ $t('table.add') }}
        </el-button>
      </template>
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
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope)">删除</el-button>
          <el-button size="mini" type="danger" @click="handleDownload(scope)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :total="total" :page.sync="params.pageNum" :limit.sync="params.pageSize" @pagination="handleDocumentList" />

    <!-- 新增弹出框
      el-dialog：对话框
      rules：规则
      label-position：标签位置
      placeholder:占位符、提示
      filterable：搜索
      :visible.sync 表示弹框的展示和隐藏
    -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!--
        this.$refs['dataForm'] 可以在方法内部直接调到这里来！
      -->
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="资料名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="作者姓名" prop="author">
          <el-input v-model="temp.author" />
        </el-form-item>
        <el-form-item label="作者国籍" prop="authorNational">
          <el-select v-model="temp.authorNational" filterable class="filter-item" placeholder="请选择">
            <el-option v-for="(country, i) in countryList" :key="country + i" :label="country" :value="country" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input v-model="temp.intro" :autosize="{ minRows: 0, maxRows: 10}" type="textarea" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="文件类型" prop="dclass">
          <el-input v-model="temp.dclass" />
        </el-form-item>
        <el-form-item label="上传文件" prop="resource">
          <el-radio-group v-model="ruleForm.resource">
            <el-radio label="1">本地上传</el-radio>
            <el-radio label="2">远程上传</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="ruleForm.resource === '2'">
          <el-form-item label="远程地址" prop="remoteAddr">
            <el-input v-model="temp.remoteAddr" />
          </el-form-item>
        </div>
        <div v-else>
          <el-upload ref="upload" class="upload-demo" action="" :on-preview="handlePreview" :on-remove="handleRemove" :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary" style="margin-left:100%;">选取文件</el-button>
            <el-button style="margin-left: 25%;" size="small" type="success" @click="uploadDocument">上传到服务器</el-button>
            <div slot="tip" style="margin-left: 20%" class="el-upload__tip">上传文件最大限制为100MB！</div>
          </el-upload>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deleteById, exportExcel, getAllDClass, getList, insertDocument, searchData, uploadDocument } from '@/api/table'
import { myTimeToLocal } from '@/utils/TimeUtil'
import Pagination from '@/components/Pagination.vue'
import waves from '@/directive/waves'
import { nationList } from '@/utils/NationUtil'
import { judgeAdminRole } from '@/utils'

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
      // 是否拥有管理员角色
      tableKey: 0,
      isAdminRole: false,
      // 展示列表
      documentList: [],
      // 水波纹
      downloadLoading: false,
      listLoading: true,
      // 类型列表
      dclass: [],
      // 国家列表
      nationals: [],
      // 搜索时用到的DTO
      documentModel: {
        id: '',
        name: '',
        author: '',
        authorNational: '',
        intro: '',
        dformat: '',
        dclass: '',
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
      },
      // 用于鉴别时新增还是编辑
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      // 弹出框显示隐藏判断
      dialogPvVisible: false,
      pvData: [],
      // 必选的内容，没有选择的时候需要告警！
      rules: {
        name: [{ required: true, message: '名称必须填写！', trigger: 'blur' }],
        dclass: [{ required: true, message: '类型必须填写！', trigger: 'blur' }]
        // resource: [{ required: true, message: '上传文件类型选项是必选的！', trigger: 'blur' }]
      },
      // 新增框内的内容
      temp: {
        id: undefined,
        name: '',
        remoteAddr: '',
        author: '',
        authorNational: '',
        intro: '',
        dclass: ''
      },
      // 国家列表
      countryList: [],
      // 上传选项
      ruleForm: {
        // 2默认是远程地址
        resource: '2'
      },
      // 上传文件
      fileList: [{ name: '', url: '' }],
      buttonUse: 'disabled'
    }
  },
  created() {
    this.isAdminRole = judgeAdminRole()
    this.handleDocumentList()
    this.getAllType()
    this.getCountryList()
  },
  methods: {
    myTimeToLocal,
    nationList,
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
        const tmp = response.data
        this.dclass = tmp.filter(function(s) {
          return s && s.trim()
        })
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
        .then((response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
          })
          const a = document.createElement('a')
          const href = window.URL.createObjectURL(blob)
          a.href = href
          a.download = '资源列表'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(href)
        })
        .finally(() => { this.downloadLoading = false })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        remoteAddr: '',
        author: '',
        authorNational: '',
        intro: '',
        dclass: ''
      }
    },
    // 新建按钮
    handleCreate() {
      this.resetTemp()
      // 修改下当前状态
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      // 当数据被修改后使用这个方法,会回调获取更新后的dom再渲染出来
      this.$nextTick(() => {
        // $refs 是所有注册过 ref 的集合（对象）
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 获取国家列表
    getCountryList() {
      this.countryList = [].concat(nationList())
      // console.log(this.countryList)
    },
    // 上传资源
    uploadDocument() {
      uploadDocument()
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    // 新建保存
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          insertDocument(this.temp).then(() => {
            console.log(this.temp)
            this.documentList.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 修改
    handleEdit(row) {
      this.temp = Object.assign({}, row) // copy obj
      // 用于判断弹出框是新建还是修改
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // 当数据被修改后使用这个方法,会回调获取更新后的dom再渲染出来
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改保存
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          insertDocument(tempData).then(() => {
            const index = this.documentList.findIndex(v => v.id === this.temp.id)
            this.documentList.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
