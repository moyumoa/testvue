<template>
  <div class="mount_dialog">
    <div class="setting_entry">
      <slot>
        <!-- 已经设置项       -->
        <div class="set_text" v-if="setItem">已设置：{{ setItem }}</div>
        <el-button type="primary" @click="showDialog = true">设置</el-button>
      </slot>
    </div>
    <!-- 10237：先给挂载项设置增加点击遮罩层不关闭   -->
    <el-dialog
      v-model="showDialog"
      @close="dialogClose"
      @open="init"
      title="挂载项设置"
      :width="580"
      :close-on-click-modal="false"
    >
      <div class="setting_dialog">
        <el-form :label-width="100">
          <template v-if="videoPlatform === '0' || videoPlatform === '1'">
            <div class="module-title">抖音</div>
            <div class="module-container" style="margin-bottom: 16px">
              <!--   话题       -->
              <el-form-item label="话题：">
                <chooseDYTopic
                  v-if="showTopicAndAt"
                  origin="task"
                  :disabled="disabled"
                  v-model:topicList="formData.topicList"
                />
              </el-form-item>
              <!--   @的人   抖音新版本隐藏    -->
              <el-form-item label="@：" v-if="dyVersion != 2">
                <chooseAtPerson
                  v-if="showTopicAndAt"
                  type="dy"
                  origin="task"
                  :disabled="disabled"
                  placeholder="请选择@的人，最多可添加3个@的人"
                  v-model:atPersonList="formData.atValue"
                />
              </el-form-item>
              <!--   POI  新版本抖音的图文任务移除POI     -->
              <el-form-item label="POI：" v-if="!(dyVersion == 2 && taskInfo.type == 6)">
                <div class="form_POI">
                  <div class="poi_top">
                    设置为必挂项
                    <el-switch
                      style="margin-left: 8px"
                      v-model="formData.poiInfo.isOpen"
                      active-text="开"
                      inactive-text="关"
                      :active-value="1"
                      :inactive-value="0"
                      inline-prompt
                      :disabled="disabled"
                    ></el-switch>
                  </div>
                  <div class="poi_bottom" v-if="formData.poiInfo.isOpen">
                    <div class="poi_name" v-if="disabled">
                      {{
                        formData.poiInfo && formData.poiInfo.info
                          ? formData.poiInfo.info.poiName
                          : '请输入需要挂载POI位置名称'
                      }}
                    </div>
                    <el-select
                      v-else
                      popper-class="poi_select"
                      :style="{ width: '100%' }"
                      v-model="formData.poiInfo.info"
                      filterable
                      remote
                      clearable
                      :remote-method="_getPOIList"
                      :disabled="disabled"
                      placeholder="请输入需要挂载POI位置名称"
                      value-key="poi"
                      :fit-input-width="true"
                      :loading="poiLoading"
                    >
                      <el-option
                        v-for="item in POIList"
                        :key="item.poi"
                        :label="item.poiName"
                        :value="item"
                      >
                        <div class="one_options">
                          <div class="option_name">{{ item.poiName || '' }}</div>
                          <div class="option_addr">
                            {{ item.province }}{{ item.city }}{{ item.district
                            }}{{ item.simpleAddr }}
                          </div>
                        </div>
                      </el-option>
                    </el-select>
                    <div class="poi_tips">注：若未设置具体的POI，员工可自由选择挂载的POI</div>
                  </div>
                </div>
              </el-form-item>
              <!--   挂载项小程序       -->
              <el-form-item label="小程序：" v-if="showDYAPP">
                <div class="form-item__content" v-if="showDialog">
                  <choose-microapp-link
                    class="mount_content"
                    ref="chooseMicroLink"
                    @choose="onChooseLink"
                    :disabled="disabled"
                    :type="1"
                    :taskType="taskType"
                    :mountInfo="mountInfo"
                    v-model="showChooseMicroapp"
                  ></choose-microapp-link>
                </div>
              </el-form-item>
            </div>
          </template>
          <!-- <template v-if="videoPlatform === '0' || videoPlatform === '2'">
            <div class="module-title">视频号</div>
            <div class="module-container">
              <el-form-item label="扩展链接：">
                <el-input
                  v-model="formData.extendedLink"
                  :disabled="disabled"
                  placeholder="请将公众号文章链接粘贴在此处"
                  clearable
                ></el-input>
              </el-form-item>
            </div>
          </template> -->
          <template v-if="videoPlatform === '0' || videoPlatform === '3'">
            <div class="module-title">小红书</div>
            <div class="module-container">
              <!-- 话题 -->
              <el-form-item label="话题：">
                <chooseXHSTopic
                  v-if="showTopicAndAt"
                  origin="task"
                  :disabled="disabled"
                  v-model:topicList="formData.xhsTopicList"
                />
              </el-form-item>
              <!-- @ -->
              <el-form-item label="@：">
                <chooseAtPerson
                  v-if="showTopicAndAt"
                  type="xhs"
                  origin="task"
                  :disabled="disabled"
                  v-model:atPersonList="formData.xhsAtValue"
                />
              </el-form-item>
              <!--   POI       -->
              <el-form-item label="POI：">
                <div class="form_POI">
                  <div class="poi_top">
                    设置为必挂项
                    <el-switch
                      style="margin-left: 8px"
                      v-model="formData.xhsPoiInfo.isOpen"
                      active-text="开"
                      inactive-text="关"
                      :active-value="1"
                      :inactive-value="0"
                      inline-prompt
                      :disabled="disabled"
                    ></el-switch>
                  </div>
                  <div class="poi_bottom" v-if="formData.xhsPoiInfo.isOpen">
                    <div class="poi_name" v-if="disabled">
                      {{
                        formData.xhsPoiInfo && formData.xhsPoiInfo.info
                          ? formData.xhsPoiInfo.info.poiName
                          : '请输入需要挂载POI位置名称'
                      }}
                    </div>
                    <el-select
                      v-else
                      popper-class="poi_select"
                      :style="{ width: '100%' }"
                      v-model="formData.xhsPoiInfo.info"
                      filterable
                      remote
                      clearable
                      :remote-method="_getXhsPOIList"
                      :disabled="disabled"
                      placeholder="请输入需要挂载POI位置名称"
                      value-key="poi"
                      :fit-input-width="true"
                      :loading="xhsPoiLoading"
                    >
                      <el-option
                        v-for="item in xhsPOIList"
                        :key="item.poi"
                        :label="item.poiName"
                        :value="item"
                      >
                        <div class="one_options">
                          <div class="option_name">{{ item.poiName || '' }}</div>
                          <div class="option_addr">
                            {{ item.subname }}
                          </div>
                        </div>
                      </el-option>
                    </el-select>
                    <div class="poi_tips">注：若未设置具体的POI，员工可自由选择挂载的POI</div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </template>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import chooseDYTopic from './choose_dy_topic.vue'
