<template>
  <el-tab-pane label="Params" name="params">
    <el-collapse v-model="open" style="text-align: left">
      <el-collapse-item name="header">
        <template #title>
          <span style="padding-left: 16px"> Header</span>
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
            <template v-if="tryIt">
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
      <el-collapse-item name="query" v-if="query">
        <template #title>
          <span style="padding-left: 16px">Query</span>
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
        <el-row v-for="(it,index) in query" :key="it.name">
          <el-col :span="4" class="name" @click="copy(it.name)">
            {{ it.name }}<span v-if="it.required" class="required">* required</span>
          </el-col>
          <el-col :span="2">
            {{ it.schema.type }}
          </el-col>
          <el-col :span="8">
            {{ it.description }}
          </el-col>
          <el-col :span="6">
            <el-form-item :prop="'private.'+index+'.value'" :rules="it.rules">
              <template v-if="tryIt">
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
      <el-collapse-item name="common" v-if="common">
        <template #title>
          <span style="padding-left: 16px"> Query(Commmon)</span>
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
        <el-row v-for="(param,index) in common" :key="index">
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
            <el-form-item v-if="tryIt" :prop="'common.'+index+'.value'" :rules="param.rules">
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
      <el-collapse-item name="body">
        <template #title>
          <span style="padding-left: 16px">Body</span>
        </template>
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
      <el-collapse-item v-if='responses' name="response">
        <template #title>
          <span style="padding-left: 16px">{{ 'Responses=>' + responses.entityName }}</span>
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
              <el-radio-button value="normal">常规</el-radio-button>
              <el-radio-button value="SwiftJson">SwiftJson</el-radio-button>
              <el-radio-button value="ObjectMapper">ObjectMapper</el-radio-button>
              <el-radio-button value="Java">Java</el-radio-button>
              <el-radio-button value="Json">Json</el-radio-button>
              <el-radio-button value="ArkTs">ArkTs</el-radio-button>
            </el-radio-group>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-tab-pane>
</template>

<script>
import {CircleCheck, CirclePlus, Close, CopyDocument, InfoFilled} from "@element-plus/icons-vue";
import {toSwiftJson} from "components/Module2Swift";
import {toObjectMapper} from "components/Module2ObjectMapper";
import {toJava} from "components/Module2Java";
import {toJson} from "components/Module2Js";
import useClipboard from "vue-clipboard3";
import {hasOwnPath} from "components/common";
import {toArkTs} from "components/Module2ArkTs";

let {toClipboard} = useClipboard();
export default {
  name: 'Params',
  components: {CopyDocument, InfoFilled, CirclePlus, Close, CircleCheck},
  props: ['item','tryIt'],
  data() {
    return {
      open: "query",
      header: null,
      query: null,
      common: null,
      body: null,
      files: null,
      multiFiles: false,
      responses: null
    }
  },
  mounted() {
    this.parseHeader();
    this.parseResponses();
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
        const method = this.item;
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
        }
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
    parseResponses() {
      if (hasOwnPath(this.item, "responses.200.content.*/*.schema.$ref")) {
        let path = this.item["responses"]["200"]["content"]["*/*"]["schema"]["$ref"]
        this.responses = {
          entityName: path.replace('#/components/schemas/', '').replaceAll('«', '<').replaceAll('»', '>'),
          entityPath: path
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
    changeLanguage(entity) {
      if (entity.language === 'SwiftJson') {
        entity.result = toSwiftJson(entity)
      } else if (entity.language === 'ObjectMapper') {
        entity.result = toObjectMapper(entity)
      } else if (entity.language === 'Java') {
        entity.result = toJava(entity)
      } else if (entity.language === 'Json') {
        entity.result = toJson(entity)
      } else if (entity.language === 'ArkTs') {
        entity.result = toArkTs(entity)
      }
      this.$forceUpdate()
    }
  }
}
</script>


<style scoped>
.required {
  color: orangered;
}

.language-radio {
  position: absolute;
  right: 18px;
  top: 8px;
}
</style>