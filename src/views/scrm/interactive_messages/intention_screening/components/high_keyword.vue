<template>
  <div class="key_cont">
    <div class="top">
      <div class="sel_box">
        <el-select
          v-model="selectValue"
          style="width: 200px"
          @change="changeGroup"
          value-key="id"
          class="select-group"
        >
          <el-option key="-1" :value="{ id: '-1', groupName: '全部' }" label="全部"></el-option>
          <el-option
            v-for="item in option"
            :key="item.id"
            :value="item"
            :label="item.groupName"
          ></el-option>
        </el-select>
        <el-dropdown @command="handleCommand" trigger="contextmenu" ref="dropdown">
          <div
            class="select-setting"
            :class="{ 'is-disabled': selectValue.id === '-1' }"
            @click="onClick"
          >
            <el-icon class="el-icon--setting" color="#909399">
              <i-setting />
            </el-icon>
            <el-icon color="#909399">
              <i-arrow-down />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑分组名称</el-dropdown-item>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="tips_box">
        关键词筛选规则解读
        <el-popover
          effect="dark"
          content="当用户发送内容命中高意向关键词且不包含负面关键词，才可被识别为潜在高意向"
          :width="292"
          placement="bottom-start"
          popper-style="tip_popper"
        >
          <template #reference>
            <img
              style="width: 16px; height: 16px; background-color: #fff; margin-left: 4px"
              src="https://tagvv-1256030678.file.myqcloud.com/20221128i71r1.png"
            />
          </template>
        </el-popover>
      </div>
    </div>

    <div class="key_list">
      <div class="list_top">
        <div class="l_top_tips">
          共有
          <span style="color: #364fcd">{{ tableForm.page.total }}</span>
          个高意向关键词
        </div>
        <div class="btns">
          <el-button
            class="add_grouping"
            type="primary"
            @click="openEditDialog('addKeyword', undefined)"
          >
            + 新增关键词
          </el-button>
          <el-button
            class="add_grouping add_grouping2"
            type="primary"
            @click="openEditDialog('addKeywordGroup', undefined)"
          >
            + 新增关键词组
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
          <el-table-column label="关键词分组" max-width="150" prop="groupName"></el-table-column>
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
import EditDialog from '@/views/scrm/interactive_messages/intention_screening/components/edit_dialog.vue'
import { ElMessageBox } from 'element-plus'
import { isEmpty, isNotEmpty } from '@/utils/tools.js'

const {
  selectValue,
  option,
  tableForm,
  getList,
  dialogConfig,
  openEditDialog,
  onConfirm,
  deleteKeyword,
  deleteKeywordGroup
} = useKeyword(1)
getList()

function changeGroup(item) {
  tableForm.page.index = 1
  tableForm.queryParam = {}
  if (item.id !== '-1') {
    tableForm.queryParam = {
      groupIds: [item.id]
    }
  }

  getList()
}

function handleCommand(command) {
  if (isEmpty(command)) return
  if (command === 'edit') {
    openEditDialog('updateKeywordGroup')
    return
  }
  const message = isNotEmpty(tableForm.listData)
    ? '该关键词组下还有关键词存在，删除后也会一并删除'
    : '确定删除'
  ElMessageBox.confirm(message, '删除关键词组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteKeywordGroup()
    })
    .catch(() => {})
}

const dropdown = ref(null)

function onClick() {
  if (selectValue.value.id !== '-1') {
    dropdown.value.handleOpen()
  }
}
</script>

<style lang="scss" scoped>
.key_cont {
  background-color: #fff;
  border-radius: 4px;

  .top {
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dcdee0;

    .sel_box {
      display: flex;

      .select-group {
        z-index: 1;
      }

      :deep(.el-input__inner) {
        border-radius: 4px 0 0 4px;
      }

      .el-dropdown {
        .select-setting {
          box-sizing: border-box;
          line-height: 32px;
          width: 60px;
          height: 32px;
          border: 1px solid #dcdfe6;
          border-radius: 0 4px 4px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -1px;
          //z-index: 0;
        }

        .is-disabled {
          cursor: not-allowed;
        }
      }

      .el-icon--setting {
        margin-right: 10px;
      }
    }

    .tips_box {
      font-size: 14px;
      font-weight: 400;
      color: #8f939a;
      display: flex;
      align-items: center;
    }
  }

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