import chooseXHSTopic from './choose_xhs_topic.vue'
import chooseAtPerson from './choose_atPerson.vue'
import { poiLocation, xhsLocation } from '@/api/market/store'
import chooseMicroappLink from '@/views/market/components/choose_microapp_link.vue'
import { hasDyPro, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { useStore } from 'vuex'
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)
const showDYAPP = hasDyPro()
const props = defineProps({
  taskInfo: Object,
  disabled: Boolean,
  taskType: Number
})
const disabled = toRef(props, 'disabled')
// 挂载设置
const mountConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'mount_set')
// 视频设置
const videoConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'video_set')
const showDialog = ref(false)
const showTopicAndAt = ref(true) // 是否重置话题和@的人
const formData = ref({
  topicList: [], // 话题
  xhsTopicList: [], // 小红书话题
  atValue: [], // @的人
  xhsAtValue: [], // 小红书@的人
  mount: {
    mountType: 1,
    mountInfo: null
  }, // 小程序挂载项目
  extendedLink: '',
  poiInfo: {
    isOpen: 0, // POI开关
    info: null // POI挂载位置信息
  },
  xhsPoiInfo: {
    isOpen: 0, // POI开关
    info: null // POI挂载位置信息
  }
})
// 解析话题
const analyzeTopic = value => {
  if (isEmpty(value)) return
  const list = value.split(' ')
  return list.map(item => {
    return item.substring(1)
  })
}

// 显示挂载项 0不限平台 1显示抖音  2显示视频号
const videoPlatform = computed(() => {
  const platform = videoConfig?.children.find(
    item => item.ckey === 'video_publish_platform'
  )?.cvalue
  return platform
})
watch(
  () => videoPlatform.value,
  value => {
    // 删除已经选中的值
    reset()
    // 重新初始化
    init()
  }
)

// 挂载项
const mountInfo = ref(null)
// 指定挂载项
const showChooseMicroapp = ref(false)

