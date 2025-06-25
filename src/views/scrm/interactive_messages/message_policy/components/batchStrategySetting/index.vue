<template>
  <div>
    <el-dialog
      v-model="show"
      :width="580"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="close"
    >
      <template #title>
        <div class="dialog_title">
          {{ showBatchStrategySetting.isAll ? '批量策略设置' : '策略设置' }}
        </div>
      </template>
      <div class="dialog_content">
        <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
          <template v-for="(tab, i) in tabList" :key="i">
            <el-tab-pane v-if="tab.show" :label="tab.label" :name="tab.name">
              <template #label>
                <div class="tab_label">
                  {{ tab.label }}
                </div>
              </template>
            </el-tab-pane>
          </template>
        </el-tabs>
        <div class="strategy">
          <!-- 用户私信 -->
          <div class="userMessage" v-if="chooseTab == 'userMessage'">
            <div class="strategy_rules">触达规则：</div>
            <!-- 招呼语 -->
            <div class="say_hello">
              <div class="text">欢迎语（用户主动私信会发送欢迎语，单个用户24小时一次）</div>
              <el-form ref="formRef" label-width="94px">
                <el-form-item label="回复内容:">
                  <el-input
                    v-model.trim="$data.userMessageTemplateInfo.strategys[0].welcomeMessage"
                    placeholder="请输入回复内容"
                    type="textarea"
                    resize="none"
                    maxlength="200"
                    :autosize="{ minRows: 6, maxRows: 6 }"
                    :style="{ width: '418px' }"
                    show-word-limit
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
            <replayContent
              :disabled="$data.userMessageTemplateInfo.enable"
              :options="$data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions"
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: true,
                showType: 'userMessage',
                reply_content: true
              }"
              @updateTemplateInfo="updateTemplateInfo"
            />
          </div>
          <div class="videoCustomer" v-if="chooseTab == 'videoCustomer'">
            <div class="strategy_rules">触达规则：</div>
            <replayContent
              :disabled="$data.videoCustomerTemplateInfo.enable"
              :options="$data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions"
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: false,
                showType: 'videoCustomer',
                reply_content: true,
                keyWordsObj: keyWordsObj
              }"
              @updateTemplateInfo="updateTemplateInfo"
            />
          </div>
          <div class="liveCustomer" v-if="chooseTab == 'liveCustomer'">
            <div class="strategy_rules">触达规则：</div>
            <replayContent
              :disabled="$data.liveCustomerTemplateInfo.enable"
              :options="$data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions"
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: false,
                showType: 'liveCustomer',
                reply_content: true,
                keyWordsObj: keyWordsObj
              }"
              @updateTemplateInfo="updateTemplateInfo"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer_info">
          <span class="info_left">
            <span>
              策略完善度：
              <span class="has_color">{{ tacticsCompletion || 0 }}%</span>
            </span>
            <span style="margin-left: 28px" v-if="showBatchStrategySetting.isBatch">
              已选择抖音号
              <span class="has_color">{{ showBatchStrategySetting.chooseLength || 0 }}</span>
              个
            </span>
          </span>
          <span class="dialog-footer">
            <el-button @click="confirm(1)">
              保存并开启
              <el-tooltip
                :visible="tooltipsVisible"
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p>未授权抖音web端的个人号无法开启</p>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px"
                  @mouseenter="tooltipsVisible = true"
                  @mouseleave="tooltipsVisible = false"
                />
              </el-tooltip>
            </el-button>
            <el-button type="primary" @click="confirm(null)">保存</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import replayContent from './reply_content_update.vue'
// import { useStore } from 'vuex'
import { throttle } from '@/utils/tools.js'
import { strategyOpenSet, keywordList, strategyDetail } from '@/api/scrm/policy.js'

const props = defineProps({
  show: Boolean,
  showBatchStrategySetting: Object
})

