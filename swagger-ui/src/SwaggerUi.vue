<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
  <div class="main" v-loading="loading">
    <el-container style="height: 100%" v-if="form">
      <el-aside style="height: calc(100% - 50px);overflow: hidden;" id="menu-aside"
                v-bind:style="{backgroundColor:'#f0f0f0',height:'100%',width:leftSize+'px'}">
        <el-header>
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
                    <span class="method">{{ method["method"] }}</span>{{ method["path"] }}<br/>
                    <span class="summary">{{ method["summary"] }}</span>
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
              <el-select v-model="groupName" placeholder="请选择" title="选择分组" @change="groupChanged">
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
                      <!-- el-tab-pane label="Params" name="params">
                        <el-collapse v-model="item.open" style="text-align: left">
                          <el-collapse-item :name="1">
                            <template #title>
                              Header
                              <el-tooltip class="item" effect="dark"
                                          content="该部分设置为全局设置，设置后会存储在本地缓存中"
                                          placement="right">
                                <el-icon class="header-icon">
                                  <InfoFilled/>
                                </el-icon>
                              </el-tooltip>
                            </template>
                            <el-row style="font-weight: bold">
                              <el-col :span="4">
                                参数名
                              </el-col>
                              <el-col :span="8">
                                描述
                              </el-col>
                              <el-col :span="6">
                                参数值
                              </el-col>
                              <el-col :span="1">
                                &nbsp;
                              </el-col>
                            </el-row>
                            <el-row v-for="(header,index) in headers" :key="index">
                              <el-col :span="4" class="name">
                                <el-input v-model="header.key" @input="headerChanged()"/>
                              </el-col>
                              <el-col :span="8">
                                <el-input v-model="header.describe" @input="headerChanged()"/>
                              </el-col>
                              <el-col :span="6">
                                <el-input v-model="header.value" @input="headerChanged()"/>
                              </el-col>
                              <el-col :span="1">
                                <el-icon style="cursor: pointer;vertical-align: middle;" @click="deleteHeader(index)"
                                         title="删除该参数">
                                  <Close/>
                                </el-icon>
                              </el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="4">
                                <el-icon @click="addHeader()"
                                         title="添加一条参数">
                                  <CirclePlus/>
                                </el-icon>
                              </el-col>
                            </el-row>
                          </el-collapse-item>
                          <el-collapse-item title="Query" :name="2" v-if="item.private">

                            <el-row style="font-weight: bold">
                              <el-col :span="4">
                                参数名
                              </el-col>
                              <el-col :span="2">
                                类型
                              </el-col>
                              <el-col :span="8">
                                描述
                              </el-col>
                              <el-col :span="6">
                                默认值
                              </el-col>
                            </el-row>
                            <el-row v-for="(param,index) in item.private" :key="param.name">
                              <el-col :span="4" class="name" v-bind:class="param.required?'required':''"
                                      @click="copy(param.name)">
                                {{ param.name }}<span>* required</span>
                              </el-col>
                              <el-col :span="2">
                                {{ param.type }}
                              </el-col>
                              <el-col :span="8">
                                {{ param.description }}
                              </el-col>
                              <el-col :span="6">
                                <el-form-item :prop="'private.'+index+'.value'" :rules="param.rules">
                                  <template v-if="item.try">
                                    <el-input-number v-if="param.type === 'integer' || param.type === 'byte'" :step="1"
                                                     @input="updateForm(mainIndex)"
                                                     v-model="item.private[index].value"/>
                                    <el-input-number v-else-if="param.type === 'number'" @input="updateForm(mainIndex)"
                                                     v-model="item.private[index].value"/>
                                    <el-select v-else-if="param.type === 'boolean'" @change="updateForm(mainIndex)"
                                               v-model="item.private[index].value" placeholder="请选择">
                                      <el-option value="null" label="--">--</el-option>
                                      <el-option value="true" label="true">true</el-option>
                                      <el-option value="false" label="false">false</el-option>
                                    </el-select>
                                    <el-input v-else v-model="item.private[index].value"
                                              @input="updateForm(mainIndex)"/>
                                  </template>
                                  <template v-else>
                                    {{ param.default }}
                                  </template>
                                </el-form-item>
                              </el-col>
                            </el-row>

                          </el-collapse-item>
                          <el-collapse-item :name="3" v-if="item.common">
                            <template #title>
                              Query(Commmon)
                              <el-tooltip class="item" effect="dark"
                                          content="公共参数是以【公共参数】注解开头的参数归类到该分组"
                                          placement="right">
                                <i class="header-icon el-icon-info"/>
                              </el-tooltip>
                            </template>
                            <el-row style="font-weight: bold">
                              <el-col :span="4">
                                参数名
                              </el-col>
                              <el-col :span="2">
                                类型
                              </el-col>
                              <el-col :span="8">
                                描述
                              </el-col>
                              <el-col :span="6">
                                默认值
                              </el-col>
                            </el-row>
                            <el-row v-for="(param,index) in item.common" :key="index">
                              <el-col :span="4" class="name" v-bind:class="param.required?'required':''"
                                      @click="copy(param.name)">{{ param.name }}<span>* required</span>
                              </el-col>
                              <el-col :span="2">
                                {{ param.type }}
                              </el-col>
                              <el-col :span="8">
                                {{ param.description }}
                              </el-col>
                              <el-col :span="6">
                                <el-form-item v-if="item.try" :prop="'common.'+index+'.value'" :rules="param.rules">
                                  <el-input-number v-if="param.type === 'integer' || param.type === 'byte'" :step="1"
                                                   @input="updateForm(mainIndex)"
                                                   v-model="param.value"/>
                                  <el-input-number v-else-if="param.type === 'number'" @input="updateForm(mainIndex)"
                                                   v-model="param.value"/>
                                  <el-select v-else-if="param.type === 'boolean'" @change="updateForm(mainIndex)"
                                             v-model="param.value" placeholder="请选择">
                                    <el-option value="null" label="--">--</el-option>
                                    <el-option value="true" label="true">true</el-option>
                                    <el-option value="false" label="false">false</el-option>
                                  </el-select>
                                  <el-input v-else v-model="param.value" @input="updateForm(mainIndex)"/>
                                </el-form-item>
                                <template v-else>
                                  {{ param.default }}
                                </template>
                              </el-col>
                            </el-row>
                          </el-collapse-item>
                          <el-collapse-item title="Body" :name="4">
                            <el-row style="font-weight: bold">
                              <el-col :span="2">
                                files
                              </el-col>
                              <el-col :span="4">
                                文件名
                              </el-col>
                              <el-col :span="14">
                                <input type="file"/>
                              </el-col>
                            </el-row>
                            <el-row style="font-weight: bold">
                              <el-col :span="2">
                                params
                              </el-col>
                              <el-col :span="18">
                                <el-input
                                    :rows="10"
                                    type="textarea"
                                    placeholder="Please input"
                                />
                              </el-col>
                            </el-row>

                          </el-collapse-item>
                          <el-collapse-item v-if='item.responses["200"]["content"]["*/*"].schema.originalRef' :name="5">
                            <template #title>
                              {{
                                'Responses=>' + item.responses['200']['content']['*/*'].schema.originalRef.replaceAll('«', '<').replaceAll('»', '>')
                              }}
                            </template>
                            <el-tabs :model-value="item.modules[0].title">
                              <el-tab-pane v-for="(entity,mIndex) in item.modules" :label="entity.title"
                                           :name="entity.title" :key="mIndex" style="position: relative;">
                                <div v-if="entity.language === 'normal'">
                                  <el-row>
                                    <el-col :span="4">
                                      变量名
                                    </el-col>
                                    <el-col :span="4">
                                      类型
                                    </el-col>
                                    <el-col :span="8">
                                      描述
                                    </el-col>
                                  </el-row>
                                  <el-row v-for="(property,key,index) in entity.properties" :key="index">
                                    <el-col :span="4" class="name" @click="copy(key)">
                                      {{ key }}
                                    </el-col>
                                    <el-col :span="4">
                                      <template v-if="property.type === 'array' && property.items.originalRef">
                                        List&lt;{{ property.items.originalRef }}>
                                      </template>
                                      <template v-else-if="property.type === 'array'">
                                        {{ 'List<' + listRecursive(property.items) + '>' }}
                                      </template>
                                      <template v-else>
                                        {{ property.type }}
                                      </template>

                                    </el-col>
                                    <el-col :span="8">
                                      {{ property.description }}
                                    </el-col>
                                  </el-row>
                                </div>
                                <div v-else-if="entity.result" style="position: relative;margin-right: 12px;">
                                  <highlightjs autodetect :code="entity.result" style="border-radius: 6px;"
                                               :class="entity.language === 'Java'?'Java':'swift'"/>
                                </div>
                                <el-icon v-if="entity.language !== 'normal'" @click="copy(entity.result)" color="white"
                                         style="position: absolute;left: 8px;top: 8px;">
                                  <CopyDocument/>
                                </el-icon>
                                <el-radio-group class="language-radio"
                                                @change="changeLanguage(entity)" size="small"
                                                v-model="entity.language">
                                  <el-radio-button label="normal">常规</el-radio-button>
                                  <el-radio-button label="SwiftJson">SwiftJson</el-radio-button>
                                  <el-radio-button label="ObjectMapper">ObjectMapper</el-radio-button>
                                  <el-radio-button label="Java">Java</el-radio-button>
                                  <el-radio-button label="Json">Json</el-radio-button>
                                </el-radio-group>
                              </el-tab-pane>
                            </el-tabs>
                          </el-collapse-item>
                        </el-collapse>
                      </el-tab-pane -->
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

