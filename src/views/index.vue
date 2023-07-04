<template>
  <div class="app-container">
    <el-card class="box-card">
      <div style="margin: 40px">
        <h1>资料搜集平台~目前用作VUE学习</h1>
        <h3 style="margin-top: 80px"></h3>
        <h3></h3>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      // 版本号
      version: '1.0.0'
    }
  },
  created() {
    // 自动跳转
    // this.$router.push({path: '/user/profile'});
  },
  methods: {
    goTarget(href) {
      window.open(href, '_blank')
    }
  }
}
</script>