// const store = useStore()
// 策略
const tabList = [
  {
    name: 'userMessage',
    label: '用户私信',
    show: true
  },
  {
    name: 'videoCustomer',
    label: '视频潜客',
    show: true
  },
  {
    name: 'liveCustomer',
    label: '直播潜客',
    show: true
  }
]
const { show, showBatchStrategySetting } = toRefs(props)
const emits = defineEmits(['update:show', 'confirm'])
// 当前选择的策略
const chooseTab = ref('userMessage')
// 空状态，用于初始化
const initStrategys = {
  accountIds: [],
  isOpen: 0, // 是否开启 1-开 0 关
  strategys: [
    {
      keyWordAutoReplyOptions: [
        {
          auto_keywords_blacklist: [],
          auto_reply_keywords: [], // 回复关键词
          auto_reply_seq: [
            // 自动回复内容
            {
              id: '',
              name: '',
              reply_content: '',
              reply_type: ''
            }
          ],
          reply_type: ''
        }
      ],
      type: null, // 	类型 112-用户私信 110 视频潜客 210 -直播潜客
      welcomeMessage: '' // 欢迎语
    }
  ]
}
const tooltipsVisible = ref(false)
// 弹窗的数据，维护这里的
const $data = reactive({
  // 用户私信 userMessage
  userMessageTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },
  // 视频潜客 videoCustomer
  videoCustomerTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },
  // 直播潜客 liveCustomer
  liveCustomerTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },

  saving: false,
  isShowDialog: false
})

function getReplyContentSome(autoReplySeq) {
  return autoReplySeq.some(x => {
    return !x.reply_content
  })
}
// 完成度进度 0:userMessage 1:videoCustomer 2:liveCustomer
const doneProgress = ref([false, false, false])
// 策略完成度
const tacticsCompletion = ref(0)
// 计算策略完成度
function perSent() {
  const midArr = JSON.parse(JSON.stringify(doneProgress.value))
  const trueNum = midArr.filter(i => {
    return i === true
  }).length
  tacticsCompletion.value = parseInt((trueNum / 3) * 100)
}
// 监听策略数据获取到策略的完成度并进行显示
watch(
  () => $data[`${chooseTab.value}TemplateInfo`].strategys,
  value => {
    // 如果是用户私信，完成度就是 欢迎语 或 关键词+回复内容 其他的就是关键词+回复内容
    if (value) {
      value.forEach(item => {
        item.keyWordAutoReplyOptions.forEach(options => {
          if (
            chooseTab.value === 'userMessage' &&
            (item.welcomeMessage ||
              (options.auto_reply_keywords &&
                options.auto_reply_keywords.length > 0 &&
                !getReplyContentSome(options.auto_reply_seq)))
          ) {
            doneProgress.value[0] = true
          } else {
            // tab 切换时候不能改
            if (chooseTab.value === 'userMessage') doneProgress.value[0] = false
          }

          if (
            chooseTab.value === 'videoCustomer' &&
            options.auto_reply_keywords &&
            options.auto_reply_keywords.length > 0 &&
            !getReplyContentSome(options.auto_reply_seq)
          ) {
            doneProgress.value[1] = true
          } else {
            if (chooseTab.value === 'videoCustomer') doneProgress.value[1] = false
          }

          if (
            chooseTab.value === 'liveCustomer' &&
            options.auto_reply_keywords &&
            options.auto_reply_keywords.length > 0 &&
            !getReplyContentSome(options.auto_reply_seq)
          ) {
            doneProgress.value[2] = true
          } else {
            if (chooseTab.value === 'liveCustomer') doneProgress.value[2] = false
          }
        })
        // 赋值 type
        if (chooseTab.value === 'userMessage') item.type = 112
        if (chooseTab.value === 'videoCustomer') item.type = 110
        if (chooseTab.value === 'liveCustomer') item.type = 210
      })
      perSent()
    }
  },
  { deep: true, immediate: true }
)

// 套用模板
function updateTemplateInfo(val) {
  $data[`${chooseTab.value}TemplateInfo`].strategys = val.template.map(item => {
    console.log('item.auto_reply_options', item.auto_reply_options)
    return (item = {
      ...item,
      keyWordAutoReplyOptions: item.auto_reply_options,
      welcomeMessage: $data[`${chooseTab.value}TemplateInfo`].strategys[0].welcomeMessage
    })
  })
  $data[`${chooseTab.value}TemplateInfo`].strategys[0].keyWordAutoReplyOptions.forEach(e => {
    e.reply_type = e.reply_type || 'text'
  })
}