function onChooseLink(mountType, mountInfo) {
  formData.value.mount = { mountType, mountInfo }
}

// 初始化 与 提交 与 关闭重制信息
// 选中配置项的回显示
const setItem = ref('')
const init = () => {
  showTopicAndAt.value = false
  nextTick(() => {
    showTopicAndAt.value = true
  })

  console.log('init')
  POIList.value = []
  const setList = []
  // 不限平台 和 抖音 有话题 @ 和小程序挂载项
  if (['0', '1'].indexOf(videoPlatform.value) > -1) {
    videoConfig.children.forEach(config => {
      // 设置话题 多个
      if (config.ckey === 'video_topic' && isNotEmpty(config.cvalue)) {
        formData.value.topicList = analyzeTopic(config.cvalue)
        setList.push('抖音话题')
      }
      // 设置@的人
      if (config.ckey === 'video_@_person' && isNotEmpty(config.cvalue) && dyVersion.value !== 2) {
        console.log('init', JSON.parse(config.cvalue))
        const videoDyPerson = JSON.parse(config.cvalue)
        if (Array.isArray(videoDyPerson)) {
          formData.value.atValue = videoDyPerson
        } else {
          formData.value.atValue = [videoDyPerson]
        }
        setList.push('抖音@')
      }
      // 设置抖音POI
      if (
        config.ckey === 'video_poi_setting' &&
        isNotEmpty(config.cvalue) &&
        !(dyVersion.value === 2 && props.taskInfo?.type === 6)
      ) {
        formData.value.poiInfo = JSON.parse(config.cvalue)
        if (
          formData.value.poiInfo &&
          formData.value.poiInfo.info &&
          formData.value.poiInfo.info.poiName &&
          !(POIList.value && POIList.value.length > 0) &&
          !disabled.value
        ) {
          _getPOIList(formData.value.poiInfo.info.poiName)
        }

        setList.push('抖音POI')
      }
    })
    mountConfig.children.forEach(config => {
      if (config.ckey === 'mount_info' && isNotEmpty(config.cvalue)) {
        mountInfo.value = JSON.parse(config.cvalue)
        formData.value.mount = { mountType: 1, mountInfo: mountInfo.value }
        setList.push('小程序')
      }
    })
  }
  if (['0', '3'].indexOf(videoPlatform.value) > -1) {
    videoConfig.children.forEach(config => {
      // 设置小红书话题 多个
      if (config.ckey === 'video_xhs_topic' && isNotEmpty(config.cvalue)) {
        formData.value.xhsTopicList = JSON.parse(config.cvalue)
        setList.push('小红书话题')
      }
      // 设置小红书@的人
      if (config.ckey === 'video_xhs_@_person' && isNotEmpty(config.cvalue)) {
        console.log('init', JSON.parse(config.cvalue))
        formData.value.xhsAtValue = JSON.parse(config.cvalue)
        setList.push('小红书@')
      }
      // 设置小红书POI
      if (config.ckey === 'video_xhs_poi_setting' && isNotEmpty(config.cvalue)) {
        formData.value.xhsPoiInfo = JSON.parse(config.cvalue)
        if (
          formData.value.xhsPoiInfo &&
          formData.value.xhsPoiInfo.info &&
          formData.value.xhsPoiInfo.info.poiName &&
          !(POIList.value && POIList.value.length > 0) &&
          !disabled.value
        ) {
          _getXhsPOIList(formData.value.xhsPoiInfo.info.poiName)
        }

        setList.push('小红书POI')
      }
    })
  }
  // 不限平台 和 视频号 有扩展链接挂载项
  // if (['0', '2'].indexOf(videoPlatform.value) > -1) {
  //   videoConfig.children.forEach(config => {
  //     // 扩展链接
  //     if (config.ckey === 'wx_extend_link' && isNotEmpty(config.cvalue)) {
  //       formData.value.extendedLink = config.cvalue
  //       setList.push('扩展链接')
  //     }
  //   })
  // }
  setItem.value = ''
  const sortObj = {
    抖音话题: 1,
    小红书话题: 2,
    '抖音@': 3,
    '小红书@': 4,
    抖音POI: 5,
    小红书POI: 6
  }
  setItem.value = setList
    .sort((a, b) => {
      return sortObj[a] - sortObj[b]
    })
    .join('/')
}
const reset = () => {
  videoConfig.children.forEach(config => {
    // 不是 抖音/不限平台 清除设置的值
    if (['0', '1'].indexOf(videoPlatform.value) === -1) {
      // 设置话题 多个
      if (config.ckey === 'video_topic') {
        config.cvalue = null
        formData.value.topicList = []
      }
      // 设置@的人
      if (config.ckey === 'video_@_person') {
        config.cvalue = ''
        formData.value.atValue = []
      }
      // 设置抖音POI
      if (config.ckey === 'video_poi_setting') {
        config.cvalue = ''
        formData.value.poiInfo = {
          isOpen: 0, // POI开关
          info: null // POI挂载位置信息
        }
      }
    }
    // 不是 小红书/不限平台 清除设置的值
    if (['0', '3'].indexOf(videoPlatform.value) === -1) {
      // 设置话题 多个
      if (config.ckey === 'video_xhs_topic') {
        config.cvalue = null
        formData.value.xhsTopicList = []
      }
      // 设置@的人
      if (config.ckey === 'video_xhs_@_person') {
        config.cvalue = ''
        formData.value.xhsAtValue = []
      }
      // 设置小红书POI
      if (config.ckey === 'video_xhs_poi_setting') {
        config.cvalue = ''
        formData.value.xhsPoiInfo = {
          isOpen: 0, // POI开关
          info: null // POI挂载位置信息
        }
      }
    }
    // 扩展链接 不是 视频号/不想平台 清除设置的值
    if (config.ckey === 'wx_extend_link' && ['0', '2'].indexOf(videoPlatform.value) === -1) {
      config.cvalue = ''
    }
  })
  if (['0', '1'].indexOf(videoPlatform.value) === -1) {
    mountConfig.children.forEach(config => {
      if (config.ckey === 'mount_info') {
        config.cvalue = ''
      }
    })
  }
}
onMounted(() => {
  reset()
  init()
})
// 点击确定按钮的时候保留信息
const onSubmit = () => {
  const { atValue, xhsAtValue, topicList, xhsTopicList, mount, extendedLink, poiInfo, xhsPoiInfo } =
    formData.value
  const setList = []
  videoConfig.children.forEach(config => {
    // 设置抖音话题 多个
    if (config.ckey === 'video_topic') {
      if (isNotEmpty(topicList)) {
        const list = [...topicList]
        config.cvalue = list.map(item => `#${item}`).join(' ')
        setList.push('抖音话题')
      } else {
        config.cvalue = ''
      }
    }
    // 设置小红书话题 多个
    if (config.ckey === 'video_xhs_topic') {
      if (isNotEmpty(xhsTopicList)) {
        config.cvalue = JSON.stringify(
          xhsTopicList.map(x => {
            return {
              id: x.id,
              name: x.name,
              link: x.link,
              viewNum: x.viewNum
            }
          })
        )
        setList.push('小红书话题')
      } else {
        config.cvalue = ''
      }
    }
    // 设置抖音@的人
    if (config.ckey === 'video_@_person') {
      if (isNotEmpty(atValue)) {
        console.log(
          'save',

          atValue
        )

        config.cvalue = JSON.stringify(
          atValue.map(x => {
            return {
              name: x.authAccountName || x.name,
              openId: x.openId
            }
          })
        )
        setList.push('抖音@')
      } else {
        config.cvalue = ''
      }
    }
    // 设置小红书@的人
    if (config.ckey === 'video_xhs_@_person') {
      if (isNotEmpty(xhsAtValue)) {
        console.log(
          'save',

          xhsAtValue
        )
        config.cvalue = JSON.stringify(
          xhsAtValue.map(x => {
            return {
              image: x.image || '',
              name: x.name,
              userId: x.userId
            }
          })
        )
        setList.push('小红书@')
      } else {
        config.cvalue = ''
      }
    }
    // 设置抖音POI
    if (config.ckey === 'video_poi_setting') {
      if (poiInfo.isOpen) {
        config.cvalue = JSON.stringify(poiInfo)
        setList.push('抖音POI')
      } else {
        config.cvalue = ''
      }
    }
    // 设置小红书POI
    if (config.ckey === 'video_xhs_poi_setting') {
      if (xhsPoiInfo.isOpen) {
        config.cvalue = JSON.stringify(xhsPoiInfo)
        setList.push('小红书POI')
      } else {
        config.cvalue = ''
      }
    }
  })
  // 设置挂载项目
  const { mountType, mountInfo } = mount
  mountConfig.children.forEach(config => {
    if (config.ckey === 'mount_type') {
      config.cvalue = mountType
    }
    if (config.ckey === 'mount_info') {
      config.cvalue = mountInfo ? JSON.stringify(mountInfo) : null
      if (isNotEmpty(mount.mountInfo)) {
        setList.push('小程序')
      }
    }
    if (config.ckey === 'mount_tool') {
      config.cvalue = mountInfo ? 1 : null
    }
  })
  // 设置扩展链接
  videoConfig.children.forEach(config => {
    // 设置扩展链接
    if (config.ckey === 'wx_extend_link') {
      if (isNotEmpty(extendedLink)) {
        setList.push('扩展链接')
        config.cvalue = extendedLink
      } else {
        config.cvalue = ''
      }
    }
  })
  setItem.value = setList.join('/')
  showDialog.value = false
}

