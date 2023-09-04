<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
  <div class="main" v-loading="loading">
    <el-container style="height: 100%">
      <el-header>
        <el-row type="flex">
          <el-col :span="4">
            <el-select v-model="groupName" placeholder="请选择" title="选择分组"
                       @change="groupChanged">
              <el-option
                  v-for="item in resources"
                  :key="item.url"
                  :label="item.name"
                  :value="item.url">
              </el-option>
            </el-select>
          </el-col>
          <el-col v-if="form" :span="4">
            {{ form.info.title }}<span class="version">{{ form.info.version }}</span>
          </el-col>
          <el-col :span="16">
            <el-input v-model="keyword" @change="keywordChanged" placeholder="输入路径，名称以搜索" clearable/>
          </el-col>
        </el-row>
      </el-header>
      <el-container style="height: calc(100% - 50px);overflow: hidden;">
        <el-aside id="menu-aside" v-bind:style="{backgroundColor:'#f0f0f0',height:'100%',width:leftSize+'px'}">
          <el-scrollbar style="height: 100%;" v-if="form">
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
        <el-aside id="resizeBar" width="6px" class="resize"/>
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
                    <span class="path" v-clipboard:copy="item.path" v-clipboard:success="onCopy">{{ item.path }}</span>
                    <span class="summary">{{ item["summary"] }}</span>
                    <el-button type="success" v-if="item.try" @click="execute(item.path+'-'+item.method,item)"
                               style="position: absolute;right: 108px;top: 8px;" plain>执行
                    </el-button>
                    <el-button type="warning" v-if="item.try" @click="tryIt(item,false)"
                               style="position: absolute;right: 8px;top: 8px;" plain>取消
                    </el-button>
                    <el-button type="primary" v-else @click="tryIt(item,true)"
                               style="position: absolute;right: 8px;top: 8px;" plain>模拟调用
                    </el-button>
                  </div>
                  <div class="description" v-if="item.description && item.description !== ''">{{ item.description }}
                  </div>
                  <el-form :model="item" :ref="item.path+'-'+item.method" v-loading="item.executing">
                    <el-tabs type="border-card" v-model="item.tab" style="height: 100%">
                      <el-tab-pane label="参数" name="params">
                        <el-collapse v-model="item.open" style="text-align: left">
                          <el-collapse-item title="专有参数" :name="0" v-if="item.private">

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
                                      v-clipboard:copy="param.name"
                                      v-clipboard:success="onCopy">
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
                          <el-collapse-item :name="1" v-if="item.common">
                            <template slot="title">
                              公共参数
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
                                      v-clipboard:copy="param.name"
                                      v-clipboard:success="onCopy">
                                {{ param.name }}<span>* required</span>
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
                          <el-collapse-item :name="-1">
                            <template slot="title">
                              头部参数(headers)
                              <el-tooltip class="item" effect="dark"
                                          content="该部分设置为全局设置，设置后会存储在本地缓存中"
                                          placement="right">
                                <i class="header-icon el-icon-info"/>
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
                                <i class="el-icon-error" style="cursor: pointer" @click="deleteHeader(index)"
                                   title="删除该参数"></i>
                              </el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="4">
                                <i class="el-icon-circle-plus" style="cursor: pointer" @click="addHeader(index)"
                                   title="添加一条参数"></i>
                              </el-col>
                            </el-row>
                          </el-collapse-item>
                          <el-collapse-item
                              v-if='item.responses["200"]["content"]["*/*"].schema.originalRef'
                              :title="'结果实体'+item.responses['200']['content']['*/*'].schema.originalRef.replaceAll('«','<').replaceAll('»','>')"
                              :name="3">
                            <el-tabs :value="item.modules[0].title">
                              <el-tab-pane v-for="(entity,mIndex) in item.modules" :label="entity.title"
                                           :name="entity.title"
                                           :key="mIndex" style="position: relative;">
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
                                    <el-col :span="4" class="name" v-clipboard:copy="key" v-clipboard:success="onCopy">
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
                                <div v-else style="position: relative;margin-right: 12px;">
                                  <div v-highlight>
                            <pre style="margin-top: 0">
                            <code v-html="toHtml(entity.result)" style="border-radius: 6px;"
                                  :class="entity.language === 'Java'?'Java':'swift'"/>
                              </pre>
                                  </div>
                                </div>
                                <el-button v-if="entity.language !== 'normal'"
                                           style="position: absolute;right: 380px;top: 23px;"
                                           v-clipboard:copy="entity.result"
                                           v-clipboard:success="onCopy" size="mini" icon="el-icon-document-copy">copy
                                </el-button>
                                <el-radio-group class="language-radio"
                                                @change="changeLanguage(entity)" size="mini"
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
                      </el-tab-pane>
                      <el-tab-pane label="调用参考" name="execute" style="position: relative">
                        <el-tabs v-if="item.exe" v-model="item.exe" style="margin: 12px;">
                          <el-tab-pane name="swift" label="swift" style="position: relative;">
                            <div v-highlight>
                            <pre style="margin: 0;">
                              <code v-html="toHtml(item.swift)" style="border-radius: 6px;" class="swift"/>
                            </pre>
                            </div>
                            <el-button style="position: absolute;right: 0;top: 16px;" v-clipboard:copy="item.swift"
                                       type="mini" v-clipboard:success="onCopy">copy
                            </el-button>
                          </el-tab-pane>
                          <el-tab-pane name="retrofit" label="retrofit" style="position: relative;">
                            <div v-highlight>
                            <pre style="margin: 0">
                              <code v-html="toHtml(item.retrofit)" style="border-radius: 6px;" class="java"/>
                            </pre>
                            </div>
                            <el-button style="position: absolute;right: 0;top: 16px;" v-clipboard:copy="item.retrofit"
                                       type="mini"
                                       v-clipboard:success="onCopy">copy
                            </el-button>
                          </el-tab-pane>
                          <el-tab-pane name="axios" label="axios" style="position: relative;">
                            <div v-highlight>
                            <pre style="margin: 0">
                              <code v-html="toHtml(item.axios)" style="border-radius: 6px;" class="java"/>
                            </pre>
                            </div>
                            <el-button style="position: absolute;right: 0;top: 16px;" v-clipboard:copy="item.axios"
                                       type="mini"
                                       v-clipboard:success="onCopy">copy
                            </el-button>
                          </el-tab-pane>
                          <el-tab-pane name="java" label="java" style="position: relative;">
                            <div v-highlight>
                            <pre style="margin: 0">
                              <code v-html="toHtml(item.java)" style="border-radius: 6px;" class="java"/>
                            </pre>
                            </div>
                            <el-button style="position: absolute;right: 0;top: 16px;" v-clipboard:copy="item.java"
                                       type="mini"
                                       v-clipboard:success="onCopy">copy
                            </el-button>
                          </el-tab-pane>
                        </el-tabs>
                      </el-tab-pane>
                      <el-tab-pane v-if="item.result" label="执行结果" name="result" style="position: relative">
                        <div>调用耗时:{{ item.executeTime }}</div>
                        <div v-highlight>
                            <pre style="margin: 0 12px;">
                              <code v-html="item.result" style="border-radius: 6px;" class="json"/>
                            </pre>
                        </div>
                        <el-button style="position: absolute;right: 12px;top: 16px;" v-clipboard:copy="item.result"
                                   type="mini"
                                   v-clipboard:success="onCopy">copy
                        </el-button>
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