// tab 切换
function changeTab(val, event) {
  chooseTab.value = val.props.name
}
// 关闭弹窗
function close() {
  tooltipsVisible.value = false
  emits('update:show', false)
}
// 处理入参的ids
function getIds() {
  const ids = []
  showBatchStrategySetting.value.chooseList.forEach(item => {
    ids.push(item.id)
  })
  return ids
}
// 保存并开启的处理
function getOpenType(openType) {
  if (!openType) return openType
  // 需要回显的就是单个的 个人号 未授权 不能开； 企业号 未授权可以开
  if (
    openType &&
    showBatchStrategySetting.value.needShowDetail &&
    !showBatchStrategySetting.value.chooseList[0].enterImStatus &&
    !showBatchStrategySetting.value.chooseList[0].eaccountRole
  ) {
    return null
  } else {
    return 1
  }
}
// 验证规则
function saveRules() {
  const pass = ref(true)
  try {
    // 用户私信的验证
    const userMessageRulesData = $data.userMessageTemplateInfo.strategys[0]
    userMessageRulesData.keyWordAutoReplyOptions.forEach(item => {
      if (!userMessageRulesData.welcomeMessage) {
        if (
          (item.auto_reply_keywords.length === 0 && !item.auto_reply_seq[0].reply_content) ||
          (item.auto_reply_keywords.length > 0 && item.auto_reply_seq[0].reply_content)
        ) {
          console.log('策略数量>2 两个都为填的情况 不做验证了，保存的时候不入参')
          // if (
          //   userMessageRulesData.keyWordAutoReplyOptions.length > 1 &&
          //   item.auto_reply_keywords.length === 0 &&
          //   !item.auto_reply_seq[0].reply_content
          // ) {
          //   throw new Error('noPass')
          // }
        } else {
          console.log('只填写了一个，铁通不过验证')
          throw new Error('noPass')
        }
      } else {
        if (
          (item.auto_reply_keywords.length > 0 && !item.auto_reply_seq[0].reply_content) ||
          (item.auto_reply_keywords.length === 0 && item.auto_reply_seq[0].reply_content)
        ) {
          // ||(item.auto_reply_keywords.length === 0 && !item.auto_reply_seq[0].reply_content && userMessageRulesData.keyWordAutoReplyOptions.length > 1)
          throw new Error('noPass')
        }
      }
    })
  } catch (e) {
    if (e.message === 'noPass') {
      pass.value = false
    }
  }
  // 视频潜客 验证 验证任意填写一个 还有策略数量大于1时两个都为填写
  try {
    const videoCustomerRulesData = $data.videoCustomerTemplateInfo.strategys[0]
    videoCustomerRulesData.keyWordAutoReplyOptions.forEach(item => {
      if (
        (item.auto_reply_keywords.length === 0 && !item.auto_reply_seq[0].reply_content) ||
        (item.auto_reply_keywords.length > 0 && item.auto_reply_seq[0].reply_content)
      ) {
        // if (
        //   videoCustomerRulesData.keyWordAutoReplyOptions.length > 1 &&
        //   item.auto_reply_keywords.length === 0 &&
        //   !item.auto_reply_seq[0].reply_content
        // ) {
        //   throw new Error('noPass')
        // }
      } else {
        throw new Error('noPass')
      }
    })
  } catch (e) {
    if (e.message === 'noPass') {
      pass.value = false
    }
  }
  // 直播潜客
  try {
    const liveCustomerRulesData = $data.liveCustomerTemplateInfo.strategys[0]
    liveCustomerRulesData.keyWordAutoReplyOptions.forEach(item => {
      if (
        (item.auto_reply_keywords.length === 0 && !item.auto_reply_seq[0].reply_content) ||
        (item.auto_reply_keywords.length > 0 && item.auto_reply_seq[0].reply_content)
      ) {
        // if (
        //   liveCustomerRulesData.keyWordAutoReplyOptions.length > 1 &&
        //   item.auto_reply_keywords.length === 0 &&
        //   !item.auto_reply_seq[0].reply_content
        // ) {
        //   throw new Error('noPass')
        // }
      } else {
        throw new Error('noPass')
      }
    })
  } catch (e) {
    if (e.message === 'noPass') {
      pass.value = false
    }
  }
  return pass.value
}
// 获取哪个策略是空的
function getIsNullStrategys(strategysItem) {
  return strategysItem.length === 0
}
// 保存
const confirm = throttle(openType => {
  // try {
  //   tabList.forEach(typeItem => {
  //     const _before = $data[`${typeItem.name}TemplateInfo`]
  //     for (const i in _before.strategys[0].keyWordAutoReplyOptions) {
  //       const ruleItem = _before.strategys[0].keyWordAutoReplyOptions[i]
  //       const _replyType = ruleItem.reply_type
  //       for (const k in ruleItem.auto_reply_seq) {
  //         const replyItem = ruleItem.auto_reply_seq[k]
  //         if (
  //           !ruleItem.auto_reply_keywords ||
  //           (!ruleItem.auto_reply_keywords.length &&
  //             replyItem.reply_type === _replyType &&
  //             !replyItem.reply_content)
  //         ) {
  //           if (
  //             typeItem.name === 'userMessage' &&
  //             !$data.userMessageTemplateInfo.strategys[0].welcomeMessage
  //           ) {
  //             // ElMessage.warning('请填写欢迎语') 欢迎语未填写时，也要提示“请填写策略内容”
  //             ElMessage.warning('请填写策略内容')
  //             throw new Error('noPass')
  //           } else if (typeItem.name !== 'userMessage') {
  //             ElMessage.warning('请填写策略内容')
  //             throw new Error('noPass')
  //           }
  //         } else if (!ruleItem.auto_reply_keywords || !ruleItem.auto_reply_keywords.length) {
  //           console.log('进入到第二个判断')
  //           ElMessage.warning('请填写关键词')
  //           throw new Error('noPass')
  //         } else if (!replyItem.reply_content) {
  //           console.log('进入到第三个判断')
  //           ElMessage.warning('请填写回复内容')
  //           throw new Error('noPass')
  //         }
  //       }
  //     }
  //   })
  // } catch (e) {
  //   // 抛错说明验证不通过
  //   if (e.message === 'noPass') return
  // }
  const pass = saveRules()
  console.log('pass', pass)
  if (!pass) return ElMessage.warning('请填写策略内容')
  // if (!$data.saving) return
  $data.saving = true
  // 处理入参
  let allStrategys = $data.userMessageTemplateInfo.strategys
    .concat($data.videoCustomerTemplateInfo.strategys)
    .concat($data.liveCustomerTemplateInfo.strategys)
  allStrategys = JSON.parse(JSON.stringify(allStrategys)).filter(x => {
    x.keyWordAutoReplyOptions = x.keyWordAutoReplyOptions.filter(y => {
      return (
        (y.auto_reply_keywords.length > 0 && y.auto_reply_seq[0].reply_content) || x.welcomeMessage
      )
    })
    return x.type && x.keyWordAutoReplyOptions.length > 0
  })

  // 如果都是空，不能保存
  if (allStrategys.length === 0) {
    $data.saving = false
    return ElMessage.warning('请填写策略内容')
  }

  // 如果是空，要赋值初始值
  const typeArr = [112, 110, 210]
  typeArr.forEach(item => {
    const itemStrategysStatus = getIsNullStrategys(
      allStrategys.filter(x => {
        return x.type === item
      })
    )
    if (itemStrategysStatus) {
      const midInitStrategys = JSON.parse(JSON.stringify(initStrategys.strategys))
      midInitStrategys[0].type = item
      allStrategys.push(midInitStrategys[0])
    }
  })

  const parma = {
    // id: _before.id,
    // openId: store.state.chat.policyOpenId,
    // strategyType: _before.strategyType,
    // type: _before.type,
    // strategys: _before.strategys,
    accountIds: getIds(), // 矩阵号id
    isOpen: getOpenType(openType), // 是否开启 1-开 0 关
    strategys: allStrategys
  }
  console.log('入参', parma)
  // if (parma) return
  strategyOpenSet(parma)
    .then(res => {
      console.log('保存/保存并开启的返回', res)
      if (res.code === 0) {
        if (openType === 1) {
          ElMessage.success('保存并开启成功')
        } else {
          ElMessage.success('保存成功')
        }
        close()
        emits('confirm')
        $data.saving = false
      }
    })
    .catch(() => {
      $data.saving = false
    })
}, 500)

