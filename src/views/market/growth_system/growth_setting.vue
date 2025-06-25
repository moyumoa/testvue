<template>
  <div class="growth_setting">
    <!-- 开关 -->
    <div class="growth_top">
      <div class="switch_box">
        <el-switch
          :before-change="beforeChangeSwitch"
          :loading="$data.talentSwitch.loading"
          @change="getSwitchFun"
          v-model="$data.talentSwitch.value"
          inline-prompt
          :width="45"
          active-text="开"
          inactive-text="关"
        ></el-switch>
        <div class="switch_left">
          {{ $data.talentSwitch.value ? '成长体系已开启，成长路径可视化' : '成长体系未开启' }}
          <!-- popper-class="tooltip-class" -->
          <el-tooltip placement="right">
            <template #content>
              <div class="tip_box">
                <div class="tip1">成长体系规则解读：</div>
                <div class="tip2">
                  1.成长体系最多支持设置10个等级，且首次开启后无法再调整等级个数
                </div>
                <div class="tip2">
                  2.成长体系中的任务具有先后逻辑关系，成员在完成一个任务后才可参与下一个任务
                </div>
                <div class="tip2">3.Level 1作为所有员工的默认等级，不可设置等级奖励</div>
                <div class="tip2">4.金币规则对整个成长体系生效</div>
              </div>
            </template>
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 8px"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="top_right">
        <el-button
          style="margin-right: 16px"
          type="primary"
          @click="addLevel"
          v-if="!$data.talentSwitch.value && $data.firstOpen"
        >
          新增等级
        </el-button>
        <div class="top_right--tips" @click="openDialog">
          金币规则设置
          <el-icon>
            <i-arrow-right-bold />
          </el-icon>
        </div>
      </div>
    </div>
    <!-- 成长体系开关和规则设置 -->
    <el-tabs class="tab_box hide_underline" v-model="$data.chooseTab" @tab-click="onChangeTab">
      <el-tab-pane v-for="(tab, i) in $data.tabList" :key="i" :label="tab.label" :name="tab.value">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 等级列表 -->
    <div class="level_box" v-if="$data.chooseTabTrue === 'growthSetting'">
      <!-- 表格 -->
      <xm_table v-loading="$data.tableLoading" :data="$data.list" :showPage="false">
        <el-table-column label="级别" min-width="90">
          <template #default="scope">Level {{ scope.row.level }}</template>
        </el-table-column>
        <el-table-column label="名称" min-width="120">
          <template #default="{ row }">{{ row.name || '--' }}</template>
        </el-table-column>
        <el-table-column label="等级任务" min-width="300">
          <template #default="scope">
            <!-- 设置了任务 -->
            <div class="table_task_box" v-if="scope.row.tasks && scope.row.tasks.length > 0">
              <div class="one_task" v-for="(item, index) in scope.row.tasks" :key="index">
                <!-- trigger="click" -->
                <el-tooltip
                  effect="light"
                  placement="bottom-start"
                  popper-class="taskDetail_tooltip"
                >
                  <template #content>
                    <!-- 任务详情简介 -->
                    <div class="task_detail_box">
                      <div class="task_detail_top">
                        <img
                          class="detail_type"
                          :src="GROWTH_TASK_TYPE.getCN(item.taskType).icon"
                        />
                        {{ GROWTH_TASK_TYPE.getCN(item.taskType).label }}任务
                        <span class="detail_num">{{ numChange(index + 1) }}</span>
                      </div>
                      <div class="task_detail_bottom">
                        <div class="detail_title line-hidden2">
                          {{ item.taskName }}
                        </div>
                        <template v-if="item.taskTarget">
                          <div
                            class="detail_target"
                            v-for="(x, y) in item.taskTarget.split(',')"
                            :key="y"
                          >
                            {{ x }}
                          </div>
                        </template>
                        <div
                          class="detail_target"
                          v-if="item.taskReward && item.taskReward !== '0金币'"
                        >
                          奖励
                          <span>
                            {{
                              item.taskReward.indexOf('金币') > -1
                                ? item.taskReward.split('金币')[0]
                                : item.taskReward
                            }}
                          </span>
                          金币
                        </div>
                      </div>
                    </div>
                  </template>
                  <div :class="['task_type', `task_color${item.taskType}`]">
                    {{ GROWTH_TASK_TYPE.getCN(item.taskType).label.substring(0, 2) }}
                  </div>
                </el-tooltip>

                <img
                  class="task_next"
                  src="https://tagvv-1256030678.file.myqcloud.com/20220808hs9z4.png"
                />
              </div>
              <img
                class="task_over"
                src="https://tagvv-1256030678.file.myqcloud.com/2022080878fd6.png"
              />
            </div>
            <div style="color: #d40000" v-else>未设置</div>
          </template>
        </el-table-column>
        <el-table-column label="等级奖励" min-width="180">
          <template #header>
            <div class="column_header">
              <span>等级奖励</span>
              <el-tooltip placement="top" :style="{ 'margin-left': '4px' }">
                <template #content>完成该等级下所有任务后发放奖励并升入下一等级</template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <div class="level_award" v-if="scope.row.goldReward || scope.row.note">
              <p v-if="scope.row.goldReward">金币奖励：{{ scope.row.goldReward }}金币</p>
              <p v-if="scope.row.note">其他奖励：{{ scope.row.note }}</p>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <!--  -->
        <el-table-column
          fixed="right"
          label="操作"
          min-width="120"
          align="right"
          header-align="right"
        >
          <template #default="scope">
            <div class="btn_box">
              <el-link
                type="primary"
                @click="
                  changeLevel(
                    scope.row,
                    $data.talentSwitch.value ? '查看' : '修改',
                    scope.$index + 1
                  )
                "
              >
                {{ $data.talentSwitch.value ? '查看' : '修改' }}
              </el-link>
              <template v-if="scope.$index > 0 && !$data.talentSwitch.value && $data.firstOpen">
                <p class="one_btn_line"></p>
                <el-link type="primary" @click="delLevel(scope.row, scope.$index)">删除</el-link>
              </template>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 成长任务 -->
    <growthTask v-if="$data.chooseTabTrue === 'growthTask'"></growthTask>
    <addLevelDialog
      v-if="$data.addDialog.show"
      :addDialog="$data.addDialog"
      @updateList="getLevelList"
    ></addLevelDialog>
    <!-- 金币类型 -->
    <el-dialog v-model="showGoldDialog" width="450px" title="管理金币类型">
      <label class="dialog-label">金币类型</label>
      <el-select
        placeholder="请选择"
        v-model="goldTypeValue"
        :disabled="$data.talentSwitch.value"
        class="input-text-align"
      >
        <el-option
          v-for="item in goldTypeList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          :disabled="item.isValid === 0"
        ></el-option>
      </el-select>
      <div class="dialog-tips">注：金币类型变更后不影响历史已发放金币</div>
      <template #footer>
        <el-button @click="showGoldDialog = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import growthTask from '../growth_task/index.vue'
