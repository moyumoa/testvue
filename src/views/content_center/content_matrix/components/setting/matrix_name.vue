<template>
  <div class="conditionPage">
    <div class="condition_warp">
      <div class="warp_top">
        <el-button type="primary" @click="addNumber">添加矩阵号</el-button>
        <el-button type="primary" @click="allImport">批量导入</el-button>
        <span class="top_tips">所有操作均需点击页面下方“保存分组”按钮</span>
        <div class="top_search">
          <el-input
            style="width: 240px"
            v-model="searchForm.inputValue"
            clearable
            @clear="clearInputValue"
            placeholder="请输入矩阵号昵称、ID"
          />
          <el-button
            type="primary"
            @click.prevent.stop="clickSearch"
            @keyup.enter="clickSearch"
            style="margin-left: 16px"
          >
            查询
          </el-button>
        </div>
      </div>
      <div class="page_account" v-loading="searchForm.buttonLoading">
        <!-- 查询矩阵号 -->
        <template v-if="isSearch">
          <div class="account_title">查询矩阵号</div>
          <div
            ref="searchRef1"
            class="warp_content warp_content2"
            v-if="searchList && searchList.length > 0"
          >
            <div class="list_item" v-for="(item, index) in searchList" :key="index">
              <div class="head">
                <img v-if="item.dyHeadUrl" :src="item.dyHeadUrl" alt="" class="head_img" />
                <img
                  v-else
                  src="@/assets/images/content_center/default_user.png"
                  alt
                  class="head_img"
                />
                <!-- 平台 -->
                <div class="platform_img">
                  <div :class="[`xm_platformIcon_${item.platform}`]"></div>
                </div>
              </div>
              <div class="info">
                <div class="dy_nick">{{ item.dyNickname || '匿名客户' }}</div>
                <div class="id">ID：{{ item.dyDisplayId || '--' }}</div>
              </div>
              <!-- 右上角的 X -->
              <div class="close" @click="removeOne(item)">
                <el-icon>
                  <i-close />
                </el-icon>
              </div>
            </div>
          </div>
          <div
            class="warp_content warp_content_no_data warp_content_no_data2 warp_content2"
            v-if="!(searchList && searchList.length > 0) && !searchForm.buttonLoading"
          >
            <div class="no_data_con">
              <img src="@/assets/images/content_center/no_data.png" alt="" class="no_data_img" />
              <span class="no_data_tips">暂无数据</span>
            </div>
          </div>
          <!-- 全部矩阵号 -->
          <div class="account_title" style="padding-top: 20px">全部矩阵号</div>
        </template>
        <div
          ref="searchRef2"
          :class="{ warp_content: true, warp_content3: isSearch }"
          :style="!isSearch ? 'padding-top:16px' : ''"
          v-if="matrixNameList && matrixNameList.length > 0"
        >
          <div
            :class="{ list_item: true, list_item_blue: isSearch && item.isHigh }"
            v-for="(item, index) in matrixNameList"
            :key="index"
          >
            <div class="head">
              <img v-if="item.dyHeadUrl" :src="item.dyHeadUrl" alt="" class="head_img" />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                alt
                class="head_img"
              />
              <!-- 平台 -->
              <div class="platform_img">
                <div :class="[`xm_platformIcon_${item.platform}`]"></div>
              </div>
            </div>
            <div class="info">
              <div class="dy_nick">{{ item.dyNickname || '匿名客户' }}</div>
              <div class="id">ID：{{ item.dyDisplayId || '--' }}</div>
            </div>
            <!-- 右上角的 X -->
            <div class="close" @click="removeOne(item)">
              <el-icon>
                <i-close />
              </el-icon>
            </div>
          </div>
        </div>
        <div
          :class="{ warp_content: true, warp_content_no_data: true, warp_content3: isSearch }"
          v-else
        >
          <div v-if="showNoData" class="no_data_con">
            <img src="@/assets/images/content_center/no_data.png" alt="" class="no_data_img" />
            <span class="no_data_tips">暂无数据</span>
          </div>
        </div>
      </div>
    </div>
    <addPopup v-if="showAddPopup" @addClose="addClose" @addOk="addOk" />
    <addErrorPOpup
      v-if="showAddError"
      @errorClose="errorClose"
      :errList="errList"
      :successList="successImports"
    />
    <batchAddPopup
      v-if="showBatchAddPopup"
      @batchAddClose="batchAddClose"
      @uploadSuccess="uploadSuccess"
      :uploadUrl="batchUploadUrl"
      :exportFile="exportFiles"
      title="批量导入"
    />
  </div>
</template>
<script setup>
import addPopup from './add_matrix_popup.vue'
import batchAddPopup from './add_matrix_batch_popup.vue'
import addErrorPOpup from './add_matrix_error_popup.vue'
import { downloadTemplate, batchUploadUrl } from '@/api/content_center/content_matrix.js'
import { exportFile } from '@/utils/exportFile'
import { isNotEmpty } from '@/utils/tools'

const props = defineProps({
  matrixNameList: {
    type: Array,
    default() {
      return []
    }
  },
  originList: {
    type: Array,
    default() {
      return []
    }
  } // 原数组
})

const originList = toRef(props, 'originList')
const matrixNameList = toRef(props, 'matrixNameList')
const emit = defineEmits(['addMatrix', 'removeOne', 'SearchOk', 'SearchClear'])
// const $message = inject('$message')

