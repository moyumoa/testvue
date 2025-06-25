<template>
  <el-dialog
    v-model="showDialog"
    title="Tips"
    :width="986"
    @closed="emits('update:showDialog', false)"
  >
    <template #title>
      <div class="dialog_title">
        <span class="title" style="font-size: 20px">企业模板</span>
      </div>
    </template>
    <div class="dialog_content">
      <xm_search :searchComponents="data.searchComponents" @getData="searchList"></xm_search>
      <div class="chooseAll_parent" v-if="showCheckAll" @click="checkChange">
        <div :class="{ chooseAll_box: true, chooseAll_icon: checkAll }">
          <el-icon v-if="checkAll == 2"><i-select /></el-icon>
          <el-icon v-if="checkAll == 1"><i-minus /></el-icon>
        </div>
        全选
      </div>
      <div
        class="template_table"
        v-loading="data.loading"
        :style="data.tableData && data.tableData.length > 0 ? '' : 'grid-template-columns: auto'"
      >
        <template v-if="data.tableData && data.tableData.length > 0">
          <el-tooltip
            v-for="(item, index) in data.tableData"
            class="box-item"
            effect="dark"
            :content="item.name"
            placement="right-start"
            :key="index"
          >
            <div class="template_item" @click="chooseTemplate(item)">
              <div
                class="template_cover"
                :style="{
                  'background-image': `url(${
                    item.thumbCoverUrl || item.coverUrl
                  }),linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%)`
                }"
              >
                <div class="digital_icon_left" v-if="item.tag == 2"></div>
                <!-- 创意模板是单选 -->
                <template v-if="props.type == '3'">
                  <img
                    v-if="item.id == data.choosedTemplate.id"
                    class="checkbox"
                    src="https://tagvv-1256030678.file.myqcloud.com/20220124y82in.png"
                  />
                  <img
                    v-else
                    class="checkbox"
                    src="https://tagvv-1256030678.file.myqcloud.com/20220124vl5yp.png"
                  />
                </template>
                <!-- 转发是多选 -->
                <template v-if="props.type == '4'">
                  <div :class="{ top_right: true, checked_right: item.checked }">
                    <el-icon><i-select /></el-icon>
                  </div>
                </template>
              </div>
              <div class="template_name">{{ item.name }}</div>
            </div>
          </el-tooltip>
        </template>
        <div v-else class="none_data">暂无数据</div>
      </div>
      <div class="xm_table_page">
        <el-pagination
          v-model:current-page="pageIndex"
          background
          layout="total,sizes, prev, pager, next , jumper"
          :total="data.page.total"
          :page-size="data.page.size"
          :page-sizes="[18]"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>
    <template #footer>
      <span class="dialog_footer">
        <div class="footer_left" v-if="type === '4'">
          已选{{ data.chooseTemplateList.length }}个创意模板
        </div>
        <div v-else class="footer_left"></div>
        <div class="footer_right">
          <el-button @click="emits('update:showDialog', false)">取消</el-button>
          <el-button type="primary" :loading="data.btnLoading" @click="confirm">确定</el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
import { getTemplateList, getTemplateCategoryList } from '@/api/market/sumvideo'
import { getQuery } from '@/utils/get_query.js'
import { ElMessageBox } from 'element-plus'
import { checkVideo } from '@/api/market/task'
const props = defineProps({
  showDialog: Boolean,
  type: String,
  videoTemplateList: Array,
  templateType: {
    type: String,
    default: 'video' // 模板类型 video视频模板 imgtext图文模板
  }
})

const { showDialog, type, templateType } = toRefs(props)
const emits = defineEmits(['update:showDialog', 'chooseTemplate'])

