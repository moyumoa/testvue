<template>
  <div class="acc_ellipsis">
    <template v-for="(item, index) in otherAccountInfo.list" :key="index">
      <el-tooltip
        v-if="index < showNum"
        effect="dark"
        :content="item.dyNickname || item.nickname"
        placement="top"
      >
        <div class="photos_item" :class="{ g_failure: isInvalid(item) }">
          <img v-if="item.dyHeadUrl || item.headUrl" :src="item.dyHeadUrl || item.headUrl" alt />
          <img v-else src="@/assets/images/content_center/default_user.png" alt />
          <div
            v-if="platFormIcon"
            :class="[`xm_platformIcon_${item.platform}_${platFormIconWidth}`]"
          ></div>
        </div>
      </el-tooltip>
    </template>
    <div
      class="photo_more flex_center"
      :style="hideMore ? 'cursor:default' : ''"
      @click="openOtherAccount"
      v-if="(props.infinite ? otherAccountInfo.page.total : otherAccountInfo.list.length) > showNum"
    >
      +{{ (props.infinite ? otherAccountInfo.page.total : otherAccountInfo.list.length) - showNum }}
    </div>
    <!-- 预览其余矩阵号 -->
    <previewAccount
      :origin="props.origin"
      v-if="otherAccountInfo.show"
      :infinite="props.infinite"
      :info="otherAccountInfo"
      @close="otherAccountInfoClose"
      @getList="getAccountList"
    />
  </div>
</template>

<script setup>
import previewAccount from '@/views/sumvideo/matrix_operations/matrix_distribute/components/other_account_preview.vue'
import { listAccountSnapshot } from '@/api/sumvideo/content_distribute.js'
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  showNum: {
    type: Number,
    default: 3 // 显示的数量
  },
  platFormIcon: {
    type: Boolean,
    default: true // 是否显示平台icon
  },
  platFormIconWidth: {
    type: Number,
    default: 16 // 平台icon宽度
  },
  infinite: {
    type: Boolean,
    default: false // 是否滚动加载头像列表
  },
  id: {
    type: String || Number,
    default: null
  },
  getListTime: {
    type: String,
    default: null // 获取列表的时机 openAll-在打开弹窗的时候再获取列表
  },
  total: {
    type: Number,
    default: 0 // 总数
  },
  origin: {
    type: String,
    default: '' // qrcodePublish 二维码发布过来的
  },
  hideMore: {
    type: Boolean,
    default: false // 点击+ 不显示所有
  }
})
const { list, showNum, platFormIcon, platFormIconWidth, id, getListTime, total, hideMore } =
  toRefs(props)
const emits = defineEmits(['update'])
// 预览其余矩阵号
const otherAccountInfo = reactive({
  show: false,
  loading: false,
  hasNext: true,
  page: {
    total: 0,
    index: 1,
    size: 10
  },
  list: [] // 其余的
})

function getAccountList() {
  console.log('获取列表')
  otherAccountInfo.loading = true
  otherAccountInfo.page.index++
  listAccountSnapshotFn()
}
function listAccountSnapshotFn() {
  const params = {
    pageNo: otherAccountInfo.page.index,
    pageSize: otherAccountInfo.page.size,
    id: id.value
  }
  listAccountSnapshot(params)
    .then(res => {
      console.log('获取账号返回', res)
      otherAccountInfo.loading = false
      if (res.code === 0) {
        otherAccountInfo.hasNext = res.data?.hasNext || false
        otherAccountInfo.page.total = res.data?.total || 0
        if (otherAccountInfo.page.index === 1) {
          otherAccountInfo.list = res.data?.records || []
        } else {
          otherAccountInfo.list = otherAccountInfo.list.concat(res.data?.records || [])
        }
        emits('update', otherAccountInfo)
      }
    })
    .catch(() => {
      otherAccountInfo.loading = false
    })
}
// 矩阵号是否授权有效
const isInvalid = item => {
  if (props.origin && props.origin === 'qrcodePublish') {
    return false
  } else {
    // 0 有效 1无效 非0都为无效
    return item.isDel !== 0
  }
}
// 预览其余矩阵号
const openOtherAccount = () => {
  if (!hideMore.value) {
    otherAccountInfo.show = true
  }
}

function otherAccountInfoClose() {
  otherAccountInfo.show = false
}
watch(
  () => props.list,
  val => {
    if (val && val.length > 0 && (!id.value || (id.value && getListTime.value === 'openAll'))) {
      otherAccountInfo.list = list.value
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  if (getListTime.value === 'openAll') {
    otherAccountInfo.page.total = total.value
  } else {
    if (id.value) {
      otherAccountInfo.loading = true
      listAccountSnapshotFn()
    }
  }
})
</script>

<style lang="scss" scoped>
.acc_ellipsis {
  display: flex;
  position: relative;
  margin-top: 16px;
  .photos_item {
    margin-right: 6px;
    position: relative;

    > img {
      width: 36px;
      height: 36px;
      object-fit: cover;
      border-radius: 50%;

      vertical-align: middle;
    }
  }

  .photo_more {
    width: 36px;
    height: 36px;
    background: #eff2f8;
    border-radius: 50%;
    font-weight: 500;
    color: #364fcd;
    font-size: 12px;
    cursor: pointer;
  }
}
</style>
