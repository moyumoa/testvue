<template>
  <div class="page">
    <!-- Banner图 标准版才有 -->
    <div class="page_banner" v-if="version == 1">
      <el-carousel
        class="banner_swiper"
        trigger="click"
        height="80px"
        arrow="never"
        :interval="5000"
      >
        <el-carousel-item
          v-for="(item, index) in bannerList"
          :key="index"
          @click.stop="customizedFun"
        >
          <div class="one_banner" style="height: 80px">
            <img :src="item.img" alt="" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="page_container" v-loading="pageLoading">
      <!-- 脚本生成类 -->
      <el-collapse v-model="generateCollapse">
        <el-collapse-item :name="1">
          <template #title>
            <div class="collapse_title">
              <img
                :class="[
                  isNotEmpty(generateCollapse) && generateCollapse[0] === 1 ? 'put' : 'expand'
                ]"
                src="https://tagvv-1256030678.file.myqcloud.com/20250107fw46m.png"
                alt=""
              />
              <span>脚本生成类（{{ generateList.length || 0 }}）</span>
            </div>
          </template>
          <div class="collapse_container">
            <div class="one_box" v-for="(item, index) in generateList" :key="index">
              <div class="box_title">
                <img :src="item.icon" alt="" />
                {{ item.title }}
              </div>
              <div class="box_tip">{{ item.tip }}</div>

              <el-tabs
                v-if="version == 2"
                class="box_tabs"
                v-model="item.actAction"
                @tab-click="resetTab"
              >
                <el-tab-pane
                  v-for="(actionItem, actionIndex) in item.showAction"
                  :key="actionIndex"
                  :label="actionItem.label"
                  :name="actionItem.value"
                >
                  <div class="tab_pane_box">
                    <div
                      class="one_tab_pane file_tab_pane"
                      v-for="(fileItem, fileIndex) in $data.generateInfo[item.value][
                        actionItem.value + 'List'
                      ]"
                      :key="fileIndex"
                      @click.stop="showPreviewFileFun(fileItem)"
                    >
                      <div :class="getFileICON(fileItem.fileUrl)"></div>
                      <div class="file_name">{{ fileItem.fileName }}</div>
                      <img
                        @click.stop="
                          delFun(fileIndex, 'generate', item.value, actionItem, fileItem)
                        "
                        class="file_del"
                        src="https://tagvv-1256030678.file.myqcloud.com/20250107i4nrm.png"
                        alt=""
                      />
                    </div>
                    <div
                      v-if="isEmpty($data.generateInfo[item.value][actionItem.value + 'List'])"
                      class="one_tab_pane upload_tab_pane"
                      @click.stop="showUploadDialog('generate', item.value, actionItem)"
                    >
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20250107v9wo3.png"
                        alt=""
                      />
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <!-- 文案学习类 基础版企业智能体没有文案学习类 -->
      <el-collapse v-model="studyCollapse" v-if="version == 2">
        <el-collapse-item :name="1">
          <template #title>
            <div class="collapse_title">
              <img
                :class="[isNotEmpty(studyCollapse) && studyCollapse[0] === 1 ? 'put' : 'expand']"
                src="https://tagvv-1256030678.file.myqcloud.com/20250107fw46m.png"
                alt=""
              />
              <span>文案学习类（{{ studyList.length || 0 }}）</span>
            </div>
          </template>
          <div class="collapse_container">
            <div class="one_box" v-for="(item, index) in studyList" :key="index">
              <div class="box_title">
                <img :src="item.icon" alt="" />
                {{ item.title }}
              </div>
              <div class="box_tip">{{ item.tip }}</div>
              <div class="box_analysis">
                <el-input
                  :disabled="$data.studyInfo[item.value].loading"
                  class="analysis_input"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  type="textarea"
                  v-model.trim="$data.studyInfo[item.value].input"
                  resize="none"
                  placeholder="请输入小红书笔记链接地址🔗"
                ></el-input>
                <div class="analysis_btn">
                  <el-button
                    :loading="$data.studyInfo[item.value].loading"
                    type="primary"
                    @click="analysisFun(item.value)"
                  >
                    解析
                  </el-button>
                  <el-button
                    :disabled="$data.studyInfo[item.value].loading"
                    style="margin-left: 16px; padding: 8px 12px"
                    @click.stop="showPreviewKonwledgeFun"
                  >
                    查看当前知识库
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <!-- 文案创作类 -->
      <el-collapse v-model="createCollapse">
        <el-collapse-item :name="1">
          <template #title>
            <div class="collapse_title">
              <img
                :class="[isNotEmpty(createCollapse) && createCollapse[0] === 1 ? 'put' : 'expand']"
                src="https://tagvv-1256030678.file.myqcloud.com/20250107fw46m.png"
                alt=""
              />
              <span>文案创作类（{{ createList.length || 0 }}）</span>
            </div>
          </template>
          <div class="collapse_container">
            <div class="one_box" v-for="(item, index) in createList" :key="index">
              <div class="box_title">
                <img :src="item.icon" alt="" />
                {{ item.title }}
              </div>
              <div class="box_tip">{{ item.tip }}</div>

              <el-tabs
                class="box_tabs"
                v-if="version == 2"
                v-model="item.actAction"
                @tab-click="resetTab"
              >
                <el-tab-pane
                  v-for="(actionItem, actionIndex) in item.showAction"
                  :key="actionIndex"
                  :label="actionItem.label"
                  :name="actionItem.value"
                >
                  <div class="tab_pane_box">
                    <div
                      class="one_tab_pane file_tab_pane"
                      v-for="(fileItem, fileIndex) in $data.createInfo[item.value][
                        actionItem.value + 'List'
                      ]"
                      :key="fileIndex"
                      @click.stop="showPreviewFileFun(fileItem)"
                    >
                      <div :class="getFileICON(fileItem.fileUrl)"></div>
                      <div class="file_name">{{ fileItem.fileName }}</div>
                      <img
                        @click.stop="delFun(fileIndex, 'create', item.value, actionItem, fileItem)"
                        class="file_del"
                        src="https://tagvv-1256030678.file.myqcloud.com/20250107i4nrm.png"
                        alt=""
                      />
                    </div>
                    <div
                      v-if="isEmpty($data.createInfo[item.value][actionItem.value + 'List'])"
                      class="one_tab_pane upload_tab_pane"
                      @click.stop="showUploadDialog('create', item.value, actionItem)"
                    >
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20250107v9wo3.png"
                        alt=""
                      />
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- 上传弹窗 -->
    <wordUploadDOM
      v-if="uploadDialog.show"
      :uploadDialog="uploadDialog"
      @uploadSuccess="uploadSuccess"
    />
    <!-- 预览文件弹窗 -->
    <previewFileDOM v-if="previewFileDialog.show" :previewFileDialog="previewFileDialog" />
    <!-- 预览知识库弹窗 -->
    <previewKonwledgeDOM
      v-if="previewKonwledgeDialog.show"
      :previewKonwledgeDialog="previewKonwledgeDialog"
    />
    <!-- 保存到知识库弹窗 -->
    <saveKonwledgeDOM v-if="saveKonwledgeDialog.show" :saveKonwledgeDialog="saveKonwledgeDialog" />
  </div>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import previewFileDOM from './components/preview_file_dialog.vue'