// 关闭弹窗清除数据
const dialogClose = () => {
  formData.value = {
    topicList: [], // 话题
    xhsTopicList: [], // 小红书话题
    atValue: [], // @的人
    xhsAtValue: [], // 小红书@的人
    mount: {
      mountType: 1,
      mountInfo: null
    }, // 小程序挂载项目
    extendedLink: '',
    poiInfo: {
      isOpen: 0, // POI开关
      info: null // POI挂载位置信息
    },
    xhsPoiInfo: {
      isOpen: 0, // POI开关
      info: null // POI挂载位置信息
    }
  }
  mountInfo.value = null
  showTopicAndAt.value = false
}

// POI
const poiLoading = ref(false)
const POIList = ref([])
// 获取POIlist
const _getPOIList = name => {
  if (name) {
    poiLoading.value = true
    poiLocation({
      keyword: name || ''
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data || []
          POIList.value = list.map(item => {
            const {
              simplePoiInfo: { addressInfo, poiId, poiName }
            } = item
            return {
              poi: poiId,
              poiName,
              storeName: poiName,
              province: addressInfo.province,
              city: addressInfo.city,
              district: addressInfo.district,
              simpleAddr: addressInfo.simpleAddr,
              cityCode: addressInfo.cityCode
            }
          })
        } else {
          POIList.value = []
        }
        poiLoading.value = false
      })
      .catch(() => {
        POIList.value = []
        poiLoading.value = false
      })
  }
}

