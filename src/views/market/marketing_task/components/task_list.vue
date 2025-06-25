<template>
  <div class="task_list kos_page">
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
      ref="xmSearchRef"
    >
      <template #searchBtn>
        <!-- <async_button v-if="taskType != 'study'" :asyncFunc="exportTask" :isExport="true">
          导出
        </async_button> -->
        <exp_button :asyncFunc="exportTask" :isExport="true">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="toCreateTask">
          创建{{ taskTypeEnums[taskType].name }}
        </el-button>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskList"
      >
        <el-table-column label="任务标题" prop="title" min-width="250">
          <template v-slot="{ row }">
            <div
              :style="
                systemVersion == 3 && (taskType == 'video' || taskType === 'imgText')
                  ? 'display: flex; flex-direction: row; line-height: 22px;align-items: center;'
                  : ''
              "
            >
              <!-- 企业版视频和图文任务 -->
              <span
                :class="row.taskGroup == 3 ? 'orange_score mark_text' : 'green_score mark_text'"
                v-if="systemVersion == 3 && (taskType == 'video' || taskType === 'imgText')"
              >
                {{ row.taskGroup == 3 ? 'KOC' : 'KOS' }}
              </span>
              {{ row.name || '--' }}
              <el-popover
                v-if="
                  row.status === TASK_STATUS.get('进行中') &&
                  architectureMode != 2 &&
                  row.qrCode &&
                  taskType != 'live'
                "
                placement="top"
                popper-class="qrcode_popper"
                width="240px"
                trigger="hover"
              >
                <template #reference>
                  <img
                    class="qrcode_img"
                    style="cursor: pointer; width: 20px; margin-left: 5px"
                    src="@/assets/images/content_center/qrcode.png"
                    alt=""
                  />
                </template>
                <div class="qrcode_box" v-if="row.qrCode" style="padding: 25px 0">
                  <img :src="row.qrCode" alt="" style="width: 150px" />
                  <!-- <qrcode-vue :value="row.qrCode" :size="126" level="H" /> -->
                  <div class="qr_mark">
                    <!-- <img
                      src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                      alt=""
                    /> -->
                    <span style="font-size: 14px; font-weight: bold">
                      {{
                        row.taskGroup == 3 ? '微信' : architectureMode === 3 ? '企微' : '微信'
                      }}扫码进行{{ row.taskGroup == 3 ? 'KOC' : 'KOS' }}任务
                    </span>
                  </div>
                </div>
                <div v-else class="qrcode_box">
                  <div class="qr_mark">暂未找到相关地址</div>
                </div>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="`${taskType === 'imgText' ? '图文' : '视频'}发布方式`"
          prop="title"
          min-width="120"
          v-if="taskType == 'video' || taskType === 'imgText'"
        >
          <template v-slot="{ row }">
            <div>
              {{
                row.videoPushMode == 1 || row.videoPushMode == 2
                  ? taskType === 'imgText'
                    ? '相册上传发布'
                    : '相册上传直接发布'
                  : row.videoPushMode == 3
                  ? '创意模板发布'
                  : row.videoPushMode == 4
                  ? '一键转发'
                  : '未知'
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="图文发布平台"
          prop="title"
          min-width="120"
          v-if="taskType === 'imgText'"
        >
          <template v-slot="{ row }">
            <div>
              {{ getPlatformFun(row.videoPlatform, row.type) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频发布平台"
          prop="title"
          min-width="160"
          v-if="taskType === 'video'"
        >
          <template v-slot="{ row }">
            <div>
              {{ getPlatformFun(row.videoPlatform, row.type) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="关联活动"
          min-width="120"
          v-if="taskType === 'video' || taskType === 'live' || taskType === 'imgText'"
        >
          <template v-slot="{ row }">
            <div>
              {{ row.activityTitle || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="已分发人数" prop="deliverCount" min-width="120">
          <template #header>
            <div class="column_header">
              <span>已分发人数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p v-for="(tip, tipIndex) in taskListInfo.numberOfPeopleTips" :key="tipIndex">
                    {{ tip }}
                  </p>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.deliverCount, false, true) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" prop="joinCount" min-width="110">
          <template #header>
            <div class="column_header">
              <span>参与人数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 400px">
                    <p
                      style="white-space: pre-wrap"
                      v-for="(tip, tipIndex) in taskListInfo.joinCountTips"
                      :key="tipIndex"
                    >
                      {{ tip }}
                    </p>
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.joinCount, false, true) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="参加成功人数" prop="joinSucceed" min-width="140">
          <template #header>
            <div class="column_header">
              <span>参与成功人数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 400px">
                    <p
                      style="white-space: pre-wrap"
                      v-for="(tip, tipIndex) in taskListInfo.successCountTips"
                      :key="tipIndex"
                    >
                      {{ tip }}
                    </p>
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.joinSucceed, false, true) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="完成人数" prop="finishCount" min-width="110">
          <template #header>
            <div class="column_header">
              <span>完成人数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p v-for="(tip, tipIndex) in taskListInfo.finishCountTips" :key="tipIndex">
                    {{ tip }}
                  </p>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.finishCount, false, true) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="任务时间" min-width="200">
          <template v-slot="{ row }">
            <div v-if="row.startTime">
              {{ row.startTime.slice(0, 10) }}&nbsp;至&nbsp;{{ row.endTime.slice(0, 10) }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="创建人" min-width="150">
          <template v-slot="{ row }">{{ row.taskCreateUserName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="150">
          <template #default="scope">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  style="
                    font-size: 5px;
                    margin-right: 4px;
                    display: inline-block;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                  "
                  :class="{
                    'status-0': scope.row.status === 0,
                    'status-1': scope.row.status === 1 || scope.row.status === 5,
                    'status-2': scope.row.status === 3 || scope.row.status === 7,
                    'status-3': scope.row.status === 4,
                    'status-4': scope.row.status === 2 || scope.row.status === 6
                  }"
                ></span>
                {{ scope.row.statusName }}
                <template v-if="scope.row.status === 2">
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template #content>
                      <div>{{ scope.row.auditRemark }}</div>
                    </template>
                    <el-icon style="margin-left: 8px">
                      <i-warning />
                    </el-icon>
                  </el-tooltip>
                </template>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="right" fixed="right" min-width="190">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: flex-end">
              <template v-if="scope.row.status === TASK_STATUS.get('未开启')">
                <div style="display: flex; align-items: center; justify-content: flex-end">
                  <el-link type="primary" @click="setTaskStatus(1, scope.row.id)">开启</el-link>
                  <el-link type="primary" class="ml_16" @click="toTaskDetail(scope.row)">
                    编辑
                  </el-link>
                  <el-dropdown class="ml_16">
                    <el-link type="primary">更多</el-link>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <!-- <el-dropdown-item @click="openNoticeDialog(scope.row.id)">
                          发送通知
                        </el-dropdown-item> -->
                        <el-dropdown-item @click="toTaskDataDetail(scope.row)">
                          查看数据
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="delTask(scope.row.id)">删除任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="copyTaskDetail(scope.row)">复制任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                          <div @click="toTemplateDetail(scope.row)">使用模板</div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('审核不通过')">
                <el-link type="primary" @click="toTaskDetail(scope.row)">
                  {{ scope.row.createUserId === userId ? '编辑' : '详情' }}
                </el-link>
                <el-link type="primary" class="ml_16" @click="delTask(scope.row.id)">删除</el-link>
                <el-dropdown class="ml_16">
                  <el-link type="primary">更多</el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <div @click="copyTaskDetail(scope.row)">复制任务</div>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                        <div @click="toTemplateDetail(scope.row)">使用模板</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('未开始')">
                <div style="display: flex; align-items: center; justify-content: flex-end">
                  <el-link type="primary" @click="toTaskDetail(scope.row)">编辑</el-link>
                  <el-dropdown class="ml_16">
                    <el-link type="primary">更多</el-link>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="scope.row.taskGroup !== 3"
                          @click="openNoticeDialog(scope.row.id)"
                        >
                          发送通知
                        </el-dropdown-item>
                        <el-dropdown-item @click="toTaskDataDetail(scope.row)">
                          查看数据
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="delTask(scope.row.id)">删除任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="copyTaskDetail(scope.row)">复制任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                          <div @click="toTemplateDetail(scope.row)">使用模板</div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('进行中')">
                <div style="display: flex; align-items: center; justify-content: flex-end">
                  <el-link type="primary" @click="setTaskStatus(2, scope.row.id)">暂停</el-link>
                  <el-link type="primary" class="ml_16" @click="toTaskDetail(scope.row)">
                    编辑
                  </el-link>
                  <el-dropdown class="ml_16">
                    <el-link type="primary">更多</el-link>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="scope.row.taskGroup !== 3"
                          @click="openNoticeDialog(scope.row.id)"
                        >
                          发送通知
                        </el-dropdown-item>
                        <el-dropdown-item @click="toTaskDataDetail(scope.row)">
                          查看数据
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="delTask(scope.row.id)">删除任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="copyTaskDetail(scope.row)">复制任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                          <div @click="toTemplateDetail(scope.row)">使用模板</div>
                        </el-dropdown-item>
                        <!-- <el-dropdown-item
                          v-if="architectureMode != 2 && scope.row.qrCode && taskType != 'live'"
                        >
                          <div @click="toDownloadCode(scope.row)">下载二维码</div>
                        </el-dropdown-item> -->
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('已暂停')">
                <div style="display: flex; align-items: center; justify-content: flex-end">
                  <el-link type="primary" @click="setTaskStatus(1, scope.row.id)">开启</el-link>
                  <el-link type="primary" class="ml_16" @click="setTaskStatus(3, scope.row.id)">
                    终止
                  </el-link>
                  <el-dropdown class="ml_16">
                    <el-link type="primary">更多</el-link>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="scope.row.taskGroup !== 3"
                          @click="openNoticeDialog(scope.row.id)"
                        >
                          发送通知
                        </el-dropdown-item>
                        <el-dropdown-item @click="toTaskDataDetail(scope.row)">
                          查看数据
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="delTask(scope.row.id)">删除任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="copyTaskDetail(scope.row)">复制任务</div>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                          <div @click="toTemplateDetail(scope.row)">使用模板</div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('已关闭')">
                <el-link type="primary" @click="toTaskDetail(scope.row)">详情</el-link>
                <el-link type="primary" class="ml_16" @click="toTaskDataDetail(scope.row)">
                  查看数据
                </el-link>
                <el-dropdown class="ml_16">
                  <el-link type="primary">更多</el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <div @click="copyTaskDetail(scope.row)">复制任务</div>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                        <div @click="toTemplateDetail(scope.row)">使用模板</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('已结束')">
                <el-link type="primary" @click="toTaskDetail(scope.row)">详情</el-link>
                <el-link type="primary" class="ml_16" @click="toTaskDataDetail(scope.row)">
                  查看数据
                </el-link>
                <el-dropdown class="ml_16">
                  <el-link type="primary">更多</el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <div @click="copyTaskDetail(scope.row)">复制任务</div>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                        <div @click="toTemplateDetail(scope.row)">使用模板</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-if="scope.row.status === TASK_STATUS.get('未审核')">
                <el-link type="primary" @click="toTaskDetail(scope.row)">详情</el-link>
                <el-dropdown class="ml_16">
                  <el-link type="primary">更多</el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <div @click="copyTaskDetail(scope.row)">复制任务</div>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="hasTemplateDetailPower(scope.row)">
                        <div @click="toTemplateDetail(scope.row)">使用模板</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <task-notice-dialog v-model="dialogVisible" @confirm="saveMessageFun"></task-notice-dialog>
  </div>
</template>

<script setup>
import { PLATFORM } from '@/utils/dictionary/company.js'
import { setBusinessChooseParam } from '@/utils/search.js'
// import { downLoadFile } from '@/utils/exportFile.js'
import { onMounted } from 'vue-demi'
import taskListOfAction from './js/task_list_action'
import queryTaskList from './js/task_list_query'
import { wanSliceFormat, throttle, getUserParentMenu, getUserMenu, isEmpty } from '@/utils/tools.js'
import { TASK_STATUS } from '@/utils/dictionary/task'
import TaskNoticeDialog from './task_notice_dialog.vue'
import { sendHrefMessage } from '@/utils/OEA.js'
import { useStore } from 'vuex'
import { onBeforeRouteLeave } from 'vue-router'
// import qrcodeVue from 'qrcode.vue'

const store = useStore()
const props = defineProps({
  taskType: String
})
const { taskType } = toRefs(props)
const vm = getCurrentInstance()

const systemVersion = computed(() => store.state.user.systemVersion)
// 获取组织架构
const architectureMode = computed(() => {
  return localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).architectureMode
    : null
})

// 企业版和专业版下的创意模板发布与一键转发中存在视频来源为模板式生成或流水线才有使用模板的功能
const hasTemplateDetailPower = item => {
  // const systemVersion = store.state.user.systemVersion
  return [3, 4].includes(systemVersion.value) && item.type === 1 && item.hasTemplate
}
const taskTypeEnums = {
  video: {
    name: '视频任务',
    path: 'video_task/video_task_details',
    type: 1,
    joinCountTips: [
      `APP：抖音，快手，小红书跳转至外部平台，视频号进入发布页面`,
      '小程序：进入发布页面'
    ],
    successCountTips: ['成功匹配到至少一条视频'],
    finishCountTips: ['达到最低指标'],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  },
  live: {
    name: '直播任务',
    path: 'live_task/live_task_details',
    type: 2,
    joinCountTips: [
      '●  挂载小程序：检测到有匹配任务的直播',
      '●  不挂载小程序：选择直播记录既参与任务成功'
    ],
    successCountTips: ['挂载小程序：直播挂载路径正确', '不挂载小程序：绑定直播场次'],
    finishCountTips: ['达到最低指标'],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  },
  collection: {
    name: '征集任务',
    path: 'collecting_task/detail',
    type: 3,
    joinCountTips: ['成功上传任意原料/视频'],
    successCountTips: ['有审核通过的原料/视频'],
    finishCountTips: ['有审核成功的原料/视频'],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  },
  study: {
    name: '学习任务',
    path: 'study_task/detail',
    type: 5,
    joinCountTips: [
      '●  在线课程',
      '    ●  有作业：开始学习了学习时长大于0算参与',
      '    ●  无作业：开始学习了学习时长大于0算参与成功',
      '●  线下课程',
      '    ●  有作业（线下课程必定有作业）：没有参与状态，只有参与成功状态'
    ],
    successCountTips: ['有作业（必做）：学习并提交作业', '有作业（选做）、无作业：有学习记录'],
    finishCountTips: [
      '有作业（必做）：有分数指标则需达到最低分数指标；无分数指标则需提交作业',
      '有作业（选做）、无作业：完成浏览指标'
    ],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  },
  imgText: {
    name: '图文任务',
    path: 'imgText_task/imgText_task_details',
    type: 6,
    joinCountTips: [
      `APP：抖音，快手，小红书跳转至外部平台，视频号进入发布页面`,
      '小程序：进入发布页面'
    ],
    successCountTips: ['成功匹配到至少一条图文'],
    finishCountTips: ['达到最低指标'],
    numberOfPeopleTips: [
      '已分发人数：任务实际已经分发到的人数 ',
      '注：因组织架构及人员变动，“已分发人数”与“预计分发人数”可能不一致；',
      '系统会在任务开始前48h左右触发补偿机制，保证任务能覆盖到归属部门下的所有达人'
    ]
  }
}
const userId = ref('')
userId.value = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo')).userId + ''
  : ''
const taskListInfo = taskTypeEnums[taskType.value]

const {
  searchComponents,
  searchComponents1,
  tableForm,
  getTaskList,
  resetSearch,
  searchList,
  exportTask,
  xmSearchRef
} = queryTaskList(taskListInfo)

const {
  toTaskDataDetail,
  toTaskDetail,
  copyTaskDetail,
  toCreateTask,
  setTaskStatus,
  delTask,
  sendPass
} = taskListOfAction(vm, taskListInfo, getTaskList)

const dialogVisible = ref(false)
const currentItemId = ref(null)
const openNoticeDialog = id => {
  dialogVisible.value = true
  currentItemId.value = id
}

onMounted(() => {
  // resetSearch()
})
const saveMessageFun = function () {
  dialogVisible.value = false
  sendPass(currentItemId.value)
}

// 使用模板，跳转到模板发布详情
const toTemplateDetail = throttle(function (item) {
  // 跨菜单跳转 begin
  const menu = getUserMenu('sumvideo:creative_mould')
  const parentMenu = menu ? getUserParentMenu(menu.parentId) : null
  console.log('toTemplateDetail', menu, parentMenu)
  if (menu && parentMenu) {
    sessionStorage.setItem('menuActive', menu?.scopeUrl)
    sessionStorage.setItem('module', parentMenu?.parentName || parentMenu?.scopeName)
    sessionStorage.setItem('taskTemplateName', item.name)
    const url = location.origin + '/sumwhy_video/template_space?type=publishInfo&id=' + item.id
    sendHrefMessage(url)
  }
  // 跨菜单跳转 end
}, 500)

// 下载二维码
// const toDownloadCode = throttle(item => {
//   downLoadFile(item.qrCode, `${item.name}.jpg`)
// }, 700)
const menuOfKeepAlive = inject('$menuOfKeepAlive')

onActivated(() => {
  console.log("menuOfKeepAlive('judge')", menuOfKeepAlive('judge'))
  // 为保证业务主体是最新的，
  const businessChooseObj = {}
  searchComponents.value.forEach(item => {
    if (!item.hiddenItem) {
      if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
        const info = {
          ids: item.ids || [],
          isCheckAll: item.isCheckAll || false
        }
        businessChooseObj[item.principalType] = info
      }
    }
  })
  if (isEmpty(businessChooseObj)) {
    const list = setBusinessChooseParam(businessChooseObj, true)
    searchComponents.value = searchComponents1.value.concat(list)
  }
})

// 页面里开的时候 清空分组组件
onBeforeRouteLeave((to, from) => {
  if (
    to.path.indexOf('content_market/study_task') === -1 &&
    to.path.indexOf('content_market/video_task') === -1 &&
    to.path.indexOf('content_market/live_task') === -1 &&
    to.path.indexOf('content_market/imgText_task') === -1 &&
    to.path.indexOf('content_market/collecting_task') === -1
  ) {
    searchComponents.value = []
    nextTick(() => {
      searchComponents.value = searchComponents1.value
    })
  }
})

// 显示平台
function getPlatformFun(e, taskType = 1) {
  // taskType 1 视频任务 6 图文任务
  if (e) {
    if (e === '0') {
      return taskType === 1 ? '抖音、视频号、小红书、快手' : '抖音、小红书'
    } else {
      const list = e.split(',').map(x => {
        return PLATFORM.getCN(Number(x)) || ''
      })
      return list.join('、')
    }
  } else {
    return '-'
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/content_center/content_matrix/manage/index.scss';
@import '@/views/content_center/components/css/qrcode.scss';

:deep(.el-table__row) {
  height: 62px;
}
.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

:deep(.el-table__row) {
  height: 62px;
}
.status-0 {
  background-color: rgba(54, 79, 205, 1);
}
.status-1 {
  background-color: rgba(255, 172, 109, 1);
}
.status-2 {
  background-color: rgba(144, 147, 153, 1);
}
.status-3 {
  background-color: rgba(81, 248, 139, 1);
}
.status-4 {
  background-color: rgba(248, 81, 81, 1);
}
:deep .column_header {
  display: flex;
  align-items: center;
}

.task_list :deep(.el-dialog__header) {
  border-bottom: 0;
  //padding: 10px 0;
}
.mark_text {
  margin-right: 4px;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  font-family: PingFangSC, PingFang SC;
  display: block;
  width: max-content;
  flex-shrink: 0;
  height: fit-content;
}
</style>
