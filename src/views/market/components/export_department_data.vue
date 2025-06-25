<template>
  <el-dialog width="960px" v-model="showDialog" title="导出部门数据" @closed="close">
    <div class="dialog_content" v-loading="data.loading">
      <div class="search_group">
        <div class="search_item">
          <label class="item_label">日期筛选</label>
          <div class="item_content">
            <el-date-picker
              v-model="data.filterDate"
              type="daterange"
              unlink-panels
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :editable="false"
              :disabled-date="time => time.getTime() > Date.now()"
              @change="onChangeDate"
            ></el-date-picker>
          </div>
        </div>
      </div>
      <div class="department_wrapper">
        <div class="choose_block">
          <div class="block_title">组织结构</div>
          <div class="cascader_wrapper">
            <el-cascader-panel
              ref="cascaderRef"
              v-model="data.searchInfo.orgIds"
              @change="onChangeOrg"
              :options="data.options"
              :props="data.cascaderProps"
            />
          </div>
        </div>
        <div class="result_block">
          <div class="block_title">已勾选组织结构</div>
          <div class="checked_list">
            <div class="checked_item" v-for="(item, index) in data.checkedList" :key="index">
              <span class="name">{{ item.name }}</span>
              <div class="close" @click="deleteDep(item, index)">
                <el-icon color="#f56c6c" size="20">
                  <i-close-bold />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="export-dialog-footer">
        <el-checkbox v-model="data.isSendIm" label="是否发送文件导出完成通知" />
        <div>
          <el-button @click="close">取消</el-button>
          <!-- <async_button type="primary" :asyncFunc="confirm">确认导出</async_button> -->
          <exp_button type="primary" :asyncFunc="confirm">确认导出</exp_button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
// 该组件暂时未查到使用记录，但先保留 23.12.27
import { getOrganization, exportDepartmentData } from '@/api/market/operate_analysis.js'
import { dateFormat } from '@/utils/tools.js'
import { exportFile } from '@/utils/exportFile'

const props = defineProps({
  showDialog: Boolean
})
const { showDialog } = toRefs(props)

const message = inject('$message')
const emits = defineEmits(['update:showDialog'])

const cascaderRef = ref(null)
const data = reactive({
  filterDate: [],
  cascaderProps: {
    multiple: true,
    checkStrictly: true,
    label: 'name',
    value: 'id',
    emitPath: false
  },
  loading: false,
  options: [],
  checkedList: [],
  searchInfo: {
    columns: [
      {
        columnCode: '',
        columnName: ''
      }
    ],
    startTime: '',
    endTime: '',
    orgIds: []
  }, // 筛选条件
  // 存全选的数据
  checkedAll: [],
  // 存全选的数据的id，用来快速过滤
  checkedAllIds: [],
  isSendIm: false
})

watch(
  () => data.searchInfo.orgIds.length,
  value => {
    for (const i in data.checkedAll) {
      const all = data.checkedAll[i]
      all.list.forEach(item => {
        // 缓存中全选的子级有没被选中的 - 取消选中
        let _ids = JSON.parse(JSON.stringify(data.searchInfo.orgIds))
        if (!_ids.includes(item.id)) {
          _ids = _ids.filter(id => id !== all.id)
          data.searchInfo.orgIds = _ids
          data.checkedAll.splice(i, 1)
          data.checkedAllIds.splice(i, 1)
        }
      })
    }
  }
)

function close() {
  emits('update:showDialog', false)
}

// 修改组织架构
function onChangeOrg(value) {
  const checkedNodes = cascaderRef.value.getCheckedNodes()
  let _checkedList = [] // 选中的节点
  // 选中的“全部”id
  const _checkedAllIds = []
  checkedNodes.forEach(e => {
    if (e.label === '全部') {
      _checkedAllIds.push(e.data.id)
    }
  })
  checkedNodes.forEach(item => {
    // 全选
    // chang后"全部"数量大于缓存中的数量才走全选逻辑
    if (item.label === '全部' && _checkedAllIds.length > data.checkedAllIds.length) {
      // 存“全部”勾选的数据
      if (!data.checkedAllIds.includes(item.data.id)) {
        data.checkedAll.push(item.data)
        data.checkedAllIds.push(item.data.id)
      }
      const ids = []
      // 将要全选的子级选中
      item.data.list.forEach(e => {
        // 已经选中的过滤
        if (!data.searchInfo.orgIds.includes(e.id)) {
          ids.push(e.id)
          _checkedList.push({
            name: e.name,
            id: e.id
          })
        }
      })
      data.searchInfo.orgIds = data.searchInfo.orgIds.concat(ids)
    } else {
      _checkedList.push({
        name: item.label,
        id: item.value
      })
    }
  })

  // 取消全选 - 比对存的“全部”id和change之后的全部id
  if (data.checkedAll.length) {
    for (const i in data.checkedAll) {
      const item = data.checkedAll[i]
      if (!_checkedAllIds.includes(item.id)) {
        const notCheckIds = item.list.map(e => e.id)
        data.searchInfo.orgIds = data.searchInfo.orgIds.filter(id => !notCheckIds.includes(id))
        _checkedList = _checkedList.filter(e => !notCheckIds.includes(e.id))
        data.checkedAll.splice(i, 1)
        data.checkedAllIds.splice(i, 1)
      }
    }
  }

  data.checkedList = _checkedList.filter(e => e.name !== '全部')
}

