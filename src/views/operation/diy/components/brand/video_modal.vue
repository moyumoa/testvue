<template>
  <div class="video_modal">
    <el-dialog
      v-model="show"
      title="视频列表"
      width="1180px"
      :close-on-click-modal="false"
      :before-close="videoClose"
    >
      <div class="modal_content">
        <xm_search
          :searchComponents="searchComponents"
          @getData="searchList"
          :useOwnReset="true"
          @reset="resetSearch"
        />
        <div class="table_box">
          <div class="table_video">
            <template v-if="tableForm.listData.length > 0">
              <div
                @click="chooseVideo(item)"
                class="one_video"
                v-for="(item, index) in tableForm.listData"
                :key="index"
              >
                <div class="video_top">
                  <img :src="item.img" class="video_cover" alt="" />
                  <div class="video_info">
                    <div class="info_top">
                      <div class="top_left">
                        <!-- <img src="@/assets/images/content_center/time.png" alt />
                        23S -->
                      </div>
                      <div :class="{ top_right: true, checked_right: item.checked }">
                        <el-icon><i-select /></el-icon>
                      </div>
                    </div>
                    <div class="info_bottom">
                      <!-- <div class="one_num">
                        <img src="@/assets/images/content_center/play.png" alt />
                        <div>{{ wanSliceFormat(item.playCount || 0) }}</div>
                      </div>
                      <div class="one_num">
                        <img src="@/assets/images/content_center/like.png" alt />
                        <div>{{ wanSliceFormat(item.dzCount || 0) }}</div>
                      </div>
                      <div class="one_num">
                        <img src="@/assets/images/content_center/msg.png" alt />
                        <div>{{ wanSliceFormat(item.commentCount || 0) }}</div>
                      </div>
                      <div class="one_num" style="margin-bottom: 8px">
                        <img src="@/assets/images/content_center/forward.png" alt />
                        <div>{{ wanSliceFormat(item.shareCount || 0) }}</div>
                      </div> -->
                      <div v-if="item.videoTitle" class="video_title line-hidden2">
                        {{ item.videoTitle }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="video_bottom">
                  <img class="user_head" v-if="item.phone" :src="item.phone" alt="" />
                  <img
                    v-else
                    src="@/assets/images/content_center/default_user.png"
                    class="user_head"
                    alt
                  />
                  <div class="user_info">
                    <div class="info1">
                      <div class="line-hidden1">
                        {{ item.name || '--' }}
                      </div>
                      <div class="platform_icon_box">
                        <div :class="[`xm_platformIcon_${item.platform}`]"></div>
                      </div>

                      <!-- 矩阵号类型  1:个人   2:企业号-->
                      <img
                        v-if="item.xuserType == 2"
                        src="@/assets/images/content_center/change.png"
                        alt
                      />
                      <img
                        v-else-if="item.xuserType == 3"
                        src="@/assets/images/content_center/fs.png"
                        alt
                      />
                    </div>
                    <div class="time">
                      {{ item.date ? getDateDiff(item.date) : '--' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex_center" style="width: 100%; height: 100%">暂无数据</div>
          </div>
          <div class="xm_table_page">
            <el-pagination
              v-model:current-page="pageIndex"
              background
              layout="total,sizes, prev, pager, next , jumper"
              :total="tableForm.page.total"
              :page-size="tableForm.page.size"
              :page-sizes="[5, 10, 20, 50, 100]"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
            ></el-pagination>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog_footer">
          <div class="footer_left">已选{{ tableForm.chooseList.length }}个视频</div>
          <div class="footer_right">
            <el-button @click="videoClose">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { pageVideoBrandUserList } from '@/api/operation/diy.js'
import { getDateDiff } from '@/utils/tools.js'
const props = defineProps({
  videoForm: {
    type: Object,
    default: () => {
      return {
        show: false
      }
    }
  },
  list: { type: Array, default: () => [] }
})
const show = toRef(props.videoForm, 'show')
const emits = defineEmits(['select'])
const message = inject('$message')

// 查询的信息
const searchComponents = ref([
  {
    type: 'input',
    label: '账号昵称',
    val: '',
    placeholder: '请输入账号昵称',
    filed: 'nickName'
  },
  {
    type: 'input',
    label: '视频标题',
    val: '',
    placeholder: '请输入视频标题',
    filed: 'videoTitle'
  }
  // {
  //   type: 'select',
  //   label: '排序',
  //   placeholder: '请选择排序',
  //   filed: 'sort',
  //   selects: [
  //     {
  //       label: '播放',
  //       value: 0
  //     },
  //     {
  //       label: '点赞',
  //       value: 1
  //     },
  //     {
  //       label: '评论',
  //       value: 2
  //     },
  //     {
  //       label: '分享',
  //       value: 3
  //     },
  //     {
  //       label: '发布时间',
  //       value: 4
  //     }
  //   ],
  //   val: ''
  // }
])
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  chooseList: [],
  page: {
    index: 1,
    size: 5,
    total: 0
  }
})
const pageIndex = toRef(tableForm.page, 'index')
function getList() {
  tableForm.loading = true
  const params = {
    pageNumber: tableForm.page.index,
    pageSize: tableForm.page.size,
    onlyNativeUrlExists: true
  }
  searchComponents.value.forEach(ele => {
    params[ele.filed] = ele.val
  })
  pageVideoBrandUserList(params).then(res => {
    res.data.records.forEach(ele => {
      ele.checked = false
    })
    tableForm.listData = res.data.records
    echoChecked()
    tableForm.page.total = res.data.total
    tableForm.loading = false
  })
}
// 重置
function resetSearch() {
  tableForm.page = {
    index: 1,
    size: 5,
    total: 0
  }
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.page.index = 1
  getList()
}
// 分页相关：监听页码切换事件
const handleCurrentChange = val => {
  tableForm.page.index = val
  getList()
}
// 分页相关：监听单页显示数量切换事件
const handleSizeChange = val => {
  tableForm.page.size = val
  tableForm.page.index = 1
  pageIndex.value = 1
  getList()
}
// 选中video
function chooseVideo(e) {
  if (e.checked) {
    e.checked = false
    const chooseIndex = tableForm.chooseList.map(x => x.id).indexOf(e.id)
    tableForm.chooseList.splice(chooseIndex, 1)
  } else {
    if (tableForm.chooseList.length >= 30) {
      return message.warning('最多选择30个视频')
    }
    e.checked = true
    tableForm.chooseList.push(e)
  }
}
// 确定
function handleConfirm() {
  if (tableForm.chooseList.length > 0) {
    emits('select', tableForm.chooseList)
    videoClose()
  } else {
    message.warning('请先选择视频')
  }
}
const videoClose = () => {
  show.value = false
}
// 回显选中
const echoChecked = () => {
  tableForm.chooseList.forEach(ele => {
    tableForm.listData.forEach(i => {
      if (i.id === ele.id) {
        i.checked = true
      }
    })
  })
}

watch(
  () => props.list,
  val => {
    tableForm.chooseList = JSON.parse(JSON.stringify(val))
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.item_content) {
  width: 230px !important;
}
:deep(.search_item) {
  margin-right: 0px !important;
  &:last-child {
    justify-content: flex-end;
    flex-basis: 190px;
  }
}
.table_box {
  .table_video {
    padding: 0 10px 0 24px;
    width: calc(100% - 5px);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    @media screen and(max-width:1600px) {
      height: 400px;
    }
    .one_video {
      width: 206px;
      min-height: 380px;
      border-radius: 8px;
      margin-right: 20px;
      margin-bottom: 20px;
      .video_top {
        width: 100%;
        height: 318px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        position: relative;
        .video_cover {
          width: 100%;
          height: 100%;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          object-fit: cover;
        }
        .video_info {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }
      }
      .info_top {
        cursor: pointer;
        width: calc(100% - 0px);
        height: 52px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 14px;
        .top_left {
          cursor: pointer;
          padding: 1px 6px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          font-size: 14px;
          color: #ffffff;
          line-height: 22px;
          border-radius: 12px;
          img {
            width: 16px;
            height: 16px;
            object-fit: cover;
            display: flex;
            margin-right: 3px;
          }
        }
        .top_right {
          cursor: pointer;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 2px;
          border: 1px solid #dbdee0;
          color: #fff;
        }
        .checked_right {
          background: #364fcd;
          border: 1px solid #364fcd;
          color: #fff;
        }
      }
      .info_bottom {
        cursor: pointer;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-end;
        cursor: pointer;
        height: calc(100% - 52px);

        .video_title {
          width: calc(100% - 0px);
          height: 48px;
          padding: 4px 10px;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
          opacity: 1;
          margin-top: 0px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
        }
        .one_num {
          text-align: center;
          font-size: 12px;
          color: #ffffff;
          line-height: 22px;
          position: relative;
          min-width: 60px;
          height: 42px;
          margin-right: 0px;
          margin-bottom: 10px;
          > div {
            margin-top: 20px;
            margin-right: 4px;
          }
          img {
            width: 20px;
            height: 20px;
            position: absolute;
            right: 22px;
            top: 0;
          }
        }
      }
      .video_bottom {
        width: 100%;
        min-height: 62px;
        background: #ffffff;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
        border-radius: 0px 0px 8px 8px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 14px 10px 16px;
        .user_head {
          width: 32px;
          height: 32px;
          border: 1px solid #979797;
          object-fit: cover;
          margin-right: 6px;
          border-radius: 100%;
        }
        .user_info {
          width: calc(100% - 38px);
          .info1 {
            width: 70%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            font-size: 13px;
            font-weight: 400;
            color: #303133;
            line-height: 18px;
            .platform_icon_box {
              width: 14px;
              height: 14px;
              margin-left: 4px;
              position: relative;
              div {
                width: 14px;
                height: 14px;
              }
            }
          }
          .time {
            margin-top: 2px;
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 17px;
          }
        }
      }
    }
    .one_video:nth-child(5n) {
      margin-right: 0;
    }
  }
}
:deep(.el-dialog__body) {
  padding: 0;
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 7px;
  margin: 0 2px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 7px;
  background-color: #c0c2c2;
  // margin: 0 5px;
}
.xm_table_page {
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
.dialog_footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 24px;
}
</style>
