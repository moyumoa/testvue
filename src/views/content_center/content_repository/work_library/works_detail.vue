<template>
  <div class="works_detail">
    <!-- 详情信息 -->
    <div class="head_info_box">
      <div class="basic_info_box">
        <div class="title">
          <div class="title_left">基础信息</div>
          <div class="title_right" v-if="tableForm.workInfo">
            <el-button type="primary" @click="editTags">打标签</el-button>

            <el-button type="default" v-if="tableForm.workInfo.type != 99" @click="downloadFile">
              下载
            </el-button>
            <el-button type="danger" @click="deleteMaterial">删除</el-button>
          </div>
        </div>
        <div class="video_detail_box">
          <div class="img_box" @click="playVideo">
            <img
              class="video_img"
              :src="tableForm.workInfo.coverUrl || tableForm.workInfo.url || defaultCover"
              alt=""
            />
            <!-- 如果是图文，就不要播放按钮 -->
            <div class="play" v-if="workType == 1">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png" alt="" />
            </div>
            <!--  图文类型就显示图文详情的弹窗 -->
            <imgTextTask_ICON
              v-if="tableForm.workInfo.type == 99"
              :info="tableForm.workInfo"
              :useClick="true"
            />
          </div>
          <div class="detail">
            <div class="detail_top">
              <div class="top_left">
                <div class="video_name" v-if="!editForm.stu">
                  <div class="line-hidden1" style="max-width: 320px; margin-right: 8px">
                    {{ tableForm.workInfo.name || '--' }}
                  </div>
                  <i
                    class="icon iconfont icon-edit"
                    style="cursor: pointer; color: #364fcd; font-size: 14px"
                    @click="showNameInput"
                  ></i>
                </div>
                <el-input
                  v-else
                  ref="nameRef"
                  style="width: 80%; min-width: 230px; margin-bottom: 5px"
                  maxlength="99"
                  v-model.trim="editForm.name"
                  placeholder="请输入标题"
                  @blur="retEmit($event)"
                ></el-input>
              </div>
              <div class="top_right" v-if="tableForm.workInfo.type != 99 && systemVersion == 3">
                <el-switch
                  class="public_switch"
                  v-model="tableForm.workInfo.isOpen"
                  :before-change="beoreOpenChange.bind(this, tableForm.workInfo)"
                  :width="72"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="已开放"
                  inactive-text="已隐藏"
                ></el-switch>
                <el-tooltip class="item" effect="dark" content="" placement="right">
                  <template #content>
                    <div style="max-width: 400px">
                      开启开关后，素材将在小程序【素材宝典】模块内开放给员工下载
                    </div>
                  </template>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20231207op3gl.png"
                    style="width: 16px; height: 16px; margin-left: 8px"
                    alt
                  />
                </el-tooltip>
              </div>
            </div>
            <!-- v-if="tableForm.workInfo.type != 99" -->
            <div class="other_info">
              类型：{{
                tableForm.workInfo.type == 1
                  ? '视频'
                  : tableForm.workInfo.type == 2
                  ? '图片'
                  : tableForm.workInfo.type == 99
                  ? '图文'
                  : ''
              }}
            </div>
            <!--  -->
            <div class="other_info" v-if="tableForm.workInfo.type == 1">
              时长：{{
                tableForm.workInfo.duration
                  ? secondToDate(tableForm.workInfo.duration / 1000, '秒', true, true)
                  : '--'
              }}
            </div>
            <div class="other_info" v-if="tableForm.workInfo.type == 1">
              分辨率：{{ tableForm.workInfo.wight || '--' }}*{{ tableForm.workInfo.height || '--' }}
            </div>
            <div class="other_info" v-if="tableForm.workInfo.type != 99">
              大小：{{ changeKB(tableForm.workInfo.size || 0) }}
            </div>
            <div class="other_info">创建时间：{{ tableForm.workInfo.createTime || '--' }}</div>
            <div class="other_info">
              上传批次号：{{ tableForm.workInfo.batchNumber || '暂无批次号' }}
            </div>
            <div class="other_info">
              <fileTag
                class="file_tagbox"
                v-if="tableForm.workInfo.folderList && tableForm.workInfo.folderList.length > 0"
                :fileName="tableForm.workInfo.folderList[0].name"
                :fileInfo="tableForm.workInfo.folderList[0]"
                @showRemoveFun="showRemoveFun"
              />
            </div>
          </div>
        </div>
        <div
          class="tab_list"
          v-if="tableForm.workInfo.tagList && tableForm.workInfo.tagList.length"
        >
          <el-tag class="tab" v-for="item in tableForm.workInfo.tagList" :key="item">
            {{ item.name }}
          </el-tag>
        </div>
      </div>
      <div class="work_source_box">
        <div class="title">素材来源</div>
        <div class="info_box">
          <span class="label">素材来源：</span>
          <span class="value">
            {{
              tableForm.workInfo.source
                ? tableForm.workInfo.source == 1
                  ? subSourceList.get(tableForm.workInfo.subSource || 0) || '--'
                  : channelList.get(tableForm.workInfo.source || 0) || '--'
                : '--'
            }}
          </span>
        </div>
        <div class="info_box">
          <span class="label">上传用户：</span>
          <img
            v-if="tableForm.workInfo.userHeadUrl"
            class="head_portrait"
            :src="tableForm.workInfo.userHeadUrl"
            alt=""
          />
          <span class="value">{{ tableForm.workInfo.userName || '--' }}</span>
        </div>
        <div class="info_box">
          <span class="label">手机号：</span>
          <span class="value">
            <template v-if="tableForm.workInfo.userPhone">
              {{ tableForm.workInfo.userPhone.substring(0, 3) }}****{{
                tableForm.workInfo.userPhone.substring(7)
              }}
            </template>
            <template v-else>--</template>
          </span>
        </div>
        <div class="info_box">
          <span class="label">备注：</span>
          <span class="value">{{ tableForm.workInfo.remark || '--' }}</span>
        </div>
      </div>
    </div>
    <!-- 使用记录列表 -->
    <div class="table_box">
      <div class="title" style="margin-bottom: 0">使用记录</div>
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
        ref="xmSearchRef"
      />
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <!-- 用户信息 -->
        <el-table-column min-width="200" label="用户信息">
          <template #default="scope">
            <div class="user_box">
              <div class="user_avatar">
                <img
                  v-if="scope.row.useUserHeadUrl"
                  :src="scope.row.useUserHeadUrl"
                  class="user_head"
                  alt
                />
                <div class="user_default_head" v-else-if="scope.row.useUserName">
                  <default-photo :name="scope.row.useUserName" />
                </div>
                <img
                  v-else
                  src="@/assets/images/content_center/default_user.png"
                  class="user_head"
                  alt
                />
              </div>
              <div style="max-width: 300px" class="content_text">
                {{ scope.row.useUserName || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 手机号 -->
        <el-table-column min-width="200" label="手机号">
          <template #default="scope">
            <div class="phone">
              <template v-if="scope.row.useUserPhone">
                {{ scope.row.useUserPhone.substring(0, 3) }}****{{
                  scope.row.useUserPhone.substring(7)
                }}
              </template>
              <template v-else>--</template>
            </div>
          </template>
        </el-table-column>
        <!-- 使用平台 -->
        <el-table-column min-width="200" label="使用平台" v-if="workType == 1">
          <template #default="{ row }">
            <div class="phone">
              {{
                [2, 21, 22].includes(row.useWay)
                  ? '--'
                  : row.usePlat
                  ? PLATFORM.getCN(row.usePlat)
                  : '--'
              }}
            </div>
          </template>
        </el-table-column>
        <!-- 使用形式 -->
        <el-table-column min-width="200" label="使用形式">
          <template #default="scope">
            <div class="phone">
              {{ scope.row.useWay ? WORK_USEWAY.getCN(scope.row.useWay) : '--' }}
            </div>
          </template>
        </el-table-column>
        <!-- 使用时间 -->
        <el-table-column min-width="200" label="使用时间">
          <template #default="scope">
            <div class="phone">
              {{ scope.row.useTime || '--' }}
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 查看视频弹窗 -->
    <el-dialog
      title="查看视频"
      :width="'344px'"
      @close="bigVideoVisible = false"
      v-model="bigVideoVisible"
    >
      <video
        ref="videoRef"
        class="video"
        :style="{
          width: '300px',
          height: '533.3px',
          objectFit: 'contain',
          background: '#333'
        }"
        :src="tableForm.workInfo.url"
        :poster="tableForm.workInfo.coverUrl"
        controls="controls"
      ></video>
    </el-dialog>
    <addDialog v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="getWorkInfo" />
    <!-- 移动到文件夹的弹窗 -->
    <removeDOM
      origin="finishProduct"
      v-if="removeDialog.show"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
    />
    <!-- 预览素材 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>

<script setup>
import DefaultPhoto from '@/views/system/components/default_photo/index.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import removeDOM from '@/views/sumvideo/components/files/file_remove_dialog.vue'
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'

import { downLoadFile } from '@/utils/exportFile.js'
import { WORK_USEWAY } from '@/utils/dictionary/sumvideo.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { throttle, changeKB, secondToDate } from '@/utils/tools.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import addDialog from '../components/addTag_dialog.vue'
import { getQuery } from '@/utils/get_query.js'
import {
  getWorkDetail,
  getUsageRecordList,
  updateWork,
  beforUpdateWorks
} from '@/api/content_center/content_repository.js'

import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const message = inject('$message')
const route = useRoute()
const workType = ref(1) // 作品类型 1视频 2图片
const version = ref(2)
if (route.query.v) {
  version.value = route.query.v
} else {
  version.value = 2
}
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '使用人员',
    val: '',
    placeholder: '请输入使用人员名称',
    filed: 'userName'
  },
  {
    hiddenItem: workType.value !== 1,
    type: 'select',
    label: '使用平台',
    val: null,
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    placeholder: '请选择使用平台',
    filed: 'usePlat',
    selects: [
      {
        label: '抖音',
        value: 1
      },
      {
        label: '快手',
        value: 4
      },
      {
        label: '小红书',
        value: 3
      },
      {
        label: '视频号',
        value: 2
      }
    ]
  },
  {
    type: 'select',
    label: '使用形式',
    val: null,
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    placeholder: '请选择使用形式',
    filed: 'useWay1',
    selects: getUseWay1Selects()
  },
  {
    type: 'dateRange', // 组件类型
    label: '使用时间', // label展示
    clearable: true,
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    defaultVal: [new Date(Date.now() - 3600 * 1000 * 24 * 0), new Date()],
    val: [new Date(Date.now() - 3600 * 1000 * 24 * 0), new Date()], // 默认 近三十天的数据
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  workInfo: {},
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const nameRef = ref(null)
const editForm = reactive({
  stu: false,
  name: ''
})

function getUseWay1Selects() {
  // 类型的判 workType 1视频 2图片 99图文
  workType.value = route.query.workType ? parseInt(route.query.workType) : 1
  const currentKey = systemVersion.value + '' + workType.value

  const allList = [
    { id: 1, label: '小程序下载', value: [22].join(',') },
    { id: 2, label: '小程序发视频', value: [141, 142].join(',') },
    { id: 3, label: '素材库下载', value: [2, 21].join(',') },
    { id: 4, label: '视频任务转发', value: [111, 112, 1].join(',') },
    { id: 5, label: '成长任务转发', value: [121, 122].join(',') },
    { id: 6, label: '批量发布', value: [132].join(',') },
    { id: 7, label: '矩阵列表发布', value: [131].join(',') },
    { id: 8, label: '二维码发布下载', value: [143].join(',') }
  ]

  const showSelectIdLstSet = {
    11: [1, 2, 3, 6, 8],
    21: [3, 6, 8],
    31: [1, 2, 3, 4, 5, 6, 7, 8],
    41: [1, 2, 3, 4, 6, 8],
    12: [3, 8], // 图片类型
    22: [3, 8],
    32: [1, 3, 8],
    42: [3, 8]
  }

  return allList.filter(x => (showSelectIdLstSet[currentKey] || []).includes(x.id))
}

function showNameInput() {
  editForm.name = tableForm.workInfo.name
  editForm.stu = true
  nextTick(() => {
    nameRef.value.focus()
  })
}

const addTagDialog = reactive({
  show: false,
  id: null,
  type: null,
  chooseTagList: []
})
function editTags() {
  addTagDialog.type = 1
  addTagDialog.id = route.query.id
  addTagDialog.show = true
  addTagDialog.chooseTagList = []
  // chooseTagList.value = info.value.tagList ? JSON.parse(JSON.stringify(info.value.tagList)) : []
  // getTagList()
}

const downloadFile = throttle(function () {
  if (tableForm.workInfo.url) {
    ElMessageBox.confirm(`是否要下载该素材?`, '系统提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '确定'

          const regex = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
          downLoadFile(
            tableForm.workInfo.url,
            (tableForm.workInfo.name || '素材').replace(regex, ''),
            'material_library'
          )
            .then(() => {
              ElMessage({
                type: 'success',
                message: '下载成功'
              })
              searchList()
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
            .catch(() => {
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
          beforUpdateWorks({
            cId: tableForm.workInfo.id,
            useWay: 21
          })
        } else {
          done()
          setTimeout(() => {
            instance.confirmButtonLoading = false
          }, 300)
        }
      }
    })
      .then(() => {})
      .catch(() => {
        // ElMessage({
        //   type: 'info',
        //   message: '取消下载'
        // })
      })
  } else {
    ElMessage({
      type: 'warning',
      message: '暂未找到相关下载链接'
    })
  }
}, 700)
const router = useRouter()
function deleteMaterial() {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      // emit('delItem', index)
      updateWork({
        id: tableForm.workInfo.id,
        isDelete: 1,
        bizShow: 1
      }).then(res => {
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '删除成功'
          })
          router.go(-1)
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}

// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  editForm.name = e.target.value.replace(reg, '')
  saveName()
}
function saveName() {
  if (editForm.name.trim() !== '') {
    updateWork({
      id: route.query.id,
      name: editForm.name,
      bizShow: 1
    }).then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: '修改成功'
        })
        getWorkInfo()
        editForm.stu = false
        editForm.name = ''
      }
    })
  } else {
    editForm.stu = false
    editForm.name = ''
  }
}
const bigVideoVisible = ref(false)
// 来源渠道
const channelList = reactive(
  // new Map([
  //   [1, '运营策略'],
  //   [2, '智能短视频合成'],
  //   [3, '手动上传'],
  //   [4, '第三方(酷家乐)'],
  //   [9, '公开模板跟拍'],
  //   [8, '灵感跟拍']
  // ])
  new Map([
    [2, '流水线'],
    [3, '手动上传'],
    [4, '第三方平台'],
    [11, '模板式生成'],
    [12, '剧本式生成'],
    [14, '智能混剪']
  ])
)
const subSourceList = reactive(
  new Map([
    [11, '发布任务'],
    [12, '征集任务']
  ])
)