// 获取子组件筛选关键词
const keyWordsObj = reactive({
  list: [],
  loading: false
})
// 获取关键词
const remoteMethodGetKeyWords = throttle(() => {
  keyWordsObj.loading = true
  const parma = {
    pageNo: 1,
    pageSize: 2000,
    keyType: 1
  }
  keywordList(parma)
    .then(res => {
      if (res.code === 0) {
        keyWordsObj.list = res.data
        keyWordsObj.loading = false
      }
    })
    .catch(() => {
      keyWordsObj.loading = false
    })
}, 100)
remoteMethodGetKeyWords()
// 回显策略完成度
function updateStrategysCompletion(keyWordAutoReplyOptions, doneProgressIndex) {
  keyWordAutoReplyOptions.forEach(options => {
    if (doneProgressIndex === 0) {
      // 用户私信
      if (
        $data.userMessageTemplateInfo.strategys[0].welcomeMessage ||
        (options.auto_reply_keywords &&
          options.auto_reply_keywords.length > 0 &&
          !getReplyContentSome(options.auto_reply_seq))
      ) {
        doneProgress.value[0] = true
      } else {
        doneProgress.value[0] = false
      }
    } else {
      // 其他两个
      if (
        options.auto_reply_keywords &&
        options.auto_reply_keywords.length > 0 &&
        !getReplyContentSome(options.auto_reply_seq)
      ) {
        doneProgress.value[doneProgressIndex] = true
      } else {
        doneProgress.value[doneProgressIndex] = false
      }
    }
  })
}
// 获取策略详情
function getStrategyDetail(param) {
  strategyDetail(param).then(res => {
    if (res.code === 0 && res.data?.length > 0) {
      res.data.forEach(item => {
        // 赋值并且回显完成度
        if (item.type === 112) {
          // 用户私信
          $data.userMessageTemplateInfo.strategys = [item]
          updateStrategysCompletion(
            $data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions,
            0
          )
        }
        if (item.type === 110) {
          // 视频潜客
          $data.videoCustomerTemplateInfo.strategys = [item]
          updateStrategysCompletion(
            $data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions,
            1
          )
        }
        if (item.type === 210) {
          // 直播潜客
          $data.liveCustomerTemplateInfo.strategys = [item]
          updateStrategysCompletion(
            $data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions,
            2
          )
        }
      })
    }
  })
}
onMounted(() => {
  if (showBatchStrategySetting.value.chooseList.length === 1) {
    getStrategyDetail({ accountId: showBatchStrategySetting.value.chooseList[0].id })
  }
})
</script>

<style lang="scss" scoped>
:deep .el-dialog__body {
  padding-top: 16px;
  max-height: 491px;
  overflow-y: auto;
}
.footer_info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24px;
  .info_left {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
  }
  .has_color {
    color: #364fcd;
  }
}
.dialog_content {
  .strategy_rules {
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #333333;
    line-height: 20px;
    margin-bottom: 16px;
  }
  .say_hello {
    margin-bottom: 20px;
    .text {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
      line-height: 20px;
      margin-bottom: 16px;
    }
    :deep(.el-form) {
      margin-bottom: 20px;
    }
  }

  // .strategy {
  //   // 用户私信
  //   .userMessage {
  //   }
  //   // 视频潜客
  //   .videoCustomer {
  //   }
  //   // 直播潜客
  //   .liveCustomer {
  //   }
  // }
}
</style>