import addLevelDialog from './components/addLevel_dialog.vue'
import { GROWTH_TASK_TYPE } from '@/utils/dictionary/task'
import { useStore } from 'vuex'
import { throttle } from '@/utils/tools'
import {
  isEnableGrowth,
  enableUserGrowth,
  userGrowthLevel,
  deleteGrowthLevel
} from '@/api/market/growth_system.js'
import { getGoldList, updateConfig } from '@/api/market/gold_exchange_gifts.js'
import { ElMessage } from 'element-plus'
import { getConfigurationByKey } from '@/api/market/operation_setting.js'

import { useRoute, useRouter } from 'vue-router'
const store = useStore()

const route = useRoute()
const router = useRouter()
const $data = reactive({
  firstOpen: true, // 是否是首次开启  开关接口返回undefined就是
  talentSwitch: {
    value: false,
    loading: false
  }, // 开关
  tableLoading: false,
  list: [], // 等级列表
  addDialog: {
    show: false,
    type: null // add / edit
  },
  chooseTab: 'growthSetting', // tab要回显得数据
  chooseTabTrue: 'growthSetting', // 具体显示那个模块
  tabList: [
    {
      label: '等级列表',
      value: 'growthSetting'
    },
    {
      label: '成长任务',
      value: 'growthTask'
    }
  ]
})
const menuOfKeepAlive = inject('$menuOfKeepAlive')
function onChangeTab() {
  menuOfKeepAlive('set')
  const query = {
    type: $data.chooseTab
  }
  router.push({ path: route.path, query })
}
const message = inject('$message')
// --开关的操作--
// ----获取开关状态
function getSwitchFun() {
  isEnableGrowth().then(res => {
    if (res.code === 0) {
      $data.talentSwitch.value = res.data
      $data.firstOpen = res.data === null || res.data === undefined
      store.commit('user/setEmployeeGrowthSystemState', $data.talentSwitch.value)
    }
  })
}

