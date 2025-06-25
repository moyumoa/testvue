<template>
  <div class="create_page">
    <div class="tips_warp">
      <div class="top_tips">
        <div class="tips_l">
          只需输入几个关键词，快速生成视频标题文案存入模板标题文案库
          <br />
          当员工在小程序上参与转发任务或跟拍任务时，自动推荐标题文案库中的文案，助力提升员工视频的数据表现！
          <!-- <br />
          每条标题文案消耗一张AI文案创作券，当前剩余：
          <span style="color: #364fcd">{{ aiCreationTicketRemainNum }}</span>
          张 -->
        </div>
        <!-- <el-button type="primary" @click="toReach">充值</el-button> -->
      </div>
    </div>
    <div class="line line_color"></div>
    <div class="content_warp">
      <div class="condition">
        <div class="condition_scroll">
          <!-- 适应平台 -->
          <div class="type_title" style="margin-top: 0">适应平台</div>
          <div class="adapt_platform">
            <div class="select_show" :class="{ select_show_active: selectOpen }">
              <!-- 选择内容的显示 -->
              <div class="select_content">
                <div class="platform_item">
                  <div
                    class="xm_platformIcon_0_16"
                    style="position: static; margin-right: 8px"
                    v-if="$data.platformSelect == 0"
                  ></div>
                  <div
                    class="xm_platformIcon_1_16"
                    style="position: static; margin-right: 8px"
                    v-if="$data.platformSelect == 1"
                  ></div>
                  <div
                    class="xm_platformIcon_3_16"
                    style="position: static; margin-right: 8px"
                    v-if="$data.platformSelect == 3"
                  ></div>
                  <div
                    class="xm_platformIcon_4_16"
                    style="position: static; margin-right: 8px"
                    v-if="$data.platformSelect == 4"
                  ></div>
                  <div
                    class="xm_platformIcon_2_16"
                    style="position: static; margin-right: 8px"
                    v-if="$data.platformSelect == 2"
                  ></div>
                  <div class="getPlatform_Zn">
                    {{ getPlatformZn }}
                    <span v-if="$data.platformSelect == 0">（适用于多平台）</span>
                  </div>
                </div>
              </div>
              <!-- 箭头 -->
              <div class="indicate" :class="{ indicate_180: selectOpen }">
                <el-icon><i-arrow-down /></el-icon>
              </div>
            </div>
            <el-select
              v-model="$data.platformSelect"
              placeholder="请选择平台"
              popper-class="icon_select"
              style="width: 100%"
              @visible-change="handleVisibleChange"
            >
              <el-option
                v-for="(item, index) in selectOptions"
                :key="index"
                :label="item.label"
                :value="item.id"
                :class="[`option_16_${item.pinY}`, 'back_position_16']"
              ></el-option>
            </el-select>
          </div>
          <!-- 文案类型 -->
          <div class="type_title">文案类型</div>
          <div class="text_type">
            <div
              class="text_type_item"
              :class="{ text_type_item_active: $data.textTypeChecked.value == item.value }"
              v-for="(item, index) in textTypeList"
              :key="index"
              @click="choseTextType(item)"
            >
              <img :src="item.icon" alt="" class="text_item_icon" />
              {{ item.text }}
            </div>
          </div>
          <!-- 关键词 -->
          <el-tooltip placement="right">
            <template #content>
              <div>可输入产品名称、卖点、活动信息...支持最多10个关键词、每个关键词最多10个字</div>
            </template>
            <div class="c_title">
              关键词
              <img
                style="width: 16px; height: 16px; margin-left: 8px; vertical-align: -3px"
                src="@/assets/images/operate/tip_line.png"
              />
            </div>
          </el-tooltip>
          <div class="keyword_warp">
            <el-select
              v-model="$data.keyword"
              multiple
              filterable
              allow-create
              default-first-option
              :reserve-keyword="false"
              :multiple-limit="10"
              placeholder="请输入关键词，以回车键确认"
              popper-class="publish_video_form_topic_select"
              style="width: 100%"
              :class="{ select_err: keywordsTipsFn }"
              @change="onChangeKeywords($event)"
              @blur="onBlurKeywords($event)"
            />
          </div>
          <div class="keyword_tip_warp">
            <span class="tips">文案是根据录入内容AI自动生成的，使用时请注意内容的合规性</span>
            <div class="clear" @click="clearKeyword">清空录入</div>
          </div>
          <!-- 其他 -->
          <div class="type_title">其他</div>
          <div class="other_box">
            生成条数：
            <el-input-number
              v-model="$data.createNum"
              @change="checkInt"
              style="width: 100px; margin-left: 8px"
              :min="1"
              controls-position="right"
            />
            <div class="tone_select">
              <el-select
                v-model="$data.toneSelect"
                placeholder="请选择生成语气"
                popper-class="icon_select"
                style="width: 100%; margin-left: 24px"
              >
                <el-option
                  v-for="(item, index) in toneList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>
        <div class="but_warp">
          <el-button
            type="primary"
            class="submit_btn"
            @click="productSubmit"
            :loading="buttonLoading"
          >
            {{ pageInitLoading ? '加载中...' : buttonLoading ? '生成中...' : '开始生成' }}
          </el-button>
        </div>
        <!-- 生成时不能点击的warp -->
        <div class="loading_warp" @touchstart.stop v-if="buttonLoading"></div>
      </div>
      <div class="line_vertical line_color"></div>
      <div class="result" v-loading="pageInitLoading">
        <div class="r_title">
          <div class="c_title_warp">
            <span class="c_title">生成结果</span>
            <span class="cr_time" v-if="createResult.length > 0">
              {{ createResult[createResult.length - 1].gmtCreate }}
            </span>
          </div>
          <p class="r_title_r" v-if="createResult.length > 0">
            共
            <span class="num">{{ createResult.length }}</span>
            条
            <span class="save_tip" v-if="!buttonLoading && !pageInitLoading">
              已保存至模板文案库
              <!-- <el-icon class="save_icon"><i-star /></el-icon> -->
            </span>
          </p>
        </div>
        <div class="create_result">
          <transition-group name="more" :css="false" @before-enter="beforeEnter" @enter="enter">
            <template v-for="(item, index) in createResult" :key="index">
              <div class="create_item" :data-key="index">
                <div class="cr_title" v-if="item.title">
                  <div class="label">
                    {{ item.creationType == '1' ? '笔记标题：' : '标题：' }}
                  </div>
                  <div class="c_content">{{ item.title }}</div>
                </div>

                <div class="c_desc" v-if="item.description">
                  <div class="label">正文描述：</div>
                  <div class="c_content">{{ item.description }}</div>
                </div>
              </div>
            </template>
          </transition-group>
        </div>
        <div class="em_warp" v-if="createResult.length == 0">
          <template v-if="!buttonLoading && !pageInitLoading">
            <img
              :src="
                createResultStatus
                  ? 'https://tagvv-1256030678.file.myqcloud.com/20231127bx2c1.png'
                  : 'https://tagvv-1256030678.file.myqcloud.com/20231026emgo3.png'
              "
              alt=""
              :class="{ em_img: true, em_img_err: createResultStatus }"
            />
            <p class="text">{{ createResultStatus ? '生成失败，请重试' : '暂无数据' }}</p>
          </template>
          <template v-if="buttonLoading && !pageInitLoading">
            <img src="/public/loading_2.gif" alt="" class="em_img em_loading" />
            <p class="text text_loading">AI正在生成，请耐心等待</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { useRouter } from 'vue-router'
