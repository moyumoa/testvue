<template>
  <div v-loading="pageLoading" class="template_edit">
    <!-- 剧本详情 -->
    <div class="module_overview">
      <div class="module_overview_container">
        <div class="module_info">
          <div
            class="module_info_img"
            v-if="moduleInfo.coverUrl && ![2, 3, 4].includes(moduleInfo.subSource)"
          >
            <img :src="moduleInfo.coverUrl" alt="" class="module_info_img" />
            <div
              class="module_info_mask"
              v-if="moduleInfo.coverUrl"
              @click="
                previewFun(
                  moduleInfo.materialPath,
                  'video',
                  '查看视频',
                  moduleInfo.coverUrl || null
                )
              "
            >
              <img
                class="play_img"
                src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png"
                alt=""
              />
            </div>
          </div>

          <div class="module_info_warp">
            <div class="one_module_info_box">
              <div class="module_info_title" v-if="!showEditName">
                <div class="module_info_text">
                  {{ moduleInfo.name }}
                </div>

                <img
                  @click="switchEdit"
                  src="https://tagvv-1256030678.file.myqcloud.com/202303049vra6.png"
                  alt=""
                />
              </div>
              <div class="module_info_title" style="width: 280px" v-else>
                <el-input
                  ref="titleInputRef"
                  maxlength="20"
                  v-model="newName"
                  @blur="editNameBlur(item)"
                ></el-input>
              </div>
            </div>
            <div class="module_info_text">
              分类：{{
                moduleInfo.categoryNames && moduleInfo.categoryNames.length > 0
                  ? moduleInfo.categoryNames.join(',')
                  : '--'
              }}
            </div>
            <div class="module_info_text">
              时长：{{ parseInt((moduleInfo.duration || 0) / 1000 / 1000) + 's' }}
            </div>
            <div class="module_info_text">制作者：{{ moduleInfo.createUserName }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 剧本结构 -->
    <div class="module_structure" :style="showDel ? 'height:calc(100% - 136px - 16px - 0px)' : ''">
      <!-- 标题+分镜的总操作项 -->
      <div class="structure_top">
        <div class="top_left">
          剧本结构
          <!-- 自由创建的剧本才显示创作助手 -->
          <div class="left_tip" v-if="!showDel && moduleInfo.subSource == 4">
            如有需求，请向
            <span class="ai_btn" @click.stop="aiAdd">
              剧本创作助手
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/2024032892qic.png"
                alt=""
                class="ai_icon"
              />
            </span>
            提问
          </div>
        </div>
        <div class="top_right">
          <template v-if="!showDel">
            <el-tooltip content="分镜数量已达上限" placement="top" :disabled="list.length < 50">
              <el-button :disabled="list.length >= 50" type="primary" @click.stop="addListFun">
                添加分镜
              </el-button>
            </el-tooltip>
            <el-button @click.stop="showDelFun">删除分镜</el-button>
          </template>
          <!-- 点击删除分镜之后出现的按钮 -->
          <template v-if="showDel">
            <el-button @click.stop="cancelDelFun">取消</el-button>
            <el-button type="primary" @click.stop="handleDelFun">删除</el-button>
          </template>
        </div>
      </div>
      <!-- 表格 目前是手写表单 担心后续要跟剧本式生成一样 要做拖拽 表格没找到办法做拖拽 -->
      <div class="structure_table">
        <div class="table_th">
          <!-- 多选框 -->
          <div class="one_th check_width" v-if="showDel"></div>
          <div class="one_th name_width">分镜名称</div>
          <div class="one_th time_width">时长</div>
          <div class="one_th desc_width">画面描述</div>
          <div class="one_th aside_width">台词/旁白</div>
          <div class="one_th video_width">分镜视频</div>
        </div>
        <div class="table_tbody">
          <!-- <div
            ref="tableRef"
            class="tbody_scroll"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="loadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="list.length >= tableForm.page.total"
          > -->
          <div ref="tableRef" class="tbody_scroll">
            <template v-if="list && list.length > 0">
              <div
                :class="{ table_tr: true, table_tr_err: item.isErr }"
                v-for="(item, index) in list"
                :key="index"
              >
                <!-- 多选框 -->
                <div class="one_td check_width" v-if="showDel">
                  <el-checkbox v-model="item.checked"></el-checkbox>
                </div>
                <!-- 分镜名称 -->
                <div class="one_td name_width">
                  <div
                    class="name_notEdit"
                    v-if="!item.showEditName"
                    @click="editFun(item, 'clipName')"
                  >
                    <div :class="{ name_name: true, name_gray: !item.clipName }">
                      {{ item.clipName || '请输入分镜名称' }}
                    </div>
                    <img
                      v-if="!showDel"
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110y0vmm.png"
                      alt=""
                      class="edit_icon"
                    />
                  </div>
                  <el-input
                    v-else
                    @blur="inputBlurFun($event, index, 'clipName', item)"
                    maxlength="15"
                    resize="none"
                    v-model="item.editNameValue"
                    placeholder="请输入分镜名称"
                    show-word-limit
                    :ref="setItemRef($el, item.id, 'clipName')"
                  ></el-input>
                </div>
                <!-- 时长 -->
                <div class="one_td time_width">
                  <div v-if="item.clipAside">
                    {{ getUseTime(item.clipAside, 'min') }}-{{ getUseTime(item.clipAside, 'max') }}s
                  </div>
                  <div v-else>-</div>
                </div>
                <!-- 画面描述 -->
                <div class="one_td desc_width">
                  <div
                    class="name_notEdit"
                    v-if="!item.showEditDesc"
                    @click="editFun(item, 'clipDesc')"
                  >
                    <div :class="{ name_name: true, name_gray: !item.clipDesc }">
                      {{ item.clipDesc || '请输入画面描述' }}
                    </div>
                    <img
                      v-if="!showDel"
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110y0vmm.png"
                      alt=""
                      class="edit_icon"
                    />
                  </div>
                  <el-input
                    v-else
                    @blur="inputBlurFun($event, index, 'clipDesc', item)"
                    maxlength="100"
                    resize="none"
                    type="textarea"
                    :rows="3"
                    v-model="item.editDescValue"
                    placeholder="请输入画面描述"
                    show-word-limit
                    :ref="setItemRef($el, item.id, 'clipDesc')"
                  ></el-input>
                </div>
                <!-- 台词/旁白 -->
                <div class="one_td aside_width">
                  <div
                    class="name_notEdit"
                    v-if="!item.showEditAside"
                    @click="editFun(item, 'clipAside')"
                  >
                    <div :class="{ name_name: true, name_gray: !item.clipAside }">
                      {{ item.clipAside || '请输入台词/旁白' }}
                    </div>
                    <img
                      v-if="!showDel"
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110y0vmm.png"
                      alt=""
                      class="edit_icon"
                    />
                  </div>
                  <el-input
                    v-else
                    @blur="inputBlurFun($event, index, 'clipAside', item)"
                    maxlength="150"
                    resize="none"
                    type="textarea"
                    :rows="3"
                    v-model="item.editAsideValue"
                    placeholder="请输入台词/旁白"
                    show-word-limit
                    :ref="setItemRef($el, item.id, 'clipAside')"
                  ></el-input>
                </div>
                <!-- 分镜视频 -->
                <div class="one_td video_width">
                  <div
                    class="add_video"
                    @click.stop="addVideoFun(item, index)"
                    v-if="isEmpty(item.videoInfo)"
                  >
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110gygqy.png"
                      alt=""
                    />
                  </div>
                  <div class="has_video" v-else>
                    <img
                      class="video_cover"
                      v-if="item.videoInfo && item.videoInfo.coverUrl"
                      :src="item.videoInfo.coverUrl"
                      alt=""
                    />
                    <img
                      @click.stop="
                        previewFun(
                          item.videoInfo.url,
                          'video',
                          '查看视频',
                          item.videoInfo.coverUrl || null
                        )
                      "
                      class="video_play"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png"
                      alt=""
                    />
                    <img
                      v-if="!showDel"
                      @click.stop="item.videoInfo = null"
                      class="video_del"
                      src="https://tagvv-1256030678.file.myqcloud.com/202501103vpk6.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </template>
            <!-- 上拉加载更多 -->
            <!-- <div
              class="xm_pullUpToLoadMore"
              style="padding: 0 16px 16px 0px"
              v-if="list && list.length > 8"
            >
              <img
                src="/public/loading.gif"
                v-if="tableForm.loading && tableForm.page.index > 1"
                alt=""
              />
              {{
                tableForm.loading
                  ? tableForm.page.index === 1
                    ? ''
                    : '加载中...'
                  : list.length >= tableForm.page.total
                  ? list.length > 8
                    ? '已经到底了~'
                    : ''
                  : '上拉加载更多~'
              }}
            </div> -->
          </div>
        </div>
      </div>
      <!-- 按钮 -->
      <div class="structure_btn" v-if="!showDel">
        <el-button
          :loading="changeTemplteLoading"
          :disabled="saveLoading || toCreateByScriptLoading"
          @click.stop="changeTemplteFun"
        >
          转换为模板
        </el-button>
        <el-button
          :loading="toCreateByScriptLoading"
          :disabled="changeTemplteLoading || saveLoading"
          @click.stop="toCreateByScriptFun"
        >
          去剧本式生成
        </el-button>
        <el-button
          :loading="saveLoading"
          :disabled="changeTemplteLoading || toCreateByScriptLoading"
          type="primary"
          @click.stop="saveFun"
        >
          保存
        </el-button>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 选择视频分镜 -->
    <selectMaterial
      :multiple="false"
      v-if="selectMaterialInfo.show"
      :dialogTitle="'匹配原料'"
      :subtitle="'时长小于该分镜0.5倍的视频已过滤'"
      origin="creativeScript"
      :isAllInfo="true"
      :materialType="1"
      :materialTypeList="[1]"
      :info="selectMaterialInfo"
      :durationMin="selectMaterialInfo.durationMin"
      @updateSelectInfo="updateSelectInfo"
    />
    <!-- 脚本创作助手 -->
    <AIHelp v-if="showAiHelp" @submit="upDateAiHelp" @close="closeAiHelp" />
  </div>
</template>
<script setup>
import { sendHrefMessage } from '@/utils/OEA.js'

import { listCreativeScripts, saveCreativeScriptClip } from '@/api/sumvideo/script_creative.js'
import AIHelp from './components/ai_help.vue'
import selectMaterial from '@/views/sumvideo/components/material/select_material_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { details, modify } from '@/api/sumvideo/creative_mould.js'
import { throttle, isEmpty, isNotEmpty, getUserMenu, getUserParentMenu } from '@/utils/tools.js'

const message = inject('$message')
const router = useRouter()
const route = useRoute()
const pageLoading = ref(true) // 页面的Loaidng
const creativeId = ref(null) // 剧本ID
creativeId.value = route.query.id || null
const moduleInfo = ref({}) // 剧本详情-标题、分类等信息

// 分镜列表的查询条件
const list = ref([]) // 分镜列表
console.log('rrr', router)

// 获取剧本详情
function getDetail() {
  pageLoading.value = true
  details(route.query.id)
    .then(res => {
      if (res.code === 0) {
        moduleInfo.value = res.data || {} // res.data.subSource  剧本类型 1拆解 2选择产品 3输入产品 4自由创建
      }
      pageLoading.value = false
    })
    .catch(() => {
      pageLoading.value = false
    })
}

// 显示编辑名称 begin--
const showEditName = ref(false)
const newName = ref('')
const titleInputRef = ref()
const switchEdit = () => {
  showEditName.value = true
  newName.value = moduleInfo.value.name
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}
const editNameBlur = () => {
  // if (isEmpty([])) return
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  const value = newName.value.replace(reg, '')
  // 新输入为空不保存 值没有变化 不保存
  if (isEmpty(value) || value === moduleInfo.value.name) {
    showEditName.value = false
    return
  }
  modify({
    creativeId: route.query.id,
    name: value
  }).then(res => {
    if (res.code === 0) {
      showEditName.value = false
      moduleInfo.value.name = value
      console.warn(moduleInfo.value.name)
      message.success('修改成功')
      getDetail()
    }
  })
}
// 显示编辑名称 end--

// 获取分镜列表
function getStructureList() {
  // const listPromise = new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 0
  //     })
  //   }, 1000)
  // })
  const listPromise = listCreativeScripts({
    creativeId: route.query.id
  })

  listPromise
    .then(res => {
      if (res.code === 0) {
        /**
         * 拿到的list要map映射为前端对象
         * @type {[]|*|*[]}
         */
        let records = []
        if (res.data != null) {
          records = res.data.map(e => {
            return {
              id: e.id,
              clipName: e.clipName,
              clipDesc: e.clipDesc,
              clipAside: e.clipAside,
              videoInfo:
                e.videoCoverUrl && e.videoUrl
                  ? {
                      id: e.tagvvVideoId,
                      duration: e.videoDuration,
                      coverUrl: e.videoCoverUrl,
                      url: e.videoUrl
                    }
                  : {}
            }
          })
        }
        list.value = records || []
      } else {
        list.value = []
      }
      pageLoading.value = false
    })
    .catch(() => {
      list.value = []
      pageLoading.value = false
    })
}
// function loadFun() {
//   if (tableForm.loading) return
//   tableForm.loading = true
//   tableForm.page.index++
//   getStructureList()
// }

// 分镜内容修改 begin--
const nameRefs = ref([])
const descRefs = ref([])
const asideRefs = ref([])
// 获取输入框的ref，用于聚焦
const setItemRef = (el, id, type) => {
  return el => {
    if (el) {
      const existingItem =
        type === 'clipName'
          ? nameRefs.value.find(item => item.id === id)
          : type === 'clipDesc'
          ? descRefs.value.find(item => item.id === id)
          : type === 'clipAside'
          ? asideRefs.value.find(item => item.id === id)
          : ''
      if (!existingItem) {
        // 如果不存在，则添加新的项
        if (type === 'clipName') nameRefs.value.push({ id, ref: el })
        if (type === 'clipDesc') descRefs.value.push({ id, ref: el })
        if (type === 'clipAside') asideRefs.value.push({ id, ref: el })
      } else {
        // 如果存在，则更新现有项的引用
        existingItem.ref = el
      }
    }
  }
}
// 输入框失去焦点
function inputBlurFun(e, index, type, item) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  list.value[index][type] = e.target.value.replace(reg, '')
  item.showEditName = false
  item.showEditDesc = false
  item.showEditAside = false
  // 台词/旁白修改，需要校验选择的视频时长是否符合要求，不符合删除
  if (type === 'clipAside') {
    if (isNotEmpty(item.videoInfo)) {
      nextTick(() => {
        if (parseInt(item.videoInfo?.duration) < getUseTime(item.clipAside, 'max') * 0.5 * 1000) {
          item.videoInfo = {}
        }
      })
    }
  }
  nextTick(() => {
    validOneFun(index)
      .then(() => {})
      .catch(() => {})
  })
}
// 显示要修改的输入框 并定位
function editFun(item, type) {
  if (showDel.value) return
  switch (type) {
    case 'clipName':
      item.editNameValue = item.clipName
      item.showEditName = true
      nextTick(() => {
        const itemRef = nameRefs.value.find(itemRefsItem => {
          return itemRefsItem.id === item.id
        })
        itemRef.ref.focus()
      })
      break
    case 'clipDesc':
      item.editDescValue = item.clipDesc
      item.showEditDesc = true
      nextTick(() => {
        const itemRef = descRefs.value.find(itemRefsItem => {
          return itemRefsItem.id === item.id
        })
        itemRef.ref.focus()
      })
      break
    case 'clipAside':
      item.editAsideValue = item.clipAside
      item.showEditAside = true
      nextTick(() => {
        const itemRef = asideRefs.value.find(itemRefsItem => {
          return itemRefsItem.id === item.id
        })
        itemRef.ref.focus()
      })
      break
  }
}
const selectMaterialInfo = reactive({
  show: false,
  currentIndex: null, // 导入的哪个分镜的
  item: {} // 导入分镜
}) // 添加分镜的弹窗
// 添加分镜视频
const addVideoFun = throttle((item, index) => {
  if (showDel.value) return
  if (isEmpty(item.clipAside)) {
    message.warning('请先输入台词/旁白')
    return
  }
  console.log('添加', getUseTime(item.clipAside, 'max'))
  selectMaterialInfo.durationMin = getUseTime(item.clipAside, 'max') * 0.5 * 1000
  selectMaterialInfo.item = item
  selectMaterialInfo.currentIndex = index
  selectMaterialInfo.show = true
}, 500)
// 选择结果
function updateSelectInfo(info, dialog, btnLoading) {
  console.log('选择的结果', info)
  if (isNotEmpty(info)) {
    list.value[selectMaterialInfo.currentIndex].videoInfo = info[0]
    dialog.handleClose()
    btnLoading.value = false
    nextTick(() => {
      validOneFun(selectMaterialInfo.currentIndex)
        .then(() => {})
        .catch(() => {})
    })
  }
}
// 分镜内容修改 end--

