<template>
  <div class="page">
    <div class="search_box">
      <div class="search_item">
        <label class="item_label">商品名</label>
        <div class="item_content">
          <el-input
            @blur="retEmit($event)"
            v-model.trim="tableForm.name"
            placeholder="请输入商品名"
            clearable
          />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">商品分组</label>
        <div class="item_content">
          <el-select v-model="tableForm.groupsId" placeholder="请选择商品分组">
            <el-option
              v-for="(item, index) in groupsList"
              :key="index"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="search_item" style="justify-content: flex-end; width: 170px">
        <el-button type="primary" @click="searchList">查询</el-button>
        <el-button @click="resetList">重置</el-button>
      </div>
    </div>

    <xm_table
      class="pic_table"
      max-height="400"
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      v-model:page="tableForm.page"
      @getTableData="getList"
    >
      <el-table-column label="商品名称">
        <template #default="scope">
          <div class="good_box">
            <div class="good_img_box">
              <img v-if="scope.row.img" :src="scope.row.img" class="good_img" />
              <img
                class="good_img"
                v-else
                src="@/assets/images/content_center/default_cover.png"
                alt=""
              />
              <img
                v-if="scope.row.featured == 1"
                class="selected_img"
                src="@/assets/images/content_center/selected.png"
                alt=""
              />
            </div>
            <div class="good_content">
              <div class="content_text line-hidden1">
                {{ scope.row.name || '--' }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column width="140" label="分组">
        <template #default="scope">
          <template v-if="scope.row.groupList">
            <div class="table_group">
              <div class="one_group" v-for="(item, index) in scope.row.groupList" :key="index">
                {{ item.name }}
              </div>
            </div>
          </template>

          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column width="130" label="价格">
        <template #default="scope">
          <div v-if="scope.row.showPrice == 1">
            ￥{{ scope.row.discountPrice ? changeTwoDecimal(scope.row.discountPrice) : '0.00' }}
          </div>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column width="170" label="创建时间">
        <template #default="scope">
          <div>{{ scope.row.gmtCreate || '--' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" header-align="center">
        <template #default="scope">
          <div class="table_btn">
            <el-link type="primary" class="one_btn" @click="chooseFun(scope.row)">选择</el-link>
          </div>
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import { selectSimpleList, selectList } from '@/api/content_center/good_store.js'

import { throttle, changeTwoDecimal } from '@/utils/tools.js'
const tableForm = reactive({
  loading: false,
  name: '',
  groupsId: -1,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const groupsList = ref([
  {
    id: -1,
    name: '全部'
  }
])
// 获取商品分组
function getGroupList() {
  selectSimpleList().then(res => {
    if (res.code === 0) {
      const list = res.data || []
      list.unshift({
        id: -1,
        name: '全部'
      })
      groupsList.value = list
    }
  })
}
getGroupList()

// 查询
const searchList = throttle(() => {
  tableForm.page.index = 1
  tableForm.loading = true
  getList()
}, 300)
// 重置
const resetList = throttle(() => {
  tableForm.name = ''
  tableForm.groupsId = -1
  tableForm.page.index = 1
  tableForm.page.size = 10
  tableForm.loading = true
  getList()
}, 300)
resetList()
function getList() {
  const data = {
    groupsId: tableForm.groupsId === -1 ? null : tableForm.groupsId,
    name: tableForm.name,
    status: 0,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  }
  selectList(data)
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

const emits = defineEmits(['upPage'])
// 选择页面
const chooseFun = throttle(e => {
  const data = {
    type: 'goods',
    name: 'goods',
    label: `【商品】：${e.name}`,
    url: `${e.productIdStr}`
  }
  emits('upPage', data)
}, 300)

// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  tableForm.name = e.target.value.replace(reg, '')
}
</script>
<style lang="scss" scoped>
@import '@/views/operation/page_decorate/components/scss/decorate.scss';
.search_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0 20px;
  .search_item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .item_label {
      margin-right: 14px;
      text-align: right;
    }
  }
}

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
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    line-height: 20px;
  }
}
</style>