// ElMessageBox
import { ElMessage } from 'element-plus'

import {
  // hotWord,
  generate,
  getGenerateResult,
  getGenerateParam,
  deleteGenerateResult
} from '@/api/sumvideo/creative_ai_title.js'
// import { getProductUseInfo } from '@/api/system_setting/brand_info.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  creativeId: {
    type: String || Number,
    default: null
  }
})
const { creativeId } = toRefs(props, 'creativeId')
// const router = useRouter()
const buttonLoading = ref(false) // 是不是在生成中 true 是 false 不是
// const aiCreationTicketRemainNum = ref(0) // 剩余的生产券数量
const pageInitLoading = ref(true)
// const createTypeList = reactive([
//   {
//     id: 1,
//     type: 'xhs',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/20231025s1pc9.png',
//     title: '小红书爆款文案',
//     titleTips: '小红书笔记emoji风格文案'
//   },
//   {
//     id: 2,
//     type: 'dy',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/20231025xlti5.png',
//     title: '抖音标题',
//     titleTips: '抖音营销短视频风格文案'
//   }
// ])
const keywordsTips = ref(false) // 关键词未填写时红框
// const keywordsList = ref([]) // 推荐关键词列表
// 表单数据
const $data = reactive({
  keyword: [], // 关键词
  platformSelect: 0, // 当前选中的适应平台，选中的是id，入参时候要入value【后端设计平台(1:dy,2:wx,3:xhs...)跟这里的生成类型(1:xhs,2:dy,3:ks,4:wx,0:ty)对应不上导致】
  textTypeChecked: {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  }, // 当前选中的文案类型
  createNum: 1, // 生成条数
  toneSelect: 1 // 当前选中的语气，选中的即是value
})
const selectOpen = ref(false) // 是否选择平台
const createResult = ref([]) // 生成结果
const createResultStatus = ref(false) // 是否生成失败
// 用于生成中回显
const backData = reactive({
  keyword: [], // 关键词
  platformSelect: 0, // 当前选中的适应平台，选中的是id，入参时候要入value【后端设计平台(1:dy,2:wx,3:xhs...)跟这里的生成类型(1:xhs,2:dy,3:ks,4:wx,0:ty)对应不上导致】
  textTypeChecked: {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  }, // 当前选中的文案类型
  createNum: 1, // 生成条数
  toneSelect: 1 // 当前选中的语气，选中的即是value
})
const createResultTicket = ref('') // 当前生成票据，有了它就去轮询结果，当页面刷新进入页面时，也要通过它和生成状态来获取页面行为
const objPlatform = {
  0: '通用',
  3: '小红书',
  1: '抖音',
  4: '快手',
  2: '视频号'
}

