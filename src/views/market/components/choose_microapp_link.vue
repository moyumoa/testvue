<template>
  <div class="choose_microapp_link">
    <slot name="default">
      <el-button
        type="primary"
        @click="data.pageLinkDialog = true"
        v-if="!data.mountInfo && !disabled"
      >
        设置
      </el-button>
      <div class="selected" :class="{'input-disabled':disabled}" v-else-if="data.mountInfo">
        <span>【{{ data.mountInfo.title }}】：{{ data.mountInfo.content }}</span>
        <el-icon style="cursor: pointer" @click="cancelSelect" v-if="!disabled">
          <i-delete color="#f85151" />
        </el-icon>
      </div>
    </slot>
    <el-dialog v-model="data.pageLinkDialog" title="Tips" :width="740">
      <template #title>
        <div class="dialog_title">
          <span class="title">小程序落地页</span>
          <el-tooltip popper-class="tooltip-class" placement="right-start" raw-content>
            <template #content>
              <div class="tooltip_content">
                <p>点击视频挂载，跳转的页面是落地页</p>
                <img src="https://tagvv-1256030678.file.myqcloud.com/20220110df4w0.png" />
              </div>
            </template>
            <img src="@/assets/images/operate/tip_line.png" style="width: 14px; height: 14px" />
          </el-tooltip>
        </div>
      </template>
      <div class="page_link_dialog">
        <el-form :label-width="100">
          <el-form-item label="落地页：">
            <el-radio-group v-model="data.mountType">
              <el-radio :label="1">自定义页面</el-radio>
              <!-- <el-radio :label="2">关联店铺商品</el-radio> -->
              <!-- <el-radio :label="3" v-if="taskType == 1">跳转直播间</el-radio> -->
            </el-radio-group>
          </el-form-item>
          <el-form-item label="选择页面：" v-if="data.mountType == 1">
            <el-radio-group v-model="data.pageType">
              <!-- <el-radio :label="1">导航页面</el-radio> -->
              <el-radio :label="2">小程序页面</el-radio>
              <el-radio :label="3">在线预约</el-radio>
              <el-radio :label="4" v-if="taskType == 1">直播传送门</el-radio>
            </el-radio-group>
            <div class="select_page_type">
              <el-select
                v-model="data.miniTabPageValue"
                placeholder="请选择"
                v-if="data.pageType == 1"
              >
                <el-option
                  v-for="item in data.tabPages"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <div v-if="data.pageType == 2">
                <choose-diypage v-model:diyPageInfo="data.diyPage"></choose-diypage>
              </div>
              <div v-if="data.pageType == 3">
                <choose-appointment v-model:appointInfo="data.appointInfo"></choose-appointment>
              </div>
              <div v-if="data.pageType == 4">
                <choose-live-portal
                  v-model:livePortalInfo="data.livePortalInfo"
                ></choose-live-portal>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="选择商品：" v-if="data.mountType == 2">
            <choose-goods @choose="data.goods = $event"></choose-goods>
          </el-form-item>
          <!-- <el-form-item label="" v-if="data.mountType == 3">
            <choose-live-portal v-model:livePortalInfo="data.livePortalInfo"></choose-live-portal>
          </el-form-item> -->
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.pageLinkDialog = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import chooseDiypage from './choose_diypage.vue'
import chooseGoods from './choose_goods.vue'
import chooseAppointment from './choose_appointment.vue'
import chooseLivePortal from './choose_live_portal.vue'

const props = defineProps({
  disabled: Boolean,
  type: Number, // 挂载类型
  mountInfo: Object, // 挂载信息
  taskType: Number,
  modelValue: Boolean
})
const disabled = toRef(props, 'disabled')
const propsMountType = toRef(props, 'type')
const propsMountInfo = toRef(props, 'mountInfo')
const taskType = toRef(props, 'taskType')

const $message = inject('$message')
const emits = defineEmits(['choose', 'update:modelValue'])

