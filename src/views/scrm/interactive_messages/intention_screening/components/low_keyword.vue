<template>
  <div class="key_cont">
    <div class="key_list">
      <div class="list_top">
        <div class="l_top_tips">
          共有
          <span style="color: #364fcd">{{ tableForm.page.total }}</span>
          个负面关键词
        </div>
        <div>
          <el-button
            class="add_grouping"
            type="primary"
            @click="openEditDialog('addKeyword', undefined)"
          >
            + 新增关键词
          </el-button>
        </div>
      </div>
      <div class="table_box">
        <xm_table
          class="pic_table"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
        >
          <el-table-column label="关键词名称" max-width="180" prop="keyName"></el-table-column>
          <el-table-column label="命中次数" max-width="150" prop="hintCnt"></el-table-column>
          <el-table-column label="操作" min-width="100" header-align="right" align="right">
            <template v-slot="{ row }">
              <el-link
                type="primary"
                class="table-btn"
                @click="openEditDialog('updateKeyword', row)"
              >
                编辑
              </el-link>
              <el-link type="primary" class="table-btn" @click="deleteKeyword(row)">删除</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </div>
    <EditDialog
      v-if="dialogConfig.show"
      v-model="dialogConfig.show"
      :config="dialogConfig"
      @confirm="onConfirm"
    ></EditDialog>
  </div>
</template>

<script setup>
import { useKeyword } from '../data'
import EditDialog from './edit_dialog.vue'

const { tableForm, getList, dialogConfig, openEditDialog, onConfirm, deleteKeyword } = useKeyword(2)
getList()
</script>

<style lang="scss" scoped>
.key_cont {
  background-color: #fff;
  border-radius: 4px;

  .key_list {
    padding: 20px 24px;

    .list_top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      .add_grouping {
        width: 119px;
        height: 32px;
        border-radius: 4px;
      }

      .add_grouping2 {
        margin-left: 16px;
      }
    }

    .table_box {
      .table-btn {
        margin: 0 10px;
      }
    }
  }
}
</style>