const previewInfo = ref({
  show: false
}) // 预览
// 播放视频
function playVideo() {
  previewInfo.value = {
    show: true,
    title: tableForm.workInfo.type === 2 ? '查看图片' : '查看视频',
    url: tableForm.workInfo.url,
    type: tableForm.workInfo.type === 2 ? 'image' : 'video',
    cover: tableForm.workInfo.coverUrl || ''
  }
}
// 获取成品详情的回调
async function getWorkInfo() {
  const res = await getWorkDetail({ id: route.query.id || '' })
  if (res.success) {
    tableForm.workInfo = res.data
  }
}
// 获取使用记录
async function getList() {
  tableForm.loading = true
  const searchForm = getQuery(searchComponents.value, ['useTimeMin', 'useTimeMax'])
  console.log('seeee', searchForm)
  if (searchForm.useWay1 && searchForm.useWay1.length > 0) {
    let wayList = []
    searchForm.useWay1.forEach(x => {
      if (x.indexOf(',') > -1) {
        wayList = wayList.concat(x.split(','))
      } else {
        wayList.push(x)
      }
    })
    searchForm.useWay = wayList || []
  }
  Object.assign(searchForm, {
    cIds: route.query.id ? [route.query.id] : [],
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  })
  const res = await getUsageRecordList(searchForm)
  if (res.success) {
    tableForm.listData = res.data.records
    tableForm.page.total = res.data.total
  }
  tableForm.loading = false
  console.log('该成品的使用记录', res.data)
}
// 关闭播放视频弹窗
const videoRef = ref(null)
watch(
  () => bigVideoVisible.value,
  val => {
    if (!val) {
      videoRef.value.pause()
    }
  }
)
onMounted(() => {
  const index = searchComponents.value.findIndex(x => x.filed === 'usePlat')
  if (index > -1) {
    searchComponents.value[index].hiddenItem = workType.value !== 1
  }
  getWorkInfo()
  resetSearch()
})
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
// 移动文件夹的相关信息
const removeDialog = reactive({
  show: false
})
function showRemoveFun() {
  removeDialog.isBatchRemove = false
  removeDialog.onlyRemoveFile = false
  removeDialog.materialIds = [route.query.id]
  removeDialog.fileId = null
  removeDialog.parentId = null
  removeDialog.show = true
}
function removeSuccessFun(val) {
  console.log('移动成功')
  getWorkInfo()
}

