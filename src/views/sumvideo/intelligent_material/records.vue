<template>
  <div class="records_page sumvideo_page">
    <div class="page_search">
      <!-- :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]" -->

      <el-date-picker
        class="search_picker"
        v-model="form.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled-date="
          time => {
            return time.getTime() > Date.now()
          }
        "
      ></el-date-picker>
      <el-button type="primary" @click="searchFun">查询</el-button>
      <el-button @click="resetFun">重置</el-button>
    </div>

    <div class="page_content" v-loading="form.loading">
      <div class="page_content_content" ref="pageContentContentRef">
        <template v-if="form.listData && form.listData.length > 0">
          <div
            class="all_records"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="loadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="form.listData.length >= form.page.total"
          >
            <div class="one_record_box" v-for="(item, index) in form.listData" :key="index">
              <oneRecord
                :info="item"
                :index="index"
                :ref="recordRef"
                :savingList="savingList"
                @retry="retry"
                @save="saveFun"
              />
            </div>
          </div>
          <div class="loading_library">
            <img src="/public/loading.gif" v-if="form.loading && form.page.index > 1" alt="" />
            {{
              form.loading
                ? form.page.index === 1
                  ? ''
                  : '加载中...'
                : form.listData.length >= form.page.total
                ? form.listData.length > 10
                  ? '已经到底了~'
                  : ''
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div v-else class="no_echart">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { listVideoSplitRecord, retrySplit } from '@/api/sumvideo/intelligent_material.js'
import oneRecord from './components/one_record.vue'
import { throttle, isNotEmpty } from '@/utils/tools.js'
const form = reactive({
  loading: false,
  dateRange: [],
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const pageContentContentRef = ref(null)
// 查询
const searchFun = throttle(() => {
  clearTimeFun()
  form.loading = true
  form.page.index = 1
  for (let i = 0; i < recordsRef.value.length; i++) {
    recordsRef.value[i]?.clearFun()
  }
  initScroll()
  getList()
})
// 重置
const resetFun = throttle(() => {
  form.dateRange = []
  initScroll()
  searchFun()
})
// 重置滚动条
function initScroll() {
  pageContentContentRef.value && pageContentContentRef.value.scrollTo(0, 0)
}
const recordsRef = ref([])
const recordRef = el => {
  if (el) {
    recordsRef.value.push(el)
  }
}
onMounted(() => {
  clearTimeFun()
  resetFun()
})
const savingList = computed(() => {
  const ids = []
  for (const key in disassembleInfo.value.saving) {
    ids.push(key)
  }
  return ids
})

const disassembleInfo = ref({
  disassemble: {}, // 拆解中的id列表 {id: index}
  saving: {} // 保存到模板中
})
const timer = ref()
// 保存到模版
function saveFun(id, index) {
  if (!Object.keys(disassembleInfo.value.saving).includes(id)) {
    disassembleInfo.value.saving[id] = index
    setTimerFun()
  }
}

// 重试
function retry(id, index) {
  retrySplit({ id })
    .then(res => {
      if (res.code === 0) {
        // 重试成功只需要将当前id 放进拆解中的数据内即可
        // disassembleInfo.value.disassemble[id] = index
        // setTimerFun()
        // 重试会生成新的记录，直接reset
        resetFun()
      }
    })
    .catch(() => {
      console.log('重试失败')
      resetFun()
    })
}

function setTimerFun() {
  if (!timer.value) {
    timer.value = setInterval(() => {
      const ids = []
      const disassembleList = [] // 轮询中的所有拆解中的数据
      const savingList = [] // 轮训中的所有保存中的数据

      // 拆解中需要循环的数据
      for (const key in disassembleInfo.value.disassemble) {
        disassembleList.push(key)
        ids.push(key)
      }
      // 保存到模板需要循环的数据
      for (const key in disassembleInfo.value.saving) {
        savingList.push(key)
        if (!ids.includes(key)) {
          ids.push(key)
        }
      }

      listVideoSplitRecord({
        ids: ids,
        pageNo: 1,
        pageSize: 2000
      })
        .then(res => {
          if (res.code === 0) {
            const newListData = res.data.records || []
            const overListDiss = [] // 已完成的拆解中的数据
            const overListSaving = [] // 已完成的合成中中的数据
            newListData.forEach(item => {
              if (disassembleList.includes(item.id + '') && item.status > 1) {
                overListDiss.push(item)
              }
              if (savingList.includes(item.id + '') && item.videoStatus > 1) {
                overListSaving.push(item)
              }
            })

            // 拆解中的
            if (overListDiss && overListDiss.length > 0) {
              const idInfo = {}
              for (const key in disassembleInfo.value.disassemble) {
                const hasOver = overListDiss.filter(x => x.id === parseInt(key))
                if (hasOver && hasOver.length > 0) {
                  form.listData[disassembleInfo.value.disassemble[key]] = hasOver[0]
                } else {
                  idInfo[key] = disassembleInfo.value.disassemble[key]
                }
              }
              disassembleInfo.value.disassemble = idInfo
            }
            // 合成中的
            if (overListSaving && overListSaving.length > 0) {
              const inInfo = {}
              for (const key in disassembleInfo.value.saving) {
                const hasOver = overListSaving.filter(x => x.id === parseInt(key))
                if (hasOver && hasOver.length > 0) {
                  form.listData[disassembleInfo.value.saving[key]] = hasOver[0]
                } else {
                  inInfo[key] = disassembleInfo.value.saving[key]
                }
              }
              disassembleInfo.value.saving = inInfo
            }
            if (
              (overListSaving.length === savingList.length &&
                overListDiss.length === disassembleList.length) ||
              ids.length === 0
            ) {
              clearTimeFun()
            }
          }
        })
        .catch(() => {
          // 合成失败的提示
          for (const key in disassembleInfo.value?.saving || []) {
            if (form.listData[disassembleInfo.value?.saving[key]]) {
              form.listData[disassembleInfo.value.saving[key]].toastStatus = 'err'
            }
          }
        })
    }, 3000)
  }
}
function clearTimeFun() {
  disassembleInfo.value.disassemble = {}
  disassembleInfo.value.saving = {}
  clearInterval(timer.value)
  timer.value = null
}

onBeforeUnmount(() => {
  clearTimeFun()
})
function getList() {
  const data = {
    submitStartTime:
      form.dateRange && form.dateRange.length > 1 ? form.dateRange[0] + ' 00:00:00' : '',
    submitEndTime:
      form.dateRange && form.dateRange.length > 1 ? form.dateRange[1] + ' 23:59:59' : '',
    pageNo: form.page.index,
    pageSize: form.page.size
  }
  listVideoSplitRecord(data)
    .then(res => {
      if (res.code === 0) {
        const newListData = res.data.records || []
        // newListData[0].status = 2
        const info = JSON.parse(JSON.stringify(disassembleInfo.value))
        newListData.forEach((x, i) => {
          if ((x.status === 0 || x.status === 1) && !info.disassemble[x.id]) {
            info.disassemble[x.id] = (form.page.index - 1) * form.page.size + i
          }
          if ((x.videoStatus === 0 || x.videoStatus === 1) && !info.saving[x.id]) {
            info.saving[x.id] = (form.page.index - 1) * form.page.size + i
          }
        })
        disassembleInfo.value.disassemble = info.disassemble
        disassembleInfo.value.saving = info.saving
        // console.log('disassembleInfo.value', disassembleInfo.value)
        if (isNotEmpty(info.disassemble) || isNotEmpty(info.saving)) {
          setTimerFun()
        }
        if (form.page.index === 1) {
          form.listData = newListData
          form.page.total = res.data.total || 0
        } else {
          form.listData = form.listData.concat(newListData)
        }
      } else {
        if (form.page.index === 1) {
          form.listData = []
        }
      }
      form.loading = false
    })
    .catch(() => {
      form.loading = false
    })
}
const loadFun = throttle(function () {
  if (form.loading) return
  console.log('加载到底')
  form.loading = true
  form.page.index++
  getList()
}, 1000)
</script>
<style lang="scss" scoped>
.records_page {
  overflow-y: auto;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px 0 0 24px;
  .page_search {
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    :deep(.search_picker) {
      width: 280px;
      margin-right: 24px;
    }
    .el-button + .el-button {
      margin-left: 16px;
    }
  }
  .page_content {
    min-height: 540px;
    width: 100%;
    height: calc(100% - 64px);
    .page_content_content {
      width: 100%;
      height: 100%;
      padding-right: 24px;
      overflow-y: auto;
    }
    .all_records {
      .one_record_box {
        width: 100%;
        height: 206px;
        background: #f7f8fa;
        border-radius: 4px;
      }
      .one_record_box + .one_record_box {
        margin-top: 12px;
      }
    }
  }
}
.loading_library {
  padding-bottom: 12px;
}
.no_echart {
  height: 100%;
}
</style>
