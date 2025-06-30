# electron-test

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

##### 2023/6/5补充
### 项目初始化（在 Mac intel芯片运行下列命令时，需要加sudo修饰，意思是拥有管理员权限）
cnpm 版本8.3.0
npm 版本8.16.0
node 版本16.14.0


```
npm i cnpm@8.3.0 -g
cnpm i electron-builder -g
cnpm i electron -g 
cnpm i
```

### 项目启动为桌面应用
```
npm run electron:serve
```


#### 2024/08/30补充 ####
### 增加打包配置 ###

```
"electron:build-m": "vue-cli-service electron:build --arm64 --x64" // 可以在一台mac上同时打包m1芯片和Intel芯片的客户端包
```
###  mac 打包 ###

打包时npm运行会有报错，所以使用yarn运行

```
sudo yarn /~
```