<template>
  <div>
    <el-dialog
      v-model="showDialog"
      @closed="emits('update:showDialog', false)"
      title="Warning"
      width="840px"
    >
      <template #title>
        <div class="dialog_title">
          <span class="title" style="font-size: 20px">任务视频池设置</span>
          <span class="title" style="font-size: 14px; color: #999; margin-left: 12px">
            执行任务时达人从设置的视频池中挑选视频发布
          </span>
        </div>
      </template>
      <div class="dialog_main">
        <div class="search_wrapper">
          <div class="search_item">
            <label class="item_label">视频创建时间：</label>
            <el-date-picker
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
          </div>
          <div class="search_item">
            <label class="item_label">视频标签：</label>
            <el-select
              style="width: 245px"
              v-model="searchInfo.tag"
              multiple
              filterable
              remote
              collapse-tags
              reserve-keyword
              placeholder="请输入标签关键字"
              :remote-method="remoteMethod"
              :loading="loading"
              value-key="id"
              @change="bindChange"
            >
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item"
              ></el-option>
            </el-select>
          </div>
          <div class="search_item add_item">
            <label class="item_label">使用次数：</label>
            <div
              class="item_box"
              :style="{ border: countOK ? '1px solid #dcdfe6' : '1px solid #f21111' }"
            >
              <el-input
                placeholder="最低次数"
                maxlength="6"
                @input="searchInfo.useCountMin = searchInfo.useCountMin.replace(/[^\d.]/g, '')"
                @change="isCountOK"
                v-model="searchInfo.useCountMin"
                clearable
              ></el-input>
              <span style="margin: 0 5px">至</span>
              <el-input
                placeholder="最高次数"
                maxlength="6"
                @input="searchInfo.useCountMax = searchInfo.useCountMax.replace(/[^\d.]/g, '')"
                @change="isCountOK"
                v-model="searchInfo.useCountMax"
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
                  searchInfo.videoDurationMin = searchInfo.videoDurationMin.replace(/[^\d.]/g, '')
                "
                maxlength="6"
                @change="isDurationOK"
                v-model="searchInfo.videoDurationMin"
                clearable
              ></el-input>
              <span style="margin: 0 5px">至</span>
              <el-input
                placeholder="最高时长"
                @input="
                  searchInfo.videoDurationMax = searchInfo.videoDurationMax.replace(/[^\d.]/g, '')
                "
                maxlength="6"
                @change="isDurationOK"
                v-model="searchInfo.videoDurationMax"
                clearable
              ></el-input>
            </div>
          </div>
          <div class="search_item">
            <label class="item_label"></label>
            <div class="tips">注：不设置条件即表示选择当前内容库中所有视频</div>
          </div>
        </div>
        <div class="search_result">
          <div class="sub_title">视频池预览</div>
          <div class="list_wrapper" v-loading="searchLoading">
            <el-empty
              v-if="videoInfo?.total === 0 || !videoInfo"
              description="请进行条件筛选"
              image-size="60"
            ></el-empty>
            <ul v-else class="videoList">
              <li v-for="(item, index) in videoInfo?.records" @click="playVideo(item)" :key="index">
                <img :src="item.coverUrl" alt="" />
                <img
                  class="play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20220310ibieh.png"
                  alt=""
                />
              </li>
            </ul>
          </div>
          <div class="info" v-if="videoInfo?.total">
            约
            <span style="color: rgba(54, 79, 205, 1)">{{ videoInfo?.total || 0 }}</span>
            条视频
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirm">确定</el-button>
          <el-button type="primary" @click="searchList">预览所选视频</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getTagNameList, getForwardVideoList } from '@/api/market/task.js'
import { dateFormat, throttle } from '@/utils/tools.js'

const message = inject('$message')
const props = defineProps({
  showDialog: Boolean
})
const { showDialog } = toRefs(props)

const emits = defineEmits(['update:showDialog', 'filterConditions'])

const filterDate = ref([])
const searchLoading = ref(false)
const searchInfo = reactive({
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
  tag: []
})

// 输入验证
const countOK = ref(true)
const durationOK = ref(true)
// 使用次数验证
function isCountOK() {
  if (searchInfo.useCountMin > searchInfo.useCountMax) {
    countOK.value = false
  } else {
    countOK.value = true
  }
}
// 视频时长
const isDurationOK = () => {
  if (searchInfo.videoDurationMin - 0 > searchInfo.videoDurationMax - 0) {
    durationOK.value = false
  } else {
    durationOK.value = true
  }
}

function onChangeDate(e) {
  searchInfo.publishTimeStart = dateFormat(e[0]) + ' 00:00:00'
  searchInfo.publishTimeEnd = dateFormat(e[1]) + ' 23:59:59'
}

// 视频相关数据
const videoInfo = ref(null)
async function searchList() {
  if (searchOk.value) {
    tags()
    console.log('searchInfo', searchInfo)
    searchLoading.value = true
    const res = await getForwardVideoList(searchInfo)
    searchLoading.value = false
    searchInfo.total = res.data.total
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
const options = ref([])
const loading = ref(false)
function remoteMethod(query) {
  console.log(query)
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      getTagNameList({ tagName: query }).then(res => {
        console.log('getTagNameList', res)
        options.value = res.data
      })
    }, 500)
  } else {
    options.value = []
  }
}
// 播放视频
function playVideo(item) {
  item.url ? window.open(item.url) : window.open(item.url)
}
function bindChange(val) {
  if (searchInfo.tag.length > 10) {
    message({
      type: 'warning',
      message: '最多只能添加十个标签'
    })
    searchInfo.tag.splice(-1)
  }
}
const tags = () => {
  searchInfo.tagIds = []
  searchInfo.tagNames = []
  searchInfo.tag.forEach((item, index) => {
    searchInfo.tagIds.push(item.id)
    searchInfo.tagNames.push(item.name)
  })
}

// 保存
const confirm = throttle(async () => {
  await searchList()
  if (searchOk.value) {
    emits('update:showDialog', false)
    emits('filterConditions', searchInfo)
  }
}, 1000)
</script>

<style lang="scss" scoped>
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
      align-items: center;
      font-size: 14px;
      color: #303133;
      margin-bottom: 20px;
      margin-right: 24px;
      .item_label {
        flex-shrink: 0;
        width: 120px;
        margin-right: 14px;
        text-align: right;
      }
      .item_content {
        flex-shrink: 0;
        .el-input {
          width: 230px;
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
</style>
