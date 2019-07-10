<template xmlns:v-clipboard="http://www.w3.org/1999/xhtml">
  <div class="main" v-loading="loading">

    <el-container style="height: 100%;overflow: hidden;">
      <el-aside id="menu-aside" v-bind:style="{backgroundColor:'#2c3e50',height:'100%',width:leftSize+'px'}">
        <el-container style="height:100%">
          <el-header>
            {{form.info.title}}
          </el-header>
          <el-scrollbar style="height: 100%;">
            <el-menu class="el-menu-vertical-demo" style="text-align: left;" @select="handleOpenItem">
              <el-submenu v-for="(tag,index) in form.tags" :index="index+''" :key="index">
                <template slot="title">
                  <div class="title" slot="title">{{tag.name}}</div>
                  <div class="describes">{{tag.description}}</div>
                </template>
                <el-menu-item-group>
                  <el-menu-item index="1-1" v-for="(func,m) in tag.items" :key="m" :index="index+'-'+m"
                                v-bind:class="func.deprecated ? 'deprecated':func.method">
                    <template>
                      <span class="method">{{func.method}}</span>{{func.path}}<br/>
                      <span class="summary">{{func.summary}}</span>
                    </template>
                  </el-menu-item>
                </el-menu-item-group>
              </el-submenu>
            </el-menu>
          </el-scrollbar>
        </el-container>
      </el-aside>
      <el-aside id="resizeBar" width="6px" class="resize"/>
      <el-main class="main-cards" v-if="renderIndex">
        <el-tabs v-if="items.length > 0" type="border-card" v-model="activeName" style="height: 100%" closable
                 @tab-remove="removeTab">
          <el-tab-pane v-for="(item,INDEXS) in items" :key="INDEXS" :name="item.path+item.method"
                       :label="item.path" style="height: 100%">
            <el-scrollbar style="height: 100%;">
              <el-card class="box-card" v-bind:class="item.method">
                <div slot="header" class="card-header">
                  <span class="method">{{item.method}}</span><span class="path" v-clipboard:copy="item.path"
                                                                   v-clipboard:success="onCopy">{{item.path}}</span><span
                  class="summary">{{item.summary}}</span>
                  <el-button type="success" v-if="item.try" @click="tryIt(INDEXS,false)"
                             style="position: absolute;right: 168px;top: 8px;" plain>Execute!
                  </el-button>
                  <el-button type="warning" v-if="item.try" @click="tryIt(INDEXS,false)"
                             style="position: absolute;right: 68px;top: 8px;" plain>Cancel!
                  </el-button>
                  <el-button type="primary" v-else @click="tryIt(INDEXS,true)"
                             style="position: absolute;right: 68px;top: 8px;" plain>Try it out!
                  </el-button>
                  <el-button icon="el-icon-close" @click="deleteItem(index)"
                             style="position: absolute;right: 8px;top: 8px;" circle/>
                </div>
                <div class="description" v-if="item.description && item.description !== ''">{{item.description}}</div>
                <el-collapse value="private" style="text-align: left">
                  <el-collapse-item title="专有参数" name="private" v-if="item.private">
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
                    <el-row v-for="(param,index) in item.private" :key="index">
                      <el-col :span="4" class="name" v-bind:class="param.required?'required':''"
                              v-clipboard:copy="param.name"
                              v-clipboard:success="onCopy">
                        {{param.name}}<span>* required</span>
                      </el-col>
                      <el-col :span="2">
                        {{param.type}}
                      </el-col>
                      <el-col :span="8">
                        {{param.description}}
                      </el-col>
                      <el-col :span="6">
                        <template v-if="item.try">
                          <el-input v-model="param.value"/>
                        </template>
                        <template v-else>
                          {{param.default}}
                        </template>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                  <el-collapse-item title="公共参数" name="common" v-if="item.common">
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
                        {{param.name}}<span>* required</span>
                      </el-col>
                      <el-col :span="2">
                        {{param.type}}
                      </el-col>
                      <el-col :span="8">
                        {{param.description}}
                      </el-col>
                      <el-col :span="6">
                        <template v-if="item.try">
                          <el-input v-model="param.value"/>
                        </template>
                        <template v-else>
                          {{param.default}}
                        </template>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                  <el-collapse-item name="module"
                                    :title="'结果实体'+item.responses['200'].schema.originalRef.replaceAll('«','<').replaceAll('»','>')">
                    <el-tabs :value="item.modules[0].title">
                      <el-tab-pane v-for="(entity,mIndex) in item.modules" :label="entity.title" :name="entity.title"
                                   :key="index" style="position: relative;">
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
                            <el-col :span="4" class="name">
                              {{key}}
                            </el-col>
                            <el-col :span="4">
                              <template v-if="property.type === 'array' && property.items.originalRef">
                                List<{{property.items.originalRef}}>
                              </template>
                              <template v-else-if="property.type === 'array'">
                                List<{{property.items.type}}>
                              </template>
                              <template v-else>
                                {{property.type}}
                              </template>

                            </el-col>
                            <el-col :span="8">
                              {{property.description}}
                            </el-col>
                          </el-row>
                        </div>
                        <div v-else style="position: relative;margin-right: 12px;">
                          <div v-highlight>
                            <pre style="margin-top: 0">
                            <code v-html="entity.result" style="border-radius: 6px;"
                                  :class="entity.language === 'java'?'java':'swift'"></code>
                              </pre>
                          </div>
                        </div>
                        <el-button v-if="entity.language !== 'normal'"
                                   style="position: absolute;right: 330px;top: 23px;" v-clipboard:copy="entity.result"
                                   v-clipboard:success="onCopy" size="mini" icon="el-icon-document-copy">copy
                        </el-button>
                        <el-radio-group class="language-radio"
                                        @change="changeLanguage(entity)" size="mini"
                                        v-model="entity.language">
                          <el-radio-button label="normal">常规</el-radio-button>
                          <el-radio-button label="SwiftJson">SwiftJson</el-radio-button>
                          <el-radio-button label="ObjectMapper">ObjectMapper</el-radio-button>
                          <el-radio-button label="Java">Java</el-radio-button>
                        </el-radio-group>
                      </el-tab-pane>
                    </el-tabs>
                  </el-collapse-item>
                  <el-collapse-item title="执行结果" name="result" style="position: relative" v-if="item.result">
                    <el-input
                      v-model="item.result"
                      style="margin-top: 12px;width: calc(100% - 24px)"
                      type="textarea"
                      :autosize="{ minRows: 10, maxRows: 30}"
                      readonly>
                    </el-input>
                    <el-button style="position: absolute;right: 24px;top: 62px;" v-clipboard:copy="item.result"
                               v-clipboard:success="onCopy">copy
                    </el-button>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>

  const docs = require('../assets/api-docs')//动作的信息
  export default {
    name: 'SwaggerUi',
    data () {
      return {
        leftSize: 400,
        moving: false,
        activeName: '',
        renderIndex: 1,
        loading: false,
        form: null,
        items: []
      }
    },
    watch: {
      form: function () {
        this.$nextTick(function () {
          $('#resizeBar').mousedown(function (event) {
            this.moving = true
          }).mousemove(function (event) {
            if (this.moving) {
              this.leftSize = event.pageX
              console.log(this.leftSize)
              $('#menu-aside').width(this.leftSize)
            }
          }).mouseup(function (event) {
            this.moving = false
          })
        })
      }
    },
    mounted () {
      let that = this
      for (let path in docs.paths) {
        let node = docs.paths[path]
        for (let method in node) {
          var func = node[method]
          var tag = func.tags[0]
          var tagNode = this.findTagNode(tag)
          if (tagNode != null) {
            if (tagNode.items === undefined) {
              tagNode.items = []
            }
            func['path'] = path
            func['method'] = method
            tagNode.items.push(func)
          }
        }
      }
      that.form = docs

    },
    methods: {
      onCopy () {
        this.$message.success('复制成功')
      },
      findTagNode: function (tag) {
        for (var name in docs.tags) {
          if (docs.tags[name].name === tag) {
            return docs.tags[name]
          }
        }
        return null
      },

      changeLanguage (entity) {
        if (entity.language === 'SwiftJson') {
          entity.result = this.toSwiftJson(entity)
        } else if (entity.language === 'ObjectMapper') {
          entity.result = this.toObjectMapper(entity)
        } else if (entity.language === 'Java') {
          entity.result = this.toJava(entity)
        }
        this.$forceUpdate()
      },
      toJava (module) {
        var code =
          '\n\nimport javax.persistence.*;\n' +
          'import lombok.Data;\n\n' +
          'import java.util.List;\n' +
          '\n' +
          '/**\n' +
          ' * Created by @author yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          ' * Copyright © 2019 CHANGE. All rights reserved.\n' +
          ' */\n' +
          '@Data\n' +
          'public class ' + module.title + ' {'

        for (let name in module.properties) {
          let property = module.properties[name]
          code += '\n    /**\n' +
            '     *' + property.description +
            '\n     */\n'
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    private List<' + property.items.originalRef + '> ' + name + ';'
          } else if (property.type === 'array') {
            code += '    private List<' + this.toJavaType(property.type) + '> ' + name + ';'
          } else {
            code += '    private ' + this.toJavaType(property.type) + ' ' + name + ';'
          }
        }
        code += '\n}'
        return code
      },
      toSwiftJson (module) {
        var code = '//\n' +
          '//  ' + module.title + '.swift\n' +
          '//  Change\n' +
          '//\n' +
          '//  Created by yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          '//  Copyright © 2019 CHANGE. All rights reserved.\n' +
          '//\n' +
          '\n' +
          'import UIKit\n' +
          'import SwiftyJSON \n' +
          '\n' +
          'class ' + module.title + ' {'

        var init = '\n\n    init(json: JSON) {'
        for (let name in module.properties) {
          let property = module.properties[name]
          code += '\n    //' + property.description + '\n'
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    var ' + name + ': [' + property.items.originalRef + ']!'
            init += '\n       ' + name + ' = json["' + name + '"].arrayValue.map({ (json) -> ' + property.items.originalRef + ' in\n' +
              '            return ' + property.items.originalRef + '(json: json)\n' +
              '       })'
          } else if (property.type === 'array') {
            code += '    var ' + name + ': [' + this.toSwiftType(property.items.type, false) + ']!'
            init += '\n       ' + name + ' = json["' + name + '"].arrayObject as! [' + this.toSwiftType(property.items.type, false) + ']'
            //
          } else {
            code += '    var ' + name + ': ' + this.toSwiftType(property.type, true)
            init += '\n       ' + name + ' = json["' + name + '"]' + this.toSwiftJsonValue(property.type)
          }
        }
        init += '\n    }'
        code += init
        code += '\n}'

        return code
      },
      toObjectMapper (module) {
        var code = '//\n' +
          '//  ' + module.title + '.swift\n' +
          '//  Change\n' +
          '//\n' +
          '//  Created by yaojunguang on ' + this.formatDate(new Date()) + '.\n' +
          '//  Copyright © 2019 CHANGE. All rights reserved.\n' +
          '//\n' +
          '\n' +
          'import UIKit\n' +
          'import SwiftyJSON \n' +
          '\n' +
          'class ' + module.title + ' {'

        var init = '\n    func mapping(map: Map) {'
        for (let name in module.properties) {
          let property = module.properties[name]
          code += '\n    //' + property.description + '\n'
          if (property.type === 'array' && property.items.originalRef !== undefined) {
            code += '    var ' + name + ': [' + property.items.originalRef + ']!'
            init += '\n        ' + name + ' <- map["' + name + '"]'
          } else if (property.type === 'array') {
            code += '    var ' + name + ': [' + this.toSwiftType(property.items.type, false) + ']!'
            init += '\n        ' + name + ' <- map["' + name + '"]'
          } else {
            code += '    var ' + name + ': ' + this.toSwiftType(property.type, true)
            init += '\n        ' + name + ' <- map["' + name + '"]'
          }
        }
        init += '\n    }'
        code += '\n\n    required init?(map: Map){\n' +
          '    }\n'
        code += init
        code += '\n}'

        return code
      },
      toSwiftJsonValue (type) {
        switch (type) {
          case 'integer':
            return '.intValue'
          case 'number':
            return '.doubleValue'
          case 'string':
            return '.stringValue'
          case 'boolean':
            return '.boolValue'
          default:
            return ''
        }
      },
      toJavaType (type) {
        switch (type) {
          case 'integer':
            return 'Integer'
          case 'number':
            return 'Double'
          case 'string':
            return 'String'
          case 'boolean':
            return 'Boolean'
          default:
            return 'Object'
        }
      },
      toSwiftType (type, init) {
        switch (type) {
          case 'integer':
            return 'Int' + (init ? ' = 0' : '')
          case 'number':
            return 'Double' + (init ? ' = 0.0' : '')
          case 'string':
            return 'String' + (init ? ' = ""' : '')
          case 'boolean':
            return 'Bool' + (init ? ' = false' : '')
          default:
            return 'JSON!'
        }
      },

      tryIt (index, op) {
        this.items[index].try = op
        this.renderIndex += 1
        this.$forceUpdate()
      },
      deleteItem (index) {
        this.items.splice(index, 1)
      },
      removeTab (targetName) {
        for (var index = 0; index !== this.items.length; ++index) {
          if (this.items[index].path + this.items[index].method === targetName) {
            this.items.splice(index, 1)
            if (targetName === this.activeName && this.items.length > 0) {
              this.activeName = this.items[0].path + this.items[0].method
            }
            return
          }
        }
        this.$forceUpdate()
      },
      handleOpenItem (key, keyPath) {
        let keys = key.split('-')
        var func = this.form.tags[keys[0]].items[keys[1]]

        for (var name in this.items) {
          if (this.items[name].path === func.path && this.items[name].method === func.method) {
            this.activeName = func.path + func.method
            return
          }
        }
        if (func.parameters != null) {
          for (var index in func.parameters) {
            let param = func.parameters[index]
            param.value = param.default
            if (param.description.startsWith('【公共参数】')) {
              if (func.common === undefined) {
                func.common = []
              }
              func.common.push(param)
            } else {
              if (func.private === undefined) {
                func.private = []
              }
              func.private.push(param)
            }
          }
          func.parameters = null
        }

        //找出所有的关联对象
        var ref = func.responses['200'].schema.originalRef
        var modules = []
        this.parseModule(this.form.definitions[ref], modules)
        func.modules = modules
        this.items.push(this.form.tags[keys[0]].items[keys[1]])
        this.activeName = func.path + func.method
      },
      parseModule (module, modules) {
        var index = module.title.indexOf('«')
        if (index > 0) {
          module.title = module.title.substring(0, index)
        }
        if (modules.filter(item => item.title === module.title).length === 0) {
          module.language = 'normal'
          modules.push(module)
        }
        for (var prop in module.properties) {
          if (module.properties[prop].originalRef !== undefined) {
            if (module.properties[prop].originalRef === 'Timestamp') {
              module.properties[prop].type = 'number'
            } else {
              this.parseModule(this.form.definitions[module.properties[prop].originalRef], modules)
              module.properties[prop].type = this.form.definitions[module.properties[prop].originalRef].title
            }
          } else if (module.properties[prop].type === 'array') {
            if (module.properties[prop].items.originalRef != undefined) {
              this.parseModule(this.form.definitions[module.properties[prop].items.originalRef], modules)
            }
          }
        }
      },
      formatDate (date) {
        var fmt = 'yyyy-MM-dd hh:mm:ss'
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
        }
        for (let k in o) {
          if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + ''
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
          }
        }
        return fmt
      }
    }
  }