const data = reactive({
  tabPages: [
    {
      value: '/pages/index/index',
      label: '首页'
    },
    {
      value: '/pages/category/index',
      label: '分类'
    },
    {
      value: '/pages/brand/index',
      label: '品牌号'
    },
    {
      value: '/pages/mine/index',
      label: '我的'
    }
  ],
  pageLinkDialog: false,
  mountType: propsMountType.value || 1, // 挂载类型
  mountInfo: propsMountInfo.value || null,
  pageType: 2, // 小程序页面类型
  miniTabPageValue: '', // 小程序导航页面
  diyPage: null,
  goods: null,
  appointInfo: null,
  livePortalInfo: null
})

watch(
  () => props.modelValue,
  value => {
    data.pageLinkDialog = value
  },
  { immediate: true }
)

watch(
  () => data.pageLinkDialog,
  value => {
    emits('update:modelValue', value)
  }
)

function onSubmit() {
  const mountInfo = {
    title: '',
    content: '',
    value: ''
  }
  // 挂载自定义页面
  if (data.mountType === 1) {
    const _mountInfo = {
      pageType: data.pageType,
      pageInfo: null
    }
    if (data.pageType === 1) {
      if (!data.miniTabPageValue) return $message.warning('请选择导航页面')
      mountInfo.title = '导航页面'
      mountInfo.content = data.tabPages.filter(e => e.value === data.miniTabPageValue)[0].label
      _mountInfo.pageInfo = data.miniTabPageValue
    } else if (data.pageType === 2) {
      if (!data.diyPage) return $message.warning('请选择小程序页面')
      mountInfo.title = '小程序页面'
      mountInfo.content = data.diyPage.title
      _mountInfo.pageInfo = data.diyPage.id
    } else if (data.pageType === 3) {
      if (!data.appointInfo) return $message.warning('请选择预约活动')
      mountInfo.title = '预约活动'
      mountInfo.content = data.appointInfo.activityTitle
      _mountInfo.pageInfo = `pages/retainedActivity/index?id=${data.appointInfo.activityId}`
    } else if (data.pageType === 4) {
      if (!data.livePortalInfo) return $message.warning('请选择直播传送门')
      mountInfo.title = '直播传送门'
      mountInfo.content = data.livePortalInfo.name
      _mountInfo.pageInfo = `pages/livePortal/index?id=${data.livePortalInfo.id}`
    }
    mountInfo.value = JSON.stringify(_mountInfo)
  } else if (data.mountType === 2) {
    // 挂载商品
    if (!data.goods) {
      return $message.warning('请选择商品')
    }
    mountInfo.title = '抖店商品'
    mountInfo.value = data.goods.shopId
    mountInfo.content = data.goods.name
  } else if (data.mountType === 3) {
    // 挂载直播间
    // if (!data.livePortalInfo) return $message.warning('请选择直播传送门')
    // mountInfo.title = '直播传送门'
    // mountInfo.content = data.livePortalInfo.name
    // mountInfo.value = {
    //   pageType: 3,
    //   pageInfo: `pages/livePortal/index?id=${data.livePortalInfo.id}`
    // }
  }
  data.mountInfo = mountInfo
  emits('choose', data.mountType, mountInfo)
  data.pageLinkDialog = false
}

function cancelSelect() {
  data.mountInfo = null
  data.diyPage = null
  data.appointInfo = null
  data.livePortalInfo = null
  data.miniTabPageValue = ''
  emits('choose', 1, null)
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  flex: 1;
}
:deep .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #eff1f4;
  .dialog_title {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    .title {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
  }
}
:deep .el-dialog__footer {
  border-top: 1px solid #eff1f4;
}
:deep .el-form-item {
  margin-bottom: 12px;
}
.choose_microapp_link .selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 30px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
  //width: 100%;
  box-sizing: border-box;
  > span {
    @include mult_line(1);
  }

}
.input-disabled{
  color: #c0c4cc;
  border-color:#e4e7ed ;
  background-color: #f5f7fa;
  cursor: not-allowed;
}
.page_link_dialog {
  padding-right: 26px;
  .select_page_type {
    margin-top: 10px;
  }
}
</style>

<style lang="scss">
.tooltip_content {
  padding-top: 5px;
  > p {
    font-size: 14px;
  }
  > img {
    margin-top: 16px;
    width: 260px;
  }
}
</style>