// 添加分镜 begin--
const tableRef = ref()
const addListFun = throttle(() => {
  if (list.value.length >= 50) {
    return
  }
  list.value.push({
    id: null,
    videoInfo: {},
    clipName: '', // 分镜名称
    clipDesc: '', // 画面描述
    clipAside: '' // 台词/旁白
  })
  nextTick(() => {
    tableRef.value.scrollTo({ top: tableRef.value.scrollHeight + 100, behavior: 'smooth' })
  })
}, 500)

// 添加分镜 end--

// 删除分镜 begin--
const showDel = ref(false) // 是否显示删除分镜

// 显示删除入口
const showDelFun = throttle(() => {
  if (isEmpty(list.value)) {
    message.warning('请先添加分镜')
    return
  }
  list.value.forEach(x => {
    x.checked = false
  })
  showDel.value = true
}, 500)
// 取消删除入口
const cancelDelFun = throttle(() => {
  list.value.forEach(x => {
    x.checked = false
  })
  showDel.value = false
}, 500)
// 确认删除
const handleDelFun = throttle(() => {
  const checkList = []
  list.value.forEach((x, i) => {
    if (x.checked) {
      checkList.push(i)
    }
  })
  console.log('选中的列表', checkList)
  if (isEmpty(checkList)) {
    message.warning('请先选择分镜')
    return
  }
  console.log('x')
  list.value = list.value.filter((item, i) => !checkList.includes(i))
  message.success('删除成功')
  if (isEmpty(list.value)) {
    showDel.value = false
  }
}, 500)
// 删除分镜 end--

