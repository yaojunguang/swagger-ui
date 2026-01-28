<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
  <div class="main" v-loading="loading">
    <el-container style="height: 100%" v-if="form">
      <el-aside style="height: calc(100% - 50px);overflow: hidden;" id="menu-aside"
                v-bind:style="{backgroundColor:'#f0f0f0',height:'100%',width:leftSize+'px'}">
        <el-header style="text-indent: 16px;font-size: 25px;line-height: 50px;">
          {{ form.info.title }}<span class="version">{{ form.info.version }}</span>
        </el-header>
        <el-scrollbar style="height: 100%;">
          <el-menu class="el-menu-vertical-demo" style="text-align: left;"
                   @select="handleOpenItem">
            <el-sub-menu v-for="tag in newTags" :index="tag.name" :key="tag.name">
              <template #title>
                <div class="title">{{ tag.name }}</div>
                <div class="describes">{{ tag.description }}</div>
              </template>
              <el-menu-item-group>
                <el-menu-item v-for="method in tag.methods" :key="method['operationId']"
                              :index="method['operationId']"
                              v-bind:class="method['deprecated']+ ' '+method.method">
                  <template #title>
                    <span class="method">{{ method["method"] }}</span>
                    <div class="info">{{ method["path"] }}
                      <div class="summary">{{ method["summary"] }}</div>
                    </div>
                  </template>
                </el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-aside id="resizeBar" width="6px" class="resize" @mousedown="handleResize"/>
      <el-container>
        <el-header>
          <el-input v-model="keyword" @change="keywordChanged"
                    placeholder="输入路径，名称以搜索" clearable>
            <template #prepend>
              <el-select v-model="groupName" style="width: 150px" placeholder="请选择" title="选择分组"
                         @change="groupChanged">
                <el-option
                    v-for="item in resources"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </template>
          </el-input>
        </el-header>
        <el-main class="main-cards" v-if="renderIndex">
          <el-tabs v-if="items.length > 0" type="border-card" v-model="activeName" style="calc(height: 100% - 50px)"
                   closable
                   @tab-remove="removeTab">
            <el-tab-pane v-for="(item,mainIndex) in items" :key="item['operationId']" :name="item['operationId']"
                         :label="item.path" style="height: 100%;overflow: auto;">
              <el-scrollbar style="height: 100%">
                <el-card class="box-card" v-bind:class="item.method">
                  <div slot="header" class="card-header">
                    <span class="method">{{ item.method }}</span>
                    <span class="path" @click="copy(item.path)">{{ item.path }}</span>
                    <span class="summary" @click="copy(item.path)">{{ item["summary"] }}</span>
                    <el-button type="success" v-if="item.try" @click="execute(item.path+'-'+item.method,item)"
                               style="position: absolute;right: 108px;top: 8px;" plain>Execute
                    </el-button>
                    <el-button type="warning" v-if="item.try" @click="tryIt(item,false)"
                               style="position: absolute;right: 8px;top: 8px;" plain>Cancel
                    </el-button>
                    <el-button type="primary" v-else @click="tryIt(item,true)"
                               style="position: absolute;right: 8px;top: 8px;" plain>Try
                    </el-button>
                  </div>
                  <div class="description" v-if="item.description && item.description !== ''">{{ item.description }}
                  </div>
                  <el-form :model="item" :ref="item.path+'-'+item.method" v-loading="item.executing">
                    <el-tabs type="border-card" v-model="item.tab" style="height: 100%">
                      <Params label="Params" name="params" :item="item"/>
                      <el-tab-pane label="Example" name="execute" style="position: relative">
                        <el-tabs v-if="item.exe" v-model="item.exe" style="margin: 12px;">
                          <el-tab-pane name="swift" label="swift" style="position: relative;">
                            <highlightjs autodetect :code="item.swift" style="border-radius: 6px;"
                                         class="swift"/>
                            <el-icon @click="copy(item.swift)" color="white"
                                     style="position: absolute;right: 8px;top: 8px;">
                              <CopyDocument/>
                            </el-icon>
                          </el-tab-pane>
                          <el-tab-pane name="retrofit" label="retrofit" style="position: relative;">
                            <highlightjs autodetect :code="item.retrofit" style="border-radius: 6px;"
                                         class="java"/>
                            <el-icon @click="copy(item.retrofit)" color="white"
                                     style="position: absolute;right: 8px;top: 8px;">
                              <CopyDocument/>
                            </el-icon>
                          </el-tab-pane>
                          <el-tab-pane name="axios" label="axios" style="position: relative;">
                            <highlightjs autodetect :code="item.axios" style="border-radius: 6px;"
                                         class="java"/>
                            <el-icon @click="copy(item.axios)" color="white"
                                     style="position: absolute;right: 8px;top: 8px;">
                              <CopyDocument/>
                            </el-icon>
                          </el-tab-pane>
                          <el-tab-pane name="java" label="java" style="position: relative;">
                            <highlightjs autodetect :code="item.java" style="border-radius: 6px;"
                                         class="java"/>
                            <el-icon @click="copy(item.java)" color="white"
                                     style="position: absolute;right: 8px;top: 8px;">
                              <CopyDocument/>
                            </el-icon>
                          </el-tab-pane>
                          <el-tab-pane name="ArkTs" label="ArkTs" style="position: relative;">
                            <highlightjs autodetect :code="item.arkTs" style="border-radius: 6px;"
                                         class="java"/>
                            <el-icon @click="copy(item.arkTs)" color="white"
                                     style="position: absolute;right: 8px;top: 8px;">
                              <CopyDocument/>
                            </el-icon>
                          </el-tab-pane>
                        </el-tabs>
                      </el-tab-pane>
                      <el-tab-pane v-if="item.result" label="执行结果" name="result" style="position: relative">
                        <div>调用耗时:{{ item.executeTime }}</div>
                        <highlightjs autodetect :code="item.result" style="border-radius: 6px;"
                                     class="json"/>
                        <el-icon @click="copy(item.result)" color="white"
                                 style="position: absolute;right: 8px;top: 8px;">
                          <CopyDocument/>
                        </el-icon>
                      </el-tab-pane>
                    </el-tabs>
                  </el-form>
                </el-card>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