export default {
  name: 'SwaggerUi',
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
      mockModel: true,
    }
  },
  watch: {
    form: function () {
      let that = this;
      this.$nextTick(function () {
        $('#resizeBar').mousedown(function (e) {
          let event = window.event || e;
          let obj = (event.target) ? event.target : event.srcElement;
          if (obj.setCapture) {
            obj.setCapture();
          } else if (window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
          }
          that.moveTarget = obj
        });
        $(document).mousemove(function (e) {
          if (that.moveTarget != null) {
            let event = window.event || e;
            that.leftSize = event.pageX;
            $('#menu-aside').width(that.leftSize);
          }
        }).mouseup(function (e) {
          if (that.moveTarget != null) {
            let event = window.event || e;
            that.moveTarget = null;
            localStorage.setItem('menu-aside', event.pageX);
          }
        });
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
        that.resources = res;
        if (that.groupName == null) {
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
      console.log('groupChanged' + this.groupName);
      let docUrl;
      if (this.mockModel) {
        docUrl = "/v2/api-docs.json";
      } else {
        if (this.resources != null && this.resources.length > 0) {
          let items = this.resources.filter(resource => resource.url === this.groupName);
          if (items.length > 0) {
          } else {
            this.groupName = this.resources[0].url
          }
          docUrl = this.groupName;
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
      if (entity.language === 'SwiftJson') {
        entity.result = this.toSwiftJson(entity)
      } else if (entity.language === 'ObjectMapper') {
        entity.result = this.toObjectMapper(entity)
      } else if (entity.language === 'Java') {
        entity.result = this.toJava(entity)
      } else if (entity.language === 'Json') {
        entity.result = this.toJson(entity)
      }
      this.$forceUpdate()
    },

    //#region 生成实体类的方法
    toJson(module) {
      let code = '{\n';
      for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
          let property = module.properties[name];
          code += '    //' + property.description + '\n';
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    ' + name + ':[' + this.toJsonType(property.items.originalRef) + '],\n'
          } else if (property.type === 'array') {
            code += '    ' + name + ':[' + this.toJsonType(property.items) + '],\n'
          } else {
            code += '    ' + name + ':' + this.toJsonType(property) + ',\n'
          }
        }
      }
      code += '\n}';
      return code
    },
    toJava(module) {
      let code =
          '\n\nimport lombok.Data;\n\n' +
          'import java.util.List;\n' +
          '\n' +
          '/**\n' +
          ' * Created by @author yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          ' * Copyright © 2020 JO. All rights reserved.\n' +
          ' */\n' +
          '@Data\n' +
          'public class ' + module.title + ' {';

      for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
          let property = module.properties[name];
          code += '\n    /**\n' +
              '     *' + property.description +
              '\n     */\n';
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    private List<' + property.items.originalRef + '> ' + name + ';'
          } else if (property.type === 'array') {
            code += '    private List<' + this.toJavaType(property.items, property.format) + '> ' + name + ';'
          } else {
            code += '    private ' + this.toJavaType(property, property.format) + ' ' + name + ';'
          }
        }
      }
      code += '\n}';
      return code
    },
    toObjectMapper(module) {
      let code = '//\n' +
          '//  ' + module.title + '.swift\n' +
          '//  JO\n' +
          '//\n' +
          '//  Created by yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          '//  Copyright © 2020 JO. All rights reserved.\n' +
          '//\n' +
          '\n' +
          'import UIKit\n' +
          'import ObjectMapper \n' +
          '\n' +
          'class ' + module.title + ': Mappable {';

      let init = '\n    func mapping(map: Map) {';
      for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
          let property = module.properties[name];
          code += '\n    //' + property.description + '\n';
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    var ' + name + ': [' + property.items.originalRef + ']!';
            init += '\n        ' + name + ' <- map["' + name + '"]'
          } else if (property.type === 'array') {
            code += '    var ' + name + ': [' + this.toSwiftType(property.items, false, property.format) + ']!';
            init += '\n        ' + name + ' <- map["' + name + '"]'
          } else {
            code += '    var ' + name + ': ' + this.toSwiftType(property, true, property.format);
            init += '\n        ' + name + ' <- map["' + name + '"]'
          }
        }
      }
      init += '\n    }';
      code += '\n\n    required init?(map: Map){\n' +
          '    }\n';
      code += init;
      code += '\n}';

      return code
    },
    toSwiftJson(module) {
      let code = '//\n' +
          '//  ' + module.title + '.swift\n' +
          '//  JO\n' +
          '//\n' +
          '//  Created by yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          '//  Copyright © 2020 JO. All rights reserved.\n' +
          '//\n' +
          '\n' +
          'import UIKit\n' +
          'import SwiftyJSON \n' +
          '\n' +
          'class ' + module.title + ' {';

      let init = '\n\n    init(json: JSON) {';
      for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
          let property = module.properties[name];
          code += '\n    //' + property.description + '\n';
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    var ' + name + ': [' + property.items.originalRef + ']!';
            init += '\n       ' + name + ' = json["' + name + '"].arrayValue.map({ (json) -> ' + property.items.originalRef + ' in\n' +
                '            return ' + property.items.originalRef + '(json: json)\n' +
                '       })'
          } else if (property.type === 'array') {
            code += '    var ' + name + ': [' + this.toSwiftType(property.items, false, property.format) + ']!';
            init += '\n       ' + name + ' = json["' + name + '"].arrayObject as! [' + this.toSwiftType(property.items, false, property.format) + ']'
            //
          } else {
            code += '    var ' + name + ': ' + this.toSwiftType(property, true, property.format);
            init += '\n       ' + name + ' = json["' + name + '"]' + this.toSwiftJsonValue(property.type, property.format)
          }
        }
      }
      init += '\n    }';
      code += init;
      code += '\n}';

      return code
    },
    toSwiftJsonValue(type, format) {
      switch (type) {
        case 'integer':
          if (format !== undefined) {
            if (format === 'int64') {
              return '.int64Value';
            }
          }
          return '.intValue';
        case 'byte':
          return ".int8Value";
        case 'number':
          return '.doubleValue';
        case 'string':
          if (format === 'date-time') {
            return '.int64Value';
          } else if (format === 'byte') {
            return '.int8Value';
          }
          return '.stringValue';
        case 'boolean':
          return '.boolValue';
        default:
          return ''
      }
    },
    //#endregion

    //#region 类型转化
    toJavaType(property, format) {
      if (property.type === undefined) {
        return this.toJavaBaseType(property, format)
      }
      switch (property.type) {
        case 'integer':
          if (format !== undefined) {
            if (format === 'int64') {
              return 'Long';
            }
          }
          return 'Integer';
        case 'byte':
          return "Byte";
        case 'number':
          return 'Double';
        case 'string':
          if (format === 'date-time') {
            return 'DateTime';
          } else if (format === 'byte') {
            return 'Byte';
          }
          return 'String';
        case 'boolean':
          return 'Boolean';
        case 'array':
          return 'List<' + this.toJavaType(property.items.originalRef, property.items.format) + '>';
        default:
          return property.type;
      }
    },
    toJavaBaseType(property, format) {
      switch (property) {
        case 'integer':
          if (format !== undefined) {
            if (format === 'int64') {
              return 'Long'
            }
          }
          return 'Integer';
        case 'byte':
          return "Byte";
        case 'number':
          return 'Double';
        case 'string':
          if (format === 'date-time') {
            return 'DateTime';
          } else if (format === 'byte') {
            return 'Byte';
          }
          return 'String';
        case 'boolean':
          return 'Boolean';
        default:
          return property;
      }
    },
    toJsonType(property) {
      if (property.type === undefined) {
        return property
      }
      switch (property.type) {
        case 'integer':
          return 0;
        case 'number':
          return 0;
        case 'byte':
          return 0;
        case 'string':
          if (property.format === 'date-time') {
            return '0';
          } else if (property.format === 'byte') {
            return '0';
          }
          return '\'\'';
        case 'boolean':
          return 'false';
        case 'array':
          return '[]';
        default:
          return null;
      }
    },
    toSwiftType(property, init, format) {
      if (property.type === undefined) {
        return property
      }
      switch (property.type) {
        case 'integer':
          if (format !== undefined) {
            if (format === 'int64') {
              return 'Int64' + (init ? ' = 0' : '');
            }
          }
          return 'Int' + (init ? ' = 0' : '');
        case 'byte':
          return 'Int8' + (init ? ' = 0' : '');
        case 'number':
          return 'Double' + (init ? ' = 0.0' : '');
        case 'string':
          if (format === 'date-time') {
            return 'Int64' + (init ? ' = 0' : '');
          } else if (format === 'byte') {
            return 'Int8' + (init ? ' = 0' : '');
          }
          return 'String' + (init ? ' = ""' : '');
        case 'boolean':
          return 'Bool' + (init ? ' = false' : '');
        case 'array':
          return '[' + this.toSwiftType(property.items.originalRef, false, property.items.format) + ']';
        default:
          return property.type + '!';
      }
    },
    //#endregion

    tryIt(item, op) {
      item.try = op;
      if (op && !item.open.contains(1)) {
        item.open.push(1);
      }

      this.renderIndex += 1;
      this.$forceUpdate();
    },
    removeTab(targetName) {
      for (let index = 0; index !== this.items.length; ++index) {
        if ((this.items[index].path + '-' + this.items[index].method) === targetName) {
          this.items.splice(index, 1);
          if (targetName === this.activeName && this.items.length > 0) {
            this.activeName = this.items[0].path + '-' + this.items[0].method
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
        method.parameters = null
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
      //swift 调用
      let url = method.path;
      let javaUrl = method.path;
      let comment = '    /// ' + method["summary"] + '\n';
      if (method.description) {
        comment += '    /// ' + method.description + '\n';
      }
      comment += '    ///\n    /// - Parameters:';

      let funStr = '    class func ' + method["operationId"] + '(';
      let req = '';
      let javaParam = null;

      let retrofitParam = '';
      let axiosParam = '';
      let retrofit = '        /**\n' +
          '         * ' + method["summary"] + '\n';
      if (method.description) {
        retrofit += '         * ' + method.description + '\n'
      }
      retrofit += '         *\n';

      if (method.private !== undefined) {
        javaParam = '    Map<String, Object> parameters = new HashMap<>();\n';
        for (let m = 0; m !== method.private.length; ++m) {
          comment += '\n    ///   - ' + method.private[m].name + ': ' + method.private[m].description;
          funStr += '_ ' + method.private[m].name + ':' + this.toSwiftType(method.private[m], false, method.private[m].format);
          if (method.private[m].required) {
            funStr += ','
          } else {
            funStr += '!,'
          }

          retrofit += '         * @param ' + method.private[m].name + ' ' + method.private[m].description + '\n';

          if (method.private[m].in === 'path') {
            retrofitParam += '@Path("' + method.private[m].name + '") ' + this.toJavaType(method.private[m].type, method.private[m].format) + ' ' + method.private[m].name + ',';
            url = url.replace('{' + method.private[m].name + '}', '\\(' + method.private[m].name + ')');
            javaUrl = javaUrl.replace('{' + method.private[m].name + '}', '\"+' + method.private[m].name + '+\"')
          } else {
            retrofitParam += '@Query("' + method.private[m].name + '") ' + this.toJavaType(method.private[m].type, method.private[m].format) + ' ' + method.private[m].name + ',';
            javaParam += '    //' + method.private[m].description + '\n';
            axiosParam += '        ' + method.private[m].name + ': "",//' + (method.private[m].required ? '(*)' : '') + method.private[m].description + '\n';
            javaParam += '    parameters.put("' + method.private[m].name + '", ' + method.private[m].name + ');\n';
            req += '"' + method.private[m].name + '":' + method.private[m].name + ','
          }
        }
      }

      retrofit += '         * @return 结果\n         */\n';

      let entity = null;
      let ref = method["responses"]['200']["content"]["*/*"].schema.originalRef;
      let index = ref.indexOf('«');
      let arr = false;
      if (ref.startsWith('RespEntity«List«')) {
        entity = ref.substring('RespEntity«List«'.length, ref.indexOf('»'));
        arr = true
      } else if (ref.startsWith('RespEntity«')) {
        entity = ref.substring('RespEntity«'.length, ref.indexOf('»'));
      } else if (index > 0) {
        entity = ref.substring(0, index);
      } else {
        entity = ref;
      }

      //region java 原始方式
      let javaCode = '//' + method["summary"] + '\n';
      if (method.description) {
        javaCode += '// ' + method.description + '\n'
      }
      javaCode += 'if (NetWorkHelper.isNetworkAvailable(getApplicationContext())) {\n' + (javaParam ? javaParam : '');
      javaCode += '    HttpUtil.getInstance().' + method.method + '(Url.getCollectionUrl(true) + "' + javaUrl + '", ' + (javaParam ? 'parameters' : 'null') + ', new HttpUtil.HttpCallback() {\n' +
          '        @Override\n' +
          '        public void onSuccess(String data) {\n' +
          '            \n' +
          '        }\n' +
          '\n' +
          '        @Override\n' +
          '        public void onError(String msg) {\n' +
          '            super.onError(msg);\n' +
          '            errorResponse(msg);\n' +
          '        }\n' +
          '    }, this);\n' +
          '}';

      method.java = javaCode;
      //endregion

      //region axios的调用生成
      let axios = '//' + method["summary"] + '\n';
      if (method.description) {
        axios += '// ' + method.description + '\n'
      }
      axios += 'this.axios({\n';
      axios += "    method: '" + method.method.toUpperCase() + "',\n"
      axios += "    url: `" + method.path + "`,\n"
      if (axiosParam !== '') {
        axios += "    params: {\n"
        axios += axiosParam;
        axios += "    }\n"
      }
      axios += "}).then(res => {\n"
      axios += "    if (res.code === 0) {\n"
      axios += "      //this.$message.success('保存成功');\n"
      axios += "    } else {\n"
      axios += "      //this.$message.error(`保存失败, 错误：${res.message}`);\n"
      axios += "    }\n"
      axios += "}).catch(error => {\n       console.log(error);\n});\n";
      method.axios = axios;
      //endregion

      //region retrofit的调用生成
      retrofit += '        @' + method.method.toUpperCase() + '("' + method.path + '")\n';
      retrofit += '        Observable<' + (ref.replaceAll('«', '<').replaceAll('»', '>')) + '> ' + method["operationId"] + '('
      if (retrofitParam !== '') {
        retrofit += retrofitParam.substring(0, retrofitParam.length - 1)
      }
      retrofit += ');';
      if (arr) {
        funStr += '/*imgData: [Data]?,*/_ callback:(([' + entity + ']?) -> Void)?){\n'
      } else {
        funStr += '/*imgData: [Data]?,*/_ callback:((' + entity + '?) -> Void)?){\n'
      }

      if (req !== '') {
        req = req.substring(0, req.length - 1);
        funStr += '        let req:[String:Any]=[' + req + ']\n';
        funStr += '        request(url: "' + url + '", method: .' + method.method + ', params: req/*, imgData*/) { (code, message, jsonString) in\n'
      } else {
        funStr += '        request(url: "' + url + '", method: .' + method.method + ', params: nil/*, imgData*/) { (code, message, jsonString) in\n'
      }

      funStr += '            DispatchQueue.main.async(){\n' +
          '                if code == 0,let json = jsonString {\n';
      if (arr) {
        funStr += '                    callback?(Mapper<' + entity + '>().mapArray(JSONString:json))\n'
      } else {
        funStr += '                    callback?(Mapper<' + entity + '>().map(JSONString:json))\n'
      }
      funStr += '                }else{\n' +
          '                    callback?(nil)\n' +
          '                }\n' +
          '            }\n' +
          '        }\n' +
          '    }';
      method.swift = comment + '\n' + funStr;

      method.retrofit = retrofit;
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
    },

    //#region 公共方法
    onCopy() {
      this.$message.success('复制成功')
    },
    toHtml(str) {
      return str.replaceAll('<', '&lt;');
    },
    formatDate(date) {
      let fmt = 'yyyy-MM-dd hh:mm:ss';
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      };
      for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + '';
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
        }
      }
      return fmt
    }
    //#endregion
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
}

.patch .method {
  background-color: #E6A23C;
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
  right: 12px;
  top: 23px;
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
  padding: 0;
}

.el-tabs {
  height: 100% !important;
}

code {
  font-size: 12px;
  line-height: 16px;
}
</style>
