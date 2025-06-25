<template>
  <div class="select_matrix">
    <el-button class="add_grouping" type="primary" @click="toAddGrouping">
      + 新建矩阵号分组
    </el-button>
    <!-- 搜索框 -->
    <div class="search_wrap prefix_input_un_suffix">
      <el-input
        style="width: 218px"
        v-model.trim="searchValue"
        :prefix-icon="transElIconName('Search')"
        placeholder="请输入分组名/矩阵号/创建人"
        clearable
        @input="getSearch"
      />
    </div>
    <!-- 矩阵列表 -->
    <div class="matrixClass_wrap" v-loading="groupLoading">
      <div class="matrix_all_wrap">
        <!-- <div
          class="matrix_all"
          :class="groupId === matrixTypeData.allType.id ? 'matrix_selected' : ''"
          @click="selectedMatrix(matrixTypeData.allType)"
        >
          <span class="title">
            {{ matrixTypeData.allType.groupName ? matrixTypeData.allType.groupName : '全部矩阵号' }}
          </span>
          <span class="num" v-if="false">
            {{
              matrixTypeData.allType.groupAccountCount
                ? matrixTypeData.allType.groupAccountCount
                : 0
            }}
          </span>
        </div> -->
        <div
          class="matrix_all"
          :class="[
            selectPlatform === item.platform ? 'matrix_selected' : '',
            `matrix_all_${item.platform}`
          ]"
          v-for="(item, index) in matrixTypeData.allType"
          :key="index"
          @click="selectedMatrixV2(item)"
        >
          <div class="title">
            <div
              v-if="item.platform"
              :class="[`xm_platformIcon_${item.platform}_16`]"
              class="plat_icon"
            ></div>
            <span>{{ item.groupName ? item.groupName : '全部矩阵号' }}</span>
          </div>
        </div>
        <span class="line_bot"></span>
      </div>
      <!-- 矩阵号 -->
      <div class="matrixType_wrap matrixType_wrap_sumvideo">
        <div
          class="new_group_item"
          :class="groupId === item.id ? 'matrix_selected' : ''"
          v-for="item in newGroupList"
          :key="item"
        >
          <div class="name" @click="selectedMatrix(item, 2)">
            <el-tooltip
              v-if="item.groupName.length > 7"
              class="box-item"
              effect="dark"
              :content="item.groupName"
              placement="top"
            >
              <div class="line-hidden1" style="max-width: 100%; width: max-content">
                {{ item.groupName }}
              </div>
            </el-tooltip>
            <div v-else class="line-hidden1">{{ item.groupName }}</div>
          </div>
          <div class="num" @click="selectedMatrix(item, 2)"></div>
          <el-dropdown class="ml_16">
            <img src="@/assets/images/content_center/operation.png" alt="" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="rename(item)">重命名</el-dropdown-item>
                <el-dropdown-item @click="modification(item.id)">修改</el-dropdown-item>
                <el-dropdown-item @click="delGroup(item.id)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="matrixType_item">
          <div
            class="type_item"
            v-for="item in matrixTypeData.brandType"
            :key="item.id"
            :class="groupId === item.id ? 'matrix_selected' : ''"
            @click="selectedMatrix(item)"
          >
            <img
              v-if="item.groupValue === 'BRAND'"
              src="@/assets/images/content_center/matrix_typez1.png"
              alt=""
            />
            <img v-else src="@/assets/images/content_center/matrix_typea1.png" alt="" />
            <div>
              <div class="name">{{ item.groupName ? item.groupName : '' }}</div>
              <div class="type">品牌标记</div>
            </div>
          </div>
        </div>
        <div class="matrixType_item">
          <div
            class="type_item"
            v-for="item in matrixTypeData.contentType"
            :key="item.id"
            :class="groupId === item.id ? 'matrix_selected' : ''"
            @click="selectedMatrix(item)"
          >
            <img
              v-if="item.groupValue === 'VIDEO'"
              src="@/assets/images/content_center/matrix_typev1.png"
              alt=""
            />
            <img v-else src="@/assets/images/content_center/matrix_typel1.png" alt="" />
            <div>
              <div class="name">{{ item.groupName ? item.groupName : '' }}</div>
              <div class="type">内容类型</div>
            </div>
          </div>
        </div>
        <div class="matrixType_item">
          <div
            class="type_item"
            v-for="item in matrixTypeData.xuserType"
            :key="item.id"
            :class="groupId === item.id ? 'matrix_selected' : ''"
            @click="selectedMatrix(item)"
          >
            <img :src="getTypeImg(item.groupValue)" alt="" />
            <div>
              <div class="name">
                {{ item.groupName ? item.groupName : '' }}
                <el-tooltip
                  v-if="item.groupValue === 'BATCH_AUTH'"
                  effect="dark"
                  placement="top"
                  content="通过“批量授权”方式授权的矩阵号"
                >
                  <img
                    src="@/assets/images/operate/tip_line.png"
                    style="width: 13px; height: 13px; margin-left: 4px"
                  />
                </el-tooltip>
              </div>
              <span v-if="item.groupValue !== 'BATCH_AUTH'" class="type">矩阵号类型</span>
            </div>
          </div>
        </div>
        <div
          class="none_data"
          v-if="
            !(
              (newGroupList && newGroupList.length > 0) ||
              (matrixTypeData.xuserType && matrixTypeData.xuserType.length > 0) ||
              (matrixTypeData.brandType && matrixTypeData.brandType.length > 0) ||
              (matrixTypeData.contentType && matrixTypeData.contentType.length > 0)
            )
          "
        >
          <img src="@/assets/images/content_center/no_data.png" />
          暂无分组
        </div>
        <!-- <span class="line_bot"></span> -->
      </div>
    </div>
    <!-- 重命名 -->
    <matrixRename
      v-if="dialogFormVisible"
      :dialogFormVisible="dialogFormVisible"
      :groupForm="groupForm"
      @cancel="renameCancel"
      @confirmAmendName="confirmAmendName"
    />
  </div>
