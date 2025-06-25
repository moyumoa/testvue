refForm
<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="回收站"
    custom-class="back_dialog"
    width="820px"
    @close="closeDialog"
  >
    <div
      class="back_c"
      v-infinite-scroll="getList"
      :infinite-scroll-delay="300"
      :infinite-scroll-distance="50"
      :infinite-scroll-immediate="false"
      v-loading="loading"
    >
      <div class="back_c_scroll">
        <div class="title_item_column" v-for="(item, index) in listData" :key="index">
          <!-- 还原蒙层 -->
          <div class="list_item_warp">
            <div class="text" @click.stop="backOne(item)">还原</div>
          </div>

          <div class="item_content">
            {{ item.title }}
            <br />
            {{ item.description || '' }}
          </div>

          <div class="item_foot">
            <img :src="iconObj[item.creationType]" alt="" class="plat_icon" />
            <div class="times_warp" v-if="item.useTimes > 0">
              使用次数：
              <span class="use_text">{{ item.useTimes || 0 }}</span>
            </div>
          </div>
        </div>
        <template v-if="listData.length % 3 == 2"><div class="w_220"></div></template>
        <template v-if="listData.length % 3 == 1">
          <div class="w_220" style="margin-left: 14px; margin-right: 14px"></div>
          <div class="w_220"></div>
        </template>
      </div>
      <div class="loading_library" v-if="loadingTips">
        <img src="/public/loading.gif" v-if="loading && listData.length > 0" alt="" />
        {{ loadingTips }}
      </div>
      <div class="em_warp" v-if="listData.length == 0 && !loading">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20231026emgo3.png"
          alt=""
          class="em_img"
        />
        <p class="text">暂无数据</p>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <div class="total">
          共
          <span class="num">{{ page.total || 0 }}</span>
          条
        </div>
        <el-button type="text" @click="beforeBackAll">全部还原</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import {
  listTitleAndDesc,
  recycleOrRestoreCreativeTitleDesc,
  allRestoreCreativeTitleDesc
} from '@/api/sumvideo/creative_ai_title.js'
import { ElMessageBox } from 'element-plus'
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  creativeId: {
    type: String || Number,
    default: null
  },
  creationType: {
    type: String,
    default: ''
  }
})
const { show, creativeId } = toRefs(props)
const message = inject('$message')
const loading = ref(false)
const emits = defineEmits(['reduction', 'close', 'confirm'])
const page = reactive({
  total: 0,
  pageNo: 1,
  pageSize: 50
})
const listData = ref([]) // 列表数据
const iconObj = {
  0: 'https://tagvv-1256030678.file.myqcloud.com/202402285wmfw.png',
  1: 'https://tagvv-1256030678.file.myqcloud.com/20231023jccep.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20231023wmb1d.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20240228osml4.png',
  4: 'https://tagvv-1256030678.file.myqcloud.com/202402286v6ix.png'
}
const loadingTips = computed(() => {
  let displayText = ''
  if (loading.value && listData.value.length > 0) {
    displayText = '加载中...'
  } else if (listData.value.length < page.total && listData.value.length !== 0) {
    displayText = '上拉加载更多~'
  } else if (listData.value.length > 6) {
    displayText = '已经到底了~'
  } else {
    displayText = ''
  }
  return displayText
})