const message = inject('$message')
const checkAll = ref(0) // 是否全选当页 0不选 1半选 2全选
const showCheckAll = ref(false) // 是否显示全选按钮
const data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '模板名称',
      val: '',
      placeholder: '请输入模板名称',
      filed: 'name'
    },
    {
      hiddenItem: templateType.value === 'imgtext',
      type: 'select',
      label: '模板分类',
      val: '',
      defaultVal: '',
      placeholder: '请选择模板分类',
      filed: 'categoryId',
      selects: []
    },
    {
      hiddenItem: templateType.value !== 'imgtext',
      type: 'select',
      label: '模板分类',
      val: '',
      defaultVal: '',
      placeholder: '请选择模板分类',
      filed: 'creativeStruct',
      selects: [
        {
          label: '仅图片',
          value: 1
        },
        {
          label: '图片+文本',
          value: 2
        }
      ]
    },
    {
      type: 'dateRange',
      label: '模板创建时间',
      defaultVal: '',
      val: '',
      isDisEdit: true,
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    }
  ],
  loading: false,
  choosedTemplate: {},
  page: {
    index: 1,
    size: 18,
    total: 0
  },
  chooseTemplateList: [],
  btnLoading: false
})

const pageIndex = toRef(data.page, 'index')
function handleCurrentChange(val) {
  data.page.index = val
  getList()
}

function handleSizeChange(val) {
  data.page.index = 1
  data.page.size = val
  pageIndex.value = 1
  getList()
}

function searchList() {
  data.page.index = 1
  // 清空全选相关
  checkAll.value = 0
  data.chooseTemplateList = []
  data.tableData = (data.tableData || []).map(x => {
    x.checked = false
    return x
  })
  getList()
}

// 选择模板
function chooseTemplate(item) {
  if (type.value === '4') {
    // 转发是多选
    if (item.checked) {
      item.checked = false
      const chooseIndex = data.chooseTemplateList.map(x => x.id).indexOf(item.id)
      data.chooseTemplateList.splice(chooseIndex, 1)
    } else {
      if (data.chooseTemplateList.length >= 100) {
        return message.warning('最多选择100个创意模板')
      }
      item.checked = true
      data.chooseTemplateList.push(item)
    }
    changeCheckAll()
  } else {
    // 创意模板是单选
    data.choosedTemplate = item
  }
}

const clearCheck = function () {
  if (type.value === '4') {
    // 转发是多选
    data.chooseTemplateList = []
  } else {
    // 创意模板是单选
    data.choosedTemplate = {}
  }
}