</template>

<script setup>
// 图片
import matrixTyped from '@/assets/images/content_center/matrix_typed1.png'
import matrixTypep from '@/assets/images/content_center/matrix_typep1.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer1.png'
import matrixEmployee from '@/assets/images/content_center/matrix_employee.png'
import matrixBatchAuth from '@/assets/images/content_center/matrix_batch_auth.png'

import { throttle, transElIconName, debounce } from '@/utils/tools.js'
import api from '@/api/content_center/content_matrix.js'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

import matrixRename from './matrix_rename.vue'

const props = defineProps({
  origin: {
    type: String,
    default: 'content_center' // content_center内容中台-矩阵管理-矩阵分组 sumvideo智能短视频-矩阵管理
  }
})
const message = inject('$message')
const router = useRouter()
const { origin } = toRefs(props)
const emits = defineEmits(['updateTableInfo'])
const searchValue = ref('') // 搜索矩阵号的呢称
const groupLoading = ref(false) // 分组loading

const selectPlatform = ref('') // 选中筛选项
// 选中id-用于选中样式
const groupId = ref(null)
// 新增的矩阵号分组
const newGroupList = ref([])

// 矩阵号分组
const matrixTypeData = reactive({
  // allType: {}, // 全部矩阵号
  allType: [], // 全部矩阵号-筛选项
  brandType: [], // 品牌矩阵号
  contentType: [], // 内容矩阵号
  notBind: {}, // 未绑定矩阵号
  xuserType: [], // 矩阵号类型
  oldXuseType: []
})

const groupForm = reactive({
  name: '', // 分组名
  id: '' // 分组id
})
const dialogFormVisible = ref(false) // 重命名弹窗

