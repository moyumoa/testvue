<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="xm rule_setting_dialog hide_footer_line show_header_line"
    destroy-on-close
    v-model="show"
    width="836px"
    :append-to-body="origin == 'templateEdit'"
  >
    <template #title>
      <div class="dialog_title">
        {{ dialogTitle }}
        <el-tooltip v-if="subtitle" :content="subtitle" placement="right">
          <img
            class="item_value_tips"
            src="https://tagvv-1256030678.file.myqcloud.com/20240420tl3rw.png"
            alt
          />
        </el-tooltip>
        <div class="dialog_title_tip" v-if="showSubTip">
          建议字数：
          <span>
            {{ lengthMin }}
            ~
            {{ lengthMax }}
          </span>
        </div>
      </div>
    </template>
    <div class="select_material_content" v-loading="tableForm.loading">
      <div class="select_m_l">
        <chooseFileTree
          :origin="fileOrigin ? fileOrigin : 'material'"
          :fileType="fileType ? fileType : null"
          @updateId="fileSelected"
          v-if="showChooseFileTree"
        />
      </div>
      <div class="select_m_r">
        <xm_search
          :searchComponents="
            isNotEmpty(infoSearchComponents) ? infoSearchComponents : searchComponents
          "
          :useOwnReset="true"
          @getData="querySearch"
          @reset="resetSearch"
        ></xm_search>
        <!-- <div class="btn_warp" v-if="!pageOpenLoading">
          <div class="btn_l">
            过滤已使用原料
            <el-switch
              v-model="tableForm.filterUsed"
              style="margin-left: 12px"
              @change="switchChange"
            />
          </div>
        </div> -->
        <div class="content_list">
          <div
            ref="contentRef"
            v-if="tableForm.materialList && tableForm.materialList.length > 0"
            class="mater_warp"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="getListNext"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.materialList.length >= tableForm.page.total"
          >
            <materialListDom
              :showMarkICON="props.showMarkICON"
              :hideName="hideName"
              :rulesOrigin="materialType"
              :list="tableForm.materialList"
              @updateSelect="updateSelect"
            />
            <!-- 加载更多 -->
            <div
              class="loading_library"
              v-if="tableForm.materialList && tableForm.materialList.length > 0"
            >
              <img
                src="/public/loading.gif"
                v-if="tableForm.loading && tableForm.page.pageNo > 1"
                alt=""
              />
              {{
                tableForm.loading
                  ? tableForm.page.pageNo === 1
                    ? ''
                    : '加载中...'
                  : tableForm.materialList.length >= tableForm.page.total
                  ? '已经到底了~'
                  : '上拉加载更多~'
              }}
            </div>
          </div>
          <div v-else class="xm_noneData" style="height: 100%">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
        <div class="footer_btn">
          <div class="f_info_box">
            <div class="btn_r" v-if="props.multiple">
              <!-- <div
                class="xm_check_box_round select_all_text"
                @click="beforeSelect(!hasCondition(listParams) ? false : true)"
              >
                原始的
              </div> -->
              <!-- 没有筛选条件下的全选/取消全选/清空已选  -->
              <div class="xm_check_box_round select_all_text" @click="selectAllFun">
                <!-- 未选 -->
                <div
                  :class="[
                    'check_box',
                    checkStatus === 1
                      ? 'check_box_half_choose'
                      : checkStatus === 2
                      ? 'check_box_active'
                      : ''
                  ]"
                ></div>
                <!-- 全选 -->
                <!-- <div class="check_box check_box_active" v-else-if="selectData.checkAll"></div> -->
                <!-- 半选 -->
                <!-- <div class="check_box check_box_half_choose" v-else></div> -->

                <span class="select_all_text">全选本页</span>
                <span
                  class="select_all_text"
                  style="color: #364fcd; cursor: pointer"
                  @click.stop="clearSelect"
                >
                  清除
                </span>
              </div>

              <span>
                已选择
                <span style="color: #364fcd">{{ selectData.chooseIds.length || 0 }}</span>
                个
              </span>
            </div>
          </div>
          <div class="f_btn_warp">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { getQuery } from '@/utils/get_query.js'
