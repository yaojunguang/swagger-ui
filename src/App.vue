<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  #app, body, html {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    margin: 0;
    padding: 0;
    color: #2c3e50;
    width: 100%;
    height: 100%;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .el-header {
    line-height: 60px;
    border-bottom: 1px solid #e6e6e6;
    background-color: white;
    border-right: 1px solid #e6e6e6;
  }

  .el-submenu__title{
    font-weight: bold;
  }
</style>
<style scoped>
</style>
