<template>
  <div class="page">
    <!-- 查询筛选类型 -->
    <!-- search -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>

    <!-- 查询结果 -->
    <div class="audit_table">
      <el-tabs class="tab_box" v-model="chooseTab" @tab-click="tabChange">
        <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
            </div>
          </template>

          <pane
            :ref="paneRef"
            :tableForm="tableForm"
            :chooseTab="chooseTab"
            @getTableData="getTaskList2"
            @resetTableData="resetSearch"
          ></pane>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { pageList } from './model/get_list'
import pane from './pane.vue'
export default {
  components: { pane },
  setup() {
    sessionStorage.removeItem('KOSAuditPrams')
    const {
      tabList,
      chooseTab,
      searchComponents,
      tableForm,
      isShow,
      audit,
      getTaskList,
      updateTask,
      rules,
      changeTab
    } = pageList()

    const upRef = ref([])
    const paneRef = el => {
      if (el) {
        upRef.value?.push(el)
      }
    }
    function getTaskList2() {
      console.log('getTaskList2')
      clearPaneTableSelect()
      getTaskList()
    }
    // 重置
    function resetSearch() {
      clearPaneTableSelect()
      tableForm.loading = true
      tableForm.page.index = 1
      tableForm.page.size = 10
      getTaskList()
    }
    resetSearch()
    // 查询
    function searchList() {
      clearPaneTableSelect()
      tableForm.loading = true
      tableForm.page.index = 1
      getTaskList()
    }

    function clearPaneTableSelect() {
      if (upRef.value) {
        upRef.value.forEach(x => {
          x.resetTableSelect()
        })
      }
    }
    function tabChange() {
      clearPaneTableSelect()
      resetSearch()
    }
    return {
      getTaskList2,
      upRef,
      paneRef,
      tabChange,
      tabList,
      chooseTab,
      isShow,
      searchComponents,
      tableForm,
      audit,
      resetSearch,
      searchList,
      getTaskList,
      changeTab,
      updateTask,
      rules
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  // 查询筛选类型

  section {
    background: #fff;
    margin: 16px 0;
    padding: 24px;
    font-size: 14px;
    .status {
      display: flex;
      align-items: center;
    }
  }
  //
}

.audit_table {
  padding: 30px 24px;
  background: #fff;
  margin-top: 16px;
  border-radius: 4px;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
    font-family: PingFangSC, PingFang SC;
  }
}
:deep(.el-tabs__content) {
  overflow: visible;
}
</style>