// 获取列表
function listTitleAndDescFn() {
  const params = {
    creativeId: Number(creativeId.value),
    creationType: '', // 回收站不区分
    isRecycle: 1, // 是否回收 1是 0否
    orderSetting: '',
    pageNo: page.pageNo,
    pageSize: page.pageSize
  }
  listTitleAndDesc(params)
    .then(res => {
      if (res.code === 0) {
        page.total = res.data.total
        if (params.pageNo === 1) {
          listData.value = res.data.records
        } else {
          listData.value = listData.value.concat(res.data.records)
        }
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
// 还原一个
function backOne(item) {
  const params = {
    creativeId: creativeId.value,
    id: item.id,
    operateWay: 0
  }
  recycleOrRestoreCreativeTitleDesc(params)
    .then(res => {
      if (res.code === 0) {
        // listData.value = listData.value.filter(s => {
        //   return s.id !== item.id
        // })
        message.success('还原成功！')
        page.pageNo = 1
        listTitleAndDescFn()
        emits('reduction')
      }
    })
    .catch(() => {
      message.error('操作失败！')
    })
}

function closeDialog() {
  emits('close')
}
function beforeBackAll() {
  if (listData.value.length > 0 && !loading.value) {
    ElMessageBox.confirm(`确认全部还原到文案库？`, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        backAll()
      })
      .catch(() => {
        console.log('取消')
      })
  }
}
function backAll() {
  if (listData.value.length === 0) return
  const params = {
    creativeId: creativeId.value,
    operateWay: 0
  }
  allRestoreCreativeTitleDesc(params)
    .then(res => {
      if (res.code === 0) {
        page.pageNo = 1
        listTitleAndDescFn()
        emits('reduction')
        message.success('全部还原成功！')
      }
    })
    .catch(() => {
      message.error('操作失败！')
    })
}
// 列表加载
function getList() {
  if (listData.value.length >= page.total) return
  loading.value = true
  page.pageNo++
  listTitleAndDescFn()
}
onMounted(() => {
  loading.value = true
  listTitleAndDescFn()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.back_c {
  width: 100%;
  height: 476px;
  overflow-y: scroll;
  position: relative;

  .back_c_scroll {
    position: relative;
    box-sizing: border-box;
    // padding: 4px 16px 0 16px;
    // column-count: 2;
    // column-gap: 12px;
    position: relative;
    // column-width: 50%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    .title_item_column {
      width: 220px;
      height: 154px;
      background: #f2f3f5;
      border-radius: 4px;
      padding: 8px 12px 6px 12px;
      margin-top: 14px;
      position: relative;
      &:nth-child(3n-1) {
        margin-left: 14px;
        margin-right: 14px;
      }
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        margin-top: 16px;
      }
      &:hover {
        .list_item_warp {
          border-radius: 4px;
          border-top-right-radius: 5px;
          display: block;
          animation: fadeIn 2s forwards; /* 使用动画来在一秒后渐显 */
        }
      }
      .list_item_warp {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        box-sizing: border-box;
        // border: 1px solid;
        opacity: 0; /* 初始状态下不可见 */
        transition: opacity 1s; /* 添加过渡效果 */
        .text {
          position: absolute;
          top: -1px;
          right: -1px;
          cursor: pointer;
          width: 36px;
          height: 22px;
          line-height: 22px;
          background: #303133;
          border-radius: 0px 4px 0px 12px;
          font-size: 12px;
          color: #ffffff;
          text-indent: 6px;
        }
      }
      .item_content {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #333333;
        line-height: 19px;
        height: max-content;
        height: calc(100% - 24px);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 6; /* 控制显示的行数 */
        -webkit-box-orient: vertical;
      }

      .item_foot {
        display: flex;
        margin-top: 6px;
        .plat_icon {
          margin-top: 2px;
          width: 16px;
          min-width: 16px;
          height: 16px;
        }
        .times_warp {
          margin-top: 1px;
          margin-left: 6px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          flex: 1;
          .use_text {
            color: #333333;
          }
        }
      }
    }
    .w_220 {
      width: 220px;
    }
  }
}
.em_warp {
  position: absolute;
  box-sizing: border-box;
  top: 0;
  left: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .em_img {
    width: 70px;
    height: 70px;
  }
  .text {
    margin-top: 8px;
    color: #8f939a;
    line-height: 20px;
    font-size: 14px;
  }
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  :deep(.el-button) {
    padding-right: unset;
  }
  .total {
    .num {
      color: #364fcd;
    }
  }
}
.loading_library {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 15px;

  img {
    height: 25px;
    margin-right: 4px;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    cursor: pointer;
  }
}
</style>
