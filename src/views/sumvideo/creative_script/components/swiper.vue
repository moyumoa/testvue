<template>
  <div>
    <div class="video_box" v-loading="tableForm.loading">
      <template v-if="tableForm.listData && tableForm.listData.length > 0">
        <div
          class="all_video"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="
            pageOnHide || tableForm.listData.length >= tableForm.page.total
          "
        >
          <div
            class="one_video"
            v-for="(item, index) in tableForm.listData"
            :key="index"
            :style="{
              width: `${oneWidth}px`
            }"
          >
            <div class="one_box" @click="toDetail(item)">
              <!-- 剧本区域 -->
              <div
                class="video_top"
                :style="{
                  height: `calc((${oneWidth}px - 12px - 24px) * 0.75)`
                }"
              >
                <!-- 剧本 合成成功-->
                <template v-if="item.videoStatus == 2 && item.status != 1">
                  <img v-if="item.coverUrl" class="video_cover" :src="item.coverUrl" alt />
                  <div v-else class="video_cover_default">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110fyu1d.png"
                      alt=""
                    />
                  </div>
                </template>
                <!-- 除了成功以外，需要显示占位效果 -->
                <template v-else>
                  <div
                    class="video_default"
                    v-loading="item.videoStatus === 1 || item.videoStatus === 0"
                    element-loading-text="正在合成中"
                    element-loading-background="rgba(255, 255,255, 0)"
                  >
                    <!-- 合成失败 -->
                    <div
                      class="video_err"
                      v-if="item.videoStatus === 3"
                      style="background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
                    >
                      <div class="wrapper">
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png"
                          alt=""
                        />
                        <p style="color: #606266">合成失败</p>
                      </div>
                    </div>
                    <!-- 草稿 -->
                    <div
                      class="video_err"
                      v-if="
                        !(item.videoStatus === 1 || item.videoStatus === 0) && item.status === 1
                      "
                    >
                      <div class="wrapper">
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20250110sgw23.png"
                          alt=""
                        />
                        <p class="marginTop8">剧本草稿</p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 顶部操作区 -->
                <div class="video_operate_top" v-if="pageSource != 'createByScript'">
                  <!-- 编辑分类 -->
                  <el-tooltip
                    effect="dark"
                    content="编辑分类"
                    placement="top"
                    v-if="item.videoStatus == 2 && item.status != 1"
                  >
                    <div class="del_btn" @click.stop="showCategoryDialogFun(item, index)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                        alt=""
                      />
                    </div>
                  </el-tooltip>

                  <!-- 删除 -->
                  <el-tooltip effect="dark" content="移入回收站" placement="top">
                    <div class="del_btn" @click.stop="showDelDialogFun(item, index)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230303ajt5u.png"
                        alt=""
                      />
                    </div>
                  </el-tooltip>
                </div>

                <!-- 单选框 -->
                <div class="xm_radio_box" v-if="pageSource === 'createByScript'">
                  <div class="radio_choose" v-if="chooseInfo.id === item.id"></div>
                  <div class="radio_unChooose" v-else></div>
                </div>
              </div>
              <!-- 合成中 信息都是-- -->
              <div class="video_bottom">
                <!-- 剧本标题 -->
                <div class="video_title line-hidden1">
                  {{ item.videoStatus === 1 || item.videoStatus === 0 ? '--' : item.name || '--' }}
                </div>
                <!-- 剧本结构 -->
                <div class="video_structure line-hidden1">
                  {{ item.scriptStruct === null ? '--' : item.scriptStruct.join('-') }}
                </div>
                <!-- 剧本数据 -->
                <div class="video_num">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/202501105mjen.png" alt="" />
                  分镜数：
                  <span>
                    {{ item.replaceCnt }}
                  </span>
                </div>
                <!-- 剧本创建时间 -->
                <div class="video_num">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20250110pc5lj.png" alt="" />
                  <span>
                    {{
                      item.videoStatus === 1 || item.videoStatus === 0
                        ? '--'
                        : item.createTime.replace('T', ' ')
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="loading_library">
          <img
            src="/public/loading.gif"
            v-if="tableForm.loading && tableForm.page.index > 1"
            alt=""
          />
          {{
            tableForm.loading
              ? tableForm.page.index === 1
                ? ''
                : '加载中...'
              : tableForm.listData.length >= tableForm.page.total
              ? tableForm.listData.length > 8
                ? '已经到底了~'
                : ''
              : '上拉加载更多~'
          }}
        </div>
      </template>
      <div
        v-if="!tableForm.loading && !(tableForm.listData && tableForm.listData.length > 0)"
        class="no_echart"
      >
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
    <el-dialog
      destroy-on-close
      title="移入回收站"
      width="444px"
      @close="delDialogVisible = false"
      v-model="delDialogVisible"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div style="padding: 16px 16px 12px">创意已绑定流水线，无法删除</div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="delDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="delDialogVisible = false">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <bindCategoryDOM
      v-if="bindCategoryDialog.show"
      :bindDialog="bindCategoryDialog"
      @updateCategory="updateCategory"
    />
  </div>
</template>
<script setup>
import bindCategoryDOM from './bindCategory_dialog.vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCreative } from '@/api/sumvideo/creative_mould.js'
import { throttle, getCWidth, isNotEmpty } from '@/utils/tools'

const router = useRouter()

const props = defineProps({
  tableForm: {
    type: Object,
    default: () => {
      return {
        loading: false,
        listData: [],
        page: {
          index: 1,
          size: 10,
          total: 0
        }
      }
    }
  },
  searchComponents: {
    type: Object,
    default: () => {
      return {}
    }
  },
  pageOnHide: {
    type: Boolean,
    default: false
  },
  pageSource: {
    type: String,
    default: ''
  }, // 页面来源 createByScript 剧本式生成过来的 显示单选框和样式修改
  chooseTemplateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  } // 选中的剧本信息 目前只有剧本式生成过来才有
})
const { tableForm, pageOnHide, pageSource } = toRefs(props)

const emits = defineEmits(['success', 'resetList', 'updateCategory', 'chooseTemplateFun'])

const loadFun = throttle(function () {
  console.log('滚动到底了')
  emits('loadSwiperFun')
}, 1000)

const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(224)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 30 - 7
  // pageSource.value === 'createByScript' ? getCWidth() - 32 - 30 - 7 : getCWidth() - 32 - 30 - 7

  init()
}
getWidth()
function init() {
  cLen.value =
    // pageSource.value === 'createByScript'
    //   ? parseInt((getCWidth() - 32 - 30 - 84) / 180)
    parseInt((getCWidth() - 32 - 30 - 72) / 224)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
}
const initOver = ref(false)
onMounted(() => {
  if (isNotEmpty(props.chooseTemplateInfo)) {
    chooseInfo.value = JSON.parse(JSON.stringify(props.chooseTemplateInfo))
    nextTick(() => {
      initOver.value = true
    })
  } else {
    initOver.value = true
  }

  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  ElMessageBox.close(false)
  window.onresize = null
})
const delDialogVisible = ref(false)
// 删除创意
const showDelDialogFun = throttle(item => {
  if (item.hasPipeline) {
    delDialogVisible.value = true
    return
  }
  const data = {
    creativeId: item.id
  }
  deleteCreative(data).then(res => {
    if (res.code === 0) {
      emits('resetList')

      ElMessage({
        message: '移入成功',
        type: 'success'
      })
    }
  })
}, 500)
const chooseInfo = ref({}) // 选中的模板信息
watch(
  () => chooseInfo.value,
  val => {
    if (initOver.value) {
      emits('chooseTemplateFun', val)
    }
  },
  {
    deep: true,
    immediate: true
  }
)
// 编辑
const toDetail = throttle(
  item => {
    // 如果是剧本式生成过来的 就是选中当前剧本 而不是进来详情页
    if (pageSource.value === 'createByScript') {
      chooseInfo.value = item

      return
    }
    // 合成中不进行任何操作
    if (item.videoStatus === 1 || item.videoStatus === 0) {
      return
    }
    // 合成失败、未正式合成的剧本进入剪辑页
    // if (item.videoStatus === 3 || item.status === 1) {
    //   return
    // }
    // 合成成功的剧本进入剧本详情页
    router.push({
      path: '/sumwhy_video/creative_script/detail',
      query: {
        id: item.id
      }
    })
  },
  pageSource.value === 'createByScript' ? 300 : 500
)
// 编辑分类
const bindCategoryDialog = reactive({
  show: false,
  id: null,
  categoryIdList: []
})
const showCategoryDialogFun = throttle((item, index) => {
  bindCategoryDialog.id = item.id
  bindCategoryDialog.categoryIdList = item.categoryIdList || []
  bindCategoryDialog.index = index
  bindCategoryDialog.show = true
})
// 编辑分类成功后，修改选中的数据
function updateCategory(e) {
  emits('updateCategory', {
    categoryIdList: e,
    index: bindCategoryDialog.index
  })
}
</script>
<style lang="scss" scoped>
.video_box {
  margin-top: 16px;
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
}