onMounted(() => {
  emits('updateTableInfo', {
    tableState: { loading: true }
  })
  getGroupList()
  getNewGroupList()
})
// 修改
const modification = throttle(function (id) {
  const url =
    origin.value === 'content_center'
      ? '/content_center/content_matrix_group/add_grouping'
      : '/sumwhy_video/matrix_manage/add_grouping'
  router.push({
    path: url,
    query: { id }
  })
}, 500)
// 删除
const delGroup = throttle(function (id) {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '删除分组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
  }).then(async () => {
    const res = await api.delNewGroupList({ groupIds: [id] })
    if (res.success) {
      message({ type: 'success', message: '删除成功' })
      getNewGroupList()
      selectedMatrix(matrixTypeData.allType[0])
    }
  })
}, 500)
// 重命名
const rename = throttle(function (item) {
  groupForm.name = item.groupName
  groupForm.id = item.id
  dialogFormVisible.value = true
}, 500)
function renameCancel() {
  groupForm.name = ''
  groupForm.id = ''
  dialogFormVisible.value = false
}
// 确定重命名分组
const confirmAmendName = throttle(async function (info) {
  const res = await api.saveNewGroup({
    id: info.id ? info.id : null,
    groupName: info.name,
    groupType: 2
  })
  if (res.success) {
    message({ type: 'success', message: '修改成功' })
    dialogFormVisible.value = false
    getNewGroupList()
  }
}, 300)

// 跳转到新建分组页面
const toAddGrouping = throttle(function () {
  const url =
    origin.value === 'content_center'
      ? '/content_center/content_matrix_group/add_grouping'
      : '/sumwhy_video/matrix_manage/add_grouping'
  router.push({
    path: url
  })
}, 500)
// 获取分组
function getNewGroupList(init = false) {
  groupLoading.value = true
  api
    .getNewGroupList({ groupType: searchValue.value ? null : 2, name: searchValue.value || '' })
    .then(res => {
      if (res.success) {
        // 有筛选条件--返回值里带了固定分组，所以要区分开
        if (searchValue.value) {
          const list = res.data.filter(x => x.groupType === 2)
          newGroupList.value = list
          const list2 = res.data.filter(x => x.groupType === 1)
          const newList = []
          matrixTypeData.oldXuseType.forEach(x => {
            list2.forEach(y => {
              if (x.groupValue === y.groupValue) {
                newList.push(x)
              }
            })
          })
          matrixTypeData.xuserType = JSON.parse(JSON.stringify(newList))
          // 右边默认显示第一个对应的列表
          if (list && list.length > 0) {
            const item = list[0]
            selectedMatrix(item, 2)
          } else {
            selectedMatrix2()
          }
        } else {
          matrixTypeData.xuserType = JSON.parse(JSON.stringify(matrixTypeData.oldXuseType))
          newGroupList.value = res.data
          getAll()
        }
      }
    })
    .finally(() => {
      groupLoading.value = false
    })
}
// 获取全部矩阵号
function getAll(type) {
  groupId.value = null
  selectPlatform.value = ''
  const info = {
    tableState: {
      loading: true,
      page: {
        index: 1,
        total: 0
      }
    },
    titleName: '全部矩阵号',
    getTableList: true,
    createUserName: '',
    getTableType: type,
    groupId: null,
    platform: ''
  }
  emits('updateTableInfo', info)
}
// 根据分组名/矩阵号昵称搜索不到分组时，直接就显示用户类型的第一个
function selectedMatrix2(type) {
  if (matrixTypeData.xuserType && matrixTypeData.xuserType.length > 0) {
    // 能够搜索到分组，获取搜索到的分组的第一个
    groupId.value = matrixTypeData.xuserType[0].id
    const info = {
      tableState: {
        loading: true,
        page: {
          index: 1,
          total: 0
        }
      },
      areaId: null,
      createUserName: '',
      titleName: matrixTypeData.xuserType[0].groupName,
      getTableList: true,
      getTableType: type,
      groupId: groupId.value,
      platform: ''
    }
    emits('updateTableInfo', info)
  } else {
    console.log('搜索不到分组，获取全部矩阵号')
    getAll(type)
  }
}
function getPlatformArr() {
  const platformArr = [
    {
      complexType: null,
      groupAccountCount: null,
      groupValue: null,
      groupName: '全部矩阵号',
      id: null,
      platform: ''
    },
    {
      complexType: null,
      groupAccountCount: null,
      groupValue: null,
      groupName: '抖音',
      id: null,
      platform: 1
    },
    {
      complexType: null,
      groupAccountCount: null,
      groupValue: null,
      groupName: '小红书',
      id: null,
      platform: 3
    },
    {
      complexType: null,
      groupAccountCount: null,
      groupValue: null,
      groupName: '快手',
      id: null,
      platform: 4
    },
    {
      complexType: null,
      groupAccountCount: null,
      groupValue: null,
      groupName: '视频号',
      id: null,
      platform: 2
    }
  ]
  return platformArr
}
const getGroupList = () => {
  api.getGroupList().then(res => {
    // matrixTypeData.allType = res.data.all
    matrixTypeData.allType = getPlatformArr()
    matrixTypeData.brandType = res.data.brandType
    matrixTypeData.contentType = res.data.contentType
    matrixTypeData.notBind = res.data.notBind
    matrixTypeData.oldXuseType = JSON.parse(JSON.stringify(res.data.xuserType))
    const xuserType = res.data.xuserType
    xuserType.forEach(x => (x.show = true))
    matrixTypeData.xuserType = xuserType
  })
}
// 搜索分组
const getSearch = debounce(() => {
  emits('updateTableInfo', { tableState: { loading: true } })
  getNewGroupList()
}, 500)