import previewKonwledgeDOM from './components/preview_knowledge_dialog.vue'
import saveKonwledgeDOM from './components/save_knowledge_dialog.vue'
import wordUploadDOM from './components/word_upload_dialog.vue'
import { isNotEmpty, throttle, getFileICON, isEmpty } from '@/utils/tools'
import {
  deleteKnowledgeDocument,
  resolveXhsTitle,
  listIntelligent
} from '@/api/sumvideo/intelligent_agent.js'
import { useStore } from 'vuex'
const store = useStore()
const info = computed(() => {
  return store.getters.userInfo
    ? store.getters.userInfo
    : localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
})
const version = ref(1) // 1标准版 2升级版
const bannerList = reactive([
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/20250116seqs7.png'
  },
  {
    img: 'https://tagvv-1256030678.file.myqcloud.com/20250117azib8.png'
  }
]) // Banner列表

const generateCollapse = ref([1]) // 脚本生成类是否展开
const generateList = ref([
  {
    value: 'video',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250107pftqo.png',
    title: '爆款短视频拆解生成剧本',
    tip: 'Agent说明：能够根据提供的短视频链接，生成结构相近、风格相似的剧本，并支持定制化流程，通过添加禁用词知识库，提升剧本的个性化水平！',
    actAction: 'prohibitedWords',
    showAction: [{ value: 'prohibitedWords', label: '禁用词', datasetId: null }] // 支持哪些操作
  },
  {
    value: 'produce',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250107pftqo.png',
    title: '根据产品生成剧本',
    tip: 'Agent说明：能够快速选择产品生成剧本，支定制化流程，通过持添加公司文化、禁用词知识库，提升剧本的个性化水平！',
    actAction: 'companyCulture',
    showAction: [
      { value: 'companyCulture', label: '公司文化', datasetId: 0 },
      { value: 'prohibitedWords', label: '禁用词', datasetId: 0 },
      { value: 'productInformation', label: '产品信息', datasetId: 0 }
    ] // 支持哪些操作
  },
  {
    value: 'keyword',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250107pftqo.png',
    title: '根据关键内容生成剧本',
    tip: 'Agent说明：能够根据提供的关键内容生成剧本，并支持定制化流程通过添加公司文化、禁用词知识库，提升剧本的个性化水平！',
    actAction: 'companyCulture',
    showAction: [
      { value: 'companyCulture', label: '公司文化', datasetId: 0 },
      { value: 'prohibitedWords', label: '禁用词', datasetId: 0 }
    ] // 支持哪些操作
  }
]) // 脚本生成类有哪些

