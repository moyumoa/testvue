<template>
  <el-dialog
    custom-class="info_dialog category_tag_dialog"
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="编辑分类"
    width="820px"
  >
    <div class="category_tag_content">
      <div class="content_left">
        <!-- 搜索分类的输入框 -->
        <div class="search_input">
          <el-input
            v-model.trim="$data.searchName"
            placeholder="搜索分类"
            @keydown.enter="searchFun"
            @input="searchInput"
            @blur="retEmit($event)"
          >
            <template #suffix>
              <el-icon class="el-input__icon" style="cursor: pointer" @click="searchFun">
                <i-search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="left_list" v-loading="$data.loading">
          <div class="none_list" v-if="!$data.loading && $data.showNone">暂无分类，请先添加</div>
          <div style="width: 100%" v-else>
            <template v-for="(item, index) in $data.categoryList">
              <div
                class="one_list"
                v-if="item.childCategoryList && item.childCategoryList.length > 0"
                :key="index"
              >
                <div class="one_list_title">{{ item.categoryName || '' }}</div>
                <div
                  class="one_list_child"
                  v-if="item.childCategoryList && item.childCategoryList.length > 0"
                >
                  <div
                    :class="{ one_child: true, choose_child: x.bind }"
                    v-for="(x, y) in item.childCategoryList"
                    :key="y"
                    @click="addFun(x, y, item, index)"
                  >
                    {{ x.categoryName || '' }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="content_right">
        <div class="right_top">
          <div class="top_left">
            已添加
            <span>{{ $data.bindList.length }}</span>
            个分类
          </div>
          <el-link type="primary" @click="clearFun">清空</el-link>
        </div>
        <div class="right_middle_box">
          <div class="right_middle">
            <div class="one_middle" v-for="(item, index) in $data.bindList" :key="index">
              {{ item.categoryName || '' }}
              <div class="close_icon" @click="delFun(item, index)">
                <el-icon><i-close-bold /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="right_bottom">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="$data.btnLoading" @click="saveFun">确定</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
// 绑定分类的弹窗
import { ElMessage } from 'element-plus'
import { templateArray } from '@/api/sumvideo/category.js'
import { updateBind } from '@/api/sumvideo/creative_mould.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  bindDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.bindDialog, 'show')
const $data = reactive({
  showNone: false, // 是否显示无数据
  loading: false, // 页面显示的loading
  btnLoading: false, // 按钮请求的loading
  searchName: '', // 搜索分类的输入框内容
  allCategoryList: [], // 所有的分类列表
  categoryList: [], // 左侧展示的
  bindList: [] // 绑定的列表 --右侧展示的
})
function getAllCategory() {
  templateArray({
    brandId: JSON.parse(localStorage.getItem('brandInfo')).brandId,
    categoryName: ''
  })
    .then(res => {
      if (res.code === 0) {
        const allList = res.data || []
        $data.allCategoryList = JSON.parse(JSON.stringify(allList))
        $data.categoryList = JSON.parse(JSON.stringify(allList))
        setNone(allList)
        if (props.bindDialog.categoryIdList && props.bindDialog.categoryIdList.length > 0) {
          setLeftBindFun(JSON.parse(JSON.stringify(props.bindDialog.categoryIdList)), true)
        } else {
          $data.loading = false
        }
      } else {
        $data.loading = false
        $data.showNone = true
      }
    })
    .catch(() => {
      $data.loading = false
    })
}

function init() {
  $data.loading = true
  getAllCategory()
}

init()
function setNone(allList) {
  if (allList.length > 0) {
    let hasChild = false
    allList.forEach(x => {
      if (x.childCategoryList && x.childCategoryList.length > 0) {
        hasChild = true
      }
    })
    $data.showNone = !hasChild
  } else {
    $data.showNone = true
  }
}
// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.searchName = e.target.value.replace(reg, '')
}
// 实时搜索分类
function searchInput() {
  if (!$data.searchName) {
    searchFun()
  }
}
function searchFun() {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.searchName = $data.searchName.replace(reg, '')
  $data.loading = true
  const list = []
  $data.allCategoryList.forEach(x => {
    if (x.childCategoryList && x.childCategoryList.length > 0) {
      const secondList = []
      x.childCategoryList.forEach(y => {
        if (y.categoryName.indexOf($data.searchName) > -1) {
          secondList.push(y)
        }
      })
      if (secondList && secondList.length > 0) {
        list.push({
          id: x.id,
          categoryName: x.categoryName,
          childCategoryList: secondList
        })
      }
    }
  })
  $data.categoryList = list
  setNone(list)
  const idList = $data.bindList.map(x => x.id)
  setLeftBindFun(idList)
}
// 设置左侧绑定的效果 chooseList 选中的ID列表 getBindList 是否重新获取选中的列表
function setLeftBindFun(chooseList, getBindList) {
  const bindList = []
  $data.categoryList.forEach((x, i) => {
    if (x.childCategoryList && x.childCategoryList.length > 0) {
      x.childCategoryList.forEach((z, ii) => {
        let stu = false
        chooseList.forEach(y => {
          if (z.id === y) {
            stu = true
            if (getBindList) {
              bindList.push({
                id: z.id,
                categoryName: z.categoryName,
                parentIndex: i,
                index: ii
              })
            }
          }
        })
        z.bind = stu
      })
    }
  })
  if (getBindList) {
    $data.bindList = JSON.parse(JSON.stringify(bindList))
  }

  $data.loading = false
}
// 添加分类
const addFun = throttle((x, y, item, index) => {
  if (!x.bind) {
    const idList = $data.bindList.map(x => x.id)
    idList.push(x.id)

    $data.bindList.push({
      id: x.id,
      categoryName: x.categoryName,
      parentIndex: index,
      index: y
    })
    $data.categoryList[index].childCategoryList[y].bind = true
  } else {
    let bindIndex = null
    $data.bindList.forEach((bx, bi) => {
      if (bx.id === x.id) {
        bindIndex = bi
      }
    })
    $data.bindList.splice(bindIndex, 1)
    $data.categoryList[index].childCategoryList[y].bind = false
  }
}, 500)
// 清空分类
const clearFun = throttle(() => {
  $data.bindList = []
  setLeftBindFun([])
}, 500)
// 删除分类
const delFun = throttle((item, index) => {
  console.log('删除', item)
  $data.bindList.splice(index, 1)
  $data.categoryList[item.parentIndex].childCategoryList[item.index].bind = false
})
const emits = defineEmits(['updateCategory'])
function closeDialog() {
  dialog.value.handleClose()
}
const saveFun = throttle(() => {
  $data.btnLoading = true
  const idList = $data.bindList.map(x => x.id)
  updateBind({
    creativeId: props.bindDialog.id,
    categoryIds: idList
  })
    .then(res => {
      if (res.code === 0) {
        emits('updateCategory', idList)
        ElMessage({
          message: '编辑成功',
          type: 'success'
        })
      }
      $data.btnLoading = false
      closeDialog()
    })
    .catch(() => {
      $data.btnLoading = false
      closeDialog()
    })
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.category_tag_content {
  height: 454px;
}
</style>