const selectOptions = ref([
  {
    id: 0,
    label: '通用',
    pinY: 'ty',
    value: 0
  },
  {
    id: 3,
    label: '小红书',
    pinY: 'xhs',
    value: 1
  },
  {
    id: 1,
    label: '抖音',
    pinY: 'dy',
    value: 2
  },
  {
    id: 4,
    label: '快手',
    pinY: 'ks',
    value: 3
  },
  {
    id: 2,
    label: '视频号',
    pinY: 'wx',
    value: 4
  }
])
const textTypeList = [
  {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  },
  {
    text: '种草文案',
    value: 2,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240229e1haq.png'
  },
  {
    text: '测评文案',
    value: 3,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402295rmfg.png'
  },
  {
    text: '教程文案',
    value: 4,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240229be84b.png'
  }
]
const toneList = [
  {
    label: '友好',
    value: 1
  },
  {
    label: '专业',
    value: 2
  },
  {
    label: '接地气',
    value: 3
  },
  {
    label: '活泼',
    value: 4
  },
  {
    label: '文艺',
    value: 5
  }
]
// 选择文案类型
function choseTextType(item) {
  if ($data.textTypeChecked.value === item.value) return
  $data.textTypeChecked = item
}
function handleVisibleChange(visible) {
  selectOpen.value = visible
}

const getPlatformZn = computed(() => {
  return objPlatform[$data.platformSelect]
})
// 初始化页面
function initPage() {
  $data.platformSelect = 0
  $data.textTypeChecked = {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  }
  $data.keyword = []
  $data.createNum = 1
  $data.toneSelect = 1
  pageInitLoading.value = true
  nextTick(() => {
    createResult.value = [] // 清空生成结果
    pageInitLoading.value = false
  })
}
// 删除上一次生成结果
function clearLast() {
  const params = {
    creativeId: creativeId.value,
    orderSetting: '',
    searchCount: true,
    pageNo: 1,
    pageSize: 10
  }
  deleteGenerateResult(params).then(res => {
    if (res.code === 0) {
      ElMessage.success('操作成功！')
    }
  })
}
// 清空录入
function clearKeyword() {
  initPage()
  clearLast()
}

// 获取剩余生成券
// function getProductUseInfoFn() {
//   getProductUseInfo().then(res => {
//     if (res.code === 0) {
//       aiCreationTicketRemainNum.value = res.data.aiCreationTicketRemainNum || 0
//     }
//   })
// }
// 获取上次生成参数
function getGenerateParamFn() {
  return new Promise((resolve, reject) => {
    getGenerateParam({
      creativeId: creativeId.value,
      orderSetting: '',
      searchCount: true,
      pageNo: 1,
      pageSize: 10
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          createResultTicket.value = res.data.bizId
          const platformSelect = selectOptions.value.find(x => x.value === res?.data?.creationType)
          const textTypeChecked = textTypeList.find(x => x.value === res?.data?.titleDescType)
          backData.createNum = res.data.generateCount
          backData.keyword = res.data.keyWords.split('、')
          backData.platformSelect = platformSelect?.id || 0
          backData.textTypeChecked = textTypeChecked || {
            text: '爆款标题',
            value: 1,
            icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
          }
          backData.toneSelect = res.data.generateTone || 1
        }
        resolve()
      })
      .catch(() => {
        resolve()
      })
  })
}