const showAddPopup = ref(false)
const showBatchAddPopup = ref(false)
const searchForm = reactive({
  inputValue: '',
  buttonLoading: false
})
const showNoData = ref(false)
const showAddError = ref(false)
// 点击添加矩阵号
function addNumber() {
  showAddPopup.value = true
}
// 批量导入
function allImport() {
  showBatchAddPopup.value = true
}
// 关闭添加弹窗
function addClose() {
  showAddPopup.value = false
}
// 点击确定加入分组
function addOk(val) {
  addClose()
  // 将选择的矩阵号放到列表
  emit('addMatrix', val)
}
// 批量导入的关闭
function batchAddClose(val) {
  showBatchAddPopup.value = val
}
const errList = ref([])
const successImports = ref([])
// 批量导入成功的回调
function uploadSuccess(successList, failList) {
  emit('addMatrix', successList)
  errList.value = failList
  successImports.value = successList
  if (errList.value.length > 0) {
    setTimeout(() => {
      showAddError.value = true
    }, 1000)
  }
}
// 批量导入下载模板的方法
function exportFiles() {
  return exportFile(downloadTemplate, {}, '批量加入分组的模板', 'xlsx')
}
const isSearch = ref(false) // 是否触发了查询
const searchList = ref([]) // 查询之后的数据
const searchRef1 = ref()
const searchRef2 = ref()
// 查询
function clickSearch() {
  searchRef1.value?.scrollTo(0, 0)
  searchRef2.value?.scrollTo(0, 0)
  // console.log('点击查询', searchForm)
  if (searchForm.inputValue) {
    isSearch.value = true
    // searchForm.buttonLoading = true
    // 要在所有数据中筛选，而不是当前筛选的结果里继续筛选
    const list = fuzzySearch(originList.value, searchForm.inputValue)
    searchList.value = list
    // 将筛选后的结果置顶
    const filteredA = originList.value.filter(
      aItem => !list.find(bItem => bItem.openId === aItem.openId)
    )
    const result = [...list, ...filteredA]
    emit('SearchOk', result)
  } else {
    isSearch.value = false
    // 没有输入的时候就回显列表
    emit('SearchClear')
  }
  showNoData.value = true
}
// 模糊搜索
function fuzzySearch(arr, q) {
  // console.log('搜索arr', arr)
  // console.log('搜索关键字', q)
  const str = `S*${q}S*`
  const reg = new RegExp(str, 'i')
  return (arr || []).filter(item => {
    if (reg.test(item.dyDisplayId) || reg.test(item.dyNickname)) {
      // 符合条件的需要高亮提示
      item.isHigh = !!isNotEmpty(q)
      return true
    } else {
      item.isHigh = false
      return false
    }
  })
  // 这个大小写字母无法通配
  // return (arr || []).filter(
  //   objItem =>
  //     (objItem.dyDisplayId && objItem.dyDisplayId.indexOf(q) !== -1) ||
  //     (objItem.dyNickname && objItem.dyNickname.indexOf(q) !== -1)
  // )
}
// 清空
function clearInputValue() {
  isSearch.value = false
  searchList.value = []
  emit('SearchClear')
}
// 删除一个
function removeOne(item) {
  emit('removeOne', item)
  // 删除的时候，如果筛选结果里有符合条件的需要一并删除
  if (isSearch.value && isNotEmpty(searchList.value)) {
    searchList.value = searchList.value.filter(x => x.xuserId !== item.xuserId)
  }
  // searchForm.inputValue = ''
}
// 错误提示的关闭
function errorClose() {
  showAddError.value = false
}
</script>
<style lang="scss" scoped>
.conditionPage {
  height: 100%;
}
.condition_warp {
  height: 100%;
  box-sizing: border-box;
  .warp_top {
    position: relative;
    padding: 20px 0;
    .top_tips {
      margin-left: 24px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
    }
    .top_search {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      align-items: center;

      :deep(.el-input__inner) {
        &::placeholder {
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #c0c4cc;
        }
      }
    }
  }
  .warp_content_no_data {
    flex-direction: column;
    justify-content: center;
    align-items: center !important;
    align-content: unset !important;
    .no_data_con {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .no_data_img {
      width: 80px;
      height: 60px;
      object-fit: contain;
      display: flex;
    }
    .no_data_tips {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
  .warp_content_no_data2 {
    .no_data_img {
      width: 80px;
      height: 60px;
      object-fit: contain;
    }
  }
  .page_account {
    background: #f6f8fa;
    border-radius: 2px;

    padding-top: 0px;
    padding-left: 16px;
    height: calc(100% - 88px);
    .account_title {
      padding: 16px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .warp_content2 {
      height: 120px;
    }
    .warp_content3 {
      height: calc(100% - 222px) !important;
    }
  }
  .warp_content {
    height: 100%;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    overflow-y: auto;
    align-content: flex-start;
    .list_item {
      width: 280px;
      padding: 16px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #dcdee0;
      display: flex;
      position: relative;
      margin: 0 16px 16px 0;
      .head {
        width: 56px;
        height: 56px;
        position: relative;
        .head_img {
          width: 56px;
          height: 56px;
          border-radius: 50%;
        }
        .platform_img {
          width: 20px;
          height: 20px;
          position: absolute;
          right: 0;
          bottom: 0;
          div {
            width: 20px;
            height: 20px;
          }
        }
      }
      .info {
        width: calc(100% - 80px);
        margin-left: 12px;
        .dy_nick {
          word-break: break-all;
          font-size: 16px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 22px;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .id {
          word-break: break-all;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
          margin-top: 6px;
        }
      }
      .close {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 14px;
        padding: 4px;
        color: #909399;
        cursor: pointer;
        &:hover {
          color: #364fcd;
        }
      }
    }
    .list_item_blue {
      border-color: #364fcd;
    }
  }
}
</style>
