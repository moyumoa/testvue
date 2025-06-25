<template>
  <el-dialog
    v-model="dataObject.showAddPopup"
    custom-class="hide_footer_line "
    :before-close="beforeClose"
    title="添加矩阵号"
    :width="420"
  >
    <div class="add_content" v-loading="dataObject.buttonLoading" element-loading-text="拼命加载中">
      <div class="con_top">
        矩阵号
        <el-input v-model="dataObject.inputValue" placeholder="请输入矩阵号昵称、ID" />
        <el-button type="primary" @click.prevent.stop="clickSearch" @keyup.enter="clickSearch">
          查询
        </el-button>
      </div>
      <div class="con_list" ref="conList">
        <div class="con_list_item" v-for="item in dataObject.marList" :key="item.openId">
          <div class="mar_info">
            <div class="head">
              <!-- 头像 -->
              <img class="head_url" v-if="item.dyHeadUrl" :src="item.dyHeadUrl" alt />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                alt
                class="head_url"
              />
              <!-- 平台 -->
              <div class="platform_img">
                <div :class="[`xm_platformIcon_${item.platform}`]"></div>
              </div>
            </div>
            <div class="info_box">
              <div class="con_dyNickname">{{ item.dyNickname || '匿名客户' }}</div>
              <div class="con_id">
                {{
                  item.platform == 2
                    ? '视频号'
                    : item.platform == 3
                    ? '小红书'
                    : item.platform == 4
                    ? '快手号'
                    : '抖音号'
                }}：{{ item.dyDisplayId || '--' }}
              </div>
            </div>
          </div>
          <!-- 选择 -->
          <el-checkbox @change="checkChange($event, item)" v-model="item.addGroup" size="large" />
        </div>
      </div>
      <!-- 无数据 搜索前和搜索后区分 -->
      <div
        class="no_data_box"
        v-if="dataObject.marList && dataObject.marList.length == 0 && dataObject.showNoDataTips"
      >
        <img src="@/assets/images/content_center/no_data.png" alt="" class="no_data" />
        <span class="no_data_tips">暂无数据</span>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <!-- 当前页数{{ dataObject.pageNo }} -->
        <el-button @click="beforeClose">取消</el-button>
        <el-button type="primary" :loading="dataObject.addLoading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'

const emit = defineEmits(['addClose', 'addOk'])
const conList = ref(null)
const message = inject('$message')

const dataObject = reactive({
  showAddPopup: true, // 显示
  buttonLoading: false, // 搜索时的按钮loading
  inputValue: '', // 输入框的内容
  marList: [], // 获取的列表
  addLoading: false, // 添加时的loading
  addArr: [], // 最终点确定时的选中列表
  hasNext: false, // 是否有下一页
  pageSize: 10,
  pageNo: 1,
  showNoDataTips: false // 是否显示 暂无数据 文案
})

// 关闭
function beforeClose() {
  emit('addClose')
}
// 搜索
function clickSearch() {
  if (!dataObject.inputValue) {
    message.warning('请输入矩阵号昵称、ID')
  } else {
    if (conList.value) {
      conList.value.scrollTop = 0 // 滚动条回到顶部，不然会一下请求当前滚动条对应位置之前页数的数据（同时调几次接口，pageNo不同
    }
    dataObject.buttonLoading = true
    dataObject.pageNo = 1
    getList().then(() => {
      dataObject.showNoDataTips = true
    })
  }
}
// 选中值的变化
function checkChange(e, item) {
  if (e) {
    dataObject.addArr.push(item)
  } else {
    dataObject.addArr = dataObject.addArr.filter(x => x !== item)
  }
}
// 确定按钮
function handleConfirm() {
  emit('addOk', dataObject.addArr)
}
// 获取列表
function getList() {
  return new Promise((resolve, reject) => {
    api
      .searchMar({
        dyNickName: dataObject.inputValue,
        pageSize: dataObject.pageSize,
        pageNo: dataObject.pageNo
      })
      .then(res => {
        console.log('获取列表的返回', dataObject.addArr)
        if (res.code === 0) {
          const list = res.data.records || []
          // 要保留上一次的选中结果
          list.forEach(x => {
            let has = false
            dataObject.addArr.forEach(y => {
              if (x.openId === y.openId) {
                has = true
              }
            })
            x.addGroup = has
          })
          if (dataObject.pageNo === 1) {
            dataObject.marList = list
          } else {
            dataObject.marList = dataObject.marList.concat(list)
          }
          dataObject.hasNext = res.data.hasNext
        }
      })
      .finally(() => {
        dataObject.buttonLoading = false
        resolve()
      })
  })
}

// 加载判断
function handleScroll(e) {
  const scrollTop = e.target.scrollTop
  const windowHeight = e.target.clientHeight
  const scrollHeight = e.target.scrollHeight
  if (scrollTop + windowHeight === scrollHeight) {
    // 加载数据
    if (dataObject.hasNext && !dataObject.buttonLoading) {
      dataObject.buttonLoading = true
      dataObject.pageNo++
      getList()
    }
  }
}
onMounted(() => {
  nextTick(() => {
    if (conList.value) {
      conList.value.addEventListener('scroll', handleScroll, true)
    }
  })
})
</script>
<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 16px !important;
}
:deep(.el-checkbox.el-checkbox--large .el-checkbox__inner) {
  width: 16px;
  height: 16px;
}
:deep(.el-checkbox__inner::after) {
  width: 4px;
  height: 8px;
  left: 5px;
}
.add_content {
  .con_top {
    display: flex;
    align-items: center;
    white-space: nowrap;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    :deep().el-input {
      width: 230px;
      margin: 0 24px 0 14px;
    }
    :deep(.el-input__inner) {
      &::placeholder {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #c0c4cc;
      }
    }
  }
  // .con_list_no_data {
  //   width: 100%;
  //   text-align: center;
  //   min-height: 40px;
  //   color: #909399;
  //   line-height: 40px;
  // }
  .no_data_box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
    .no_data {
      width: 72px;
      height: 52px;
    }
    .no_data_tips {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      // margin-top: 4px;
    }
  }

  .con_list {
    margin-top: 16px;
    max-height: 300px;
    overflow-y: auto;
    .con_list_item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      // border: 1px solid #000;
      padding: 8px 12px;
      box-shadow: inset 0px -1px 0px 0px #ebedf0;
      .mar_info {
        display: flex;
        align-items: center;
        .head {
          position: relative;
          .head_url {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          .platform_img {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 18px;
            height: 18px;
            div {
              width: 18px;
              height: 18px;
            }
          }
        }
        .info_box {
          margin-left: 12px;
          .con_dyNickname {
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #303133;
            line-height: 20px;
          }
          .con_id {
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #909399;
            line-height: 18px;
            margin-top: 2px;
          }
        }
      }
    }
  }
}
</style>