import {swiftCallExample, toSwiftJson} from "components/Module2Swift";
import {javaCallExample, retrofitCallExample, toJava} from "components/Module2Java";
import {jsCallExample, toJson} from "components/Module2Js";
import {toObjectMapper} from "components/Module2ObjectMapper";
import useClipboard from 'vue-clipboard3'
import {CircleCheck, Close} from "@element-plus/icons-vue";
import Params from "@/Params.vue";

let {toClipboard} = useClipboard();
export default {
  name: 'SwaggerUi',
  components: {Params, Close, CircleCheck},
  data() {
    return {
      canFetchFunc: false,//是否支持/swagger/method获取方法名
      groupName: null,
      resources: [{
        name: 'v4',
        url: '/v2/api-docs?group=v4',
        swaggerVersion: '2.0',
        location: '/v2/api-docs?group=v4',
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
      let that = this;
      this.$nextTick(function () {
        that.supportFetchFunc()
      })
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
        url: "/swagger-resources"
      }).then(res => {
        that.resources = res.data;
        if (that.groupName == null && res.data.length > 0) {
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

    //#region 添加自定义头
    headerChanged() {//公共头参数发生变化，存储到本地
      localStorage.setItem("headers", JSON.stringify(this.headers));
    },
    deleteHeader(index) {
      this.headers.splice(index, 1);
      localStorage.setItem("headers", JSON.stringify(this.headers));
    },
    addHeader() {
      if (this.headers == null) {
        this.headers = [];
      }
      this.headers.push({
        key: '',
        describe: '',
        value: ''
      });
      localStorage.setItem("headers", JSON.stringify(this.headers));
    },
    //#endregion

    groupChanged() {
      let docUrl;
      if (this.mockModel) {
        docUrl = "/v2/api-docs.json";
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
    updateForm(index) {
      this.items[index] = this.items[index];
      this.renderIndex += 1;
      this.$forceUpdate()
    },
    supportFetchFunc() {
      let that = this;
      $.ajax({
        xhrFields: {
          withCredentials: true
        },
        url: '/swagger/method',
        type: 'get',
        data: {url: '/', type: 'func'},
        cache: false,
        success: function (resp) {
          that.canFetchFunc = resp.result;
          console.log('是否支持获取方法名:' + that.canFetchFunc)
        },
        error: function (error) {
          console.log(error)
        }
      });
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
        if (data.paths.hasOwnProperty(path)) {
          let node = data.paths[path];
          for (let methodType in node) {
            if (node.hasOwnProperty(methodType)) {
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
        }
      }
      delete data.paths;
      this.form = data;
      console.log(JSON.stringify(data));
      this.keywordChanged();
      this.$forceUpdate();
    },

    listRecursive(ref) {
      if (ref.type === 'array' && ref.items.originalRef !== undefined) {
        return 'List<' + this.listRecursive(ref.items.originalRef) + '>'
      } else if (ref.type === 'array') {
        return ref.items.type
      } else if (ref.type !== undefined) {
        return ref.type
      } else {
        return ref
      }
    },
    findTagNode(tag, doc) {//查找根Tag
      for (let index = 0; index !== doc["tags"].length; ++index) {
        let entity = doc["tags"][index];
        if (entity.name === tag) {
          return entity
        }
      }
      return null
    },
    changeLanguage(entity) {
      console.log(entity.language)
      if (entity.language === 'SwiftJson') {
        entity.result = toSwiftJson(entity)
      } else if (entity.language === 'ObjectMapper') {
        entity.result = toObjectMapper(entity)
      } else if (entity.language === 'Java') {
        entity.result = toJava(entity)
      } else if (entity.language === 'Json') {
        entity.result = toJson(entity)
      }
      this.$forceUpdate()
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
        schema.originalRef = schema.$ref.substring('#/components/'.length);
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
      var temp = this.form.components; // take a copy of object
      if (!path) return temp; // if path is undefined or empty return the copy
      path = path.split("/");
      for (var p = 0; p !== path.length; ++p) {
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
      method.exe = 'swift';
      this.$forceUpdate()
    },
    parseModule(module, modules) {
      let index = module.title.indexOf('«');
      if (index > 0) {
        module.title = module.title.substring(0, index);
      }
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
            property.originalRef = property.$ref.substring('#/components/'.length)
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
              property.items.originalRef = property.items.$ref.substring('#/components/'.length);
            }
            if (property.items.originalRef !== undefined) {
              this.parseModule(this.getNodeByPath(property.items.originalRef), modules);
            } else if (property.items.type === 'array') {
              if (property.items.items.$ref !== undefined) {
                property.items.items.originalRef = property.items.items.$ref.substring('#/components/'.length);
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

.el-submenu__title .title {
  font-size: 16px;
  font-weight: 800;
  line-height: 30px;
}

.el-submenu__title .describes {
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

.summary {
  font-size: 12px;
  color: darkgray;
  margin-left: 12px;
}

.method {
  text-transform: uppercase;
  line-height: 36px;
  border-radius: 4px;
  display: inline-block;
  width: 60px;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
  color: white;
  margin-right: 8px;
  position: absolute;
  left: 16px;
  top: 7px;
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


.language-radio {
  position: absolute;
  right: 18px;
  top: 8px;
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
