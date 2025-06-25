<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="title"
      width="820px"
      custom-class=" task_init_dialog"
    >
      <div class="addLevel_content">
        <el-form :model="form" :rules="rules" ref="ruleForm" label-width="84px">
          <el-form-item label="级别：" prop="level">
            <div class="level_num">Level {{ form.level }}</div>
          </el-form-item>
          <el-form-item label="名称：" prop="name">
            <el-input
              style="width: 220px"
              @blur="retEmitEmj($event, 'name')"
              v-model.trim="form.name"
              placeholder="等级名称"
              maxlength="5"
              :disabled="disabledContent"
            ></el-input>
          </el-form-item>
          <el-form-item label="成长任务：" prop="tasks" class="hide_require">
            <div>
              &nbsp;
              <el-button type="primary" v-if="!disabledContent" @click="addTask">
                添加任务
              </el-button>
            </div>
            <div class="task_table">
              <xm_table :data="form.tasks" :showPage="false" :maxTableHeight="400">
                <el-table-column label="排序" width="80">
                  <template #default="scope">
                    {{ scope.$index < 9 ? '0' + (scope.$index + 1) : scope.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="任务类型" width="120">
                  <template #default="{ row }">
                    {{
                      GROWTH_TASK_TYPE.getCN(row.taskType)
                        ? GROWTH_TASK_TYPE.getCN(row.taskType).label + '任务'
                        : '--'
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="taskName"
                  label="任务名称"
                  width="120"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column label="任务指标">
                  <template #default="{ row }">
                    <template v-if="row.taskTarget">
                      <div
                        class="detail_target"
                        v-for="(x, y) in row.taskTarget.split(',')"
                        :key="y"
                      >
                        {{ x }}
                      </div>
                    </template>
                    <div v-else>--</div>
                  </template>
                </el-table-column>
                <el-table-column label="任务奖励" width="120">
                  <template #default="{ row }">
                    {{
                      row.taskReward ? (row.taskReward === '0金币' ? '--' : row.taskReward) : '--'
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="right" header-align="right">
                  <template #default="scope">
                    <div class="btn_box" v-if="!disabledContent">
                      <template v-if="scope.$index > 0">
                        <el-link
                          type="primary"
                          :disabled="disabledContent"
                          @click="moveUp(scope.$index)"
                        >
                          上移
                        </el-link>

                        <p class="one_btn_line"></p>
                      </template>
                      <template v-if="scope.$index < form.tasks.length - 1">
                        <el-link
                          type="primary"
                          :disabled="disabledContent"
                          @click="moveDown(scope.$index)"
                        >
                          下移
                        </el-link>
                        <p class="one_btn_line"></p>
                      </template>
                      <el-link
                        type="primary"
                        :disabled="disabledContent"
                        @click="delTask(scope.$index)"
                      >
                        删除
                      </el-link>
                    </div>
                  </template>
                </el-table-column>
              </xm_table>
              <!-- 支持拖拽 -->
              <!-- <div class="table_box">
                <div class="table_th">
                  <div class="th1">排序</div>
                  <div class="th2">任务类型</div>
                  <div class="th3">任务名称</div>
                  <div class="th4">任务指标</div>
                  <div class="th5">任务奖励</div>
                  <div class="th6">操作</div>
                </div>

                <template v-if="form.tasks.length > 0">
                  <div class="max_table">
                    <draggable
                      v-model="form.tasks"
                      group="addLevel_task"
                      item-key="taskId"
                      animation="300"
                    >
                      <template #item="{ element, index }">
                        <div class="table_content">
                          <div class="th1">
                            {{ index < 9 ? '0' + (index + 1) : index + 1 }}
                          </div>
                          <div class="th2">
                            {{
                              GROWTH_TASK_TYPE.getCN(element.taskType)
                                ? GROWTH_TASK_TYPE.getCN(element.taskType).label + '任务'
                                : '--'
                            }}
                          </div>
                          <div class="th3" style="line-height: 1.3">
                            {{ element.taskName }}
                          </div>
                          <div class="th4">
                            <template v-if="element.taskTarget">
                              <div
                                class="detail_target"
                                style="line-height: 1.3"
                                v-for="(x, y) in element.taskTarget.split(',')"
                                :key="y"
                              >
                                {{ x }}
                              </div>
                            </template>
                            <div v-else>--</div>
                          </div>
                          <div class="th5">
                            {{
                              element.taskReward
                                ? element.taskReward === '0金币'
                                  ? '--'
                                  : element.taskReward
                                : '--'
                            }}
                          </div>
                          <div class="th6">
                            <div class="btn_box" v-if="!disabledContent">
                              <template v-if="index > 0">
                                <el-link
                                  type="primary"
                                  :disabled="disabledContent"
                                  @click="moveUp(index)"
                                >
                                  上移
                                </el-link>

                                <p class="one_btn_line"></p>
                              </template>
                              <template v-if="index < form.tasks.length - 1">
                                <el-link
                                  type="primary"
                                  :disabled="disabledContent"
                                  @click="moveDown(index)"
                                >
                                  下移
                                </el-link>
                                <p class="one_btn_line"></p>
                              </template>
                              <el-link
                                type="primary"
                                :disabled="disabledContent"
                                @click="delTask(index)"
                              >
                                删除
                              </el-link>
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </template>
                <div v-else class="none_table">暂无数据</div>
              </div> -->
            </div>
          </el-form-item>
          <el-form-item label="等级奖励：" prop="rewardList" class="hide_require">
            <div class="check_list">
              <div class="one_check flex_box" v-for="(item, index) in form.rewardList" :key="index">
                <el-checkbox v-model="item.check" :disabled="disabledContent">
                  {{ item.label }}
                </el-checkbox>
                <div class="flex_box" v-if="item.id === 1">
                  <el-input
                    style="width: 120px; margin-right: 8px"
                    @input="checkInt($event)"
                    v-model.trim="item.value"
                    placeholder=""
                    :disabled="disabledContent"
                  ></el-input>
                  金币
                </div>
                <el-input
                  v-if="item.id === 2"
                  style="width: 304px"
                  @blur="retEmitEmj($event, 'reward')"
                  v-model.trim="item.value"
                  placeholder="等级奖励说明"
                  maxlength="20"
                  :disabled="disabledContent"
                ></el-input>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer" v-if="!disabledContent">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <addTaskToLevelDialog
      v-if="showDialog.show"
      :addDialog="showDialog"
      @chooseTask="chooseTask"
    ></addTaskToLevelDialog>
  </div>
</template>
<script setup>
// import draggable from 'vuedraggable'
import addTaskToLevelDialog from './addTaskToLevel_dialog.vue'
import { GROWTH_TASK_TYPE } from '@/utils/dictionary/task'
import { saveUserGrowthLevelConfig } from '@/api/market/growth_system.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const ruleForm = ref()
const dialog = ref()
const title = toRef(props.addDialog, 'title')
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const disabledContent = toRef(props.addDialog, 'disabledContent')
const form = ref({
  goldReward: null, // 金币奖励
  level: null, // 等级
  levelId: null, //	等级id, 更新时必传
  name: '', // 等级名称
  note: '', // 备注(其他奖励)
  taskId: [], // 任务ID
  tasks: [1, 2, 3], // 任务详情
  rewardList: []
})
const rules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  rewardList: [
    {
      required: true,
      validator: () => {
        return new Promise((resolve, reject) => {
          let stu = ''
          form.value.rewardList.forEach((x, i) => {
            if (x.check && !x.value) {
              stu = i === 0 ? '请设置金币奖励' : '请设置其他奖励'
            }
          })
          if (stu) {
            reject(new Error(stu))
          } else {
            resolve()
          }
        })
      }
    }
  ]
}
const showDialog = ref({
  show: false
})
// 检查是否有表情包
function retEmitEmj(e, type) {
  const reg = /[^\u4e00-\u9fa5a-zA-Z0-9/,]/gi
  const value = e.target.value.replace(reg, '')
  if (type === 'reward') {
    form.value.rewardList[1].value = value
  } else {
    form.value.name = value
  }
}
// 输入框转为正整数
function checkInt(value) {
  const MAX_NUM = 99999999
  const MIN_NUM = 1
  const _value =
    parseInt(value) > MAX_NUM ? MAX_NUM : parseInt(value) < MIN_NUM ? '' : parseInt(value)
  form.value.rewardList[0].value = isNaN(_value) ? '' : _value
}
// 添加任务
const addTask = throttle(() => {
  console.log('添加任务')
  showDialog.value = {
    show: true,
    level: form.value.level,
    oldSelect: form.value.tasks
  }
}, 500)
// 删除任务
const delTask = throttle(index => {
  console.log('删除任务')
  form.value.tasks.splice(index, 1)
}, 500)
// 上移任务
const moveUp = throttle(index => {
  console.log('上移任务')
  const list = JSON.parse(JSON.stringify(form.value.tasks))
  if (index !== 0) {
    list[index] = list.splice(index - 1, 1, list[index])[0]
  } else {
    list.push(list.shift())
  }
  form.value.tasks = list
}, 500)
// 下移任务
const moveDown = throttle(index => {
  console.log('下移任务')
  const list = JSON.parse(JSON.stringify(form.value.tasks))
  if (index !== list.length - 1) {
    list[index] = list.splice(index + 1, 1, list[index])[0]
  } else {
    list.unshift(list.splice(index, 1)[0])
  }
  form.value.tasks = list
}, 500)
const emits = defineEmits(['updateList'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      // 设置任务ID
      if (form.value.tasks && form.value.tasks.length > 0) {
        form.value.taskId = form.value.tasks.map(x => x.taskId)
      } else {
        form.value.taskId = []
      }
      // 设置等级奖励
      form.value.rewardList.forEach((x, i) => {
        let value = null
        if (x.check && x.value) {
          value = x.value
        }
        if (i === 0) {
          form.value.goldReward = value
        } else {
          form.value.note = value || ''
        }
      })
      form.value.levelName = form.value.name
      console.log('form,', form.value)
      const reqData = JSON.parse(JSON.stringify(form.value))
      reqData.tasks = []
      loading.value = true
      saveUserGrowthLevelConfig(reqData)
        .then(res => {
          if (res.code === 0) {
            emits('updateList')
            dialog.value.handleClose()
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 500)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
function chooseTask(e) {
  console.log('选中的任务', e)
  form.value.tasks = e
}
function init() {
  if (props.addDialog.type === 'edit') {
    const info = JSON.parse(JSON.stringify(props.addDialog.levelInfo))
    console.log(info)
    if (!info.tasks) {
      info.tasks = []
    }
    form.value = info
    form.value.rewardList = [
      {
        id: 1,
        check: !!info.goldReward,
        label: '金币奖励：',
        value: info.goldReward ? info.goldReward : null
      },
      {
        id: 2,
        check: !!info.note,
        label: '其他奖励：',
        value: info.note
      }
    ]
  } else {
    form.value = {
      goldReward: null, // 金币奖励
      level: props.addDialog.level, // 等级
      levelId: null, //	等级id, 更新时必传
      name: '', // 等级名称
      note: '', // 备注(其他奖励)
      taskId: [], // 任务ID
      tasks: [], // 任务详情
      rewardList: [
        { id: 1, check: false, label: '金币奖励：', value: '' },
        {
          id: 2,
          check: false,
          label: '其他奖励：',
          value: ''
        }
      ]
    }
  }
}
init()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.addLevel_content {
  padding: 20px 16px 0;
  .level_num {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }
  .flex_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .task_table {
    margin-top: 20px;
    margin-left: -84px;
    width: calc(100% + 84px);
    .table_box {
      .th1 {
        width: 80px;
        padding-left: 20px;
      }
      .th2,
      .th3,
      .th5 {
        padding-left: 20px;
        width: 120px;
      }
      .th4 {
        width: calc(100% - 600px);
        padding-left: 20px;
      }
      .th6 {
        text-align: right;
        width: 160px;
        padding-right: 20px;
      }
      .table_th {
        width: 100%;
        height: 58px;
        background: #f7f8fa;
        font-size: 14px;
        font-weight: 500;
        color: #333333;
        line-height: 20px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        border-bottom: 1px solid rgba(128, 128, 128, 0.1);
      }
      .table_content {
        width: 100%;
        height: 58px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        color: #303313;
        border-bottom: 1px solid rgba(128, 128, 128, 0.1);
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
.one_check + .one_check {
  margin-top: 20px;
}
:deep(.hide_require .el-form-item__label:before) {
  display: none;
}
.max_table {
  max-height: 480px;
  overflow-y: auto;
}
.none_table {
  width: 100%;
  height: 60px;
  text-align: center;
  line-height: 60px;
  color: #909399;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
</style>
