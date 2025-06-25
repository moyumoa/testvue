<template>
  <!-- 列表 -->
  <xm_table
    class="pic_table"
    :data="videoData && videoData.records"
    v-model:page="tableForm.page"
    v-loading="tableForm.page.loading"
    tableType="video"
    @getTableData="getList"
  >
    <el-table-column width="400" label="作品">
      <template #default="scope">
        <div class="live_box">
          <router-link :to="toDetail(scope.row)">
            <div class="live_img_box">
              <img v-if="scope.row.cover" :src="scope.row.cover" alt class="live_img" />
              <img v-else src="@/assets/images/content_center/cover.jpg" alt class="live_img" />
              <div class="inner" v-if="scope.row.isDelete === 1">
                <img src="@/assets/images/content_center/delete.png" alt />
                <span>已删除</span>
              </div>
            </div>
          </router-link>

          <div class="live_content">
            <div class="content1">
              <div style="max-width: 300px" class="content_text row_overflow">
                {{ scope.row.title || '--' }}
              </div>
            </div>
            <div class="content2">
              时长：{{
                scope.row.videoDuration
                  ? secondToDate((scope.row.videoDuration / 1000).toFixed(2))
                  : '--'
              }}
            </div>
            <!-- <div class="content2">
              视频发布时间：{{ scope.row.createTime ? getDateDiff(scope.row.createTime) : '--' }}
            </div> -->
          </div>
        </div>
      </template>
    </el-table-column>
    <!-- <el-table-column min-width="200" label="矩阵号昵称">
      <template #default="scope">
        <router-link :to="toDetail2(scope.row)">
          <div class="user_box">
            <div class="user_avatar">
              <img v-if="scope.row.avatar" :src="scope.row.avatar" class="user_head" alt />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt
              />
              <el-tooltip
                effect="dark"
                v-if="
                  scope.row.openIdAuthStatusVo.dyAuth == 2 ||
                  scope.row.openIdAuthStatusVo.byAuth == 2
                "
                placement="top-start"
              >
                <template #content>
                  <div style="max-width: 300px">
                    {{ scope.row.openIdAuthStatusVo.byAuth == 2 ? '百应授权失效' : '' }}
                    {{
                      scope.row.openIdAuthStatusVo.byAuth == 2 &&
                      scope.row.openIdAuthStatusVo.dyAuth == 2
                        ? ','
                        : ''
                    }}
                    {{ scope.row.openIdAuthStatusVo.dyAuth == 2 ? '抖音授权失效' : '' }}
                  </div>
                </template>
                <img
                  class="expired_img"
                  src="@/assets/images/content_center/warning_icon.png"
                  alt=""
                />
              </el-tooltip>
            </div>
            <div class="user_content">
              <div class="content1">
                <div style="max-width: 300px" class="content_text">
                  {{ scope.row.nickname || '--' }} -->
    <!-- 发布平台类型 -->
    <!-- <img
                  v-if="scope.row.platform == 1"
                  src="@/assets/images/content_center/dy.png"
                  alt
                />
                <img
                  v-else-if="scope.row.platform == 2"
                  src="@/assets/images/content_center/ks.png"
                  alt
                />
                <img
                  v-else-if="scope.row.platform == 3"
                  src="@/assets/images/content_center/sph.png"
                  alt
                /> -->
    <!-- <img
                    v-if="scope.row.xuserType == 2"
                    src="@/assets/images/content_center/change_gray.png"
                    alt
                  />
                  <img
                    v-if="scope.row.xuserType == 3"
                    src="@/assets/images/content_center/change.png"
                    alt
                  />
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </template>
    </el-table-column> -->
    <el-table-column min-width="130" label="大小">
      <template #default="scope">{{ scope.row.worksSize || 0 }}</template>
    </el-table-column>
    <el-table-column min-width="130" label="使用次数">
      <template #default="scope">{{ wanSliceFormat(scope.row.useTime || 0) }}</template>
    </el-table-column>
    <el-table-column min-width="130" label="来源">
      <template #default="scope">{{ scope.row.source || '--' }}</template>
    </el-table-column>
    <el-table-column min-width="130" label="创建时间">
      <template #default="scope">{{ scope.row.createTime || '--' }}</template>
    </el-table-column>
    <el-table-column label="操作" fixed="right" min-width="195" align="right" header-align="right">
      <template #default="scope">
        <router-link :to="toDetail(scope.row)">
          <el-link type="primary" class="detail_btn" :underline="false">详情</el-link>
        </router-link>
        <el-link type="primary" class="btn" :underline="false" @click="addTab(scope.row)">
          加标签
        </el-link>
        <el-link type="primary" class="btn" :underline="false" @click="download(scope.row)">
          下载
        </el-link>
        <el-link type="primary" class="btn cel" :underline="false" @click="celItem(scope.$index)">
          删除
        </el-link>
      </template>
    </el-table-column>
  </xm_table>
  <!-- 添加标签的弹窗 -->
  <el-dialog v-model="dialogVisible" title="编辑标签" width="565px">
    <div class="add_tab_box">
      <el-input
        v-model="inputTabName"
        style="width: 300px"
        clearable
        placeholder="请输入新增标签"
      />
      <el-button class="add_btn" type="primary" @click="confirmAddTab">确认</el-button>
    </div>
    <div class="line"></div>
    <div class="current_tab_box">
      <div class="label">当前标签</div>
      <div class="tab_box">
        <el-tag class="tab" v-for="item in tableForm.currentTabs" :key="item">
          {{ item.name }}
        </el-tag>
      </div>
    </div>
    <div class="all_tab_title">所有标签</div>
    <div class="all_tab_box">
      <div class="current_tab_box" v-for="(item, index) in tableForm.tabs" :key="item">
        <div class="label">{{ item.title }}</div>
        <div class="tab_box">
          <el-tag
            class="tab"
            :type="!!(index % 2) || 'info'"
            closable
            @close="delTab(item, i)"
            @click="addTabToCurrentTabs(e)"
            v-for="(e, i) in item.datas"
            :key="e"
          >
            {{ e.name }}
          </el-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { wanSliceFormat, secondToDate } from '@/utils/tools.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { defineProps } from 'vue'