import { ELEMENT_TYPE } from '@/utils/dictionary/sumvideo.js'
import { list } from '@/api/content_center/material_library.js'
// import { throttle } from '@/utils/tools.js'
import { importMaterialBatch, listImportMaterial } from '@/api/sumvideo/create_by_template.js'
import {
  importMaterialByScript,
  listImportMaterialByScript,
  saveScriptConfig
} from '@/api/sumvideo/create_by_script.js'
import { savePipelineConfig } from '@/api/sumvideo/create_by_foolish.js'
import materialListDom from './material_list.vue'
import chooseFileTree from '../files/choose_file_tree.vue'
import { isNotEmpty } from '@/utils/tools'
const props = defineProps({
  info: {
    show: false,
    showBackSelectMaterialIds: {
      type: Array,
      default: () => {
        return []
      }
    }, // 回显的，选中的原料id
    showBackSelectMaterialList: {
      type: Array,
      default: () => {
        return []
      }
    } // 回显的，选中的原料列表
  },
  dialogTitle: String,
  subtitle: {
    type: String,
    default: null // 二级标题
  },
  showSubTip: {
    type: Boolean,
    default: false
  }, // 文本类型时是否显示字数提示
  materialType: Number || String, // 显示时使用的原料类型 1显示视频和图片 2显示图片 3显示音频 4显示文本
  materialTypeList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 获取列表时原料类型入参
  materialSources: {
    type: Array,
    default: () => {
      return []
    }
  },
  infoSearchComponents: {
    type: Array,
    default: () => {
      return []
    }
  }, // 筛选条件
  origin: {
    type: String,
    default: 'scriptStep'
  },
  fileType: Number, // 文件夹类型 3原料库 4实拍库 5场景库
  fileOrigin: {
    type: String,
    default: ''
  }, // 文件夹来源 默认都是原料 material  实拍图 productShoot 场景图 productScene 媒体资源库 mediaResource
  pipelineId: {
    type: Number,
    default: null // 流水线id
  },
  scriptId: {
    type: Number,
    default: null // 模版id
  },

  scriptReplaceId: {
    type: Number,
    default: null // 替换项id/分镜id
  },
  lengthMin: {
    type: Number,
    default: null // 文本的最小长度
  },
  lengthMax: {
    type: Number,
    default: null // 文本的最大长度
  },
  resourceType: {
    type: Number,
    default: 0 // 资源类别 0原料库资源 3音色 6普通文本转音频，默认0，仅音频分镜导入文本原料时传6
  },
  isBgm: {
    type: Boolean,
    default: false // 是否是导入BGM，如果是就不能调接口，直接将信息返回
  },
  isAllInfo: {
    type: Boolean,
    default: false // 是否导入所有信息，不止ID
  },
  bgmOtherParams: {
    type: Object,
    default: () => {
      return {
        enableBgm: false, // 是否打开
        volume: 20, // 音量-百分比 20% 传 20
        fadeInTime: 1, // 选择 的淡入时长
        fadeOutTime: 1 // 淡出时长
      }
    } // 导入bgm信息时，其他的配置也需要一起入参
  },
  durationMin: {
    type: Number,
    default: null // 视频的最小长度
  },
  durationMax: {
    type: Number,
    default: null // 视频的最大长度
  },
  replaceModel: Number || String, // 长原料的处理方式 目前只对视频/BGM（小于2s 非BGM）进行校验
  scriptStepMax: Number || String, // 剧本式生成的最大预估时长
  scriptStepMin: Number || String, // 剧本式生成的最小预估时长
  hideName: Boolean, // 是否隐藏文件名
  showMarkICON: Boolean, // 是否要显示左上角的标识图片
  extraParams: Object, // 额外的请求参数
  multiple: {
    type: Boolean,
    default: true
  } // 默认多选
})
const message = inject('$message')

const dialog = ref()
const show = toRef(props.info, 'show')
const {
  dialogTitle,
  subtitle,
  showSubTip,
  materialType,
  info,
  materialTypeList,
  materialSources,
  infoSearchComponents,
  origin,
  fileOrigin,
  fileType,
  pipelineId,
  scriptId,
  scriptReplaceId,
  lengthMin,
  lengthMax,
  resourceType,
  isBgm,
  isAllInfo,
  bgmOtherParams,
  durationMin,
  durationMax,
  replaceModel,
  scriptStepMax,
  scriptStepMin,
  hideName,
  extraParams
} = toRefs(props)
const emits = defineEmits(['close', 'updateSelectInfo'])
console.log('materialType', materialType.value)
const showChooseFileTree = ref(true) // 是否显示，主要是用于重置
const btnLoading = ref(false) // 确定按钮的loadin
const fileID = ref(0) // 选择的文件夹id
const listParams = ref({}) // 获取当前列表的参数
const contentRef = ref(null)
const pageOpenLoading = ref(true)

// 选择逻辑
const selectData = reactive({
  totalNum: 0,
  checkNum: 0, // 已选择数量
  chooseIds: [], // 页面加载出来的，已选中的原料列表，包含了任何条件下的选中
  chooseBgms: [], // 如果是导入bgm就用这个
  chooseInfos: [], // 选中的完整信息
  firstCheckAll: false, // 是否在无内容时，点击了全选，如果是，就是选中所有原料，任何筛选的结果都需要选中
  removeIdList: [], // 无内容全选择，需要排除的ids，只有无筛选内容，并且点击全选后，再点击单个原料的取消选择才将取消选择的原料id放在这里
  isIndeterminate: false, // 无筛选条件时，是否半选
  checkAll2: false, // 输入框有内容时是否全选

  checkAll: false, // 筛选条件为空的时候是否全选
  isIndeterminate2: false // 有筛选条件时，是否半选
})
// 已选择原料数