const studyCollapse = ref([1]) // 文案学习是否展开
const studyDatasetId = ref(0) // 文案学习的datesetId
const studyList = ref([
  {
    value: 'xhs',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250107zagoz.png',
    title: '小红书爆款文案学习',
    tip: 'Agent说明：支持自动识别链接添加优质小红书爆款标题和文案，通过不断的学习和积累，将生产出更符合品牌需要的文案内容哦～'
  }
]) // 文案学习类有哪些

const createCollapse = ref([1]) // 文案创作是否展开
const createList = ref([
  {
    value: 'xhs',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20250107zagoz.png',
    title: '小红书爆款文案创作',
    tip: 'Agent说明：能够根据小红书平台特点和语言风格生成爆款文案，并支持添加公司文化，提升文案创作的个性化水平！',
    actAction: 'companyCulture',
    showAction: [{ value: 'companyCulture', label: '公司文化', datasetId: 0 }] // 支持哪些操作
  },
  {
    value: 'dy',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202501072y3si.png',
    title: '抖音爆款文案创作',
    tip: 'Agent说明：能够根据抖音的平台特点和语言风格生成爆款文案，并支持添加公司文化、禁用词知识库，提升文案创作的个性化水平！',
    actAction: 'companyCulture',
    showAction: [
      { value: 'companyCulture', label: '公司文化', datasetId: 0 },
      { value: 'prohibitedWords', label: '禁用词', datasetId: 0 }
    ] // 支持哪些操作
  },
  {
    value: 'ks',
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202501079fe5i.png',
    title: '快手爆款文案创作',
    tip: 'Agent说明：能够根据快手的平台特点和语言风格生成爆款文案，并支持添加公司文化，提升文案创作的个性化水平！',
    actAction: 'companyCulture',
    showAction: [{ value: 'companyCulture', label: '公司文化', datasetId: 0 }] // 支持哪些操作
  }
]) // 文案创作类有哪些