// 修改时间
function onChangeDate(e) {
  data.searchInfo.startTime = dateFormat(e[0]) + ' 00:00:00'
  data.searchInfo.endTime = dateFormat(e[1]) + ' 23:59:59'
}

// 删除
function deleteDep(item, index) {
  data.searchInfo.orgIds = data.searchInfo.orgIds.filter(e => {
    if (item.id === e) {
      data.checkedList.splice(index, 1)
    }
    return item.id !== e
  })
}

// 获取全部组织结构树
function _getOrganization() {
  data.loading = true
  getOrganization()
    .then(res => {
      transData(res.data, 1)
      data.options = res.data
    })
    .finally(() => {
      data.loading = false
    })
}

function transData(list) {
  list.forEach(item => {
    if (item.children && item.children.length) {
      item.children.unshift({
        name: '全部',
        id: 'all' + Math.random(),
        // 把子级项存入全部中
        list: item.children
      })
      transData(item.children)
    }
  })
}

function confirm() {
  console.log('导出数据参数', data.searchInfo)
  return new Promise((resolve, reject) => {
    if (!data.checkedList.length) {
      reject(new Error())
      return message.warning('请选择组织结构')
    }
    const param = JSON.parse(JSON.stringify(data.searchInfo))
    param.isSendIm = data.isSendIm ? 1 : 0
    param.orgIds = param.orgIds.filter(e => !e.includes('all'))
    return exportFile(exportDepartmentData, param, '部门数据', 'xlsx').finally(() => {
      close()
      resolve()
    })
  })
}

onMounted(() => {
  const MONTH = 1000 * 60 * 60 * 24 * 7
  const NOW = new Date().getTime()
  data.filterDate = [new Date(NOW - MONTH), new Date()]
  onChangeDate(data.filterDate)
  _getOrganization()
})
</script>

<style lang="scss" scoped>
.dialog_content {
  .search_group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .search_item {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #303133;
      margin-bottom: 16px;
      margin-right: 24px;
      .item_label {
        flex-shrink: 0;
        margin-right: 14px;
        text-align: right;
      }
      .item_content {
        flex-shrink: 0;
        .el-input {
          width: 230px;
        }
      }
      .el-select__tags {
        padding-left: 6px !important;
      }
    }
  }
  .department_wrapper {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    display: flex;
    .block_title {
      font-size: 16px;
      line-height: 42px;
      padding-left: 12px;
      border-bottom: 1px solid #e4e7ed;
    }
    .choose_block {
      flex: 1;
      overflow-x: auto;
      border-right: 1px solid #e4e7ed;
      .cascader_wrapper {
        width: 100%;
        overflow-x: auto;
      }
    }
    .result_block {
      width: 200px;
      flex-shrink: 0;
      .checked_list {
        overflow-y: auto;
        height: 300px;
        .checked_item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          line-height: 36px;
          border-bottom: 1px solid #e4e7ed;
          &:last-of-type {
            border-bottom: none;
          }
          .name {
            @include mult_line(1);
          }
          .close {
            cursor: pointer;
          }
        }
      }
    }
  }
}

:deep .el-cascader-panel.is-bordered {
  border: none;
  height: 300px;
}
:deep .el-cascader-menu:last-child {
  border-right: 1px solid #e4e7ed;
}
:deep .el-cascader-menu__wrap.el-scrollbar__wrap {
  height: 300px;
}
</style>

<style lang="scss">
.export-dialog-footer {
  display: flex;
  justify-content: space-between;
  padding-left: 25px;
}
</style>