import {swiftCallExample} from "components/Module2Swift";
import {javaCallExample, retrofitCallExample} from "components/Module2Java";
import {jsCallExample} from "components/Module2Js";
import useClipboard from 'vue-clipboard3'
import {CircleCheck, Close, CopyDocument} from "@element-plus/icons-vue";
import Params from "@/Params.vue";
import {arkTsCallExample} from "components/Module2ArkTs";

let {toClipboard} = useClipboard();
export default {
  name: 'SwaggerUi',
  components: {CopyDocument, Params, Close, CircleCheck},
  data() {
    return {
      groupName: null,
      resources: [{
        name: 'default',
        url: '/v3/api-docs',
        swaggerVersion: '3.0',
        location: '/v3/api-docs',
      }],
      headers: [/*{
          key: '',
          describe: '',
          value: ''
        }*/],//用户添加的请求参数头
      leftSize: 400,
      moveTarget: null,
      activeName: '',
      renderIndex: 1,
      loading: false,
      keyword: '',
      form: null,
      items: [],
      newTags: [],
      mockModel: false,
    }
  },
  watch: {
    form: function () {
    },
    groupName: function () {
      localStorage.setItem('groupName', this.groupName);
    }
  },
  mounted() {
    if (this.mockModel) {
      if (this.groupName == null) {
        this.groupName = this.resources[0].name;
      }
      this.groupChanged();
    } else {
      let that = this;
      this.axios({
        url: "/v3/api-docs/swagger-config"
      }).then(res => {
        // 转换为前端需要的格式
        if (res.data.urls && Array.isArray(res.data.urls)) {
          that.resources = res.data.urls.map(item => ({
            name: item.name || 'default',
            url: item.url,
            swaggerVersion: '3.0',
            location: item.url
          }));
        } else {
          // 兼容旧格式（如果后端提供了兼容端点）
          that.resources = res.data;
        }
        if (that.groupName == null && that.resources.length > 0) {
          that.groupName = that.resources[0].name;
        }
        that.groupChanged()
      });
    }
    this.groupName = localStorage.getItem('groupName');
    this.keyword = localStorage.getItem('keyword');
    if (this.keyword === null || this.keyword === undefined) {
      this.keyword = '';
    }

    let size = localStorage.getItem('menu-aside');
    if (size != null) {
      this.leftSize = size;
    }

    let headerString = localStorage.getItem('headers');
    if (headerString == null || headerString === "") {
      this.headers = [];
    } else {
      this.headers = JSON.parse(headerString);
    }

  },
  methods: {
    handleResize() {//menu大小的拖动
      let that = this;
      document.onmousemove = function (e) {
        let event = window.event || e;
        that.leftSize = event.pageX;
      }
      document.onmouseup = (e) => {
        let event = window.event || e;
        that.leftSize = event.pageX;
        localStorage.setItem('menu-aside', that.leftSize);
        document.onmousemove = null;
        document.onmouseup = null;
      }
    },
    copy(content) {
      toClipboard(content);
      this.$message.success('复制成功')
    },
    groupChanged() {
      let docUrl;
      if (this.mockModel) {
        docUrl = "/v3/api-docs.json";
      } else {
        if (this.resources != null && this.resources.length > 0) {
          let items = this.resources.filter(resource => resource.name === this.groupName);
          if (items.length === 1) {
            docUrl = items[0].url;
          } else {
            docUrl = this.resources[0].url
          }
        }
      }
      this.axios({
        url: docUrl,
        method: "GET"
      }).then(res => {
        console.log(res);
        this.parseDocs(res.data)
      });
    },
    keywordChanged() {
      if (this.keyword !== '' && this.keyword !== null) {
        let newTags = [];
        for (let index = 0; index !== this.form["tags"].length; ++index) {
          let tag = this.form["tags"][index];
          let that = this;
          let items = tag.items.filter(function (method) {
            return method["summary"].includes(that.keyword) || method["path"].includes(that.keyword);
          });
          if (items.length > 0) {
            tag.items = items;
            newTags.push(tag);
          }
        }
        this.newTags = newTags;
      } else {
        this.newTags = this.form["tags"];
      }
      localStorage.setItem('keyword', this.keyword);
    },
    execute(formName, item) {
      let that = this;
      let path = item.path;
      let params = {};
      //处理公共参数
      if (item.common !== undefined) {
        item.common.forEach(function (entity) {
          if (entity.required) {
            if (entity.value == null) {
              return this.checkForm(formName)
            }
          }
          if (entity.in === 'path') {
            path = path.replace('{' + entity.name + '}', entity.value)
          } else {
            params[entity.name] = entity.value
          }
        });
      }
      //处理私有参数
      if (item.private !== undefined) {
        item.private.forEach(function (entity) {
          if (entity.required) {
            if (entity.value == null) {
              return this.checkForm(formName)
            }
          }
          if (entity.in === 'path') {
            path = path.replace('{' + entity.name + '}', entity.value)
          } else {
            params[entity.name] = entity.value
          }
        });
      }
      item.executing = true;
      that.$forceUpdate();
      let startAt = new Date();
      let headers = {};
      for (let index = 0; index !== that.headers.length; ++index) {
        headers[that.headers[index].key] = that.headers[index].value;
      }
      $.ajax({
        xhrFields: {
          withCredentials: true
        },
        headers: headers,
        url: path,
        type: item.method,
        data: params,
        cache: false,
        success: function (resp) {
          item.executing = false;
          item.executeTime = new Date() - startAt + 'ms';
          item.result = JSON.stringify(resp, null, 4);
          item.open.push(3);
          that.$message.success('执行成功');
          item.tab = 'result';
          that.$forceUpdate();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          item.executing = false;
          that.$alert(jqXHR.responseText, jqXHR.statusText, {
            confirmButtonText: '确定'
          });
          console.log(error);
        }
      });
    },
    checkForm(formName) {
      this.$nextTick(function () {
        this.$refs[formName][0].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            this.$message.error('尚有必填字段');
            return false
          }
        })
      })
    },
    parseDocs(data) {
      for (let path in data.paths) {
        let node = data.paths[path];
        for (let methodType in node) {
          let method = node[methodType];
          method["tags"].forEach(tag => {
            let tagNode = this.findTagNode(tag, data);
            if (tagNode != null) {
              if (tagNode.methods === undefined) {
                tagNode.methods = []
              }
              method['path'] = path;
              method['method'] = methodType;
              tagNode.methods.push(method);
            }
          })
        }
      }
      //parse schemas
      const schemas = data.components.schemas;
      for (let schema in schemas) {
        if (schemas[schema].title === undefined) {
          schemas[schema].title = schemas[schema].description ?? schema;
        }
      }
      delete data.paths;
      this.form = data;
      console.log(JSON.stringify(data));
      this.keywordChanged();
      this.$forceUpdate();
    },
    findTagNode(tag, doc) {//查找根Tag
      if (doc["tags"] === undefined) {
        doc["tags"] = []
      }
      for (let index = 0; index !== doc["tags"].length; ++index) {
        let entity = doc["tags"][index];
        if (entity.name === tag) {
          return entity
        }
      }
      const newTags = {name: tag};
      doc["tags"].push(newTags)
      return newTags
    },
    tryIt(item, op) {
      item.try = op;
      if (op && !item.open.contains(1)) {
        item.open.push(1);
      }
      this.renderIndex += 1;
      this.$forceUpdate();
    },
    removeTab(targetName) {
      console.log("remove tab " + targetName)
      for (let index = 0; index !== this.items.length; ++index) {
        if (this.items[index].operationId === targetName) {
          this.items.splice(index, 1);
          if (targetName === this.activeName && this.items.length > 0) {
            this.activeName = this.items[0].operationId
          }
          return
        }
      }
      this.$forceUpdate()
    },
    handleOpenItem(key, keyPath) {
      let method = this.newTags.find(item => item.name === keyPath[0])["methods"].find(item => item["operationId"] === key);
      if (this.activeName === method["operationId"]) {
        return;
      }
      if (method.parameters != null) {
        for (let index = 0; index !== method.parameters.length; ++index) {
          let param = method.parameters[index];
          let type = param.schema.type;
          if (type) {
            param.type = type;
            param.value = param.default;

            if (param.name.indexOf('.') === -1 && param.description && param.description.startsWith('【公共参数】')) {
              if (method.common === undefined) {
                method.common = []
              }
              method.common.push(param)
            } else {
              if (method.private === undefined) {
                method.private = []
              }
              if (param.name.indexOf('.') === -1) {
                method.private.push(param)
              } else if (param.name.indexOf('.year') > 0) {
                param.name = param.name.substring(0, param.name.indexOf('.'));
                param.type = 'string';
                param.default = null;
                param.description = '时间字符串，默认格式yyyy-MM-dd hh:mm:ss';
                param.required = undefined;
                param.value = null;
                method.private.push(param);
              }
            }
            if (type === 'integer' || type === 'number') {
              param.rules = [{required: param.required, message: '必填', trigger: 'change'}, {
                type: 'number',
                message: '请输入合法的数字'
              }];
              if (param.value === undefined) {
                param.value = 0;
              }
            } else if (param.type === 'string' && param.format === 'byte') {
              param.type = 'byte';
              param.rules = [{required: param.required, message: '必填', trigger: 'change'}, {
                type: 'number',
                message: '请输入合法的数字'
              }];
              if (param.value === undefined) {
                param.value = 0;
              }
            } else if (param.type === 'string') {
              param.rules = [{required: param.required, message: '必填', trigger: 'blur'}];
              if (param.value === undefined) {
                param.value = '';
              }
            }
          }
        }
        //method.parameters = null
      }

      method.tab = 'params';

      //找出所有的关联对象
      let modules = [];
      let schema = method["responses"]['200']["content"]["*/*"].schema;
      if (schema.$ref) {
        schema.originalRef = schema.$ref.substring('#/components/schemas/'.length);
        this.parseModule(this.getNodeByPath(schema.originalRef), modules);
      }

      method.modules = modules;
      if (method.private) {
        method.open = [0, 3];
      } else {
        method.open = [3];
      }
      method.open.push(2);

      if (method.method === 'post') {
        //处理调用示例
        this.createExecuteCode(method);
      } else {
        this.createExecuteCode(method);
      }

      this.items.push(method);
      this.activeName = method["operationId"];
      this.$forceUpdate()
    },
    getNodeByPath(path) {
      let temp = this.form.components.schemas; // take a copy of object
      if (!path) return temp; // if path is undefined or empty return the copy
      path = path.split("/");
      for (let p = 0; p !== path.length; ++p) {
        if (!path[p]) continue; // means "a/" = "a"
        temp = temp[path[p]]; // new data is subdata of data
        if (!temp) return temp;
      }
      return temp;
    },
    createExecuteCode(method) {
      method.java = javaCallExample(method);
      method.axios = jsCallExample(method);
      method.swift = swiftCallExample(method);
      method.retrofit = retrofitCallExample(method);
      method.arkTs = arkTsCallExample(method);
      method.exe = 'swift';
      this.$forceUpdate()
    },
    parseModule(module, modules) {
      if (modules.filter(item => item.title === module.title).length === 0) {
        module.language = 'normal';
        modules.push(module);
      } else {
        return;
      }
      for (let prop in module.properties) {
        if (module.properties.hasOwnProperty(prop)) {
          let property = module.properties[prop];
          if (property.$ref !== undefined) {
            property.originalRef = property.$ref.substring('#/components/schemas/'.length)
          }
          if (property.originalRef !== undefined) {
            if (property.originalRef === 'Timestamp') {
              property.type = 'number'
            } else {
              this.parseModule(this.getNodeByPath(property.originalRef), modules);
              property.type = this.getNodeByPath(property.originalRef).title;
            }
          } else if (property.type === 'array') {
            if (property.items.$ref !== undefined) {
              property.items.originalRef = property.items.$ref.substring('#/components/schemas/'.length);
            }
            if (property.items.originalRef !== undefined) {
              this.parseModule(this.getNodeByPath(property.items.originalRef), modules);
            } else if (property.items.type === 'array') {
              if (property.items.items.$ref !== undefined) {
                property.items.items.originalRef = property.items.items.$ref.substring('#/components/schemas/'.length);
              }
              this.parseModule(this.getNodeByPath(property.items.items.originalRef), modules);
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

.version {
  background-color: #333333;
  color: white;
  border-radius: 16px;
  font-size: 10px;
  padding: 3px 6px 3px 6px;
  margin-left: 12px;
}

.main {
  height: 100%;
  width: 100%;
}

.el-sub-menu__title .title {
  font-size: 16px;
  line-height: 30px;
  font-weight: bold;
}

.el-sub-menu__title .describes {
  line-height: 20px;
  font-size: 12px;
  color: gray;
}

.el-menu-item {
  font-weight: bold;
  line-height: 20px !important;
  position: relative;
  padding-top: 5px !important;
  padding-bottom: 5px;
  height: 50px;
  padding-left: 80px !important;
}

.info {
  padding-left: 6px;
  color: black;
  font-size: 14px;
  line-height: 22px;
}

.summary {
  font-size: 8px;
  color: darkgray;
  line-height: 8px;
}

.method {
  text-transform: uppercase;
  line-height: 30px;
  border-radius: 4px;
  display: inline-block;
  width: 60px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
  margin-right: 8px;
  position: absolute;
  left: 16px;
  top: 10px;
}

.resize {
  background-color: white;
  height: 100%;
  overflow: auto;
  cursor: ew-resize;
}

.resize:hover {
  background-color: #f0f0f0;
}

.get .method {
  background-color: #61affe;
}

.post .method {
  background-color: #67C23A;
}

.put .method {
  background-color: #49cc90;
}

.delete .method {
  background-color: #f93e3e;
  font-size: 12px;
}

.patch .method {
  background-color: #E6A23C;
}

.options .method {
  background-color: rgba(230, 162, 60, 0.3);
  border: 1px solid #E6A23C;
  color: #E6A23C;
  font-size: 12px;
}

.head .method {
  background-color: rgba(97, 175, 254, 0.3);
  border: 1px solid #61affe;
  color: #61affe;
  font-size: 14px;
}

.trace .method {
  background-color: rgba(73, 204, 144, 0.3);
  border: 1px solid #49cc90;
  color: #49cc90;
  font-size: 13px;
}

.deprecated {
  color: gray;
  text-decoration: line-through;
}

.deprecated .method {
  background-color: darkgray;
}

.main-cards {
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.main-cards .get {
  border: 1px solid #61affe;
  background-color: rgba(97, 175, 254, 0.1);
}

.main-cards .post {
  border: 1px solid #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.main-cards .put {
  border: 1px solid #49cc90;
  background-color: rgba(73, 204, 144, 0.1);
}

.main-cards .delete {
  border: 1px solid #f93e3e;
  background-color: rgba(249, 62, 62, 0.1);
}

.main-cards .patch {
  border: 1px solid #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.el-card {
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 16px;
}

.el-card:last-child {
  margin-bottom: 16px;
}

.el-card .description {
  font-size: 12px;
  line-height: 40px;
  text-align: left;
  text-indent: 16px;
}

.card-header {
  text-align: left;
  position: relative;
  padding-left: 88px;
  height: 50px;
  padding-top: 5px;
  line-height: 50px;
}

.el-row {
  line-height: 45px;
}

.path {
  cursor: pointer;
  font-size: 16px;
}

.name {
  font-size: 16px;
  line-height: 45px;
  cursor: pointer;
}

.name span {
  display: none;
  font-size: 8px;
  line-height: 10px;
}

.required {
  font-weight: bold;
}

.required span {
  display: inline-block;
  color: firebrick;
}

</style>

<style>

.el-card__header {
  padding: 0 !important;
}

.el-collapse-item__header {
  padding-left: 12px;
}

.el-collapse-item__wrap {
  background-color: transparent !important;
  padding-left: 24px;
}

.el-card__body {
  padding: 0 !important;
}

.el-tabs--border-card {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
}

.el-tabs__content {
  height: calc(100% - 40px);
}

.el-tabs__header {
  margin-bottom: 0;
}

.el-tabs--border-card > .el-tabs__content {
  padding: 0 !important;
}

.el-tabs {
  height: 100% !important;
}

code {
  font-size: 12px;
  line-height: 16px;
}
</style>
