<template>
  <el-dialog
    v-model="show"
    title="账号列表"
    width="876px"
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
      <xm_table
        v-loading="tableInfo.loading"
        :data="tableInfo.listData"
        v-model:page="tableInfo.page"
        @getTableData="getList"
        :pageSizes="[5, 10, 20, 50, 100]"
        class="pic_table"
        row-key="id"
        showSelection
        :select="list"
        @select="onSelect"
        @select-all="onSelectAll"
        max-height="400px"
      >
        <el-table-column label="账号" prop="name">
          <template #default="{ row }">
            <div class="photo_wrapper">
              <img :src="row.phone" />
              <div class="info">
                <p>{{ row.name }}</p>
                <p class="fans">抖音号：{{ row.douyinNum || '-' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="粉丝数" align="center">
          <template #default="{ row }">
            {{ wanSliceFormat(row.fllowCount || 0) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="视频数" width="180" align="center">
          <template #default="{ row }">
            {{ wanSliceFormat(row.videoCount || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="播放数" width="180" align="center">
          <template #default="{ row }">
            {{ wanSliceFormat(row.openCount || 0) }}
          </template>
        </el-table-column> -->
      </xm_table>
    </div>
    <template #footer>
      <div class="dialog_footer">
        <div class="footer_left">已选{{ checkedList.length }}个账号</div>
        <div class="footer_right">
          <el-button @click="videoClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { getAppBrandUserList } from '@/api/operation/diy.js'

import { wanSliceFormat } from '@/utils/tools.js'
const props = defineProps({
  visible: { type: Boolean, default: false },
  list: { type: Array, default: () => [] }
})
const emits = defineEmits(['select', 'update:visible'])
const show = toRef(props, 'visible')
const checkedList = ref([])

// 查询的信息
const searchComponents = ref([
  {
    type: 'input',
    label: '账号昵称',
    val: '',
    placeholder: '请输入账号昵称',
    filed: 'nickName'
  }
  // {
  //   type: 'select',
  //   label: '排序',
  //   placeholder: '请选择排序',
  //   filed: 'sort',
  //   selects: [
  //     {
  //       label: '粉丝数',
  //       value: 0
  //     },
  //     {
  //       label: '视频数',
  //       value: 1
  //     },
  //     {
  //       label: '播放数',
  //       value: 2
  //     }
  //   ],
  //   val: ''
  // }
])
// 表格的查询条件
const tableInfo = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

function getList() {
  tableInfo.loading = true
  const params = {
    pageNumber: tableInfo.page.index,
    pageSize: tableInfo.page.size,
    nickName: searchComponents.value[0].val
  }
  getAppBrandUserList(params).then(res => {
    tableInfo.loading = false
    tableInfo.listData = res.data.records
    tableInfo.page.total = res.data.total
  })
}
// 重置
function resetSearch() {
  tableInfo.page = {
    index: 1,
    size: 10,
    total: 0
  }
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableInfo.page.index = 1
  getList()
}
// 关闭弹窗--确定
function handleConfirm() {
  // 通过账号 获取视频
  emits('select', checkedList.value)
  videoClose()
}
const videoClose = () => {
  emits('update:visible', false)
}

// 选择账号
const onSelect = (selection, row) => {
  const index = selection.findIndex(i => i.id === row.id)
  if (index === -1) {
    checkedList.value.splice(
      checkedList.value.findIndex(i => i.id === row.id),
      1
    )
  } else {
    checkedList.value.push(row)
  }
}
const onSelectAll = selection => {
  const result = []
  tableInfo.listData.forEach(ele => {
    const index = selection.findIndex(i => ele.id === i.id)
    result.push(index !== -1)
  })
  tableInfo.listData.forEach(ele => {
    const index = checkedList.value.findIndex(i => ele.id === i.id)
    // 是否全选
    if (result.indexOf(false) !== -1) {
      if (index !== -1) {
        for (let i = checkedList.value.length - 1; i >= 0; i--) {
          if (ele.id === checkedList.value[i].id) {
            checkedList.value.splice(i, 1)
          }
        }
      }
    } else {
      if (index === -1) {
        checkedList.value.push(ele)
      }
    }
  })
}
watch(
  () => props.list,
  val => {
    if (val) {
      checkedList.value = JSON.parse(JSON.stringify(val))
    }
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.xm_search {
  padding: 0;
  :deep(.search_item) {
    margin-right: 0px !important;
    &:last-child {
      justify-content: flex-end;
      flex-basis: 190px;
    }
  }
}
.photo_wrapper {
  display: flex;
  align-items: center;
  > img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  > .info {
    margin-left: 10px;
    .fans {
      font-size: 12px;
      color: #909399;
    }
  }
}
.dialog_footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 24px;
}
</style>
