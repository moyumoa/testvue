<template>
  <el-dialog v-model="dialogVisible" :title="title" width="30%">
    <span>This is a message</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleClose">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
// import { ref, watchEffect } from 'vue'
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    showModal: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:showModal'],
  setup(props, { emit }) {
    const dialogVisible = ref(false)
    watchEffect(() => {
      dialogVisible.value = props.showModal
    })
    function handleClose() {
      emit('update:showModal', false)
    }
    return {
      handleClose,
      dialogVisible
    }
  }
}
</script>

<style lang="scss"></style>