// 获取台词的最小/最大时长
function getUseTime(text, type) {
  let time = 0
  const textLen = text.length || 0
  if (type === 'min') {
    if (textLen > 0) {
      time = (textLen / 5.5).toFixed(1)
    } else {
      time = 0
    }
  }
  if (type === 'max') {
    if (textLen > 0) {
      time = (textLen / 4.2).toFixed(1)
    } else {
      time = 0
    }
  }
  return time || 0
}
// 单个校验
function validOneFun(index) {
  return new Promise((resolve, reject) => {
    // 如果有校验失败的标红提示，才进行单个校验
    if (list.value[index].isErr) {
      if (list.value[index].isErr === 'changeTemplate' && isEmpty(list.value[index].videoInfo)) {
        reject(new Error())
        return
      }
      if (
        isEmpty(list.value[index].clipName) ||
        isEmpty(list.value[index].clipDesc) ||
        isEmpty(list.value[index].clipAside)
      ) {
        reject(new Error())
        return
      }
      list.value[index].isErr = ''
      resolve()
    } else {
      list.value[index].isErr = ''
      resolve()
    }
  })
}
// 校验 validVideo 是否校验分镜视频--目前只有转换为模板才需要校验分镜视频
function validFun(validVideo = false, type) {
  return new Promise((resolve, reject) => {
    if (isEmpty(list.value)) {
      message.warning('请完善剧本')
      reject(new Error())
    }
    if (list.value.length > 50) {
      message.warning('分镜数量最多50个')
      reject(new Error())
    }
    let errMsg = ''
    let errByVideo = false
    for (let i = 0; i < list.value.length; i++) {
      console.log('xxxx', i, list.value[i])
      if (validVideo && isEmpty(list.value[i].videoInfo)) {
        errMsg = '每个分镜都需要有视频分镜才能保存为模板'
        errByVideo = true
        list.value[i].isErr = type
        break
      } else if (
        isEmpty(list.value[i].clipName) ||
        isEmpty(list.value[i].clipDesc) ||
        isEmpty(list.value[i].clipAside)
      ) {
        errMsg = '请完善剧本'
        list.value[i].isErr = type
        break
      } else {
        list.value[i].isErr = ''
      }
    }
    console.log('iserr', errMsg)
    if (errMsg) {
      if (errByVideo) {
        reject(new Error(errMsg))
      } else {
        message.warning(errMsg)
        reject(new Error())
      }
    } else {
      resolve()
    }
  })
}

