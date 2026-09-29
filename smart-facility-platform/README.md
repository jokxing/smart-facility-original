# chuxou-saas-web

### nodejs

#### 1、安装地址：

官网：https://nodejs.org/en/ 
中文官网：https://nodejs.org/zh-cn/ 

#### 2、安装步骤注意点：

在Custom Setup步骤中：

1. 情况一：

   选择add to PATH 不需要手动设置系统环境变量

2. 情况二：

   选择其他项，需要手动配置系统环境变量

   检测PATH是否配置:

   ```
   点击开始=》运行=》输入"cmd" => 输入命令"path" 或 win+r => 输入cmd => 输入path
   ```

其他地方直接next

如有需要可以安装nvm,对node.js 版本进行管理切换
**ps:  本项目使用node.js > 8.0 webpack 5.65.0**

### 下载命令说明

1. 推荐使用yarn

   ```
   //安装npm前提下
   npm install yarn -g
   ```

2. 如果使用npm下载报错，可切换淘宝镜像

   ```
   npm config set registry https://registry.npm.taobao.org
   // 检验是否验证成功
   npm config get registry
   // 还原npm仓库
   npm config set registry https://registry.npmjs.org/
   ```
### 初始化下载
```
npm init -y 或
yarn init -y
```

### 下载第三方依赖
```
npm install --global yarn
yarn install或
npm install
```

### 编译与热编译
```
yarn serve 或 //测试服务器
npm run serve 
yarn dev 或 //正式服务器
npm run dev
```

### 打包
```
yarn build:dev //测试服务器
yarn build:prod //正式服务器
```

### 测试文件
```
yarn test:unit
```

### 自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).

### 功能模块
#### 一、登录
#### 二、首页
### 代码检查
### 安装sonarlint 代码扫描插件
npm i -g sonar-scanner
### 执行检查
sonar-scanner
### 20220601新增组件svg-progress-bar
```node
yarn add svg-progress-bar
```
### 20220610新引入vue-seamless-scroll
```node
yarn add vue-seamless-scroll
```
