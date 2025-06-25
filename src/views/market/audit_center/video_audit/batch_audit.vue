<template>
  <div>
    <el-dialog v-model="isShow" title="审核" width="400px" style="height: 280px" destroy-on-close>
      <el-radio-group v-model="query.status">
        <el-radio :label="1">审核通过</el-radio>
        <el-radio :label="2">审核不通过</el-radio>
      </el-radio-group>
      <template v-if="query.status == 2">
        <el-form :rules="rules">
          <el-form-item prop="reason">
            <el-input
              v-model="query.remark"
              :rows="1"
              type="textarea"
              resize="none"
              placeholder="请输入审核不通过理由，最多15字"
              style="font-size: 14px"
              :maxlength="15"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isShow = false">取消</el-button>
          <el-button type="primary" @click="updateTask()">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