.one_box {
  min-height: 276px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  padding: 12px;
  .video_top {
    width: 100%;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    .video_cover {
      background: linear-gradient(135deg, #ecf4ff 0%, #d4e4ff 100%);
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
    }
    .video_cover_default {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #ecf4ff 0%, #d4e4ff 100%);
      img {
        width: 64px;
        height: 64px;
        object-fit: contain;
        display: flex;
      }
    }
    .video_default {
      background: linear-gradient(135deg, #ecf4ff 0%, #d4e4ff 100%);
      height: 100%;
    }
    .video_err {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
      pointer-events: none;

      .wrapper {
        p {
          font-size: 14px;
          color: #598adb;
          line-height: 18px;
          text-align: center;
        }

        img {
          width: 60px;
          height: 60px;
          display: flex;
        }
      }
    }
    .video_operate_top {
      opacity: 0;
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .del_btn {
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 16px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
          width: 16px;
          height: 16px;
          object-fit: contain;
          display: flex;
        }
      }
      .del_btn + .del_btn {
        margin-left: 12px;
      }
    }
  }
  .video_bottom {
    .video_title {
      margin-top: 8px;

      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
    }
    .video_structure {
      margin-top: 4px;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px;
    }
    .video_num {
      margin-top: 4px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #606266;
      line-height: 18px;
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        display: flex;
        margin-right: 4px;
      }
    }
    .video_structure + .video_num {
      margin-top: 8px;
    }
  }
}
.all_video {
  align-items: stretch !important;
}
.one_video {
  padding: 0 12px 12px 0 !important;
  .one_box:hover {
    .video_operate_top {
      opacity: 1;
    }
  }
}
.xm_radio_box {
  z-index: 5;
  position: absolute;
  right: 12px;
  bottom: 12px;
}
</style>