const $data = reactive({
  studyInfo: {
    xhs: {
      input: '', // 小红书爆款文案学习的输入框内容
      loading: false // 小红书爆款文案学习的解析Loading
    }
  },
  generateInfo: {
    video: {
      prohibitedWordsList: [
        // {
        //   fileName: '品牌公司文化.pdf',
        //   fileUrl:
        //     'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/05af6716b1c949ac95b3473dc3b35e7a_1736302697992.docx'
        // }
      ] // 禁用词列表
    },
    produce: {
      companyCultureList: [], // 公司文化列表
      prohibitedWordsList: [], // 禁用词列表
      productInformationList: [] // 产品信息列表
    },
    keyword: {
      companyCultureList: [], // 公司文化列表
      prohibitedWordsList: [] // 禁用词列表
    }
  },
  createInfo: {
    xhs: {
      companyCultureList: [] // 公司文化列表
    },
    dy: {
      companyCultureList: [], // 公司文化列表
      prohibitedWordsList: [] // 禁用词列表
    },
    ks: {
      companyCultureList: [] // 公司文化列表
    }
  }
})
const pageLoading = ref(true)
onMounted(() => {
  pageLoading.value = true
  if (info.value.isCustomizeIntelligent && info.value.isCustomizeIntelligent === 1) {
    version.value = 2
  } else {
    version.value = 1
  }
  // 标准版下 脚本生成类没有根据产品生成剧本
  if (version.value === 1) {
    generateList.value.splice(1, 1)
  }

  refreshIntelligent()
})

