<template>
  <el-dialog
    :model-value="props.empowerRecords.show"
    title="权限记录"
    width="802px"
    custom-class="hide_footer_line"
    :before-close="close"
  >
    <div class="content">
      <xm_search v-if="props.empowerRecords.showSearch">
        <div class="search_item">
          <label class="item_label">权限类型</label>
          <div class="item_content">
            <el-select
              v-model="searchForm.authType"
              placeholder="请选择权限类型"
              clearable
              style="width: 100%"
              @change="getList"
            >
              <el-option
                v-for="item in selectList"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              />
            </el-select>
          </div>
        </div>
      </xm_search>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        :pageSizes="[5, 10, 20, 50]"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="权限类型" v-if="props.empowerRecords.showSearch">
          <template #default="scope">
            {{ getType(scope.row.authType) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="变更类型">
          <template #default="scope">
            <!-- 高级数据权限 和 线索数据权限显示 开启/关闭 其余显示授权/失效 -->
            <div v-if="[8, 6, 3, 2].includes(scope.row.authType)">
              {{
                scope.row.changeType == 0
                  ? '关闭'
                  : scope.row.changeType == 1
                  ? '开启'
                  : null || '-'
              }}
            </div>
            <div v-else>
              {{
                scope.row.changeType == 0
                  ? '失效'
                  : scope.row.changeType == 1
                  ? '授权'
                  : null || '-'
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="变更时间">
          <template #default="scope">
            {{ scope.row.authChangeDateTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="失效原因">
          <template #default="scope">
            <span v-if="scope.row.changeType == 1">-</span>
            <span v-else>
              {{ getReason(scope.row.authChangeCause) || '-' }}
            </span>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </el-dialog>
</template>

<script setup>
import { getAccountAuthRecord } from '@/api/system_setting/authorization'
import { useStore } from 'vuex'

const props = defineProps({
  empowerRecords: {
    type: Object,
    default: () => {
      return {
        show: false
      }
    }
  },
  platform: Number
})
const { empowerRecords, platform } = toRefs(props)
const emits = defineEmits(['close'])
const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
const systemVersion = computed(() => store.state.user.systemVersion)

const selectList =
  systemVersion.value === 3
    ? [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音开放平台',
          value: 1
        },
        // {
        //   label: '百应数据权限',
        //   value: 2
        // },
        {
          label: '线索数据权限',
          value: 6
        },
        {
          label: '高级数据权限',
          value: 8
        }
        // {
        //   label: '发布能力权限',
        //   value: 3
        // }
      ]
    : [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音开放平台',
          value: 1
        },
        {
          label: '高级数据权限',
          value: 8
        }
        // {
        //   label: '发布能力权限',
        //   value: 3
        // }
      ]
const searchForm = reactive({
  authType: -1
})
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 5,
    total: 0
  }
})
// 关闭弹窗
const close = () => {
  emits('close')
}
// 获取列表
function getList() {
  tableForm.loading = true
  const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
  const params = {
    brandId: brandInfo.brandId,
    openId: empowerRecords.value.openId,
    // orderBy: '',     // 授权时间倒序排列// 排序,示例值(（1）DESC:a,b,c;ASC:d,e （2）DESC:a;ASC:b,DESC:c,d)
    pageNumber: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  }
  if (empowerRecords.value.showSearch)
    params.authType = searchForm.authType === -1 ? null : searchForm.authType

  getAccountAuthRecord(params)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
    })
    .finally(() => {
      tableForm.loading = false
    })
}
getList()
// 匹配授权类型
function getType(type) {
  if (!type) return type
  const obj = {
    1: '抖音开放平台',
    // 2: '百应数据权限',
    // 3: '发布能力权限',
    4: '微信',
    5: '小红书',
    6: '线索数据权限',
    8: '高级数据权限'
  }
  return obj[type] || null
}
// 匹配失效原因
function getReason(reason) {
  if (!reason) return reason
  const obj = {
    1: '后台手动解除',
    2: '自动过期',
    3: '矩阵号接入余额不足',
    4: 'APP主动解除',
    5: '用户禁用自动解除',
    6: '该用户授权矩阵号数量超出限制',
    7: '机构号授权失效',
    8: '视频号与机构号合作到期',
    9: '星力值不足'
  }
  if (reason === 8 && platform.value === 1) {
    return '抖音号与机构号合作到期'
  }
  return obj[reason] || null
}
</script>

<style scoped lang="scss">
.content {
  .tip {
    font-size: 18px;
    padding-bottom: 22px;
  }
  .xm_search {
    padding: unset;
  }
  .search_item {
    margin-left: 14px;
  }
  :deep(.el-table__body-wrapper) {
    max-height: 428px;
    overflow-y: auto;
  }
  :deep(.xm_table_page) {
    padding-bottom: 20px;
  }
}
</style>
