<template>
  <div class="page kos_page" v-loading="pageLoading">
    <div class="page_container">
      <div class="container_info">
        <div class="one_info">成员：{{ isNotEmpty(list) ? list[0].submitUsername : '--' }}</div>
        <div class="one_info">关联任务：{{ isNotEmpty(list) ? list[0].taskName : '--' }}</div>
      </div>
      <div class="container_record">
        <div class="one_record" v-for="(info, index) in list" :key="index">
          <div class="record_top">
            <!-- 审核时间 -->
            <div class="top_time" v-if="info.auditTime">{{ info.auditTime }}</div>
            <!-- 审核人 -->
            <div class="top_name" v-if="info.auditUsername">{{ info.auditUsername }}</div>
            <!--  审核通过 -->
            <div class="top_pass" v-if="info.auditResult == 2">审核通过</div>
            <!-- 审核已过期 -->
            <div class="top_noPass" v-else-if="info.auditResult == 4">审核已过期</div>
            <!--  审核不通过 -->
            <div class="top_noPass" v-else-if="info.auditResult == 3">
              审核不通过
              <el-tooltip
                v-if="info.auditOpinion"
                popper-class="tooltip-class"
                placement="right-start"
              >
                <template #content>
                  <div style="max-width: 400px; max-height: 400px; overflow-y: auto">
                    <p v-for="(a, b) in JSON.parse(info.auditOpinion)" :key="b">
                      {{ b + 1 }}、{{ a.reason }}
                    </p>
                  </div>
                </template>
                <img src="https://tagvv-1256030678.file.myqcloud.com/20250514w3clv.png" />
              </el-tooltip>
            </div>

            <!-- 得分 -->
            <div class="top_score">
              智能风险得分

              <span :class="[`${getScoreColor(info.pictureScore)}_color`]">
                {{ isNotEmpty(info.score) ? info.score : '-' }}分
              </span>
              <span :class="[`${getScoreColor(info.pictureScore)}_color`]" style="font-weight: 400">
                {{ isNotEmpty(info.score) ? '' : '(风险检测失败)' }}
              </span>
            </div>
          </div>
          <div class="record_bottom">
            <!-- 上传的视频/图文封面 -->
            <div class="bottom_left" @click.stop="previewFun(info)">
              <!-- 视频 -->
              <img v-if="info.auditType == 1" :src="info.auditData?.videoCoverUrl" />
              <!-- 图文 -->
              <img
                v-if="info.auditType == 6 && isNotEmpty(info.auditData?.pictures)"
                :src="info.auditData.pictures[0].url"
              />
            </div>
            <!-- 审核的具体信息 -->
            <div class="bottom_right">
              <div class="right_img" v-if="isNotEmpty(info.pictureResults)">
                <!-- 图片信息 -->
                <div class="right_img_box">
                  <div
                    :class="['one_img', `${riskLevelMap[a.score].color}_img`]"
                    v-for="(a, b) in getImgList(info.pictureResults)"
                    :key="b"
                  >
                    <el-tooltip popper-class="tooltip-class" placement="top">
                      <template #content>
                        <p style="max-width: 400px">{{ a.markDesc }}</p>
                      </template>
                      <img :src="a.pictureUrl" />
                    </el-tooltip>
                  </div>
                </div>
              </div>

              <!-- 标题文案 -->
              <div
                class="right_title"
                v-if="
                  (isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text) ||
                  (isNotEmpty(info.xhsTitleTextResult) &&
                    info.xhsTitleTextResult.text &&
                    info.xhsTitleTextResult.text != '\n' &&
                    info.platformList &&
                    info.platformList.includes('3'))
                "
              >
                <div class="right_title">标题文案</div>
                <div class="right_container">
                  <div
                    class="one_container"
                    v-if="isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text"
                  >
                    <!-- 如果是多平台文案，就显示平台标识 -->
                    <template v-if="info.platformList && info.platformList.length > 1">
                      <template v-for="(a, b) in info.platformList" :key="b">
                        <div
                          class="platform_icon"
                          v-if="a != 3"
                          :style="{
                            marginLeft: b === 0 ? '0' : '-15px',
                            zIndex: 3 - b
                          }"
                        >
                          <div :class="[`xm_platformIcon_${a}`]"></div>
                        </div>
                      </template>
                    </template>
                    <div
                      v-html="
                        textAnalysisFun(
                          1,
                          info.dyTitleTextResult.text,
                          info.dyTitleTextResult.results,
                          false,
                          true
                        )
                      "
                    ></div>
                  </div>
                  <div
                    class="one_container"
                    v-if="
                      isNotEmpty(info.xhsTitleTextResult) &&
                      info.xhsTitleTextResult.text &&
                      info.xhsTitleTextResult.text != '\n' &&
                      info.platformList &&
                      info.platformList.includes('3')
                    "
                  >
                    <!-- 如果是多平台文案，就显示平台标识 -->
                    <div
                      class="platform_icon"
                      :style="{
                        marginLeft:
                          isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text
                            ? info.dyOtherPlatfrom
                              ? info.dyOtherPlatfrom.length > 2
                                ? '18px'
                                : info.dyOtherPlatfrom.length > 1
                                ? '9px'
                                : '0'
                              : '0'
                            : '0'
                      }"
                      v-if="
                        info.platformList &&
                        info.platformList.length > 1 &&
                        info.platformList.includes('3')
                      "
                    >
                      <div :class="['xm_platformIcon_3']"></div>
                    </div>
                    <div
                      v-html="
                        textAnalysisFun(
                          1,
                          info.xhsTitleTextResult.text,
                          info.xhsTitleTextResult.results,
                          false,
                          true
                        )
                      "
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 口播文案 -->
              <div
                class="right_copywriting"
                v-if="isNotEmpty(info.videoTextResult) && info.videoTextResult.text"
              >
                <div class="right_title">口播文案</div>
                <div
                  :style="{
                    paddingLeft:
                      info.dyOtherPlatfrom &&
                      isNotEmpty(info.dyTitleTextResult) &&
                      info.dyTitleTextResult.text
                        ? info.dyOtherPlatfrom.length > 2
                          ? '40px'
                          : info.dyOtherPlatfrom.length > 1
                          ? '32px'
                          : info.platformList &&
                            info.platformList.length > 1 &&
                            info.platformList.includes('3') &&
                            info.platformList.includes('1')
                          ? '24px'
                          : '0'
                        : '0'
                  }"
                  class="right_container"
                  v-html="
                    textAnalysisFun(
                      2,
                      info.videoTextResult.text,
                      info.videoTextResult.results,
                      false,
                      true
                    )
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page_btn">
      <el-button type="primary" @click.stop="backFun">返回审核详情</el-button>
    </div>
    <!-- 预览视频 -->
    <previewVideo v-if="videoDialog.show" :videoDialog="videoDialog" />
    <!-- 预览图片 -->
    <previewImg v-if="imgDialog.show" :showText="false" :imgDialog="imgDialog" />
  </div>
