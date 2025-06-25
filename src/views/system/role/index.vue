<template>
  <div class="role_wrapper">
    <div class="g_bw">
      <el-button type="primary" @click="handleAdd">创建角色</el-button>
    </div>
    <xm_table
      showIndex
      v-loading="loading"
      :data="listData"
      v-model:page="page"
      @getTableData="getList"
    >
      <el-table-column label="角色名称" prop="roleName" show-overflow-tooltip />
      <el-table-column label="关联用户数" prop="relateUser" />
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column label="操作" width="200" align="right" fixed="right">
        <template #default="{ row }">
          <template v-if="row.roleLevel !== 2">
            <el-link type="primary" @click="rename(row)">重命名</el-link>
            <el-link type="primary" @click="linkTo(row.roleId, row.roleName)" class="ml_16">
              权限配置
            </el-link>
            <!-- v-if="row.relateUser === 0" -->
            <el-popconfirm
              title="删除后，将无法选择此角色，是否删除？"
              @confirm="delRole(row.roleId, row.relateUser)"
            >
              <template #reference>
                <el-link type="danger" class="ml_16">删除</el-link>
              </template>
            </el-popconfirm>
          </template>
          <template v-else>
            <el-link type="primary" @click="linkTo(0, row.roleName)">查看权限</el-link>
          </template>
        </template>
      </el-table-column>
    </xm_table>
    <el-dialog
      v-model="visible"
      custom-class="role_dialog"
      :title="title"
      :close-on-click-modal="false"
      width="400px"
    >
      <div class="input_wrapper">
        <span>角色名称</span>
        <el-input
          v-model="roleName"
          placeholder="请输入角色名称"
          style="width: 260px"
          maxlength="20"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="confirm" :disabled="!roleName">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useList } from './model/use_list'

const { state, getList, delRole, rename, handleAdd, confirm, linkTo } = useList()
const { loading, listData, page, visible, roleName, title } = toRefs(state)

onMounted(getList)
</script>

<style lang="scss">
.role_wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 22px 24px;
}
.input_wrapper {
  > span {
    font-size: 14px;
    color: #333333;
    line-height: 20px;
    margin-right: 14px;
  }
}

.role_dialog {
  .el-dialog__header {
    border-bottom: 0;
  }
  .el-dialog__footer {
    border-top: 0;
  }
}
</style>
