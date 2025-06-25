<template>
  <div class="scheduling_layout">
    <div class="scheduling-calendar flex" ref="calendar">
      <!-- element-loading-text=""
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.02)" -->
      <div class="calendar-left" v-loading="LoadingShow">
        <div class="s-tabs-warpper flex m-bottom-20 align-center">
          <div class="flex tabs1 warp">
            <div class="p-tabs-item flex align-center add-btn" @click="handleAdd">
              <i class="iconfont icon-add-bold" />
              添加直播间
            </div>
            <div
              class="p-tabs-item flex align-center"
              :class="{
                active: openId === item.openId
              }"
              @click="selectSchedulingByRoomId(item)"
              v-for="(item, index) in liveRoomList"
              :key="`room${index}`"
            >
              <live-photo
                :liveRoomPhoto="item.authAccountPhoto"
                :liveRoomName="item.authAccountName"
                :isBegin="item.isBegin"
                :size="36"
              ></live-photo>
              <div class="item-tab-title">
                <div class="item-tab-title-sub two-hidden">
                  {{ item.authAccountName }}
                </div>
                <!-- <div class="item-tab-title-text" style="opacity: 0">暂未开播</div> -->
              </div>
            </div>
          </div>
          <div class="select-time">
            <div style="margin-bottom: 8px">
              <el-button type="primary" v-if="isShow" @click="handleExport">
                <i class="iconfont icon-daochu"></i>
                导出数据
              </el-button>
              <el-button type="primary" loading v-else>导出中</el-button>
            </div>
            <el-date-picker
              type="month"
              placeholder="选择月份"
              class="date_picker"
              style="width: 148px"
              v-model="monthValue"
              @change="changeMonth"
            />
          </div>
        </div>
        <div class="calendar-date-warpper">
          <div class="show-data" :style="showDataStyle"></div>
          <div class="date-header flex align-center">
            <div class="header-item"></div>
            <div class="header-item" v-for="item in 24" :key="`date${item}`">
              <span
                class="sub"
                :class="{
                  active: moveingActiveHours.length > 0 && moveingActiveHours.includes(item - 1)
                }"
              >
                {{ item > 10 ? `${item - 1}:00` : `0${item - 1}:00` }}
              </span>
            </div>
            <!-- 时间卡尺 -->
            <div
              class="time-line"
              v-if="timeLineShow"
              :style="{ left: timeLineLeft + timeLineDiff + 'px' }"
            >
              <div class="time-data">{{ timeLineData }}</div>
              <div class="time-tips"></div>
            </div>
            <!-- 移动三角 -->
            <!-- <div class="lefthird" v-if="thirdShow" :style="{'left': oneHourWidth + moveLineOffset.leftLine - 5  + 'px'}"></div>
          <div class="righthird" v-if="thirdShow" :style="{'left': oneHourWidth + moveLineOffset.rightLine - 5  + 'px'}"></div> -->
            <div
              class="time-line"
              v-if="thirdShow"
              :style="{ left: oneHourWidth + moveLineOffset.leftLine - 5 + 'px' }"
            >
              <div class="time-data">{{ thirdLeftText }}</div>
              <div class="time-tips"></div>
            </div>
            <div
              class="time-line"
              v-if="thirdShow"
              :style="{ left: oneHourWidth + moveLineOffset.rightLine - 5 + 'px' }"
            >
              <div class="time-data">{{ thirdRightText }}</div>
              <div class="time-tips"></div>
            </div>
            <!-- 时间线 -->
            <div
              class="header-line"
              v-if="moveLineOffset.show"
              :style="{
                left: oneHourWidth + moveLineOffset.leftLine + 'px',
                width: moveLineOffset.nextDayWidth + 'px'
              }"
            ></div>
            <div
              class="next-header-line"
              v-if="moveLineOffset.nextDayShow"
              :style="{ left: oneHourWidth + 'px', width: moveLineOffset.rightLine + 'px' }"
            ></div>
          </div>
          <!-- v-show="schedulingList.length>0" -->
          <div class="month-warpper" ref="monthWarpper" @dragover="teamDragover">
            <!-- <Spin size="large" fix v-if="LoadingShow"></Spin> -->
            <div class="month-item" v-for="(row, index) in dragDatas" :key="row.random">
              <div class="line flex">
                <div class="flex line-sub line-25 b-right col just-center align-center">
                  <div>{{ row.week }}</div>
                  <div class="data-time">
                    {{
                      row.date.split('-')[2] >= 10
                        ? row.date.split('-')[2]
                        : `0${row.date.split('-')[2]}`
                    }}
                  </div>
                  <div class="month-data">{{ monthListDesc[monthTips] }}</div>
                  <!-- <div>{{ row.nowData }}</div> -->
                </div>
                <div class="line-25 b-right" v-for="item in 24" :key="item"></div>
              </div>
              <div class="month-content">
                <div v-if="row.list.length > 0">
                  <drag-item
                    v-for="(item, index1) in row.list"
                    :key="index1"
                    ref="drag"
                    :item="JSON.parse(JSON.stringify(item))"
                    :baseData="dragDatas"
                    :schedulingList="schedulingList"
                    :warpperSize="warpperSize"
                    :row="index"
                    :oneHours="maxWidth.x / 25"
                    :maxWidth="maxWidth.x"
                    :index="index1"
                    @hideConShow="hideConShow"
                    @leftMove="leftMove"
                    @hideLineAndThird="hideLineAndThird"
                    @rightMove="rightMove"
                    @itemMouse="itemMouse"
                    @dragBase="dragBase"
                    @hideRedDel="hideRedDel"
                    @showRedDel="showRedDel"
                    @updateCardInfo="updateCardInfo"
                    @showLeftTimeData="showLeftTimeData"
                    @showRightTimeData="showRightTimeData"
                    @itemMove="itemMove"
                    @getTeamInfo="getTeamInfo"
                  ></drag-item>
                </div>
                <div v-if="siteList.length > 0">
                  <div
                    v-for="(row1, rowIndex) in siteList[index].list"
                    :key="`siteList${rowIndex}`"
                    :style="{ position: 'absolute', top: '82px', left: row1.left + 'px' }"
                  >
                    <el-tooltip
                      placement="top"
                      transfer
                      :content="`${row1.startTime} - ${row1.endTime} GMV:￥${$setNum(row1.paySum)}`"
                    >
                      <!-- <Tooltip placement="top" transfer> -->
                      <!-- <div slot="content">
                        <div>{{ row1.startTime }} - {{ row1.endTime }}</div>
                        <div>GMV:{{ $setNum(row1.paySum) }}</div>
                      </div> -->
                      <div class="live-over-time" :style="{ width: row1.width + 'px' }"></div>
                    </el-tooltip>
                  </div>
                </div>
              </div>
              <div></div>
            </div>
            <!-- 跨天框 -->
            <div
              class="data-base"
              v-if="offsetWidth > 0"
              :style="{
                width: `${offsetWidth}px`,
                left: maxWidth.x / 25 + 'px',
                top: `${(nextIndex + 1) * 86}px`,
                background: baseBackground
              }"
            ></div>
            <div
              class="line-left"
              v-if="moveLineOffset.show"
              :style="{
                height: dragDatas.length * 86 + 'px',
                left: oneHourWidth + moveLineOffset.leftLine + 'px'
              }"
            ></div>
            <div
              class="line-right"
              v-if="moveLineOffset.show"
              :style="{
                height: dragDatas.length * 86 + 'px',
                left: oneHourWidth + moveLineOffset.rightLine + 'px'
              }"
            ></div>
            <div
              class="line-bg"
              v-if="moveLineOffset.show"
              :style="{
                height: dragDatas.length * 86 + 'px',
                left: oneHourWidth + moveLineOffset.leftLine + 'px',
                width: moveLineOffset.nextDayWidth + 'px'
              }"
            ></div>
            <div
              class="line-bg-next-day"
              v-if="moveLineOffset.nextDayShow"
              :style="{
                height: dragDatas.length * 86 + 'px',
                left: oneHourWidth + 'px',
                width: moveLineOffset.rightLine + 'px'
              }"
            ></div>
            <!-- 红色删除 -->
            <div
              class="del-red flex just-center align-center"
              v-if="redDel.show"
              :style="{ width: maxWidth.x / 25 + 'px', top: redDel.row * 86 + 'px' }"
            >
              <img src="@/assets/images/schedule/del-icon.png" class="del-a" width="26" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="calendar-right" :style="teamWarpperHeight">
        <div class="team-search-warpper">
          <el-input
            v-model="teamSearchForm.groupName"
            @on-enter="searchTeamList"
            @input="searchTeamList"
            @on-blur="searchTeamList"
            placeholder="搜索团队名称"
            style="width: auto"
          />
          <div class="team-warpper" v-if="teamList.length > 0">
            <!-- <div class="team-item flex align-center" ref="teamRef" @mousedown.stop="teamMouseDown($event, index)" v-for="(item, index) in teamList" :key="`team${index}`">
            <div class="team-left"></div>
            <div class="team-right">{{`${item.groupName}(${item.anchorCount}人) `}}</div>
          </div> -->
            <div
              class="team-item flex align-center"
              ref="teamRef"
              v-for="(item, index) in teamList"
              :key="`team${index}`"
              draggable="true"
              @dragstart="teamDragstart($event, item)"
              @dragend="itemDragend($event, item)"
            >
              <div
                class="team-left flex just-center align-center"
                :style="{ background: item.color }"
              >
                <img src="@/assets/images/schedule/person.png" alt="" width="28" />
                <div class="mask"></div>
              </div>
              <div class="team-right">
                <div class="team-name">{{ item.groupName }}</div>
                <div class="a-count">共{{ item.staffCount }}人</div>
              </div>
            </div>
          </div>
          <div class="team-no-data flex col just-center align-center" v-if="teamList.length === 0">
            <div class="no-team-img">
              <img src="@/assets/images/schedule/no-plan.png" alt="" />
            </div>
            <div class="no-team-text">暂无直播小组</div>
            <!-- <div class="to-add-team flex just-center align-center" @click="toAddTeam">
            <span><Icon type="md-add" size="16" /></span>
            <span class="add">新增小组</span>
          </div> -->
          </div>
        </div>
      </div>
      <transition name="team">
        <div class="team-desc-box" :style="teamBoxStyle" v-if="teamShow">
          <div class="time-change flex aligin-center">
            <div class="size">
              <!-- <i class="el-icon-time"></i> -->
              <img src="@/assets/images/schedule/team_1.png" alt="" width="16" />
            </div>
            <div class="sell-time normal">
              {{ teamInfo.startDate.split('-')[0] }}年{{ teamInfo.startDate.split('-')[1] }}月{{
                teamInfo.startDate.split('-')[2]
              }}日 {{ teamInfo.time.split('~')[0] }} — {{ teamInfo.endDate.split('-')[0] }}年{{
                teamInfo.endDate.split('-')[1]
              }}月{{ teamInfo.endDate.split('-')[2] }}日 {{ teamInfo.time.split('~')[1] }}
            </div>
          </div>
          <div class="time-people">
            <div class="people-header flex align-center">
              <div class="size">
                <!-- <i class="el-icon-user"></i> -->
                <img src="@/assets/images/schedule/team_2.png" alt="" width="16" />
              </div>
              <div class="normal">参与人数({{ teamInfo.staffSchedulingListVos.length }}人)</div>
            </div>
            <div class="flex align-center">
              <div class="size"></div>
              <div class="normal flex col">
                <div class="people-many flex warp">
                  <div
                    class="people-item"
                    v-for="(item, index) in teamInfo.staffSchedulingListVos"
                    :key="index"
                    :class="{
                      'm-bottom-0':
                        index === teamInfo.staffSchedulingListVos.length - 1 ||
                        index === teamInfo.staffSchedulingListVos.length - 2
                    }"
                  >
                    <div class="flex align-center">
                      <div>
                        <img
                          class="people-avatar"
                          :src="item.staffPhoto"
                          alt=""
                          v-if="item.staffPhoto"
                        />
                        <div class="people-avatar flex col just-center align-center" v-else>
                          <div class="line-hidden">{{ item.staffName.substr(-1) }}</div>
                        </div>
                      </div>
                      <div class="people-name line-hidden">{{ item.staffName }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="time-people" v-if="teamInfo.exceptionList.length > 0">
            <div class="people-header flex align-center">
              <div class="size">
                <!-- <i class="el-icon-user"></i> -->
                <img src="@/assets/images/schedule/team_3.png" alt="" width="16" />
              </div>
              <div class="normal">异常情况</div>
            </div>
            <div class="err-message">
              <div
                class="err-item"
                v-for="(item, index) in teamInfo.exceptionList"
                :key="`exceptionList${index}`"
              >
                {{ index + 1 }}: {{ item }}
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <el-dialog
      v-model="modifyShow"
      title="修改排班"
      width="670px"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <div class="modify-item flex align-center h">
        <div class="item-label">
          <span class="strong">*</span>
          <span class="at-time">直播时间：</span>
        </div>
        <div class="item-desc flex align-center">
          <div>
            <el-date-picker
              type="date"
              placeholder="开始日期"
              style="width: 140px"
              v-model="anchorForm.startDate"
              value-format="YYYY-MM-DD"
              :clearable="false"
            ></el-date-picker>
            <span style="margin-right: 5px"></span>
            <el-time-picker
              value-format="HH:mm"
              format="HH:mm"
              placeholder="开始时间"
              v-model="anchorForm.startTime"
              style="width: 100px"
              :clearable="false"
            ></el-time-picker>
          </div>
          <div class="line">至</div>
          <div>
            <el-date-picker
              type="date"
              placeholder="结束日期"
              style="width: 140px"
              :clearable="false"
              value-format="YYYY-MM-DD"
              v-model="anchorForm.endDate"
            ></el-date-picker>
            <span style="margin-right: 5px"></span>
            <el-time-picker
              value-format="HH:mm"
              format="HH:mm"
              placeholder="结束时间"
              v-model="anchorForm.endTime"
              style="width: 100px"
              :clearable="false"
            ></el-time-picker>
          </div>
        </div>
      </div>
      <div class="modify-item flex align-center">
        <div class="item-label">
          <span class="strong h">*</span>
          <span class="at-time">重复周期：</span>
        </div>
        <div class="item-desc flex align-center">
          <el-select v-model="anchorForm.repeatType" style="width: 205px">
            <el-option
              v-for="item in cycleList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="modify-item flex">
        <div class="item-label m-top-14" style="margin-top: 4px">
          <span class="strong h">*</span>
          <span class="at-time">添加成员：</span>
        </div>
        <div class="item-desc t14 flex col just-start mt">
          <div>
            <el-select v-model="chooseValue" multiple style="width: 480px">
              <el-option
                v-for="item in choosePersonList"
                :label="item.name"
                :value="item.staffId"
                :key="item.staffId"
                :disabled="item.isDelete === 1"
              ></el-option>
            </el-select>
          </div>
          <div class="choose-item" v-if="selectedList.length > 0">
            <div
              class="choose-people flex align-center just-b"
              v-for="row1 in selectedList"
              :key="row1.staffId"
            >
              <div class="c-people-j flex align-center">
                <div style="position: relative">
                  <img :src="row1.photo" class="c-people-j-img" alt="" v-if="row1.photo" />
                  <div class="people-avatar flex just-center align-center" v-else>
                    {{ row1.name.substr(-1) }}
                  </div>
                </div>
                <div class="c-people-j-name line-hidden">{{ row1.name }}</div>
              </div>
              <div class="m-left-20 del_icon" @click="delPerson(row1.staffId)">
                <i class="iconfont icon-close"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="clashModal"
      width="640px"
      title="排班冲突"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div>
        <div class="top">
          <div class="item_wrapper">
            <template v-for="(item, index) in clashList">
              <p class="item" :key="item" v-if="showAll ? true : index < 4">
                <span class="index">{{ index + 1 }}.</span>
                {{ item }};
              </p>
            </template>
          </div>
          <span class="showAll" v-if="clashList.length > 4" @click="showAll = !showAll">
            {{ showAll ? '关闭全部' : '展示全部' }}
          </span>
        </div>
        <p class="tip">排班存在冲突，保存修改将删除已有冲突排班，已确认排班无法删除，是否保存？</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handlerOk">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="liveRoomDialog" title="添加直播间" width="800px">
      <div class="main">
        <div class="left">
          <el-input
            class="search_input"
            v-model="authName"
            @change="selectLiveRoom"
            placeholder="请输入直播间"
          />
          <div class="selected_wrapper mt_16">
            <template v-for="item in allLiveRoomList" :key="item.openId">
              <div class="selected_item">
                <el-checkbox-group v-model="selectedOpenIds">
                  <el-checkbox :label="item.openId" @change="handleChange($event, item)">
                    <div class="info">
                      <img class="photo" :src="item.authAccountPhoto" alt="" />
                      <p class="name">{{ item.authAccountName }}</p>
                    </div>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </template>
          </div>
        </div>
        <div class="right">
          <div class="selected_wrapper mt_16">
            <template v-for="item in selectedLiveRoom" :key="item.openId">
              <div class="selected_item">
                <el-checkbox-group v-model="selectedOpenIds">
                  <el-checkbox :label="item.openId" @change="handleChange($event, item)">
                    <div class="info">
                      <img class="photo" :src="item.authAccountPhoto" alt="" />
                      <p class="name">{{ item.authAccountName }}</p>
                    </div>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelSelectLiveRoom">取消</el-button>
        <el-button type="primary" @click="handleAddLiveRoom">确定</el-button>
      </template>
    </el-dialog>
    <repeat-dialog
      v-model:visible="repeatModal"
      :title="repeatTitle"
      @delScheduling="delScheduling(currentData, $event)"
      @editScheduling="handleSubmit"
      @update="getSchedulingList"
    />
  </div>
</template>

<script>
import { format } from 'date-fns'
import DragItem from './DragItem.vue'
import LivePhoto from './components/live_photo.vue'
import { ElMessage } from 'element-plus'
import RepeatDialog from './components/repeat_dialog.vue'
import {
  getShopAccount,
  selectSchedulingAccoount,
  addSchedulingAccoount,
  selectGroup,
  selectStaffScheduling,
  addStaffScheduling,
  selectStaffSchedulingInfo,
  getStaffConflictList,
  updateStaffScheduling,
  deleteStaffScheduling,
  schedulingExport,
  getChoosePerson
} from '@/api/market/schedule.js'
export default {
  name: 'scheduling-calendar',
  components: {
    DragItem,
    LivePhoto,
    RepeatDialog
  },
  data() {
    return {
      authName: '',
      selectedOpenIds: [],
      applyType: null,
      clashModal: false,
      clashList: [],
      updateData: null,
      showAll: false,
      repeatModal: false,
      repeatTitle: 0,
      // 删除对象
      currentData: null,
      currentType: null,
      cycleList: [
        {
          label: '不重复',
          value: 0
        },
        {
          label: '每天重复',
          value: 1
        },
        {
          label: '每周重复',
          value: 2
        },
        {
          label: '每月重复',
          value: 3
        }
      ],
      redDel: {
        // 删除元素的控制
        show: false,
        row: 2
      },
      moveingActiveHours: [],
      monthTips: 0,
      monthListDesc: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
      ],
      teamShow: false, // 团队信息框
      teamBoxClient: {}, // 移入卡片鼠标坐标
      teamInfo: {}, // 卡片团队详情
      teamBoxWarpper: {
        // 成员框的宽高
        height: 0,
        left: 0
      },
      id: null,
      moveLineOffset: {
        // 移动的线
        leftLine: 0,
        rightLine: 0,
        nextDayShow: false,
        show: false,
        nextDayWidth: 0
      },
      thirdShow: false, // 移动排班组件是否显示
      thirdLeftText: '',
      thirdRightText: '',
      timeLineShow: false, // 卡尺是否显示
      timeLineData: '00:00', // 卡尺时间
      timeLineLeft: 0, // 卡尺初始位置
      timeLineDiff: 0, // 卡尺显示拖动距离差
      anchorForm: {
        repeatType: 0,
        startTime: '',
        endTime: '',
        list: [],
        isSure: 0
      },
      oneHourWidth: 0,
      choosePersonList: [],
      chooseValue: [],
      modifyShow: false,
      LoadingShow: true,
      isNowMonth: true,
      monthValue: '',
      openId: null, // 直播间UID
      liveRoomList: [], // 直播间列表
      allLiveRoomList: [],
      liveRoomDialog: false,
      selectedLiveRoom: [],
      dragBaseLeft: 0, // 跨天的长度
      mainScrollTop: 0,
      documentClient: { left: 0, top: 0 },
      monthScroll: { left: 0, top: 0 },
      offsetWidth: 0,
      nextIndex: 0,
      baseBackground: '',
      flag: false,
      Dragstart: { left: 0, top: 0 },
      colors: ['#FFFF99', '#CCFF99', '#99FF99', '#00FF99', '#6666FF'],
      teamSearchForm: {
        pageSize: 1000,
        pageNumber: 1,
        groupName: ''
      },
      dragDatas: [],
      teamList: [],
      teamItem: {},
      schedulingForm: {
        year: '',
        month: '',
        openId: null
      },
      schedulingList: [],
      siteList: [], // 直播场次
      maxWidth: { x: 0 }, //
      teamWarpper: { left: 0, top: 0 }, // 运营团队到body偏移量
      warpperWidth: { left: 0, top: 0 }, // 容器到body的偏移量
      isShow: true,
      copyDate: {}
    }
  },
  computed: {
    oneOfWidth() {
      return { x: this.maxWidth.x / 24 / 60 }
    },
    warpperSize() {
      return {
        left: this.warpperWidth.left + this.maxWidth.x / 25
      }
    },
    monthClientHeight() {
      return {
        height: this.documentClient.top - this.warpperWidth.top - 15 + 'px'
      }
    },
    teamBoxStyle() {
      // if (this.teamBoxClient.top + this.team) {

      // }
      // debugger
      let height = 0
      // 267
      if (this.teamBoxClient.top + this.teamBoxWarpper.height + 63 > this.documentClient.top) {
        height = this.teamBoxClient.top - 63 - this.teamBoxWarpper.height - 20
      } else {
        height = this.teamBoxClient.top + 90 - 63 - 10
      }
      return {
        top: `${height}px`,
        left: `${this.teamBoxClient.left - this.warpperWidth.left + 13}px`
      }
    },
    teamWarpperHeight() {
      return {
        // height: this.documentClient.top - this.teamWarpper.top + 'px'
        height: 'calc(100% - 19px)'
      }
    },
    showDataStyle() {
      return {
        display: 'none',
        top: 0 + 'px',
        left: this.maxWidth.x / 25 + 'px',
        background: 'tan'
      }
    },
    companyList() {
      // return this.$store.getters.companyList
      return []
    },
    selectedList() {
      return this.choosePersonList.filter(p => this.chooseValue.indexOf(p.staffId) >= 0)
    }
  },
  watch: {
    schedulingList: {
      handler(newVal) {
        // this.dragDatas = []
        const arr = []
        if (newVal.length > 0) {
          this.flag = true
          this.$nextTick(() => {
            const max = document.getElementsByClassName('month-warpper') // 获取日期容器
            // const teamBoxWarpper = document.getElementsByClassName('team-desc-box')[0] // 获取团队信息容器
            // this.teamBoxWarpper.width = teamBoxWarpper.clientWidth
            // this.teamBoxWarpper.height = teamBoxWarpper.clientHeight
            this.maxWidth.x = max[0].offsetWidth - max[0].offsetWidth / 25 // 得到日期容器最大宽度
            this.timeLineLeft = this.maxWidth.x / 24 - 7 // 初始位置
            this.warpperWidth = this.sizeTobody(max[0]) // 得到日期最外层容器到body偏移量
            newVal.forEach((item, index) => {
              const obj = {}
              obj.week = item.week
              obj.date = item.date
              obj.randow = Math.random()
              obj.list = []
              if (item.staffSchedulingVoList.length > 0) {
                item.staffSchedulingVoList.forEach((row, index1) => {
                  const obj1 = {}
                  let startTimeArr = null // 用于分割开始时间数组
                  let startTimeToatl = null // 开始时间总分钟
                  let obj1Left = null // 开始时间left
                  let obj1Width = null // 宽度
                  let endTimeArr = null // 用于分割结束时间数组
                  let endTimeTotal = null // 结束时间总分钟
                  obj1.id = row.staffSchedulingId
                  obj1.startTime = row.startTime
                  obj1.endTime = row.endTime
                  obj1.anchorList = row.staffList
                  obj1.repeatType = row.repeatType
                  if (row.groupList.length > 0) {
                    obj1.background = row.groupList[0].color
                    obj1.cardName = row.groupList[0].groupName
                  } else {
                    obj1.background = ''
                    obj1.cardName = '星麦直播管家'
                  }
                  startTimeArr = row.startTime.split(':')
                  startTimeArr[0] = parseInt(startTimeArr[0]) // 将小时10以下的09变为9
                  startTimeArr[1] = parseInt(startTimeArr[1]) // 将分钟10以下的09变为9
                  startTimeToatl = startTimeArr[0] * 60 + startTimeArr[1] // 开始时间总分钟
                  obj1Left = (startTimeToatl * this.maxWidth.x) / 1440 // 得到left
                  endTimeArr = row.endTime.split(':')
                  endTimeArr[0] = parseInt(endTimeArr[0])
                  endTimeArr[1] = parseInt(endTimeArr[1])
                  // if (endTimeArr[0] === 0 && endTimeArr[0] < startTimeArr[0]) { // 服务器结束时间如果是00点并且结束时间小于开始时间证明是24点
                  //   endTimeArr[0] = 24
                  // }
                  endTimeTotal = endTimeArr[0] * 60 + endTimeArr[1]
                  obj1Width = ((endTimeTotal - startTimeToatl) * this.maxWidth.x) / 1440
                  obj1.left = obj1Left
                  obj1.top = 0
                  obj1.width = obj1Width
                  obj1.leftMaxMove = 0
                  obj1.rightMaxMove = 0
                  // console.log('obj1', obj1)
                  obj.list[index1] = obj1
                })
              }
              if (obj.list.length > 0) {
                // if (obj.list.length === 1) { // 数组只有一项
                //   obj.list[0].leftMaxMove = obj.list[0].left
                //   obj.list[0].rightMaxMove = this.maxWidth.x - obj.list[0].left - obj.list[0].width
                // }
                obj.list.forEach((row1, index2) => {
                  // 数组有多项
                  if (obj.list.length === 1) {
                    obj.list[0].leftMaxMove = obj.list[0].left
                    obj.list[0].rightMaxMove =
                      this.maxWidth.x - obj.list[0].left - obj.list[0].width
                  } else {
                    if (index2 === 0) {
                      // 第一个
                      row1.leftMaxMove = row1.left
                      row1.rightMaxMove = obj.list[index2 + 1].left - row1.width - row1.left
                    } else if (index2 > 0 && index2 < obj.list.length - 1) {
                      // 中间
                      const before = obj.list[index2 - 1]
                      const next = obj.list[index2 + 1]
                      before.rightMaxMove = row1.left - before.width - before.left
                      row1.leftMaxMove = row1.left - before.width - before.left
                      row1.rightMaxMove = next.left - row1.left - row1.width
                      next.leftMaxMove = next.left - row1.left - row1.width
                    } else {
                      const before = obj.list[index2 - 1]
                      row1.leftMaxMove = row1.left - before.width - before.left
                      row1.rightMaxMove = this.maxWidth.x - row1.width - row1.left
                    }
                  }
                  // return
                  // if (index2 === 0) { // 第一个
                  //   row1.leftMaxMove = row1.left
                  //   row1.rightMaxMove = obj.list[index2 + 1].left - row1.width
                  // } else if (index2 > 0 && (index2 < obj.list.length - 1)) { // 中间
                  //   let before = obj.list[index2 - 1]
                  //   let next = obj.list[index2 + 1]
                  //   before.rightMaxMove = row1.left - before.width - before.left
                  //   row1.leftMaxMove = row1.left - before.width - before.left
                  //   row1.rightMaxMove = next.left - row1.left - row1.width
                  //   next.leftMaxMove = next.left - row1.left - row1.width
                  // } else {
                  //   let before = obj.list[index2 - 1]
                  //   row1.leftMaxMove = row1.left - before.width - before.left
                  //   row1.rightMaxMove = this.maxWidth.x - row1.width - row1.left
                  // }
                })
              }
              arr[index] = obj
            })
            // 处理是否可以做跨天排班
            arr.forEach((row2, index3) => {
              if (index3 !== arr.length - 1) {
                // 不是最后一天
                const nextArr = arr[index3 + 1].list
                row2.list.forEach((row3, index4) => {
                  if (index4 === row2.list.length - 1 && nextArr.length > 0) {
                    row3.nextMax = nextArr[0].left
                  } else if (index4 === row2.list.length - 1 && nextArr.length === 0) {
                    row3.nextMax = this.maxWidth.x
                  }
                })
              }
            })
            this.dragDatas = arr
            this.dragDatas.forEach(item => {
              item.random = Math.random()
            })
          })
        }
      },
      immediate: true,
      deep: true
    },
    monthValue(newVal) {
      this.$nextTick(() => {
        this.$refs.monthWarpper.scrollTop =
          (new Date().getDate() - 3) * 86 >= 0 ? (new Date().getDate() - 3) * 86 : 0
      })
    }
  },
  mounted() {
    let day = 0
    this.$nextTick(() => {
      const nowTime = new Date()
      const year = nowTime.getFullYear()
      const month = nowTime.getMonth() + 1
      day = nowTime.getDate()
      this.monthScroll.top = (day - 3) * 86 >= 0 ? (day - 3) * 86 : 0
      this.schedulingForm.year = year
      this.schedulingForm.month = month
      this.monthTips = month - 1
      this.monthValue = `${year}-${month}`
      const max = document.getElementsByClassName('month-warpper') // 获取日期容器
      this.maxWidth.x = max[0].offsetWidth - max[0].offsetWidth / 25 // 得到日期容器最大宽度
      this.oneHourWidth = max[0].offsetWidth / 25
      this.timeLineLeft = this.maxWidth.x / 24 - 7 // 初始位置
      this.warpperWidth = this.sizeTobody(max[0]) // 得到日期最外层容器到body偏移量
      this.documentClient.left = document.documentElement.clientWidth
      this.documentClient.top = document.documentElement.clientHeight
      this.teamWarpper = this.sizeTobody(document.getElementsByClassName('calendar-right')[0])
      document.getElementsByClassName('month-warpper')[0].addEventListener(
        'scroll',
        e => {
          e.preventDefault()
          e.stopPropagation()
          const scrollTop = document.getElementsByClassName('month-warpper')[0].scrollTop
          this.mainScrollTop = parseInt(document.getElementsByClassName('el-main')[0].scrollTop)
          if (scrollTop % 1 === 0) {
            this.monthScroll.top = Number(scrollTop)
          } else {
            this.monthScroll.top = Number(scrollTop.toFixed(1))
          }
        },
        true
      )
    })
    this.getSchedulingList()
    this.searchTeamList()
    this.fetchSelectedLiveRoom()
    this.selectLiveRoom()
  },
  methods: {
    handleChange(checked, row) {
      if (checked) {
        this.selectedLiveRoom.push(row)
      } else {
        const index = this.selectedLiveRoom.findIndex(s => s.openId === row.openId)
        this.selectedLiveRoom.splice(index, 1)
      }
    },
    // 查询所有直播间
    selectLiveRoom() {
      const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
      getShopAccount({
        dyAuthStatus: 1,
        pageNumber: 1,
        pageSize: 1000,
        brandId,
        authName: this.authName
      }).then(res => {
        if (res.code === 0) {
          this.allLiveRoomList = res.data.records
        }
      })
    },
    // 查询现有直播间
    fetchSelectedLiveRoom() {
      selectSchedulingAccoount()
        .then(res => {
          if (res.code === 0) {
            this.liveRoomList = res.data || []
            if (this.liveRoomList.length > 0) {
              if (this.openId === null || this.liveRoomList.indexOf(this.openId) === -1) {
                this.openId = this.liveRoomList[0].openId
              }
              this.schedulingForm.openId = this.openId
              // this.getRoomSiteList()
            } else {
              this.openId = null
              this.schedulingForm.openId = null
            }
          }
        })
        .finally(() => {
          this.getSchedulingList()
        })
    },
    handleAdd() {
      this.selectedOpenIds = this.liveRoomList.map(i => i.openId)
      this.selectedLiveRoom = JSON.parse(JSON.stringify(this.liveRoomList))
      this.liveRoomDialog = true
    },
    cancelSelectLiveRoom() {
      this.liveRoomDialog = false
    },
    handleAddLiveRoom() {
      addSchedulingAccoount({
        voList: this.selectedLiveRoom
      })
        .then(res => {
          if (res.code === 0) {
            this.fetchSelectedLiveRoom()
          }
        })
        .finally(() => {
          this.cancelSelectLiveRoom()
        })
    },
    hideConShow() {
      this.$refs.drag.forEach(item => {
        item.conShow = false
      })
    },
    // 显示红色删除
    showRedDel({ row }) {
      this.redDel.show = true
      this.redDel.row = row
    },
    getTeamInfo(flag, obj, item) {
      // debugger
      if (flag) {
        this.teamBoxClient = obj
        this.teamInfo = []
        selectStaffSchedulingInfo(item.id).then(res => {
          // console.log('res', res)
          if (res.code === 0) {
            this.teamInfo = res.data
            const arr = []
            if (this.teamInfo.exceptionList.length > 4) {
              for (let i = 0; i < 4; i++) {
                arr.push(this.teamInfo.exceptionList[i])
              }
            } else {
              for (let i = 0; i <= this.teamInfo.exceptionList.length - 1; i++) {
                console.log(i)
                arr.push(this.teamInfo.exceptionList[i])
              }
            }
            this.teamInfo.exceptionList = arr
            this.teamShow = flag
            this.$nextTick(() => {
              const teamBoxWarpper = document.getElementsByClassName('team-desc-box')[0] // 获取团队信息容器
              console.log('teamBoxWarpper', teamBoxWarpper)
              this.teamBoxWarpper.width = teamBoxWarpper.offsetWidth
              this.teamBoxWarpper.height = teamBoxWarpper.offsetHeight
              // console.log('teamBoxWarpper', this.teamBoxWarpper)
              // this.teamShow = flag
            })
            console.log('teamInfo', this.teamInfo)
          }
        })
      } else {
        this.teamShow = flag
      }
      // this.teamShow = flag
    },
    // 隐藏移动线
    hideLineAndThird() {
      // alert(1)
      this.thirdShow = false
      this.timeLineShow = false
      this.moveLineOffset.show = false
      this.thirdShow = false
      this.moveingActiveHours = []
    },
    // 卡尺数据
    showLeftTimeData(obj) {
      this.timeLineShow = true
      // 显示线
      this.moveLineOffset.show = true
      let { x, offset } = obj
      // console.log('x', x, 'offset', offset)
      // console.log('offset', offset)
      if (x < 0 && Math.abs(x) >= offset.leftMaxMove) {
        x = offset.leftMaxMove
      }
      this.moveingActiveHours = []
      this.timeLineDiff = offset.left + x
      // 调整线的位置
      this.moveLineOffset.leftLine = offset.left + x
      this.moveLineOffset.rightLine = offset.left + offset.width
      this.moveLineOffset.nextDayWidth =
        this.moveLineOffset.rightLine - this.moveLineOffset.leftLine
      const totlSecond = (1440 * this.timeLineDiff) / this.maxWidth.x
      // console.log('totlSecond', totlSecond)

      let totalHour = parseInt(totlSecond / 60)
      let totalMin = parseInt((totlSecond / 60 - totalHour) * 60)
      if (totalMin >= 60) {
        totalHour = totalHour + 1
        totalMin = 0
      }
      // console.log('totalHour', 'totalMin', totalMin)
      const H = totalHour >= 10 ? totalHour : `0${totalHour}`
      const M = totalMin >= 10 ? totalMin : `0${totalMin}`
      this.timeLineData = `${H}:${M}`
      const startHours = parseInt(H)
      const endHours = parseInt(offset.endTime.split(':'))
      for (let i = startHours + 1; i <= endHours; i++) {
        this.moveingActiveHours.push(i)
      }
      // console.log('moveingActiveHours', this.moveingActiveHours)
    },
    showRightTimeData(obj) {
      this.timeLineShow = true
      // 显示线
      this.moveLineOffset.show = true
      this.moveingActiveHours = []
      let { x, offset, flag } = obj
      console.log(x, offset, flag)
      if (x < 0 && Math.ceil(x) >= offset.leftMaxMove) {
        x = offset.leftMaxMove
      }
      if (x > 0 && Math.ceil(x) >= offset.rightMaxMove && !flag) {
        x = offset.rightMaxMove
      }
      if (x > 0 && Math.ceil(x) >= offset.rightMaxMove && !flag) {
        x = x - offset.rightMaxMove - this.maxWidth.x
      }
      if (flag) {
        // 跨天了
        this.timeLineDiff = x
        this.moveLineOffset.nextDayWidth = this.maxWidth.x - offset.left

        this.moveLineOffset.nextDayShow = true
        // console.log('timeLineDiff', this.timeLineDiff)
      } else {
        // 没跨天
        this.timeLineDiff = offset.left + offset.width + x
        this.moveLineOffset.nextDayWidth = offset.width + x
        this.moveLineOffset.nextDayShow = false
        // console.log('timeLineDiff', this.timeLineDiff)
      }
      // 调整线的位置
      this.moveLineOffset.leftLine = offset.left
      this.moveLineOffset.rightLine = this.timeLineDiff
      // this.timeLineDiff = offset.left + offset.width + x
      const totlSecond = (1440 * this.timeLineDiff) / this.maxWidth.x
      console.log('totlSecond', totlSecond)
      let totalHour = parseInt(totlSecond / 60)
      let totalMin = parseInt((totlSecond / 60 - totalHour) * 60)
      if (totalMin >= 60) {
        ++totalHour
        totalMin = 0
      }
      const H = totalHour >= 10 ? totalHour : `0${totalHour}`
      const M = totalMin >= 10 ? totalMin : `0${totalMin}`
      this.timeLineData = `${H}:${M}`
      if (flag) {
        // 跨天
        const startHours = parseInt(offset.startTime.split(':'))
        const endHours1 = 23
        const endHours2 = parseInt(H)
        for (let i = startHours + 1; i <= endHours1; i++) {
          this.moveingActiveHours.push(i)
        }
        for (let j = 0; j <= endHours2; j++) {
          this.moveingActiveHours.push(j)
        }
      } else {
        // 没跨天
        const startHours = parseInt(offset.startTime.split(':'))
        const endHours = parseInt(H)
        for (let i = startHours + 1; i <= endHours; i++) {
          this.moveingActiveHours.push(i)
        }
      }
    },
    // 拖动显示线
    itemMove(obj) {
      const { x, offset } = obj
      // 显示线
      this.moveLineOffset.show = true
      this.moveingActiveHours = []
      // 显示移动三角
      this.thirdShow = true
      this.moveLineOffset.leftLine = x
      this.moveLineOffset.rightLine = x + offset.width
      this.moveLineOffset.nextDayWidth =
        this.moveLineOffset.rightLine - this.moveLineOffset.leftLine
      this.thirdLeftText = this.calcRealTime(this.moveLineOffset.leftLine)
      this.thirdRightText = this.calcRealTime(this.moveLineOffset.rightLine)
      const startHours = parseInt(this.thirdLeftText.split(':')[0])
      const endHours = parseInt(this.thirdRightText.split(':')[0])
      for (let i = startHours + 1; i <= endHours; i++) {
        this.moveingActiveHours.push(i)
      }
    },
    // 计算真实时间
    calcRealTime(diff) {
      const totlSecond = (1440 * diff) / this.maxWidth.x
      let totalHour = parseInt(totlSecond / 60)
      let totalMin = parseInt((totlSecond / 60 - totalHour) * 60)
      if (totalMin >= 60) {
        ++totalHour
        totalMin = 0
      }
      const H = totalHour >= 10 ? totalHour : `0${totalHour}`
      const M = totalMin >= 10 ? totalMin : `0${totalMin}`
      return `${H}:${M}`
    },

    dragBase(data, index, background) {
      this.offsetWidth = data
      this.nextIndex = index
      this.baseBackground = background
      console.log('data', data)
      console.log('index', index)
      console.log('maxWidth/25', this.maxWidth.x / 25)
    },
    teamDragstart(e, item) {
      console.log(e.currentTarget, 'e1', e)
      const c = this.sizeTobody(e.currentTarget)
      console.log('c', c)
      console.log('teamDragstart', e)
      const dt = e.dataTransfer
      dt.effectAllowed = 'copy'
      this.teamItem = item
      this.Dragstart.left = e.pageX - c.left
      console.log('this.Dragstart.left', this.Dragstart.left)
    },
    itemDragend(e, item) {
      console.log('==============')
      // eslint-disable-next-line no-caller
      e = e || arguments.callee.caller.arguments[0]
      let index = null
      let leftIndex = -1
      let currentArr = []
      let anchorIdList = []
      let startT = null
      let startH = null
      let startM = null
      let end = null
      const monthDiffTop = (e.clientY || e.screenY) - this.warpperWidth.top + this.monthScroll.top
      this.teamItem = item
      const size = (240 * this.maxWidth.x) / 1440
      console.log('size', size)
      // const monthDiffLeft = Math.ceil(e.clientX - this.warpperWidth.left - this.maxWidth.x / 25 -  this.Dragstart.left)
      let monthDiffLeft = Math.ceil(
        (e.clientX || e.screenX) -
          this.Dragstart.left -
          this.warpperWidth.left -
          this.maxWidth.x / 25
      )
      monthDiffLeft = monthDiffLeft <= 0 ? 0 : monthDiffLeft
      console.log('top', monthDiffTop)
      console.log('left', monthDiffLeft)
      for (let i = 1; i <= this.dragDatas.length; i++) {
        // 获取拖动所在高度的索引
        if (i * 86 >= monthDiffTop) {
          index = i
          break
        }
      }
      if (index) {
        currentArr = this.dragDatas[index - 1].list
        console.log('currentArr', currentArr)
      }

      console.log('index', index)
      console.log('currentArr', currentArr)
      if (currentArr.length > 0) {
        // 添加排版前不是空数组
        if (monthDiffLeft + size < currentArr[0].left) {
          leftIndex = 0
        }
        for (let i = 1; i < currentArr.length; i++) {
          if (
            monthDiffLeft + size >= currentArr[i - 1].left + currentArr[i - 1].width &&
            monthDiffLeft + size <= currentArr[i].left
          ) {
            leftIndex = i
          }
        }
      }
      console.log('leftIndex', leftIndex)
      // if (currentArr.length === 0 || leftIndex != -1 || (leftIndex === -1 && monthDiffLeft + size <= this.maxWidth.x )) { // 拖入到空排版的天
      if (
        leftIndex !== -1 ||
        (currentArr.length === 0 && leftIndex === -1 && monthDiffLeft + size <= this.maxWidth.x) ||
        (currentArr.length >= 0 &&
          leftIndex === -1 &&
          monthDiffLeft + size <= this.maxWidth.x &&
          monthDiffLeft >=
            currentArr[currentArr.length - 1].left + currentArr[currentArr.length - 1].width)
      ) {
        // 拖入到空排版的天
        startT = (monthDiffLeft * 1440) / this.maxWidth.x
        console.log('startT', startT)
        startH = parseInt(startT / 60)
        startM = startT / 60 - startH
        startM = Math.ceil(startM * 60)
        end = startH + 4
        console.log('startH', startH, 'startM', startM)

        if (this.teamItem.staffVoList.length > 0) {
          anchorIdList = this.teamItem.staffVoList.map(item => {
            return item.staffId
          })
        }
        console.log('anchorIdList', anchorIdList)
        const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
        const obj = {
          staffIdList: anchorIdList.length > 0 ? anchorIdList.join(',') : null,
          openId: this.openId,
          brandId,
          groupIdList: `${item.groupId}`,
          dateList: [
            {
              endTime: `${end >= 10 ? end : `0${end}`}:${startM >= 10 ? startM : `0${startM}`}`,
              startTime: `${startH >= 10 ? startH : `0${startH}`}:${
                startM >= 10 ? startM : `0${startM}`
              }`,
              schedulingStartDate: this.schedulingList[index - 1].date,
              schedulingEndDate: this.schedulingList[index - 1].date
            }
          ],
          repeatType: 0
        }
        this.addScheduling(obj)
      }
    },
    teamDragover(e) {
      // console.log('teamDragover', e)
      e.preventDefault()
    },
    // 获取可选排班人员
    getAllChoosePerson() {
      const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
      getChoosePerson({ brandId }).then(res => {
        if (res.code === 0) {
          this.choosePersonList = res.data
          this.choosePersonList.forEach(item => {
            item.userId = item.anchorId
          })
        }
      })
    },
    delPerson(id) {
      const index = this.chooseValue.indexOf(id)
      this.chooseValue.splice(index, 1)
    },
    handleClose() {
      this.modifyShow = false
    },
    // 查询运营组
    searchTeamList() {
      selectGroup(this.teamSearchForm).then(res => {
        this.teamList = res.data.dataList
      })
    },
    // 查询排班信息
    getSchedulingList() {
      selectStaffScheduling(this.schedulingForm).then(res => {
        if (res.code === 0) {
          this.schedulingList = res.data
          this.$nextTick(() => {
            this.$refs.monthWarpper.scrollTo(0, this.monthScroll.top)
            setTimeout(() => {
              this.$refs.monthWarpper.scrollTo(0, this.monthScroll.top)
            })
          })
          this.LoadingShow = false
        }
      })
    },
    selectSchedulingByRoomId(item) {
      this.openId = item.openId
      this.schedulingForm.openId = item.openId
      this.getSchedulingList()
      this.getRoomSiteList()
      this.$nextTick(() => {
        this.$refs.monthWarpper.scrollTop = this.monthScroll.top
      })
    },
    // 修改排班信息
    updateSchedulingById(data, type) {
      if (type !== 'move') {
        data.startTime = this.thirdLeftText
        data.endTime = this.thirdRightText
      }
      selectStaffSchedulingInfo(data.staffSchedulingId)
        .then(res => {
          if (res.code === 0) {
            const result = res.data
            let schedulingEndDate = this.formatDate(result.endDate)
            if (this.offsetWidth > 0) {
              // 跨天
              const time = new Date(result.endDate)
              time.setDate(time.getDate() + 1)
              schedulingEndDate = this.formatDate(time)
            }
            const obj = {
              staffList:
                result.staffSchedulingListVos.map(item => item.staffId).length > 0
                  ? result.staffSchedulingListVos.map(item => item.staffId).join(',')
                  : '',
              startTime: data.startTime,
              endTime: data.endTime,
              staffSchedulingId: data.staffSchedulingId,
              schedulingStartDate: this.formatDate(result.startDate),
              schedulingEndDate,
              repeatType: result.repeatType,
              applyType: 0
            }
            // 查询排班是否冲突
            getStaffConflictList(obj).then(res => {
              if (res.data.length === 0) {
                this.handleUpdateScheduling({
                  staffSchedulingId: data.staffSchedulingId,
                  applyType: 0,
                  repeatType: result.repeatType,
                  endTime: data.endTime,
                  schedulingEndDate: data.schedulingEndDate,
                  schedulingStartDate: data.schedulingStartDate,
                  startTime: data.startTime
                })
              } else {
                this.updateData = data
                this.clashList = res.data
                this.clashModal = true
              }
            })
          }
        })
        .finally(() => {
          this.offsetWidth = 0
        })
    },
    handleUpdateScheduling(data) {
      data.applyType = 0 // 拖动修改 默认仅当前排班
      this.LoadingShow = true
      this.modifyShow = false
      updateStaffScheduling({ ...data, openId: this.openId })
        .then(res => {
          if (res.code === 0) {
            ElMessage.success('修改排班成功')
          } else {
            this.LoadingShow = false
          }
        })
        .catch(() => {
          this.LoadingShow = false
        })
        .finally(() => {
          this.clashModal = false
          this.getSchedulingList()
        })
    },
    // 添加排班
    addScheduling(data) {
      if (!this.openId) {
        return ElMessage.warning('请先添加直播间')
      }
      this.LoadingShow = true
      addStaffScheduling(data)
        .catch(() => {
          this.LoadingShow = false
        })
        .finally(() => {
          this.getSchedulingList()
        })
    },
    // 删除排班
    delScheduling(id, type) {
      deleteStaffScheduling({
        staffSchedulingId: id,
        applyType: type
      })
        .then(res => {
          this.LoadingShow = true
          if (res.code === 0) {
            this.getSchedulingList()
          } else {
            this.getSchedulingList()
            this.LoadingShow = false
          }
        })
        .catch(() => {
          this.LoadingShow = false
          this.getSchedulingList()
        })
    },

    // 查询月排班信息
    changeMonth(val) {
      this.isNowMonth = false
      const dataArr = format(val, 'yyyy-MM').split('-')
      this.schedulingForm.year = dataArr[0]
      this.schedulingForm.month = dataArr[1]
      this.monthTips = parseInt(dataArr[1]) - 1
      this.LoadingShow = true
      this.getSchedulingList()
      this.getRoomSiteList()
    },
    // 获取已直播的时间信息
    getRoomSiteList() {
      console.log('获取直播间信息')
      // this.$api.calcData.getRoomSiteList(this.schedulingForm).then(res => {
      //   if (res.success) {
      //     const arr = res.data
      //     this.calcSiteList(arr)
      //     // if (arr.length > 0) {
      //     //   this.calcSiteList(arr)
      //     // }
      //   }
      // })
    },
    calcSiteList(arr) {
      const newArr = []
      if (arr.length > 0) {
        arr.forEach((item, index) => {
          const obj = {}
          obj.list = []
          if (item.roomSiteVos.length > 0) {
            item.roomSiteVos.forEach((row, index1) => {
              const obj1 = {}
              obj1.startTime = row.startTime
              obj1.endTime = row.endTime
              obj1.paySum = row.paySum
              const starTime = row.startTime.split(':')
              const startTotal = parseInt(starTime[0]) * 60 + parseInt(starTime[1])
              obj1.left = (startTotal * this.maxWidth.x) / 1440
              const endTime = row.endTime.split(':')
              const endToatl = parseInt(endTime[0]) * 60 + parseInt(endTime[1])
              const diff = endToatl - startTotal
              obj1.width = (diff * this.maxWidth.x) / 1440
              obj.list[index1] = obj1
            })
          }
          newArr[index] = obj
        })
        this.siteList = newArr
      } else {
        this.siteList = []
      }
      console.log('siteList', this.siteList)
    },
    // 获取当月排班
    getNowMonthScheduling() {
      this.LoadingShow = false
      this.isNowMonth = true
      this.schedulingForm.year = ''
      this.schedulingForm.month = ''
      this.monthValue = ''
      this.getSchedulingList()
    },
    // 修改排班开始日期
    startDateChange(value) {
      console.log('value', value)
      this.anchorForm.startDate = value
    },
    // 修改排班结束日期
    endDateChange(value) {
      this.anchorForm.endDate = value
    },
    formatDate(time) {
      const now = new Date(time)
      const year = now.getFullYear()
      let month = now.getMonth() + 1
      let day = now.getDate()
      month = month >= 10 ? month : `0${month}`
      day = day >= 10 ? day : `0${day}`
      return `${year}-${month}-${day}`
    },
    handleSubmit(type) {
      if (this.currentType !== 0 && !this.repeatModal) {
        this.repeatTitle = 1
        this.repeatModal = true
        return
      }
      this.applyType = type
      const obj = {
        staffList: this.chooseValue.length > 0 ? this.chooseValue.join(',') : '',
        startTime: this.anchorForm.startTime,
        endTime: this.anchorForm.endTime,
        staffSchedulingId: this.id,
        schedulingStartDate: this.formatDate(this.anchorForm.startDate),
        schedulingEndDate: this.formatDate(this.anchorForm.endDate),
        repeatType: this.anchorForm.repeatType,
        applyType: this.applyType
      }
      // 只要时间修改 applyType:0
      for (const key in this.copyDate) {
        if (this.copyDate[key] !== obj[key]) {
          obj.applyType = 0
        }
      }
      // 查询排班是否冲突
      getStaffConflictList(obj).then(res => {
        if (res.data.length === 0) {
          obj.applyType = this.applyType
          this.handleUpdate(obj)
        } else {
          this.clashList = res.data
          this.clashModal = true
        }
      })
    },
    handlerOk() {
      if (!this.updateData) {
        const obj = {
          userIdList: this.chooseValue.length > 0 ? this.chooseValue.join(',') : '',
          startTime: this.anchorForm.startTime,
          endTime: this.anchorForm.endTime,
          confirmStatus: this.anchorForm.isSure,
          staffSchedulingId: this.id,
          schedulingStartDate: this.formatDate(this.anchorForm.startDate),
          schedulingEndDate: this.formatDate(this.anchorForm.endDate),
          repeatType: this.anchorForm.repeatType,
          applyType: this.applyType
        }
        this.handleUpdate(obj)
      } else {
        this.handleUpdateScheduling(this.updateData)
      }
    },
    handleUpdate(obj) {
      this.modifyShow = false
      updateStaffScheduling({ ...obj, openId: this.openId }).then(res => {
        if (res.code === 0) {
          this.clashModal = false
          this.anchorForm.startTime = ''
          this.anchorForm.endTime = ''
          this.anchorForm.list = []
          this.anchorForm.isSure = 0
          this.getSchedulingList()
        } else {
          this.modifyShow = true
        }
      })
    },
    handleCancel() {
      this.clashModal = false
      if (this.updateData) {
        this.updateData = null
        this.getSchedulingList()
      }
    },
    hideRedDel() {
      // 隐藏删除, 线
      this.moveLineOffset.show = false
      this.moveLineOffset.nextDayShow = false
      this.redDel.show = false
      this.redDel.row = 0
    },
    itemMouse(diffObj) {
      this.hideRedDel()
      // 隐藏线
      this.moveLineOffset.show = false
      // 隐藏移动三角
      this.thirdShow = false
      let changeIndex = -1
      // const before = null
      // const next = null
      const { x, row, index, offset } = diffObj
      const self = this.dragDatas[row].list[index]
      const currentArr = this.dragDatas[row].list
      if (x + self.width < currentArr[0].left) {
        changeIndex = 0
      }
      for (let i = 1; i < currentArr.length; i++) {
        const before = currentArr[i - 1]
        if (before.width + before.left <= x && x + self.width <= currentArr[i].left) {
          changeIndex = i
        }
      }
      // if (x < 0 && Math.abs(x) >= self.width / 3 || x >= this.maxWidth.x - self.width + self.width /5) {
      if (x < 0 && Math.abs(x) >= this.maxWidth.x / 25 / 2) {
        if (self.repeatType !== 0) {
          this.currentData = self.id
          console.log('this.currentData', this.currentData, self)
          this.repeatTitle = 0
          this.repeatModal = true
        } else {
          this.delScheduling(self.id, 0)
        }
        return
      }
      // if (x < 0 && Math.abs(x) < self.width / 3 || (x + self.width > this.maxWidth.x && (x + self.width < this.maxWidth.x + self.width / 5))) {
      if ((x < 0 && Math.abs(x) <= this.maxWidth.x / 25 / 2) || x + self.width > this.maxWidth.x) {
        // alert(1)
        this.getSchedulingList()
        return
      }
      // return

      if (index === 0 && currentArr.length === 1) {
        if (x >= 0 && x + self.width <= this.maxWidth.x) {
          const startTotalSeconds = (1440 * x) / this.maxWidth.x
          const startH = parseInt(startTotalSeconds / 60)
          const startM = parseInt((startTotalSeconds / 60 - startH) * 60)
          const SH = startH >= 10 ? startH : `0${startH}`
          const SM = startM >= 10 ? startM : `0${startM}`
          const endTotalSeconds = (1440 * (x + self.width)) / this.maxWidth.x
          const endH = parseInt(endTotalSeconds / 60)
          const endM = parseInt((endTotalSeconds / 60 - endH) * 60)
          const EH = endH >= 10 ? endH : `0${endH}`
          const EM = endM >= 10 ? endM : `0${endM}`
          const obj = {
            staffSchedulingId: self.id,
            startTime: `${SH}:${SM}`,
            endTime: `${EH}:${EM}`,
            schedulingStartDate: this.dragDatas[row].date,
            schedulingEndDate: this.dragDatas[row].date
          }
          this.updateSchedulingById(obj)
          return
        } else {
          this.getSchedulingList()
          return
        }
      }
      if (currentArr.length > 1) {
        if (index === 0) {
          if (
            x + offset.width >= currentArr[1].left &&
            x + offset.width <= currentArr[1].left + currentArr[1].width
          ) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: this.calcRealTime(currentArr[1].left - offset.width),
              endTime: currentArr[1].startTime,
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
        if (index > 0 && index < currentArr.length - 1) {
          if (
            x >= currentArr[index - 1].left &&
            x <= currentArr[index - 1].left + currentArr[index - 1].width
          ) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: currentArr[index - 1].endTime,
              endTime: this.calcRealTime(
                currentArr[index - 1].left + currentArr[index - 1].width + offset.width
              ),
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
          if (
            x + offset.width >= currentArr[index + 1].left &&
            x + offset.width <= currentArr[index + 1].left + currentArr[index + 1].width
          ) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: this.calcRealTime(currentArr[index + 1].left - offset.width),
              endTime: currentArr[index + 1].startTime,
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
        if (index === currentArr.length - 1) {
          if (
            x >= currentArr[index - 1].left &&
            x <= currentArr[index - 1].left + currentArr[index - 1].width
          ) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: currentArr[index - 1].endTime,
              endTime: this.calcRealTime(
                currentArr[index - 1].left + currentArr[index - 1].width + offset.width
              ),
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
      }
      if (currentArr.length > 1) {
        if (index === 0) {
          if (x + offset.width < currentArr[1].left) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: this.calcRealTime(x),
              endTime: this.calcRealTime(x + offset.width),
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
        if (index > 0 && index < currentArr.length - 1) {
          const before = currentArr[index - 1]
          const next = currentArr[index + 1]
          if (x > before.left + before.width && x + offset.width < next.left) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: this.calcRealTime(x),
              endTime: this.calcRealTime(x + offset.width),
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
        if (index === currentArr.length - 1) {
          const before = currentArr[index - 1]
          if (x > before.left + before.width && x + offset.width < this.maxWidth.x) {
            const obj = {
              staffSchedulingId: self.id,
              startTime: this.calcRealTime(x),
              endTime: this.calcRealTime(x + offset.width),
              schedulingStartDate: this.dragDatas[row].date,
              schedulingEndDate: this.dragDatas[row].date
            }
            this.updateSchedulingById(obj)
            return
          }
        }
      }
      if (changeIndex !== -1) {
        const obj = {
          staffSchedulingId: self.id,
          startTime: this.calcRealTime(x),
          endTime: this.calcRealTime(x + offset.width),
          schedulingStartDate: this.dragDatas[row].date,
          schedulingEndDate: this.dragDatas[row].date
        }
        this.updateSchedulingById(obj)
        return
      }
      if (
        changeIndex === -1 &&
        x + offset.width >
          currentArr[currentArr.length - 1].left + currentArr[currentArr.length - 1].width &&
        x + offset.width < this.maxWidth.x
      ) {
        // 放置最后一个
        // alert(6)
        const obj = {
          staffSchedulingId: self.id,
          startTime: this.calcRealTime(x),
          endTime: this.calcRealTime(x + offset.width),
          schedulingStartDate: this.dragDatas[row].date,
          schedulingEndDate: this.dragDatas[row].date
        }
        this.updateSchedulingById(obj)
        return
      }
      this.getSchedulingList()
    },
    leftMove(diffObj) {
      console.log('leftmove===========')
      // 左控制按钮 x<0往左 x>0往右
      let before = null
      this.timeLineShow = false
      this.timeLineData = '00:00'
      this.timeLineDiff = 0
      // 隐藏线
      this.moveLineOffset.show = false
      this.moveingActiveHours = []
      const { x, row, index, offset } = diffObj
      const self = this.dragDatas[row].list[index]
      if (index !== 0) {
        before = this.dragDatas[row].list[index - 1]
      }
      // let before = this.dragDatas[row].list[index - 1]
      console.log('before', before)
      console.log('x', x, 'row', row, 'index', index, 'offset', offset)
      const diffX = offset.left + x
      console.log('diffX', diffX)
      const totalSeconds = (1440 * diffX) / this.maxWidth.x
      const startH = parseInt(totalSeconds / 60)
      // let startM = Math.ceil((totalSeconds / 60 - startH) * 60)
      const startM = parseInt((totalSeconds / 60 - startH) * 60)
      console.log('H', startH, 'M', startM)
      const H = startH >= 10 ? startH : `0${startH}`
      const M = startM >= 10 ? startM : `0${startM}`
      const obj = {
        staffSchedulingId: self.id,
        // startTime: `${H}:${M}`,
        startTime:
          Math.abs(x) === offset.leftMaxMove ? (before ? before.endTime : '00:00') : `${H}:${M}`,
        endTime: self.endTime,
        schedulingStartDate: this.dragDatas[row].date,
        schedulingEndDate: this.dragDatas[row].date
      }
      console.log('obj', obj)
      this.updateSchedulingById(obj, 'move')
    },
    rightMove(diffObj) {
      // 右控制按钮 x<0往左 x>0往右
      this.timeLineShow = false
      this.timeLineData = '00:00'
      this.timeLineDiff = 0
      // 隐藏线
      this.moveLineOffset.show = false
      const { x, nextL, row, index, offset } = diffObj
      console.log('x', x, 'nextL', nextL, 'row', row, 'index', index, 'offset', offset)
      const self = this.dragDatas[row].list[index]
      // let diffX = offset.left + offset.width + x
      let diffX = null
      if (nextL > 0) {
        diffX = nextL
      } else {
        diffX = offset.left + offset.width + x
      }
      console.log('diffX', diffX)
      const totalSeconds = (1440 * diffX) / this.maxWidth.x
      const startH = parseInt(totalSeconds / 60)
      // let startM = Math.ceil((totalSeconds / 60 - startH) * 60)
      const startM = parseInt((totalSeconds / 60 - startH) * 60)
      console.log('H', startH, 'M', startM)
      const H = startH >= 10 ? startH : `0${startH}`
      const M = startM >= 10 ? startM : `0${startM}`
      const obj = {
        staffSchedulingId: self.id,
        startTime: self.startTime,
        endTime: `${H}:${M}`,
        schedulingStartDate: this.dragDatas[row].date,
        schedulingEndDate: nextL > 0 ? this.dragDatas[row + 1].date : this.dragDatas[row].date
      }
      this.updateSchedulingById(obj, 'move')
    },
    sizeTobody(ele) {
      let totallLeft = null
      let totalTop = null
      let par = ele.offsetParent
      totallLeft += ele.offsetLeft
      totalTop += ele.offsetTop
      while (par) {
        totallLeft += par.clientLeft
        totalTop += par.clientTop
        totallLeft += par.offsetLeft
        totalTop += par.offsetTop
        par = par.offsetParent
      }
      return { left: totallLeft, top: totalTop }
    },
    updateCardInfo(id, item) {
      this.currentType = item.repeatType
      // 隐藏线和框
      this.moveLineOffset.show = false
      this.thirdShow = false
      this.id = id
      this.chooseValue = []
      this.getAllChoosePerson()
      selectStaffSchedulingInfo(id).then(res => {
        if (res.code === 0) {
          const result = res.data
          this.anchorForm.startTime = result.time.split('~')[0]
          this.anchorForm.endTime = result.time.split('~')[1]
          this.anchorForm.startDate = result.startDate
          this.anchorForm.endDate = result.endDate
          this.copyDate.startTime = result.time.split('~')[0]
          this.copyDate.endTime = result.time.split('~')[1]
          this.copyDate.schedulingStartDate = result.startDate
          this.copyDate.schedulingEndDate = result.endDate
          this.chooseValue = result.staffSchedulingListVos.map(item => {
            return item.staffId
          })
          this.anchorForm.list = result.staffSchedulingListVos
          this.anchorForm.repeatType = result.repeatType

          this.modifyShow = true
        }
      })
    },
    toAddTeam() {
      this.$router.push({ path: '/team-manage' })
    },
    // 导出
    async handleExport() {
      if (!this.openId) {
        return ElMessage.warning('请先添加直播间')
      }
      this.isShow = !this.isShow
      const res = await schedulingExport({
        openId: this.openId,
        year: this.schedulingForm.year,
        month: this.schedulingForm.month
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.ms-excel'
      }) // 2.获取请求返回的response对象中的blob 设置文件类型，这里以excel为例
      const url = window.URL.createObjectURL(blob) // 3.创建一个临时的url指向blob对象
      // 4.创建url之后可以模拟对此文件对象的一系列操作，例如：预览、下载
      const a = document.createElement('a')
      a.href = url
      // a.download = '批量导出主播排班.xlsx'
      const month = parseInt(this.schedulingForm.month)
      a.download = `${month < 10 ? '0' + month : month}月排班规划批量导出-${format(
        new Date(),
        'yyyy-MM-dd'
      )}.xlsx`
      a.click()
      // 5.释放这个临时的对象url
      window.URL.revokeObjectURL(url)
      this.isShow = !this.isShow
    }
  }
}
</script>

<style lang="scss" scoped>
.scheduling_layout {
  height: calc(100vh - 112px);
}

.flex {
  display: flex;
}

.line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warp {
  flex-wrap: wrap;
}

.col {
  flex-direction: column;
}

.just-center {
  justify-content: center;
}

.just-b {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.m-left-1 {
  margin-left: -1px;
}

.m-left-20 {
  margin-left: 20px;
}

.m-top-14 {
  margin-top: 14px;
}

.m-bottom-16 {
  margin-bottom: 16px;
}

.m-bottom-20 {
  margin-bottom: 20px;
}

.two-hidden {
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.c-333 {
  color: red;
  width: 18px;
}

.scheduling-calendar {
  position: relative;
  min-height: 100%;
  // padding: 19px 10px 19px  15px;
  padding: 19px 10px 0px 15px;
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
}

.s-tabs-warpper {
  position: relative;

  // height: 40px;
  // border-bottom: 1px solid #DCDFE6;
  .tabs-item {
    // width: 104px;
    position: relative;
    padding: 0 20px;
    max-width: 200px;

    // overflow: hidden;
    .item-text {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    line-height: 40px;
    margin-bottom: -1px;
    text-align: center;
    font-size: 16px;
    background: #f7f8fa;
    border: 1px solid #dcdfe6;

    .item-mask {
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 100%;
      height: 2px;
      z-index: 10;
      background: #fff;
    }

    &:hover {
      color: $theme_color;
    }

    &.active {
      color: $theme_color;
      background: #fff;
      font-weight: 550;
    }

    &:nth-child(1) {
      border-radius: 4px 0px 0px 0px;
    }

    &:last-child {
      border-radius: 0px 4px 0px 0px;
    }
  }

  .tabs1 {
    flex: 1;
    height: 81px;
    overflow: hidden;
    overflow-y: auto;
    margin-right: 15px;
  }

  .p-tabs-item {
    // flex: 1;
    // width: 15%;
    width: 200px;
    cursor: pointer;
    padding: 8px 12px;
    margin-bottom: 10px;
    margin-right: 10px;
    // border: 1px solid $theme_color;
    border-radius: 4px;
    background: #f7f8fa;
    overflow: hidden;
    &.add-btn {
      background: rgba(102, 71, 255, 0.1);
      color: #6647ff;
      justify-content: center;
    }

    @media screen and(max-width: 1440px) {
      margin-right: 6px;
      width: 196px;

      &:nth-child(4n) {
        margin-right: 0;
      }
    }

    @media screen and (min-width: 1441px) and(max-width: 1680px) {
      margin-right: 8px;

      &:nth-child(5n) {
        margin-right: 0;
      }
    }

    .item-tab-img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      // overflow: hidden;
      // img {
      //   width: 100%;
      //   height: 100%;
      // }
    }

    .item-tab-title {
      flex: 1;
      overflow: hidden;
      margin-left: 8px;

      .item-tab-title-sub {
        color: #303133;
        width: 100%;
        overflow: hidden;
      }

      .item-tab-title-text {
        color: #909399;
      }
    }

    &.m-right-10 {
      margin-right: 10px;
    }

    &.active {
      border: 1px solid $theme_color;

      .item-tab-title-sub {
        color: $theme_color;
      }
    }
  }

  .select-time {
    // position: absolute;
    // top: 50%;
    // z-index: 1000;
    // transform: translateY(-50%);
    // right: 0;
    width: 184px;
    :deep(.date_picker) {
      .el-icon {
        height: inherit;
      }
    }
  }
}

.time-select-warpper {
  margin-top: 19px;
  margin-bottom: 15px;
  width: 100%;
  height: 80px;
  padding-left: 25px;
  background: #f2f3f5;

  .now {
    margin-right: 16px;
  }
}

.calendar-date-warpper {
  position: relative;

  .show-data {
    position: absolute;
    top: 41px;
    left: 0px;
    background: tan;
    height: 114px;
    width: 100px;
    z-index: 11;
  }

  .date-header {
    height: 41px;
    // background: #EDF2FE;
    border: 1px solid #eee;
    position: relative;

    .header-item {
      flex: 1;
      font-size: 13px;

      .sub {
        position: relative;
        left: -31%;

        &.active {
          color: $theme_color;
        }
      }
    }

    .time-line {
      position: absolute;
      top: -20px;
      left: 39px;

      .time-data {
        font-size: 11px;
        color: #fff;
        margin-bottom: 2px;
        transform: translateX(-9px);
        padding: 1px 5px;
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.4);
      }

      .time-tips {
        width: 14px;
        box-sizing: border-box;
        border-style: solid;
        border-width: 7px;
        border-color: #6647ff transparent transparent transparent;
      }
    }

    .lefthird {
      position: absolute;
      top: 0;
      width: 12px;
      box-sizing: border-box;
      border-style: solid;
      border-width: 6px;
      border-color: #6647ff transparent transparent transparent;
    }

    .righthird {
      position: absolute;
      top: 0;
      left: 50px;
      width: 12px;
      box-sizing: border-box;
      border-style: solid;
      border-width: 6px;
      border-color: #6647ff transparent transparent transparent;
    }

    .header-line {
      position: absolute;
      left: 0;
      height: 3px;
      background: $theme_color;
      width: 200px;
      bottom: 0;
    }

    .next-header-line {
      position: absolute;
      left: 700px;
      height: 3px;
      background: $theme_color;
      width: 200px;
      bottom: 0;
    }
  }

  .data-time {
    margin-top: 5px;
    font-size: 18px !important;
    color: #6647ff !important;
  }

  .month-data {
    color: #909399;
  }

  .month-warpper {
    height: calc(100vh - 280px);
    position: relative;
    user-select: none;
    overflow: hidden;
    overflow-y: auto;
    // background: #f6f6f6;
    border-left: 1px solid #eee;

    .line-left {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 1px;
      height: 100px;
      border-left: 1px dashed #6647ff;
    }

    .line-right {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100px;
      border-left: 1px dashed #6647ff;
    }

    .line-bg {
      position: absolute;
      top: 0;
      width: 100px;
      // z-index: 9;
      position: absolute;
      background: rgba(102, 71, 255, 0.1);
      // z-index: 100;
    }

    .line-bg-next-day {
      position: absolute;
      top: 0;
      z-index: 1;
      background: rgba(102, 71, 255, 0.1);
    }

    .del-red {
      position: absolute;
      left: 0;
      background: #ff0b00;
      z-index: 100;
      height: 90px;
      top: 0;
    }

    .month-item {
      // height: 90px;
      height: 86px;
      position: relative;

      .b-right {
        border-right: 1px solid #eee;
        border-bottom: 1px solid #eee;
      }

      .line {
        height: 100%;
      }

      .line-sub {
        div {
          font-size: 12px;
          color: #909399;
        }
      }

      .line-25 {
        flex: 1;
        height: 100%;

        &:nth-child(1) {
          background: #fff;
        }
      }

      .month-content {
        position: absolute;
        z-index: 99;
        left: 4%;
        top: 0;
        height: 100%;

        // background: #ccc;
        .item {
          position: absolute;
          top: 0;
          left: 0;
          width: 180px;
          height: 114px;
          background: #ccc;

          &.p1 {
            left: 500px;
          }
        }

        .live-over-time {
          // position: absolute;
          background: #6647ff;
          // width: 200px;
          height: 4px;
          border-radius: 2px;
          // top: 86px;
          opacity: 0.5;
          z-index: 1000;
        }
      }
    }
  }

  .data-base {
    position: absolute;
    height: 90px;
    opacity: 0.5;
    background: #eee;
    top: 0;
    // left: 44px;
    z-index: 100;
  }
}

.calendar-left {
  flex: 1;
  user-select: none;

  &.active {
    opacity: 0;
    z-index: -100;
  }
}

.calendar-right {
  position: relative;
  width: 198px;
  padding: 5px 8px;
  // margin-left: 10px;
  // border: 1px solid #DBDEE0;
  border-left: 10px solid #fbfbfb;
  // height: 100vh;
  overflow: hidden;
  overflow-y: auto;

  .team-search-warpper {
    height: 100%;

    .team-warpper {
      user-select: none;
      margin-top: 20px;

      .team-item {
        padding: 8px 0 8px 5px;
        position: relative;
        cursor: pointer;
        margin-bottom: 15px;
        border-radius: 4px;
        box-shadow: 0px 1px 4px 0px rgba(4, 16, 36, 0.1);

        .team-left {
          position: relative;
          width: 48px;
          height: 48px;
          margin-right: 20px;
          background: skyblue;
          border-radius: 5px;

          .mask {
            width: 48px;
            height: 48px;
            background: #fff;
            position: absolute;
            opacity: 0;
            top: 0;
            left: 0;
          }
        }

        .team-right {
          flex: 1;
          padding-right: 6px;
          overflow: hidden;

          .team-name {
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .a-count {
            color: #909399;
          }
        }
      }
    }
  }

  .team-no-data {
    height: calc(100% - 32px);

    // position: absolute;
    // top: 0;
    // left: 0;
    // bottom: 0;
    // right: 0;
    // background: #fff;
    // z-index: 90;
    .no-team-img {
      width: 136px;

      img {
        width: 136px;
      }
    }

    .no-team-text {
      font-size: 14px;
      color: #606266;
    }

    .to-add-team {
      cursor: pointer;
      margin-top: 56px;
      width: 120px;
      height: 32px;
      background: $theme_color;
      color: #fff;

      .add {
        font-size: 14px;
        margin-right: 10px;
      }
    }
  }
}

.modify-item {
  margin-bottom: 15px;
  &.h {
    :deep(.el-icon) {
      height: inherit;
    }
  }
  .item-label {
    // margin-top: 20px;
    color: #333;
    font-size: 14px;
    line-height: 20px;
    .strong {
      &.h {
        opacity: 0;
      }
      position: relative;
      top: 5px;
      font-size: 20px;
      font-weight: 600;
      color: #e50002 !important;
    }
    .at-time {
      margin-left: 5px;
    }
  }
  .item-desc {
    // transform: translateY(-14px);
    &.mt {
      position: relative;
      top: 12px;
    }
    &.t14 {
      transform: translateY(-10px);
    }
    color: #b7b7b7;
    .line {
      margin: 0 13px;
    }
    .is-sure {
      color: #333;
    }
    .choose {
      color: #333;
      font-size: 14px;
      width: 96px;
      height: 32px;
      text-align: center;
      line-height: 32px;
      border-radius: 2px;
      border: 1px solid #d8d8d8;
    }
    .choose-item {
      background: #f7f7f7;
      margin-top: 10px;
      width: 480px;
      max-height: 500px;
      overflow: hidden;
      overflow-y: auto;
      //  padding-bottom: 20px;
    }
    .choose-header {
      padding: 14px 10px;
      border-bottom: 1px solid #e7e7e7;
    }
    .choose-label {
      color: #333;
    }
    .choose-icon {
      color: #333;
      width: 20px;
      font-size: 14px;
      .creat-icon {
        font-size: 16px;
      }
    }
    .creat-close {
      font-size: 16px;
    }
    .choose-text {
      color: #333;
    }
  }
  .choose-people {
    padding: 5px;
    .del_icon {
      cursor: pointer;
      > .iconfont {
        font-size: 12px;
      }
    }
  }
  .c-people-j {
    .c-people-j-img {
      width: 36px;
      height: 36px;
      border-radius: 18px;
    }
    .c-people-j-name {
      color: #606266;
      max-width: 100px;
      font-size: 14px;
      margin: 0 8px;
    }
    .c-people-j-job {
      .j-base {
        padding: 0 8px;
        border-radius: 9px;
        height: 16px;
        line-height: 16px;
        font-size: 10px;
      }
      .j1 {
        color: #6647ff;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
      }
      .j2 {
        color: #27c24e;
        background: rgba(80, 222, 44, 0.2);
        border: 1px solid #50de2c;
      }
      .j3 {
        color: #eba417;
        background: rgba(250, 173, 20, 0.2);
        border: 1px solid rgba(250, 173, 20, 0.19);
      }
    }
  }
}

.icon-d-rol {
  cursor: pointer;
}

.team-desc-box {
  position: absolute;
  // top: 50%;
  // left: 50%;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
  z-index: 99;
  background: #fff;

  .size {
    width: 16px;
    height: 16px;
    color: #6647ff;
  }

  width: 379px;
  padding: 20px 14px;

  .normal {
    width: 100%;
    font-size: 14px;
    line-height: 16px;
    color: #303133;
    margin-left: 5px;
  }

  .time-people {
    margin-top: 20px;
  }

  .people-desc-sub {
    font-size: 13px;
    color: #303133;
  }

  .people-many {
    margin-top: 8px;
  }

  .people-item {
    width: 46.5%;
    margin-right: 5px;
    margin-bottom: 10px;

    &.m-bottom-0 {
      margin-bottom: 0 !important;
    }

    .people-avatar {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #6647ff;
      color: #fff;
    }

    .people-name {
      margin: 0px 8px;
      max-width: 60px;
      color: #606266;
    }

    .people-job {
      height: 16px;
      line-height: 16px;
      font-size: 10px;
      padding: 0 8px;
      border-radius: 9px;
      max-width: 50px;

      &.j1 {
        color: #6647ff;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
      }

      &.j2 {
        color: #27c24e;
        background: rgba(80, 222, 44, 0.2);
        border: 1px solid #50de2c;
      }

      &.j3 {
        color: #eba417;
        background: rgba(250, 173, 20, 0.2);
        border: 1px solid rgba(250, 173, 20, 0.19);
      }
    }
  }

  .error {
    width: 16px;
    color: #ff0b00;
  }

  .err-message {
    margin-left: 21px;
    margin-top: 7px;

    .err-item {
      color: #909399;
      font-size: 12px;
    }
  }

  .right-tips {
    position: absolute;
    top: 0;
    right: -1px;
    width: 70px;

    .right-tips-img {
      width: 100%;
    }
  }
}

@keyframes transSalcIn {
  0% {
    opacity: 0.3;
    transform: scale(0.5);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes transSalcOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.7);
  }

  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

.team-enter-active,
.team-enter-to {
  animation: transSalcIn 0.3s;
}

.team-leave-active {
  animation: transSalcOut 0.3s;
}

.blue {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.green {
  background: #dcf8d5;
  border: 1px solid #bff2b2;
  color: #27c24e;
}

.red {
  background: #ffcecc;
  border: 1px solid #ffa5a2;
  color: #ff0b00;
}

.orange {
  background: #feefd0;
  border: 1px solid #fde3ac;
  color: #faad14;
}

.purple {
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  color: #722ed1;
}

.pink {
  background: #fff0f6;
  border: 1px solid #ffadd2;
  color: #eb2f96;
}

.cyan {
  background: #e6fffb;
  border: 1px solid #9aebe3;
  color: #13c2c2;
}

.people-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #6647ff;
  color: #fff;
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #c1c1c1;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: #fff;
}

@keyframes shanke {
  from {
    transform: translateY(-1px);
  }

  to {
    transform: translateY(1px);
  }
}

.del-a {
  animation: shanke 0.4s cubic-bezier(0.77, -0.71, 0.41, 1.71) infinite;
}

.no-limits {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  z-index: -1;
  opacity: 0;

  &.active {
    z-index: 110;
    opacity: 1;
  }

  img {
    width: 226px;
  }

  .limits-text {
    font-size: 14px;
    color: #606266;
  }
}

.main {
  display: flex;
  height: 500px;
  .left,
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    .title {
      line-height: 24px;
      margin-bottom: 12px;
    }
    .selected_wrapper {
      flex: 1;
      overflow-y: auto;
      .selected_item {
        margin-bottom: 8px;
        .el-checkbox {
          width: 100%;
          height: 36px;
          :deep(.el-checkbox__label) {
            width: 100%;
            .info {
              display: flex;
              align-items: center;
              width: 80%;
              .photo {
                width: 36px;
                height: 36px;
                border-radius: 50%;
              }
              .name {
                margin-left: 8px;
              }
            }
          }
        }
        &:hover {
          background-color: #eee;
        }
      }
    }
  }
}
</style>
