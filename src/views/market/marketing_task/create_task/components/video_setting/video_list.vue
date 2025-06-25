<template>
  <div>
    <el-dialog
      :model-value="showDialog"
      @closed="emits('update:showDialog', false)"
      title="Warning"
      width="840px"
    >
      <template #title>
        <div class="dialog_title">
          <span class="title" style="font-size: 20px">{{ title || '任务视频池设置' }}</span>
          <span
            class="title"
            style="font-size: 14px; color: #999; margin-left: 12px"
            v-if="subTitle"
          >
            {{ subTitle }}
          </span>
        </div>
      </template>
      <div class="dialog_main">
        <div class="search_wrapper">
          <div class="search_item">
            <label class="item_label">
              {{ `${materialType == 'imgtext' ? '图文' : '视频'}创建时间：` }}
            </label>
            <div>
              <el-radio-group
                @change="platSelectChange"
                v-model="selectTimeType"
                style="margin-bottom: 8px"
              >
                <el-radio v-for="(item, index) in timeTypeList" :key="index" :label="item.id">
                  {{ item.label }}
                </el-radio>
              </el-radio-group>

              <el-date-picker
                v-if="selectTimeType === 0"
                v-model="filterDate"
                type="daterange"
                range-separator="至"
                unlink-panels
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :editable="false"
                :disabled-date="time => time.getTime() > Date.now()"
                @change="onChangeDate"
              ></el-date-picker>
              <div class="changeTime_warp" v-if="selectTimeType === 1">
                最近
                <el-input-number
                  @change="numberChange"
                  v-model="$data.searchInfo.recentDay"
                  :min="1"
                  :max="365"
                  :step="1"
                  style="width: 100px; margin-left: 4px; margin-right: 4px"
                  controls-position="right"
                />
                天
              </div>
            </div>
          </div>
          <div class="search_item">
            <label class="item_label">
              {{ `${materialType == 'imgtext' ? '图文' : '视频'}标签：` }}
            </label>
            <tagSetting
              :hideTip="true"
              :tagList="$data.searchInfo.tag"
              @updateTag="updateTag"
            ></tagSetting>
          </div>
          <div class="search_item">
            <label class="item_label">文件夹：</label>
            <searchFileDOM
              :fileID="$data.searchInfo.fileInfo"
              @select="changeFileFun"
              failType="listCreationTagFolder"
              style="width: 246px"
            />
          </div>
          <template v-if="materialType != 'imgtext'">
            <div class="search_item add_item">
              <label class="item_label">使用次数：</label>
              <div
                class="item_box"
                :style="{ border: countOK ? '1px solid #dcdfe6' : '1px solid #f21111' }"
              >
                <el-input
                  placeholder="最低次数"
                  maxlength="6"
                  @input="
                    $data.searchInfo.useCountMin = $data.searchInfo.useCountMin.replace(
                      /[^\d]/g,
                      ''
                    )
                  "
                  @change="isCountOK"
                  v-model="$data.searchInfo.useCountMin"
                  clearable
                ></el-input>
                <span style="margin: 0 5px">至</span>
                <el-input
                  placeholder="最高次数"
                  maxlength="6"
                  @input="
                    $data.searchInfo.useCountMax = $data.searchInfo.useCountMax.replace(
                      /[^\d]/g,
                      ''
                    )
                  "
                  @change="isCountOK"
                  v-model="$data.searchInfo.useCountMax"
                  clearable
                ></el-input>
              </div>
            </div>
            <div class="search_item add_item">
              <label class="item_label">视频时长(秒)：</label>
              <div
                class="item_box"
                :style="{ border: durationOK ? '1px solid #dcdfe6' : '1px solid #f21111' }"
              >
                <el-input
                  placeholder="最低时长"
                  @input="
                    $data.searchInfo.videoDurationMin = $data.searchInfo.videoDurationMin.replace(
                      /[^\d.]/g,
                      ''
                    )
                  "
                  maxlength="6"
                  @change="isDurationOK"
                  v-model="$data.searchInfo.videoDurationMin"
                  clearable
                ></el-input>
                <span style="margin: 0 5px">至</span>
                <el-input
                  placeholder="最高时长"
                  @input="
                    $data.searchInfo.videoDurationMax = $data.searchInfo.videoDurationMax.replace(
                      /[^\d.]/g,
                      ''
                    )
                  "
                  maxlength="6"
                  @change="isDurationOK"
                  v-model="$data.searchInfo.videoDurationMax"
                  clearable
                ></el-input>
              </div>
            </div>
            <div
              class="search_item search_item_tag"
              :class="$data.searchInfo.sources.length == 1 ? 'search_item_clear' : ''"
            >
              <label class="item_label">视频来源：</label>
              <el-select
                style="width: 245px"
                v-model="$data.searchInfo.sources"
                multiple
                collapse-tags
                @change="onChangeSource"
              >
                <template v-for="item in videoSourceOptions">
                  <el-option
                    v-if="item.show"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.value == $data.searchInfo.sources ? true : false"
                  ></el-option>
                </template>
              </el-select>
            </div>
          </template>
          <!-- <div class="search_item">
            <label class="item_label"></label>
            <div class="tips">注：不设置条件即表示选择当前内容库中所有视频</div>
          </div> -->
        </div>
        <div class="search_result">
          <div class="sub_title">{{ `${materialType == 'imgtext' ? '图文' : '视频'}池预览` }}</div>
          <div class="list_wrapper" v-loading="searchLoading">
            <el-empty
              v-if="videoInfo?.total === 0 || !videoInfo"
              description="请进行条件筛选"
              :imageSize="60"
            ></el-empty>
            <ul v-else class="videoList">
              <li v-for="item in videoInfo?.records" @click="beforePreview(item)" :key="item.id">
                <img
                  :src="
                    materialType == 'imgtext' ? item.thumbCoverUrl || item.coverUrl : item.coverUrl
                  "
                  alt=""
                />
                <div class="digital_icon_left" v-if="item.templateTag == 2"></div>
                <img
                  v-if="materialType != 'imgtext'"
                  class="play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20220310ibieh.png"
                  alt=""
                />
                <img
                  v-else
                  class="play2"
                  src="https://tagvv-1256030678.file.myqcloud.com/20241026m1rq2.png"
                  alt=""
                />
              </li>
            </ul>
          </div>
          <div class="info" v-if="videoInfo?.total">
            约
            <span style="color: rgba(54, 79, 205, 1)">{{ videoInfo?.total || 0 }}</span>
            {{ `条${materialType == 'imgtext' ? '图文' : '视频'}` }}
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirm(false)">确定</el-button>
          <el-button type="primary" @click="searchList">
            {{ `预览所选${materialType == 'imgtext' ? '图文' : '视频'}` }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 图文详情的预览弹窗 -->
    <previewImgTextDOM v-if="previewImgTextInfo.show" :previewDialog="previewImgTextInfo" />
  </div>
</template>

<script setup>
import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import previewImgTextDOM from '@/views/sumvideo/components/preview_imgText_dialog.vue'
import tagSetting from '../tag_setting/index.vue'
import { getForwardVideoList } from '@/api/market/task.js'
import { dateFormat, throttle, isNotEmpty } from '@/utils/tools.js'
import { reactive } from 'vue-demi'
import { useStore } from 'vuex'

const store = useStore()
const message = inject('$message')
const props = defineProps({
  showDialog: Boolean,
  title: {
    type: String || Number,
    default: null
  },
  subTitle: {
    type: String || Number,
    default: null
  },
  materialType: {
    type: String,
    default: 'video' // 素材类型 video视频 imgtext图文
  }
})
const { showDialog, title, subTitle, materialType } = toRefs(props)
const systemVersion = computed(() => store.state.user.systemVersion)
const emits = defineEmits(['update:showDialog', 'filterConditions'])

const filterDate = ref([])
const searchLoading = ref(false)
const $data = reactive({
  searchInfo: {
    folderIds: null,
    fileInfo: {},
    useCountMin: null,
    useCountMax: null,
    videoDurationMin: null,
    videoDurationMax: null,
    publishTimeEnd: '',
    publishTimeStart: '',
    pageSize: 10,
    pageNo: 1,
    tagIds: [],
    tagNames: [],
    tag: [],
    sourceNames: [],
    recentDay: 1 // 最近多少天，选择这个入参的时候时间范围不传
  }
})
const timeTypeList = [
  {
    id: 0,
    label: '固定时间'
  },
  {
    id: 1,
    label: '动态时间'
  }
]
const selectTimeType = ref(0) // 0固定时间 1动态时间
function platSelectChange(e) {
  $data.searchInfo.recentDay = $data.searchInfo?.recentDay ? $data.searchInfo?.recentDay : 1
  selectTimeType.value = e
}
function numberChange(e) {
  $data.searchInfo.recentDay = e ? parseInt(e) : 1
}

// 输入验证
const countOK = ref(true)
const durationOK = ref(true)
// 使用次数验证
function isCountOK() {
  if ($data.searchInfo.useCountMin - 0 > $data.searchInfo.useCountMax - 0) {
    countOK.value = false
  } else {
    countOK.value = true
  }
}
// 视频时长
const isDurationOK = () => {
  if ($data.searchInfo.videoDurationMin - 0 > $data.searchInfo.videoDurationMax - 0) {
    durationOK.value = false
  } else {
    durationOK.value = true
  }
}

function onChangeDate(e) {
  if (e) {
    $data.searchInfo.publishTimeStart = dateFormat(e[0]) + ' 00:00:00'
    $data.searchInfo.publishTimeEnd = dateFormat(e[1]) + ' 23:59:59'
  } else {
    $data.searchInfo.publishTimeStart = null
    $data.searchInfo.publishTimeEnd = null
  }
}

// 视频相关数据
const videoInfo = ref(null)
async function searchList() {
  if (searchOk.value) {
    tags()
    // console.log('$data.searchInfo', $data.searchInfo)
    const params = {
      ...$data.searchInfo
    }
    if (params.subSource === 12 && params.sources.length > 1) {
      params.sources = params.sources.filter(s => {
        return s !== 1
      })
    } else if (params.subSource === 12 && params.sources.length === 1) {
      params.sources = null
    }
    params.type = [1]
    // 处理固定时间和动态时间的入参
    if (selectTimeType.value === 1) {
      delete params.publishTimeStart
      delete params.publishTimeEnd
    } else {
      delete params.recentDay
    }
    // 区分视频池图文池
    if (materialType.value === 'imgtext') {
      params.type = [99]
      params.source = 16
      params.sourceNames = []
      params.sources = []
    }
    searchLoading.value = true
    const res = await getForwardVideoList(params)
    searchLoading.value = false
    $data.searchInfo.total = res.data.total
    videoInfo.value = res.data
  } else {
    message({
      type: 'error',
      message: '请按规范输入搜索内容'
    })
  }
}
// 验证是否可以查询
const searchOk = computed(() => {
  if (countOK.value && durationOK.value) {
    return true
  }
  return false
})
// 标签远程搜索部分
// const options = ref([])
// const loading = ref(false)
// function remoteMethod(query) {
//   console.log(query)
//   if (query) {
//     loading.value = true
//     setTimeout(() => {
//       loading.value = false
//       getTagNameList({ tagName: query }).then(res => {
//         console.log('getTagNameList', res)
//         options.value = res.data
//       })
//     }, 500)
//   } else {
//     options.value = []
//   }
// }

// 视频来源
const videoSourceOptions = ref([
  // {
  //   label: '运营策略中心（例如员工做任务发过的视频）',
  //   value: 1
  // },
  {
    label: '征集任务',
    value: 1, // 1还选不到征集任务配合subSource=12才可以
    show: systemVersion.value === 3
  },
  {
    label: '流水线（视频模板批量生成的视频）',
    value: 2,
    show: systemVersion.value === 3
  },
  {
    label: '手动上传（素材库中手动上传的视频）',
    value: 3,
    show: true
  },
  {
    label: '第三方平台（例如酷家乐视频）',
    value: 4,
    show: false // 2024/06/18 （新）专业版需求隐藏了酷家乐导入
  },
  {
    label: '模板式生成',
    value: 11,
    show: true
  },
  {
    label: '剧本式生成',
    value: 12,
    show: true
  },
  {
    label: '智能混剪',
    value: 14,
    show: true
  }
])
// change视频来源
function onChangeSource() {
  const names = []
  videoSourceOptions.value.forEach(item => {
    if ($data.searchInfo.sources.includes(item.value)) {
      names.push(item.label)
    }
  })

  if (names.includes('征集任务')) {
    $data.searchInfo.subSource = 12
  } else {
    $data.searchInfo.subSource = null
  }
  $data.searchInfo.sourceNames = names
}
function initVideoSource() {
  const defaultIds = systemVersion.value === 3 ? [2, 11, 12, 14] : [11, 12, 14]
  // console.log('添加默认视频来源-流水线')
  const names = []
  $data.searchInfo.sources = materialType.value === 'imgtext' ? [] : defaultIds
  videoSourceOptions.value.forEach(item => {
    if ($data.searchInfo.sources.includes(item.value)) {
      names.push(item.label)
    }
  })
  $data.searchInfo.sourceNames = names
}
initVideoSource()

const previewImgTextInfo = ref({
  show: false,
  info: {}
}) // 图文的预览

function beforePreview(item) {
  if (materialType.value === 'imgtext') {
    console.log('预览图文', item)
    const urlList = JSON.parse(item.pictures).map(x => x.url)
    let imageTextTitle = ''
    let imageTextDescription = ''
    if (isNotEmpty(item.imageTextTitle)) {
      const titleInfo = JSON.parse(item.imageTextTitle)
      imageTextTitle = titleInfo.title
      imageTextDescription = titleInfo.description
    }
    previewImgTextInfo.value = {
      show: true,
      urlList: urlList,
      title: imageTextTitle,
      desc: imageTextDescription,
      mount: item.mount ? JSON.parse(item.mount) : {}
    }
  } else {
    playVideo(item)
  }
}

// 播放视频
function playVideo(item) {
  item.url ? window.open(item.url) : window.open(item.url)
}
function bindChange(val) {
  if ($data.searchInfo.tag.length > 10) {
    message({
      type: 'warning',
      message: '最多只能添加十个标签'
    })
    $data.searchInfo.tag.splice(-1)
  }
}
const tags = () => {
  $data.searchInfo.tagIds = []
  $data.searchInfo.tagNames = []
  $data.searchInfo.tag.forEach((item, index) => {
    $data.searchInfo.tagIds.push(item.id)
    $data.searchInfo.tagNames.push(item.name)
  })
}

// 保存
const confirm = throttle(async (getInitParam = false) => {
  await searchList()
  if ((!videoInfo.value || !(videoInfo.value?.records || []).length) && !getInitParam) {
    return message({
      type: 'warning',
      message: `该条件未筛选到${materialType.value === 'imgtext' ? '图文' : '视频'}`
    })
  }
  if (searchOk.value) {
    const deepSearchInfo = JSON.parse(JSON.stringify($data.searchInfo))

    if (deepSearchInfo.sources.includes(1)) {
      deepSearchInfo.sources = deepSearchInfo.sources.filter(x => {
        return x !== 1
      })
      deepSearchInfo.subSource = 12
    } else {
      deepSearchInfo.subSource = null
    }

    if (deepSearchInfo.subSource === 12 && $data.searchInfo.sources.length === 1) {
      deepSearchInfo.sources = null
    }

    // 处理固定时间和动态时间的入参
    if (selectTimeType.value === 1) {
      delete deepSearchInfo.publishTimeStart
      delete deepSearchInfo.publishTimeEnd
    } else {
      delete deepSearchInfo.recentDay
    }

    if (materialType.value === 'imgtext') {
      deepSearchInfo.type = [99]
      deepSearchInfo.source = 16
      deepSearchInfo.sourceNames = []
      deepSearchInfo.sources = []
    }

    if (!getInitParam) emits('update:showDialog', false)
    emits('filterConditions', deepSearchInfo, videoInfo.value.records)
  }
}, 1000)

// 设置默认值
function setDefaultParam(parma, updatePostVideo = false) {
  console.log('setDefaultParam', parma)
  initVideoSource() // 再次更新来源
  $data.searchInfo = {
    ...$data.searchInfo,
    ...parma
  }
  if (parma.recentDay) {
    // 有就说明是选择了最近x天
    selectTimeType.value = 1
  } else {
    selectTimeType.value = 0
    if (parma.publishTimeStart) {
      filterDate.value[0] = new Date(parma.publishTimeStart)
    }
    if (parma.publishTimeEnd) {
      filterDate.value[1] = new Date(parma.publishTimeEnd)
    }
  }

  if (updatePostVideo) getInitParam()
}
// 获取初始值
function getInitParam() {
  confirm(true)
}

defineExpose({ setDefaultParam, getInitParam })
// 更新标签
function updateTag(e) {
  $data.searchInfo.tag = e
  bindChange()
}
// 更新文件夹
function changeFileFun(e) {
  console.log('获取到的文件夹信息', e)
  $data.searchInfo.fileInfo = e || {}
  $data.searchInfo.folderIds = isNotEmpty(e) ? [e.id] : null
}
</script>

<style lang="scss" scoped>
// 云元素的标志
.material_item_badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 52px !important;
  height: 52px !important;
}
:deep(.el-select__tags > span) {
  margin-left: 6px;
}
.dialog_main {
  display: flex;
  .search_wrapper {
    flex: 1;
    padding-top: 0 !important;
    .search_item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      color: #303133;
      margin-bottom: 20px;
      margin-right: 24px;
      .item_label {
        flex-shrink: 0;
        width: 120px;
        margin-right: 14px;
        text-align: right;
        line-height: 32px;
      }
      .item_content {
        flex-shrink: 0;
        .el-input {
          width: 230px;
        }
      }
      .changeTime_warp {
        height: 32px;
      }
    }
    .search_item_clear {
      :deep() .el-select {
        .el-select__tags {
          .el-tag {
            .el-tag__chose {
              display: none !important;
            }
          }
        }
      }
    }
    .search_item_tag {
      :deep() .el-select {
        .el-select__tags-text {
          justify-content: flex-start;
        }
      }
    }
    .tips {
      color: #999;
    }
  }
  .search_result {
    flex-shrink: 0;
    padding: 5px 0 5px 20px;
    width: 260px;
    box-sizing: border-box;
    border-left: 1px solid #dcdfe6;
    .sub_title {
      font-size: 16px;
    }
    .list_wrapper {
      height: 300px;
      margin-top: 12px;
      overflow: auto;
      .videoList {
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        li {
          cursor: pointer;
          position: relative;
          width: 100px;
          height: 140px;
          margin-right: 12px;
          margin-bottom: 12px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .play {
            width: 26px;
            height: 26px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .play2 {
            width: 24px;
            height: 24px;
            position: absolute;
            right: 8px;
            top: 8px;
          }
        }
      }
    }
    .info {
      margin-top: 12px;
    }
  }
}
:deep(.el-dialog__footer) {
  border: 1px solid #dcdfe6;
  display: flex;
  justify-content: center;
}
.add_item .item_box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
:deep(.add_item .el-input.el-input--default) {
  width: 110px;
}
:deep(.add_item .el-input__inner) {
  border: 0;
  text-align: center;
}
:deep(.el-select) {
  .el-select__tags {
    max-width: unset !important;
  }
}
</style>
