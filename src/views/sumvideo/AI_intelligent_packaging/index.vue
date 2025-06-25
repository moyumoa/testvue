<template>
  <div class="AI_page">
    <div class="page_title">智能包装设置</div>
    <div class="page_container" v-loading="pageLoading">
      <div class="one_container" v-for="(item, index) in titleList" :key="index">
        <div class="container_title">
          <img class="title_icon" :src="item.icon" alt="" />
          {{ item.label }}
          <el-tooltip popper-class="tooltip-class" placement="right">
            <template #content>
              <p style="max-width: 350px" v-for="(x, y) in item.tips" :key="y">{{ x }}</p>
            </template>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20250106vhw5c.png"
              style="width: 16px; height: 16px; margin-left: 8px"
            />
          </el-tooltip>
        </div>
        <div class="container_setting">
          <div class="one_setting" v-for="(x, y) in item.settingList" :key="y">
            <div class="setting_top">
              <div class="setting_title">{{ x.title }}</div>
              <div class="setting_tip" v-if="x.type == 'text'">
                {{ x.tip }}
              </div>
              <div class="setting_radio" v-else-if="x.type == 'radio'">
                <el-radio-group v-model="$data[x.radioValue]" @change="changeRadio(x)">
                  <el-radio v-for="item in x.radioList" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
            <div class="setting_bottom">
              <el-switch
                class="switch"
                inline-prompt
                :width="45"
                :active-value="true"
                :inactive-value="false"
                v-model="$data[x.switchValue]"
                :loading="x.switchLoading"
                :before-change="setSetting.bind(this, x)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  getStrategyConfigByCreativeId,
  updateStrategyConfig
} from '@/api/sumvideo/creative_templateSpectroscope.js'

const $data = reactive({
  flip: false,
  zoom: false,
  vfx: false,
  hotbgm: false,
  pFlip: false,
  pZoom: false,
  wrap: false,
  gif: false,
  cover: false,
  transition: false,
  wrapType: 1 // 字幕包装  1整体 2关键词
}) // 所有要保存的值
let serverData = reactive({})
onMounted(() => {
  pageLoading.value = true
  refreshData()
})

console.log('da', $data)
const pageLoading = ref(true)
//  刷新页面数据
function refreshData() {
  getStrategyConfigByCreativeId({ creativeId: 0 })
    .then(res => {
      if (res.code === 0) {
        serverData = res.data
        $data.flip = res.data.videoStrategy?.flip?.enable || false
        $data.zoom = res.data.videoStrategy?.zoom?.enable || false
        $data.vfx = res.data.videoStrategy?.vfx?.enable || false
        $data.hotbgm = res.data.audioStrategy?.hotbgm?.enable || false
        $data.pFlip = res.data.photoStrategy?.flip?.enable || false
        $data.pZoom = res.data.photoStrategy?.zoom?.enable || false
        $data.wrap = res.data.textStrategy?.wrap?.enable || false
        $data.gif = res.data.textStrategy?.gif?.enable || false
        $data.cover = res.data.textStrategy?.cover?.enable || false
        $data.transition = res.data.transStrategy?.enable || false

        $data.wrapType = res.data.textStrategy?.wrap?.type || 1
        //
        // $data.flip = false
        // $data.zoom = true
        // $data.vfx = true
        // $data.hotbgm = true
        // $data.pFlip = true
        // $data.pZoom = true
        // $data.wrap = true
        // $data.gif = true
        // $data.cover = false
        // $data.transition = false
        console.log('serverData', serverData)
        console.log('$data', $data)
      }

      pageLoading.value = false
    })
    .catch(() => {
      pageLoading.value = false
    })
}

/**
 * 页面配置转化成服务端需要的配置参数
 * @returns {UnwrapNestedRefs<{}>}
 */