// 转换为模板
const changeTemplteLoading = ref(false)
const changeTemplteFun = throttle(() => {
  validFun(true, 'changeTemplate')
    .then(() => {
      changeTemplteLoading.value = true
      // 接口调用，成功后，在提示里增加跳转操作

      saveCreativeScriptClip({
        creativeId: creativeId.value,
        transformType: 2, // 1 去剧本生成，2转换为模板  单独点保存此参数不用传
        clips: fontClips2ServerClips(),
        complete: true // 是否创建完成保存，去剧本生成、转换为模板也要传 true
      })
        .then(res => {
          if (res.code === 0) {
            const templateId = res.data.creativeId // 保存后的模板ID 用于跳转到模板详情页
            console.log('成功')
            if (router.options?.history?.state?.back === '/sumwhy_video/creative_script') {
              router.go(-1)
            } else {
              router.push('/sumwhy_video/creative_script')
            }
            ElMessage({
              type: 'success',
              dangerouslyUseHTMLString: true,
              message: `保存成功，<a style="color:#364fcd" href="${location.origin}/sumwhy_video/template_space/template_edit?id=${templateId}&origin=creative_mould">去查看模板</span>`
            })
          } else {
            message.error('保存失败')
          }
          changeTemplteLoading.value = false
        })
        .catch(() => {
          changeTemplteLoading.value = false
        })
    })
    .catch(err => {
      console.log('errIndex', err, err.message)
      if (err.message) {
        ElMessageBox.confirm(err.message, '保存为模板', {
          confirmButtonText: '确认',
          showCancelButton: false,
          type: '',
          customClass: ' drawer_systemBox3 hide_footer_line'
        })
          .then(() => {})
          .catch(() => {})
      }
    })
}, 500)