// 小红书POI
const xhsPoiLoading = ref(false)
const xhsPOIList = ref([])
// 获取POIlist
const _getXhsPOIList = name => {
  if (name) {
    xhsPoiLoading.value = true
    xhsLocation({
      keyword: name || ''
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data || []
          xhsPOIList.value = list.map(item => {
            return {
              poi: item.poiOid,
              poiName: item.name,
              subname: item.subname,
              source: item.source
            }
          })
        } else {
          xhsPOIList.value = []
        }
        xhsPoiLoading.value = false
      })
      .catch(() => {
        xhsPOIList.value = []
        xhsPoiLoading.value = false
      })
  }
}
</script>

<style lang="scss" scoped>
.mount_dialog {
  :deep(.el-form-item__content) {
    flex: 1;
  }

  .mount_btn {
    padding: 0px;
  }

  :deep(.el-button) {
  }

  .setting_dialog {
    .el-form-item {
      margin-bottom: 20px;
    }

    .form-item__content {
      display: flex;
      align-items: center;
      height: 32px;

      .mount_select {
        width: 130px;
        flex-shrink: 0;
      }

      .mount_content {
        flex: 1;
        display: inline-block;
        //padding-right: 10px;

        .mount_content_text {
          max-width: 230px;
          @include mult_line(1);
        }
      }

      .mount_content {
        display: inline-block;
      }
    }

    .module-title {
      line-height: 14px;
      margin-bottom: 12px;
      color: #303133;
      font-weight: bold;
    }

    .module-container {
      background: #f6f8fa;
      border-radius: 4px;
      padding: 20px 16px 1px 0;
    }
  }
}
.form_POI {
  .poi_top {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .poi_top + .poi_bottom {
    margin-top: 4px;
  }
  .poi_tips {
    color: #909399;
  }
  .poi_name {
    line-height: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: not-allowed;
    border: 1px solid #e4e7ed;
    padding: 0 31px 0 11px;
    background: #f5f7fa;
    color: #c0c4cc;
    @include mult_line(1);
  }
}
</style>