function pageConfig2ServerConfig(item, isRadioChg) {
  if (serverData.videoStrategy === null || serverData.videoStrategy === undefined) {
    serverData.videoStrategy = {
      flip: {
        enable: false
      },
      zoom: {
        enable: false
      },
      vfx: {
        enable: false
      }
    }
  }
  if (serverData.audioStrategy === null || serverData.audioStrategy === undefined) {
    serverData.audioStrategy = {
      hotbgm: {
        enable: false
      }
    }
  }
  if (serverData.photoStrategy === null || serverData.photoStrategy === undefined) {
    serverData.photoStrategy = {
      flip: {
        enable: false
      },
      zoom: {
        enable: false
      }
    }
  }
  if (serverData.textStrategy === null || serverData.textStrategy === undefined) {
    serverData.textStrategy = {
      wrap: {
        type: $data.wrapType,
        enable: false
      },
      gif: {
        enable: false
      },
      cover: {
        enable: false
      }
    }
  }
  if (serverData.transStrategy === null || serverData.transStrategy === undefined) {
    serverData.transStrategy = {
      enable: false
    }
  }
  serverData.textStrategy.wrap.type = $data.wrapType
  if (isRadioChg) {
    serverData.videoStrategy.flip.enable = $data.flip
    serverData.videoStrategy.zoom.enable = $data.zoom
    serverData.videoStrategy.vfx.enable = $data.vfx
    serverData.audioStrategy.hotbgm.enable = $data.hotbgm
    serverData.photoStrategy.flip.enable = $data.pFlip
    serverData.photoStrategy.zoom.enable = $data.pZoom
    serverData.textStrategy.wrap.enable = $data.wrap

    serverData.textStrategy.gif.enable = $data.gif
    serverData.textStrategy.cover.enable = $data.cover
    serverData.transStrategy.enable = $data.transition
  } else {
    serverData.videoStrategy.flip.enable = item.switchValue === 'flip' ? !$data.flip : $data.flip
    serverData.videoStrategy.zoom.enable = item.switchValue === 'zoom' ? !$data.zoom : $data.zoom
    serverData.videoStrategy.vfx.enable = item.switchValue === 'vfx' ? !$data.vfx : $data.vfx
    serverData.audioStrategy.hotbgm.enable =
      item.switchValue === 'hotbgm' ? !$data.hotbgm : $data.hotbgm
    serverData.photoStrategy.flip.enable = item.switchValue === 'pFlip' ? !$data.pFlip : $data.pFlip
    serverData.photoStrategy.zoom.enable = item.switchValue === 'pZoom' ? !$data.pZoom : $data.pZoom
    serverData.textStrategy.wrap.enable = item.switchValue === 'wrap' ? !$data.wrap : $data.wrap
    serverData.textStrategy.gif.enable = item.switchValue === 'gif' ? !$data.gif : $data.gif
    serverData.textStrategy.cover.enable = item.switchValue === 'cover' ? !$data.cover : $data.cover
    serverData.transStrategy.enable =
      item.switchValue === 'transition' ? !$data.transition : $data.transition
  }
  // 字幕包装 只有整体样式包装 但是穿参结构不变 所以这里默认选上整体样式 type = 1
  serverData.textStrategy.wrap = {
    ...serverData.textStrategy.wrap,
    type: 1
  }

  return serverData
}

const titleList = reactive([
  {
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250106mam7x.png',
    label: '视频',
    value: 'video',
    tips: [
      '1 、模板跟拍时，非替换项的视频分镜会进行智能包装',
      '2 、后台合成时，所有视频分镜会进行智能包装'
    ],
    settingList: [
      {
        title: '水平镜像',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '左右水平镜像画面',
        radioList: [],
        switchLoading: false,
        switchValue: 'flip' // 对应$data里的某个字段
      },
      {
        title: '画面动态放大',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '随机动态放大画面比例',
        radioList: [],
        switchLoading: false,
        switchValue: 'zoom' // 对应$data里的某个字段
      },
      {
        title: '视频特效',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '随机添加不影响视频画面的效果',
        radioList: [],
        switchLoading: false,
        switchValue: 'vfx' // 对应$data里的某个字段
      }
    ]
  },
  {
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250106ez59u.png',
    label: '图片',
    value: 'img',
    tips: [
      '1 、模板跟拍时，非替换项的图片分镜会进行智能包装',
      '2 、后台合成时，所有图片分镜会进行智能包装'
    ],
    settingList: [
      {
        title: '水平镜像',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '左右水平镜像画面',
        radioList: [],
        switchLoading: false,
        switchValue: 'pFlip' // 对应$data里的某个字段
      },
      {
        title: '画面动态放大',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '随机动态放大画面比例',
        radioList: [],
        switchLoading: false,
        switchValue: 'pZoom' // 对应$data里的某个字段
      }
    ]
  },
  {
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202501067k17n.png',
    label: '音频',
    value: 'audio',
    tips: ['模板跟拍和后台合成时，被系统智能识别为 BGM 音频分镜（非替换项）会替换为热门 BGM'],
    settingList: [
      {
        title: '热门BGM',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '随机替换抖音实时热门BGM',
        radioList: [],
        switchLoading: false,
        switchValue: 'hotbgm' // 对应$data里的某个字段
      }
    ]
  },
  {
    icon: 'https://tagvv-1256030678.file.myqcloud.com/2025010624qcm.png',
    label: '文本',
    value: 'text',
    tips: [
      '模板跟拍和后台合成时，被系统识别为字幕的文本会进行样式包装、增加智能贴纸；识别为封面的文本会进行样式包装'
    ],
    settingList: [
      {
        title: '字幕包装',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '整体样式包装',
        // radioList: [
        //   {
        //     label: '整体样式包装',
        //     value: 1
        //   },
        //   {
        //     label: '关键词样式包装',
        //     value: 2
        //   }
        // ],
        radioValue: 'wrapType', // 对应$data里的某个字段
        switchLoading: false,
        switchValue: 'wrap' // 对应$data里的某个字段
      },
      {
        title: '智能贴纸',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '智能识别字幕添加热门贴纸',
        radioList: [],
        switchLoading: false,
        switchValue: 'gif' // 对应$data里的某个字段
      },
      {
        title: '智能封面',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '智能识别封面替换热门样式',
        radioList: [],
        switchLoading: false,
        switchValue: 'cover' // 对应$data里的某个字段
      }
    ]
  },
  {
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250106q5ki2.png',
    label: '整体',
    value: 'all',
    tips: ['模板跟拍和后台合成时，系统会识别视频片段，智能替换或添加视频转场'],
    settingList: [
      {
        title: '转场',
        type: 'text', // 类型 text 取tip radio 取radioList
        tip: '随机替换通用转场',
        radioList: [],
        switchLoading: false,
        switchValue: 'transition' // 对应$data里的某个字段
      }
    ]
  }
])