// 分类列表
function getCategoryList() {
  if (templateType.value === 'imgtext') {
    return
  }
  getTemplateCategoryList().then(res => {
    data.searchComponents.forEach(item => {
      if (item.label === '模板分类') {
        let arr = []
        res.data.forEach(i => {
          if (i.childCategoryList) {
            arr = [...arr, ...i.childCategoryList]
          }
        })
        item.selects = arr.map(e => {
          return {
            label: e.categoryName,
            value: e.id
          }
        })
      }
    })
  })
}
// 回显选中
const echoChecked = (list, clearStatus = false) => {
  // 清空全选相关
  if (clearStatus) {
    data.tableData = (data.tableData || []).map(x => {
      x.checked = false
      return x
    })
  }
  // let chooseNum = 0
  data.chooseTemplateList.forEach(ele => {
    list.forEach(i => {
      if (i.id === ele.id) {
        i.checked = true
        // chooseNum++
      }
    })
  })
  // if (chooseNum === list.length) {
  //   checkAll.value = 2
  // } else if (chooseNum > 0) {
  //   checkAll.value = 1
  // }
  if (
    data.chooseTemplateList.length === 100 ||
    (data.page.total > 0 && data.page.total === data.chooseTemplateList.length)
  ) {
    checkAll.value = 2
  } else if (data.chooseTemplateList.length > 0) {
    checkAll.value = 1
  } else {
    checkAll.value = 0
  }
  return list
}
// 当页的选中状态修改
function changeCheckAll() {
  // let chooseNum = 0
  // data.chooseTemplateList.forEach(ele => {
  //   data.tableData.forEach(i => {
  //     if (i.id === ele.id) {
  //       chooseNum++
  //     }
  //   })
  // })
  // if (chooseNum === data.tableData.length) {
  //   checkAll.value = 2
  // } else if (chooseNum > 0) {
  //   checkAll.value = 1
  // } else {
  //   checkAll.value = 0
  // }
  if (
    data.chooseTemplateList.length === 100 ||
    (data.page.total > 0 && data.page.total === data.chooseTemplateList.length)
  ) {
    checkAll.value = 2
  } else if (data.chooseTemplateList.length > 0) {
    checkAll.value = 1
  } else {
    checkAll.value = 0
  }
}
function getList(showLoading = true) {
  checkAll.value = 0
  if (showLoading) {
    data.loading = true
  }
  const searchParams = getQuery(data.searchComponents, ['startCreateTime', 'endCreateTime'])
  if (type.value === '4') {
    searchParams.hasVideo = true // 过滤掉在内容库里没有关联视频的模板，只显示有视频库存的模板
  }
  if (templateType.value === 'imgtext') {
    searchParams.tag = 3
  } else {
    searchParams.tag = 1
  }

  console.log('searchParams', searchParams)
  getTemplateList({
    pageSize: data.page.size,
    pageNum: data.page.index,
    condition: {
      ...searchParams,
      categoryIds: searchParams.categoryId ? [searchParams.categoryId] : [],
      isDraft: 2,
      videoStatus: 2, // 不展示合成失败/正在合成的模板
      type: 2 // 只查询企业模板
    }
  })
    .then(res => {
      let list = res.data.records || []
      if (type.value === '4' && list && list.length > 0) {
        list = echoChecked(list)
      }

      data.tableData = list
      data.page.total = res.data.total
      data.loading = false
    })
    .catch(() => {
      data.loading = false
    })
}
const confirm = throttle(function () {
  if (type.value === '3') {
    if (!data.choosedTemplate || !data.choosedTemplate.id) {
      return message.warning('请选择模板')
    }
    emits('update:showDialog', false)
    emits('chooseTemplate', data.choosedTemplate, type.value)
  } else {
    if (data.chooseTemplateList && data.chooseTemplateList.length > 0) {
      data.btnLoading = true
      const ids = data.chooseTemplateList.map(x => x.id)
      // 调接口，看是不是都有视频，都有才关闭弹窗。
      checkVideo({
        creationTemplateIds: ids,
        ascByNamePinYin: 1
      })
        .then(res => {
          if (res.code === 0) {
            const resData =
              res.data && res.data.creativeResults && res.data.creativeResults.length > 0
                ? res.data.creativeResults
                : []

            if (resData.length > 0) {
              // 根据创意的关联视频数量判断是否可选择视频成功
              const noVideoId = []
              resData.forEach(x => {
                if (x.productTagVVCnt === '0') {
                  noVideoId.push(x.creativeId)
                }
              })
              if (noVideoId.length > 0) {
                console.log('noVideoId', noVideoId)
                const noVideoTitle = []
                noVideoId.forEach(x => {
                  data.chooseTemplateList.forEach(y => {
                    if (x === y.id + '') {
                      noVideoTitle.push(y.name)
                    }
                  })
                })
                console.log('noVideoTile', noVideoTitle)
                const messageTitle =
                  noVideoTitle.join('、') + '创意无可转发的视频，请前往sumvideo生产！'
                ElMessageBox.confirm(messageTitle, {
                  confirmButtonText: '确定',
                  type: 'warning',
                  showCancelButton: false,
                  customClass: 'iconTop'
                })
              } else {
                emits('chooseTemplate', data.chooseTemplateList, type.value)
                emits('update:showDialog', false)
              }
            } else {
              ElMessageBox.confirm('创意暂时无可转发的视频，请前往sumvideo生产', {
                confirmButtonText: '确定',
                type: 'warning',
                showCancelButton: false
              })
            }
          }
          data.btnLoading = false
        })
        .catch(() => {
          data.btnLoading = false
        })
    } else {
      return message.warning('请选择创意模板')
    }
  }
}, 700)

defineExpose({
  clearCheck
})