// 去剧本式生成
const toCreateByScriptLoading = ref(false)
const toCreateByScriptFun = throttle(() => {
  validFun(false, 'toCreateByScript')
    .then(() => {
      toCreateByScriptLoading.value = true
      saveCreativeScriptClip({
        creativeId: creativeId.value,
        transformType: 1, // 1 去剧本生成，2转换为模板  单独点保存此参数不用传
        clips: fontClips2ServerClips(),
        step: 1,
        complete: true
      })
        .then(res => {
          if (res.code === 0) {
            // 接口调用成功，打开剧本式生成的页面
            const pipelineId = res.data.pipelineId
            console.log('成功')
            // 跨菜单跳转 begin
            const menu = getUserMenu('sumvideo:create_video:create_by_script')
            console.log('成功', menu)
            const parentMenu = menu ? getUserParentMenu(menu.parentId) : null
            console.log('parentMenu', parentMenu, menu)
            if (menu && parentMenu) {
              sessionStorage.setItem('menuActive', menu?.scopeUrl)
              sessionStorage.setItem('module', parentMenu?.parentName || parentMenu?.scopeName)
              sendHrefMessage(
                location.origin + '/sumwhy_video/create_by_script?pipelineId=' + pipelineId
              )
            }
            // 跨菜单跳转 end
            // router.push({
            //   path: '/sumwhy_video/create_by_script',
            //   query: {
            //     pipelineId: pipelineId
            //   }
            // })
          } else {
            message.error('保存失败')
          }
          toCreateByScriptLoading.value = false
        })
        .catch(() => {
          toCreateByScriptLoading.value = false
        })
    })
    .catch(err => {
      console.log('errIndex', err, err.message)
      // message.warning(err.message)
    })
}, 500)

