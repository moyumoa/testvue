<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title=""
    width="820px"
    custom-class="rule_setting_dialog hide_footer_line "
    append-to-body
  >
    <div class="dialog_content" v-loading="loading">
      <div
        ref="searchRef"
        class="dialog_box"
        :infinite-scroll-delay="500"
        v-infinite-scroll="loadFun"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="list.length >= page.total"
      >
        <div class="one_box" v-for="(item, index) in list" :key="index">
          <div>参考标题：</div>
          <div>
            {{ item.title || '' }}
          </div>
          <div>参考正文：</div>
          <div>
            {{ item.content || '' }}
          </div>
        </div>
        <div class="xm_pullUpToLoadMore">
          <img src="/public/loading.gif" v-if="loading && page.number > 1" alt="" />
          {{
            loading
              ? page.number === 1
                ? ''
                : '加载中...'
              : list.length >= page.total
              ? list.length > 10
                ? '已经到底了~'
                : ''
              : '上拉加载更多~'
          }}
        </div>
        <div class="xm_noneData" v-if="!(list && list.length > 0) && !loading">暂无数据</div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { listXhsStudyTitle } from '@/api/sumvideo/intelligent_agent.js'
const props = defineProps({
  previewKonwledgeDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
// const dialog = ref()
const show = toRef(props.previewKonwledgeDialog, 'show')
const datasetId = toRef(props.previewKonwledgeDialog, 'datasetId')
const list = ref([])
const loading = ref(true)
const page = reactive({
  number: 1,
  index: 10,
  total: 0
})
// 初始化
function init() {
  page.number = 1
  getList()
}
// 分页获取列表
function getList() {
  loading.value = true
  listXhsStudyTitle({
    datasetId: datasetId.value
  })
    .then(res => {
      if (res.code === 0) {
        loading.value = false
        const resultList = res.data
        list.value = resultList
        page.total = 0
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })

  // setTimeout(() => {
  //   loading.value = false
  //   const resultList = []
  //   if (page.number === 1) {
  //     list.value = resultList
  //   } else {
  //     list.value = list.value.concat(resultList)
  //   }
  //
  //   page.total = 0
  // }, 1000)
}
// 上拉加载
function loadFun() {
  if (loading.value) return
  page.number++
  getList()
}
onMounted(() => {
  init()
})
</script>
<style lang="scss" scoped>
.dialog_content {
  margin-top: -4px;
  min-height: 100px;
  .dialog_box {
    padding: 0 16px 16px;
    max-height: 60vh;
    overflow-y: auto;
  }
  .one_box + .one_box {
    margin-top: 8px;
  }
  .one_box {
    width: 100%;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 4px;
    border: 1px solid #ebedf0;
    font-weight: 400;
    font-size: 16px;
    color: #606266;
    line-height: 24px;
  }
}
</style>
