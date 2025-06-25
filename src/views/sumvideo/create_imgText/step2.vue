<template>
  <div class="step2_page step_page" v-loading="templateInfo.loading">
    <div class="page_top">
      <stepsTitle :currentSteps="1" title="请设定内容策略"></stepsTitle>
    </div>
    <div class="page_bottom">
      <!-- 模板名称 -->
      <div class="bottom_item_warp_temp_name">
        <div class="region_top">
          <span class="text_warp">{{ moduleInfo.creativeName || '--' }}</span>
        </div>
        <div class="region_content_temp_name">
          <div
            :class="{ swiper_warp: true, one_swiper_warp: ackimgList && ackimgList.length === 1 }"
            :style="ackimgList && ackimgList.length === 1 ? 'height:320px' : ''"
          >
            <previewImgText
              :bigWidth="ackimgList && ackimgList.length === 1 ? 240 : 384"
              :bigImgWidth="240"
              :imgAspectRatio="0.75"
              :smallHeight="88"
              :imgList="ackimgList"
              operButPosition="offset"
            />
          </div>
          <div
            class="text_warp"
            v-if="previewTitleConfig || previewMountConfig"
            :style="ackimgList && ackimgList.length === 1 ? 'height:320px' : ''"
          >
            <div class="text_title" v-if="previewTitleConfig.title">
              {{ previewTitleConfig.title }}
            </div>
            <div class="text">
              {{ previewTitleConfig.description }}
              <div class="content_mount">
                <template v-if="previewMountConfig.dyTopic">
                  <span v-for="(a, b) in previewMountConfig.dyTopic" :key="b">#{{ a.name }}</span>
                </template>
                <template v-if="previewMountConfig.xhsTopic">
                  <span v-for="(a, b) in previewMountConfig.xhsTopic" :key="b">#{{ a.name }}</span>
                </template>
                <template v-if="previewMountConfig.xhsAt">
                  <span v-for="(a, b) in previewMountConfig.xhsAt" :key="b">@{{ a.name }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 实拍图 -->
      <div class="bottom_item_warp" v-loading="$data.realImgloading">
        <div class="region_top">
          <div class="text_warp">
            实拍图
            <!-- <span class="num_tip">
              {{
                `${$data.chooseSptNum}/${moduleInfo.imageCnt - moduleInfo.nonReplaceable.length}`
              }}
            </span> -->
          </div>
          <div class="region_btn">
            <el-cascader
              style="width: 210px"
              placeholder="请选择实拍图处理方式"
              v-model="$data.realImgSelect"
              :options="$data.realImgOption"
              :props="$data.realImgProps"
              :show-all-levels="false"
              @change="reallImgChange"
            />
          </div>
        </div>

        <div
          class="region_content region_content_list"
          ref="realImgListRef"
          v-if="moduleInfo.realShootList.length > 0"
        >
          <!-- list -->
          <div class="real_img_list">
            <!-- :class="{
                real_img_item_active:
                  moduleInfo.realShootChooseIds && moduleInfo.realShootChooseIds.includes(pic.id)
              }" -->
            <div
              class="real_img_item can_click"
              v-for="pic in moduleInfo.realShootList"
              :key="pic.id"
              @click="
                previewFun({
                  title: '图片预览',
                  type: 'image',
                  url: pic.mediaUrl || pic.url,
                  cover: pic.coverUrl || pic.mediaUrl || pic.url
                })
              "
            >
              <div class="item_img">
                <img
                  :src="pic.thumbMediaUrl || pic.mediaUrl || pic.url"
                  alt=""
                  class="item_cover"
                />
              </div>
            </div>
          </div>
          <!-- more -->
          <div
            class="more_area can_click"
            @click="allRealImg('realImg')"
            v-if="moduleInfo.realShootIds.length > 20"
          >
            共{{ moduleInfo.realShootIds.length || 0 }}个，
            <span class="color_text">查看全部</span>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240918wzf6z.png"
              alt=""
              class="more_icon"
            />
          </div>
        </div>
      </div>
      <!-- 虚拟模特 -->
      <div
        class="bottom_item_warp"
        v-loading="$data.virtualMtLoading"
        v-if="moduleInfo.mannequinIds.length > 0"
      >
        <div class="region_top">
          <span class="text_warp">虚拟模特</span>
          <div class="region_btn">
            <!-- <div class="tag_box">
              虚拟模特标签
              <span class="tip_text">
                已选择
                <span class="color_text">{{ addTagDialog.chooseTagListMt.length || 0 }}</span>
                个
              </span>
              <el-button style="margin-left: 16px" @click="openVirtualTag('virtual')">
                选择
              </el-button>
            </div> -->
            <el-select
              v-model="$data.virtualMtSelect"
              placeholder="请选择"
              style="width: 210px; margin-left: 24px"
              @change="virtualMtChange"
            >
              <el-option
                v-for="item in $data.virtualMtOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="region_content region_content_virtual">
          <div class="virtual_list">
            <!-- :class="{
                virtual_item_active:
                  moduleInfo.mannequinChooseIds && moduleInfo.mannequinChooseIds.includes(pic.id)
              }" -->
            <div
              class="virtual_item can_click"
              v-for="(pic, index) in moduleInfo.mannequinList"
              :key="index"
              @click="
                previewFun({
                  title: '图片预览',
                  type: 'image',
                  url: pic.mediaUrl || pic.url,
                  cover: pic.coverUrl || pic.demoCover
                })
              "
            >
              <div class="item_img">
                <img :src="pic.thumbCoverUrl || pic.coverUrl" alt="" class="item_cover" />
              </div>
            </div>
          </div>
          <div
            class="more_area can_click"
            @click="allRealImg('virtual')"
            v-if="moduleInfo.mannequinIds.length > 20"
          >
            共{{ moduleInfo.mannequinIds.length || 0 }}个，
            <span class="color_text">查看全部</span>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240918wzf6z.png"
              alt=""
              class="more_icon"
            />
          </div>
        </div>
      </div>
      <!-- 场景图 -->
      <div class="bottom_item_warp" v-loading="$data.sceneLoading">
        <div class="region_top">
          <span class="text_warp">
            场景图
            <el-tooltip popper-class="tooltip-class" placement="right">
              <template #content>
                <p>每个作品将参考同一张单图，并按顺序参考组图</p>
              </template>
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240918aabhm.png"
                style="width: 16px; height: 16px; margin-left: 8px"
              />
            </el-tooltip>
          </span>
          <div class="region_btn">
            <!-- <div class="tag_box">
              场景图标签
              <span class="tip_text">
                已选择
                <span class="color_text">{{ addTagDialog.chooseTagListScene.length || 0 }}</span>
                个
              </span>
              <el-button style="margin-left: 16px" @click="openVirtualTag('scene')">选择</el-button>
            </div> -->
            <!-- <el-select
              v-model="$data.strength"
              placeholder="参考图强度"
              style="width: 210px; margin-left: 24px"
              @change="strengthChange"
            >
              <el-option
                v-for="item in $data.strengthOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-tooltip placement="left">
              <template #content>
                <div style="max-width: 450px">
                 参考强度提示
                </div>
              </template>
              <img
                src="@/assets/images/operate/tip_line.png"
                style="width: 16px; height: 16px; margin-left: 8px"
              />
            </el-tooltip> -->
            <el-select
              v-if="false"
              v-model="$data.sceneUseWay"
              placeholder="请选择"
              style="width: 210px; margin-left: 24px"
              @change="sceneUseWayChange"
            >
              <el-option
                v-for="item in $data.sceneUseWayOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="region_content region_content_scene" v-if="moduleInfo.sceneList.length > 0">
          <div class="scene_list">
            <!-- :class="{
                scene_item_active:
                  moduleInfo.sceneChooseIds && moduleInfo.sceneChooseIds.includes(item.id)
              }" -->
            <div
              class="scene_item can_click"
              v-for="(item, index) in moduleInfo.sceneList"
              :key="index"
              @click="previewFun({ title: '图片预览', type: 'scene', urlList: item.pictures })"
            >
              <div class="scene_warp">
                <sceneCover :list="item.pictures ? JSON.parse(item.pictures) : []" />
                <div class="info_mask">
                  <div class="top_imo">
                    <div class="name_t">
                      <div class="type_t">
                        {{ item.name || '' }}
                      </div>
                    </div>
                    <div class="type_t" v-if="item.pictures">
                      {{ JSON.parse(item.pictures).length <= 1 ? '单图' : '组图' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="more_area can_click"
            @click="allRealImg('scene')"
            v-if="moduleInfo.sceneIds.length > 20"
          >
            共{{ moduleInfo.sceneIds.length }}个，
            <span class="color_text">查看全部</span>
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240918wzf6z.png"
              alt=""
              class="more_icon"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 全部实拍图 -->
    <previewAllImg :allDialog="allDialog" v-if="allDialog.show" @preview="previewFun" />
    <!-- 预览单个 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo" />
    <!-- 选择标签 -->
    <!-- <addTagDom
      v-if="addTagDialog.show"
      :addDialog="addTagDialog"
      :canCreate="false"
      @updateTag="updateTag"
    /> -->
  </div>
</template>

<script setup>
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import previewImgText from '@/views/sumvideo/components/preview_img_text.vue'
import previewAllImg from './components/preview_all_dialog.vue'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
// import addTagDom from '@/views/content_center/content_repository/components/addTag_dialog.vue'
// import { list } from '@/api/content_center/material_library.js'

import { isNotEmpty, throttle } from '@/utils/tools'
import {
  getImageTextPipelineDetail,
  saveImagePipelineConfig
} from '@/api/sumvideo/create_by_imgtext.js'

const props = defineProps({
  stepLoading: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: Number || String,
    default: null
  },
  pipelineId: {
    type: Number || String,
    default: null
  }
})

const emits = defineEmits(['update:stepLoading', 'updateTemplate', 'update:btnDis'])
const { templateId, pipelineId } = toRefs(props)

const saveLoading = ref(false) // 是否是在保存/初始化的过程中，如或是下一步的按钮就要禁止

const ackimgList = ref([]) // 当前显示列表

const templateInfo = reactive({
  loading: false, // 获取模板信息的loading
  moduleInfo: {
    nonReplaceable: [], // 不可替换项
    realShootIds: [], // 所有实拍图ids
    realShootList: [], // 页面显示实拍图列表
    // realShootChooseIds: [], // 所有选中的实拍图ids
    // realImgSelectList: [], // 所有选中实拍图完整信息，放在这里是因为入参用
    mannequinList: [], // 所有虚拟模特ids
    mannequinIds: [], // 页面显示虚拟模特列表
    // mannequinChooseIds: [], // 虚拟模特选中的ids
    sceneList: [], // 当前页面显示的场景图
    sceneIds: [] // 所有场景图
    // sceneChooseIds: [] // 场景图选中的ids
  }
}) // 模板相关的信息
const { moduleInfo } = toRefs(templateInfo)
const realImgListRef = ref(null)

const previewTitleConfig = computed(() => {
  const { previewTitle } = moduleInfo.value
  const config = previewTitle && previewTitle.length > 0 ? previewTitle[0] : {}
  return config
})
const previewMountConfig = computed(() => {
  const { mount } = moduleInfo.value
  if (
    isNotEmpty(mount) &&
    ((mount.dyTopic && mount.dyTopic.length > 0) ||
      (mount.xhsTopic && mount.xhsTopic.length > 0) ||
      (mount.xhsAt && mount.xhsAt.length > 0))
  ) {
    const config = {}
    if (mount.dyTopic && mount.dyTopic.length > 0) {
      config.dyTopic = mount.dyTopic
    }
    if (mount.xhsTopic && mount.xhsTopic.length > 0) {
      config.xhsTopic = mount.xhsTopic
    }
    if (mount.xhsAt && mount.xhsAt.length > 0) {
      config.xhsAt = mount.xhsAt
    }
    return config
  } else {
    return {}
  }
})

// 本地一些数据
const $data = reactive({
  realImgloading: false, // 实拍图处理方式选择后接口调用时的loading
  realImgSelect: [0], // 选中的实拍图处理方式
  realImgOption: [
    {
      value: 0,
      label: '随机',
      children: []
    },
    {
      value: 'realImgSelectMt',
      label: '限制实拍模特',
      children: [
        {
          label: '作品限定单一实拍模特',
          value: 1
        },
        {
          label: '作品限定不重复实拍模特',
          value: 3
        }
      ]
    },
    {
      value: 'realImgSelectSp',
      label: '限制商品',
      children: [
        {
          label: '作品限定单一商品',
          value: 4
        },
        {
          label: '作品限定不重复商品',
          value: 6
        }
      ]
    }
  ],
  realImgProps: {
    expandTrigger: 'click'
  },
  chooseSptNum: 0, // 已选中实拍图数
  realImgSelectList: [], // 选中的所有实拍图，接口返回数据，在点击下一步时回传

  virtualMtLoading: false,
  virtualMtOption: [
    {
      value: 1,
      label: '同一作品使用一个虚拟模特'
    },
    {
      value: 2,
      label: '同一作品随机使用多个重复虚拟模特'
    },
    {
      value: 3,
      label: '同一作品随机使用多个不重复虚拟模特'
    }
  ],
  virtualMtSelect: 1, // 虚拟模特处理方式选择结果
  virtualMtTagIds: [], // 标签
  // virtualMtSelectList: [], // 选中的所有虚拟模特，接口返回数据，在点击下一步时回传

  // strength: null, // 选择的参考强度
  // strengthOption: [
  //   {
  //     value: 1,
  //     label: '更随机'
  //   },
  //   {
  //     value: 2,
  //     label: '均衡'
  //   },
  //   {
  //     value: 3,
  //     label: '更接近'
  //   }
  // ],

  sceneLoading: false,
  sceneUseWayOption: [
    {
      value: 1,
      label: '同一作品使用一个单图'
    },
    {
      value: 2,
      label: '同一作品随机使用多个重复单图'
    },
    {
      value: 3,
      label: '同一作品随机使用多个不重复单图'
    }
  ],
  sceneUseWay: 1, // 场景图的使用方式
  sceneTagIds: [],
  sceneSelectIds: [], // 场景图选中ids
  sceneSelectList: [] // 选中的所有场景图，接口返回数据，在点击下一步时回传
})

// 查看全部
const allDialog = reactive({
  show: false,
  title: '',
  type: null,
  includeIds: [],
  chooseIds: []
})

// 查看单个详情
const previewInfo = ref({
  show: false
})

// // 选择标签
// const addTagDialog = reactive({
//   type: 20, // 虚拟模特标签
//   chooseTagList: [], // 已选择的标签-回显用
//   chooseTagListMt: [], // 页面数据
//   chooseTagListScene: [],
//   relatedMediaIds: [] // 获取模板关联的标签列表
// })

// // 标签选择结果
// function updateTag(e) {
//   saveLoading.value = true
//   if (addTagDialog.type === 20) {
//     addTagDialog.chooseTagListMt = e
//     $data.virtualMtTagIds = (e || []).map(item => item.id)
//     virtualMtChange()
//   } else if (addTagDialog.type === 18) {
//     addTagDialog.chooseTagListScene = e
//     $data.sceneTagIds = (e || []).map(item => item.id)
//     sceneUseWayChange()
//   }
// }

// title、type必传，其余传参随意传
const previewFun = throttle(function ({ title = '', type = '', ...info } = {}) {
  console.log('info', info, typeof info.urlList)
  previewInfo.value = {
    show: true,
    title: title,
    type: type,
    url: info.url,
    cover: info.cover || '',
    urlList: info.urlList ? (typeof info.urlList === 'string' ? JSON.parse(info.urlList) : []) : []
  }
  console.log('previewInfo', previewInfo.value)
}, 500)

// 场景图-参考强度选择
// function strengthChange(e) {
//   $data.strength = e
// }

// // 更新选中数据到最前
// function updateChooseList(params) {
//   return new Promise((resolve, reject) => {
//     list(params)
//       .then(res => {
//         resolve(res)
//       })
//       .catch(err => {
//         reject(new Error(err))
//       })
//   })
// }

// // 标签选择
// const openVirtualTag = throttle(function (type) {
//   if (type === 'virtual') {
//     addTagDialog.type = 20 // 虚拟模特标签选择
//     addTagDialog.chooseTagList = addTagDialog.chooseTagListMt
//     addTagDialog.relatedMediaIds = moduleInfo.value.mannequinIds
//   } else if (type === 'scene') {
//     addTagDialog.type = 18
//     addTagDialog.chooseTagList = addTagDialog.chooseTagListScene
//     addTagDialog.relatedMediaIds = moduleInfo.value.sceneIds
//   }
//   addTagDialog.show = true
// }, 500)

// 场景图-使用方式选择--目前默认都是同一作品使用一个单图
function sceneUseWayChange(e) {
  return new Promise((resolve, reject) => {
    if (e) {
      $data.sceneUseWay = e
    }
    $data.sceneLoading = true
    const params = {
      checkConfig: 2,
      backgroundPhotoRule: {
        selectMode: 1,
        tagIds: $data.sceneTagIds ? $data.sceneTagIds : []
      }
    }
    console.log('params', params)
    saveConfig(params)
      .then(res => {
        $data.sceneLoading = false
        $data.sceneLoading = false
        templateInfo.loading = false
        resolve()
      })
      .catch(() => {
        // $data.sceneSelectList = []
        // moduleInfo.value.sceneList = []
        $data.sceneLoading = false
        templateInfo.loading = false
        resolve()
      })
  })
}

// 虚拟模特处理方式变化
function virtualMtChange(e) {
  return new Promise((resolve, reject) => {
    if (e) {
      $data.virtualMtSelect = e
    }
    $data.virtualMtLoading = true
    const params = {
      checkConfig: 3,
      mannequinRule: {
        selectMode: $data.virtualMtSelect,
        tagIds: $data.virtualMtTagIds ? $data.virtualMtTagIds : []
      }
    }
    console.log('params', params)
    saveConfig(params)
      .then(res => {
        $data.virtualMtLoading = false
        templateInfo.loading = false
        saveLoading.value = false
        resolve()
      })
      .catch(() => {
        $data.virtualMtLoading = false
        if (!e) {
          saveLoading.value = false
        }
        resolve()
      })
  })
}

// 保存实拍图/虚拟模特/场景图配置
function saveConfig(params) {
  return new Promise((resolve, reject) => {
    params = {
      ...params,
      id: templateId.value, // 模板id
      pipelineId: pipelineId.value // 流水线id
    }
    saveImagePipelineConfig(params)
      // .then(res => {
      //   // resolve(res)
      // })
      // .catch(err => {
      //   // reject(err)
      // })
      .finally(res => {
        resolve(res)
      })
  })
}

function initAllArr() {
  return new Promise(resolve => {
    // 填充非替换项
    const { imageCnt, nonReplaceable, realShootList, pictures } = moduleInfo.value
    if (isNotEmpty(pictures)) {
      ackimgList.value = JSON.parse(pictures)
      resolve()
      return
    }
    // 填充所有替换项个数的假数组用于显示页面数据
    if (imageCnt) {
      const allArr = []
      for (let i = 0; i < imageCnt; i++) {
        const oneImg = {}
        allArr.push(oneImg)
      }
      ackimgList.value = allArr
    }
    // 将不可替换性替换假数据
    if (nonReplaceable && nonReplaceable.length > 0) {
      nonReplaceable.forEach(item => {
        const showItem = {
          ...item,
          url: item.resourceUrl,
          isNonReplaceable: true
        }
        replaceImg(item.index, showItem)
      })
    }
    if (realShootList && realShootList.length > 0) {
      // 填充选择数据
      let repalceIndex = 0
      ackimgList.value.forEach((item, index) => {
        if (!item.isNonReplaceable) {
          // 替换项
          const replaceItem = {
            ...realShootList[repalceIndex],
            url: realShootList[repalceIndex]?.mediaUrl || realShootList[repalceIndex]?.resourceUrl,
            isNonReplaceable: false
          }
          replaceImg(index, replaceItem)
          repalceIndex++
        }
      })
    }
    resolve()
  })
}

// // 更新顶部显示
// async function replaceChange(selectList) {
//   // 先初始化ackimgList
//   await initAllArr()
//   // 填充选择数据
//   let repalceIndex = 0
//   ackimgList.value.forEach((item, index) => {
//     if (!item.isNonReplaceable) {
//       // 替换项
//       const replaceItem = {
//         ...selectList[repalceIndex],
//         url: selectList[repalceIndex]?.mediaUrl || selectList[repalceIndex]?.resourceUrl,
//         isNonReplaceable: false
//       }
//       replaceImg(index, replaceItem)
//       repalceIndex++
//     }
//   })

//   console.log('ackimgList.value', ackimgList.value)
//   $data.chooseSptNum =
//     selectList.length > ackimgList.value.length ? ackimgList.value.length : selectList.length
// }

// 实拍图处理方式变化
function reallImgChange(e) {
  console.log('选择变化', e)
  saveLoading.value = true
  $data.realImgloading = true
  const params = {
    checkConfig: 1, // 本次保存需要检查的配置 1实拍图 2场景图 3虚拟模特
    shootPhotoRule: {
      selectMode: e && e.length > 1 ? e[1] || 1 : parseInt(e[0]) // 1单一模特 2随机模特 3不重复模特 4单一商品 5随机商品 6不重复商品
    }
  }
  console.log('params', params)
  saveConfig(params)
    .then(res => {
      console.log('处理实拍图选择返回', res)
      $data.realImgloading = false
      templateInfo.loading = false
      saveLoading.value = false
    })
    .catch(async err => {
      // 页面已选择数据清空
      // moduleInfo.value.realShootChooseIds = []
      console.log('处理实拍图选择失败', err)
      $data.realImgloading = false
      saveLoading.value = false
    })
}

// 查看全部实拍图
const allRealImg = throttle(function (type) {
  const titleSet = {
    realImg: {
      title: '全部实拍图',
      idsFild: 'realShootIds',
      chooseListFild: 'realShootChooseIds'
    },
    virtual: {
      title: '全部虚拟模特',
      idsFild: 'mannequinIds',
      chooseListFild: 'mannequinChooseIds'
    },
    scene: {
      title: '全部场景图',
      idsFild: 'sceneIds',
      chooseListFild: 'sceneChooseIds'
    }
  }
  allDialog.title = titleSet[type].title || '查看全部'
  allDialog.type = type
  allDialog.includeIds = moduleInfo.value[titleSet[type].idsFild] // 需要获取的所有素材ids
  // 选中的ids
  allDialog.chooseIds = moduleInfo.value[titleSet[type].chooseListFild]
  console.log('allDialog', allDialog)
  allDialog.show = true
}, 500)

// 处理不可替换项
function replaceImg(index, item) {
  ackimgList.value[index] = item
}

onMounted(() => {
  saveLoading.value = true
  emits('update:stepLoading', true)
  const p1 = getTemplateInfo(true)
  Promise.all([p1]).then(async () => {
    await initAllArr()
    // 保存实拍图
    await reallImgChange($data.realImgSelect)
    if (moduleInfo.value.mannequinIds.length > 0) {
      await virtualMtChange()
    }
    await sceneUseWayChange()
    saveLoading.value = false
    emits('update:stepLoading', false)
  })
})

// 获取模板详情
const getTemplateInfo = (loading = false, backRule = null) => {
  return new Promise(resolve => {
    templateInfo.loading = loading
    getImageTextPipelineDetail({ pipelineId: pipelineId.value })
      .then(res1 => {
        console.log('获取流水线详情返回-包含所有模板数据', res1)
        if (res1.code === 0) {
          const { data } = res1

          moduleInfo.value = {
            ...data
          }

          // 赋值数据回显
          if (isNotEmpty(data.extraConfig)) {
            // 实拍图
            if (!backRule || backRule === 'spt') {
              const { shootPhotoRule } = data.extraConfig
              if (shootPhotoRule) {
                const mode = shootPhotoRule?.selectMode ? shootPhotoRule?.selectMode : 0
                if (mode === 0) {
                  $data.realImgSelect = [0]
                } else {
                  const firstType = mode > 3 ? 'realImgSelectSp' : 'realImgSelectMt'
                  $data.realImgSelect = [firstType, shootPhotoRule.selectMode]
                }
                // 如果有选中处理方式，就需要选中回显
                // reallImgChange($data.realImgSelect)
              }
            }

            if (!backRule || backRule === 'mt') {
              // 虚拟模特
              const { mannequinRule } = data.extraConfig
              if (mannequinRule) {
                $data.virtualMtSelect = mannequinRule?.selectMode || 1
                // addTagDialog.chooseTagListMt = mannequinRule?.tags ? mannequinRule.tags : []
                $data.virtualMtTagIds = mannequinRule?.tagIds ? mannequinRule.tagIds : []
                // virtualMtChange($data.virtualMtSelect)
              }
            }
            if (!backRule || backRule === 'scene') {
              // 场景图
              const { backgroundPhotoRule } = data.extraConfig
              $data.sceneUseWay = backgroundPhotoRule?.selectMode || 1
              $data.sceneSelectIds =
                backgroundPhotoRule?.selectedIds || []
                  ? // addTagDialog.chooseTagListScene = backgroundPhotoRule?.tags
                    backgroundPhotoRule.tags
                  : []
              $data.sceneTagIds = backgroundPhotoRule?.tagIds ? backgroundPhotoRule.tagIds : []
              // sceneUseWayChange($data.sceneUseWay)
            }
          }

          templateInfo.loading = false
          resolve()
        } else {
          templateInfo.loading = false
          saveLoading.value = false
          resolve()
        }
      })
      .catch(() => {
        templateInfo.loading = false
        saveLoading.value = false
        resolve()
      })
  })
}

watch(
  () => moduleInfo.value,
  val => {
    emits('updateTemplate', val)
  },
  {
    // immediate: true,
    deep: true
  }
)
watch(
  () => saveLoading.value,
  val => {
    if (val) {
      emits('update:btnDis', true)
    } else {
      emits('update:btnDis', false)
    }
  },
  {
    // immediate: true,
    deep: true
  }
)
</script>

<style scoped lang="scss">
@import '../create_by_template/components/scss/step.scss';
* {
  box-sizing: border-box;
}
.color_text {
  color: #364fcd;
}
.can_click {
  cursor: pointer;
}
.step2_page {
  :deep(.steps_content_title) {
    padding-bottom: 20px;
  }
  .page_bottom {
    padding: 20px 24px;
  }
  // 头部标题+按钮
  .region_top {
    display: flex;

    .text_warp {
      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
      border-radius: 2px 2px 0 0;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .num_tip {
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        margin-left: 8px;
        line-height: 20px;
        margin-top: 2px;
      }
    }
    // 操作按钮样式
    .region_btn {
      flex: 1;
      display: flex;
      justify-content: end;
      align-items: center;
      .tag_box {
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        .tip_text {
          font-weight: 400;
          font-size: 14px;
          color: #909399;
          margin-left: 8px;
        }
      }
    }
  }
  // 模板名称
  .bottom_item_warp_temp_name {
    background: #fff;
    padding-bottom: 20px;
    border-bottom: 1px solid #e8e8e8;
    .region_content_temp_name {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 16px;
      .swiper_warp {
        width: 384px;
        height: 432px;
        min-width: 384px;
        :deep(.default_cover) {
          border-radius: 4px;
        }
      }
      .one_swiper_warp {
        width: 240px;
        min-width: 240px !important;
        :deep(.preview_page) {
          width: 100%;
        }
        :deep(.preview_small_parent) {
          display: none !important;
        }
      }
      .text_warp {
        flex: 1;
        height: 432px;
        padding-left: 32px;
        .text_title {
          font-weight: 600;
          font-size: 20px;
          color: #323233;
          line-height: 28px;
          margin-bottom: 12px;
        }
        .text {
          font-weight: 400;
          font-size: 16px;
          color: #606266;
          line-height: 24px;
        }
        .content_mount {
          span {
            margin-right: 4px;
            color: #364fcd;
          }
        }
      }
    }
  }
  // 实拍图、虚拟模特、场景图
  .bottom_item_warp {
    background: #f2f3f5;
    border-radius: 2px;
    border: 1px solid #eaedf0;
    padding: 12px 16px;
    margin-top: 20px;
    position: relative;
    .region_content {
      margin-top: 16px;
      // 实拍图
      .real_img_list {
        display: flex;
        flex-wrap: wrap;
        .real_img_item {
          width: 113px;
          height: 148px;
          min-width: 113px;
          margin-right: 8px;
          margin-bottom: 8px;
          border-radius: 4px;
          border: 2px solid transparent;
          .item_img {
            background: #e5e6e8;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            .item_cover {
              width: 100%;
              height: 100%;
              border-radius: 4px;
              object-fit: cover;
              display: flex;
              overflow-clip-margin: border-box;
              -webkit-overflow-clip-margin: border-box;
            }
          }
        }
      }
      // 虚拟模特
      .virtual_list {
        display: flex;
        flex-wrap: wrap;
        .virtual_item {
          width: 109px;
          min-width: 109px;
          height: 109px;
          border-radius: 50%;
          border: 2px solid transparent;
          margin-right: 8px;
          margin-bottom: 8px;
          .item_img {
            background: #e5e6e8;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            .item_cover {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              object-fit: cover;
              display: flex;
              overflow-clip-margin: border-box;
              -webkit-overflow-clip-margin: border-box;
            }
          }
        }
      }
      // 场景图
      .scene_list {
        display: flex;
        flex-wrap: wrap;
        .scene_item {
          width: 244px;
          min-width: 244px;
          height: 244px;
          border-radius: 4px;
          border: 2px solid transparent;
          margin-right: 8px;
          margin-bottom: 8px;
          .scene_warp {
            background: #e5e6e8;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            position: relative;
            .info_mask {
              width: 100%;
              height: 100%;
              border-radius: 4px;
              position: absolute;
              top: 0;
              left: 0;
              padding: 9px 12px;
              .top_imo {
                display: flex;
                justify-content: space-between;
                .name_t {
                  width: calc(100% - 80px);
                  margin-top: 1px;
                  font-weight: 400;
                  font-size: 14px;
                  color: #ffffff;
                  line-height: 20px;
                  flex: 1;
                  margin-right: 10px;
                  .type_t {
                    @include mult_line(1);
                    max-width: 100%;
                    width: max-content;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                }
                .type_t {
                  width: max-content;
                  height: max-content;
                  padding: 1px 10px;
                  border-radius: 11px;
                  background: rgba(0, 0, 0, 0.2);
                  font-weight: 400;
                  font-size: 14px;
                  color: #ffffff;
                  line-height: 20px;
                }
              }
            }
          }
        }
      }

      .real_img_item_active,
      .virtual_item_active,
      .scene_item_active {
        padding: 2px;
        border-color: #364fcd !important;
      }
      .more_area {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        // margin-top: 12px;
        .more_icon {
          width: 14px;
          height: 14px;
          margin-left: 4px;
          min-width: 14px;
          object-fit: contain;
        }
      }
    }
    .region_content_list {
      max-height: 222px;
      width: 100%;
      overflow-y: auto;
    }
    .region_content_virtual {
      max-height: 166px;
      width: 100%;
      overflow-y: auto;
    }
    .region_content_scene {
      max-height: 366px;
      width: 100%;
      overflow-y: auto;
    }
  }
  .bottom_item_warp + .bottom_item_warp {
    margin-top: 12px;
  }
}
:deep(.big_img) {
  img {
    border-radius: 4px;
    background: #f2f3f5;
  }
}
</style>
