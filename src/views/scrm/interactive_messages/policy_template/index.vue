<template>
  <div class="table_page">
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main">
      <div class="page_btns">
        <el-button type="primary" @click="toCreate">新建模板</el-button>
      </div>
      <div class="table" v-loading="listLoading">
        <div class="table_list">
          <div class="table_item" v-for="(item, index) in $data.list" :key="index">
            <!-- 系统内置 -->
            <div class="built_in" v-if="item.type == 1">
              <div class="built_text">系统内置</div>
            </div>
            <div class="name" v-if="item.type !== 1">{{ item.templateName }}</div>
            <div class="name" v-else>{{ '高意向关键词' }}</div>

            <div class="desc" v-if="item.type !== 1">{{ item.templateDesc }}</div>
            <div class="desc default_desc" v-else>
              <span
                v-for="(itemKey, indexKey) in item.template[0].auto_reply_options[0]
                  .auto_reply_keywords"
                :key="indexKey"
              >
                {{ itemKey + ' ' }}
              </span>
            </div>

            <div class="action" v-if="item.type !== 1">
              <div class="del" @click="deleteRule(item)">删除</div>
              <div class="line"></div>
              <div class="edit" @click="toEdit(item)">编辑</div>
            </div>
            <!-- 默认模板只能查看 -->
            <div class="action default_action" v-if="item.type == 1">
              <div class="del" @click="lookRule(item)">查看</div>
            </div>
          </div>
        </div>
        <el-empty description="暂无模板" v-if="!listLoading && !$data.list.length" />
      </div>
    </div>
  </div>
</template>

<script setup>
import tableList from '@/utils/com_composition/table_list.js'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPolicyList, savePolicyDetail } from '@/api/scrm/policy'
import { getQuery } from '@/utils/get_query'

const router = useRouter()
const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '模板查询',
      val: '',
      filed: 'templateName',
      placeholder: '请输入模板名称'
    }
  ],
  list: []
})

function getList() {
  const param = getQuery($data.searchComponents)
  param.templateType = 1
  return getPolicyList(param).then(res => {
    $data.list = res.data
    console.log('$data.list', $data.list[0])
  })
}
const { listLoading, getTableList, searchList, resetSearch } = tableList(getList)

function toCreate() {
  router.push('/scrm/policy_template/create')
}

function deleteRule(item) {
  ElMessageBox.confirm(`确认删除模板【${item.templateName}】？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    savePolicyDetail({
      id: item.id,
      isDel: 1
    }).then(() => {
      ElMessage.success('删除成功')
      getTableList()
    })
  })
}

function toEdit(item) {
  router.push({
    path: '/scrm/policy_template/create',
    query: { id: item.id }
  })
}

function lookRule(item) {
  // 查看
  console.log('查看默认模板item', item)
  router.push({
    path: '/scrm/policy_template/create',
    query: { id: item.id, type: 'look' }
  })
}

onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped>
.table_page {
  // background-color: #fff;
  .page_main {
    margin-top: 16px;
    padding-bottom: 24px;
    color: #303133;
    font-size: 14px;
    .table {
      .table_list {
        display: flex;
        flex-wrap: wrap;
        .table_item {
          width: 188px;
          height: 172px;
          padding: 12px 12px 6px 12px;
          margin-right: 16px;
          margin-bottom: 16px;
          background: #f6f8fa;
          border-radius: 4px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          .built_in {
            position: absolute;
            top: 0;
            right: 0;
            color: #fff;
            text-align: center;
            width: 90px;
            height: 90px;
            transform: rotate(45deg);
            .built_text {
              background-color: rgba(56, 101, 243, 0.85);
              height: 20px;
              line-height: 20px;
              font-size: 12px;
            }
          }
          .name {
            @include mult_line(2);
            line-height: 20px;
          }
          .desc {
            @include mult_line(4);
            line-height: 17px;
            height: 68px;
            margin-top: 8px;
            font-size: 12px;
            color: #606266;
          }
          .default_action {
            border-top: 1px solid #dcdee0;
          }
          .default_desc {
            height: 86px;
            -webkit-line-clamp: 5;
          }
          .action {
            display: flex;
            align-items: center;
            justify-content: center;
            .del,
            .edit {
              cursor: pointer;
              line-height: 32px;
              color: #364fcd;
              padding: 6px 4px;
            }
            .line {
              width: 1px;
              height: 12px;
              margin: 0 4px;
              background: #c0c4cc;
            }
          }
        }
      }
    }
  }
  .xm_table_page {
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
  }
}
</style>
