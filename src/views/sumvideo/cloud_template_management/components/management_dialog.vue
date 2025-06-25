<template>
  <div>
    <el-dialog
      custom-class="info_dialog category_tag_dialog"
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="
        props.managementDialog.origin == 'cloud_template_management' ? '管理云模板' : '云模板'
      "
      width="820px"
    >
      <div class="dialog_content" v-loading="loading">
        <!-- 视频区 -->
        <div class="content_left">
          <video
            v-if="forms.materialPath"
            :src="forms.materialPath"
            :poster="forms.coverUrl"
            controls
          ></video>
          <!-- 数字人标识 -->
          <img
            v-if="forms.tag == 2"
            class="digital_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
            alt=""
          />
        </div>
        <!-- 信息区 -->
        <div class="content_right">
          <div
            class="template_title"
            v-if="props.managementDialog.origin != 'cloud_template_management'"
          >
            {{ forms.name || '' }}
          </div>
          <el-form
            :model="forms"
            hide-required-asterisk
            ref="ruleForm"
            label-width="98px"
            :rules="rules"
          >
            <el-form-item
              label="模板名称："
              prop="name"
              v-if="props.managementDialog.origin == 'cloud_template_management'"
            >
              <el-input
                maxlength="20"
                show-word-limit
                v-model="forms.name"
                clearable
                @blur="retEmit($event)"
                style="width: 438px"
                placeholder="请输入模板名称"
              />
            </el-form-item>
            <el-form-item label="创意结构：" class="structure_from_item">
              <div class="structure_box">
                <div class="one_structure">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20231008eu2on.png" alt="" />
                  视频：
                  <span>{{ forms.videoClipCnt || 0 }}</span>
                </div>
                <div class="one_structure">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20231008uxdlo.png" alt="" />
                  图片：
                  <span>{{ forms.photoClipCnt || 0 }}</span>
                </div>
                <div class="one_structure">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20231008o812h.png" alt="" />
                  音频：
                  <span>{{ forms.audioClipCnt || 0 }}</span>
                </div>
              </div>
            </el-form-item>
            <el-form-item
              label="模板状态："
              prop="isCloudOpen"
              style="margin-bottom: 4px"
              v-if="props.managementDialog.origin == 'cloud_template_management'"
            >
              <el-switch
                v-model="forms.isCloudOpen"
                active-text="已公开"
                inactive-text="已隐藏"
                :active-value="1"
                :inactive-value="0"
                :width="66"
              ></el-switch>
            </el-form-item>

            <el-form-item
              label="适用行业："
              prop="tradeType"
              :style="
                props.managementDialog.origin == 'cloud_template_management'
                  ? forms.tradeType && forms.tradeType == 1
                    ? 'margin-bottom: 8px'
                    : ''
                  : 'margin-bottom:8px;margin-top:0px'
              "
            >
              <div v-if="props.managementDialog.origin == 'cloud_template_management'">
                <el-radio-group v-model="forms.tradeType" @change="changeTradeType">
                  <el-radio :label="1">通用</el-radio>
                  <el-radio :label="2">特定行业</el-radio>
                </el-radio-group>
                <div
                  class="flex_box"
                  style="margin-top: 6px"
                  v-if="forms.tradeType && forms.tradeType == 2"
                >
                  <el-select
                    v-model="forms.chooseTrade"
                    placeholder="请选择行业"
                    style="width: 180px"
                    filterable
                    collapse-tags
                    @change="changeTrade"
                  >
                    <el-option
                      v-for="item in tradeList"
                      :label="item.name"
                      :value="item.id"
                      :key="item.id"
                    />
                  </el-select>
                  <el-select
                    v-model="forms.chooseCategory"
                    placeholder="请选择细分类别"
                    style="width: calc(100% - 196px); margin-left: 16px"
                    multiple
                    filterable
                    collapse-tags
                    @change="changeCategory"
                    value-key="id"
                  >
                    <el-option
                      v-for="item in categoryList"
                      :label="item.name"
                      :value="item"
                      :key="item.id"
                    />
                  </el-select>
                </div>
              </div>
              <div class="one_trade_box" v-else>
                <div class="one_trade" v-for="(item, index) in suggestList" :key="index">
                  {{ item.name }}
                </div>
              </div>
            </el-form-item>
            <el-form-item label="使用建议：" prop="suggest">
              <el-input
                v-if="props.managementDialog.origin != 'cloud_template'"
                v-model.trim="forms.suggest"
                :placeholder="
                  props.managementDialog.origin == 'cloud_template_management'
                    ? '请输入使用建议'
                    : ''
                "
                type="textarea"
                resize="none"
                maxlength="150"
                style="width: 438px"
                :autosize="{ minRows: 3, maxRows: 3 }"
                show-word-limit
              ></el-input>
              <div v-else class="suggest_content">{{ forms.suggest || '--' }}</div>
              <!-- <div class="suggest_box">
                <div class="one_suggest" v-for="(item, index) in suggestList" :key="index">
                  <div class="suggest_title">{{ item.name }}</div>
                  <el-input
                    :readonly="props.managementDialog.origin == 'cloud_template'"
                    :ref="tagContentRef"
                    v-model.trim="item.suggest"
                    :placeholder="
                      props.managementDialog.origin == 'cloud_template_management'
                        ? '请输入使用建议'
                        : ''
                    "
                    type="textarea"
                    resize="none"
                    maxlength="150"
                    style="width: 438px"
                    :autosize="{ minRows: 3, maxRows: 3 }"
                    show-word-limit
                  ></el-input>
                </div>
              </div> -->
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer v-if="!loading">
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            v-if="props.managementDialog.origin == 'cloud_template_management'"
            type="primary"
            :loading="saveLoading"
            @click="handleConfirm"
          >
            保存
          </el-button>

          <el-button v-else type="primary" :loading="downLoading" @click="handleDown">
            确认保存到企业模板
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { templateToProject } from '@/api/sumvideo/creative_templateSpectroscope.js'