</script>

<style scoped>
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
    line-height: 20px;
    position: relative;
    padding-top: 5px;
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
    cursor: w-resize;
  }

  .resize:hover {
    background-color: #f0f0f0;
  }

  .get .method {
    background-color: #61affe;
  }

  .post .method {
    background-color: #49cc90;
  }

  .delete .method {
    background-color: #f93e3e;
  }

  .patch .method {
    border-color: #50e3c2;
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
    overflow: auto;
  }

  .main-cards .get {
    border: 1px solid #61affe;
    background-color: rgba(97, 175, 254, 0.1);
  }

  .main-cards .post {
    border: 1px solid #49cc90;
    background-color: rgba(73, 204, 144, 0.1);
  }

  .main-cards .delete {
    border: 1px solid #f93e3e;
    background-color: rgba(249, 62, 62, 0.1);
  }

  .main-cards .patch {
    border: 1px solid #50e3c2;
    background-color: rgba(80, 227, 194, 0.1);
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
    line-height: 20px;
    text-align: left;
    text-indent: 80px;
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
    background-color: transparent;
    padding-left: 24px;
  }

  .el-card__body {
    padding: 0;
  }

  .el-tabs--border-card {
    -webkit-box-shadow: none;
    box-shadow: none;
    border: none;
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
</style>
