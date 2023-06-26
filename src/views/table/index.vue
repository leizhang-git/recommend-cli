<template>
  <div class="app-container">
    <!--
      max-height：超过此高度会出现滚动条,可以固定表头
      fixed：可以固定左右
      sortable：排序
      default-sort：设置默认排序
    -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      max-height="550"
    >
      <!-- 此column设置 selection是为了设置全选~-->
      <!--
        prop相当于绑定字段~
      -->
      <el-table-column type="selection" width="45" />
      <el-table-column align="center" label="ID" width="45" type="index" fixed/>
      <el-table-column prop="name" label="名称" width="180" align="center" fixed />
      <el-table-column prop="author" label="作者" width="80" align="center" />
      <el-table-column prop="authorNational" label="作者国籍" width="70" align="center" />
      <el-table-column prop="intro" label="简介" width="300" align="center" />
      <el-table-column prop="dformat" label="文件格式" width="70" align="center" />
      <el-table-column prop="dclass" label="文件类型" width="80" align="center" />
      <el-table-column prop="createBy" label="创建者" width="80" align="center" />
      <el-table-column prop="createDate" label="创建时间" width="210" align="center" sortable >
        <template slot-scope="scope">
          <span>{{ myTimeToLocal(scope.row.createDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >删除</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >下载</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getList } from '@/api/table'
import { myTimeToLocal } from '@/utils/TimeUtil'
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
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    myTimeToLocal,
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