const searchComponents = ref(
  isNotEmpty(infoSearchComponents.value)
    ? infoSearchComponents.value
    : [
        {
          type: 'newLabelFilterV2',
          label: '原料标签',
          behavior: '选择',
          val: [], // 选择数据
          choseName: '标签',
          placeholder: '请输入标签关键词',
          filed: 'tags',
          addTagInfo: {
            type: 15,
            hideTitleSpan: false,
            id: null,
            index: [],
            source: null
          } // addTag的需要的相关数据，比如回显等，不会在入参内
        },
        {
          type: 'input',
          label: '原料名称',
          val: '',
          placeholder: '请输入原料名称',
          filed: 'name'
        }
      ]
)
const tableForm = reactive({
  loading: false,
  // filterUsed: true, // 是否过滤已使用原料
  materialList: [], // 原料列表
  page: {
    pageNo: 1,
    pageSize: 18,
    total: 0
  }
})

// 查询
function querySearch() {
  console.log('查询')
  tableForm.loading = true
  tableForm.page.pageNo = 1
  getList()
}
// 重置
function resetSearch() {
  console.log('重置，只重置xm_search')
  tableForm.loading = true
  tableForm.page.pageNo = 1
  tableForm.page.pageSize = 18
  getList()
}

// function switchChange() {
//   tableForm.page.pageSize = 18
// }

// 获取列表
function getList() {
  return new Promise((resolve, reject) => {
    if (tableForm.page.pageNo === 1) {
      contentRef.value?.scrollTo(0, 0)
    }
    const data = getQuery(searchComponents.value)
    console.log('ELEMENT_TYPE', ELEMENT_TYPE.getCN(materialType.value))
    console.log('info.value', info.value)
    let params = {
      sources: isNotEmpty(materialSources.value) ? materialSources.value : null,
      subSource: [1, 0],
      pageSize: tableForm.page.pageSize,
      pageNo: tableForm.page.pageNo,
      type: materialTypeList.value || [],
      tags: data.tags,
      name: data.name
    }
    if (origin.value === 'productScene') {
      params.pictureType = isNotEmpty(data.pictureType) ? data.pictureType : 0
      params.subSource = []
      params.isDelete = 0
      params.tagType = -1
    }
    if (origin.value === 'productShoot') {
      params.mannequinName = data.mannequinName
      params.productName = data.productName
      params.subSource = []
      params.isDelete = 0
      params.tagType = -1
      params = { ...params, ...extraParams.value }
    }
    // 过滤已使用：useTimesMax: 0
    // if (tableForm.filterUsed) {
    //   params.useTimesMax = 0
    // }
    // 文件夹
    params.folderIds = fileID.value && fileID.value !== '0' ? [fileID.value] : [0]

    // 获取文本原料列表，判断是否需要限制文本长度
    if (materialTypeList.value.includes(4)) {
      if (lengthMin.value) {
        params.lengthMin = lengthMin.value
      }
      if (lengthMax.value) {
        params.lengthMax = lengthMax.value
      }
    }
    if (origin.value === 'foolishStep') {
      params.queryDurationContainPhoto = true
      if (durationMin.value) {
        params.durationMin = durationMin.value
      }
      if (durationMax.value) {
        params.durationMax = durationMax.value
      }
    }
    // 模板生成、剧本生成过滤0.5倍原料
    if (
      origin.value === 'productStep' ||
      origin.value === 'scriptStep' ||
      origin.value === 'creativeScript'
    ) {
      if (durationMin.value) {
        params.durationMin = durationMin.value
      }
      if (durationMax.value) {
        params.durationMax = durationMax.value
      }
      if (durationMin.value || durationMax.value) {
        params.timeUnit = 'ms'
      }
    }
    if (origin.value === 'scriptStep') {
      params.queryDurationContainPhoto = true
    }
    listParams.value = params
    console.log('入参', params)

    // if (data) return
    list(params)
      .then(res => {
        console.log('获取列表返回', res)
        pageOpenLoading.value = false
        if (res.code === 0 && res.data) {
          const { records: list = [], total: resultTotal = 0 } = res.data
          const resultList = list.map(x => {
            let checked = false
            //  无输入内容时
            if (!hasCondition(listParams.value)) {
              if (selectData.firstCheckAll) {
                // 如果是全选，那就都加上
                checked = selectData.removeIdList.findIndex(xx => xx === x.id) === -1
                if (checked) {
                  // 选中 往chooseIds添加数据
                  if (!selectData.chooseIds.includes(x.id)) {
                    selectData.chooseIds.push(x.id)
                  }
                  if (isBgm.value) {
                    if (selectData.chooseBgms.findIndex(xx => xx.id === x.id) === -1) {
                      selectData.chooseBgms.push({ id: x.id, url: x.url })
                    }
                  }
                  if (isAllInfo.value) {
                    if (selectData.chooseInfos.findIndex(xx => xx.id === x.id) === -1) {
                      selectData.chooseInfos.push(x)
                    }
                  }
                }
              } else {
                // 非全选，那就看移除ID列表里是否存在该ID，存在就不选中
                if (isBgm.value) {
                  checked = selectData.chooseBgms.findIndex(xx => xx.id === x.id) > -1
                } else if (isAllInfo.value) {
                  checked = selectData.chooseInfos.findIndex(xx => xx.id === x.id) > -1
                } else {
                  checked = selectData.chooseIds.findIndex(xx => xx === x.id) > -1
                }
              }
            } else {
              if (selectData.firstCheckAll) {
                // 如果是全选，那就都加上
                checked = selectData.removeIdList.findIndex(xx => xx === x.id) === -1
              } else {
                // 非全选，那就看移除ID列表里是否存在该ID，存在就不选中
                if (isBgm.value) {
                  checked = selectData.chooseBgms.findIndex(xx => xx.id === x.id) > -1
                } else if (isAllInfo.value) {
                  checked = selectData.chooseInfos.findIndex(xx => xx.id === x.id) > -1
                } else {
                  checked = selectData.chooseIds.findIndex(xx => xx === x.id) > -1
                }
              }
            }
            return {
              ...x,
              checked: checked
            }
          })
          if (tableForm.page.pageNo === 1) {
            console.log('处理后数据', resultList)
            tableForm.materialList = resultList

            const llll = resultList.filter(x => x.checked)
            // 需要记录总数量 用于后续全选的时候显示总数
            if (!hasCondition(listParams.value)) {
              selectData.totalNum = resultTotal
              if (selectData.checkNum === resultTotal && llll && llll.length > 0) {
                selectData.isIndeterminate = false
                selectData.checkAll = true
              } else {
                selectData.checkAll = false
                selectData.isIndeterminate = llll && llll.length > 0
              }
            } else {
              // 根据列表的选中数据来显示到底半选还是不选
              selectData.isIndeterminate2 = llll && llll.length > 0
            }
          } else {
            tableForm.materialList = tableForm.materialList.concat(resultList)
          }
          tableForm.page.total = resultTotal
        }
        tableForm.loading = false
        resolve()
      })
      .catch(err => {
        pageOpenLoading.value = false
        tableForm.loading = false
        reject(err)
      })
  })
}

