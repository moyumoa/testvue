<template>
  <div class="key_cont">
    <div class="rules">
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
        alt=""
        class="rules_img"
      />
      评论视频命中了关键词且不包含负面关键词、发送私信不包含负面关键词、直播中发送弹幕命中了关键词且不包含负面关键词的用户，会被识别为潜客
    </div>
    <div class="top">
      <div class="sel_box" :class="{ hideSetting: chooseKey == 1 }">
        <div class="sel_box_title">关键词组</div>
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
        <el-dropdown
          @command="handleCommand"
          trigger="contextmenu"
          ref="dropdown"
          v-if="chooseKey !== 1"
        >
          <div
            class="select-setting"
            :class="{ 'is-disabled': selectValue.id === '-1' || chooseKey == 1 }"
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
        <exp_button :asyncFunc="exportReportFun">导出</exp_button>
      </div>
      <div class="tips_box">
        <div class="tps_box_button" @click="getLowkeyword">负面关键词管理</div>
        <!-- 潜客甄别规则解读
        <el-popover
          effect="dark"
          content="我们内置了一套行业通用的关键词库，除此之外您也可以对自有词库进行新增。在直播弹幕、视频评论、私信中命中了关键词且不包含负面关键词的用户，会被收录在潜客列表"
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
        </el-popover> -->
      </div>
    </div>

    <div class="key_list">
      <!-- <div class="key_list_button">
        <div
          class="key_list_button_item"
          :class="chooseKey === 1 ? 'choose_item' : ''"
          @click="changeKeyTab(1)"
        >
          系统内置
        </div>
        <div
          class="key_list_button_item"
          :class="chooseKey === 2 ? 'choose_item' : ''"
          @click="changeKeyTab(2)"
        >
          品牌自有
        </div>
      </div> -->
      <div class="list_top">
        <div class="l_top_tips">
          共有
          <span style="color: #364fcd">{{ tableForm.page.total }}</span>
          个高意向关键词
        </div>
        <div class="btns" v-if="chooseKey !== 1">
          <el-button class="add_grouping" type="primary" @click="data.showImport = true">
            批量导入关键词
          </el-button>
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
          @sort-change="sortFun"
          :default-sort="{
            prop: 'hintCnt',
            order: 'descending'
          }"
        >
          <el-table-column label="关键词名称" max-width="180" prop="keyName"></el-table-column>
          <el-table-column label="关键词分组" max-width="150" prop="groupName"></el-table-column>
          <el-table-column
            v-if="chooseKey !== 1"
            label="命中次数"
            max-width="150"
            prop="hintCnt"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            v-if="chooseKey !== 1"
            label="操作"
            min-width="100"
            header-align="right"
            align="right"
          >
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
    <!-- 负面关键词  -->
    <low-key-word
      v-if="lowDialog"
      v-model:lowShow="lowDialog"
      :lowDialog="lowDialog"
    ></low-key-word>
    <!-- 批量导入 -->
    <import-file-dialog
      v-model:show="data.showImport"
      title="批量导入关键词"
      subTitle="批量导入关键词操作流程"
      uploadUrl="/api/scrm/keyword/keywordImport"
      :exportFile="downLoadTemplate"
      :canBatchAddExportFiles="canBatchAddExportFiles"
      :tips="'（注：单次最多导入 100 行）'"
      @uploadSuccess="getList"
    ></import-file-dialog>
  </div>
</template>

<script setup>
import { useKeyword } from '@/views/scrm/customer_management/data/index'
import EditDialog from '@/views/scrm/interactive_messages/intention_screening/components/edit_dialog.vue'
import { ElMessageBox } from 'element-plus'
import { isEmpty, isNotEmpty } from '@/utils/tools.js'
import LowKeyWord from '@/views/scrm/customer_management/dialog/lowKeyWord.vue'
// import { useRoute } from 'vue-router'
import { exportFile } from '@/utils/exportFile'
import importFileDialog from '@/views/market/components/import_file_dialog.vue'
import { resourceTemplate } from '@/api/scrm/customer.js'