function refreshIntelligent() {
  /**
   * 把后端返回的数据拼到对应的前端对象上
   */
  listIntelligent({})
    .then(res => {
      if (res.code === 0) {
        // 除了文案学习的 ，其他的datasetid要补充到对应的对象上面
        generateList.value[0].showAction[0].datasetId = res.data[
          '1'
        ][0].workflowAbilities[0].knowledgeSet.filter(e => e.datasetType === 2)[0].datasetId // 爆款短视频拆解生成剧本的禁用词datasetid
        generateList.value[1].showAction[0].datasetId = res.data[
          '1'
        ][0].workflowAbilities[1].knowledgeSet.filter(e => e.datasetType === 1)[0].datasetId // 根据产品生成剧本的公司文化datasetid
        generateList.value[1].showAction[1].datasetId = res.data[
          '1'
        ][0].workflowAbilities[1].knowledgeSet.filter(e => e.datasetType === 2)[0].datasetId // 根据产品生成剧本的禁用词datasetid
        generateList.value[1].showAction[2].datasetId = res.data[
          '1'
        ][0].workflowAbilities[1].knowledgeSet.filter(e => e.datasetType === 3)[0].datasetId // 根据产品生成剧本的产品信息datasetid
        generateList.value[2].showAction[0].datasetId = res.data[
          '1'
        ][0].workflowAbilities[2].knowledgeSet.filter(e => e.datasetType === 1)[0].datasetId // 根据关键内容生成剧本的公司文化datasetid
        generateList.value[2].showAction[1].datasetId = res.data[
          '1'
        ][0].workflowAbilities[2].knowledgeSet.filter(e => e.datasetType === 2)[0].datasetId // 根据关键内容生成剧本的禁用词datasetid

        studyDatasetId.value = res.data['2'][0].workflowAbilities[0].knowledgeSet.filter(
          e => e.datasetType === 0
        )[0].datasetId // 文案学习的datasetid

        createList.value[0].showAction[0].datasetId = res.data[
          '3'
        ][0].workflowAbilities[0].knowledgeSet.filter(e => e.datasetType === 1)[0].datasetId // 小红书爆款文案创作的公司文化datasetid
        createList.value[1].showAction[0].datasetId = res.data[
          '3'
        ][0].workflowAbilities[1].knowledgeSet.filter(e => e.datasetType === 1)[0].datasetId // 抖音爆款文案创作的公司文化datasetid
        createList.value[1].showAction[1].datasetId = res.data[
          '3'
        ][0].workflowAbilities[1].knowledgeSet.filter(e => e.datasetType === 2)[0].datasetId // 抖音爆款文案创作的禁用词datasetid
        createList.value[0].showAction[0].datasetId = res.data[
          '3'
        ][0].workflowAbilities[2].knowledgeSet.filter(e => e.datasetType === 1)[0].datasetId // 快手爆款文案创作的公司文化datasetid

        /**
         * 补充文件地址
         */
        const cultureObjList =
          res.data['1'][0].workflowAbilities[1].documents['1'] !== undefined
            ? [
                {
                  fileName: res.data['1'][0].workflowAbilities[1].documents['1'][0].documentName,
                  fileUrl: res.data['1'][0].workflowAbilities[1].documents['1'][0].url,
                  documentId: res.data['1'][0].workflowAbilities[1].documents['1'][0].documentId
                }
              ]
            : [] // 通用的公司文化列表

        $data.generateInfo.video.prohibitedWordsList =
          res.data['1'][0].workflowAbilities[0].documents['2'] !== undefined
            ? [
                {
                  fileName: res.data['1'][0].workflowAbilities[0].documents['2'][0].documentName,
                  fileUrl: res.data['1'][0].workflowAbilities[0].documents['2'][0].url,
                  documentId: res.data['1'][0].workflowAbilities[0].documents['2'][0].documentId
                }
              ]
            : [] // 爆款短视频拆解生成剧本的禁用词列表
        $data.generateInfo.produce.companyCultureList = cultureObjList // 根据产品生成剧本的公司文化列表

        $data.generateInfo.produce.prohibitedWordsList =
          res.data['1'][0].workflowAbilities[1].documents['2'] !== undefined
            ? [
                {
                  fileName: res.data['1'][0].workflowAbilities[1].documents['2'][0].documentName,
                  fileUrl: res.data['1'][0].workflowAbilities[1].documents['2'][0].url,
                  documentId: res.data['1'][0].workflowAbilities[1].documents['2'][0].documentId
                }
              ]
            : [] // 根据产品生成剧本的禁用词列表
        $data.generateInfo.produce.productInformationList =
          res.data['1'][0].workflowAbilities[1].documents['3'] !== undefined
            ? [
                {
                  fileName: res.data['1'][0].workflowAbilities[1].documents['3'][0].documentName,
                  fileUrl: res.data['1'][0].workflowAbilities[1].documents['3'][0].url,
                  documentId: res.data['1'][0].workflowAbilities[1].documents['3'][0].documentId
                }
              ]
            : [] // 根据产品生成剧本的产品信息列表

        $data.generateInfo.keyword.companyCultureList = cultureObjList // 根据关键内容生成剧本的公司文化列表
        $data.generateInfo.keyword.prohibitedWordsList =
          res.data['1'][0].workflowAbilities[2].documents['2'] !== undefined
            ? [
                {
                  fileName: res.data['1'][0].workflowAbilities[2].documents['2'][0].documentName,
                  fileUrl: res.data['1'][0].workflowAbilities[2].documents['2'][0].url,
                  documentId: res.data['1'][0].workflowAbilities[2].documents['2'][0].documentId
                }
              ]
            : [] // 根据关键内容生成剧本的禁用词列表

        //  文案创作类 地址赋值
        $data.createInfo.xhs.companyCultureList = cultureObjList // 小红书爆款文案创作的公司文化列表
        $data.createInfo.dy.companyCultureList = cultureObjList // 抖音爆款文案创作的公司文化列表
        $data.createInfo.dy.prohibitedWordsList =
          res.data['3'][0].workflowAbilities[1].documents['2'] !== undefined
            ? [
                {
                  fileName: res.data['3'][0].workflowAbilities[1].documents['2'][0].documentName,
                  fileUrl: res.data['3'][0].workflowAbilities[1].documents['2'][0].url,
                  documentId: res.data['3'][0].workflowAbilities[1].documents['2'][0].documentId
                }
              ]
            : [] // 抖音爆款文案创作的禁用词列表
        $data.createInfo.ks.companyCultureList = cultureObjList // 快手爆款文案创作的公司文化列表
      } else {
        console.log('获取智能体数据失败')
      }
      nextTick(() => {
        pageLoading.value = false
      })
    })
    .catch(() => {
      pageLoading.value = false
    })
}

function resetTab() {
  console.log('tab切换')
}