// 获取下一页
function getListNext() {
  tableForm.loading = true
  tableForm.page.pageNo++
  getList()
}

// 清空已选择
function clearSelect() {
  clearFun()
  batchRemoveFun(tableForm.materialList)
}

// 判断是否有筛选条件
function hasCondition(params) {
  return (params?.tags && params.tags.length > 0) || params?.name // || !tableForm.filterUsed
}
// 判断是否是有筛选条件下的全选
// const beforeSelect = throttle(function (isCondition) {
//   if (tableForm.materialList.length === 0) return
//   if (isCondition) {
//     console.log('有筛选条件的选择')
//     tableForm.page.pageSize = 1000
//     tableForm.loading = true
//     getList().then(() => {
//       batchAddFunHasCondition()
//     })
//   } else {
//     // 没有筛选条件下，全选或取消全选
//     selectChange()
//   }
// })
// 没有筛选条件下，全选或取消全选
// function selectChange() {
//   if (selectData.firstCheckAll) {
//     selectData.firstCheckAll = false
//     selectData.checkAll = false
//     selectData.isIndeterminate = false
//     selectData.checkNum = 0
//     batchRemoveFun(tableForm.materialList)
//   } else {
//     if (selectData.firstCheckAll) return
//     selectData.firstCheckAll = true
//     selectData.checkAll = true
//     selectData.isIndeterminate = false
//     selectData.checkNum = selectData.totalNum
//     batchAddFun(tableForm.materialList)
//   }
//   selectData.removeIdList = []
// }
// 无筛选条件下的清除全选 - 当前选中都要清除 - 无条件筛选状态为false
function batchRemoveFun(dataList, addNum) {
  let num = 0
  dataList.forEach(x => {
    if (x.checked) {
      x.checked = false
      num++
    }
  })
  const getId2 = dataList.map(item => item.id)
  const list2 = selectData.chooseIds.filter(id => !getId2.includes(id))
  selectData.chooseIds = list2
  if (isBgm.value) {
    const getBgms = dataList.map(item => {
      return { id: item.id, url: item.url }
    })
    const bgms = selectData.chooseBgms.filter(
      selectedBgm => !getBgms.find(bgm => bgm.id === selectedBgm.id)
    )
    selectData.chooseBgms = bgms
    console.log('批量移出选中的bgms，结果', bgms)
  }
  if (isAllInfo.value) {
    const bgms = selectData.chooseInfos.filter(
      selectedBgm => !dataList.find(bgm => bgm.id === selectedBgm.id)
    )
    selectData.chooseInfos = bgms
    console.log('批量移出选中的信息，结果', bgms)
  }
  if (addNum) {
    selectData.checkNum = selectData.checkNum - num
  }
}