let pollingTimer = null
// 轮询
const openPolling = () => {
  pollingTimer && closePolling()
  pollingTimer = setInterval(() => {
    getGenerateResult({
      bizId: createResultTicket.value
    })
      .then(res => {
        // res.data 1生成中，2生成成功，3生成失败
        if (res.code === 0) {
          if (res.data !== '1') {
            closePolling(true)
            if (res.data === '2' && res.msg) {
              createResultStatus.value = false
              createResult.value = JSON.parse(res.msg || '{}')
            } else {
              createResultStatus.value = true
            }
          }
          pageInitLoading.value = false
        } else {
          pageInitLoading.value = false
          closePolling(true)
        }
      })
      .catch(() => {
        pageInitLoading.value = false
        closePolling(true)
      })
  }, 2000)
}
const closePolling = (success = false) => {
  clearInterval(pollingTimer)
  pollingTimer = null
  if (success) {
    buttonLoading.value = false
  }
}

// 获取生成结果
function getResult() {
  const creationType = selectOptions.value.find(x => x.id === $data.platformSelect)
  const params = {
    creativeId: creativeId.value,
    creationType: creationType?.value,
    generateCount: $data.createNum,
    generateTone: $data.toneSelect || 1,
    titleDescType: $data.textTypeChecked.value,
    keyWords: $data.keyword.join('、')
  }

  generate(params)
    .then(res => {
      if (res.code === 0) {
        createResultTicket.value = res.data
        openPolling()
      }
    })
    .catch(() => {
      createResult.value = []
      createResultStatus.value = true
      buttonLoading.value = false
    })
    .finally(() => {
      // getProductUseInfoFn()
    })
}
const beforeEnter = el => {
  nextTick(() => {
    el.style.opacity = 0
  })
}
// 进入动画
const enter = (el, done) => {
  // const delay = Math.abs(el.dataset.key - (createResult.value.length - 1)) * 300 // 数组数据从后向前显示
  nextTick(() => {
    const delay = el.dataset.key * 300
    setTimeout(() => {
      el.style.transition = 'opacity 1s '
      el.style.opacity = 1
      el.style.animation = 'right-to-left 1s infinite' // 动画
      el.style['animation-iteration-count'] = 1
      done()
    }, delay)
  })
}
function startTip() {
  // ElMessageBox.confirm(`本次任务预计消耗${$data.createNum}张AI文案创作券，确认后开始生成`, {
  //   confirmButtonText: '确认',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // })
  //   .then(() => {
  ElMessage.success('请在右侧生成结果处查看进度')
  buttonLoading.value = true
  createResult.value = []
  getResult()
  // })
  // .catch(() => {
  //   console.log('取消')
  // })
}
// 开始生成
const productSubmit = throttle(() => {
  if ($data.keyword.length === 0) {
    keywordsTips.value = true
    return ElMessage.warning('关键词不能为空！')
  }
  // if ($data.createNum > aiCreationTicketRemainNum.value) {
  //   return ElMessage.warning('AI文案创作券余额不足，请先充值！')
  // }
  startTip()
}, 500)
const keywordsTipsFn = computed(() => {
  return keywordsTips.value && $data.keyword.length === 0
})
// 输入框转为正整数
function checkInt(value) {
  nextTick(() => {
    $data.createNum = parseInt(value)
  })
}

// 关键词内容改变
const onChangeKeywords = value => {
  keywordsTips.value = false
  value.forEach((x, i) => {
    const text = typeof x === 'string' ? x.replace(/\s+/g, '') : ''
    if (text.length > 10) {
      ElMessage.warning('关键词不能超过10个字')
      $data.keyword.splice(i, 1)
    } else if (!text.length) {
      $data.keyword.splice(i, 1)
    } else {
      $data.keyword[i] = text
    }
  })
}
// 失焦添加关键词
const onBlurKeywords = e => {
  keywordsTips.value = false
  const value = e.target.value.replace(/\s+/g, '')
  if (value && $data.keyword.length < 10 && value.length < 11) {
    $data.keyword.push(value)
  } else {
    if (value) {
      if ($data.keyword.length >= 10) {
        ElMessage.warning('最多添加10个话题')
      } else if (value.length > 10) {
        ElMessage.warning('单个话题不超过10字')
      }
    }
  }
}
// 去充值
// function toReach() {
//   router.push({
//     path: '/system_manage/voucher_center',
//     query: { tab: 'ai_creation_ticket' }
//   })
// }

