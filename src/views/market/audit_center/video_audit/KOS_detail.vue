<template>
  <div class="page kos_page" v-loading="pageLoading">
    <div class="page_top" :style="info.auditResult == 1 ? '' : 'height:100%'">
      <div class="page_left">
        <!-- 视频 -->
        <div class="left_video" v-if="!pageLoading && isVideo">
          <video
            class="video_dom"
            ref="videoRef"
            :poster="videoCover"
            :src="videoUrl"
            controls="controls"
            preload="load"
            @canplay="loadSuccess"
            @timeupdate="timeupdate"
            @ended="onEnded"
          />
        </div>
        <!-- 图片 -->
        <div class="left_img" v-if="!pageLoading && !isVideo">
          <div class="img_dom">
            <el-image
              class="one_img"
              :src="imgUrlList[imgIndex]"
              fit="cover"
              :preview-src-list="imgUrlList"
              :initial-index="imgIndex"
            >
              <template #placeholder>
                <div class="image_placeholder_loading">
                  <div class="image_placeholder_icon"></div>
                </div>
              </template>
            </el-image>
          </div>
          <div class="img_nums">
            <!-- 上一张 -->
            <div
              :class="{ pre_img: true, active_img: imgIndex > 0, dis_img: imgIndex == 0 }"
              @click="changeImg(2)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250513a3tjo.png" />
            </div>
            <!-- 总数 -->
            <div class="img_num">{{ imgIndex + 1 }}/{{ imgUrlList.length }}</div>
            <!-- 下一张 -->
            <div
              :class="{
                next_img: true,
                active_img: imgIndex < imgUrlList.length - 1,
                dis_img: imgIndex == imgUrlList.length - 1
              }"
              @click="changeImg(1)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250513zdu8v.png" />
            </div>
          </div>
        </div>
        <!-- 添加意见 -->
        <el-button
          v-if="info.auditResult == 1"
          class="add_suggestion_btn"
          type="primary"
          @click.stop="addSuggestionFun"
        >
          添加意见
        </el-button>
        <!-- 成员信息 -->
        <div class="left_text">成员：{{ info.submitUsername || '' }}</div>
        <!-- 关联任务 -->
        <div class="left_text">关联任务：{{ info.taskName || '' }}</div>
      </div>
      <div class="page_right" v-if="isNotEmpty(info)">
        <!-- 智能风险得分 -->
        <div class="right_top">
          <div class="copywriting_top">
            <div class="top_left">
              <div class="left_title">智能风险得分</div>
              <!-- 如果风险测试失败，就显示-分并且不要下划线_score_line -->
              <div
                :class="[
                  'left_score',
                  `${getScoreColor(info.score)}_score`,
                  `${isNotEmpty(info.score) ? getScoreColor(info.score) : ''}_score_line`
                ]"
              >
                {{ isNotEmpty(info.score) ? info.score : '-' }}分
              </div>
            </div>
            <!-- 非第一次审核的要显示审核记录 -->
            <div class="top_right" v-if="!info.first" @click.stop="toRecordFun">
              审核记录
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250513hfr8z.png" alt="" />
            </div>
          </div>
        </div>
        <!-- 文案智能风险检测得分 -->
        <div class="right_copywriting">
          <!-- 得分+记录入口 -->
          <div class="copywriting_top">
            <div class="top_left">
              <div class="left_title">文案智能风险得分</div>
              <!-- 如果风险测试失败，就显示-分并且不要下划线_score_line -->
              <div
                :class="[
                  'left_score',
                  `${getScoreColor(info.textScore)}_score`,
                  `${isNotEmpty(info.textScore) ? getScoreColor(info.textScore) : ''}_score_line`
                ]"
              >
                {{ isNotEmpty(info.textScore) ? info.textScore : '-' }}分
              </div>
              <div
                v-if="!info.auditData.textSucceed"
                :class="['score_tip', 'left_score', 'red_score']"
              >
                (风险检测失败)
              </div>
              <div
                v-if="info.auditData.textSucceed && info.textScore == 100"
                :class="['score_tip', 'left_score', 'green_score']"
              >
                (未检测出风险)
              </div>
            </div>

            <div
              class="top_right"
              v-if="!(isEmpty(info.textScore) || info.textScore == 100)"
              @click.stop="checkTextRiskFun"
            >
              查看
            </div>
          </div>
          <div
            class="copywriting_bottom"
            v-if="
              (isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text) ||
              (isNotEmpty(info.xhsTitleTextResult) &&
                info.xhsTitleTextResult.text &&
                info.platformList &&
                info.platformList.includes('3')) ||
              (isNotEmpty(info.videoTextResult) && info.videoTextResult.text)
            "
          >
            <!-- 标题文案 -->
            <div
              class="copywriting_container"
              v-if="
                (isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text) ||
                (isNotEmpty(info.xhsTitleTextResult) &&
                  info.xhsTitleTextResult.text &&
                  info.platformList &&
                  info.platformList.includes('3'))
              "
            >
              <div class="container_top">
                <div class="top_left">标题文案</div>
              </div>

              <div class="container_content">
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
                        true
                      )
                    "
                  ></div>
                </div>
              </div>
            </div>
            <!-- 口播文案 只有视频才有 -->
            <div
              class="copywriting_container"
              v-if="isNotEmpty(info.videoTextResult) && info.videoTextResult.text"
            >
              <div class="container_top">
                <div class="top_left">口播文案</div>
              </div>
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
                class="container_content"
                v-html="
                  textAnalysisFun(2, info.videoTextResult.text, info.videoTextResult.results, true)
                "
              ></div>
            </div>
          </div>
        </div>
        <!-- 画面智能风险检测得分 -->
        <div class="right_frame">
          <div class="frame_top">
            <div class="top_title">画面智能风险得分</div>
            <!-- 如果风险测试失败，就显示-分并且不要下划线_score_line -->
            <div
              :class="[
                'top_score',
                `${getScoreColor(info.pictureScore)}_score`,
                `${
                  isNotEmpty(info.pictureScore) ? getScoreColor(info.pictureScore) : ''
                }_score_line`
              ]"
            >
              {{ isNotEmpty(info.pictureScore) ? info.pictureScore : '-' }}分
            </div>
            <div
              v-if="!info.auditData.pictureSucceed"
              :class="['score_tip', 'top_score', 'red_score']"
            >
              (风险检测失败)
            </div>
            <div
              v-if="info.auditData.pictureSucceed && info.pictureScore == 100"
              :class="['score_tip', 'top_score', 'green_score']"
            >
              (未检测出风险)
            </div>
          </div>
          <!-- 检测失败/未检测出风险不显示表格 -->
          <div
            class="frame_container"
            v-if="
              !(
                !info.auditData.pictureSucceed ||
                (info.auditData.pictureSucceed && info.pictureScore == 100)
              )
            "
          >
            <xm_table
              class="pic_table"
              :pageSizes="[5, 10, 20, 50]"
              :pageLayout="'total, prev, pager, next , jumper'"
              :data="tableForm.listData"
              v-model:page="tableForm.page"
              @getTableData="getList"
            >
              <el-table-column label="风险等级" width="100">
                <template #default="{ row }">
                  <div
                    :class="[`table_level`, `${riskLevelMap[row.score].color}_back_color`]"
                    v-if="riskLevelMap[row.score]"
                  >
                    {{ riskLevelMap[row.score].label || '' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="风险描述" min-width="150">
                <template #default="{ row }">
                  {{ row.question || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="风险画面" min-width="300">
                <template #default="{ row }">
                  <div class="table_img">
                    <template v-for="(item, index) in row.pictures" :key="index">
                      <img
                        v-if="index < 6"
                        :src="item.pictureUrl"
                        @click="checkImgRiskFun(row, index)"
                      />
                    </template>
                    <div class="table_img_num">（共{{ row.pictures?.length || 0 }}张）</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                width="180"
                align="right"
                header-align="right"
              >
                <template #default="{ row }">
                  <div class="table_btn">
                    <el-link
                      type="primary"
                      v-if="isNotEmpty(row.pictures)"
                      @click="checkImgRiskFun(row, 0)"
                    >
                      查看
                    </el-link>
                    <el-link
                      v-if="info.auditResult == 1"
                      type="primary"
                      :disabled="checkImgIsMark(row.pictures)"
                      style="margin-left: 16px"
                      @click="toMarkFun(row)"
                    >
                      标记为修改意见
                    </el-link>
                  </div>
                </template>
              </el-table-column>
            </xm_table>
          </div>
        </div>
        <!-- 审核 -->
        <div class="right_audit" v-if="info.auditResult">
          <!-- 审核已过期 -->
          <div class="audit_result" v-if="info.auditResult == 4">
            <div :class="['result_title']">审核已过期</div>
            <!-- <div class="result_time">任务已结束</div> -->
          </div>
          <!-- 审核通过 -->
          <div class="audit_result" v-else-if="info.auditResult == 2">
            <div :class="['result_title', 'green_color']">审核通过</div>
            <div class="result_time">{{ info.auditTime }} {{ info.auditorName }}</div>
          </div>
          <!-- 审核未通过 -->
          <div class="audit_result" v-else-if="info.auditResult == 3">
            <div :class="['result_title', 'red_color']">审核不通过</div>
            <div class="result_time">{{ info.auditTime }} {{ info.auditorName }}</div>
          </div>
          <!-- 审核中 -->
          <div class="audit_top" v-else-if="info.auditResult == 1">
            <div class="top_title">审核</div>
            <el-radio-group v-model="radioValue">
              <el-radio :label="1">审核通过</el-radio>
              <el-radio :label="2">审核不通过</el-radio>
            </el-radio-group>
          </div>
          <!-- 填写的审核不通过理由 -->
          <div class="audit_reason" v-if="radioValue == 2 && [1, 3].includes(info.auditResult)">
            <template v-for="(item, index) in reasonList" :key="index">
              <div
                :class="{
                  one_reason: true,
                  one_reason_err: item.reason && item.reason.length > 100
                }"
              >
                <div class="reason_left" :style="info.auditResult == 1 ? '' : 'width:100%'">
                  <div
                    v-if="item.score"
                    :class="['reason_type', `${riskLevelMap[item.score]?.color}_back_color`]"
                  >
                    {{ riskLevelMap[item.score]?.label || '' }}
                  </div>
                  <!-- 待审核下才支持添加修改意见 -->
                  <el-input
                    autosize
                    resize="none"
                    type="textarea"
                    :ref="reasonContentRef"
                    :disabled="info.auditResult != 1"
                    class="reason_input"
                    v-model.trim="item.reason"
                    placeholder="请填写修改意见"
                    maxlength="100"
                    @blur="retEmitEmj($event, index)"
                  />
                  <!-- 字数 -->
                  <div class="reason_inputNum" v-if="item.reason">
                    <span :style="item.reason?.length > 100 ? 'color:#f56c6c' : ''">
                      {{ item.reason?.length || 0 }}
                    </span>
                    /100
                  </div>
                </div>
                <!-- 待审核下才显示 -->
                <template v-if="info.auditResult == 1">
                  <el-link
                    class="reason_btn"
                    type="primary"
                    v-if="reasonList && reasonList.length < 30"
                    @click.stop="addReasonFun"
                  >
                    添加
                  </el-link>
                  <el-link
                    v-if="reasonList && reasonList.length > 1"
                    class="reason_btn"
                    type="primary"
                    @click.stop="delReasonFun(item, index)"
                  >
                    删除
                  </el-link>
                </template>
              </div>
              <div class="one_reason_tip" v-if="item.reason && item.reason.length > 100">
                请调整修改意见字数
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="page_btn" v-if="info.auditResult == 1">
      <el-button @click.stop="backFun">返回</el-button>
      <el-button type="primary" :loading="saveLoading" @click.stop="saveFun">确认</el-button>
    </div>
    <!-- 审核弹窗 -->
    <checkImgRiskModal
      :isVideo="isVideo"
      :status="info.auditResult"
      v-if="checkImgRiskDialog.show"
      :checkDialog="checkImgRiskDialog"
      :info="info"
      :reasonList="reasonList"
      :riskDetectionResultList="riskDetectionResultList"
      @markFun="markFun"
    />
    <!-- 查看风险弹窗 -->
    <checkTextRiskModal
      :status="info.auditResult"
      v-if="checkTextRiskDialog.show"
      :checkDialog="checkTextRiskDialog"
      :info="info"
      :reasonList="reasonList"
      :riskDetectionResultList="riskDetectionResultList"
      @markFun="markFun"
    />
  </div>
</template>
<script setup>
import { getKOSAuditDetail, doAudit, getNextAuditDetail } from '@/api/market/task_audit.js'
import checkImgRiskModal from './components/check_img_risk_modal.vue'
import checkTextRiskModal from './components/check_text_risk_modal.vue'
import { useRouter, useRoute } from 'vue-router'

import { throttle, isEmpty, isNotEmpty, secondToDate } from '@/utils/tools'
import { textAnalysisFun, riskLevelMap, getScoreColor } from './model/tool'
const message = inject('$message')
const router = useRouter()
const route = useRoute()
const isVideo = ref(true) // 是否是视频
const id = ref(null) // 记录ID

const info = ref({}) // 记录详情
const riskDetectionResultList = ref([]) // 文案智能风险检测结果列表 因为文案检测结果分太多个了，所以单独拿出来 图片反正就一个，那无论删除还是什么都在Info.pictureResults[x].pictures里修改标记
const radioValue = ref(2) // 默认审核不通过
const reasonList = ref([
  {
    type: null, // 类型 从哪里添加的 dyTitleText 抖音标题 xhsTitleText 小红书标题 videoText 口播文案 img 图片 left 代表是通过左侧添加意见过来 null 则是点击添加按钮
    id: null, // 如果是风险检测的那就会有专属的ID
    keyPoint: null, // 如果是视频，就会有专属的时间[单位是毫秒] 图片则是第N张图[从1开始] 标题，则就是对应的文案
    score: null, // 风险等级 如果是风险检测，就会有专属的风险等级
    reason: '' //  文本内容
  }
]) // 审核不通过的理由列表

// 左侧信息展示区 begin--
const pageLoading = ref(true)

const videoUrl = ref() // 视频地址
const videoCover = ref('') // 视频封面
const imgUrlList = ref([]) // 左侧图片列表
const imgIndex = ref(0) // 左侧图片滚动到第几张
const videoDuration = ref(null) // 视频时长
const videoRef = ref()

// 切换图片
const changeImg = throttle(e => {
  console.log('changeImg', imgIndex.value, e)
  if (e === 1) {
    // 下一张
    if (imgIndex.value < imgUrlList.value.length - 1) {
      imgIndex.value += 1
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
    }
  }
}, 300)

// 视频加载完成
function loadSuccess(e) {
  videoDuration.value = videoRef.value.duration
}

// 视频播放中
function timeupdate(e) {
  // currentTime.value = videoRef.value.currentTime
}

// 视频播放完毕
function onEnded(e) {
  console.log('onEnded', e)
}

// 添加意见
const addSuggestionFun = throttle(() => {
  if (isVideo.value) {
    videoRef.value.pause()
    const currentTime = parseInt(videoRef.value.currentTime * 1000)
    console.log('当前帧数', currentTime, reasonList.value)
    // 如果是视频，需要找到当前播放到第几帧
    // 检查这一帧是否已经添加到审核不通过的理由里
    // 是的话 不再添加 不是再添加
    const hasIndex = reasonList.value.findIndex(
      x =>
        x.type === 'left' &&
        isNotEmpty(x.keyPoint) &&
        parseInt(x.keyPoint / 1000) === parseInt(currentTime / 1000)
    )
    console.log('hasin', hasIndex, currentTime, videoRef.value.currentTime)
    if (hasIndex === -1) {
      markFun(
        'left',
        null,
        currentTime,
        null,
        `画面${secondToDate(currentTime / 1000, 's', false, false)}`,
        true
      )
    } else {
      message.warning('当前画面已添加过修改意见')
      console.log('已添加过', hasIndex)
    }
  } else {
    // 如果是图片,获取当前是第一张
    // 检查这张图片是否已经添加到审核不通过的理由里
    // 是的话不再添加 不是再添加
    // 如果是图片，直接添加就好
    const currentTime = imgIndex.value + 1
    const hasIndex = reasonList.value.findIndex(
      x =>
        x.type === 'left' &&
        isNotEmpty(x.keyPoint) &&
        parseInt(x.keyPoint) === parseInt(currentTime)
    )

    if (hasIndex === -1) {
      markFun('left', null, currentTime, null, `第${currentTime}张图片`, true)
    } else {
      message.warning('当前图片已添加过修改意见')
      console.log('已添加过', hasIndex)
    }
  }
  // 添加之后，光标需要定位到刚添加到审核不通过理由的位置
}, 500)

// 左侧信息展示区 end--

// 表格的查询条件
const tableForm = reactive({
  listData: [],
  page: {
    index: 1,
    size: 5,
    total: 0
  }
})
function getList() {
  console.log('分页', tableForm.page)
  tableForm.listData = info.value.pictureResults.slice(
    (tableForm.page.index - 1) * tableForm.page.size,
    tableForm.page.index * tableForm.page.size
  )
}

// 审核 begin--
const reasonRef = ref([])
const reasonContentRef = el => {
  if (el) reasonRef.value.push(el)
}
// 检查是否有表情包
function retEmitEmj(e, index) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  reasonList.value[index].reason = e.target.value.replace(reg, '')
}
// 添加新的不通过理由
const addReasonFun = throttle(() => {
  reasonRef.value = []
  reasonList.value.push({
    type: null, // 类型 从哪里添加的
    id: null, // 如果是风险检测的那就会有专属的ID
    keyPoint: null, // 如果是视频，就会有专属的时间 图片则是第N张图
    score: null, // 风险等级 如果是风险检测，就会有专属的风险等级
    reason: '' //  文本内容
  })
  nextTick(() => {
    console.log('xxxxxxx', reasonRef.value, reasonList.value.length - 1)
    reasonRef.value[reasonList.value.length - 1].focus()
  })
}, 500)
// 删除不通过理由
const delReasonFun = throttle((item, index) => {
  console.log('删除', item, item.id, index, riskDetectionResultList.value)
  // 如果删除的是携带ID，那要在info里找到数据，把isMark标位false
  if (item.id) {
    // 如果是text 那就从组合的风险结果里找，如果是Img 就在对应的图片里找
    if (['dyTitleText', 'xhsTitleText', 'videoText'].includes(item.type)) {
      riskDetectionResultList.value.forEach(x => {
        if (parseInt(x.id) === parseInt(item.id)) {
          x.isMark = false
          console.log('修改')
        }
      })
    } else if (item.type === 'img') {
      info.value.pictureResults.forEach(x => {
        if (x.pictures && x.pictures.length > 0) {
          x.pictures.forEach(y => {
            if (parseInt(y.id) === parseInt(item.id)) {
              y.isMark = false
              console.log('修改')
            }
          })
        }
      })
    }
  }
  if (reasonList.value.length > 1) {
    reasonList.value.splice(index, 1)
  } else {
    reasonList.value = [
      {
        type: null, // 类型 从哪里添加的 text文本 img 图片 left 代表是通过左侧添加意见过来
        id: null, // 如果是风险检测的那就会有专属的ID
        keyPoint: null, // 如果是视频，就会有专属的时间 图片则是第N张图
        score: null, // 风险等级 如果是风险检测，就会有专属的风险等级
        reason: '' //  文本内容
      }
    ]
  }
}, 500)
// 审核 end--
// 跳转审核记录
const toRecordFun = throttle(row => {
  console.log('跳转审核记录')
  sessionStorage.setItem('KOSToRecord', '1')
  router.push(
    `/content_market/audit_center/KOS_record?id=${id.value}&deliverId=${info.value.deliverId}`
  )
}, 500)

// 查看图片风险弹窗 begin--
const checkImgRiskDialog = ref({
  show: false // 是否显示弹窗
})
const checkImgRiskFun = throttle((row, index) => {
  checkImgRiskDialog.value = {
    show: true,
    index: index,
    imgList: row.pictures
  }
}, 500)
// 查看图片风险弹窗 end--

// 查看文本风险弹窗 begin--
const checkTextRiskDialog = ref({
  show: false // 是否显示弹窗
})
const checkTextRiskFun = throttle(() => {
  checkTextRiskDialog.value = {
    show: true
  }
}, 500)
// 查看文本风险弹窗 end--

// 标记为修改意见
// type 类型  dyTitleText 抖音标题 xhsTitleText 小红书标题 videoText 口播文案 img 图片 left 代表是通过左侧添加意见过来 null 则是点击添加按钮
// id 如果是风险检测的那就会有专属的ID
// keyPoint 如果是视频，就会有专属的时间[单位是毫秒] 图片则是第N张图[从1开始] 如果是文本，就是原文内容
// score 风险等级 如果是风险检测，就会有专属的风险等级
// reason 文本内容
// setFocus 设置焦点
function markFun(type, id, keyPoint, score, reason, setFocus) {
  if (reasonList.value && reasonList.value.length < 30) {
    reasonRef.value = []
    const params = { type, id: isNotEmpty(id) ? parseInt(id) : null, keyPoint, score, reason }
    const lastInfo = reasonList.value[reasonList.value.length - 1]
    console.log('lastInfo', lastInfo)
    // 如果最后一个是空的，那就是修改，否则是添加
    if (
      isEmpty(lastInfo.reason) &&
      (isEmpty(lastInfo.type) ||
        isEmpty(lastInfo.id) ||
        isEmpty(lastInfo.keyPoint) ||
        isEmpty(lastInfo.score))
    ) {
      reasonList.value[reasonList.value.length - 1] = params
    } else {
      reasonList.value.push(params)
    }
    radioValue.value = 2
    if (setFocus) {
      nextTick(() => {
        console.log('xxxxxxx', reasonRef.value, reasonList.value.length - 1)
        reasonRef.value[reasonList.value.length - 1].focus()
      })
    }
  } else {
    message.warning('最多支持添加30条修改意见')
  }
}
// 检测这批图片是否都已经标记为修改意见
function checkImgIsMark(imgList) {
  console.log('checkImgIsMark', imgList, reasonList.value)
  const hasMark = imgList.filter(x => x.isMark)

  console.log('标记个数', hasMark)
  return hasMark.length === imgList.length
}
// 风险画面 的标记为修改意见按钮 支持一键将对应的风险画面都添加进去
const toMarkFun = throttle(row => {
  console.log('标记为修改意见', row)
  let isOver = false
  if (reasonList.value && reasonList.value.length < 30) {
    // 将图片一次校验
    // 如果没有添加过的，就添加进去
    if (row.pictures && row.pictures.length > 0) {
      row.pictures.forEach(item => {
        if (!item.isMark) {
          if (reasonList.value && reasonList.value.length < 30) {
            markFun(
              'img',
              item.id,
              item.frame,
              item.score,
              isVideo.value
                ? `画面${secondToDate(item.frame / 1000, 's', false, false)}${item.markDesc || ''}`
                : `第${item.frame}张图片${item.markDesc || ''}`,
              false
            )
            item.isMark = true
          } else {
            if (!isOver) {
              message.warning('最多支持添加30条修改意见')
            }
            isOver = true
          }
        }
      })
    }
  } else {
    message.warning('最多支持添加30条修改意见')
  }
  // let imgIndex=
}, 500)

function getDetailFun() {
  pageLoading.value = true
  getKOSAuditDetail({
    auditId: id.value
  })
    .then(res => {
      if (res.code === 0 && isNotEmpty(res.data)) {
        const data = res.data || {}

        isVideo.value = data.auditType === 1
        if (data.auditType === 1) {
          videoCover.value = data.auditData.videoCoverUrl
          videoUrl.value = data.auditData.videoUrl
        } else {
          imgUrlList.value = (data.auditData.pictures || []).map(x => x.url)
          imgIndex.value = 0
        }

        // 给每个结果都加上是否标记字段 和 专属ID 方便后面区分
        let idNum = 1
        const list = []
        // 抖音标题审核结果
        if (isNotEmpty(data.dyTitleTextResult)) {
          // data.dyTitleTextResult.text =
          //   '雪花飘落的季节，UR带你解锁每件都是限量款冬日时尚新姿势！❄️谁每件都是限量款说保暖就不能时髦？法式设计遇上全球潮流，每件都是限量款。从大衣到内搭，让你雪地里走每件都是限量款出T台范儿～这个冬天，用穿搭讲述时尚态度！'
          if (data.dyTitleTextResult.results && data.dyTitleTextResult.results.length > 0) {
            data.dyTitleTextResult.results.forEach(item => {
              item.markType = 'dyTitleText'
              item.id = idNum++
              item.isMark = false // 是否标记为修改意见
              item.markDesc = item.questionAndOpinion
                ? item.questionAndOpinion
                : item.question + item.opinion // 问题说明
              list.push(item)
            })
          }
        }
        // 小红书标题审核结果
        if (isNotEmpty(data.xhsTitleTextResult)) {
          if (data.xhsTitleTextResult.text && data.xhsTitleTextResult.text === '\n') {
            data.xhsTitleTextResult.text = ''
          }
          if (data.xhsTitleTextResult.results && data.xhsTitleTextResult.results.length > 0) {
            data.xhsTitleTextResult.results.forEach(item => {
              item.markType = 'xhsTitleText'
              item.id = idNum++
              item.isMark = false // 是否标记为修改意见
              item.markDesc = item.questionAndOpinion
                ? item.questionAndOpinion
                : item.question + item.opinion // 问题说明
              list.push(item)
            })
          }
        }

        // 视频转语音的文案审核结果
        if (
          isNotEmpty(data.videoTextResult) &&
          data.videoTextResult.results &&
          data.videoTextResult.results.length > 0
        ) {
          data.videoTextResult.results.forEach(item => {
            item.markType = 'videoText'
            item.id = idNum++
            item.isMark = false // 是否标记为修改意见
            item.markDesc = item.questionAndOpinion
              ? item.questionAndOpinion
              : item.question + item.opinion // 问题说明
            list.push(item)
          })
        }
        // 画面审核结果
        if (isNotEmpty(data.pictureResults)) {
          data.pictureResults.forEach(x => {
            if (x.pictures && x.pictures.length > 0) {
              x.pictures.forEach(item => {
                item.id = idNum++
                item.isMark = false // 是否标记为修改意见
                item.markDesc = item.questionAndOpinion
                  ? item.questionAndOpinion
                  : item.question + item.opinion // 问题说明
              })
            }
          })
          tableForm.listData = data.pictureResults.slice(0, tableForm.page.size)
          tableForm.page.total = data.pictureResults.length
        }
        // 审核不通过理由
        if (data.auditResult === 3 && data.auditOpinion) {
          reasonList.value = JSON.parse(data.auditOpinion)
        }
        riskDetectionResultList.value = list
        // 判断是否有多个平台
        let platformList = []
        if (data.auditData.dyTitleTextPlatform) {
          data.dyOtherPlatfrom = data.auditData.dyTitleTextPlatform.split(',')
          platformList = platformList.concat(data.auditData.dyTitleTextPlatform.split(','))
        }
        if (data.auditData.xhsTitleTextPlatform) {
          platformList = platformList.concat(data.auditData.xhsTitleTextPlatform.split(','))
        }
        data.platformList = platformList
        info.value = data
        pageLoading.value = false
      } else {
        pageLoading.value = false
      }
    })
    .catch(() => {
      pageLoading.value = false
    })
}
// function initData() {
//   console.log('离开重置')
//   videoUrl.value = ''
//   videoCover.value = ''
//   imgUrlList.value = []
//   imgIndex.value = 0
//   videoDuration.value = null
//   pageLoading.value = true
//   isVideo.value = true
//   info.value = {}
//   riskDetectionResultList.value = []
//   radioValue.value = 2
//   reasonList.value = [
//     {
//       type: null, // 类型 从哪里添加的 text文本 img 图片 left 代表是通过左侧添加意见过来
//       id: null, // 如果是风险检测的那就会有专属的ID
//       keyPoint: null, // 如果是视频，就会有专属的时间 图片则是第N张图
//       score: null, // 风险等级 如果是风险检测，就会有专属的风险等级
//       reason: '' //  文本内容
//     }
//   ]
//   tableForm.listData = []
//   tableForm.page = {
//     index: 1,
//     size: 5,
//     total: 0
//   }
//   reasonRef.value = []
//   checkImgRiskDialog.value = {
//     show: false
//   }
//   checkTextRiskDialog.value = {
//     show: false
//   }
// }
// onActivated(() => {
//   console.log('离开onactivated', route.query.id)

//   console.log('离开onactivated', route.query)
//   id.value = route.query.id
//   const KOSToRecord = sessionStorage.getItem('KOSToRecord')
//   if (KOSToRecord !== '1') {
//     initData()
//     getDetailFun()
//   }

//   sessionStorage.removeItem('KOSToRecord')
// })
onMounted(() => {
  console.log('离开onmounted', route.query.id)
  id.value = route.query.id
  getDetailFun()
})

// onBeforeMount(() => {
//   console.log('离开onBeforeMount', route.query.id)
//   initData()
// })
// onBeforeRouteLeave((to, from, next) => {
//   console.log('离开', to, from)
//   if (to.name === 'KOSRecord') {
//     from.meta.keepAlive = true
//   } else {
//     from.meta.keepAlive = false
//   }
//   next()
// })
// 确认
const saveLoading = ref(false)

const saveFun = throttle(() => {
  console.log('审核不通过理由', reasonList.value)
  saveLoading.value = true
  // 如果是审核不通过，
  // 检测每一个审核不通过的理由是否不超过100子
  // 审核理由不能超过30条
  if (radioValue.value === 2) {
    if (isEmpty(reasonList.value)) {
      message.warning('请填写修改意见')
      saveLoading.value = false
      return
    }
    const hasList = reasonList.value.filter(x => x.reason)
    if (isEmpty(hasList)) {
      message.warning('请填写修改意见')
      saveLoading.value = false
      return
    }
    if (hasList && hasList.length !== reasonList.value.length) {
      message.warning('请填写修改意见')
      saveLoading.value = false
      return
    }
    if (hasList && hasList.length > 30) {
      message.warning('最多支持添加30条修改意见')
      saveLoading.value = false
      return
    }
    const maxList = hasList.filter(x => x.reason && x.reason.length > 100)
    if (isNotEmpty(maxList)) {
      message.warning('请调整修改意见字数')
      saveLoading.value = false
      return
    }
    saveAfterFun({
      isPass: false,
      opinion: JSON.stringify(reasonList.value)
    })
  } else {
    saveAfterFun({
      isPass: true
    })
  }
}, 700)
// 调用保存接口
function saveAfterFun(params) {
  console.log('保存', params)
  params.auditId = id.value

  doAudit(params)
    .then(res => {
      if (res.code === 0) {
        // 获取下一个
        nextFun()
      } else {
        saveLoading.value = false
      }
    })
    .catch(() => {
      saveLoading.value = false
    })
}
// 下一个
const nextFun = throttle(newId => {
  const KOSAuditPrams = sessionStorage.getItem('KOSAuditPrams')
  let params = {}
  if (isNotEmpty(KOSAuditPrams)) {
    params = JSON.parse(KOSAuditPrams)
  }
  params.currentAuditId = id.value
  console.log('下一个的入参', params)
  getNextAuditDetail(params)
    .then(res => {
      if (res.code === 0) {
        saveLoading.value = false
        if (isNotEmpty(res.data)) {
          id.value = res.data.auditId
          message.success('保存成功')
          router.replace({
            path: router.currentRoute.value.path,
            query: {
              id: res.data.auditId
            }
          })
        } else {
          message.success('所有审核内容已全部完成')
          backFun()
        }
      } else {
        saveLoading.value = false
      }
    })
    .catch(() => {
      saveLoading.value = false
    })
}, 0)
// 返回
const backFun = throttle(() => {
  if (router.options?.history?.state?.back === '/content_market/audit_center') {
    router.go(-1)
  } else {
    router.push('/content_market/audit_center')
  }
}, 700)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.red_color {
  color: #d40000;
}
.red_back_color {
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d40000;
  background: rgba(212, 0, 0, 0.1);
}
.orange_color {
  color: #ed6a0c;
}
.orange_back_color {
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ed6a0c;
  background: rgba(237, 106, 12, 0.1);
}
.green_color {
  color: #2da641;
}
.green_back_color {
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #2da641;
  background: rgba(45, 166, 65, 0.1);
}
.red_score {
  color: #d40000;
}
.red_score_line {
  position: relative;
  &::after {
    position: absolute;
    left: 0%;
    bottom: 4px;
    content: ' ';
    width: 100%;
    height: 6px;
    background: linear-gradient(270deg, rgba(212, 0, 0, 0) 0%, rgba(212, 0, 0, 0.19) 100%);
    border-radius: 5px;
  }
}
.orange_score {
  color: #ed6a0c;
}
.orange_score_line {
  position: relative;
  &::after {
    position: absolute;
    left: 0%;
    bottom: 4px;
    content: ' ';
    width: 100%;
    height: 6px;
    background: linear-gradient(270deg, rgba(237, 106, 12, 0) 0%, rgba(237, 106, 12, 0.2) 100%);
    border-radius: 5px;
  }
}
.green_score {
  color: #2da641;
}
.green_score_line {
  position: relative;
  &::after {
    position: absolute;
    left: 0%;
    bottom: 4px;
    content: ' ';
    width: 100%;
    height: 6px;
    background: linear-gradient(270deg, rgba(45, 166, 65, 0) 0%, rgba(45, 166, 65, 0.2) 100%);
    border-radius: 5px;
  }
}
.page {
  width: 100%;
  height: 100%;
  .page_top {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: calc(100% - 40px);
    .page_left {
      width: 400px;
      height: 100%;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 4px;
      margin-right: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
      .left_video {
        width: 100%;
        .video_dom {
          width: 100%;
          height: 640px;
          border-radius: 4px;
        }
      }
      .left_img {
        width: 100%;
        .img_dom {
          width: 100%;
          height: 640px;
          position: relative;
          .one_img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: flex;
            border-radius: 4px;
          }
        }
        .img_nums {
          margin-top: 12px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          .img_num {
            margin: 0 30px;
            font-weight: 400;
            font-size: 11px;
            color: #646a73;
            line-height: 16px;
          }
          .pre_img,
          .next_img {
            cursor: pointer;
            width: 28px;
            height: 28px;
            background: rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            border-radius: 100%;
            img {
              width: 16px;
              height: 16px;
              display: flex;
              object-fit: contain;
            }
          }
          .pre_img:hover,
          .next_img:hover {
            background: rgba(0, 0, 0, 0.1);
          }
          .dis_img {
            cursor: not-allowed;
            background: rgba(0, 0, 0, 0.05) !important;
          }
        }
      }
      .add_suggestion_btn {
        margin-top: 16px;
        width: 88px;
      }
      .left_text {
        width: 100%;
        margin-top: 12px;
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
      }
      .left_text + .left_text {
        margin-top: 8px;
      }
    }
    .page_right {
      width: calc(100% - 416px);
      height: 100%;
      overflow-y: auto;
      .right_top {
        width: 100%;
        height: 58px;
        background: #ffffff;
        border-radius: 4px;
        margin-bottom: 16px;
        padding: 0 24px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .copywriting_top {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;

        .top_left {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          font-weight: 600;
          font-size: 18px;
          color: #303133;
          line-height: 26px;
          .left_title {
            padding-top: 6px;
          }
          .left_score {
            margin-left: 8px;
            font-weight: 600;
            font-size: 24px;
            line-height: 34px;
          }
        }
        .top_right {
          cursor: pointer;
          padding-top: 8px;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          line-height: 20px;
          img {
            width: 14px;
            height: 14px;
            object-fit: contain;
            display: flex;
            margin-left: 4px;
          }
        }
      }
      .copywriting_bottom {
        margin-top: 16px;
        max-height: 200px;
        overflow-y: auto;
      }
      .right_copywriting {
        width: 100%;
        background: #ffffff;
        border-radius: 4px;
        padding: 14px 24px 16px 24px;
        .copywriting_top {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;

          .top_left {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            font-weight: 600;
            font-size: 18px;
            color: #303133;
            line-height: 26px;
            .left_title {
              padding-top: 6px;
            }
            .left_score {
              margin-left: 8px;
              font-weight: 600;
              font-size: 24px;
              line-height: 34px;
            }
          }
          .top_right {
            cursor: pointer;
            padding-top: 8px;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            font-weight: 400;
            font-size: 14px;
            color: #364fcd;
            line-height: 20px;
            img {
              width: 14px;
              height: 14px;
              object-fit: contain;
              display: flex;
              margin-left: 4px;
            }
          }
        }
        .copywriting_top + .copywriting_container {
          margin-top: 16px;
        }
        .copywriting_container + .copywriting_container {
          margin-top: 12px;
        }
        .copywriting_container {
          .container_top {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            .top_left {
              font-weight: 600;
              font-size: 16px;
              color: #303133;
              line-height: 22px;
            }
            .top_right {
              font-weight: 400;
              font-size: 14px;
              color: #364fcd;
              line-height: 20px;
              cursor: pointer;
            }
          }
          .container_content {
            margin-top: 4px;
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
      .right_copywriting + .right_frame {
        margin-top: 18px;
      }
      .table_level {
        font-weight: 600;
        font-size: 12px;
        line-height: 18px;
      }
      .score_tip {
        font-weight: 400 !important;
        font-size: 14px !important;
        line-height: 26px !important;
        padding-top: 6px !important;
      }
      .right_frame {
        width: 100%;
        background: #ffffff;
        border-radius: 4px;
        padding: 14px 24px 20px 24px;
        .frame_top {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          font-weight: 600;
          font-size: 18px;
          color: #303133;
          line-height: 26px;
          .top_title {
            padding-top: 6px;
          }
          .top_score {
            margin-left: 8px;
            font-weight: 600;
            font-size: 24px;
            line-height: 34px;
          }
        }
        .frame_container {
          margin-top: 16px;
          .table_img_num {
            flex-shrink: 0;
            font-weight: 400;
            font-size: 14px;
            color: #909399;
            line-height: 24px;
            margin-bottom: 5px;
          }
          .table_img {
            margin: 10px 0 5px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-end;
            overflow-x: auto;
            img {
              cursor: pointer;
              object-fit: cover;
              width: 60px;
              height: 80px;
              background: #dcdee0;
              border-radius: 2px;
              margin: 0px 8px 5px 0;
            }
          }
          .table_btn {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
          }
        }
      }

      .right_frame + .right_audit {
        margin-top: 16px;
      }
      .right_audit {
        margin-bottom: 16px;
        width: 100%;
        padding: 20px 24px;
        background: #ffffff;
        border-radius: 4px;
        .audit_result {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .result_title {
            font-weight: 600;
            font-size: 18px;
            line-height: 26px;
          }
          .result_time {
            margin-left: 12px;
            // margin-top: 4px;
            font-weight: 400;
            font-size: 14px;
            color: #909399;
            line-height: 20px;
          }
        }
        .audit_top {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .top_title {
            font-weight: 600;
            font-size: 18px;
            color: #303133;
            line-height: 26px;
            margin-right: 16px;
          }
          .el-radio-group,
          .el-radio {
            height: 26px;
          }
          .el-radio {
            margin-right: 25px;
          }
        }
        .audit_reason {
          width: 100%;
          margin-top: 16px;
          .one_reason + .one_reason {
            margin-top: 20px;
          }
          .one_reason_tip + .one_reason {
            margin-top: 6px;
          }
          .one_reason {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            .reason_left {
              position: relative;
              margin-right: 12px;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              width: calc(100% - 84px);
              border-radius: 4px;
              border: 1px solid #dcdfe6;
              padding-left: 8px;
              .reason_type {
                margin: 0 4px 0 0px;
                flex-shrink: 0;
                font-weight: 600;
                font-size: 12px;
                line-height: 18px;
              }

              .reason_input {
                border: none;
                :deep(.el-textarea__inner) {
                  border: none;
                  padding-right: 55px;
                  line-height: 24px !important;
                  min-height: 24px !important;
                  padding-left: 0;
                  padding-top: 4px;
                  padding-bottom: 4px;
                }
                :deep(.el-input__inner) {
                  border: none;
                  height: 28px;
                  line-height: 28px;
                  padding-left: 0;
                }
                :deep(.el-input__suffix) {
                  right: 0;
                }
                :deep(.el-input__count .el-input__count-inner) {
                  padding-right: 8px;
                  color: #c0c4cc;
                }
              }
              .reason_inputNum {
                position: absolute;
                right: 0;
                bottom: 7px;
                flex-shrink: 0;
                padding-right: 12px;
                font-weight: 400;
                font-size: 12px;
                color: #c0c4cc;
                line-height: 18px;
              }
            }
          }
          .one_reason_tip {
            padding-top: 2px;
            color: #f56c6c;
            font-size: 12px;
            line-height: 1;
          }
          .one_reason_err {
            .reason_left {
              border-color: #f56c6c;
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
.el-link + .el-link {
  margin-left: 16px;
}
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: transparent;
  color: #606266;
}
:deep(.el-link.el-link--primary.is-disabled) {
  color: rgba(191, 196, 205, 1);
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: transparent;
  color: #606266;
}
</style>
