<template>
  <el-main class="main-cards">
    <el-tab-pane label="Params" name="params">
      <el-collapse v-model="open" style="text-align: left">
        <el-collapse-item name="header">
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
          <el-row v-for="(it,index) in header" :key="index">
            <el-col :span="4" class="name">
              {{ it.name }}
            </el-col>
            <el-col :span="8">
              {{ it.description }}
            </el-col>
            <el-col :span="6">
              <template v-if="item.try">
                <el-input v-model="it.value" @input="headerChanged()"/>
              </template>
              <template v-else>
                {{ it.value }}
              </template>
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
        <el-collapse-item title="Query" name="query" v-if="query">

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
          <el-row v-for="(it,index) in query" :key="it.name">
            <el-col :span="4" class="name" @click="copy(it.name)">
              {{ it.name }}<span v-if="it.required">* required</span>
            </el-col>
            <el-col :span="2">
              {{ it.schema.type }}
            </el-col>
            <el-col :span="8">
              {{ it.description }}
            </el-col>
            <el-col :span="6">
              <el-form-item :prop="'private.'+index+'.value'" :rules="it.rules">
                <template v-if="item.try">
                  <el-input-number v-if="it.type === 'integer' || it.type === 'byte'" :step="1"
                                   @input="updateForm()"
                                   v-model="it.private[index].value"/>
                  <el-input-number v-else-if="param.type === 'number'" @input="updateForm()"
                                   v-model="it.private[index].value"/>
                  <el-select v-else-if="param.type === 'boolean'" @change="updateForm()"
                             v-model="it.private[index].value" placeholder="请选择">
                    <el-option value="null" label="--">--</el-option>
                    <el-option value="true" label="true">true</el-option>
                    <el-option value="false" label="false">false</el-option>
                  </el-select>
                  <el-input v-else v-model="it.private[index].value"
                            @input="updateForm()"/>
                </template>
                <template v-else>
                  {{ it.default }}
                </template>
              </el-form-item>
            </el-col>
          </el-row>

        </el-collapse-item>
        <el-collapse-item name="common" v-if="item.common">
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
                                 @input="updateForm()"
                                 v-model="param.value"/>
                <el-input-number v-else-if="param.type === 'number'" @input="updateForm()"
                                 v-model="param.value"/>
                <el-select v-else-if="param.type === 'boolean'" @change="updateForm()"
                           v-model="param.value" placeholder="请选择">
                  <el-option value="null" label="--">--</el-option>
                  <el-option value="true" label="true">true</el-option>
                  <el-option value="false" label="false">false</el-option>
                </el-select>
                <el-input v-else v-model="param.value" @input="updateForm()"/>
              </el-form-item>
              <template v-else>
                {{ param.default }}
              </template>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="Body" name="body">
          <el-row style="font-weight: bold" v-if="files">
            <el-col :span="2">
              files
            </el-col>
            <el-col :span="4">
              文件名
            </el-col>
            <el-col :span="14">
              <input type="file" name="file"/>
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
        <el-collapse-item v-if='item.responses["200"]["content"]["*/*"].schema.originalRef' name="response">
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
    </el-tab-pane>
  </el-main>
</template>

<script>
import {CircleCheck, Close} from "@element-plus/icons-vue";
import {swiftCallExample, toSwiftJson} from "components/Module2Swift";
import {toObjectMapper} from "components/Module2ObjectMapper";
import {javaCallExample, retrofitCallExample, toJava} from "components/Module2Java";
import {jsCallExample, toJson} from "components/Module2Js";
import useClipboard from "vue-clipboard3";
import {hasOwnPath} from "components/common";

let {toClipboard} = useClipboard();
export default {
  name: 'Params',
  components: {Close, CircleCheck},
  props: ['item'],
  data() {
    return {
      open: "query",
      header: null,
      query: null,
      common: null,
      body: null,
      files: null,
      multiFiles: false,
    }
  },
  mounted() {
    this.parseHeader();
    this.parseQuery();
    this.parseCommon();
    this.parseBody();
  },
  methods: {
    //# pre
    parseHeader() {
      if (hasOwnPath(this.item, "parameters")) {
        this.header = this.item["parameters"].filter((it) => it.hasOwnProperty("in") && it["in"] === "header");
      }
    },
    parseQuery() {
      if (hasOwnPath(this.item, "parameters")) {
        this.query = this.item["parameters"].filter((it) => it.hasOwnProperty("in") && it["in"] === "query");
      }
    },
    parseCommon() {

    },
    parseBody() {
      if (hasOwnPath(this.item, "requestBody.content.multipart/form-data.schema")) {
        let schema = this.item["requestBody"]["content"]["multipart/form-data"]["schema"];
        if (schema) {
          this.multiFiles = schema["properties"]["file"]["type"] === "array";
          this.files = [];
        }
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
    updateForm() {
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

</style>