onMounted(async () => {
  await getGenerateParamFn()

  if (createResultTicket.value) {
    buttonLoading.value = true
    openPolling()
    nextTick(() => {
      $data.createNum = backData.createNum
      $data.keyword = backData.keyword
      $data.platformSelect = backData.platformSelect
      $data.textTypeChecked = backData.textTypeChecked
      $data.toneSelect = backData.toneSelect
    })
  } else {
    pageInitLoading.value = false
  }
  // getHotWord()
  // getProductUseInfoFn()
})

onBeforeUnmount(() => {
  closePolling()
})
</script>

<style lang="scss" scoped>
.select_err {
  :deep(.el-input__inner) {
    border-color: red !important;
  }
}

@keyframes right-to-left {
  from {
    padding-left: 100%;
  }
  to {
    padding-left: 0%;
  }
}
.list-item {
  margin: 10px 0;
}
.create_page {
  height: calc(100% - 82px);
  background: #f7f8fa;

  .tips_warp {
    padding: 1px 24px 16px 24px;
    background: #fff;
    border-radius: 0 0 4px 4px;

    .top_tips {
      padding: 12px 16px;
      background: #f7f8fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .tips_l {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
    }
  }
  .line {
    width: 100%;
    height: 16px;
  }
  .line_color {
    background: #f7f8fa;
  }
  .content_warp {
    display: flex;
    height: calc(100% - 132px);
    background: #f7f8fa;

    .condition {
      box-sizing: border-box;
      width: 628px;
      height: 100%;
      position: relative;
      border-radius: 4px;
      background: #fff;
      .loading_warp {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 188;
      }
      .c_title {
        font-weight: 500;
        color: #303133;
        line-height: 22px;
        width: max-content;
        font-size: 16px;
        margin-top: 20px;
      }
      .keyword_warp {
        margin-top: 16px;
        width: 100%;
        min-height: 124px;
        border-radius: 4px;
        border: 1px solid #dcdee0;
        :deep(.el-input__inner) {
          border: none;
        }
        :deep(.el-input__suffix) {
          display: none;
        }
      }
      .keyword_tip_warp {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        .tips {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #909399;
          line-height: 20px;
        }
        .clear {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          line-height: 20px;
          cursor: pointer;
        }
      }
      .type_title {
        margin-top: 20px;
        font-weight: 500;
        color: #303133;
        line-height: 22px;
        font-size: 16px;
      }
      .type_warp {
        display: flex;
        margin-top: 16px;
        .chose_item {
          width: 280px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 4px;
          border: 1px solid;
          border-color: #fff;
          background: #f7f8fa;
          cursor: pointer;
          margin-right: 20px;
          &:last-child {
            margin-right: unset;
          }
          .item_l {
            display: flex;
            .icon {
              width: 40px;
              min-width: 40px;
              height: 40px;
            }
            .content {
              margin-left: 12px;
              .title {
                font-size: 14px;
                color: #303133;
                line-height: 20px;
              }
              .title_tips {
                font-size: 12px;
                color: #909399;
                line-height: 18px;
                margin-top: 4px;
              }
            }
          }
          .check_box {
            width: 16px;
            height: 16px;
            background: #ffffff;
            border-radius: 2px;
            border: 1px solid #dcdee0;
            box-sizing: border-box;
          }
        }
        .check_active_item {
          border-color: #364fcd;
          .check_box {
            border-color: #364fcd;
            background: #364fcd;
            position: relative;
            &::after {
              box-sizing: content-box;
              content: '';
              border: 1px solid #fff;
              border-left: 0;
              border-top: 0;
              height: 8px;
              left: 4.57px;
              position: absolute;
              top: 1.14px;
              transform: rotate(45deg) scaleY(0);
              width: 3.4px;
              transition: transform 0.15s ease-in 50ms;
              transform-origin: center;
              transform: rotate(45deg) scaleY(1);
            }
          }
        }
      }
      .create_num {
        font-size: 16px;
        color: #303133;
        line-height: 20px;
        margin-top: 20px;
        z-index: 99;
        :deep(.el-input-number__increase) {
          top: 2px;
        }
        :deep(.el-input-number__decrease) {
          bottom: 2px;
        }
      }
      .create_num_tips {
        font-size: 14px;
        color: #909399;
        line-height: 20px;
        margin-top: 16px;
      }
      .but_warp {
        height: 80px;
        background: #ffffff;
        box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99;
        .submit_btn {
          width: 360px;
          height: 40px;
          border-radius: 4px;
        }
        :deep(.el-button) {
          > span {
            margin-top: 4px;
          }
        }
      }
      // 其他
      .other_box {
        font-size: 16px;
        color: #303133;
        line-height: 20px;
        margin-top: 16px;
        display: flex;
        align-items: center;
        :deep(.el-input-number__increase) {
          top: 2px;
        }
        :deep(.el-input-number__decrease) {
          bottom: 2px;
        }
      }

      // 适应平台
      .adapt_platform {
        position: relative;
        margin-top: 16px;
        :deep(.el-input) {
          opacity: 0;
        }
        .select_show {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          box-sizing: border-box;
          border: 1px solid #dcdee0;
          padding-left: 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 4px;
          overflow: hidden;
          color: #606266;
          .getPlatform_Zn {
            display: flex;
            align-items: center;
          }
        }
        .select_show_active {
          border-color: #364fcd;
        }
        .indicate {
          padding: 0 9px;
          transition: all 0.3s;
          color: #c0c4cc;
        }
        .indicate_180 {
          transform: rotate(-180deg);
        }
        .select_content {
          font-size: 14px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          color: #303133;
          .platform_item {
            display: flex;
            align-items: center;
          }
        }
      }
      // 文案类型
      .text_type {
        display: flex;
        margin-top: 16px;
        .text_type_item {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          .text_item_icon {
            width: 16px;
            height: 16px;
            min-width: 16px;
            margin-right: 4px;
          }
        }
        .text_type_item + .text_type_item {
          margin-left: 16px;
        }
        .text_type_item_active {
          background: rgba(244, 66, 10, 0.1);
        }
      }
    }
    .condition_scroll {
      height: calc(100% - 80px);
      box-sizing: border-box;
      padding: 22px 24px;
      overflow-y: auto;
    }
    .line_vertical {
      width: 16px;
      height: 100%;
    }
    .result {
      box-sizing: border-box;
      flex: 1;
      height: 100%;
      position: relative;
      border-radius: 4px;
      background: #fff;
      .r_title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 22px 24px 16px 24px;
        border-radius: 4px 4px 0 0;
        .c_title_warp {
          .c_title {
            font-weight: 500;
            color: #303133;
            line-height: 22px;
            width: max-content;
            font-size: 16px;
          }
          .cr_time {
            font-family: PingFangSC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: #909399;
            line-height: 20px;
            margin-left: 12px;
          }
        }
        .r_title_r {
          font-weight: 400;
          .num {
            color: #364fcd;
          }
          .save_tip {
            margin-left: 20px;
            color: #30bd1d;
          }
        }
      }
      .create_result {
        overflow-y: scroll;
        height: calc(100% - 72px);
        box-sizing: border-box;
        padding: 0 17px 0 24px;
        .create_item {
          margin-top: 12px;
          padding: 12px 16px;
          background: #f7f8fa;
          border-radius: 4px;
          overflow: hidden;
          word-break: break-all;
          font-weight: 400;

          &:first-child {
            margin-top: unset;
          }
          .label {
            // width: 70px;
            // min-width: 70px;
            width: max-content;
            white-space: nowrap;
            color: #303133;
            line-height: 20px;
            font-size: 14px;
            display: inline-block;
          }
          .c_content {
            display: inline-block;
            word-break: break-all;
          }
          .c_desc,
          .cr_title {
            color: #303133;
            line-height: 20px;
            font-size: 14px;
            display: flex;
          }
          .c_desc {
            margin-top: 4px;
          }
        }
      }
    }
  }
}
.em_warp {
  position: absolute;
  top: 52px;
  left: 0;
  width: 100%;
  height: calc(100% - 52px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .em_img {
    width: 70px;
    height: 70px;
  }
  .em_img_err {
    width: 44px;
    height: 44px;
  }
  .em_loading {
    width: 36px;
    height: 36px;
    opacity: 0.6;
  }
  .text {
    margin-top: 8px;
    color: #8f939a;
    line-height: 20px;
    font-size: 14px;
  }
  .text_loading {
    font-size: 12px;
  }
}
</style>