// 全选 - 无筛选条件 - 当前列表全部选中 - 增加无筛选条件全选状态为true，在分页获取列表时也要选中
// function batchAddFun(dataList, addNum) {
//   console.log('点击全选')
//   const list = JSON.parse(JSON.stringify(selectData.chooseIds))
//   const bgms = JSON.parse(JSON.stringify(selectData.chooseBgms))
//   let num = 0
//   dataList.forEach(x => {
//     x.checked = true
//     const ii = selectData.chooseIds.findIndex(y => y === x.id)
//     if (ii === -1) {
//       num++
//       list.push(x.id)
//       bgms.push({ id: x.id, url: x.url })
//     }
//   })
//   if (addNum) {
//     selectData.checkNum = selectData.checkNum + num
//   }
//   selectData.chooseIds = list
//   if (isBgm.value) selectData.chooseBgms = bgms
// }
// 全选 - 有筛选条件 - 选中当前列表
// function batchAddFunHasCondition() {
//   console.log('有输入框内容时的全选', selectData.checkAll2)
//   const chooseList = tableForm.materialList.filter(x => x.checked)
//   console.log('xxx', !(chooseList && chooseList.length === tableForm.materialList.length))
//   if (!(chooseList && chooseList.length === tableForm.materialList.length)) {
//     selectData.isIndeterminate2 = true
//     // 如果初次全选了，那就在移除Id列表里删掉当页的id们
//     if (selectData.firstCheckAll) {
//       tableForm.materialList.forEach(x => {
//         const iiii = selectData.removeIdList.findIndex(y => y === x.id)
//         if (iiii > -1) {
//           x.checked = true
//           selectData.removeIdList.splice(iiii, 1)
//           selectData.checkNum++
//         }
//       })
//       if (selectData.removeIdList.length === 0) {
//         selectData.checkAll = true
//       } else {
//         selectData.checkAll = false
//       }
//     } else {
//       batchAddFun(tableForm.materialList, true)
//     }
//     // 根据名称搜索后，点击全选 如果还有未加载的数据就 toast一个“本次成功勾选2000条，滑动加载并选择更多”
//     if (tableForm.materialList.length < tableForm.page.total) {
//       message.warning(`本次成功勾选${tableForm.materialList.length}条，滑动加载并选择更多`)
//     }
//   } else {
//     selectData.isIndeterminate2 = false
//     console.log(selectData.removeIdList)
//     // 如果初次全选了，那就在移除Id列表里添加当页的id们
//     if (selectData.firstCheckAll) {
//       tableForm.materialList.forEach(x => {
//         const iiii = selectData.removeIdList.findIndex(y => y === x.id)
//         if (iiii === -1) {
//           x.checked = false
//           selectData.removeIdList.push(x.id)
//           selectData.checkNum--
//           selectData.checkAll = false
//         }
//       })
//     } else {
//       batchRemoveFun(tableForm.materialList, true)
//       selectData.checkAll = false
//     }
//   }
// }
// 单选
function updateOnlyOneSelect(item) {
  console.log('单选', item, tableForm.materialList)
  tableForm.materialList.forEach(x => {
    if (x.id === item.id) {
      x.checked = !item.checked
    } else {
      x.checked = false
    }
  })

  if (item.checked) {
    selectData.chooseIds = [item.id]
    if (isBgm.value) selectData.chooseBgms = [{ id: item.id, url: item.url }]
    if (isAllInfo.value) selectData.chooseInfos = [item]
  } else {
    selectData.chooseIds = []
    if (isBgm.value) selectData.chooseBgms = []
    if (isAllInfo.value) selectData.chooseInfos = []
  }
}
// 选择/取消选择
function updateSelect(item) {
  if (!props.multiple) {
    updateOnlyOneSelect(item)
    return
  }
  item.checked = !item.checked
  // console.log('单个多选框', item, selectData.chooseIds)
  // 新增选择
  if (item.checked) {
    // 选中 往chooseIds添加数据
    selectData.chooseIds.push(item.id)
    if (isBgm.value) selectData.chooseBgms.push({ id: item.id, url: item.url })
    if (isAllInfo.value) selectData.chooseInfos.push(item)
    const iii = selectData.removeIdList.findIndex(iiii => iiii === item.id)
    if (iii > -1) {
      selectData.removeIdList.splice(iii, 1)
    }
    selectData.checkNum++
    if (hasCondition(listParams.value)) {
      console.log('有内容时')
      selectData.isIndeterminate2 = true
      console.log('selectData.firstCheckAll', selectData.firstCheckAll)
      console.log('selectData.removeIdList', selectData.removeIdList)

      if (selectData.firstCheckAll && selectData.removeIdList.length === 0) {
        selectData.checkAll = true
      }
    } else {
      console.log('单个多选框')
      if (selectData.checkNum === selectData.totalNum && selectData.removeIdList.length === 0) {
        selectData.isIndeterminate = false
        selectData.checkAll = true

        selectData.firstCheckAll = true
      } else {
        selectData.isIndeterminate = true
        selectData.checkAll = false
      }
    }
  } else {
    // 取消选中 在chooseIds删除数据
    const index = selectData.chooseIds.findIndex(y => y === item.id)
    console.log('删除的ids', index)
    if (index > -1) {
      selectData.chooseIds.splice(index, 1)
    }
    if (isBgm.value) {
      const indexBgm = selectData.chooseBgms.findIndex(x => x.id === item.id)
      if (indexBgm > -1) {
        selectData.chooseBgms.splice(index, 1)
      }
    }
    if (isAllInfo.value) {
      const indexBgm = selectData.chooseInfos.findIndex(x => x.id === item.id)
      if (indexBgm > -1) {
        selectData.chooseInfos.splice(index, 1)
      }
    }
    selectData.checkNum--
    // 有输入内容
    if (hasCondition(listParams.value)) {
      console.log(
        '有输入内容',
        !tableForm.materialList.filter(xxx => xxx.checked).length,
        selectData.firstCheckAll
      )

      if (!tableForm.materialList.filter(xxx => xxx.checked).length) {
        selectData.isIndeterminate2 = false
      }
      if (tableForm.materialList.filter(xxx => xxx.checked).length)
        if (selectData.firstCheckAll) {
          selectData.removeIdList.push(item.id)
          selectData.checkAll = false
        }
    } else {
      // 无输入内容
      selectData.checkAll = false
      if (isBgm.value) {
        selectData.isIndeterminate = selectData.chooseBgms.length > 0
      } else if (isAllInfo.value) {
        selectData.isIndeterminate = selectData.chooseInfos.length > 0
      } else {
        selectData.isIndeterminate = selectData.chooseIds.length > 0
      }
      if (selectData.firstCheckAll) {
        selectData.removeIdList.push(item.id)
      }

      // 如果searchList的未勾选数量和总数一致，那就把初次全选的标志清空
      const lll = tableForm.materialList.filter(x => !x.checked)
      if (lll.length === selectData.totalNum) {
        clearFun()
      }
    }
    // 如果删除的数量和列表总数一致，就清空所有数据
    // if (
    //   selectData.removeIdList.length === tableForm.page.value &&
    //   selectData.removeIdList.length > 0
    // )
    if (
      selectData.removeIdList.length === selectData.totalNum &&
      selectData.removeIdList.length > 0
    ) {
      clearFun()
    }
  }
}
// watch(
//   () => selectData.chooseIds,
//   val => {
//     checkStatus.value = getNewStatus()
//   },
//   {
//     deep: true
//   }
// )
// watch(
//   () => tableForm.materialList,
//   val => {
//     checkStatus.value = getNewStatus()
//   },
//   {
//     deep: true
//   }
// )
// 返回全选本页的状态 0 未选 1 半选 2全选
const checkStatus = computed(() => {
  if (
    selectData.chooseIds &&
    selectData.chooseIds.length > 0 &&
    tableForm.materialList &&
    tableForm.materialList.length > 0
  ) {
    const ids = tableForm.materialList.map(x => x.id)
    const num = countCommonElements(selectData.chooseIds, ids)
    // console.log('checkStatus-num', num, selectData.chooseIds, ids, tableForm.materialList)
    return num === tableForm.materialList.length ? 2 : 1
  } else {
    return 0
  }
})
// 比较两个数组，获取重复的数据长度
function countCommonElements(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item)).length
}
// 比较两个数组，将重复的数据删除
function compareAndRemoveDuplicates(arr1, arr2) {
  const combined = [...new Set([...arr1, ...arr2])] // 合并两个数组并去除重复项
  const filtered = combined.filter(item => !arr1.includes(item) || !arr2.includes(item)) // 过滤掉在两个数组中都出现的项
  return filtered
}
// 全选当前数据
function selectAllFun() {
  // 判断当前是否有数据 没有就return
  if (tableForm.materialList.length === 0) return
  // 判断当前是否有未选择的数据 有就是把那些未选择都改成选择 否则 就是取消当前页面的所有数据
  const unCheckList = tableForm.materialList.filter(x => !x.checked)
  if (unCheckList && unCheckList.length > 0) {
    // 把未选中的都改成选中状态 并且把ID添加到chooseIds里
    const ids = []
    tableForm.materialList.forEach(x => {
      if (!x.checked) {
        x.checked = true
        if (isBgm.value) {
          selectData.chooseBgms.push({ id: x.id, url: x.url })
        }
        if (isAllInfo.value) {
          selectData.chooseInfos.push(x)
        }
        ids.push(x.id)
      }
    })
    selectData.chooseIds = selectData.chooseIds.concat(ids)
  } else {
    const ids2 = []
    tableForm.materialList.forEach(x => {
      x.checked = false
      ids2.push(x.id)
    })
    selectData.chooseIds = compareAndRemoveDuplicates(selectData.chooseIds, ids2)
    if (isBgm.value) {
      const ids3 = selectData.chooseBgms.map(x => x.id)
      selectData.chooseBgms = compareAndRemoveDuplicates(ids3, ids2)
    }
    if (isAllInfo.value) {
      const ids3 = selectData.chooseInfos.map(x => x.id)
      selectData.chooseInfos = compareAndRemoveDuplicates(ids3, ids2)
    }
  }
}
// 清空数据
function clearFun() {
  console.log('清空')
  selectData.firstCheckAll = false
  selectData.checkAll = false
  selectData.checkAll2 = false
  selectData.isIndeterminate = false
  selectData.isIndeterminate2 = false
  selectData.removeIdList = []
  selectData.checkNum = 0
  selectData.chooseIds = []
  selectData.chooseBgms = []
}

