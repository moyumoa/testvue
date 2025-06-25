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
      <el-button style="margin-bottom: 16px" type="primary" @click="addGroupFun">
        新增分组
      </el-button>
      <xm_table
        ref="table"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="120" label="商品分组">
          <template #default="scope">
            {{ scope.row.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="商品数">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.productCount || 0) }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="售卖中">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.inSale || 0) }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="已下架">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.offSale || 0) }}
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="分组状态">
          <template #default="scope">
            <div class="status_content">
              <div :class="'status_circle ' + statusList.get(scope.row.hide || 0).class"></div>
              <div>{{ statusList.get(scope.row.hide || 0).label }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="170">
          <template #header>
            <div class="table_head">
              分组排序
              <el-tooltip effect="dark" placement="top">
                <template #content>数值越小排序越靠前</template>

                <img src="@/assets/images/content_center/tip_gray.png" alt="" />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <div class="num_box" v-if="!scope.row.isEdit">
              {{ scope.row.goodsSort1 || 0 }}
              <img
                @click="scope.row.isEdit = true"
                src="@/assets/images/content_center/edit.png"
                alt=""
              />
            </div>
            <div v-else>
              <el-input class="green_btn" v-model.number="scope.row.goodsSort1" type="text">
                <template #append>
                  <el-button
                    @click="changeGroup(scope.$index)"
                    :icon="transElIconName('Select')"
                  ></el-button>
                </template>
              </el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="200"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <div class="table_btn">
              <el-link
                class="one_btn"
                v-if="scope.row.hide == 1"
                type="primary"
                @click="hideGroup(scope.row.id, 0)"
              >
                取消隐藏
              </el-link>
              <el-link class="one_btn" v-else type="primary" @click="hideGroup(scope.row.id, 1)">
                隐藏
              </el-link>
              <el-link class="one_btn" type="primary" @click="editGroup(scope.row)">编辑</el-link>
              <el-link class="one_btn" type="danger" @click="delGroup(scope.row.id)">删除</el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <el-dialog
      destroy-on-close
      ref="dialog"
      v-model="modal.show"
      title="新增分组"
      width="500px"
      custom-class="hide_footer_line"
    >
      <div class="dialog_content">
        <div class="content_label">分组名称</div>
        <div class="content_content">
          <el-input
            v-model.trim="modal.text"
            maxlength="4"
            @blur="retEmit($event)"
            placeholder="请输入分组名称"
            type="text"
          ></el-input>
          <div class="error_text">{{ modal.errorText || ' ' }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="modal.loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { addGroup } from '@/api/content_center/good_store.js'
import { updateGroup } from '@/api/content_center/good_group.js'
import { wanSliceFormat, transElIconName, throttle } from '@/utils/tools.js'

import { pageList } from './model/get_list.js'
const { searchComponents, statusList, tableForm, getList } = pageList()

const message = inject('$message')
const $confirm = inject('$confirm')

// 修改排序
const changeGroup = throttle(function (index) {
  const regE = /^[1-9]\d*$/g
  if (regE.test(tableForm.listData[index].goodsSort1)) {
    if (parseInt(tableForm.listData[index].goodsSort1) <= tableForm.page.total) {
      // 请求接口
      updateGroup({
        id: tableForm.listData[index].id,
        goodsSort: tableForm.listData[index].goodsSort1
      }).then(res => {
        tableForm.listData[index].isEdit = false
        message.success('设置成功')
        getList()
      })
    } else {
      message.warning('只能输入1到' + tableForm.page.total + '的正整数')
    }
  } else {
    tableForm.listData[index].goodsSort1 = tableForm.listData[index].goodsSort
    message.warning('只能输入1到' + tableForm.page.total + '的正整数')
  }
}, 300)
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
// 隐藏分组
const hideGroup = throttle(function (id, hide) {
  updateGroup({
    id: id,
    hide: hide
  }).then(res => {
    message.success('设置成功')
    getList()
  })
}, 300)
const dialog = ref(null) // ==$refs.dialog
const modal = reactive({
  show: false,
  text: '',
  errorText: '',
  id: null,
  loading: false
})
// 新增分组
function addGroupFun() {
  modal.text = ''
  modal.loading = false
  modal.errorText = ''
  modal.id = null
  modal.show = true
}
// 弹窗-取消
function closeDialog() {
  dialog.value.handleClose()
}
// 弹窗-确定
function handleConfirm() {
  if (modal.text.length > 0) {
    modal.errorText = ''
    modal.loading = true
    if (modal.id == null) {
      // 请求接口
      addGroup({
        name: modal.text
      })
        .then(res => {
          if (res.code === 0) {
            message.success('新建分组成功')
            modal.text = ''
            dialog.value.handleClose()
            resetSearch()
          }
          modal.loading = false
        })
        .catch(() => {
          modal.loading = false
        })
    } else {
      // 请求接口
      updateGroup({
        id: modal.id,
        name: modal.text
      })
        .then(res => {
          if (res.code === 0) {
            message.success('编辑分组成功')
            modal.text = ''
            dialog.value.handleClose()
            getList()
          }
          modal.loading = false
        })
        .catch(() => {
          modal.loading = false
        })
    }
  } else {
    modal.errorText = '请输入分组名称'
  }
}
// 检查是否有表情包
function retEmit(e, name) {
  const val = e.target.value
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  modal.text = val.replace(reg, '')

  if (modal.text.length > 0) {
    modal.errorText = ''
  } else {
    modal.errorText = '请输入分组名称'
  }
}
// 编辑分组
const editGroup = throttle(e => {
  modal.text = e.name
  modal.loading = false
  modal.errorText = ''
  modal.id = e.id
  modal.show = true
})
// 删除分组
const delGroup = throttle(id => {
  $confirm({
    title: '系统提醒',
    content: '删除分组后不可恢复，是否确认删除？',
    success() {
      updateGroup({
        id: id,
        status: -1
      }).then(res => {
        message.success('删除成功')
        getList()
      })
    }
  })
})
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.table_box {
  border-radius: $content_radius;
  margin-top: $content_margin;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
}
.table_head {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  img {
    margin-left: 6px;
    width: 16px;
    height: 16px;
    display: flex;
  }
}
.num_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 32px;
  img {
    width: 16px;
    height: 16px;
    margin-left: 5px;
    cursor: pointer;
  }
}
.green_btn {
  width: max-content;

  :deep(.el-input__inner) {
    width: 80px;
  }
  :deep(.el-input-group__append) {
    background: none;
    padding: 0 12px;
  }
  :deep(.el-icon) {
    color: #87d661;
  }
}
.dialog_content {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_label {
    width: 70px;
    padding-right: 14px;
    text-align: right;
    line-height: 32px;
  }
  .content_content {
    width: 292px;
    .error_text {
      color: var(--el-color-danger);
      font-size: 12px;
      line-height: 1;
      padding-top: 4px;
    }
  }
}
</style>
