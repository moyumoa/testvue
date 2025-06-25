<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="字幕高级设置"
    width="820px"
    custom-class="rule_setting_dialog"
    @close="closeDialog"
  >
    <div class="audio_rules">
      <!-- 配置区 -->
      <div class="rules_left" ref="scrollRef">
        <!-- 字体 -->
        <div class="one_rules" style="margin-top: 16px">
          <div class="one_label">字体：</div>
          <div class="one_content">
            <el-select
              v-model="$data.info.fontSetting.font"
              placeholder="请选择字体"
              style="width: 276px"
            >
              <el-option
                v-for="item in $data.fontList"
                :label="item.font"
                :value="item.fontKey"
                :key="item.id"
              />
            </el-select>
          </div>
        </div>
        <!-- 字号 -->
        <div class="one_rules">
          <div class="one_label">字号：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.fontSize"
              :min="12"
              :max="50"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 字间距 -->
        <div class="one_rules">
          <div class="one_label">字间距：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.spacing"
              :min="0"
              :max="10"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <!-- 行间距 -->
        <div class="one_rules">
          <div class="one_label">行间距：</div>
          <div class="one_content">
            <el-input-number
              v-model="$data.info.fontSetting.lineSpacing"
              :min="0"
              :max="10"
              :step="1"
              style="width: 100px"
              controls-position="right"
            />
          </div>
        </div>
        <div class="one_rules">
          <div class="one_label">字幕位置：</div>
          <div class="one_content" style="align-items: center">
            X
            <el-input-number
              v-model="$data.info.fontSetting.x"
              :min="0"
              :max="375"
              :step="1"
              style="width: 100px; margin-left: 8px; margin-right: 16px"
              controls-position="right"
              :disabled="$data.info.fontSetting.alignment"
            />
            <el-checkbox
              v-model="$data.info.fontSetting.alignment"
              style="margin-bottom: 0; margin-right: 16px"
              @change="handelChangeTextCenter"
            >
              居中
            </el-checkbox>
            Y
            <el-input-number
              v-model="$data.info.fontSetting.y"
              :min="0"
              :max="yMax"
              :step="1"
              style="width: 100px; margin-left: 8px"
              controls-position="right"
            />
          </div>
        </div>

        <!-- 颜色 -->
        <div class="one_rules">
          <div class="one_label">颜色：</div>
          <div class="one_content">
            <el-color-picker style="width: 60px" v-model="$data.info.fontSetting.fontColor" />
          </div>
        </div>
        <!-- 透明度 -->
        <div class="one_rules">
          <div class="one_label">透明度：</div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.fontColorOpacity"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="100"
              :min="0"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.fontColorOpacity"
              :max="100"
              :min="0"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>

        <!-- 样式： -->
        <div class="one_rules">
          <div class="one_label label_24">样式：</div>
          <div class="one_content">
            <el-checkbox v-model="$data.info.fontSetting.fontFace.italic">斜体</el-checkbox>
            <el-checkbox v-model="$data.info.fontSetting.fontFace.bold">加粗</el-checkbox>
            <el-checkbox v-model="$data.info.fontSetting.fontFace.underline">下划线</el-checkbox>
          </div>
        </div>
        <!-- 边框格式 -->
        <div class="one_rules" style="margin-top: 8px">
          <div class="one_label label_24" style="font-weight: 600">边框格式：</div>
          <div class="one_content">
            <div class="top_check" @click="borderStyleChange(1)">
              <el-checkbox v-if="$data.info.fontSetting.borderStyle == 1" checked>描边</el-checkbox>
              <el-checkbox v-else>描边</el-checkbox>
              <div class="check_mask"></div>
            </div>
            <div class="top_check" @click="borderStyleChange(3)">
              <el-checkbox v-if="$data.info.fontSetting.borderStyle == 3" checked>背景</el-checkbox>
              <el-checkbox v-else>背景</el-checkbox>
              <div class="check_mask"></div>
            </div>
          </div>
        </div>
        <!-- 颜色 -->
        <div class="one_rules" style="margin-top: 8px" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}颜色：
          </div>
          <div class="one_content">
            <el-color-picker style="width: 60px" v-model="$data.info.fontSetting.outlineColour" />
          </div>
        </div>
        <!-- 宽度 -->
        <div class="one_rules" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}宽度：
          </div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.outline"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="5"
              :min="1"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.outline"
              :max="5"
              :min="1"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>

        <!-- 不透明度 -->
        <div class="one_rules" v-if="$data.info.fontSetting.borderStyle">
          <div class="one_label">
            {{
              $data.info.fontSetting.borderStyle == 3
                ? '背景'
                : $data.info.fontSetting.borderStyle == 1
                ? '描边'
                : ''
            }}不透明度：
          </div>
          <div class="one_content">
            <el-slider
              style="width: 252px"
              v-model="$data.info.fontSetting.outlineOpacity"
              :show-tooltip="false"
              :show-input-controls="false"
              :max="100"
              :min="0"
              :step="1"
            ></el-slider>
            <el-input-number
              style="width: 100px; margin-left: 8px"
              v-model="$data.info.fontSetting.outlineOpacity"
              :max="100"
              :min="0"
              :step="1"
              controls-position="right"
            />
          </div>
        </div>
      </div>
      <!-- 字幕预览区 -->
      <div class="rules_right">
        <img
          class="right_phone"
          src="https://tagvv-1256030678.file.myqcloud.com/20230322p812u.png"
          alt=""
        />
        <div class="right_mark">预览效果仅供参考，可能存在细微偏差</div>
        <div class="right_bottom">
          <sampleSubtitlesDOM
            :fontSetting="$data.info.fontSetting"
            @updatePosition="updatePosition"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveFun">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { getFontList } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { isEmpty, throttle } from '@/utils/tools.js'