import { ElMessage } from 'element-plus'
import { details, modify } from '@/api/sumvideo/creative_mould.js'

import { throttle } from '@/utils/tools.js'
import { findChildrenByKey, findByKey } from '@/api/content_center/video_library.js'
const props = defineProps({
  managementDialog: {
    type: Object,
    default: () => {
      return {
        origin: '', // cloud_template_management 云模板管理过来的 cloud_template云模板过来的
        show: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.managementDialog, 'show')
const tradeList = ref([]) // 行业列表
const categoryList = ref([]) // 细分类别列表
const suggestList = ref([]) // 使用建议列表
// const tagRef = ref([])
// const tagContentRef = el => {
//   tagRef.value.push(el)
// }
// 适用行业的校验
const validateTradeType = (rule, value, callback) => {
  if (forms.value.tradeType === 1) {
    callback()
  } else {
    if (
      forms.value.chooseTrade &&
      forms.value.chooseCategory &&
      forms.value.chooseCategory.length > 0
    ) {
      callback()
    } else {
      callback(new Error('请选择适用行业'))
    }
  }
}
// // 使用建议的校验
// const validateSuggest = (rule, value, callback) => {
//   if (suggestList.value && suggestList.value.length > 0) {
//     let isText = true
//     suggestList.value.forEach(x => {
//       if (!x.suggest) {
//         isText = false
//       }
//     })
//     if (isText) {
//       callback()
//     } else {
//       callback(new Error('请输入使用建议'))
//     }
//   } else {
//     callback(new Error('请选择适用行业'))
//   }
// }
const forms = ref({}) // 表单信息
const rules = reactive({
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  tradeType: [
    {
      required: true,
      validator: validateTradeType,
      trigger: 'change'
    }
  ],
  suggest: [
    {
      required: props.managementDialog.origin === 'cloud_template_management',
      message: '请输入使用建议',
      trigger: 'blur'
    }
  ]
})

function retEmit(e, index) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  forms.value.name = e.target.value.replace(reg, '')
}
// --根据key去查询对应的数据 type类型:trade行业 category细分类别
function getKey(key, type, isFirst) {
  findChildrenByKey({
    brandId: 0,
    key: key
  })
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        switch (type) {
          case 'trade':
            tradeList.value = list
            if (list && list.length > 0) {
              // 如果未设置过特定行业，就默认选中第一个，否则就按设置过得走
              if (
                forms.value.chooseTrade &&
                forms.value.chooseCategory &&
                forms.value.chooseCategory.length > 0
              ) {
                const chooseTradeList = list.filter(x => x.id === forms.value.chooseTrade)
                if (chooseTradeList && chooseTradeList.length > 0) {
                  getKey(chooseTradeList[0].key, 'category', true)
                } else {
                  loading.value = false
                }
              } else {
                forms.value.chooseTrade = list[0].id
                getKey(list[0].key, 'category', true)
              }
            } else {
              loading.value = false
            }
            break
          case 'category':
            categoryList.value = list.map(x => ({
              id: x.id,
              name: x.name
            }))
            if (isFirst && list && list.length > 0) {
              if (forms.value.chooseCategory && forms.value.chooseCategory.length > 0) {
                // 如果后端没有返回二级行业名称，就自己取
                // const cl = []
                // forms.value.chooseCategory.forEach(x => {
                //   list.forEach(y => {
                //     if (x === y.id) {
                //       cl.push(y)
                //     }
                //   })
                // })
                // forms.value.chooseCategory = cl
                // suggestList.value.forEach(x => {
                //   list.forEach(y => {
                //     if (x.tradeId === y.id) {
                //       x.name = y.name
                //     }
                //   })
                // })
              } else {
                forms.value.chooseCategory = [list[0]]
              }
            }
            loading.value = false
            break
        }
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}
const commonList = ref(null) // 通用
// 获取公共的
function getCommonKey(key, type) {
  findByKey({
    brandId: 0,
    key: key
  })
    .then(res => {
      if (res.code === 0) {
        const list = res.data || null
        switch (type) {
          case 'trade_common':
            commonList.value = list
            break
        }
      }
    })
    .finally(() => {
      getDeatail()
    })
}
// 初始化当使用建议是通用的数据
function initCommonObj(suggest) {
  suggestList.value = [
    {
      tradeId: commonList.value ? commonList.value.id : '',
      tradeType: 1,
      name: commonList.value ? commonList.value.name : '通用',
      suggest: suggest || ''
    }
  ]
}
// 行业选择器变动时，要清空细分类别列表、使用建议列表
function changeTrade(e) {
  forms.value.chooseCategory = null
  suggestList.value = []
  const keys = tradeList.value.filter(x => x.id === e)
  getKey(keys[0].key, 'category')
  // 切换时，要重新校验下使用建议。
  // ruleForm.value.validateField('suggest')
}
// 细分类别切换时 使用建议列表也要跟着改
function changeCategory(e) {
  const oldList = JSON.parse(JSON.stringify(suggestList.value))
  const newList = []

  e.forEach(x => {
    let has = false
    let info = null
    oldList.forEach(y => {
      if (x.id === y.id) {
        info = y
        has = true
      }
    })
    if (has) {
      newList.push(info)
    } else {
      newList.push({
        tradeId: x.id,
        name: x.name,
        tradeType: 2,
        suggest: ''
      })
    }
  })
  suggestList.value = newList
  // 切换时，要重新校验下使用建议。
  // ruleForm.value.validateField('suggest')
}
// 切换适用行业
function changeTradeType(e) {
  // 通用使用建议就换成一个通用
  if (e === 1) {
    initCommonObj()
  } else {
    // 否则就看选择的行业
    if (forms.value.chooseCategory && forms.value.chooseCategory.length > 0) {
      const newList = []
      forms.value.chooseCategory.forEach(x => {
        newList.push({
          tradeId: x.id,
          name: x.name,
          tradeType: 2,
          suggest: ''
        })
      })
      suggestList.value = newList
    } else {
      suggestList.value = []
    }
  }
  // 切换时，要重新校验下使用建议。
  // ruleForm.value.validateField('suggest')
}
const oldCategoryIds = ref([])
const oldTradeType = ref(null)
const loading = ref(true)
// 获取模板详情
function getDeatail() {
  loading.value = true
  details(props.managementDialog.id)
    .then(res => {
      if (res.code === 0) {
        const data = res.data || {}

        // 设置适用行业
        if (data.creativeTrades && data.creativeTrades.length > 0) {
          let isCommon = false
          let suggest = ''
          const categorys = []
          oldTradeType.value = data.creativeTrades[0].tradeType
          const categoryIds = [] // 将首次打开时的二级行业ID存起来。保存的时候如果有改动，那就刷新列表
          data.creativeTrades.forEach(x => {
            x.name = x.tradeName || ''
            x.id = x.tradeId
            if (x.tradeType === 1) {
              isCommon = true
              suggest = x.suggest || ''
            }
            categoryIds.push(x.tradeId)
            categorys.push({ id: x.tradeId, name: x.tradeName })
          })
          // 通用
          if (isCommon) {
            data.tradeType = 1
            data.chooseTrade = null
            data.chooseCategory = null

            initCommonObj(suggest)
          } else {
            data.tradeType = 2
            data.chooseTrade = data.rootTradeId || null
            data.chooseCategory = categorys
            suggestList.value = data.creativeTrades
          }
          oldCategoryIds.value = categoryIds
        } else {
          data.tradeType = 1
          data.chooseTrade = null
          data.chooseCategory = null
          initCommonObj()
        }
        forms.value = data
        if (props.managementDialog.origin === 'cloud_template_management') {
          // 云模板管理过来才去获取所有行业
          getKey('trade', 'trade')
        } else {
          loading.value = false
        }
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      closeDialog()
      loading.value = false
    })
}
onMounted(() => {
  if (props.managementDialog.origin === 'cloud_template_management') {
    getCommonKey('trade_common', 'trade_common')
  } else {
    getDeatail()
  }
})
const saveLoading = ref(false)
const ruleForm = ref(null)
// 比较两个数组的差距
function differenceFun(a, b) {
  const newA = new Set(a)
  const newB = new Set(b)
  if (a.length === b.length) {
    const differenceABSet = Array.from(new Set([...newA].filter(x => !newB.has(x))))

    if (differenceABSet.length === 0) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
const emits = defineEmits(['updateOneInfo'])
// 弹窗的保存事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      saveLoading.value = true
      let isChangeTrade = false // 如果有改动适用行业，那就设为tradeType
      // 如果type一样，type是1[通用情况下]，那就没改，非1，就判断行业ID是否一样。如果type不一样，就代表改了
      const categoryIds = suggestList.value.map(x => {
        return x.tradeId
      })
      if (oldTradeType.value === suggestList.value[0].tradeType) {
        if (oldTradeType.value !== 1) {
          isChangeTrade = !differenceFun(oldCategoryIds.value, categoryIds)
        } else {
          isChangeTrade = false
        }
      } else {
        isChangeTrade = true
      }
      modify({
        creativeId: forms.value.id,
        creativeTrades: suggestList.value,
        isCloudOpen: forms.value.isCloudOpen,
        name: forms.value.name || '',
        suggest: forms.value.suggest || ''
      })
        .then(res => {
          if (res.code === 0) {
            ElMessage({
              message: '保存成功',
              type: 'success'
            })
            dialog.value.handleClose()

            emits('updateOneInfo', isChangeTrade ? 'tradeType' : '')
          } else {
            saveLoading.value = false
          }
        })
        .catch(() => {
          saveLoading.value = false
        })
    } else {
      nextTick(() => {
        const isError = document.getElementsByClassName('is-error')
        if (isError && isError.length > 0) {
          const errText = isError[0].innerText ? isError[0].innerText.split('\n') : []
          if (errText.length > 0) {
            ElMessage({
              message: errText[errText.length - 1],
              type: 'warning'
            })
          }
        }
      })
    }
  })
}, 500)
// 弹窗的取消事件
function closeDialog() {
  dialog.value.handleClose()
}
// 弹窗的确认下载事件
const downLoading = ref(false)
const handleDown = throttle(() => {
  downLoading.value = true
  templateToProject({
    creativeId: forms.value.id,
    targetBrandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '' // 品牌Id
  })
    .then(res => {
      if (res.code === 0) {
        ElMessage({
          message: '保存成功，请前往企业模板列表查看！',
          type: 'success'
        })
        dialog.value.handleClose()
      } else {
        downLoading.value = false
      }
    })
    .catch(() => {
      downLoading.value = false
    })
}, 500)
</script>

<style lang="scss" scoped>
.dialog_content {
  padding: 16px 0 16px 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_left {
    width: 252px;
    height: 448px;
    position: relative;
    border-radius: 4px;
    video {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
    .digital_icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 62px;
      height: 62px;
    }
  }
  .content_right {
    width: 552px;
    height: 448px;
    overflow-y: auto;
    padding-right: 16px;
    .template_title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      line-height: 24px;
      margin-bottom: 16px;
      padding-left: 21px;
    }
  }
}
.structure_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .one_structure {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
      margin-right: 4px;
    }
    span {
      font-size: 14px;
      font-weight: 600;
      color: #364fcd;
      line-height: 20px;
    }
  }
  .one_structure + .one_structure {
    margin-left: 24px;
  }
}
.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.structure_from_item {
  margin: -8px 0 4px;
}
:deep(.content_right .el-form-item__label) {
  padding-right: 8px;
}
:deep(.el-select .el-select__tags .el-tag) {
  margin: 2px 0px 2px 6px;
}
:deep(.el-switch__label) {
  position: absolute;
  display: none;
  color: #fff;
  * {
    font-size: 12px !important;
  }
}
/*打开时文字位置设置*/
:deep(.el-switch__label--right) {
  z-index: 1;
  right: 20px;
}
/*关闭时文字位置设置*/
:deep(.el-switch__label--left) {
  z-index: 1;
  left: 20px;
}
/*显示文字*/
:deep(.el-switch__label.is-active) {
  display: block;
}
:deep(.el-switch .el-switch__core, .el-switch .el-switch__label) {
  width: 66px;
}
.suggest_box {
  .one_suggest {
    .suggest_title {
      width: max-content;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      margin-top: 4px;
      margin-bottom: 12px;
    }
  }
  .one_suggest + .one_suggest {
    margin-top: 12px;
  }
}
.one_trade_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  .one_trade {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    margin: 4px 12px 4px 0;
  }
}
.suggest_content {
  padding: 4px 0;
  line-height: 24px;
}
</style>
