/*
 * @Author: tao sang sang
 * @Date: 2022-03-23 19:44:48
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-06-28 09:46:41
 * @Description: 新建任务操作相关
 */
import { isEmpty, throttle, checkAuditTime, isNotEmpty } from '@/utils/tools.js'
import { useRouter, useRoute } from 'vue-router'
import {
  createNewTask,
  getTaskConfig,
  getTaskInfo,
  getTaskInfoView,
  updateTask
} from '@/api/market/task'
import { TASK_STATUS } from '@/utils/dictionary/task'
import { getCkeyOfCvalue } from './task_tools'
import { ElMessageBox } from 'element-plus'
import { useStore } from 'vuex'
// pageSource==growth 代表是从成长任务过来的。
export function createTask(origin, taskForm, dialog, topList, pageSource, emits) {
  const store = useStore()
  const router = useRouter()
  const route = useRoute()
  const message = inject('$message')
  // 如果是新版抖音[开启了全局的扫码发布]，那任务的扫码发布配置项隐藏
  const dyVersion = computed(() => store.state.user.dyVersion)
  const KOCInfo = computed(() => store.state.app.KOCInfo)
  const isAdmin = computed(() => store.state.user.isAdmin)
  const taskTypeInfo = reactive({
    list: [
      {
        label: '基本设置',
        value: 'basicSetting',
        show: true
      },
      {
        label: '挂载设置',
        value: 'mountSetting',
        show: false
      },
      {
        label: '内容设置',
        value: 'videoSetting',
        show: false
      },
      {
        label: '任务要求',
        value: 'requirement',
        show: false
      },
      {
        label: '指标奖励',
        value: 'targetReward',
        show: true
      },
      {
        label: '分发设置',
        value: 'distribute',
        show: true
      },
      {
        label: '开启方式',
        value: 'taskOpenMethod',
        show: true
      },
      {
        label: '高级设置',
        value: 'advancedSetting',
        show: false
      }
    ],
    chooseType: 'basicSetting'
  })
  const data = reactive({
    isSave: false, // 是否保存了
    loading: true,
    startTime: null,
    endTime: null,
    isEdit: false, // 是否编辑
    disEdit: false, // 从任务审核进入就为true,禁用一切的编辑操作
    warningDialogVisible: false,
    warningInfo: {},
    taskId: null,
    type: 1, // 1 视频 2 直播 3 征集 4 学习 6 图文
    taskInfo: {
      goldTypeId: null,
      startTime: null,
      endTime: null
    },
    saving: false, // 正在保存
    disabled: false, // 禁止所有编辑
    basicDisabled: false, // 禁止基本信息编辑
    targetRewardDisabled: false, // 禁止任务指标编辑
    delivernum: 0,
    rules: {
      // 任务名称
      name: [
        {
          required: true,
          message: '请输入任务标题',
          trigger: 'blur'
        }
      ],
      // 日期
      date: [
        {
          required: true,
          validator: () => {
            return new Promise((resolve, reject) => {
              if (data.taskInfo.startTime && data.taskInfo.endTime) {
                if (
                  new Date(data.taskInfo.startTime).getTime() >
                  new Date(data.taskInfo.endTime).getTime()
                ) {
                  reject(new Error('结束时间需大于开始时间'))
                  return ``
                }
                resolve()
              } else {
                reject(new Error('请选择任务时间'))
              }
            })
          }
        }
      ],
      // 征集类型
      collect_type: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('base_set', 'collect_type', '选择')
          }
        }
      ],
      // 征集模板
      video_collect_template: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('base_set', 'video_collect_template', '选择')
          }
        }
      ],
      // 选择流水线
      choose_pipeline: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('base_set', 'choose_pipeline', '选择')
          }
        }
      ],
      // 流水线标签
      pipeline_lables: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('base_set', 'pipeline_lables', '选择')
          }
        }
      ],
      // 征集数
      collect_num: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('base_set', 'collect_num')
          }
        }
      ],
      video_duration_range: [
        {
          required: true,
          validator: () => {
            return new Promise((resolve, reject) => {
              if (!videoDuration.value) {
                reject(new Error('请设置视频长度'))
              } else {
                const _times = videoDuration.value.split(',')
                if (!_times[0]) {
                  reject(new Error('请设置视频长度最小值'))
                } else if (!_times[1]) {
                  reject(new Error('请设置视频长度最大值'))
                } else if (Number(_times[1]) < Number(_times[0])) {
                  reject(new Error('视频长度最大值需大于最小值'))
                } else {
                  resolve()
                }
              }
            })
          }
        }
      ],
      // 视频话题
      // video_topic: [
      //   {
      //     required: true,
      //     trigger: 'blur',
      //     validator: () => {
      //       return checkTaskFormRules('task_require', 'video_topic')
      //     }
      //   }
      // ],
      // 挂载标题
      mount_title: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('task_require', 'mount_title')
          }
        }
      ],
      // 学习内容
      learning_content: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('content_settings', 'learning_content', '选择')
          }
        }
      ],
      // 学习形式
      course_form: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('content_settings', 'course_form', '选择')
          }
        }
      ],
      // 学习-备注信息
      course_note: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('content_settings', 'course_note', '输入')
          }
        }
      ],
      // 作业课后开关
      // course_homework_open: [
      //   {
      //     required: true,
      //     validator: () => {
      //       return checkTaskFormRules('course_homework_config', 'course_homework_open', '选择')
      //     }
      //   }
      // ],
      // 作业类型
      course_homework_type: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('course_homework_config', 'course_homework_type', '选择')
          }
        }
      ],
      // 作业要求
      course_homework_requirement: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules(
              'course_homework_config',
              'course_homework_requirement',
              '输入'
            )
          }
        }
      ],
      // 作业是否必做
      course_homework_requirement_do: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules(
              'course_homework_requirement_do',
              'course_homework_type',
              '选择'
            )
          }
        }
      ],
      // 视频发布方式
      video_push_mode: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('video_set', 'video_push_mode', '选择')
          }
        }
      ],
      // 视频选择方式
      video_select_mode: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('video_set', 'video_select_mode', '选择')
          }
        }
      ],
      // 视频发布平台
      video_publish_platform: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('video_set', 'video_publish_platform', '选择')
          }
        }
      ],

      // 发布标题
      // publish_title_config: [
      //   {
      //     required: true,
      //     validator: () => {
      //       return new Promise((resolve, reject) => {
      //         if (publishTitleConfig.value === '2' && !videoTitle.value) {
      //           reject(new Error('请填写标题'))
      //         } else {
      //           resolve()
      //         }
      //       })
      //     }
      //   }
      // ],
      // 视频使用次数限制
      video_use_times_limit_switch: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              if (videoUseTimesLimitSwitch.value === '0') {
                resolve()
              } else {
                if (videoUseTimesLimit.value) {
                  const limitNum = parseInt(videoUseTimesLimit.value)
                  if (limitNum >= 1 && limitNum <= 5) {
                    resolve()
                  } else {
                    reject(new Error('请设置次数限制'))
                  }
                } else {
                  reject(new Error('请设置次数限制'))
                }
              }
              resolve()
            })
          }
        }
      ],
      // 任务指标
      target: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              let checkedNum = 0
              let isCheckViewingHours = false
              let isCheckGrade = false
              // console.log('type', data.taskInfo.type)
              // 遍历指标大类
              for (const groupIndex in data.taskInfo.targetConfigs) {
                // 指标大类
                const targetGroup = data.taskInfo.targetConfigs[groupIndex]
                // console.log('d', targetGroup)
                // 大类勾选但未设置指标
                if (targetGroup.isChecked || targetGroup.indeterminate) {
                  for (const rewardIndex in targetGroup.targetRwwards[0].rewards) {
                    const reward = targetGroup.targetRwwards[0].rewards[rewardIndex]
                    if (!reward.value) {
                      reject(new Error(`请设置${targetGroup.targetName}奖励${reward.typeName}`))
                      return
                    }
                  }
                  if (!targetGroup.children.filter(e => e.isChecked).length) {
                    reject(new Error(`请设置至少一项${targetGroup.targetName}`))
                    return
                  }
                }
                // 大类下的具体指标list
                const targetSubGroup = targetGroup.children
                // 遍历大类下具体指标
                for (const subGroupIndex in targetSubGroup) {
                  // 具体指标
                  const target = targetSubGroup[subGroupIndex]
                  // console.log(target, target.targetKey, courseHomeworkOpen.value, courseForm.value)
                  // 如果没有作业，那就不校验作业分数 // 如果是线下课程，那就不校验浏览时长
                  if (
                    (courseHomeworkOpen.value === '0' &&
                      target.targetKey === 'homework_grade_target') ||
                    (courseForm.value === '2' && target.targetKey === 'viewing_hours')
                  ) {
                    // console.log('cs ')
                  } else {
                    if (target.targetKey === 'viewing_hours' && target.isChecked) {
                      isCheckViewingHours = true
                    }
                    if (target.targetKey === 'homework_grade_target' && target.isChecked) {
                      isCheckGrade = true
                    }
                    if (target.isChecked) checkedNum++
                    // 具体指标的阶梯奖励
                    const ladderList = target.targetRwwards
                    // 遍历阶梯奖励
                    for (const ladderIndex in ladderList) {
                      // 指标阶梯奖励
                      const ladder = ladderList[ladderIndex]
                      const preLadder = ladderList[ladderIndex - 1]
                      // console.log(target.isChecked, Number(ladderIndex))
                      if (target.isChecked && Number(ladderIndex) !== 0) {
                        if (parseInt(ladder.cvalue) <= parseInt(preLadder.cvalue)) {
                          reject(new Error('您填写的指标数需高于上一级'))
                          return
                        }
                        //  else {
                        //   // 遍历奖励列表
                        //   for (const reIndex in ladder.rewards) {
                        //     // 具体奖励值item
                        //     const reward = ladder.rewards[reIndex]
                        //     if (reward.value <= preLadder.rewards[reIndex].value) {
                        //       reject(new Error('您填写的奖励数需高于上一级'))
                        //     }
                        //   }
                        // }
                      }
                      // 勾选指标但
                      if (target.isChecked) {
                        // 征集指标最大值不能高于设置的标签数
                        if (
                          ladder.cvalue &&
                          target.targetKey === 'collect_audit_success_count_target'
                        ) {
                          if (
                            Number(collectType.value) === 1 &&
                            ladder.cvalue > collectVideoNum.value
                          ) {
                            reject(new Error('征集指标数不能超过征集设置的征集数量'))
                            return
                          }
                          if (
                            Number(collectType.value) === 2 &&
                            ladder.cvalue > pipelineLables.value
                          ) {
                            reject(new Error('征集指标数不能超过选择的流水线标签数'))
                            return
                          }
                        }
                        // 未设置指标值 视频、图文指标支持从0开始 其余从1开始
                        if (
                          ([1, 6].includes(data.taskInfo.type) &&
                            !(
                              (typeof ladder.cvalue === 'number' ||
                                (typeof ladder.cvalue === 'string' && ladder.cvalue.length > 0)) &&
                              Number(ladder.cvalue) >= 0
                            )) ||
                          (![1, 6].includes(data.taskInfo.type) && !ladder.cvalue)
                        ) {
                          reject(new Error(`请设置${target.targetName}指标`))
                          return
                        }
                      }
                    }
                  }
                }
              }
              if (checkedNum === 0) {
                reject(new Error('请选择至少一项指标'))
              }
              if (courseForm.value === '1' && !isCheckViewingHours && data.taskInfo.type === 5) {
                reject(new Error('在线课程必须设置浏览时长哦'))
              }
              if (courseForm.value === '2' && !isCheckGrade && data.taskInfo.type === 5) {
                reject(new Error('请勾选作业分数该指标哦'))
              }
              resolve()
            })
          }
        }
      ],
      goldTypeId: [
        {
          required: true,
          trigger: 'change',
          message: '请选择金币类型'
        }
      ],
      multiJoinTarget: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              if (Number(multiJoinSet.value) === 1) {
                let num = null
                let gold = null
                data.taskInfo.targetConfigs.forEach(x => {
                  if (x.targetKey === 'multi_join_target') {
                    num = x.targetRwwards[0].cvalue
                    gold = x.targetRwwards[0].rewards[0].value
                  }
                })

                if (num && gold) {
                  console.log('totalJoinTimes.', totalJoinTimes.value, num)
                  if (
                    num &&
                    totalJoinTimes.value &&
                    (Number(num) < 2 || Number(num) > Number(totalJoinTimes.value))
                  ) {
                    reject(new Error('达成次数不能超过设置的重复参与次数'))
                  } else {
                    resolve()
                  }
                } else if (!num && !gold) {
                  resolve()
                } else {
                  reject(new Error('请设置完整重复参与指标奖'))
                }
              } else {
                resolve()
              }
            })
          }
        }
      ], // 重复参与指标奖
      // 分发人群
      deliverType: [
        {
          required: true,
          trigger: 'blur',
          validator: () => {
            return new Promise((resolve, reject) => {
              if (data.taskInfo.deliverType === 1 && !data.taskInfo.orgIds) {
                reject(new Error('请选择部门'))
              } else {
                resolve()
              }
            })
          }
        }
      ],
      // 分发人数
      deliverNum: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              if (!data.delivernum) {
                reject(new Error('请重新选择分发人群或指定矩阵号分组'))
              } else {
                resolve()
              }
            })
          }
        }
      ],
      // 倒计时通知
      countdown: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              if (data.taskInfo.countdown) {
                // 视频、直播、征集任务需要判断设置的时间是否在免打扰时间
                if (data.taskInfo.startTime || data.taskInfo.endTime) {
                  // 1、判断是否设置了结束时间
                  if (data.taskInfo.endTime) {
                    // 2、设置了，根据结束时间和任务结束前x小时，来换算大概是几点发消息
                    const sendTime = new Date(
                      new Date(data.taskInfo.endTime).getTime() -
                        data.taskInfo.countdown * 60 * 1000
                    )
                    console.log('发送时间', sendTime)
                    // 3、判断sendTime发送时间是否在8-22点内，是的话就不在免打扰时间段
                    if (checkAuditTime(sendTime, '8:00', '22:00')) {
                      // 4、判断是否有开始时间
                      if (data.taskInfo.startTime) {
                        // 5、判断sendTime发送时间是否在任务时间内,是的话就可以发送
                        const startTime = new Date(data.taskInfo.startTime).getTime()
                        console.log('发送时间和开始时间的time', sendTime.getTime() - startTime)
                        if (sendTime.getTime() - startTime > 0) {
                          resolve()
                        } else {
                          reject(new Error('当前发送时间不在任务时间范围内，请修改通知时间'))
                        }
                      } else {
                        resolve()
                      }
                    } else {
                      reject(new Error('当前发送时间在免打扰时间段：22:00-8:00内，请修改通知时间'))
                    }
                  } else {
                    // 2、没有设置直接通过
                    resolve()
                  }
                } else {
                  // 2、没有设置直接通过
                  resolve()
                }
              } else {
                resolve()
              }
            })
          }
        }
      ],
      // AI智能审核通过
      aiAuditPass: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              let auditSwitch = false
              let passMin = ''
              let passMax = ''
              let rejectMin = ''
              let rejectMax = ''
              data.taskInfo.infoConfigs.forEach(item => {
                if (item.ckey === 'video_intelligent_audit') {
                  auditSwitch = item.cvalue === '1'
                }
                if (item.ckey === 'video_intelligent_audit_pass' && item.cvalue) {
                  const tempData = JSON.parse(item.cvalue)
                  passMin = tempData.minValue
                  passMax = tempData.maxValue
                }
                if (item.ckey === 'video_intelligent_audit_reject' && item.cvalue) {
                  const tempData = JSON.parse(item.cvalue)
                  rejectMin = tempData.minValue
                  rejectMax = tempData.maxValue
                }
              })
              // console.log('直接通过',passMin,passMax,rejectMin,rejectMax,(passMin < rejectMax && rejectMin < passMax),passMin === rejectMin)
              if (auditSwitch) {
                if (isEmpty(passMin) || isEmpty(passMax)) {
                  reject(new Error('请设置合理分数范围'))
                }
                if (passMin > passMax) {
                  reject(new Error('请设置合理分数范围'))
                }
                // 判断两个区域是否重叠
                if ((passMin < rejectMax && rejectMin < passMax) || passMin === rejectMin) {
                  reject(new Error('分数区间重叠，请修改'))
                }
              }
              resolve()
            })
          }
        }
      ],
      aiAuditReject: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              let auditSwitch = false
              let passMin = ''
              let passMax = ''
              let rejectMin = ''
              let rejectMax = ''
              data.taskInfo.infoConfigs.forEach(item => {
                if (item.ckey === 'video_intelligent_audit') {
                  auditSwitch = item.cvalue === '1'
                }
                if (item.ckey === 'video_intelligent_audit_pass' && item.cvalue) {
                  const tempData = JSON.parse(item.cvalue)
                  passMin = tempData.minValue
                  passMax = tempData.maxValue
                }
                if (item.ckey === 'video_intelligent_audit_reject' && item.cvalue) {
                  const tempData = JSON.parse(item.cvalue)
                  rejectMin = tempData.minValue
                  rejectMax = tempData.maxValue
                }
              })
              //  console.log('直接拒绝',passMin,passMax,rejectMin,rejectMax,(passMin < rejectMax && rejectMin < passMax),passMin === rejectMin)
              if (auditSwitch) {
                if (isEmpty(rejectMin) || isEmpty(rejectMax)) {
                  reject(new Error('请设置合理分数范围'))
                }
                if (rejectMin > rejectMax) {
                  reject(new Error('请设置合理分数范围'))
                }
                // 判断两个区域是否重叠
                if ((passMin < rejectMax && rejectMin < passMax) || passMin === rejectMin) {
                  reject(new Error('分数区间重叠，请修改'))
                }
              }
              resolve()
            })
          }
        }
      ],
      taskGroup: [
        {
          required: true,
          message: '请选择任务形式',
          trigger: 'change'
        }
      ],
      joinLimitNum: [
        {
          required: true,
          trigger: 'change',
          validator: () => {
            return new Promise((resolve, reject) => {
              let joinLimitNum = null
              let joinLimitName = ''
              data.taskInfo.infoConfigs.forEach(x => {
                if (x.ckey === 'join_limit_num') {
                  joinLimitNum = x.cvalue ? parseInt(x.cvalue) : 0
                  joinLimitName = x.name
                }
              })
              // 如果为空，则校验失败
              if (isEmpty(joinLimitNum)) {
                reject(new Error(`请设置本次活动${joinLimitName || '参与人数上限'}`))
                return
              }
              if (!(joinLimitNum >= 1 && joinLimitNum <= 10000)) {
                reject(new Error(`请设置本次活动${joinLimitName || '参与人数上限'}`))
                return
              }
              resolve()
            })
          }
        }
      ],
      // 创意模板
      video_set_template: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('video_set', 'video_set_template', '选择')
          }
        }
      ],
      video_forward_conditions: [
        {
          required: true,
          validator: () => {
            return checkTaskFormRules('video_set', 'video_forward_conditions', '选择')
          }
        }
      ],
      chooseOrgId: [
        {
          required: true,
          message: '请选择数据归属',
          trigger: 'change'
        }
      ],
      // 任务开启方式
      isAutoStart: [
        {
          required: true,
          message: '请选择任务开启方式',
          trigger: 'change'
        }
      ]
    }
  })
  // // 获取填写的固定标题
  // const videoTitle = computed(() => {
  //   return getCkeyOfCvalue(data.taskInfo, 'video_set', 'video_title')
  // })
  // // 获取发布标题
  // const publishTitleConfig = computed(() => {
  //   return getCkeyOfCvalue(data.taskInfo, 'video_set', 'publish_title_config')
  // })

  // 视频、图文、直播任务-重复参与[视频、图文都是上传模式才有、直播是放在任务要求里 其余都在视频设置里]
  const multiJoinSet = computed(() => {
    return (
      getCkeyOfCvalue(data.taskInfo, 'video_set', 'multi_join_set') ||
      getCkeyOfCvalue(data.taskInfo, 'task_require', 'multi_join_set') ||
      0
    )
  })
  // 重复参与次数
  const totalJoinTimes = computed(() => {
    return (
      getCkeyOfCvalue(data.taskInfo, 'video_set', 'total_join_times') ||
      getCkeyOfCvalue(data.taskInfo, 'task_require', 'total_join_times') ||
      2
    )
  })
  // 视频使用次数限制开关
  const videoUseTimesLimitSwitch = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'video_set', 'video_use_times_limit_switch')
  })
  // 视频使用次数限制
  const videoUseTimesLimit = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'video_set', 'video_use_times_limit')
  })
  // 流水线标签数量
  const pipelineLables = computed(() => {
    const pipelineLables = getCkeyOfCvalue(data.taskInfo, 'base_set', 'pipeline_lables')
    return pipelineLables ? pipelineLables.split(',').length : 0
  })

  // 征集视频长度
  const videoDuration = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'base_set', 'video_duration_range')
  })

  // 征集视频数量
  const collectVideoNum = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'base_set', 'collect_num')
  })

  // 征集类型
  const collectType = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'base_set', 'collect_type')
  })

  // 征集方式
  // const collectMode = computed(() => {
  //   return getCkeyOfCvalue(data.taskInfo, 'base_set', 'collect_mode')
  // })

  // 学习形式
  const courseForm = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'content_settings', 'course_form')
  })
  // 课后作业开关
  const courseHomeworkOpen = computed(() => {
    return getCkeyOfCvalue(data.taskInfo, 'course_homework_config', 'course_homework_open')
  })
  function checkTaskFormRules(configKey, ckey, tipType = '输入') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const i in data.taskInfo.infoConfigs) {
          const config = data.taskInfo.infoConfigs[i]
          if (config.ckey === configKey) {
            const requirementList = config.children
            for (const k in requirementList) {
              const requirement = requirementList[k]
              if (requirement.ckey === ckey && !requirement.cvalue) {
                if (ckey === 'video_forward_conditions') {
                  reject(new Error(`请${tipType}${data.type === 6 ? '图文' : '视频'}`))
                } else {
                  let { name = '' } = requirement
                  if (data.type === 6) {
                    // 图文任务一些提示文案字段替换
                    const repalceKeyList = ['video_push_mode']
                    if (repalceKeyList.includes(requirement.ckey)) {
                      name = name.replace('视频', '图文')
                    }
                  }
                  reject(new Error(`请${tipType}${name}`))
                }
                return
              }
            }
          }
        }
        resolve()
      }, 0)
    })
  }
  // 抖音下载发布，图文任务要求和视频设置的顺序调换
  function changeCalendarList(type) {
    if (dyVersion.value === 3 && type === 6) {
      taskTypeInfo.list[2] = {
        label: '任务要求',
        value: 'requirement',
        show: false
      }
      taskTypeInfo.list[3] = {
        label: '内容设置',
        value: 'videoSetting',
        show: false
      }
    }
    // 图片与视频任务 显示高级设置 隐藏开启方式
    if ([1, 6].includes(type)) {
      // 隐藏开启方式
      taskTypeInfo.list.find(item => item.value === 'taskOpenMethod').show = false
      // 显示高级设置
      taskTypeInfo.list.find(item => item.value === 'advancedSetting').show = true
    }
  }
  function updateValidate(formKey) {
    taskForm.value.validateField(formKey)
  }

  // 获取各个模块距顶的距离
  function getOffsetTop() {
    nextTick(() => {
      if (origin === 'calendar') {
        if (document.querySelector(`#basicSettingDOM`)) {
          topList.basicSettingTop = document.querySelector(`#basicSettingDOM`).offsetTop
        }
        if (document.querySelector(`#mountSettingDOM`)) {
          topList.mountSettingTop = document.querySelector(`#mountSettingDOM`).offsetTop
        }
        if (document.querySelector(`#videoSettingDOM`)) {
          topList.videoSettingTop = document.querySelector(`#videoSettingDOM`).offsetTop
        }
        if (document.querySelector(`#targetRewardDOM`)) {
          topList.targetRewardTop = document.querySelector(`#targetRewardDOM`).offsetTop
        }
        if (document.querySelector(`#requirementDOM`)) {
          topList.requirementTop = document.querySelector(`#requirementDOM`).offsetTop
        }
        if (document.querySelector(`#distributeDOM`)) {
          topList.distributeTop = document.querySelector(`#distributeDOM`).offsetTop
        }
        if (document.querySelector(`#taskOpenMethodDOM`)) {
          topList.taskOpenMethodTop = document.querySelector(`#taskOpenMethodDOM`).offsetTop
        }
        if (document.querySelector(`#advancedSettingDOM`)) {
          topList.advancedSettingTop = document.querySelector(`#advancedSettingDOM`).offsetTop
        }
      }
    })
  }
  // 获取任务配置
  async function _getTaskConfig() {
    changeCalendarList(data.type)
    // const newModule = store.getters.systemModule
    // const showDYAPP =
    //   newModule.filter(item => item.scopeEnglishName === 'Operational Position').length > 0
    const response = await getTaskConfig({ type: data.type })
    // 开启全局扫码发布模式下，删除 扫码发布 的配置
    // 最新逻辑 直接删除扫码发布的配置
    // if (dyVersion.value === 2) {
    const videoSetIndex = response.data?.infoConfigs.findIndex(x => x.ckey === 'video_set')
    if (videoSetIndex > -1) {
      // 开启全局扫码发布后，隐藏扫码发布的配置项
      const scanPublishIndex = response.data.infoConfigs[videoSetIndex].children.findIndex(
        x => x.ckey === 'scan_and_publish'
      )
      if (scanPublishIndex > -1) {
        response.data.infoConfigs[videoSetIndex].children.splice(scanPublishIndex, 1)
      }

      // 抖音下载发布模式下，视频发布平台默认为空
      const videoPublishPlatform = response.data.infoConfigs[videoSetIndex].children.filter(
        x => x.ckey === 'video_publish_platform'
      )
      if (videoPublishPlatform && videoPublishPlatform.length > 0) {
        // 2025.1开始 视频发布平台从单选变成多选 删除选项不限制'0' 图文保持不变
        if ([1, 6].includes(data.type)) {
          // 图文改为多选 默认选中抖音
          videoPublishPlatform[0].cvalue = '1'
        } else {
          videoPublishPlatform[0].cvalue = '0'
        }
      }
    }
    // 任务形式 默认为KOS任务
    if (pageSource !== 'growth') {
      response.data.taskGroup = 1
    }
    response.data.deliverType = 0
    // 任务开启方式，默认为自动开启
    response.data.isAutoStart = 1
    // 分发给有授权账号的成员：普通任务下视频发布任务、直播任务、图文任务：开关默认开启； 征集任务、学习任务开关默认关闭；成长任务不用管。
    response.data.distributeOpen = getDistributeOpen(data.type)
    // 任务倒计时 默认为关闭
    response.data.countdown = 0
    if (origin === 'calendar') {
      response.data.startTime = data.startTime
      response.data.endTime = data.endTime
      console.log('本次创建的任务类型', response.data.type)
      if (response.data.infoConfigs && response.data.infoConfigs.length > 0) {
        response.data.infoConfigs.forEach(x => {
          switch (x.name) {
            // case '挂载设置':
            //   taskTypeInfo.list[1].show = !!showDYAPP
            //   break
            case '征集设置':
              // taskTypeInfo.list[1].show = true
              break
            case '任务要求':
              if (data.type === 1) {
                taskTypeInfo.list[3].show = true
              } else {
                taskTypeInfo.list[
                  (data.type === 1 || data.type === 6) && dyVersion.value === 3 ? 2 : 3
                ].show = true
              }

              break
            case '视频设置':
            case '内容设置':
              if (data.type === 1) {
                taskTypeInfo.list[2].show = true
              } else {
                taskTypeInfo.list[
                  (data.type === 1 || data.type === 6) && dyVersion.value === 3 ? 3 : 2
                ].show = true
              }
              break
            default:
              break
          }
        })
      }
      // 图文任务修改一下label
      if (response.data.type === 6) {
        const index = dyVersion.value === 3 ? 3 : 2
        taskTypeInfo.list[index].label = '发布设置'
      }
      console.log(taskTypeInfo.list)
      nextTick(() => {
        data.loading = false
      })
    }
    data.taskInfo = response.data

    getOffsetTop()
  }
  const userId = ref('')
  userId.value = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId + ''
    : ''
  // 获取任务详情
  async function _getTaskInfo(copyId) {
    // const newModule = store.getters.systemModule
    // const showDYAPP =
    //   newModule.filter(item => item.scopeEnglishName === 'Operational Position').length > 0
    const response = await getTaskInfo({ taskId: data.taskId || copyId })
    data.taskInfo = transTaskData(response.data, copyId)
    // console.log('在函数里面看id --->', data.taskId, copyId)
    // 如果是活动任务,编辑操作，就要禁用结束时间 10天后：又不带了
    if (
      (data.taskInfo.activityTaskBindId ||
        data.taskInfo.activityEndTime ||
        data.taskInfo.activityStartTime) &&
      data.taskId
    ) {
      data.disableActivityChoseTimeObject = {
        startTime: data.taskInfo.activityStartTime,
        endTime: data.taskInfo.activityEndTime
      }
      // data.isFromActivity = true
    }
    // else {
    // data.isFromActivity = false
    // }
    if (origin === 'calendar') {
      changeCalendarList(response.data.type)
      if (response.data.infoConfigs && response.data.infoConfigs.length > 0) {
        response.data.infoConfigs.forEach(x => {
          switch (x.name) {
            // case '挂载设置':
            //   taskTypeInfo.list[1].show = !!showDYAPP
            //   break
            case '征集设置':
              // taskTypeInfo.list[1].show = true
              break
            case '任务要求':
              if (response.data.type === 1) {
                taskTypeInfo.list[3].show = true
              } else {
                taskTypeInfo.list[
                  (response.data.type === 1 || response.data.type === 6) && dyVersion.value === 3
                    ? 2
                    : 3
                ].show = true
              }
              break
            case '内容设置':
              if (response.data.type === 1) {
                taskTypeInfo.list[2].show = true
              } else {
                taskTypeInfo.list[
                  (response.data.type === 1 || response.data.type === 6) && dyVersion.value === 3
                    ? 3
                    : 2
                ].show = true
              }
              break
            default:
              break
          }
        })
      }
      // 图文任务修改一下label
      if (response.data.type === 6) {
        taskTypeInfo.list[2].label = '发布设置'
      }
      nextTick(() => {
        data.loading = false
      })
    }
    data.type = data.taskInfo.type

    getOffsetTop()

    if (copyId) {
      // 分发给有授权账号的成员：普通任务下视频发布任务、直播任务、图文任务：开关默认开启； 征集任务、学习任务开关默认关闭；成长任务不用管。
      data.taskInfo.distributeOpen = getDistributeOpen(data.type)
      // 任务倒计时要默认为关闭，不复制过来
      data.taskInfo.countdown = 0
      return
    }
    if (data.disEdit) {
      data.disabled = true
      data.basicDisabled = true
      data.targetRewardDisabled = true
      return
    }
    data.disabled = true
    data.basicDisabled = true
    data.targetRewardDisabled = true
    // 成长任务判断条件
    if (pageSource === 'growth') {
      const { query } = route
      data.disabled = false
      data.basicDisabled = false
      data.targetRewardDisabled = false
      // disEditOther 除了基本信息，任务指标之外 的信息是否可以编辑
      // query.disEditOther === '1' 只能编辑 基础信息 和任务指标
      // console.log(query.disEditOther === '1', query.disEditOther)
      if (query?.disEditOther && query.disEditOther === '1') {
        data.disabled = true
      }
      // query.disEditOther === '2' 只能编辑基础信息
      if (query?.disEditOther && query.disEditOther === '2') {
        data.disabled = true
        data.targetRewardDisabled = true
      }

      return
    }
    // 非成长任务 活动没有人参与的时候 可以对任务指标进行编辑
    let joinCount = 1
    if (!isEmpty(data.taskId) && data.taskId !== '1') {
      const tempRes = await getTaskInfoView({ taskId: data.taskId })
      joinCount = tempRes?.data.joinCount
    }
    switch (data.taskInfo.status) {
      case TASK_STATUS.get('未开启'):
      case TASK_STATUS.get('未开始'):
      case TASK_STATUS.get('进行中'):
      case TASK_STATUS.get('已暂停'):
        data.basicDisabled = false
        data.targetRewardDisabled = joinCount > 0
        break
      case TASK_STATUS.get('审核不通过'):
        if (userId.value === data.taskInfo.createUserId) {
          data.disabled = false
          data.basicDisabled = false
          data.targetRewardDisabled = false
        }
        break
    }
  }

  // 转换后端数据
  function transTaskData(_taskInfo, copyId) {
    // 2023.9.18 ：后端不刷配置，所以由前端往老数据里添加参数 begin
    // 配置项
    if (_taskInfo && _taskInfo.infoConfigs && _taskInfo.infoConfigs.length > 0) {
      // 往视频设置里修改
      const infoConfigIndex = _taskInfo.infoConfigs.findIndex(x => x.ckey === 'video_set')
      if (
        infoConfigIndex > -1 &&
        _taskInfo.infoConfigs[infoConfigIndex].children &&
        _taskInfo.infoConfigs[infoConfigIndex].children.length > 0
      ) {
        // 获取优质矩阵号转发提醒的配置 如果不存在，在视频发布方式和选择方式中间插入。
        const showFor = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'forward_alarm'
        )
        if (showFor === -1) {
          const fowardIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_push_mode'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(fowardIndex + 1, 0, {
            ckey: 'forward_alarm',
            cvalue: '0',
            name: '优质矩阵号转发提醒'
          })
        }
        // 获取视频使用次数限制/成员转发模板视频次数限制的配置 如果不存在，在poi配置后面插入。
        const showVideoUseTimesLimit = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_use_times_limit'
        )
        if (showVideoUseTimesLimit === -1) {
          const VideoUseTimesLimitIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_publish_platform'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(
            VideoUseTimesLimitIndex,
            0,
            {
              ckey: 'video_use_times_limit_switch',
              cvalue: '0',
              name: '视频使用次数限制开关'
            },
            {
              ckey: 'video_use_times_limit',
              cvalue: '1',
              name: '视频使用次数限制'
            }
          )
        }

        // 获取小红书POI的设置 如果不存在，在Poi位置后面加
        const showXhsPoi = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_xhs_poi_setting'
        )
        if (showXhsPoi === -1) {
          const dyPoiIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_poi_setting'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(dyPoiIndex + 1, 0, {
            ckey: 'video_xhs_poi_setting',
            cvalue: '',
            name: '小红书poi配置'
          })
        }

        // 获取视频/图文任务标题配置"publish_title_config"和标题内容"video_title" 如果不存在，在视频发布平台video_publish_platform后插入
        const showTitleConfig = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'publish_title_config'
        )
        if (showTitleConfig === -1) {
          const publishTitleConfigIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_publish_platform'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(publishTitleConfigIndex + 1, 0, {
            ckey: 'publish_title_config',
            cvalue: '1',
            name: '发布标题'
          })
        }
        // video_title
        const showTitle = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_title'
        )
        if (showTitle === -1) {
          const titleIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'publish_title_config'
          )
          let titleConfigInRequire = { cvalue: null }
          const requireConfigIndex = _taskInfo.infoConfigs.findIndex(x => x.ckey === 'task_require')
          if (
            requireConfigIndex > -1 &&
            _taskInfo.infoConfigs[requireConfigIndex].children &&
            _taskInfo.infoConfigs[requireConfigIndex].children.length > 0
          ) {
            titleConfigInRequire = _taskInfo.infoConfigs[requireConfigIndex].children.find(x => {
              return x.ckey === 'video_title'
            })
          }
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(titleIndex + 1, 0, {
            ckey: 'video_title',
            cvalue: titleConfigInRequire?.cvalue,
            name: '视频标题'
          })
          // 如果视频标题有内容，说明设置过固定标题 发布标题 配置项就应该是 1
          if (titleConfigInRequire?.cvalue) {
            _taskInfo.infoConfigs[infoConfigIndex].children.forEach(s => {
              if (s.ckey === 'publish_title_config') {
                s.cvalue = '1'
              }
            })
          }
        }

        // 小红书话题 如果不存在，在话题位置后面加
        const showXhsTopic = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_xhs_topic'
        )
        if (showXhsTopic === -1) {
          const dyTopicIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_topic'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(dyTopicIndex + 1, 0, {
            ckey: 'video_xhs_topic',
            cvalue: '',
            name: '小红书话题'
          })
        }

        // 小红书@人  如果不存在，在@人位置后面加
        const showXhsAtPerson = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_xhs_@_person'
        )
        if (showXhsAtPerson === -1) {
          const dyAtPersonIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_@_person'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(dyAtPersonIndex + 1, 0, {
            ckey: 'video_xhs_@_person',
            cvalue: '',
            name: '小红书@人'
          })
        }
        // 通用挂载配置 如果不存在，就在最后加上
        const showVideoCommonMount = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'video_common_mount'
        )
        if (showVideoCommonMount === -1) {
          _taskInfo.infoConfigs[infoConfigIndex].children.push({
            ckey: 'video_common_mount',
            cvalue: '',
            name: '通用挂载配置'
          })
        }
        // AI智能标题 加载通用挂在配置
        const showIntelligentAITitle = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'intelligent_ai_title'
        )
        if (showIntelligentAITitle === -1) {
          const videoPushModeIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_push_mode'
          )
          // 不存在就放在视频发布方式之前
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(videoPushModeIndex - 1, 0, {
            ckey: 'intelligent_ai_title',
            cvalue: '',
            name: 'AI标题'
          })
        }

        // 下载发布模式下的视频、图文：重复参与相关的配置 如果不存在，在视频选择方式后面加
        const showMultiJoinSet = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
          x => x.ckey === 'multi_join_set'
        )
        if (showMultiJoinSet === -1 && dyVersion.value === 3) {
          const videoSelectModeIndex = _taskInfo.infoConfigs[infoConfigIndex].children.findIndex(
            x => x.ckey === 'video_select_mode'
          )
          _taskInfo.infoConfigs[infoConfigIndex].children.splice(
            videoSelectModeIndex + 1,
            0,
            ...[
              {
                ckey: 'multi_join_set',
                cvalue: '0',
                name: '重复参与'
              },
              {
                ckey: 'multi_join_type',
                cvalue: '1',
                name: '重复参与类型'
              },
              {
                ckey: 'total_join_times',
                cvalue: '2',
                name: '总参与次数'
              },
              {
                ckey: 'join_interval',
                cvalue: '1',
                name: '参与间隔'
              }
            ]
          )
        }
      }

      //  往任务要求里修改
      const requireConfigIndex = _taskInfo.infoConfigs.findIndex(x => x.ckey === 'task_require')
      if (
        requireConfigIndex > -1 &&
        _taskInfo.infoConfigs[requireConfigIndex].children &&
        _taskInfo.infoConfigs[requireConfigIndex].children.length > 0
      ) {
        // 在任务要求内如果有 video_title配置项，要删除
        const hideTitle = _taskInfo.infoConfigs[requireConfigIndex].children.findIndex(
          x => x.ckey === 'video_title'
        )
        if (hideTitle !== -1) {
          // 删除
          _taskInfo.infoConfigs[requireConfigIndex].children = _taskInfo.infoConfigs[
            requireConfigIndex
          ].children.filter(s => {
            return s.ckey !== 'video_title'
          })
        }

        // 直播任务，重复参与是放在任务要求里的，所以老数据是加在任务要求里
        const showMultiJoinSet = _taskInfo.infoConfigs[requireConfigIndex].children.findIndex(
          x => x.ckey === 'multi_join_set'
        )
        if (showMultiJoinSet === -1 && _taskInfo.type === 2 && dyVersion.value === 3) {
          _taskInfo.infoConfigs[requireConfigIndex].children.unshift(
            ...[
              {
                ckey: 'multi_join_set',
                cvalue: '0',
                name: '重复参与'
              },
              {
                ckey: 'multi_join_type',
                cvalue: '1',
                name: '重复参与类型'
              },
              {
                ckey: 'total_join_times',
                cvalue: '2',
                name: '总参与次数'
              },
              {
                ckey: 'join_interval',
                cvalue: '1',
                name: '参与间隔'
              }
            ]
          )
        }
      }

      // 后面添加审核
      const auditConfigIndex = _taskInfo.infoConfigs.findIndex(
        x => x.ckey === 'video_intelligent_audit'
      )
      if (auditConfigIndex === -1 && dyVersion.value === 3) {
        _taskInfo.infoConfigs.push({
          ckey: 'video_intelligent_audit',
          cvalue: '0',
          name: '智能审核'
        })
        _taskInfo.infoConfigs.push({
          ckey: 'video_intelligent_audit_pass',
          cvalue: '',
          name: '直接通过'
        })
        _taskInfo.infoConfigs.push({
          ckey: 'video_intelligent_audit_reject',
          cvalue: '',
          name: '直接驳回'
        })
      }

      // 添加参与人数上限
      const joinLimitNumIndex = _taskInfo.infoConfigs.findIndex(x => x.ckey === 'join_limit_num')
      if (joinLimitNumIndex === -1) {
        _taskInfo.infoConfigs.push({
          ckey: 'join_limit_num',
          cvalue: '1',
          name: '参与人数上限'
        })
      }
    }

    // 奖励设置
    if (_taskInfo && _taskInfo.targetConfigs && _taskInfo.targetConfigs.length > 0) {
      // 重复参与指标奖励 如果不存在，就在最后加上
      const multiJoinTargetIndex = _taskInfo.targetConfigs.findIndex(
        x => x.targetKey === 'multi_join_target'
      )
      if (multiJoinTargetIndex === -1 && dyVersion.value === 3) {
        // 添加重复参与指标奖励
        _taskInfo.targetConfigs.push({
          targetKey: 'multi_join_target',
          targetName: '重复参与指标',
          targetValue: null,
          targetRwwards: [
            {
              cvalue: null,
              rewards: [{ type: 1, typeName: '金币', value: null }]
            }
          ]
        })
      }
    }
    // 2023.9.18 ：后端不刷配置，所以由前端往老数据里添加参数 end
    _taskInfo.targetConfigs.forEach(group => {
      group.isChecked = group.isChecked === 1
      if (group.children) {
        group.children.forEach(subGroup => {
          subGroup.isChecked = subGroup.isChecked === 1
        })
      }
    })
    if (copyId) {
      const resetKeys = [
        'mount_set',
        'video_set',
        'base_set',
        'content_settings',
        'course_homework_config'
      ]
      _taskInfo.name = ''
      _taskInfo.startTime = ''
      _taskInfo.endTime = ''
      _taskInfo.status = null
      _taskInfo.isOpen = null
      _taskInfo.isDelete = 0
      _taskInfo.id = '1'
      _taskInfo.auditType = null
      _taskInfo.brandId = '1'
      _taskInfo.createUserId = '1'
      _taskInfo.chooseOrgId = null
      _taskInfo.deliverType = 0
      _taskInfo.orgCode = null
      _taskInfo.orgId = null
      _taskInfo.orgIds = null
      _taskInfo.orgs = null
      _taskInfo.groups = null
      _taskInfo.groupIds = null
      _taskInfo.goldTypeId = null
      _taskInfo.isAutoStart = 1 // 复制的时候，要默认设置是自动开启
      // 当前品牌不存在KOC小程序或小程序授权过期或活动日历过来的或非管理员角色，任务形式就默认是1
      if (
        !KOCInfo.value.hasKOC ||
        (KOCInfo.value.hasKOC && !KOCInfo.value.isValid) ||
        pageSource === 'ActCalendar' ||
        !isAdmin.value
      ) {
        _taskInfo.taskGroup = 1
      }
      _taskInfo.infoConfigs.forEach(config => {
        if (resetKeys.includes(config.ckey)) {
          config = clearInfo(config, _taskInfo.type)
        }
      })
    }
    // 获取任务详情，若是旧任务，以前没有设置开启方式的，就默认把他设置为手动开启
    if (_taskInfo.isAutoStart === null) {
      _taskInfo.isAutoStart = 0
    }
    return _taskInfo
  }
  function clearInfo(config, type) {
    if (!config.children) return config
    config.children.forEach(key => {
      // 复制时，标题内容、视频发布方式、视频选择方式不清空
      if (
        key.ckey === 'video_title' ||
        key.ckey === 'video_push_mode' ||
        key.ckey === 'video_select_mode'
      ) {
        return
      }
      // 复制时 下载发布通用挂载配置不清空
      if (key.ckey === 'video_common_mount' && dyVersion.value === 3) {
        // 标题 关键词不复制
        if (isNotEmpty(key.cvalue)) {
          const value = JSON.parse(key.cvalue)
          key.cvalue = JSON.stringify({
            ...value,
            titlePrompt: '',
            otherTitle: '', // 除小红书外的 抖音/视频号/快手标题
            xhsTitle: '',
            xhsDescription: ''
          })
        }
        return
      }
      // 复制时 下载发布模式抖音@不清空
      if (key.ckey === 'video_@_person' && dyVersion.value === 3) {
        return
      }
      // 复制时 下载发布模式小红书@不清空
      if (key.ckey === 'video_xhs_@_person' && dyVersion.value === 3) {
        return
      }
      // 复制时，发布标题不清空
      if (key.ckey === 'publish_title_config') {
        return
      }
      // 复制时POI位置不清空
      if (key.ckey === 'video_poi_setting' || key.ckey === 'video_xhs_poi_setting') {
        return
      }
      // 复制时 如果是图文、视频任务，那发布平台要默认改成0
      // 2025.1开始 视频发布平台从单选变成多选 删除选项不限制'0' 图文保持不变 图文也默认选中抖音
      if (key.ckey === 'video_publish_platform') {
        key.cvalue = [1, 6].includes(type) ? '1' : '0'
        return
      }
      // 复制时优质矩阵号转发提醒不清空
      if (key.ckey === 'forward_alarm') {
        return
      }

      // 复制时 只有下载发布模式下 重复参与相关设置不清空
      if (
        ['multi_join_set', 'total_join_times', 'join_interval', 'multi_join_type'].includes(
          key.ckey
        ) &&
        dyVersion.value === 3
      ) {
        return
      }
      // 复制时视频使用次数限制设置为默认的 开关是0 次数是1
      if (key.ckey === 'video_use_times_limit_switch') {
        key.cvalue = '0'
        return
      }
      if (key.ckey === 'video_use_times_limit') {
        key.cvalue = '1'
        return
      }
      if (
        key.ckey === 'collect_type' ||
        key.ckey === 'collect_num' ||
        key.ckey === 'allow_audit_refuse_rejoin' // 复制任务进来初始化任务失败是否可以重新参与按钮状态为：是
      ) {
        key.cvalue = '1'
      } else {
        if (key.ckey !== 'collect_mode') {
          key.cvalue = null
        }
      }
    })
    return config
  }
  // 获取分发人数
  function updateDelivernum(num) {
    data.delivernum = num
    data.taskInfo.deliverNum = num
    taskForm?.value.validateField('deliverNum')
  }

  // 去设置
  function toAuditSetting() {
    router.push('/content_market/examine_setting?type=material')
  }

  const saveTask = throttle(function () {
    taskForm.value.validate(vaild => {
      if (vaild) {
        if (data.taskInfo.status === TASK_STATUS.get('审核不通过')) {
          ElMessageBox.confirm('此次编辑保存后，将重新进入审核流程?', '提示', {
            confirmButtonText: '确认保存',
            cancelButtonText: '取消'
          }).then(res => {
            saveTaskMethod()
          })
        } else {
          saveTaskMethod()
        }
      } else {
        if (origin === 'calendar') {
          message.warning('请将任务填写完整')
        } else {
          // 要滚动到第一个验证失败的地方
          // :scroll-to-error="true" 这个方法可以，但会有一个问题，如果标题、任务时间都填了，其余不填，他滚动的位置就出错了。具体原因待研究
          setTimeout(() => {
            const isError = document.getElementsByClassName('is-error')
            if (isError && isError.length > 0) {
              document.querySelector('.layout_main').scrollTo(0, isError[0].offsetTop - 78)
              const errText = isError[0].innerText ? isError[0].innerText.split('\n') : []
              if (errText.length > 0) {
                message.warning(errText[errText.length - 1])
              }
            }
          }, 100)
        }
      }
    })
  }, 500)
  function saveTaskMethod() {
    const parmas = JSON.parse(JSON.stringify(data.taskInfo))
    parmas.targetConfigs.forEach(group => {
      // 完成所有指标勾选判断
      if (group.targetKey === 'all_target') {
        group.isChecked = group.targetValue > 0 ? 1 : 0
      } else {
        group.isChecked = group.isChecked ? 1 : 0
      }
      if (!group.isChecked && !['all_target', 'multi_join_target'].includes(group.targetKey)) {
        group.targetRwwards.forEach(e => {
          e.cvalue = null
          e.rewards.forEach(reward => {
            reward.value = null
          })
        })
      }
      if (group.children) {
        group.children.forEach(subGroup => {
          // 学习任务的特殊处理 线上课程+无课后作业=清空作业分数的指标 线下课程=清空浏览时长的分数
          if (
            courseForm.value === '1' &&
            courseHomeworkOpen.value === '0' &&
            subGroup.targetKey === 'homework_grade_target'
          ) {
            subGroup.isChecked = 0
          }
          if (courseForm.value === '2' && subGroup.targetKey === 'viewing_hours') {
            subGroup.isChecked = 0
          }
          subGroup.isChecked = subGroup.isChecked ? 1 : 0
          if (!subGroup.isChecked) {
            // 未勾选的话清空指标和奖励
            subGroup.targetRwwards = subGroup.targetRwwards.slice(0, 1)
            subGroup.targetRwwards.forEach(targetItem => {
              targetItem.cvalue = null
              targetItem.rewards.forEach(reward => {
                reward.value = null
              })
            })
          }
        })
      }
      // 如果没有开启重复参与，那就清空重复参与指标奖励
      if (Number(multiJoinSet.value) === 0) {
        if (group.targetKey === 'multi_join_target') {
          group.targetValue = null
          ;(group.targetRwwards || []).forEach(reward => {
            reward.cvalue = null
            ;(reward.rewards || []).forEach(x => {
              x.value = null
            })
          })
        }
      }
    })
    // 如果是成长任务，默认是全部分发、自动开启
    if (pageSource === 'growth') {
      parmas.deliverType = 0
      parmas.isAutoStart = 1
      parmas.taskGroup = 2
    } else {
      // taskGroup 1 KOS任务 2 成长任务 3KOC任务
      // 只有任务里没设置过任务形式 才默认设为1 KOS任务
      if (isEmpty(parmas.taskGroup)) parmas.taskGroup = 1
    }
    // console.log('入参', parmas)
    // if (parmas) return
    data.saving = true
    const taskPromise = data.taskId ? updateTask(parmas) : createNewTask(parmas)
    taskPromise
      .then(res => {
        message.success(res.msg)
        data.saving = false
        if (origin === 'calendar') {
          data.isSave = true
          // 将结果返回，用于活动内新建任务的自动选择
          emits('newTaskSuccess', res.data)
          dialog.value.handleClose()
        } else {
          router.go(-1)
        }
      })
      .catch(err => {
        if (err && err.msg) {
          data.warningInfo = err
          data.warningDialogVisible = true
        }
        data.saving = false
      })
  }

  function closeDialog() {
    dialog.value.handleClose()
  }

  // 分发给有授权账号的成员：普通任务下视频发布任务、直播任务、图文任务：开关默认开启； 征集任务、学习任务开关默认关闭；成长任务不用管。
  function getDistributeOpen(type) {
    if (pageSource !== 'growth') {
      if (type + '' === '1' || type + '' === '2' || type + '' === '6') {
        return 1
      } else {
        return 0
      }
    } else {
      return 0
    }
  }
  return {
    taskTypeInfo,
    data,
    updateValidate,
    _getTaskConfig,
    _getTaskInfo,
    updateDelivernum,
    toAuditSetting,
    saveTask,
    closeDialog,
    getOffsetTop
  }
}
