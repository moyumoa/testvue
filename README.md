# README

## 初始化项目

```
yarn
npx husky install
```

### vscode 插件安装

ESLint、Prettier ESlint、Prettier、Vue Language Features

### 运行开发环境

```
yarn dev
```

### 线上&测试打包

```
yarn build
```

### 查看 prettierrc 配置

See [Configuration Reference](https://prettier.io/docs/en/options.html).

### 目录结构解析

```
|-- .husky  commit eslint 校验
|-- .vscode vscode 配置
|-- public  打包拷贝目录
    |-- src    主目录
    |-- api    业务 api 封装
    |-- assets 静态资源目录
    |-- components 公共组件目录(全局)
    |-- directive 自定义指令
        |-- copy 复制
        |-- debounce 防抖
    |-- layout 系统基础布局
    |-- router 路由
    |-- store vuex
    |-- styles 自定义样式
    |-- utils 工具目录
        |-- nrogress 顶部加载进度条
        |-- request 请求封装
    |-- views 业务组件
        |-- content 内容中台
        |-- fitment 小程序装修
        |-- main 独立文件
        |-- operate 运营
        |-- system 系统设置
|-- .env.development 开发环境变量
|-- .env.production 线上环境变量
|-- .eslintrc.js eslint配置文件
|-- .gitignore git忽略配置
|-- .prettierrc.json prettierrc配置文件
|-- vite.config.js vite配置文件
```

### 开发注意事项

#### 语法&全局变量
- 所有 element 组件都是自动引入、直接在页面使用即可.
  - el-icon  使用名称为<i-xxx> 例如： `<el-icon><i-plus /></el-icon>`
- /styles/global.scss 里面的变量为全局变量可直接使用.
- 业务开发默认使用 composition API , 简单查询页面可继续使用 options API [查看差异](https://v3.cn.vuejs.org/guide/composition-api-introduction.html#%E4%BB%80%E4%B9%88%E6%98%AF%E7%BB%84%E5%90%88%E5%BC%8F-api).
- 默认缩进两个空格 保存即刻格式化及进行 eslint 校验 vue 文件校验不通过则无法编译成功 js 文件在 commit 时校验不通过则无法 commit.
- 覆盖 element 样式相关：若只在当前组件覆盖则可查阅官方文档通过 class 进行相关变量的替换即可，若为全局替换则编写至 styles/element_ui 里面
- vite.config.js 配置文件只是开发联调地址修改的话不要提交
#### 表格相关
- 操作项统一fixed:right 表头及内容右对齐
- 表格行内包含头像时在table上增加class `pic_table`
- tabs若不需要灰色底线则在组件上增加class `hide_underline`
### 弹窗相关
- dialog弹窗内容是三行以内时传入class custom-class `hide_footer_line`

### 菜单相关

- 面包屑的组成是 
  - 1、详情页面：侧边栏选中的菜单数组+当前页面在meta里设置的title
  - 2、列表页面(侧边栏直接打开的)：侧边栏选中的菜单数组
  - 3、详情的详情页面(例如课程详情的课节详情)：
    - 首先在设置路由时 在meta里加一个parentInfo(上一页的title)
    - 然后在utils/dictionary/path.js 里配置上一页的路径 这样前期工作就可以了
    - 他的组成是侧边栏选中的菜单数组+parentInfo+当前页面在meta里设置的title

- 详情页的命名：
  - 比如新建视频任务和编辑视频任务都是同一个页面，那meta设置title的时候就叫 新建/编辑xxx
  - 其余就正常命名

- 菜单跳转
  - 跨大菜单跳转[例如：从内容中台跳转到系统管理，原因：直接使用router.push会导致页面跳转成功，但侧边栏和顶部菜单未刷新。]：
    - sessionStorage.setItem('menuActive', '')  //设置顶部菜单的选中项
    - sessionStorage.setItem('module', '系统管理') //设置左侧菜单的选中项
    - location.href = location.origin + '' //刷新页面
  - 大菜单里跳转：
    - router.push()

### 菜单的keepAlive【有列表页需要回退时，保留之前的参数】
  - 1、需要在OMG-权限管理：对相应的菜单进行页面缓存的配置
  - 2、对每个页面的要加上onActivated的生命周期函数，在里面判断，如果是通过菜单点击进入页面的要清空筛选项，并重置菜单进入的判断条件。
  - 3、每个页面刚进入的时候要在onActivated的函数里去请求接口获取数据，不要在mounted或created里面去获取数据了【比如：作品库进入作品详情页，在详情页删除该作品，返回时需要重新请求数据。】
```
// 清空查询参数
<!-- 筛选条件 -->
<xm_search
  :searchComponents="searchComponents"
  :useOwnReset="true"
  @getData="querySearch"
  @reset="resetSearch"
  ref="xmSearchRef"
/>

// 清空查询参数
function clearSearchQuery() {
  tableForm.minNum = undefined
  tableForm.maxNum = undefined
  tableForm.maxCapacity = undefined
  tableForm.minCapacity = undefined
  tableForm.page = {
    index: 1,
    size: 35,
    total: 0
  }
}
// 重置的回调
const resetSearch = throttle(function () {
  clearSearchQuery()
  getList()
}, 500)
clearSearchQuery()
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  console.log('activated', menuOfKeepAlive('judge'))
  if (menuOfKeepAlive('judge')) {
    xmSearchRef.value?.reset()
    menuOfKeepAlive('reset')
  } else {
    getList()
  }
})

//如果列表页面不是表格，而是自适应的图片列表，则要记录滚动的距离，离开页面时当前加载了多少条数据
// 离开页面时记录滚动距离
onBeforeRouteLeave((to, from) => {
 // 要记录滚动距离的页面地址，可以写完整，也可以写部分路径。如果有多个跳转地址，只是最后一级的名字不一样，那就可以截掉最后一级。
  const leavePage = [
    '/content_center/inspiration_library/',
  ]

  if (leavePage.findIndex(xx => to.path.indexOf(xx) > -1) > -1) {
    // 当前加载了多少条
    tableForm.page.size =
      tableForm.listData.length > tableForm.page.size
        ? tableForm.listData.length
        : tableForm.page.size
    // 滚动条的滚动距离
    srcollTop.value =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      document.querySelector('.el-main').scrollTop
  } else {
    // 否则置成默认数据 
    tableForm.page.size = 70
    srcollTop.value = 0
  } 
})
//回来的时候滚动到对应位置
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    tableForm.loading = true
    searchList()
    if (srcollTop.value) {
      const el = document.querySelector('.el-main')
      el.scrollTop = srcollTop.value
    }
  }
  nextTick(() => {
    srcollTop.value = null
  })
})


```

### 业务主体筛选组件
 - 在使用时，如果碰到要缓存的页面，需要每次打开页面有缓存时（menuOfKeepAlive('judge')）都去重新设置筛选组件(searchcomponents)，防止更新不及时。
 - 后续调整需注意：如果该组件没有选中的数据，查询入参记得为空。
