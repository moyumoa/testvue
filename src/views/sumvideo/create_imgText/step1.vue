<template>
  <div class="detail_page" v-loading="pageLoading">
    <div class="page_top" style="height: 100%">
      <!-- 预览区 -->
      <div class="page_left" style="margin: 0">
        <div class="left_content" style="margin: 0">
          <div class="content_content">
            <previewImgText :imgList="previewImg" :bigImgWidth="271" />
            <div class="content_title" v-if="info.creativeStruct == 2">
              {{ previewTextInfo.title || '' }}
            </div>
            <div class="content_text" v-if="info.creativeStruct == 2">
              {{ previewTextInfo.desc || '' }}
              <div class="content_mount">
                <template v-if="info.mount && info.mount.dyTopic && info.mount.dyTopic.length > 0">
                  <span v-for="(a, b) in info.mount.dyTopic" :key="b">#{{ a }}</span>
                </template>
                <template
                  v-if="info.mount && info.mount.xhsTopic && info.mount.xhsTopic.length > 0"
                >
                  <span v-for="(a, b) in info.mount.xhsTopic" :key="b">#{{ a.name }}</span>
                </template>
                <template v-if="info.mount && info.mount.xhsAt && info.mount.xhsAt.length > 0">
                  <span v-for="(a, b) in info.mount.xhsAt" :key="b">@{{ a.name }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选择实拍图的设置区 -->
      <div class="page_right right_has_right">
        <div class="one_has">
          <!-- 实拍图 -->
          <div
            class="has_half"
            :style="{
              borderColor: errList.shoot ? 'red' : ''
            }"
            ref="shootRef"
            v-loading="delLoading == 'shoot'"
          >
            <div class="half_top">
              <div class="top_left">选择实拍图</div>
              <div class="top_right">
                <el-cascader
                  style="width: 210px"
                  placeholder="请选择实拍图处理方式"
                  v-model="info.realShootSelectMode"
                  :options="realShootSelectModeList"
                  :props="{
                    expandTrigger: 'click'
                  }"
                  :show-all-levels="false"
                  @change="realShootSelectModeChange"
                />
              </div>
            </div>
            <div class="half_content">
              <div class="half_content_content">
                <template v-for="(item, index) in info.realShootList">
                  <div
                    :style="
                      errList.shoot &&
                      ((info.imageReplaceType == 1 && !item.markUrl) ||
                        (!(info.imageReplaceType == 1) && item.markUrl))
                        ? 'outline: 1px solid red;'
                        : ''
                    "
                    class="one_content"
                    v-if="index < 15"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="
                      previewFun(
                        '查看图片',
                        item.coverUrl || item.mediaUrl || item.url,
                        'image',
                        item.coverUrl || item.mediaUrl || item.url
                      )
                    "
                  >
                    <img
                      class="content_cover"
                      :src="
                        item.thumbMediaUrl ||
                        item.thumbUrl ||
                        item.coverUrl ||
                        item.mediaUrl ||
                        item.url
                      "
                      alt=""
                    />
                    <img
                      v-if="item.markUrl"
                      class="content_mark"
                      src="https://tagvv-1256030678.file.myqcloud.com/202410210h1pp.png"
                      alt=""
                    />
                    <div class="content_del" @click.stop="delFun(index, 'shoot', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num"
                  v-if="info.realShootMax && info.realShootMax > 15"
                  @click.stop="showAllFun('shoot', info.realShootIds)"
                >
                  <div>
                    共
                    <span>{{ info.realShootMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div class="one_content one_content_add" @click="showChooseMaterialFun">
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 不可替换图 -->
          <div class="has_half" v-if="info.imageCnt > 1" v-loading="delLoading == 'noReplace'">
            <div class="half_top">选择不可替换图</div>
            <div class="half_content">
              <div class="half_content_content">
                <div
                  class="one_content"
                  v-for="(item, index) in info.nonReplaceable"
                  :key="index"
                  @click.stop="previewFun('查看图片', item.resourceUrl, 'image', item.resourceUrl)"
                >
                  <img class="content_cover" :src="item.resourceUrl" alt="" />
                  <div class="content_del" @click.stop="delFun(index, 'noReplace', item)">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                      alt=""
                    />
                  </div>
                </div>

                <div
                  v-if="info.nonReplaceable.length < previewImg.length - 1"
                  class="one_content one_content_add"
                  @click="showAddNoReplaceFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="one_has">
          <!-- 场景图 -->
          <div
            class="has_half"
            :style="{
              borderColor: errList.scene ? 'red' : '',
              height: '177px'
            }"
            ref="sceneRef"
            v-loading="delLoading == 'scene'"
          >
            <div class="half_top">选择场景图</div>
            <div
              class="half_content"
              :style="{
                height: '136px'
              }"
            >
              <div class="half_content_content">
                <template v-for="(item, index) in info.sceneList">
                  <div
                    class="one_content one_content_scene"
                    v-if="index < 8"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="
                      previewFun(
                        '查看场景图',
                        item.mediaUrl,
                        'scene',
                        item.coverUrl,
                        JSON.parse(item.pictures)
                      )
                    "
                  >
                    <!-- <img class="content_cover" :src="item.url" alt="" /> -->
                    <sceneCover
                      :isByXM="item.brandId === '0'"
                      class="content_cover"
                      :list="JSON.parse(item.pictures)"
                    />

                    <div class="content_del" @click.stop="delFun(index, 'scene', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num one_content_num_scene"
                  v-if="info.sceneMax && info.sceneMax > 8"
                  @click.stop="showAllFun('scene', info.sceneIds)"
                >
                  <div>
                    共
                    <span>{{ info.sceneMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div
                  class="one_content one_content_add one_content_add_scene"
                  @click="showChooseSceneFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 虚拟模特 -->
          <div
            class="has_half"
            v-if="info.imageReplaceType == 1"
            :style="errList.model ? 'border-color:red' : ''"
            ref="modelRef"
            v-loading="delLoading == 'model'"
          >
            <div class="half_top">
              <div class="top_left">选择虚拟模特</div>
              <div class="top_right">
                <el-select
                  v-model="info.mannequinSelectMode"
                  placeholder="请选择虚拟模特处理方式"
                  style="width: 210px"
                  @change="mannequinSelectModeChange"
                >
                  <el-option
                    v-for="item in mannequinSelectModeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div class="half_content">
              <div class="half_content_content">
                <template v-for="(item, index) in info.mannequinList">
                  <div
                    class="one_content one_content_model"
                    v-if="index < 11"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="previewFun('查看模特', item.coverUrl, 'image', item.coverUrl)"
                  >
                    <img class="content_cover" :src="item.thumbCoverUrl || item.coverUrl" alt="" />
                    <img
                      v-if="item.brandId == '0'"
                      class="xm_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                      alt=""
                    />
                    <div class="content_del" @click.stop="delFun(index, 'model', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num one_content_num_model"
                  v-if="info.mannequinMax && info.mannequinMax > 11"
                  @click.stop="showAllFun('model', info.mannequinIds)"
                >
                  <div>
                    共
                    <span>{{ info.mannequinMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div
                  class="one_content one_content_add one_content_add_model"
                  @click="showSelectModelFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 创作文案 -->
        <div class="has_text" ref="textRef" v-if="info.creativeStruct == 2">
          <div class="text_title">创作文案</div>
          <div class="text_container">
            <div class="text_left">
              <div class="one_text_box one_text_box_flex">
                <div class="text_label">文案类型：</div>
                <div class="text_content text_content_flex">
                  <div
                    v-for="(item, index) in typeList"
                    :key="index"
                    @click.stop="info.titleGenconfig.titleDescType = item.value"
                    :class="{
                      one_text_type: true,
                      choose_text_type: info.titleGenconfig.titleDescType == item.value
                    }"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </div>
              <div class="one_text_box">
                <div class="text_label text_label_12">
                  关键词：
                  <el-tooltip popper-class="tooltip-class" placement="right">
                    <template #content>
                      <p>
                        可输入产品名称、卖点、活动信息...支持最多10个关键词、每个关键词最多10个字
                      </p>
                    </template>
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240918aabhm.png"
                      style="width: 16px; height: 16px; margin-left: 4px"
                    />
                  </el-tooltip>
                </div>
                <div class="keyword_select">
                  <el-select
                    v-model="info.titleGenconfig.keyword"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    :multiple-limit="10"
                    placeholder="请输入关键词，以回车键确认"
                    popper-class="publish_video_form_topic_select"
                    style="width: 100%"
                    :class="{ select_err: showKeywordsTip }"
                    @change="onChangeKeywords($event)"
                    @blur="onBlurKeywords($event)"
                  />
                </div>
                <div class="keyword_tip">
                  <span class="tips">文案是根据录入内容AI自动生成的，使用时请注意内容的合规性</span>
                  <div class="clear" @click="info.titleGenconfig.keyword = []">清空录入</div>
                </div>
              </div>
              <div
                class="one_text_box one_text_box_flex"
                style="align-items: flex-start; margin: -2px 0 18px"
              >
                <div class="text_label" style="margin-top: 2px">适用平台：</div>
                <div class="text_content text_content_flex">
                  <div
                    @click.stop="info.titleGenconfig.creationType = item.value"
                    :class="{
                      one_platform: true,
                      choose_platform: info.titleGenconfig.creationType == item.value
                    }"
                    v-for="(item, index) in platformList"
                    :key="index"
                  >
                    <div class="one_platform_content" :style="item.style">
                      <img :src="item.icon" alt="" />
                      <div>{{ item.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text_right">
              <div class="one_text_box">
                <div class="text_label text_label_12">挂载项：</div>
                <div class="text_content">
                  <div class="one_mount">
                    <div class="mount_label">+ 添加抖音话题#</div>
                    <div class="mount_content">
                      <chooseDYTopic origin="task" v-model:topicList="info.mount.dyTopic" />
                    </div>
                  </div>
                  <div class="one_mount">
                    <div class="mount_label">+ 添加小红书话题#</div>
                    <div class="mount_content">
                      <chooseXHSTopic origin="task" v-model:topicList="info.mount.xhsTopic" />
                    </div>
                  </div>
                  <div class="one_mount">
                    <div class="mount_label">+ 添加小红书@</div>
                    <div class="mount_content">
                      <chooseAtPerson
                        type="xhs"
                        origin="task"
                        v-model:atPersonList="info.mount.xhsAt"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="bottom_content">
                <el-button :loading="createLoading" class="text_btn" @click.stop="createFun">
                  生成预览文案
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择实拍图 -->
    <selectMaterialDOM
      :origin="chooseMaterialDialog.origin"
      :fileOrigin="chooseMaterialDialog.fileOrigin"
      :fileType="chooseMaterialDialog.fileType"
      :isBgm="true"
      v-if="chooseMaterialDialog.show"
      :info="chooseMaterialDialog"
      :dialogTitle="chooseMaterialDialog.dialogTitle"
      :materialType="chooseMaterialDialog.materialType"
      :materialTypeList="chooseMaterialDialog.materialTypeList"
      :materialSources="chooseMaterialDialog.materialSources"
      :materialSubSource="[]"
      :isAllInfo="true"
      :showMarkICON="false"
      :hideName="chooseMaterialDialog.hideName"
      :infoSearchComponents="chooseMaterialDialog.searchComponents"
      :extraParams="chooseMaterialDialog.extraParams || {}"
      @updateSelectInfo="updateSelectFun"
    />
    <!-- 查看全部 -->
    <materialDOM
      :showXMICON="true"
      origin="templateImgText"
      v-if="allMaterialDilog.show"
      :materialDialog="allMaterialDilog"
      :materialText="allMaterialDilog.materialText"
      :materialIds="allMaterialDilog.materialIds"
      :dialogTitle="allMaterialDilog.dialogTitle"
      :delMessageBox="allMaterialDilog.delMessageBox"
      @previewFun="previewFun"
      :batchDel="true"
      :showMarkICON="allMaterialDilog.showMarkICON"
      :hideName="allMaterialDilog.hideName"
      @updateChooseList="updateChooseList"
    />
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 添加不可替换图 -->
    <addNoReplaceDOM
      :previewImg="previewImg"
      :imgLen="info.imageCnt - 1"
      v-if="addNoReplaceDialog.show"
      :addDialog="addNoReplaceDialog"
      @updateFun="updateNoReplaceFun"
    />
    <!-- 添加虚拟模特 -->
    <selectModelDOM
      origin="batchCreate"
      tip="批量生产图文仅支持使用非员工上传的虚拟模特图片"
      v-if="selectModelDialog.show"
      :id="info.id"
      :selectDialog="selectModelDialog"
      @updateFun="updateSelectFun"
    />
  </div>
</template>
<script setup>
import chooseDYTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_dy_topic.vue'
import chooseXHSTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_xhs_topic.vue'
import chooseAtPerson from '@/views/market/marketing_task/create_task/components/video_setting/choose_atPerson.vue'
import { generatePreviewTitle, saveImageCreativeSetting } from '@/api/sumvideo/template_imgText'
import { saveImagePipelineConfig } from '@/api/sumvideo/create_by_imgtext.js'
import { detailFun } from '@/views/sumvideo/template_imgText/js/detail.js'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
import selectModelDOM from '@/views/sumvideo/template_imgText/components/select_model_dialog.vue'
import addNoReplaceDOM from '@/views/sumvideo/template_imgText/components/add_noReplace_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import selectMaterialDOM from '@/views/sumvideo/components/material/select_material_dialog.vue'
import previewImgText from '@/views/sumvideo/components/preview_img_text.vue'

import { throttle, isEmpty, isNotEmpty } from '@/utils/tools'

const props = defineProps({
  templateId: {
    type: Number || String,
    default: null
  },
  pipelineId: {
    type: Number || String,
    default: null
  },
  templateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { pipelineId, templateId } = toRefs(props)
// 预览的信息
const previewImg = ref([])
const previewTextInfo = ref({
  title: '',
  desc: ''
})
// --处理方式修改
const oldSelectMode = reactive({
  mannequin: 1,
  realShoot: [0]
})
const mannequinSelectModeList = reactive([
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
]) // 虚拟模特处理方式列表
const realShootSelectModeList = reactive([
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
]) // 实拍图处理方式列表
const info = ref({
  id: null,
  creativeStruct: null, // 1 仅图片 2 图文
  imageCnt: null, // 图文图片数量
  realShootList: [], // 实拍图
  nonReplaceable: [], // 不可替换图
  sceneList: [], // 场景图
  mannequinList: [], // 模特图
  realShootSelectMode: [0], // 实拍图处理方式
  mannequinSelectMode: 1, // 虚拟模特处理方式
  titleGenconfig: {
    titleDescType: 2, // 文案类型
    keyword: [], // 关键词
    creationType: 1 // 当前选中的适用平台
  }, // 文案生成配置
  mount: {
    dyTopic: [], // 抖音话题列表
    xhsTopic: [], // 小红书话题列表
    xhsAt: [] // 小红书@列表
  } // 创作文案
})

// 实拍图处理方式
function realShootSelectModeChange(e) {
  console.log('选择变化', e)
  delLoading.value = 'shoot'
  const params = {
    checkConfig: 1, // 本次保存需要检查的配置 1实拍图 2场景图 3虚拟模特
    shootPhotoRule: {
      selectMode: e && e.length > 1 ? e[1] || 1 : parseInt(e[0]) // 1单一模特 2随机模特 3不重复模特 4单一商品 5随机商品 6不重复商品
    }
  }
  console.log('params', params)
  saveConfig(params)
    .then(() => {
      oldSelectMode.realShoot = JSON.parse(JSON.stringify(info.value.realShootSelectMode))
    })
    .catch(() => {
      // info.value.realShootSelectMode = JSON.parse(JSON.stringify(oldSelectMode.realShoot))
    })
}
// 虚拟模特处理方式
function mannequinSelectModeChange(e) {
  console.log('选择变化', e)
  delLoading.value = 'model'
  const params = {
    checkConfig: 3,
    mannequinRule: {
      selectMode: e,
      tagIds: []
    }
  }
  console.log('params', params)
  saveConfig(params)
    .then(() => {
      oldSelectMode.mannequin = JSON.parse(JSON.stringify(info.value.mannequinSelectMode))
    })
    .catch(() => {
      // info.value.mannequinSelectMode = JSON.parse(JSON.stringify(oldSelectMode.mannequin))
    })
}
// function disabledClickFun(type) {
//   console.log('ttt', type)
//   if (type === 'shoot') {
//     if (isEmpty(info.value.realShootList)) {
//       message.warning('请先上传实拍图')
//     }
//   }
// }
// --处理方式修改 end
//   -- 保存配置
function saveConfig(params) {
  return new Promise((resolve, reject) => {
    params = {
      ...params,
      id: templateId.value, // 模板id
      pipelineId: pipelineId.value // 流水线id
    }
    saveImagePipelineConfig(params)
      .then(res => {
        if (res.code === 0) {
          delLoading.value = ''
          resolve(res)
        } else {
          delLoading.value = ''
          reject(res)
        }
      })
      .catch(err => {
        delLoading.value = ''
        reject(err)
      })
  })
}
//  -- 保存配置 end

// --创作文案
const createLoading = ref(false) // 生成按钮Loading

// 文案类型
const typeList = ref([
  { label: '种草文案', value: 2 },
  { label: '爆款标题', value: 1 },
  { label: '测评文案', value: 3 },
  { label: '买家秀评价', value: 5 }
])
// 适用平台列表
const platformList = ref([
  {
    style: 'background: #FEEBEB;',
    label: '小红书',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809ttngj.png'
  },
  {
    style: 'background: #F1F1F1;',
    label: '抖音',
    value: 2,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809vz7ck.png'
  },

  {
    style: 'background: #F3F4F8;',
    label: '朋友圈',
    value: 5,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240906asprc.png'
  },
  {
    style: 'background: #FFEEE7;',
    label: '快手',
    value: 3,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809wmpj4.png'
  },
  {
    style: 'background: #FFF4E9;',
    label: '视频号',
    value: 4,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809n1a7d.png'
  }
])

const showKeywordsTip = computed(() => {
  return errList.text && info.value.titleGenconfig.keyword.length === 0
})
// 关键词内容改变
const onChangeKeywords = value => {
  errList.text = false
  value.forEach((x, i) => {
    const text = typeof x === 'string' ? x.replace(/\s+/g, '') : ''
    if (text.length > 10) {
      message.warning('每个关键词不超过10个字')
      info.value.titleGenconfig.keyword.splice(i, 1)
    } else if (!text.length) {
      info.value.titleGenconfig.keyword.splice(i, 1)
    } else {
      info.value.titleGenconfig.keyword[i] = text
    }
  })
}
// 失焦添加关键词
const onBlurKeywords = e => {
  errList.text = false
  const value = e.target.value.replace(/\s+/g, '')
  if (value && info.value.titleGenconfig.keyword.length < 10 && value.length < 11) {
    info.value.titleGenconfig.keyword.push(value)
  } else {
    if (value) {
      if (info.value.titleGenconfig.keyword.length >= 10) {
        message.warning('最多添加10个关键词')
      } else if (value.length > 10) {
        message.warning('每个关键词不超过10个字')
      }
    }
  }
}
// 开始生成
const createFun = throttle(() => {
  if (isEmpty(info.value.titleGenconfig.keyword)) {
    errList.text = true
    message.warning('关键词不能为空')
    return
  }
  createLoading.value = true
  previewTextInfo.value.title = ''
  previewTextInfo.value.desc = ''
  // 先保存创作文案配置 再去生成预览文案
  saveImageCreativeSetting({
    creativeId: templateId.value,
    titleGenconfig: getTitleConfig()
  })
    .then(res => {
      if (res.code === 0) {
        generatePreviewTitle({
          id: templateId.value
        })
          .then(res1 => {
            if (res1.code === 0) {
              const resultList = res1.data
              message.success('文案生成成功')

              previewTextInfo.value.title = resultList[0]?.title || ''
              previewTextInfo.value.desc = resultList[0]?.description || ''
            }
            createLoading.value = false
          })
          .catch(() => {
            createLoading.value = false
          })
        // console.log(getResult())
      } else {
        createLoading.value = false
      }
    })
    .catch(() => {
      createLoading.value = false
    })
}, 700)

// --创作文案 end

const pageLoading = ref(true)
onMounted(() => {
  pageLoading.value = true
  if (isNotEmpty(props.templateInfo)) {
    const resData = JSON.parse(JSON.stringify(props.templateInfo))
    // 根据图文图片数量生成左侧预览图
    const imgList = []
    for (let i = 0; i < resData.imageCnt; i++) {
      imgList.push({
        url: ''
      })
    }
    // 如果有不可替换图，就将他替换到对应的预览图片里
    if (resData.nonReplaceable && resData.nonReplaceable.length > 0) {
      resData.nonReplaceable.forEach(x => {
        imgList[x.index] = {
          index: x.index,
          url: x.resourceUrl
        }
      })
    }
    previewImg.value = imgList
    // 预览文案回显
    if (isNotEmpty(resData.previewTitle)) {
      previewTextInfo.value.title = resData.previewTitle[0]?.title || ''
      previewTextInfo.value.desc = resData.previewTitle[0]?.description || ''
    }

    info.value = resData
    if (resData.realShootSelectMode) {
      oldSelectMode.realShoot = JSON.parse(JSON.stringify(resData.realShootSelectMode))
    }
    if (resData.mannequinSelectMode) {
      oldSelectMode.mannequin = JSON.parse(JSON.stringify(resData.mannequinSelectMode))
    }
    nextTick(() => {
      pageLoading.value = false
    })
  } else {
    pageLoading.value = false
  }
})

const message = inject('$message')

const saveLoading = ref(false)
// 如果不符合要求，就滚动到该位置
function validToScrollFun(ref) {
  ref?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
const errList = reactive({
  text: false,
  scene: false,
  shoot: false,
  model: false
})
const textRef = ref()
const modelRef = ref()
const sceneRef = ref()
const shootRef = ref()
const {
  validFun,
  previewInfo,
  previewFun,
  updateChooseList,
  showAllFun,
  allMaterialDilog,
  delFun,
  delLoading,
  showSelectModelFun,
  selectModelDialog,
  showChooseSceneFun,
  updateNoReplaceFun,
  showAddNoReplaceFun,
  addNoReplaceDialog,
  updateSelectFun,
  showChooseMaterialFun,
  chooseMaterialDialog
} = detailFun('batchCreate', templateId.value || null, info, previewImg, errList)
// 校验表单 type all 所有 shoot 实拍图 scene 场景图
// function validFun(type) {
//   console.log('校验', type)
//   return new Promise(resolve => {
//     // 校验实拍图的数量 不能少于总数量-不可替换数量
//     const shootLen = previewImg.value.length - info.value.nonReplaceable.length
//     let errTip = ''
//     // 校验实拍图选择是否符合要求 -- 目前有markURL黑白图就是要替换的，否则就是无需替换
//     // 如当前模板需要换脸换背景，则实拍图必须全部是通过“上传需要替换人脸的实拍模特图、人台图”上传且有黑白通道图内容，否则提示“请选择虚拟模特”
//     // 如当前模板不需要换脸换背景，则实拍图必须全部是通过“上传无需替换人脸的产品实拍图”上传的透明背景图片，否则提示“当前实拍图类型不支持选择虚拟模特”
//     if (type === 'all') {
//       if (info.value.realShootList && info.value.realShootList.length > 0) {
//         // 需要换脸换背景
//         let qualifiedList = []
//         const hasMarkUrl = !!info.value.realShootList[0].markUrl
//         if (info.value.imageReplaceType && info.value.imageReplaceType === 1) {
//           qualifiedList = info.value.realShootList.filter(x => x.markUrl)
//         } else {
//           // 不需要换脸换背景
//           qualifiedList = info.value.realShootList.filter(x => !x.markUrl)
//         }
//         if (qualifiedList.length === info.value.realShootList.length) {
//           errList.model = false
//         } else {
//           if (!errTip) {
//             errTip = hasMarkUrl ? `请选择虚拟模特` : '当前实拍图类型不支持选择虚拟模特'
//           }
//           errList.model = true
//         }
//       } else {
//         if (!errTip) {
//           errTip = '请选择实拍图'
//         }
//         errList.shoot = true
//       }
//     }
//     if (['all', 'shoot'].includes(type)) {
//       if (info.value.realShootList.length < shootLen) {
//         if (!errTip) {
//           errTip =
//             info.value.realShootList.length > 0 ? `请选择至少${shootLen}张实拍图` : '请选择实拍图'
//         }
//         errList.shoot = true
//       } else {
//         if (!errList.shoot) {
//           errList.shoot = false
//         }
//       }
//     }

//     if (['all', 'scene'].includes(type)) {
//       // 校验场景图的个数 不能为空
//       if (isEmpty(info.value.sceneList)) {
//         if (!errTip) {
//           errTip = `请选择场景图`
//         }
//         errList.scene = true
//       } else {
//         errList.scene = false
//       }
//     }
//     // 校验关键词  不能为空 图文才校验
//     if (isEmpty(info.value.titleGenconfig.keyword) && info.value.creativeStruct === 2) {
//       if (!errTip) {
//         errTip = `请填写文案关键词`
//       }
//       errList.text = true
//     } else {
//       errList.text = false
//     }

//     resolve(errTip || '')
//   })
// }
// 获取创作文案配置的入参
function getTitleConfig() {
  if (info.value.creativeStruct === 2) {
    return {
      bizType: 4, // 生成业务类型1模板 2批量任务 3小程序标题 4图文模板
      creationType: info.value.titleGenconfig.creationType, // 创作类型 0通用 1小红书文案 2抖音标题 3快手 4视频号 5朋友圈
      creativeId: templateId.value,
      generateCount: 1, // 期望生成条数
      generateTone: 1, // 生成语气 1友好 2专业 3接地气 4活泼 5文艺
      keyWords: info.value.titleGenconfig.keyword.join('、'), // 关键词 每个关键词以、间隔
      titleDescType: info.value.titleGenconfig.titleDescType // 文案类型 1 爆款文案 2种草文案 3 测评文案 4 教程文案 5买家秀评价
    }
  } else {
    return null
  }
}
// 保存
const saveFun = () => {
  return new Promise((resolve, reject) => {
    if (createLoading.value) {
      message.warning('文案生成中，不支持进行下一步，请稍后再试')
      reject(new Error())
      return
    }
    if (saveLoading.value) {
      reject(new Error())
      return
    }
    // 校验实拍图是否符合要求
    saveLoading.value = true
    validFun('all').then(errTip => {
      if (errTip) {
        message.warning(errTip)

        if (errList.shoot) {
          validToScrollFun(shootRef.value)
        } else if (errList.model) {
          validToScrollFun(modelRef.value)
        } else if (errList.scene) {
          validToScrollFun(sceneRef.value)
        } else if (errList.text) {
          validToScrollFun(textRef.value)
        }
        saveLoading.value = false
        reject(new Error())
        return
      }
      // 抖音话题目前组件是没有Id的，后端需要，所以在回显的时候要做下转换
      const dyTopic = []
      if (isNotEmpty(info.value.mount.dyTopic)) {
        info.value.mount.dyTopic.forEach(x => {
          dyTopic.push({
            id: null,
            name: x
          })
        })
      }
      // 图文模板封面：不可替换图+实拍图前N张
      const previewImgList = JSON.parse(JSON.stringify(previewImg.value))
      let i = 0
      previewImgList.forEach(x => {
        if (!x.url) {
          const oneInfo = info.value.realShootList[i]
          x.url = oneInfo.coverUrl || oneInfo.mediaUrl || oneInfo.url
          i++
        }
      })
      console.log('prew', previewImgList)
      saveImageCreativeSetting({
        pictures: JSON.stringify(previewImgList),
        complete: true,
        creativeId: templateId.value,
        mount: {
          dyTopic: dyTopic,
          xhsAt: info.value.mount.xhsAt,
          xhsTopic: info.value.mount.xhsTopic
        },
        nonReplaceable: info.value.nonReplaceable,
        titleGenconfig: getTitleConfig()
      })
        .then(res => {
          if (res.code === 0) {
            saveLoading.value = false
            emits('updateInfo', info.value)
            resolve(info.value)
          } else {
            saveLoading.value = false
            reject(res)
          }
        })
        .catch(err => {
          saveLoading.value = false
          reject(err)
        })
    })
  })
}
defineExpose({
  saveFun
})
const emits = defineEmits(['updateInfo', 'update:btnDisabled'])
watch(
  () => pageLoading.value,
  val => {
    emits('update:btnDisabled', val)
  }
)
watch(
  () => delLoading.value,
  val => {
    emits('update:btnDisabled', !!val)
  }
)
watch(
  () => info.value,
  val => {
    emits('updateInfo', val)
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<style lang="scss" scoped>
@import '../template_imgText/scss/detail.scss';
:deep(img) {
  overflow-clip-margin: border-box;
  -webkit-overflow-clip-margin: border-box;
}
:deep(.one_material) {
  background: transparent !important;
}
:deep(.videoElement_box .video_item .item_top) {
  background: transparent !important;
}

.half_top {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  padding-right: 11px !important;
  .top_left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}

.one_has {
  padding-bottom: 0 !important;
  padding-top: 16px !important;
  margin: 0 !important;
}
.has_text {
  margin-top: 4px !important;
}
.page_right {
  width: calc(100% - 313px) !important;
  padding: 0 0 0 4px !important;
}
</style>