// 显示上传弹窗
const uploadDialog = ref({
  show: false
})
// class 什么类别 例：脚本生成类 module 哪个模块 例：爆款短视频拆解生成剧本 tabItem 哪个tab 例：公司文化下的
const showUploadDialog = throttle((classItem, moduleItem, tabItem) => {
  console.log('showUploadDialog', classItem, moduleItem, tabItem)
  uploadDialog.value = {
    class: classItem,
    module: moduleItem,
    tabValue: tabItem.value,
    datasetId: tabItem.datasetId,
    show: true,
    title: '添加' + tabItem.label
  }
}, 700)
// 上传成功 目前只支持一个
function uploadSuccess(list) {
  // 如果删除的是公司文化，那所有智能体下公司文化都要删除。
  console.log('上传成功', list)
  console.log('上传成功2', uploadDialog.value)
  $data[uploadDialog.value.class + 'Info'][uploadDialog.value.module][
    uploadDialog.value.tabValue + 'List'
  ] = list
  refreshIntelligent()
  // $data[uploadDialog.value.class + 'Info'][uploadDialog.value.module][
  //   uploadDialog.value.tabValue + 'List'
  // ] =
  //   $data[uploadDialog.value.class + 'Info'][uploadDialog.value.module][
  //     uploadDialog.value.tabValue + 'List'
  //   ].concat(list)
}
// 删除文件  目前只支持一个
const delFun = throttle((index, classItem, moduleItem, tabItem, fileItem) => {
  // 如果删除的是公司文化，那所有智能体下公司文化都要删除。
  console.log('showUploadDialog', index, classItem, moduleItem, tabItem, fileItem)
  deleteKnowledgeDocument({
    documentIds: [fileItem.documentId]
  }).then(res => {
    if (res.code === 0) {
      message.success('删除成功')
      $data[classItem + 'Info'][moduleItem][tabItem.value + 'List'] = []
      refreshIntelligent()
    } else {
      message.error('删除失败')
    }
  })

  // $data[classItem + 'Info'][moduleItem][tabItem.value + 'List'].splice(index, 1)
}, 700)

// 显示预览文件的弹窗
const previewFileDialog = ref({
  show: false
})
const showPreviewFileFun = throttle(item => {
  const suffix = item.fileUrl.split('.').at(-1).toLowerCase()
  const fileType = {
    doc: 'doc',
    docx: 'doc',
    md: 'md',
    pdf: 'pdf',
    csv: 'csv',
    xls: 'xls',
    xlsx: 'xls',
    txt: 'txt'
  }

  previewFileDialog.value = {
    show: true,
    name: item.fileName,
    url: item.fileUrl,
    fileType: fileType[suffix]
  }
}, 700)

const message = inject('$message')
// 解析
const saveKonwledgeDialog = ref({
  show: false
}) // 显示保存到知识库的弹窗
const analysisFun = throttle(value => {
  // https://www.xiaohongshu.com/explore/6785c1e70000000020026a99?xsec_token=ABy2RXcYEfxZwMNBuOeh-1790s8zG8ZZ7VeMHb9954r-Y=&xsec_source=pc_feed
  if (isEmpty($data.studyInfo[value].input)) {
    message.warning('请先输入小红书笔记链接地址')
    return
  }
  $data.studyInfo[value].loading = true
  resolveXhsTitle({
    link: $data.studyInfo[value].input
  })
    .then(res => {
      if (res.code === 0) {
        saveKonwledgeDialog.value = {
          show: true,
          list: [res.data.title, res.data.content],
          datasetId: studyDatasetId.value
        }
        $data.studyInfo[value].input = ''
        $data.studyInfo[value].loading = false
      } else {
        $data.studyInfo[value].input = ''
        $data.studyInfo[value].loading = false
        message.error('链接识别失败，请更换链接试试吧')
      }
    })
    .catch(() => {
      $data.studyInfo[value].loading = false
    })
  // saveKonwledgeDialog.value = {
  //   show: true,
  //   list: ['我是标题', '正文ddd'],
  //   datasetId: 0
  // }
  // setTimeout(() => {
  //   $data.studyInfo[value].input = ''
  //   $data.studyInfo[value].loading = false
  //   message.error('链接识别失败，请更换链接试试吧')
  //   // 链接解析成功，显示保存知识库的弹窗
  //   saveKonwledgeDialog.value = {
  //     show: true,
  //     list: [1, 2, 3, 4, 5]
  //   }
  // }, 1000)
}, 700)