/**
 * 前端分镜对象转为后端对象
 * @returns {*}
 */
function fontClips2ServerClips() {
  let records = null
  records = list.value.map((e, index) => {
    return {
      id: e.id,
      tagvvVideoId: isNotEmpty(e.videoInfo) ? e.videoInfo.id : '',
      videoDuration: isNotEmpty(e.videoInfo) ? e.videoInfo.duration : '',
      order: index + 1,
      clipName: e.clipName,
      clipDesc: e.clipDesc,
      clipAside: e.clipAside,
      videoCoverUrl: isNotEmpty(e.videoInfo) ? e.videoInfo.coverUrl || '' : '',
      videoUrl: isNotEmpty(e.videoInfo) ? e.videoInfo.url || '' : ''
    }
  })
  return records
}
// 保存
const saveLoading = ref(false)
const saveFun = throttle(() => {
  validFun(false, 'save')
    .then(() => {
      saveLoading.value = true
      console.info('list', list.value)

      saveCreativeScriptClip({
        creativeId: creativeId.value,
        step: 1,
        clips: fontClips2ServerClips(),
        complete: true // 是否创建完成保存，去剧本生成、转换为模板也要传 true
      })
        .then(res => {
          if (res.code === 0) {
            message.success('保存成功')
            console.log('成功')
            if (router.options?.history?.state?.back === '/sumwhy_video/creative_script') {
              router.go(-1)
            } else {
              router.push('/sumwhy_video/creative_script')
            }
          } else {
            message.error('保存失败')
          }
          saveLoading.value = false
        })
        .catch(() => {
          saveLoading.value = false
        })
    })
    .catch(err => {
      console.log('errIndex', err, err.message)
      // message.warning(err.message)
    })
}, 500)