// 单选框修改  跟产品沟通过radio切换不请求服务器，下方的开关切换才请求
function changeRadio(e) {
  console.log('e', e)
  const params = pageConfig2ServerConfig(e, true)
  updateStrategyConfig(params)
    .then(res => {
      if (res.code === 0) {
        // refreshData()
      }
    })
    .catch(err => {
      console.log('策略修改失败', err)
    })
}

// 开关修改
function setSetting(item, item2) {
  console.log('item', item)
  console.log('item2', item2)
  item.switchLoading = true
  return new Promise((resolve, reject) => {
    // let strategyIds = strategyList.value.filter(item => item.switchStatus).map(item => item.id)
    // // 当前更改项
    // if (!item.switchStatus) {
    //   strategyIds.push(item.id)
    // } else {
    //   strategyIds = strategyIds.filter(x => {
    //     return x !== item.id
    //   })
    // }
    const params = pageConfig2ServerConfig(item, false)
    updateStrategyConfig(params)
      .then(res => {
        item.switchLoading = false
        if (res.code === 0) {
          // refreshData()
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch(err => {
        item.switchLoading = false
        console.log('策略修改失败', err)
        reject(new Error('修改降重策略失败'))
      })
  })
}
</script>
<style lang="scss" scoped>
.AI_page {
  width: 100%;
  min-height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 22px 28px 22px 24px;

  .page_title {
    font-weight: 600;
    font-size: 16px;
    color: #303133;
    line-height: 22px;
  }

  .page_container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;

    .one_container {
      margin-top: 16px;
      margin-right: 16px;
      width: calc((100% - 16px) / 2);
      min-height: 192px;
      background: #f7f8fa;
      border-radius: 4px;
      padding: 16px 0 0px 16px;

      .container_title {
        margin-bottom: 12px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        line-height: 22px;

        .title_icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          display: flex;
          margin-right: 8px;
        }
      }

      .container_setting {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;

        .one_setting {
          width: calc((100% - 48px) / 3);
          min-height: 126px;
          background: #ffffff;
          border-radius: 4px;
          margin-right: 16px;
          margin-bottom: 16px;
          padding: 12px 16px 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;

          .setting_title {
            font-weight: 600;
            font-size: 14px;
            color: #303133;
            line-height: 20px;
          }

          .setting_tip {
            margin-top: 6px;
            font-weight: 400;
            font-size: 12px;
            color: #909399;
            line-height: 18px;
          }

          .setting_bottom {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
          }
        }

        .one_setting:hover {
          box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .one_container:nth-child(2n) {
      margin-right: 0;
    }
  }
}

:deep(.el-radio-group) {
  height: max-content;

  .el-radio {
    margin-top: 6px;
    color: #303133;
    height: 20px;
  }
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #303133;
}
</style>
