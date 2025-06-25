<template>
  <div class="img_left_content">
    <!-- 上传图片 -->

    <uploadImg
      origin="sumvideo"
      :showLoading="true"
      :index="0"
      @success="uploadImgSuccess"
      :maxSize="maxSize"
    >
      <el-button class="left_content_btn" type="primary">上传图片</el-button>
    </uploadImg>
    <!-- 搜索图片 -->
    <el-input
      ref="searchRef"
      class="left_content_input"
      maxlength="20"
      v-model.trim="$data.name"
      placeholder="请输入图片名称"
      @blur="editNameBlur"
      clearable
      @clear="resetSearch"
      @keydown.enter="enterFun"
    >
      <template #suffix>
        <div class="suffix_box" @click="resetSearch">
          <el-icon><i-search /></el-icon>
        </div>
      </template>
    </el-input>
    <!-- 图片列表 -->
    <div class="left_content_img" v-loading="$data.loading">
      <div class="content_content" ref="scrollRef">
        <template v-if="$data.listData && $data.listData.length > 0">
          <div class="img_list">
            <div
              class="img_list_content"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="load"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="$data.listData.length >= $data.page.total"
            >
              <div class="column" v-for="(column, index) in columns" :key="index">
                <div
                  :class="{ item: true }"
                  v-for="item in column.columnArr"
                  :key="item.id"
                  :style="{
                    height:
                      ((216 - (columns.length - 1) * 12) / columns.length / 114) * item.showHeight +
                      'px',
                    width: (216 - (columns.length - 1) * 12) / columns.length + 'px'
                  }"
                  @click="chooseFun(item)"
                >
                  <img class="item_cover" :src="item.url" alt="" />
                  <div class="item_title line-hidden1">{{ item.name || '' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="loading_library" v-if="$data.listData && $data.listData.length > 0">
            <img
              class="loading_library_icon"
              src="/public/loading.gif"
              v-if="$data.loading && $data.page.index > 1"
              alt=""
            />
            {{
              $data.loading
                ? $data.page.index === 1
                  ? ''
                  : '加载中...'
                : $data.listData.length >= $data.page.total
                ? '已经到底了~'
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div v-else class="no_echart">
          <img class="no_echart_icon" src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { throttle, imgScaleConversion } from '@/utils/tools.js'
import { list, save } from '@/api/content_center/material_library.js'
import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'

const props = defineProps({
  canvasW: {
    type: Number,
    default: 375
  },
  canvasH: {
    type: Number,
    default: 666.666
  }
})

const { canvasW, canvasH } = toRefs(props)
const maxSize = ref(50 * 1024) // 背景图片最大50M

const $data = reactive({
  name: '', // 查询的图片名称
  loading: true,
  listData: [],
  newListData: [],
  page: {
    index: 1,
    size: 30,
    total: 0
  }
})
const columns = ref([]) // 图片展示的列表数据
const arrIndex = ref([])
function listChange(list) {
  list.forEach(x => {
    if (x.type === 1 || x.type === 2) {
      const showHeight = x.wight ? (114 / x.wight) * x.height : 114
      x.showHeight = showHeight < 51 ? 51 : showHeight
    } else if (x.type === 3) {
      x.showHeight = 132
    } else if (x.type === 4) {
      x.showHeight = 182
    } else {
      x.showHeight = 108
    }
    x.top = ''
  })
  return list
}

// 获取线索列表数据
function getList() {
  return new Promise((resolve, reject) => {
    // 处理请求参数
    $data.loading = true
    const params = {
      isDelete: 0,
      name: $data.name || '',
      createTimeMin: '',
      createTimeMax: '',
      pageNo: $data.page.index,
      pageSize: $data.page.size,
      sources: null,
      type: [2],
      tags: [],
      batchNumber: '',
      subSource: [1, 0]
    }

    // 发送请求
    list(params)
      .then(res => {
        const arr = []
        res.data.records.forEach(item => {
          arr.push(item.tagList)
        })
        if (res.code === 0) {
          if ($data.page.index === 1) {
            $data.listData = listChange(res.data.records || [])
            $data.page.total = res.data.total || 0
          } else {
            $data.newListData = listChange(res.data.records || [])
            $data.listData = $data.listData.concat($data.newListData)
          }
        } else {
          if ($data.page.index === 1) {
            $data.listData = []
            $data.page.total = 0
          }
        }
        $data.loading = false
        resolve()
      })
      .catch(() => {
        if ($data.page.index === 1) {
          $data.listData = []
          $data.page.total = 0
        }
        $data.loading = false
        resolve()
      })
  })
}
function getMinHeight(arr) {
  const a = []
  for (let i = 0; i < arr.length; i++) {
    a.push(parseInt(arr[i].showHeight || 0) + parseInt(arr[i].top || 0))
  }
  return Math.min.apply(null, a)
}
function getMinIndex(val) {
  for (let i = 0; i < columns.value.length; i++) {
    const showHeight =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
        : 0
    const top =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
        : 0
    if (parseInt(showHeight) + parseInt(top) === val) {
      arrIndex.value.push(i)
    }
  }
}

function init() {
  columns.value = []
  const contentLen = $data.listData.length
  // // 根据可视区域的宽度判断需要几列
  // const cLen = Math.floor((getCWidth() - 210 - 32 - 48 - 84) / 220)
  // 该页面固定2列
  const cLen = 2
  // 初始化每一列的第一行元素
  for (let i = 0; i < 2; i++) {
    if (i < $data.listData.length) {
      $data.listData[i].top = 0 // 预设距离顶部值为0
      columns.value.push({ columnArr: [$data.listData[i]] })
    } else {
      columns.value.push({
        columnArr: []
      })
    }
  }

  // 对剩余元素的判断，应该放到哪一列
  for (let index = cLen; index < contentLen; index++) {
    arrIndex.value = []
    const arr = [] // 找到高度最小的一列，可能有多个
    let minHeight = 0 // 高度最小的一列的高度
    let pushIndex = 0 // 高度最小的一列所在位置的索引

    for (let i = 0; i < columns.value.length; i++) {
      arr.push({
        showHeight:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
            : 0,
        top:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
            : 0
      })
    }

    minHeight = getMinHeight(arr)
    getMinIndex(minHeight)

    if (arrIndex.value.length > 0) {
      pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
    }

    $data.listData[index].top = minHeight + 20
    columns.value[pushIndex].columnArr.push($data.listData[index])
  }
}
const load = throttle(function () {
  $data.loading = true
  $data.page.index++
  getList().then(() => {
    //  从接口最新获取的元素push到目前高度最小的一列
    for (let index = 0; index < $data.newListData.length; index++) {
      arrIndex.value = []
      const arr = [] // 找到高度最小的一列，可能有多个
      let minHeight = 0 // 高度最小的一列的高度
      let pushIndex = 0 // 高度最小的一列所在位置的索引
      for (let i = 0; i < columns.value.length; i++) {
        arr.push({
          showHeight:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
              : 0,

          top:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
              : 0
        })
      }

      minHeight = getMinHeight(arr)
      getMinIndex(minHeight)
      if (arrIndex.value.length > 0) {
        pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
      }

      $data.newListData[index].top = minHeight + 20
      columns.value[pushIndex].columnArr.push($data.newListData[index])
      $data.loading = false
    }
  })
}, 1000)
const scrollRef = ref(null)
// 重置的回调
const resetSearch = throttle(function () {
  $data.loading = true
  $data.page = {
    index: 1,
    size: 50,
    total: 0
  }

  getList().then(() => {
    init()
  })
  nextTick(() => {
    scrollRef.value && scrollRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  })
}, 500)
const editNameBlur = () => {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  $data.name = $data.name.replace(reg, '')
  resetSearch()
}
resetSearch()
const searchRef = ref(null)
// 输入框回车事件
function enterFun() {
  searchRef.value.blur()
}
const emits = defineEmits(['addImgFun'])

// 选中图片
const chooseFun = throttle(data => {
  if (data.url) {
    if (data.fileFormat === 'gif') {
      ElMessage({
        message: 'GIF 图片不可添加',
        type: 'warning'
      })
      return
    }
    if (!(data.wight && data.height)) {
      ElMessage({
        message: '未获取到图片信息',
        type: 'warning'
      })
      return
    }
    const whInfo = imgScaleConversion(
      data.wight,
      data.height,
      canvasW.value / 2,
      canvasH.value / 2,
      true,
      true
    )
    emits('addImgFun', {
      tagvvMediaId: data.id,
      url: data.url,
      width: whInfo.width,
      height: whInfo.height,
      x: whInfo.x,
      y: whInfo.y
    })
  } else {
    ElMessage({
      message: '未获取到图片信息',
      type: 'warning'
    })
  }
}, 500)

// 上传封面成功
function uploadImgSuccess(e) {
  if (e && e.imgUrl) {
    save({ source: 10, type: 2, url: e.imgUrl }).then(res => {
      console.log(res)
      if (res.code === 0) {
        resetSearch()
        const data = res.data || {}
        const whInfo = imgScaleConversion(
          data.wight,
          data.height,
          canvasW.value / 2,
          canvasH.value / 2,
          true,
          true
        )
        emits('addImgFun', {
          tagvvMediaId: data.id,
          url: data.url,
          width: whInfo.width,
          height: whInfo.height,
          x: whInfo.x,
          y: whInfo.y
        })
      }
    })
  }
}

defineExpose({
  resetSearch
})
</script>
<style lang="scss" scoped>
@import '../scss/index.scss';
.left_content_img {
  ::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 4px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 7px;
    margin: 0 0px;
  }
  ::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 4px;
    background-color: #c0c2c2;
    // margin: 0 5px;
  }
}
.left_content_input {
  :deep(.el-input__suffix-inner) {
    position: relative;
  }
  :deep(.el-input__suffix),
  .suffix_box {
    width: 31px;
    height: 31px;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  :deep(.el-input__clear) {
    position: absolute;
    left: 0px;
    top: 1px;
    width: 30px;
    height: 30px;
    background: #fff;
    border-radius: 4px;
  }
}
</style>