const props = defineProps({
  videoData: {
    type: Object,
    default: () => {}
  },
  page: {
    type: Object,
    default: () => {}
  }
})
const tableForm = reactive({
  page: {},
  tabs: [
    {
      title: 'A',
      datas: [{ name: 'A' }, { name: 'A' }, { name: 'A' }]
    },
    {
      title: 'B',
      datas: [{ name: '标签1' }, { name: '标签2' }, { name: '标签3' }]
    },
    {
      title: 'C',
      datas: [{ name: 'C' }, { name: 'C' }, { name: 'C' }]
    },
    {
      title: 'D',
      datas: [{ name: 'D' }, { name: 'D' }, { name: 'D' }]
    }
  ],
  currentTabs: [{ name: '标签1' }, { name: '标签2' }, { name: '标签3' }, { name: '标签4' }]
})
const dialogVisible = ref(false)
const inputTabName = ref('')
tableForm.page = toRef(props, 'page')
onMounted(() => {})

const emit = defineEmits(['getList', 'delItem'])

// 去详情
function toDetail(e) {
  return `/sumwhy_video/finish_product_store/works_detail`
}
// 点击添加标签按钮的回调
function addTab(e) {
  console.log(e)
  dialogVisible.value = true
}
// 点击删除标签的回调
function delTab(item, i) {
  console.log(item)
  item.datas.splice(i, 1)
  console.log('删除标签')
}
// 点击标签的回调
function addTabToCurrentTabs(e) {
  tableForm.currentTabs.push(e)
}
// 点击确认添加标签按钮的回调
function confirmAddTab() {
  console.log(inputTabName.value)
  inputTabName.value = ''
}
// 下载视频的回调
function download(e) {
  console.log(e)
  ElMessageBox.confirm('是否要下载该作品?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '下载成功'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '下载失败'
      })
    })
}
// 点击删除作品按钮的回调
function celItem(index) {
  console.log(index)
  ElMessageBox.confirm('是否要删除该作品?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      emit('delItem', index)
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除失败'
      })
    })
}
// 获取列表数据
function getList(obj) {
  emit('getList')
}
// 监听添加标签弹窗是否显示的回调
watch(
  () => dialogVisible.value,
  val => {
    if (!val) {
      inputTabName.value = ''
    }
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
.pic_table {
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  .live_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
      cursor: pointer;
      .inner {
        font-size: 11px;
        position: absolute;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 99;
        top: 0;
        background: #000000;
        opacity: 0.5;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        img {
          width: 16px;
          height: 16px;
          margin-left: 24px;
          margin-top: 4px;
        }
        span {
          margin-top: 10px;
          color: #fff;
        }
      }
    }
    .live_img {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
    }
    .live_content {
      max-width: calc(100% - 70px);
      min-height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        margin-bottom: 14px;
        .content_text {
          width: calc(100% - 26px);
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        margin-top: 4px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .user_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .user_avatar {
      position: relative;
      display: flex;
    }
    .user_head {
      width: 36px;
      height: 36px;
      border-radius: 100%;
      margin-right: 6px;
    }
    .expired_img {
      width: 14px;
      height: 14px;
      position: absolute;
      left: 22px;
      top: 0px;
    }
    .user_content {
      max-width: calc(100% - 42px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: calc(100% - 0px);
          margin-bottom: 4px;
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
        }
      }
      .content2 {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
.btn {
  &:last-child {
    margin: 0;
  }
  margin-right: 12px;
}
.detail_btn {
  margin-right: 12px;
}
.cel {
  color: #f85151;
}
.el-dialog {
  .add_tab_box {
    display: flex;
    .add_btn {
      margin-left: 24px;
    }
  }
  .line {
    width: 100%;
    height: 1px;
    margin-top: 16px;
    background: #ebedf0;
  }
  .current_tab_box {
    margin-top: 18px;
    .label {
      margin-bottom: 12px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
    }
    .tab_box {
      display: flex;
      .tab {
        margin-right: 24px;
        height: 28px;
      }
    }
  }
  .all_tab_title {
    margin-top: 24px;
    height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
  }
  .all_tab_box {
    height: 254px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    .tab_box {
      margin-top: 18px;
      .label {
        margin-bottom: 12px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .tab_box {
        display: flex;
        .tab {
          margin-right: 24px;
          height: 28px;
        }
      }
    }
  }
}
:deep(.el-tag--default) {
  cursor: default;
}
</style>
