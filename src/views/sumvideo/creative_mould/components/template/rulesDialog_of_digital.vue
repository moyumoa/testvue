<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="规则设置"
    width="820px"
    custom-class="rule_setting_dialog"
  >
<!--    <template #title>-->
<!--      <div class="dialog_title">-->
<!--        规则设置-->
<!--        <span>无选中模型时，员工侧仅可用自己上传和星麦内置的模型进行替换</span>-->
<!--      </div>-->
<!--    </template>-->
    <div class="dialog_content">
      <el-tabs v-model="$data.chooseTab">
        <el-tab-pane label="面部模型" name="faceSetting">
          <rulesFilter
            :depList="$data.depList"
            :form="$data.info.faceSetting"
            :rulesOrigin="11"
            :showRules="$data.showRules"
            @updateInfo="updateFaceInfo"
          ></rulesFilter>
        </el-tab-pane>
        <el-tab-pane label="人物模型" name="personSetting">
          <rulesFilter
            :depList="$data.depList"
            :form="$data.info.personSetting"
            :rulesOrigin="12"
            :showRules="$data.showRules"
            @updateInfo="updatePersonInfo"
          ></rulesFilter>
        </el-tab-pane>
        <el-tab-pane label="音频" name="audioSetting">
          <audioRulesDOM
            :info="$data.info.audioSetting"
            origin="digital"
            @updateInfo="updateAudioInfo"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="$data.saveLoading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="$data.saveLoading" @click="saveFun">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
// 数字人的规则设置弹窗
import { setReplaceRule } from '@/api/sumvideo/creative_templateSpectroscope.js'

import { ElMessage } from 'element-plus'
import audioRulesDOM from '@/views/sumvideo/creative_mould/components/template/audioFilter_notBGM.vue'
import { getSectionTree } from '@/api/system_setting/section'
import rulesFilter from '@/views/sumvideo/creative_mould/components/template/rules_filter.vue'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  ruleDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        replaceRule: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.ruleDialog, 'show')
const $data = reactive({
  saveLoading: false,
  depList: [],
  chooseTab: 'faceSetting',
  showRules: ['isDynamicFilter', 'modelName', 'userName', 'departmentIds', 'tags'], //
  info: {
    faceSetting: {
      // // 面部模型设置
      // isDynamicFilter: true, // 是否动态筛选  默认是动态 true
      // creationIds: [], // 静态筛选时，传全部的作品 id
      // filter: {
      //   // 查看 面部/人物规则筛选配置 json
      // }
    },
    personSetting: {
      // // 人物模型设置
      // isDynamicFilter: true, // 是否动态筛选 默认是动态 true
      // creationIds: [], // 静态筛选时，传全部的作品 id
      // filter: {
      //   // 查看 面部/人物规则筛选配置 json
      // }
    },
    audioSetting: {
      //   // 音频设置，基本和 音频配置 json 相同
      //   uploadType: [1], // 音频上传类型  1直接录制 2上传音频 3文本音频 4从音频库选取 默认是1
      //   teleprompter: '提词器', // 提词器
      //   isDynamicFilter: false, // 是否动态筛选
      //   creationIds: [], // 静态筛选时，传全部的作品 id
      //   filter: {
      //     // 动态筛选时，传查询参数
      //     // 查看 筛选项配置 json
      //   },
      //   textSetting: {
      //     // 文本转音频配置
      //     isDynamicFilter: false, // 是否动态筛选
      //     creationIds: [], // 静态筛选时，传全部的作品 id
      //     filter: {
      //       // 动态筛选时，传查询参数
      //       // 查看 筛选项配置 json
      //     }
      //   },
      //   fontSetting: {
      //     autoAsr: false, // 自动生成字幕 默认关闭
      //     font: '方正楷体简体', // 字体
      //     fontSize: 16, // 字号
      //     fontColor: '#ffffff', // 字体颜色
      //     fontColorOpacity: 100, // 透明度，0-1
      //     spacing: 1, // 字间距
      //     fontFace: {
      //       bold: false, // 加粗
      //       italic: false, // 斜体
      //       underline: false // 下划线
      //     }
      //   }
    }
  }
})
function init() {
  if (props.ruleDialog.replaceRule) {
    $data.info = JSON.parse(props.ruleDialog.replaceRule)
  }
}
init()
// 获取所属部门
function getDeptListFun() {
  getSectionTree({})
    .then(res => {
      if (res.code === 0) {
        $data.depList = res.data || []
      }
    })
    .catch(() => {})
}
getDeptListFun()

function updateAudioInfo(e) {
  $data.info.audioSetting = e
}
function updateFaceInfo(e) {
  $data.info.faceSetting = e
}
function updatePersonInfo(e) {
  $data.info.personSetting = e
}
// 关闭弹窗
function closeDialog() {
  dialog.value.handleClose()
}
// 设置数据 如果是动态 就把选中的作品清空 反之就把筛选条件清空
function setSaveParam(data, key) {
  if (key === 'audioSetting' && data.uploadType.indexOf(3) === -1) {
    data.creationIds = []
    data.creationList = []
    data.filter = {}
  } else {
    if (data.isDynamicFilter) {
      data.creationIds = []
      data.creationList = []
    } else {
      data.filter = {}
    }
  }
}
// 确认弹窗
const saveFun = throttle(() => {
  $data.saveLoading = true
  const data = JSON.parse(JSON.stringify($data.info))
  console.log($data.info)
  for (const key in data) {
    if (key.indexOf('Setting') > -1) {
      setSaveParam(data[key], key)
    }
  }
  console.log(data)

  const param = {
    id: props.ruleDialog.id,
    replaceRule: JSON.stringify(data)
  }
  console.log('规则', param)
  setReplaceRule(param)
    .then(res => {
      if (res.code === 0) {
        ElMessage({
          message: '规则设置成功',
          type: 'success'
        })
      }

      closeDialog()
      $data.saveLoading = false
    })
    .catch(() => {
      closeDialog()
      $data.saveLoading = false
    })
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px 16px 0 16px;
  width: 100%;
  :deep(.el-tabs-item.is-active) {
    font-weight: 600;
  }
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}
</style>
