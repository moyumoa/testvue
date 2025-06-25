<template>
  <div>
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 表格 -->
    <div class="table_box">
      <div class="xm_promptAboveTheTable">
        本页显示品牌商品聚合数据，通过抖店商品【货号】聚合数据，多个抖店商品货号相同则聚合为同一商品
      </div>
      <xm_table
        ref="table"
        tableType="live"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="220" label="商品信息">
          <template #default="scope">
            <div class="good_box">
              <div class="good_img_box">
                <el-image class="good_img" :src="scope.row.img" alt>
                  <template #error>
                    <div class="good_img errImg_box"></div>
                  </template>
                </el-image>
              </div>
              <div class="good_content">
                <div class="content_text line-hidden2">
                  {{ scope.row.title || '--' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" label="价格">
          <template #default="scope">
            ￥{{ changeTwoDecimal(scope.row.minPrice || 0, false) }} ~ ￥{{
              changeTwoDecimal(scope.row.maxPrice || 0, false)
            }}
          </template>
        </el-table-column>
        <el-table-column min-width="200" label="货号">
          <template #default="scope">
            <template v-if="scope.row.productIdJson && scope.row.productIdJson.length > 0">
              <div class="">
                <div class="" v-for="(item, index) in scope.row.productIdJson" :key="index">
                  {{ item.productId }}
                </div>
              </div>
            </template>

            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="180" label="商品分组">
          <template #default="scope">
            <template v-if="scope.row.productGroups && scope.row.productGroups.length > 0">
              <div class="table_group">
                <template v-for="(item, index) in scope.row.productGroups">
                  <div class="one_group" v-if="item.groupName" :key="index">
                    {{ item.groupName || '--' }}
                  </div>
                </template>
              </div>
            </template>

            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="180" label="店铺">
          <template #default="scope">
            <template v-if="scope.row.productShops && scope.row.productShops.length > 0">
              <div class="">
                <div class="" v-for="(item, index) in scope.row.productShops" :key="index">
                  {{ item.shopName }}
                </div>
              </div>
            </template>

            <div v-else>--</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { changeTwoDecimal } from '@/utils/tools'
import { polymerization } from '@/api/content_center/good_aggregate.js'
// import { selectSimpleList } from '@/api/content_center/good_store.js'
import { getQuery } from '@/utils/get_query.js'

// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '商品名称',
    val: '',
    placeholder: '请输入商品名称',
    filed: 'title'
  },
  // {
  //   type: 'select',
  //   label: '商品分组',
  //   val: -1,
  //   defaultVal: -1,
  //   placeholder: '请选择商品分组',
  //   filed: 'groupIds',
  //   selectDefultName: ['id', 'name'],
  //   selects: [
  //     {
  //       id: -1,
  //       name: '全部'
  //     }
  //   ]
  // },
  {
    type: 'input',
    label: '货号',
    val: '',
    placeholder: '请输入货号',
    filed: 'productId'
  }
  // {
  //   type: 'dateRange', // 组件类型
  //   label: '创建时间', // label展示
  //   val: '', // 响应式绑定
  //   disabledDate(time) {
  //     return time.getTime() > Date.now()
  //   }, // 禁用日期
  //   isDisEdit: true, // 是否禁用文本框输入
  //   placeholder: ['开始时间', '结束时间'],
  //   filed: 'dateRange' // 查询字段名
  // }
])
// // 获取商品分组
// function getGroupList() {
//   selectSimpleList().then(res => {
//     if (res.code === 0) {
//       const list = res.data || []
//       list.unshift({
//         id: -1,
//         name: '全部'
//       })
//       searchComponents.value[1].selects = list
//     }
//   })
// }
// getGroupList()
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
function getList() {
  const data = getQuery(searchComponents.value)
  data.searchCount = true
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size
  polymerization(data)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.table_box {
  border-radius: $content_radius;
  margin-top: $content_margin;
  width: 100%;
  background: #fff;
  padding: 22px 24px;

  .good_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .good_img_box {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
    }
    .good_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .selected_img {
      position: absolute;
      left: 0;
      top: 0;
      width: 28px;
      height: 14px;
      display: flex;
    }
    .good_content {
      max-width: calc(100% - 70px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      // height: 60px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      line-height: 20px;
    }
  }
}
</style>