const chooseKey = ref(2)
const lowDialog = ref(false)
const {
  selectValue,
  option,
  tableForm,
  getList,
  dialogConfig,
  openEditDialog,
  onConfirm,
  getKeywordGroup,
  deleteKeyword,
  deleteKeywordGroup,
  exportReportFun
} = useKeyword(1, chooseKey.value)
// getList()
// const { query } = useRoute()
// 是否可以点击批量导出
const canBatchAddExportFiles = ref(true)
const data = reactive({
  showImport: false
})
// 获取链路中的参数
gettable()
function gettable() {
  // 正常点击进来显示系统内置  从其他页面跳转过来显示品牌自有
  changeKeyTab(2)
  // if (query.type && query.type === '2') {
  //   changeKeyTab(2)
  // } else {
  //   changeKeyTab(1)
  // }
}
function changeKeyTab(val) {
  console.log(val, 'val')
  selectValue.value = { id: '-1', groupName: '全部' }
  chooseKey.value = val
  tableForm.page.index = 1
  tableForm.queryParam = {}
  tableForm.queryParam = {
    type: chooseKey.value
  }
  getList()
  getKeywordGroup()
}

function changeGroup(item) {
  tableForm.page.index = 1
  tableForm.queryParam = {}
  if (item.id !== '-1') {
    tableForm.queryParam = {
      groupIds: [item.id]
    }
  }
  tableForm.queryParam.type = chooseKey.value
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
  // 系统内置不可删除
  if (selectValue.value.id !== '-1' && chooseKey.value !== 1) {
    dropdown.value.handleOpen()
  }
}

// 获取低意向关键词
function getLowkeyword() {
  lowDialog.value = true
}

// 下载模板
function downLoadTemplate() {
  canBatchAddExportFiles.value = false
  return exportFile(resourceTemplate, {}, '批量导入关键词模板', 'xlsx')
    .then(() => {
      canBatchAddExportFiles.value = true
    })
    .catch(() => {
      canBatchAddExportFiles.value = true
    })
}

// 列表排序
function sortFun(e) {
  console.log(e.prop, e.order)
  if (e.prop === 'hintCnt') {
    if (e.order === 'ascending') {
      tableForm.orderSetting = 'ASC:hint_cnt'
    } else if (e.order === 'descending') {
      tableForm.orderSetting = 'DESC:hint_cnt'
    } else {
      tableForm.orderSetting = ''
    }
  } else {
    tableForm.orderSetting = ''
  }
  getList()
}
</script>

<style lang="scss" scoped>
.key_cont {
  .rules {
    display: flex;
    align-items: center;
    height: 48px;
    background: #eaedfa;
    border-radius: 4px;
    border: 1px solid #889cff;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #323233;
    margin-bottom: 16px;
    .rules_img {
      width: 16px;
      height: 16px;
      min-width: 16px;
      margin-right: 8px;
      margin-left: 16px;
    }
  }
  .top {
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    background-color: #fff;

    .sel_box {
      display: flex;

      .sel_box_title {
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #303133;
        line-height: 32px;
        margin-right: 20px;
      }

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
    .hideSetting {
      :deep(.el-input__inner) {
        border-radius: 4px !important;
      }
    }

    .tips_box {
      font-size: 14px;
      font-weight: 400;
      color: #8f939a;
      display: flex;
      align-items: center;

      .tps_box_button {
        width: 130px;
        height: 32px;
        line-height: 30px;
        border-radius: 4px;
        border: 1px solid #dcdee0;
        cursor: pointer;
        text-align: center;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #303133;
        margin-right: 16px;
      }
    }
  }

  .key_list {
    padding: 16px 24px 20px;
    background-color: #fff;

    .key_list_button {
      display: flex;
      border-bottom: 1px solid #e8e8e8;
      margin-bottom: 16px;
      height: 57px;
      line-height: 57px;
      .key_list_button_item {
        margin-right: 40px;
        cursor: pointer;
        border-bottom: 2px #fff solid;
        box-sizing: border-box;
      }

      .choose_item {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        border-bottom-color: #364fcd;
      }
    }

    .list_top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .l_top_tips {
        height: 32px;
        line-height: 32px;
      }

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
        margin: 0 0 0px 10px;
      }
    }
  }
}
</style>
