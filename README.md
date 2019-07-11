# swagger-ui

> 采用Vue+element-ui构建的swagger-ui

## 介绍

![Image text](http://change-static.change.so/image/1562839586006.jpg)

> 有时间再写

## 测试运行

> 测试运行中项目中包含了一个swagger文档sample文件，可自行替换（src/assets/api-docs.json）

``` bash
# 依赖安装
npm install

# 测试运行
npm run dev

# 生产打包
npm run build:prod

```

## 打包为JAR

> 打包过程默认为npm run build:prod.会自动切换为包所在的本地环境

``` bash
# mvn生产打包发布
mvn install
```
## 安装

### 前置
> 安装好swagger2，并按默认配置，不需要其他第三方的swagger-ui，只需要加入默认依赖
```
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>${swagger.version}</version>
</dependency>
```    

### jar复制安装
> 复制生成的swagger-ui-0.1.jar 到你的工程下，添加依赖即可
```
<dependency>
    <groupId>com.smarthito</groupId>
    <artifactId>swagger-ui</artifactId>
    <version>0.1</version>
    <scope>system</scope>
    <systemPath>${pom.basedir}/src/main/libs/swagger-ui-0.1.jar</systemPath>
</dependency>
```    

### maven依赖
> TIDO:还没上传到maven库中，稍后更新

## 访问
```
http://<host>:<port>/swagger-ui.html
```
