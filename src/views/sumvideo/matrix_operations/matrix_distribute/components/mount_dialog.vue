<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="挂载项设置"
      width="560px"
      custom-class="xm_element_dialog"
    >
      <div class="dialog_content">
        <el-form @submit.prevent :model="formData" ref="ruleForm" label-width="66px">
          <div class="content_title">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20241031q3spg.png" alt="" />
            抖音
          </div>
          <div class="content_containe">
            <el-form-item label="话题：">
              <chooseDYTopic
                origin="task"
                :historyType="3"
                width="425px"
                :disabled="disabled"
                v-model:topicList="formData.dyTopicList"
              />
            </el-form-item>
            <el-form-item label="@：">
              <chooseAtPerson
                type="dyPlatform"
                :historyType="3"
                width="425px"
                origin="task"
                :disabled="disabled"
                v-model:atPersonList="formData.dyAtList"
              />
            </el-form-item>
            <el-form-item label="POI：">
              <choosePOI
                type="dy"
                width="425px"
                origin="task"
                :disabled="disabled"
                v-model:PoiInfo="formData.dyPOIInfo"
                :list="defaultDYPOIList"
              />
            </el-form-item>
          </div>
          <div class="content_title">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20241031excy4.png" alt="" />
            小红书
          </div>
          <div class="content_containe">
            <el-form-item label="话题：">
              <chooseXHSTopic
                origin="task"
                width="425px"
                :historyType="1"
                :disabled="disabled"
                v-model:topicList="formData.xhsTopicList"
              />
            </el-form-item>
            <el-form-item label="@：">
              <chooseAtPerson
                type="xhs"
                width="425px"
                origin="task"
                :historyType="1"
                :disabled="disabled"
                v-model:atPersonList="formData.xhsAtList"
              />
            </el-form-item>
            <el-form-item label="POI：">
              <choosePOI
                type="xhs"
                width="425px"
                origin="task"
                :disabled="disabled"
                v-model:PoiInfo="formData.xhsPOIInfo"
                :list="defaultXHSPOIList"
              />
            </el-form-item>
          </div>
          <el-collapse v-model="showCollapse">
            <el-collapse-item :name="1">
              <template #title>
                <div class="content_title_collapse">
                  <span style="margin-right: 4px">高级设置</span>
                  <img
                    :class="[isNotEmpty(showCollapse) && showCollapse[0] === 1 ? 'put' : 'expand']"
                    src="https://tagvv-1256030678.file.myqcloud.com/20241031yer2y.png"
                    alt=""
                  />
                </div>
              </template>

              <div class="collapse_box">
                <div class="collapse_title" style="">POI设置：</div>
                <div class="collapse_content">
                  启用优先挂载账号绑定POI
                  <el-switch
                    @change="POIchange"
                    :disabled="disabled"
                    v-model="formData.useAccountOwenPoi"
                  ></el-switch>
                </div>
                <div class="collapse_content">
                  未设置账号绑定POI时，挂载账号所在业务主体部门POI
                  <el-switch
                    :disabled="disabled || !formData.useAccountOwenPoi"
                    v-model="formData.useDepartOwenPoi"
                  ></el-switch>
                </div>
                <template v-if="origin == 'batchPublishImgtext'">
                  <div class="collapse_title">图文话题/@设置：</div>
                  <div class="collapse_content">
                    启用优先挂载图文素材里的话题和@
                    <el-switch
                      :disabled="disabled"
                      v-model="formData.isNotePrioritizedTemplateInfo"
                    ></el-switch>
                  </div>
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>
      <template #footer v-if="props.isInit">
        <span class="dialog_footer">
          <div class="footer_right">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
          </div>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import chooseDYTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_dy_topic_platform.vue'
import chooseXHSTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_xhs_topic.vue'
import chooseAtPerson from '@/views/market/marketing_task/create_task/components/video_setting/choose_atPerson.vue'
import choosePOI from '@/views/market/marketing_task/create_task/components/video_setting/choose_poi.vue'
import { throttle, isNotEmpty } from '@/utils/tools'
// const message = inject('$message')
const emits = defineEmits(['updateFun'])

const props = defineProps({
  isInit: Boolean,
  mountDialog: {
    type: Object,
    default: () => {
      return {
        show: false,
        disabled: false,
        origin: '' // batchPublishVideo 批量发布选择视频 batchPublishImgtext 批量发布选择图文
      }
    }
  }
})
const { show, disabled, origin } = toRefs(props.mountDialog)
const showCollapse = ref([])

const formData = ref({
  dyTopicList: [],
  dyAtList: [],
  dyPOIInfo: {},
  xhsTopicList: [],
  xhsAtList: [],
  xhsPOIInfo: {},
  useAccountOwenPoi: false,
  useDepartOwenPoi: false,
  isNotePrioritizedTemplateInfo: false
})
const defaultDYPOIList = ref([])
const defaultXHSPOIList = ref([])
// --弹窗的取消和确定

const dialog = ref()
const btnLoading = ref(false)
const ruleForm = ref(null)
function closeDialog() {
  dialog.value.handleClose()
}
const handleConfirm = throttle(() => {
  if (disabled.value) {
    dialog.value.handleClose()
    return
  }
  ruleForm.value.validate(valid => {
    if (valid) {
      btnLoading.value = true
      // saveMannequin(formData.value)
      //   .then(res => {
      //     if (res.code === 0) {
      // message.success(`设置成功`)
      emits('updateFun', formData.value, dialog, btnLoading)

      // dialog.value.handleClose()
      //     }
      // btnLoading.value = false
      //   })
      //   .catch(() => {
      //     btnLoading.value = false
      //   })
    }
  })
}, 700)
// --弹窗的取消和确定 end

onMounted(() => {
  if (isNotEmpty(props.mountDialog.info)) {
    formData.value = JSON.parse(JSON.stringify(props.mountDialog.info))
  }
})
function POIchange(e) {
  console.log('POIchange', e)
  if (!e) {
    formData.value.useDepartOwenPoi = false
  }
}
</script>
<style lang="scss" scoped>
.dialog_content {
  width: calc(100% + 16px);
  padding-right: 16px;
  max-height: 60vh;
  overflow-y: auto;
  .content_title {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      display: flex;
      margin-right: 8px;
    }
  }
  .content_containe {
    margin-bottom: 20px;
    margin-top: 12px;
    width: 100%;
    min-height: 160px;
    background: #f2f3f5;
    border-radius: 2px;
    padding: 12px 16px 12px 0;
  }
  .content_title_collapse {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: max-content;
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #364fcd;
    line-height: 20px;
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      display: flex;
    }
    .expand {
      transition: all 0.5s;
      transform: rotate(180deg);
    }
    .put {
      transition: all 0.5s;
      transform: rotate(0);
    }
  }
  .collapse_box {
    padding-bottom: 12px;
    padding-top: 16px;
    .collapse_title {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
    }
    .collapse_content {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px !important;
    }
    .collapse_content + .collapse_content {
      margin-top: 16px;
    }
    .collapse_content + .collapse_title {
      margin-top: 20px;
    }
    .collapse_title + .collapse_content {
      margin-top: 12px;
    }
  }
}
:deep(.el-collapse-item__content) {
  padding: 0 !important;
}
:deep(.el-form-item__content > div) {
  width: 100% !important;
  .dept_search_popper > div {
    width: 430px !important;
  }
}
:deep(.el-collapse-item__arrow) {
  display: none !important;
}
:deep(.el-collapse-item__header) {
  border: none !important;
  &.is-active {
    border: none !important;
  }
}
:deep(.el-collapse) {
  border: none !important;
  --el-collapse-header-height: 1;
}
:deep(.el-switch) {
  height: max-content;
}
</style>
