<template>
  <div class="xm_table_box">
    <el-table
      v-bind="$attrs"
      ref="table"
      class="xm_table"
      :data="data"
      :height="tableHeight"
      :maxHeight="maxTableHeight"
      :row-key="rowKey"
      :cell-style="cellStyle"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :show-summary="showSummary"
      :summary-method="summaryMethod"
    >
      <el-table-column
        :reserve-selection="true"
        type="selection"
        align="center"
        width="60"
        v-if="showSelection"
        class-name="selection_cell"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="60" align="center" v-if="showIndex">
        <template #default="scope">{{ (pageIndex - 1) * page.size + scope.$index + 1 }}</template>
      </el-table-column>
      <slot></slot>
    </el-table>

    <div class="xm_table_page">
      <div>
        <slot name="audit"></slot>
      </div>
      <el-pagination
        v-if="showPage"
        v-model:current-page="pageIndex"
        background
        :layout="pageLayout"
        :total="page.total"
        :page-size="page.size"
        :page-sizes="pageSizes"
        :pager-count="5"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'xmTable',
  props: {
    rowKey: {
      type: String,
      default: 'id'
    }, // 行数据的Key
    tableType: { type: String, default: 'title' }, // 列表类型 title 标题列表56px; avatar 矩阵号列表70px avatarV2 新更改矩阵号列表 80px ; live直播列表 80px liveV2 新更改直播列表 90px; video 视频列表100px; 旧版样式 default;
    tableHeight: { type: [Number, String], default: null }, // 列表高度
    maxTableHeight: { type: [Number, String], default: null }, // 列表最大高度
    loading: { type: Boolean, default: false }, // loading
    data: { type: Array, default: () => [] }, // 数据源
    select: { type: Array, default: () => [] }, // 已选择的数据，与selection结合使用
    showIndex: { type: Boolean, default: false }, // 是否展示index选择，默认否
    showSelection: { type: Boolean, default: false }, // 是否展示选择框，默认否
    showSummary: { type: Boolean, default: false }, // 是否合计行，默认否
    sumText: { type: String, default: '汇总' }, // 合计行第一列的文本
    summaryMethod: {
      type: Function,
      default: () => {
        return {}
      }
    },
    showPage: { type: Boolean, default: true }, // 是否展示页级组件，默认是
    page: {
      // 分页参数
      type: Object,
      default: () => {
        return { index: 1, size: 10, total: 0 }
      }
    },
    pageLayout: { type: String, default: 'total,sizes, prev, pager, next , jumper' }, // 分页需要显示的东西，默认全部
    pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
    checkSelectable: {
      type: Function,
      default: () => {
        return {}
      }
    } // 是否可以多选
  },
  emits: ['getTableData', 'selection-change', 'sort-change'],
  setup(props, context) {
    const table = ref(null)
    const page = toRef(props, 'page')
    const pageIndex = toRef(page.value, 'index')
    let timer = null
    // 分页相关：监听页码切换事件
    const handleCurrentChange = val => {
      if (timer) {
        page.value.index = 1
      } else {
        page.value.index = val
        context.emit('getTableData')
      }
    }
    // 分页相关：监听单页显示数量切换事件
    const handleSizeChange = val => {
      timer = 'work'
      setTimeout(() => {
        timer = null
      }, 100)
      page.value.size = val
      pageIndex.value = 1
      context.emit('getTableData', true)
    }
    // 选择监听器
    const handleSelectionChange = val => {
      context.emit('selection-change', val)
    }
    const handleSortChange = val => {
      context.emit('sort-change', val)
    }
    const clearSort = () => {
      table.value.clearSort()
    }
    // 回显多选
    watch(
      () => props.data,
      val => {
        setTimeout(() => {
          val.forEach(ele => {
            props.select.forEach(item => {
              if (ele[props.rowKey] === item[props.rowKey]) {
                table.value.toggleRowSelection(ele, true)
              }
            })
          })
        }, 250)
      },
      { immediate: true }
    )
    return {
      table,
      pageIndex,
      handleCurrentChange,
      handleSizeChange,
      handleSelectionChange,
      handleSortChange,
      clearSort
    }
  },
  methods: {
    cellStyle() {
      switch (this.tableType) {
        case 'title':
          return { height: '56px' }
        case 'avatar':
          return { height: '70px' }
        case 'avatarV2':
          return { height: '80px' }
        case 'live':
          return { height: '80px' }
        case 'liveV2':
          return { height: '90px' }
        case 'video':
          return { height: '100px' }
        case 'default':
          return { padding: '12px 14px' }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.xm_table_box {
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: flex-start;
  height: 100%;
  .xm_table {
    flex: 1;
    height: 100%;
  }

  .xm_table_page {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .el-table__cell {
    padding: 20px 10px;
  }
}
:deep(.selection_cell) {
  .cell {
    line-height: 1;
  }
  .el-checkbox {
    height: 22px;
  }
}
:deep(.selection_cell) {
  .cell {
    line-height: 1;
  }
  .el-checkbox {
    height: 22px;
  }
}
</style>
