<template>
  <div :class="{'has-logo':showLogo} " :style="{ backgroundColor: settings.sideTheme === 'theme-dark' ? variables.menuBg : variables.menuLightBg }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <!--
      el-scrollbar: 滚动条
    -->
    <el-scrollbar :class="settings.sideTheme" wrap-class="scrollbar-wrapper">
      <!--
        background-color:菜单背景色
        text-color:菜单的文字颜色
        default-active:当前激活菜单的 index
        collapse:是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）
        unique-opened:是否只保持一个子菜单的展开
      -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="settings.sideTheme === 'theme-dark' ? variables.menuBg : variables.menuLightBg"
        :text-color="settings.sideTheme === 'theme-dark' ? variables.menuLightBg : 'rgba(0,0,0,.65)'"
        :unique-opened="true"
        :active-text-color="settings.theme"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['sidebar', 'sidebarRouters']),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