onMounted(() => {
  showCheckAll.value = props.type === '4'
  getCategoryList()
  console.log('mounted', props.videoTemplateList)
  // 如果是转发过来的，那就是多选，数据存到List ,否则就是对象。
  if (props.type === '4' && props.videoTemplateList && props.videoTemplateList.length > 0) {
    data.chooseTemplateList = JSON.parse(JSON.stringify(props.videoTemplateList))
    getList()
  } else {
    data.chooseTemplateList = []
    getList()
  }
})

// 当页全选
const checkChange = throttle(() => {
  console.log('全选', checkAll.value)

  if (data.tableData && data.tableData.length > 0) {
    if (checkAll.value !== 2) {
      // 全选
      // 如果当前选择个数已超过100个就提示最多100个
      if (data.chooseTemplateList.length >= 100) {
        return message.warning('最多选择100个创意模板')
      }
      // 否则就当页全选最多100个
      // let chooseNum = data.chooseTemplateList.length
      // data.tableData.forEach(x => {
      //   if (!x.checked) {
      //     if (chooseNum < 100) {
      //       chooseNum++
      //       x.checked = true
      //       data.chooseTemplateList.push(x)
      //     }
      //   }
      // })
      // 没有到100个，就获取前100条数据，并全部选中 2021-09-22
      data.chooseTemplateList = []
      let chooseNum = 0
      const searchParams = getQuery(data.searchComponents, ['startCreateTime', 'endCreateTime'])
      if (type.value === '4') {
        searchParams.hasVideo = true // 过滤掉在内容库里没有关联视频的模板，只显示有视频库存的模板
      }
      getTemplateList({
        pageSize: 100,
        pageNum: 1,
        condition: {
          ...searchParams,
          categoryIds: searchParams.categoryId ? [searchParams.categoryId] : [],
          isDraft: 2,
          videoStatus: 2 // 不展示合成失败/正在合成的模板
        }
      }).then(res => {
        if (res.code === 0) {
          const dataList = res.data.records || []
          dataList.forEach(x => {
            if (chooseNum < 100) {
              chooseNum++
              x.checked = true
              data.chooseTemplateList.push(x)
            }
          })
          // 刷新table
          data.tableData = echoChecked(data.tableData, true)
        }
      })
      checkAll.value = 2
    } else {
      // 取消全选
      // data.tableData.forEach(x => {
      //   x.checked = false
      //   const chooseIndex = data.chooseTemplateList.map(y => y.id).indexOf(x.id)
      //   if (chooseIndex > -1) {
      //     data.chooseTemplateList.splice(chooseIndex, 1)
      //   }
      // })
      // 全部取消
      data.chooseTemplateList = []
      data.tableData = echoChecked(data.tableData, true)
      checkAll.value = 0
    }
  }
}, 300)
</script>

<style lang="scss" scoped>
:deep .xm_search {
  padding: 0 0 8px 0;
}

.dialog_content {
  .template_table {
    display: grid;
    grid-template-columns: repeat(9, 90px);
    grid-gap: 16px;
    .template_item {
      .template_cover {
        cursor: pointer;
        position: relative;
        width: 90px;
        height: 160px;
        border-radius: 5px;
        background: linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        .checkbox {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 16px;
          height: 16px;
        }
        .top_right {
          position: absolute;
          bottom: 5px;
          right: 5px;
          cursor: pointer;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 2px;
          border: 1px solid #dbdee0;
          color: #fff;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
        .checked_right {
          background: #364fcd;
          border: 1px solid #364fcd;
          color: #fff;
        }
      }
      .template_name {
        line-height: 32px;
        @include mult_line(1);
      }
    }
  }
}

.xm_table_page {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.none_data {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.dialog_footer {
  width: calc(100% - 24px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}
.chooseAll_parent {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
  width: max-content;
}
.chooseAll_box {
  cursor: pointer;
  margin-right: 4px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 2px;
  border: 1px solid #dbdee0;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.chooseAll_icon {
  background: #364fcd;
  border: 1px solid #364fcd;
  color: #fff;
}
</style>