// 选择文件夹
function fileSelected(chooseId) {
  fileID.value = chooseId
  tableForm.loading = true
  tableForm.page.pageNo = 1
  getList()
}

// 取消
function closeDialog() {
  emits('close')
  dialog.value.handleClose()
}
function handleConfirm() {
  if (selectData.chooseIds.length === 0) {
    message.warning(
      origin.value === 'productScene'
        ? '请先选择场景图'
        : origin.value === 'productShoot'
        ? `请先选择实拍图`
        : `请先选择原料`
    )
    return
  }
  btnLoading.value = true
  // 如果是选择实拍图/创意剧本选择分镜视频 直接把ID传回去
  if (origin.value === 'mediaResource' || origin.value === 'creativeScript') {
    emits('updateSelectInfo', selectData.chooseInfos, dialog.value, btnLoading)
    return
  }
  // 如果是模板分镜详情或者一键成片过来的 直接把选中的原料ID列表返回，在分镜规则里会通过ID去调用原料列表接口获取对应的信息
  if (
    origin.value === 'productShoot' ||
    origin.value === 'productScene' ||
    origin.value === 'templateEdit' ||
    origin.value === 'foolishStep'
  ) {
    emits('updateSelectInfo', selectData.chooseIds, dialog.value, btnLoading)
    return
  }
  if (isBgm.value) {
    importBgmFn()
  } else {
    importFn()
  }
}