// 开关开启/关闭之前
function beoreOpenChange(item) {
  return new Promise(resolve => {
    ElMessageBox.confirm(`确认${item.isOpen ? '取消设置' : '设置'}为开放素材吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    })
      .then(() => {
        updateWork({
          id: item.id,
          isOpen: item.isOpen === 1 ? 0 : 1,
          bizShow: 1
        })
          .then(res => {
            if (res.code === 0) {
              ElMessage({
                message: '设置成功',
                type: 'success'
              })

              // 调接口，成功后返回true 否则false
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(() => {
            resolve(false)
          })
      })
      .catch(() => {
        resolve(false)
      })
  })
}
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.works_detail {
  .head_info_box {
    display: flex;
    width: 100%;
  }
  .basic_info_box {
    margin-right: 16px;
    padding: 20px 24px 14px;
    width: 50%;
    background: #ffffff;
    border-radius: 4px;
    .title {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .title_right {
        width: 80%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
    .video_detail_box {
      display: flex;
      margin-top: 16px;
      .img_box {
        width: 90px;
        min-width: 90px;
        height: 120px;
        position: relative;
        // background-color: #303133;
        border-radius: 2px;
        overflow: hidden;
        cursor: pointer;
        .play {
          background: rgba(0, 0, 0, 0.2);
          width: 90px;
          height: 120px;
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          img {
            height: 32px;
            width: 32px;
            object-fit: cover;
            display: flex;
          }
        }
        .img {
          width: 100%;
          object-fit: contain;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        .black_img {
          width: 66px;
          height: 66px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .img_box:hover {
        .play {
          opacity: 1;
        }
      }
      .video_img {
        width: 90px;
        height: 120px;
        object-fit: cover;
        border-radius: 2px;
      }
      .detail {
        width: calc(100% - 98px);
        margin-left: 8px;
        .detail_top {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 6px;
          .top_left {
            max-width: calc(100% - 110px);
          }
          .top_right {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-left: 20px;
            :deep(.el-switch) {
              height: 28px;
            }
            :deep(.el-switch__label) {
              position: absolute;
              display: none;
              color: #fff;
            }
            /*打开时文字位置设置*/
            :deep(.el-switch__label--right) {
              z-index: 1;
              right: 20px;
            }
            /*关闭时文字位置设置*/
            :deep(.el-switch__label--left) {
              z-index: 1;
              left: 20px;
            }
            /*显示文字*/
            :deep(.el-switch__label.is-active) {
              display: block;
            }
            :deep(.el-switch .el-switch__core, .el-switch .el-switch__label) {
              width: 72px;
            }
          }
        }
        .video_name {
          // margin-bottom: 6px;
          // height: 22px;
          // font-size: 16px;
          // font-weight: 400;
          // color: #303133;
          // line-height: 22px;
          // display: -webkit-box;
          // word-break: break-all;
          // text-overflow: ellipsis;
          // overflow: hidden;
          // white-space: pre-line;
          // -webkit-box-orient: vertical;
          // -webkit-line-clamp: 1;

          // height: 22px;
          font-size: 16px;
          font-weight: 400;
          color: #303133;
          line-height: 22px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
        }
        .other_info {
          &:last-child {
            margin: 0;
          }
          margin-bottom: 4px;
          height: 17px;
          line-height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          :deep(.file_tag) {
            color: #000;
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
    .tab_list {
      margin: 0;
      padding-top: 4px;
      .tab {
        margin: 8px 8px 0 0;
        color: #606266;

        padding: 1px 8px;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        height: auto;
        background: rgba(0, 0, 0, 0);
        border: 1px solid #dcdee0;
        border-radius: 12px;
      }
    }
  }
  .work_source_box {
    padding: 20px 24px 14px;
    width: 50%;
    background: #ffffff;
    border-radius: 4px;
    .title {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
    }
    .info_box {
      display: flex;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 400;
      align-items: center;
      .label {
        width: 70px;
        height: 20px;
        color: #909399;
        line-height: 20px;
        text-align: right;
      }
      .value {
        margin-left: 12px;
        color: #303133;
        line-height: 20px;
      }
      .head_portrait {
        margin-left: 12px;
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 50%;
      }
    }
  }
  .table_box {
    margin-top: 16px;
    padding: 20px 24px 24px;
    background-color: #fff;
    .title {
      margin-bottom: 22px;
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
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
      width: 40px;
      height: 40px;
      border-radius: 100%;
      margin-right: 6px;
    }
    .user_default_head {
      :deep(.default_photo) {
        width: 40px;
        height: 40px;
        margin-right: 6px;
      }
    }
  }
  .source_box {
    border-radius: 8px;
    overflow: hidden;
    .video {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
    }
  }
}
:deep(.el-dialog) {
  position: fixed;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
}
</style>