// 筛选
function selectedMatrixV2(item) {
  groupId.value = null
  selectPlatform.value = item.platform
  const info = {
    tableState: {
      page: {
        index: 1,
        total: 0
      }
    },
    areaId: null,
    titleName: item.groupName,
    createUserName: '',
    getTableList: true,
    getTableType: '',
    groupId: null,
    platform: item.platform
  }
  emits('updateTableInfo', info)
}

// 选择分组
function selectedMatrix(item, type) {
  selectPlatform.value = null
  console.log('matrixTypeData.allType', matrixTypeData.allType)
  groupId.value = item.id

  const info = {
    tableState: {
      page: {
        index: 1,
        total: 0
      }
    },
    areaId: null,
    titleName: item.groupName,
    createUserName: type === 2 ? item.createUserName : '',
    getTableList: true,
    getTableType: type,
    groupId: groupId.value
  }
  emits('updateTableInfo', info)
}
// 获取对应类型的图片
function getTypeImg(type) {
  let img = ''
  switch (type) {
    case 'PERSONAL':
      img = matrixTyped
      break
    case 'EAccountM':
      img = matrixTypep
      break
    case 'EAccountS':
      img = matrixTyper
      break
    case 'EAccountK':
      img = matrixTyper
      break
    case 'EAccountEmployeeS':
    case 'EAccountEmployeeK':
      img = matrixEmployee
      break
    case 'BATCH_AUTH':
      img = matrixBatchAuth
      break
  }
  return img
}
</script>