import sampleSubtitlesDOM from '@/views/sumvideo/creative_mould/components/template/sample_subtitles.vue'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {}
    }
  },
  show: {
    type: Boolean,
    default: false
  }
})
const { show } = toRefs(props)
const $data = reactive({
  info: {}, // 保存信息
  fontList: [] // 字体列表
})
const yMax = ref(-1)

function updatePosition(canvasH, domH) {
  const hDiff = canvasH - domH

  let deepYmax = JSON.parse(JSON.stringify(yMax.value))
  yMax.value = Math.ceil((hDiff / canvasH) * 667)

  if (deepYmax === -1) {
    $data.info.fontSetting.y = Math.ceil((hDiff / canvasH) * 667)
  }

  if (deepYmax !== yMax.value) {
    if ($data.info.fontSetting.y > yMax.value || $data.info.fontSetting.y === undefined) {
      $data.info.fontSetting.y = yMax.value
    }
    deepYmax = yMax.value
  }
}

// 获取字体列表
function getFontFun() {
  getFontList({
    applyType: 1,
    orderSetting: '',
    pageNo: 1,
    pageSize: 1000,
    searchCount: true
  }).then(res => {
    if (res.code === 0) {
      $data.fontList = res.data.records || []
    }
  })
}

function handelChangeTextCenter(e) {
  if (e) {
    $data.info.fontSetting.x = 0
  }
}

function init() {
  const fontSetting = {
    autoAsr: false, // 自动生成字幕 默认关闭
    font: 'wqy-microhei', // 字体
    fontSize: 16, // 字号
    fontColor: '#ffffff', // 字体颜色
    fontColorOpacity: 100, // 透明度，1-100
    spacing: 0, // 字间距
    lineSpacing: 0, // 行间距
    fontFace: {
      bold: false, // 加粗
      italic: false, // 斜体
      underline: false // 下划线
    },
    borderStyle: null, // 边框格式类型 1描边 3背景
    outlineColour: null, // 描边颜色
    outline: null, // 描边宽度
    outlineOpacity: null, // 不透明度
    alignment: true,
    x: 0,
    y: 0
  }
  if (!isEmpty(props.info)) {
    const info = JSON.parse(JSON.stringify(props.info))
    if (!(props.info.fontSetting && !isEmpty(props.info.fontSetting))) {
      info.fontSetting = fontSetting
    } else {
      // 老数据：设置数字人音频的行间距默认值
      if (!(info.fontSetting.lineSpacing && info.fontSetting.lineSpacing > 0)) {
        info.fontSetting.lineSpacing = 0
      }
    }
    $data.info = info
  } else {
    $data.info = {
      isDynamicFilter: true,
      fontSetting: fontSetting
    }
  }
}

const emits = defineEmits(['updateInfo', 'close', 'save'])

const scrollRef = ref(null)
// 边框格式修改
function borderStyleChange(type) {
  if (type === 1) {
    if ($data.info.fontSetting.borderStyle === 1) {
      $data.info.fontSetting.borderStyle = null
      $data.info.fontSetting.outline = null
      $data.info.fontSetting.outlineColour = null
      $data.info.fontSetting.outlineOpacity = null
    } else {
      $data.info.fontSetting.borderStyle = 1
      $data.info.fontSetting.outline = 2
      $data.info.fontSetting.outlineColour = '#000000'
      $data.info.fontSetting.outlineOpacity = 100
    }
  } else {
    if ($data.info.fontSetting.borderStyle === 3) {
      $data.info.fontSetting.borderStyle = null
      $data.info.fontSetting.outline = null
      $data.info.fontSetting.outlineColour = null
      $data.info.fontSetting.outlineOpacity = null
    } else {
      $data.info.fontSetting.borderStyle = 3
      $data.info.fontSetting.outline = 2
      $data.info.fontSetting.outlineColour = '#000000'
      $data.info.fontSetting.outlineOpacity = 100
    }
  }
  nextTick(() => {
    scrollRef.value.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' })
  })
}
const closeDialog = throttle(function () {
  emits('close')
})
const saveFun = throttle(function () {
  emits('save', $data.info)
})
getFontFun()
init()
</script>
<style lang="scss" scoped>
// @import './scss/rules.scss';
@import '@/views/sumvideo/creative_mould/components/template/scss/rules.scss';
div {
  box-sizing: border-box;
}
.audio_rules {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px 0 20px 16px;
  .rules_left {
    width: 525px;
    max-height: 56vh;
    overflow-y: auto;
    margin-right: 16px;
  }
  .rules_right {
    width: 228px;
    // height: 494px;
    position: relative;
    overflow: hidden;
    .right_phone {
      width: 100%;
      height: 494px;
      display: flex;
      object-fit: contain;
    }
    .right_mark {
      width: 100%;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 17px;
      text-align: center;
    }
    .right_bottom {
      position: absolute;
      left: 5px;
      bottom: 71px;
      width: calc(100% - 10px);
      text-align: center;
      overflow: hidden;
      height: 404px;
      // display: flex;
      // flex-direction: column;
      // justify-content: flex-end;
      // align-items: flex-end;
    }
    .right_text {
      width: 100%;
      text-align: center;
      line-height: 1.2;
    }
  }
}
.warn_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #f1924e;
  padding-left: 106px;
  margin-bottom: 16px;
  .el-icon {
    margin-right: 6px;
  }
}

.top_check {
  position: relative;
  .check_mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    cursor: pointer;
  }
}
.top_check + .top_check {
  margin-left: 30px;
}
</style>