onMounted(() => {
  getDetail()
  getStructureList()
})
onUnmounted(() => {
  ElMessageBox.close(false)
})

// 预览 begin--
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
const previewFun = throttle((url, type, title, cover) => {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || ''
  }
}, 500)
// 预览 end--

// 剧本创作助手 begin--
// 显示ai助手
const showAiHelp = ref(false) // 是否显示ai助手
const aiAdd = throttle(() => {
  showAiHelp.value = true
}, 500)
// 关闭ai脚本弹窗
function closeAiHelp() {
  showAiHelp.value = false
}
// 应用AI脚本
function upDateAiHelp(val) {
  console.log('val', val)
  showAiHelp.value = false
  list.value = val.map(x => {
    return {
      id: null,
      clipAside: x.clipAside,
      clipDesc: x.clipDesc,
      clipName: x.clipName,
      videoInfo: {}
    }
  })
}
// 剧本创作助手 end--
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.template_edit {
  height: 100%;

  .module_overview {
    height: 136px;
    background: #ffffff;
    border-radius: 4px;
    margin-bottom: 16px;
    padding: 20px 24px;

    .module_overview_container {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      .module_info {
        display: flex;
        align-items: center;

        .module_info_img {
          margin-right: 12px;
          position: relative;
          width: 72px;
          height: 96px;
          background: #dcdee0;
          border-radius: 4px;
          cursor: pointer;
          object-fit: cover;

          .digital_icon {
            position: absolute;
            top: 0;
            left: 0;
            width: 45px;
            height: 45px;
          }
          .module_info_mask {
            opacity: 0;
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            width: 72px;
            height: 96px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
            .play_img {
              width: 30px;
              height: 30px;
              display: flex;
            }
          }
        }
        .module_info_img:hover {
          .module_info_mask {
            opacity: 1;
          }
        }

        .module_info_warp {
          font-size: 12px;
          color: #303133;
          line-height: 18px;

          .module_info_title {
            font-size: 14px;

            height: 28px;
            line-height: 28px;
            font-weight: 400;
            display: flex;
            align-items: center;

            img {
              width: 14px;
              height: 14px;
              margin-left: 8px;
              cursor: pointer;
            }
          }

          :deep(.el-input__inner) {
            padding: 0 12px;
            color: #323233;
            font-size: 14px;
            height: 28px;
            line-height: 28px;
            font-weight: 400;
            background: #f7f8fa;
            border-radius: 2px;
            border: 1px solid #dcdee0;
          }

          .module_info_text {
            font-weight: 400;
            max-width: 526px;
            @include mult_line(1);
          }
          .module_info_text + .module_info_text {
            margin-top: 4px;
          }
        }
      }
    }
  }
  .module_structure {
    margin-top: 16px;
    width: 100%;
    height: calc(100% - 136px - 16px - 56px);
    padding: 20px 24px 0;
    background: #ffffff;
    border-radius: 4px;
    .structure_top {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      .top_left {
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        line-height: 22px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .left_tip {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-left: 24px;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
          .ai_btn {
            margin: 0 8px;
            cursor: pointer;
            position: relative;
            width: 100px;
            height: 28px;
            background: rgba(248, 81, 81, 0.1);
            border-radius: 4px;
            text-align: center;
            font-weight: 400;
            font-size: 14px;
            color: #f85151;
            line-height: 28px;
            .ai_icon {
              width: 19px;
              height: 17px;
              object-fit: contain;
              display: flex;
              position: absolute;
              right: -8px;
              top: -8px;
            }
          }
        }
      }
      .top_right {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
}
.structure_table {
  width: 100%;
  height: calc(100% - 64px);
  border-radius: 2px;
  .check_width {
    width: 60px;
    flex-basis: 60px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .video_width {
    padding-right: 16px;
    width: 200px;
    flex-basis: 200px;
    text-align: right;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .add_video {
      cursor: pointer;
      width: 60px;
      height: 80px;
      background: #fafafa;
      border-radius: 2px;
      border: 1px dashed #dcdee0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
        display: flex;
      }
    }
    .has_video {
      position: relative;
      width: 60px;
      height: 80px;
      // background: #DCDEE0;
      border-radius: 2px;
      .video_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
        border-radius: 2px;
      }
      .video_play {
        cursor: pointer;
        opacity: 0;
        width: 28px;
        height: 28px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
      }
      .video_del {
        cursor: pointer;
        opacity: 0;
        width: 20px;
        height: 20px;
        position: absolute;
        right: -8px;
        top: -8px;
      }
    }
    .has_video:hover {
      .video_del,
      .video_play {
        opacity: 1;
      }
    }
  }
  .time_width {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-left: 16px;
    width: 120px;
    flex-basis: 120px;
  }
  .name_width,
  .desc_width,
  .aside_width {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-left: 16px;
    flex: 1;
    width: calc((100% - 60px - 200px - 120px) * 0.33);
    min-width: 180px;
    .name_notEdit {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .edit_icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
        display: flex;
        margin-left: 8px;
        cursor: pointer;
      }
      .name_name {
        max-width: calc(100% - 24px);
        word-break: break-all;
        white-space: pre-wrap;
        display: contents;
      }
    }
  }
  .table_th {
    background: #f7f8fa;
    box-shadow: 0px 1px 0px 0px #ebedf0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .one_th {
      height: 40px;
      font-weight: 600;
      font-size: 14px;
      color: #323233;
      line-height: 20px;
    }
  }
  .table_tbody {
    width: 100%;
    height: calc(100% - 40px);
    .tbody_scroll {
      width: 100%;
      max-height: calc(100% - 0px);
      overflow-y: auto;
      overflow-x: hidden;
      .table_tr {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        box-shadow: inset 0px -1px 0px 0px #ebedf0;
        padding: 10px 0;
        font-weight: 400;
        font-size: 14px;
        color: #323233;
        line-height: 20px;
        .check_width {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
        }
      }
      .table_tr_err {
        border: 1px solid red;
      }
      .table_tr_err + .table_tr_err {
        box-shadow: none;
        border-top: none;
      }
      .name_gray {
        color: #bfc4cd;
      }
    }
  }
}
.xm .el-button + .el-button {
  margin-left: 16px !important;
}

.structure_btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 56px;
  background: #ffffff;
  box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
