<template>
  <el-config-provider>
    <SwaggerUi/>
  </el-config-provider>
</template>

<script>
import SwaggerUi from "components/SwaggerUi";

export default {
  name: 'App',
  components: {
    SwaggerUi
  }
}
</script>

<style>
#app, body, html {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  background-color: white;
  margin: 0;
  padding: 0;
  color: #333333;
  width: 100%;
  height: 100%;
}

.el-scrollbar__wrap {
  overflow-x: hidden !important;
}

.el-popper .el-scrollbar__wrap {
  overflow-x: scroll !important;
}

.el-header {
  line-height: 50px !important;
  border-bottom: 1px solid #e6e6e6;
  background-color: white;
  border-right: 1px solid #e6e6e6;
  font-weight: 900;
  text-align: left;
  font-size: 20px;
  padding: 5px !important;
}

.el-submenu__title {
  font-weight: bold;
}

.el-menu-item-group__title {
  display: none;
}

.el-submenu {
  border-bottom: 1px solid #f0f0f0;
}

</style>