// 显示预览知识库弹窗
const previewKonwledgeDialog = ref({
  show: false
})
const showPreviewKonwledgeFun = throttle(() => {
  previewKonwledgeDialog.value = {
    show: true,
    datasetId: studyDatasetId.value
  }
}, 700)

// 定制企业智能体
const customizedFun = throttle(() => {
  ElMessageBox.confirm('如需定制品牌专属智能体，请联系对应顾问沟通定制化细节', '定制智能体', {
    confirmButtonText: '确认',
    showCancelButton: false,
    type: '',
    customClass: 'drawer_systemBox3 hide_footer_line'
  }).then(() => {})
}, 500)
</script>
<style lang="scss" scoped>
.page {
  width: 100%;
  min-height: 100%;
  padding-bottom: 16px;
}
.page_banner {
  width: 100%;
  height: 80px;
  background: #e2eeff;
  border-radius: 4px;
  margin-bottom: 16px;
  .one_banner {
    width: 100%;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
      display: flex;
      border-radius: 8px;
    }
  }
}
:deep(.banner_swiper .el-carousel__indicator .el-carousel__button) {
  width: 6px;
  height: 6px;
  border-radius: 100%;
  display: none;
}
.page_container {
  padding: 20px 24px;
  min-height: 100%;
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
}
:deep(.el-collapse-item__content) {
  padding: 0 !important;
}

:deep(.el-collapse-item__arrow) {
  display: none !important;
}
:deep(.el-collapse-item__header) {
  border: none !important;
  &.is-active {
    border: none !important;
  }
}
:deep(.el-collapse) {
  border: none !important;
  --el-collapse-header-height: 1;
}
:deep(.el-collapse + .el-collapse) {
  margin-top: 20px;
}
:deep(.el-collapse-item__wrap) {
  border: none !important;
}
.collapse_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  line-height: 22px;
  span {
    margin-left: 6px;
  }
  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: flex;
  }
  .expand {
    transition: all 0.5s;
    transform: rotate(-90deg);
  }
  .put {
    transition: all 0.5s;
    transform: rotate(0);
  }
}
.collapse_container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: wrap;
  .one_box {
    margin: 16px 16px 0 0;
    width: 420px;
    min-height: 152px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #ebedf0;
    padding: 16px 20px;
    .box_title {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
      img {
        width: 28px;
        height: 28px;
        object-fit: contain;
        display: flex;
        margin-right: 8px;
      }
    }
    .box_tip {
      margin-top: 12px;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px;
      min-height: 60px;
    }
    .box_tabs {
      margin-top: 16px;
      :deep(.el-tabs__item) {
        padding: 0 24px 6px 0 !important;
        &:last-child {
          padding-right: 0 !important;
        }
      }
      :deep(.el-tabs__header) {
        margin: 0 !important;
      }
      .tab_pane_box {
        max-height: 150px;
        overflow-y: auto;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_tab_pane {
          margin: 12px 12px 0 0;
        }
        .file_tab_pane {
          padding-left: 6px;
          cursor: pointer;
          position: relative;
          width: 118px;
          height: 52px;
          background: #fafafa;
          border-radius: 4px;
          border: 1px solid #fafafa;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .file_name {
            width: 64px;
            font-weight: 400;
            font-size: 12px;
            color: #606266;
            line-height: 18px;
            margin-left: 4px;
            @include mult_line(2);
          }
          .file_del {
            opacity: 0;
            cursor: pointer;
            width: 20px;
            height: 20px;
            display: flex;
            position: absolute;
            right: -8px;
            top: -8px;
          }
        }
        .file_tab_pane:hover {
          .file_del {
            opacity: 1;
          }
        }
        .upload_tab_pane {
          width: 52px;
          height: 52px;
          background: #fafafa;
          border-radius: 2px;
          border: 1px dashed #dcdee0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          img {
            width: 20px;
            height: 20px;
            display: flex;
          }
        }
      }
    }
    .box_analysis {
      margin-top: 16px;
      .analysis_input {
        width: 100%;
      }
      .analysis_btn {
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
    }
  }
}
:deep(.el-tabs__content) {
  width: calc(100% + 22px);
}
</style>