// 导入BGM
function importBgmFn() {
  const params = {
    pipelineId: pipelineId.value
  }
  const { enableBgm, volume, fadeInTime, fadeOutTime } = bgmOtherParams.value
  const bgmConfig = {
    enableBgm,
    volume,
    fadeInTime,
    fadeOutTime
    // queryParam:  listParams.value, // 获取当前列表的入参
    // bgms: [] // 选中的ids
    // excludeBgmIds: [] // 排除的ids
    // isSelectAll: false // 是否全选
  }
  // if (selectData.firstCheckAll) {
  //   console.log('全选')
  //   bgmConfig.isSelectAll = true
  //   bgmConfig.excludeBgmIds = selectData.removeIdList
  //   const paramsInit = {
  //     folderIds: [0],
  //     name: '',
  //     pageNo: 1,
  //     pageSize: 18,
  //     sources: null,
  //     subSource: [1, 0],
  //     tags: [],
  //     type: [3]
  //   }
  //   bgmConfig.queryParam = paramsInit
  // } else {
  bgmConfig.isSelectAll = false
  // 选择原料的ids selectData.chooseBgms
  const bgms = selectData.chooseBgms.map(x => {
    return {
      ...x,
      id: x.id.toString()
    }
  })
  bgmConfig.bgms = bgms
  // }

  params.bgmConfig = bgmConfig
  console.log('导入bgm的入参', params)

  const savePromise =
    origin.value === 'foolishStepBGM' ? savePipelineConfig(params) : saveScriptConfig(params)
  savePromise
    .then(res => {
      console.log('导入bgm返回res', res)
      if (res.code === 0) {
        getEmitsList(true)
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}

// 导入流水线分镜原料
function importFn() {
  console.log('listParams.value', listParams.value)
  const params = {
    pipelineId: pipelineId.value, // 流水线id
    scriptReplaceId: scriptReplaceId.value, // 分镜或替换项的id
    queryParam: listParams.value, // 获取当前列表的入参
    resourceType: resourceType.value // 资源类别 0原料库资源 3音色 6普通文本转音频，默认0，仅音频分镜导入文本原料时传6
  }
  // if (selectData.firstCheckAll) {
  //   console.log('全选')
  //   params.isSelectAll = true
  //   params.excludeResourceIds = selectData.removeIdList
  //   params.queryParam = {
  //     folderIds: [0],
  //     name: null,
  //     pageNo: 1,
  //     pageSize: 18,
  //     sources: null,
  //     subSource: [1, 0],
  //     tags: [],
  //     type: materialTypeList.value || []
  //   }
  // } else {
  params.isSelectAll = false
  // 选择原料的ids
  params.resourceIds = selectData.chooseIds
  // }
  // 模板式生成看看id
  if (origin.value === 'productStep') {
    console.log('scriptId', scriptId.value)
    params.scriptId = scriptId.value
  }
  // 获取文本原料列表，判断是否需要限制文本长度
  if (materialTypeList.value.includes(4)) {
    if (lengthMin.value) {
      params.lengthMin = lengthMin.value
    }
    if (lengthMax.value) {
      params.lengthMax = lengthMax.value
    }
  }
  // 增加长原料处理模式的校验
  if (
    isNotEmpty(replaceModel.value) &&
    (origin.value === 'productStep' || origin.value === 'scriptStep')
  ) {
    params.replaceModel = replaceModel.value
  }
  // 剧本式生成保存入参增加预估最大和最小时长
  if (origin.value === 'scriptStep') {
    params.maxDuration = scriptStepMax.value
    params.minDuration = scriptStepMin.value
  }

  console.log('入参', params)
  const query =
    origin.value === 'scriptStep' ? importMaterialByScript(params) : importMaterialBatch([params])
  console.log('query', query)
  query
    .then(res => {
      console.log('导入原料res', res)
      if (res.code === 0) {
        getEmitsList()
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}
// 获取分镜原料用于页面显示
function getEmitsList(getBgm = false) {
  const params = {
    orderSetting: '',
    pageNo: 1,
    pageSize: 20,
    searchCount: true,
    pipelineId: pipelineId.value,
    scriptReplaceId: scriptReplaceId.value
  }
  if (getBgm) {
    params.isBgm = true
  }
  if (origin.value === 'productStep') {
    console.log('scriptId', scriptId.value)
    params.scriptId = scriptId.value
  }

  const emitsInfo = {
    list: [],
    total: 0
  }
  const query =
    origin.value === 'scriptStep' || origin.value === 'foolishStepBGM'
      ? listImportMaterialByScript(params)
      : listImportMaterial(params)

  query
    .then(res => {
      console.log('获取当前分镜/替换项已导入原料返回', res)
      if (res.code === 0) {
        emitsInfo.list = res.data?.records || []
        emitsInfo.total = res.data?.total || 0
        console.log('获取分镜原料用于页面显示', emitsInfo)
        emits('updateSelectInfo', emitsInfo)
        dialog.value.handleClose()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
}

onMounted(() => {
  tableForm.loading = true
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_title {
  display: flex;
  align-items: center;
  .item_value_tips {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    display: flex;
    object-fit: contain;
  }
  .dialog_title_tip {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      margin: 0;
      font-weight: 600;
      color: #364fcd;
    }
  }
}
.select_material_content {
  display: flex;
  .tree_node {
    width: max-content;
    min-width: 100%;
  }
  :deep(.one_file) {
    width: max-content;
  }
  :deep(.one_left) {
    width: max-content !important;
    padding-right: 4px;
  }

  .select_m_l {
    width: 184px;
    height: 540px;
    padding: 16px 0 16px 12px;
    border-right: 1px solid #e3e4e6;
    :deep(.choose_file_tree_page) {
      width: 100%;
      height: 100%;
    }
    :deep(.el-tree-node) {
      max-width: max-content !important;
      min-width: 155px !important;
    }
    :deep(.content_box) {
      height: calc(100% - 44px);
      overflow-y: hidden;
      .content_content_box {
        max-height: 464px;
        width: max-content !important;
        min-width: 155px !important;
        padding-right: 0 !important;
      }
    }
  }
  .select_m_r {
    flex: 1;
    padding: 16px;
    position: relative;
    min-height: 96px;
    :deep(.xm_search) {
      padding: unset;
      .search_item {
        &:first-child {
          .item_content {
            min-width: 172px !important;
          }
        }
      }
    }
    .btn_warp {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: -48px;
      .btn_l {
        display: flex;
        align-items: center;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
      }
    }
    .content_list {
      height: calc(100% - 144px);
      max-height: 401px;
      // margin-top: 16px;
    }
    .footer_btn {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: calc(100% - 32px);
      .btn_r {
        display: flex;
        align-items: center;
        .select_all_warp {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .select_icon {
          width: 16px;
          height: 16px;
          min-width: 16px;
        }
        .select_all_text {
          :deep(.check_box) {
            margin-left: 0;
          }
          display: flex;
          margin-left: 8px;
          margin-right: 8px;
          cursor: pointer;
        }
        .select_all_text + .select_all_text {
          margin-right: 16px;
        }
        .btn_item {
          cursor: pointer;
        }
        .btn_clear {
          color: red;
        }
        .btn_all {
          color: #364fed;
        }
      }
    }
    .mater_warp {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      position: relative;
    }
    ::-webkit-scrollbar {
      width: 6px;
    }
  }
  .loading_library {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    font-size: 12px;
    color: #909399;
    img {
      height: 25px;
      margin-right: 4px;
    }
  }
}

// .radio_choose {
//   cursor: pointer;
//   width: 16px;
//   height: 16px;
//   border: 1px solid #364fcd;
//   border-radius: 100%;
//   background: #364fcd;
//   &::after {
//     width: 4px;
//     height: 4px;
//     border-radius: 100%;
//     background-color: var(--el-color-white);
//     content: '';
//     position: absolute;
//     left: 50%;
//     top: 50%;
//     transform: translate(-50%, -50%) scale(1);
//     transition: transform 0.15s ease-in;
//   }
// }
// .radio_unchooose {
//   cursor: pointer;
//   width: 16px;
//   height: 16px;
//   border: 1px solid #dcdfe6;
//   border-radius: 100%;
//   &:hover {
//     border-color: #364fcd;
//   }
// }
</style>