</template>
<script setup>
import { ElTooltip } from 'element-plus'
import { listAuditDetailRecord } from '@/api/market/task_audit.js'
import { textAnalysisFun, riskLevelMap, getScoreColor } from './model/tool'
import previewImg from '@/components/new_preview_imgText/index.vue'
import previewVideo from '@/components/new_preview_video/index.vue'
import { useRouter, useRoute } from 'vue-router'
import { throttle, isNotEmpty } from '@/utils/tools'
const router = useRouter()
const route = useRoute()
const id = ref()
const deliverId = ref()
const list = ref([]) // 记录列表

// 预览 begin--
const videoDialog = ref({
  show: false,
  url: ''
})
const imgDialog = ref({
  show: false,
  info: null
})
const previewFun = throttle(item => {
  if (isNotEmpty(item.auditData)) {
    if (item.auditType === 1) {
      videoDialog.value = {
        show: true,
        url: item.auditData?.videoUrl
      }
    } else {
      imgDialog.value = {
        show: true,
        info: item.auditData
      }
    }
  } else {
    // messa
  }
}, 700)
// 预览 end--

// 返回审核详情
const backFun = throttle(() => {
  router.go(-1)
})
// 获取图片列表
function getImgList(list) {
  const newList = []
  list.forEach(item => {
    if (isNotEmpty(item.pictures)) {
      item.pictures.forEach(x => {
        newList.push({
          ...x,
          markDesc: x.questionAndOpinion
            ? riskLevelMap[x.score].label + '：' + x.questionAndOpinion
            : riskLevelMap[x.score].label + '：' + x.question + x.opinion // 问题说明
        })
      })
    }
  })
  return newList
}
const pageLoading = ref(true)
function getDetailFun() {
  pageLoading.value = true
  listAuditDetailRecord({
    auditId: id.value,
    deliverId: deliverId.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data || []
        data.forEach(item => {
          // 判断是否有多个平台
          let platformList = []
          if (item.auditData.dyTitleTextPlatform) {
            item.dyOtherPlatfrom = item.auditData.dyTitleTextPlatform.split(',')
            platformList = platformList.concat(item.auditData.dyTitleTextPlatform.split(','))
          }
          if (item.auditData.xhsTitleTextPlatform) {
            platformList = platformList.concat(item.auditData.xhsTitleTextPlatform.split(','))
          }
          item.platformList = platformList
        })
        list.value = data
        nextTick(() => {
          // 给标题设置提示语
          const highlightedElements = document.querySelectorAll('.score_score')
          highlightedElements.forEach(el => {
            const tooltipContent = el.dataset.tipcontent

            el.addEventListener('mouseenter', event => {
              console.log('xxxxx', el, event.clientX, event.clientY)
              const tooltip = document.createElement('div')
              tooltip.classList.add('tooltip')
              tooltip.textContent = tooltipContent
              document.body.appendChild(tooltip)
              // 创建 Range 对象
              const range = document.createRange()
              // 选择第一个字符
              range.setStart(el.firstChild, 0)
              range.setEnd(el.firstChild, 1)
              console.log('第一个字符', range)
              // 获取第一个字符的位置信息
              const rect = range.getBoundingClientRect()
              // 获取元素相对于视口的位置
              const containerRect = el.getBoundingClientRect()
              console.log('元素', rect, containerRect, tooltip, tooltip.offsetHeight)
              tooltip.style.position = 'absolute'
              // if (rect.left < window.innerWidth - 100) {
              tooltip.style.left = `${rect.left - 40}px`
              // } else {
              //   tooltip.style.left = `${
              //     window.innerWidth - 80 - (tooltip.offsetWidth + rect.left - window.innerWidth)
              //   }px`
              // }
              tooltip.style.top = `${containerRect.top - tooltip.offsetHeight - 5}px`
            })
            el.addEventListener('mouseleave', () => {
              console.log('离开')
              setTimeout(() => {
                console.log('离开1', document.querySelector('.tooltip'))
                document.querySelector('.tooltip')?.remove()
              }, 100)
            })
          })
        })
      }
      pageLoading.value = false
    })
    .catch(() => {
      pageLoading.value = false
    })
}
onMounted(() => {
  id.value = route.query.id
  deliverId.value = route.query.deliverId
  getDetailFun()
})
</script>
<style lang="scss" scoped>
.red_color {
  color: #d40000;
}
.orange_color {
  color: #ed6a0c;
}
.green_color {
  color: #2da641;
}
.top_pass {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  text-align: left;
  font-style: normal;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #2da641;
  background: rgba(45, 166, 65, 0.1);
}
.top_noPass {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d40000;
  background: rgba(212, 0, 0, 0.1);
  img {
    margin-left: 4px;
    width: 16px;
    height: 16px;
    display: flex;
  }
}
.page {
  width: 100%;
  height: 100%;
}
.page_container {
  width: 100%;
  height: calc(100% - 40px);
  background: #ffffff;
  border-radius: 4px;
  .container_info {
    padding-left: 24px;
    width: 100%;
    height: 54px;
    border-bottom: 1px solid #dcdee0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_info {
      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
    }
    .one_info + .one_info {
      margin-left: 96px;
    }
  }

  .container_record {
    width: 100%;
    height: calc(100% - 55px);
    overflow-y: auto;
    padding: 0 24px;
    .one_record {
      border-bottom: 1px solid #dcdee0;
      .record_top {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 54px;
        div + div {
          margin-left: 12px;
        }
        .top_time {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
        }
        .top_name {
          font-weight: 400;
          font-size: 14px;
          color: #909399;
          line-height: 20px;
        }
        .top_score {
          font-weight: 400;
          font-size: 14px;
          color: #909399;
          line-height: 20px;
          span {
            font-weight: 600;
          }
        }
      }
      .record_bottom {
        padding-bottom: 16px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .bottom_left {
          margin-right: 24px;
          img {
            cursor: pointer;
            width: 126px;
            height: 224px;
            border-radius: 4px;
            display: flex;
            object-fit: cover;
          }
        }
        .bottom_right {
          width: calc(100% - 150px);

          .right_img {
            width: 100%;
            overflow-x: auto;
          }
          .right_img_box {
            width: max-content;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .red_img {
              border: 2px solid #d40000;
            }
            .orange_img {
              border: 2px solid #ed6a0c;
            }
            .green_img {
              border: 2px solid #2da641;
            }
            .one_img {
              width: 60px;
              height: 80px;
              border-radius: 2px;

              img {
                border-radius: 2px;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: flex;
              }
            }
            .one_img + .one_img {
              margin-left: 12px;
            }
          }
          .right_img + .right_title {
            margin-top: 16px;
          }
          .right_img + .right_copywriting {
            margin-top: 16px;
          }
          .right_title + .right_copywriting {
            margin-top: 12px;
          }
          .right_title {
            font-weight: 600;
            font-size: 16px;
            color: #303133;
            line-height: 22px;
          }
          .right_container {
            font-weight: 400;
            font-size: 14px;
            color: #606266;
            line-height: 24px;
            .one_container {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: flex-start;
              white-space: pre-wrap;
              .platform_icon {
                flex-shrink: 0;
                margin-top: 2px;
                margin-right: 4px;
                width: 20px;
                height: 20px;
                position: relative;
              }
            }
          }
        }
      }
    }
  }
}
.page_btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 56px;
  background: #ffffff;
  box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