// ----修改开关状态
const $confirm = inject('$confirm')

function beforeChangeSwitch() {
  return new Promise(resolve => {
    // 初次开启就弹窗提醒。(任务未设置过+开关关闭)
    if (!$data.talentSwitch.value && $data.firstOpen) {
      $confirm({
        title: '系统提醒',
        content: `目前成长等级为${$data.list.length}个层级，首次开启后将不可再更改，是否确认开启成长体系？`,
        success() {
          changeSwitch(resolve)
        },
        fail() {
          return resolve(false)
        }
      })
    } else {
      changeSwitch(resolve)
    }
  })
}

function changeSwitch(resolve) {
  $data.talentSwitch.loading = true
  if (!$data.talentSwitch.value) {
    if ($data.list && $data.list.length > 0) {
      let stu = true
      $data.list.forEach((x, i) => {
        if (i === 0 || i < $data.list.length - 1) {
          const task = x.tasks || []
          if (task.length === 0) {
            stu = false
          }
        }
      })

      if (!stu) {
        $data.talentSwitch.loading = false
        message.warning('请设置等级任务')

        return resolve(false)
      }
    } else {
      $data.talentSwitch.loading = false
      message.warning('请设置成长等级')

      return resolve(false)
    }
  }

  enableUserGrowth({
    outsiderState: $data.talentSwitch.value ? 0 : 1
  })
    .then(res => {
      $data.talentSwitch.loading = false
      if (res.code === 0) {
        message.success('操作成功')
        $data.firstOpen = false
        return resolve(true)
      } else {
        return resolve(false)
      }
    })
    .catch(() => {
      $data.talentSwitch.loading = false
      return resolve(false)
    })
}

// --等级列表的操作--
// ----获取等级列表
function getLevelList() {
  $data.tableLoading = true
  userGrowthLevel({
    isDetail: true
  })
    .then(res => {
      if (res.code === 0) {
        if (res.data && res.data.length > 0) {
          $data.list = res.data
          store.commit('user/setEmployeeGrowthLevelList', res.data)
        }
      }
      $data.tableLoading = false
    })
    .catch(() => {
      $data.tableLoading = false
    })
}

// ----新增等级
const addLevel = throttle(() => {
  if ($data.list && $data.list.length < 10) {
    //  弹出新增的弹窗
    $data.addDialog = {
      type: 'add',
      show: true,
      title: '新增等级',
      level: $data.list.length + 1,
      disabledContent: false
    }
  } else {
    message.warning('最多可新增10个等级')
  }
}, 500)
// ----修改等级
const changeLevel = throttle((e, title, index) => {
  if ($data.firstOpen) {
    e.level = index
  }
  $data.addDialog = {
    type: 'edit',
    show: true,
    title: title + '等级',
    levelInfo: e,
    disabledContent: $data.talentSwitch.value
  }
}, 500)
// ----删除等级
const delLevel = throttle((e, index) => {
  $confirm({
    title: '系统提醒',
    content: '确认删除？',
    success() {
      deleteGrowthLevel({
        levelId: e.levelId
      }).then(res => {
        if (res.code === 0) {
          message.success('删除成功')
          getLevelList()
        }
      })
    }
  })
  // }
}, 500)

// 数字转换
function numChange(e) {
  if (parseFloat(e).toString() === 'NaN') {
    return e
  } else {
    return e < 10 ? '0' + e : e
  }
}

