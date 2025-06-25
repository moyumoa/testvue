<template>
  <div class="demo">
    <div class="btns">
      <el-button type="primary" @click="addData">showModal</el-button>
      <el-button type="primary" @click="showMessage">弹出提醒</el-button>
      <el-button type="primary" @click="showConfirm">二次确认弹窗</el-button>
    </div>
    <h2>1.通用search组件(slot方式 适用于特殊查询(级联、日期时间、组合等)及单独绑定输入事件)</h2>
    <xm_search>
      <div class="search_item">
        <label class="item_label">基础组件</label>
        <div class="item_content">
          <el-input v-model="search.user" placeholder="Approved by"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">基础组件</label>
        <div class="item_content">
          <el-input v-model="search.user" placeholder="Approved by"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">基础组件</label>
        <div class="item_content">
          <el-input v-model="search.user" placeholder="Approved by"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">基础组件</label>
        <div class="item_content">
          <el-input v-model="search.user" placeholder="Approved by"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">基础组件</label>
        <div class="item_content">
          <el-input v-model="search.user" placeholder="Approved by"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">时间搜索</label>
        <div class="item_content">
          <el-date-picker
            v-model="search.dataRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </xm_search>
    <h2>2.通用search组件(data方式，适用于只包含普通input,select,range)</h2>
    <xm_search :searchComponents="searchComponents" @getData="getList" @reset="resetSearch" />
    <h2>3.通用table组件</h2>
    <Table />
    <add-modal title="添加数据" v-model:showModal="editModal"></add-modal>
  </div>
</template>

<script setup>
/**
 * 当使用 <script setup> 的时候，任何在 <script setup> 声明的顶层的绑定
 * (包括变量，函数声明，以及 import 引入的内容) 都能在模板中直接使用 ——
 * Vue3 官方文档(https://v3.cn.vuejs.org/api/sfc-script-setup.html#%E9%A1%B6%E5%B1%82%E7%9A%84%E7%BB%91%E5%AE%9A%E4%BC%9A%E8%A2%AB%E6%9A%B4%E9%9C%B2%E7%BB%99%E6%A8%A1%E6%9D%BF)
 */
// import { toRefs } from 'vue'
import { editData } from './model/edit_data'
import addModal from './components/add_modal.vue'
import Table from './components/table.vue'
/**
 * 已引入vue-global-api包 默认全局使用 Vue Composition API 相关包
 */
const { editModal, addData } = editData()

const $message = inject('$message')
function showMessage() {
  $message.success('成功')
  // $message({
  //   message: '失败',
  //   type: 'error'
  // })
}

const $confirm = inject('$confirm')
function showConfirm() {
  $confirm({
    content: '我是二次确认弹窗',
    success() {
      console.log(111)
    }
  })
}

const search = reactive({
  user: '',
  dataRange: ''
})
function reset() {
  for (const key in search) {
    search[key] = null
  }
}

/**
 * search组件data方式
 */
const searchComponents = ref([
  {
    type: 'dateRange', // 组件类型
    label: '日期选择', // label展示
    val: '', // 响应式绑定
    filed: 'dateRange' // 查询字段名
  },
  {
    type: 'input',
    label: '姓名',
    val: '',
    filed: 'username'
  },
  {
    type: 'select',
    label: '类型',
    val: '',
    filed: 'userType',
    selects: [
      {
        label: '选择1',
        value: 1
      },
      {
        label: '选择2',
        value: 2
      },
      {
        label: '选择3',
        value: 3
      }
    ]
  },
  {
    type: 'input',
    label: '年龄',
    val: '',
    filed: 'age'
  },
  {
    type: 'input',
    label: '性别',
    val: '',
    filed: 'sex'
  }
])
function getList(obj) {
  console.log(obj)
}
function resetSearch() {}
</script>

<style lang="scss" scoped>
.demo {
  color: $theme_color;
  font-size: 16px;
  h2 {
    margin: 16px 0;
  }
}
</style>