<style lang="scss" scoped>
.select_matrix {
  width: 252px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  border-radius: 4px;
  padding: 20px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .add_grouping {
    width: 216px;
    height: 32px;
  }
  .search_wrap {
    margin-top: 12px;
  }
  :deep(.search_wrap .el-input--suffix .el-input__inner) {
    padding-right: 18px;
    padding-left: 22px;
  }
  :deep(.el-input__prefix) {
    left: 6px;
  }
  :deep(.el-input__suffix) {
    right: 6px;
  }
  .matrixClass_wrap {
    height: calc(100% - 80px);
    width: 100%;
    > .matrix_all_wrap {
      padding: 12px 0;
      position: relative;

      > .matrix_all {
        height: 40px;
        border-radius: 2px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        > .title {
          height: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
          position: relative;
          .plat_icon {
            position: absolute;
            left: -24px;
            top: 50%;
            transform: translateY(-50%);
            &::after {
              width: 16px;
              height: 16px;
            }
          }
        }
        > .num {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
      }
      .matrix_all_1,
      .matrix_all_2,
      .matrix_all_3,
      .matrix_all_4 {
        padding-left: 34px;
      }
    }
    > .matrixType_wrap {
      width: calc(100% + 6px);
      padding: 0;
      position: relative;
      height: 100%;
      // max-height: 640px;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 2px;
      }
      .new_group_item {
        display: flex;
        padding: 0px 12px 0px 0px;
        align-items: center;
        margin: 13px 0;
        width: 230px;
        height: 40px;
        font-size: 0;
        // background-color: pink;
        border-radius: 2px;
        cursor: pointer;

        .name {
          width: 136px;
          height: 100%;
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 40px;
          padding-left: 12px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .num {
          width: 44px;
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          text-align: right;
        }
        img {
          margin-left: 14px;
          width: 16px;
          height: 16px;
        }
      }

      > .matrixType_item {
        // margin-bottom: 16px;
        // &:first-child {
        //   margin-bottom: 16px;
        // }

        > .title {
          height: 17px;
          font-size: 12px;
          font-weight: 500;
          color: #303133;
          line-height: 17px;
          margin-bottom: 8px;
          text-indent: 6px;
        }
        > .type_item {
          // height: 40px;
          width: 220px;
          margin-top: 6px;
          border-radius: 2px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          cursor: pointer;

          img {
            width: 20px;
            height: 20px;
            margin-right: 8px;
            flex-shrink: 0;
          }
          .name {
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: #303133;
            line-height: 20px;
            margin-right: 20px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }
          .type {
            height: 17px;
            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
          }
          > .num {
            flex-grow: 1;
            height: 20px;
            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 20px;
            white-space: nowrap;
            overflow: hidden;
            text-align: right;
          }
        }
      }
    }
    > .matrixType_wrap_sumvideo {
      height: calc(100% - 224px);
    }
    > .matrixOperator_wrap {
      padding: 14px 0px;

      > .title {
        height: 17px;
        font-size: 12px;
        font-weight: 500;
        color: #303133;
        line-height: 17px;
        margin-bottom: 8px;
      }
      .custom-tree-node {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        padding-right: 10px;

        > .name {
          font-size: 14px;
          font-weight: 400;
          color: #303133;
        }
        > .num {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
        }
      }
      > .type_item {
        height: 40px;
        border-radius: 2px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        cursor: pointer;

        > img {
          width: 20px;
          height: 20px;
          margin-right: 4px;
          flex-shrink: 0;
        }
        > .name {
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          margin-right: 20px;
          flex-shrink: 0;
        }
        > .num {
          flex-grow: 1;
          height: 20px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-align: right;
        }
      }
    }
    > .searchType_wrap {
      padding: 12px 0;
      position: relative;

      > .searchType_item {
        height: 40px;
        border-radius: 2px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        background: #e9e9e9;
        > .name {
          height: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
          margin-right: 20px;
          flex-shrink: 0;
        }
        > .num {
          flex-grow: 1;
          height: 20px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-align: right;
        }
      }
    }
    .line_bot {
      position: absolute;
      height: 1px;
      width: calc(100% - 18px);
      background-color: #e8e8e8;
      bottom: 0;
      left: 6px;
    }
    // 选中样式
    .matrix_selected {
      background: #e9e9e9 !important;
    }
  }

  .none_data {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #8f939a;
    line-height: 20px;
    text-align: center;
    img {
      width: 72px;
      height: 52px;
      margin-bottom: 8px;
    }
  }
}
</style>