onMounted(() => {
  $data.chooseTabTrue = route.query.type || 'growthSetting'
  $data.chooseTab = route.query.type || 'growthSetting'
})
onActivated(() => {
  $data.chooseTabTrue = route.query.type || 'growthSetting'
  $data.chooseTab = route.query.type || 'growthSetting'
  getSwitchFun()
  getLevelList()
})
// 金币类型选择
const showGoldDialog = ref(false)
const goldTypeValue = ref(null)
const goldTypeList = ref([])
const openDialog = () => {
  showGoldDialog.value = true
  Promise.all([getGoldList({}), getConfigurationByKey({ key: 'user_growth_gold_type' })]).then(
    resultList => {
      const [res1, res2] = resultList
      if (res1?.code === 0) {
        goldTypeList.value = res1.data || []
        goldTypeList.value.sort(item => (item?.isValid === 0 ? 1 : -1))
      }
      if (res2?.code === 0) {
        goldTypeValue.value = res2.data?.value ? res2.data?.value : goldTypeList.value[0].id
      }
    }
  )
}
// 成长体系金币类型确定
const onConfirm = () => {
  if ($data.talentSwitch.value) {
    showGoldDialog.value = false
    return
  }
  updateConfig({
    configKey: 'user_growth_gold_type',
    configValue: goldTypeValue.value
  }).then(res => {
    if (res?.code === 0) {
      showGoldDialog.value = false
      ElMessage.success('设置成功')
    }
  })
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.growth_setting {
  width: 100%;
  // 总设置
  .growth_top {
    border-radius: 4px;
    margin-bottom: 16px;
    width: 100%;
    height: 72px;
    padding: 0 24px;
    background: #fff;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .top_right {
      display: flex;
      align-items: center;
      cursor: default;
      font-size: 14px;
      line-height: 20px;

      .top_right--tips {
        display: flex;
        align-items: center;
        color: $theme_color;
        margin-left: 0px;
        cursor: pointer;
      }
    }
  }
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 4px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  :deep .el-tabs__nav-wrap::after {
    height: 0 !important;
  }

  .switch_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .switch_left {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      margin-left: 16px;
      line-height: 32px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
  }

  .level_box {
    padding: 24px;
    background: #fff;
    border-radius: 4px;
    .level_top {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 22px 0 16px;

      .top_left {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 26px;
        padding-right: 12px;

        span {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
          margin-left: 12px;
        }
      }
    }

    .table_task_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;

      .one_task {
        margin: 5px 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;

        .task_type {
          cursor: pointer;
          min-width: 32px;
          height: 18px;
          border-radius: 2px;
          padding: 0 4px;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
        }

        .task_color1 {
          color: #ed6a0c;
          background: #fff5ed;
          border: 1px solid #f1924e;
        }

        .task_color2 {
          background: #ffe7ec;
          border: 1px solid #fe4065;
          color: #fe4065;
        }

        .task_color5 {
          background: #f1f7ff;
          border: 1px solid #2b88ff;
          color: #2b88ff;
        }

        .task_next {
          margin: 0 6px;
          width: 16px;
          height: 12px;
          object-fit: cover;
        }
      }

      .task_over {
        width: 20px;
        height: 20px;
        object-fit: cover;
      }
    }

    .btn_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;

      .one_btn_line {
        width: 1px;
        height: 14px;
        background: #dcdee0;
        margin: 0 10px;
      }
    }
  }
}

.taskDetail_tooltip {
  .task_detail_box {
    padding: 3px 5px;
    width: 250px;

    .task_detail_top {
      width: 100%;
      border-bottom: 1px solid #dcdee0;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      color: #909399;
      line-height: 24px;
      padding-bottom: 10px;

      .detail_type {
        width: 20px;
        height: 20px;
        object-fit: cover;
        margin-right: 8px;
      }

      .detail_num {
        margin-left: 6px;
        // min-width: 32px;
        height: 18px;
        padding: 0 9px 0 8px;
        background: #f6f8fa;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 500;
        color: #909399;
        line-height: 18px;
        text-align: center;
      }
    }

    .task_detail_bottom {
      .detail_title {
        margin: 12px 0;

        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
      }

      .detail_target {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;

        span {
          color: #ef7e2d;
        }
      }

      .detail_target + .detail_target {
        margin-top: 8px;
      }
    }
  }
}

.dialog-label {
  margin-right: 10px;
  color: #323233;
}

.dialog-tips {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  line-height: 18px;
}
:deep .column_header {
  display: flex;
  align-items: center;
}
</style>
