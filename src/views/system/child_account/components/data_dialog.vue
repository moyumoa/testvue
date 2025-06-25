<template>
  <el-dialog width="308px" v-model="show" :title="title">
    <template v-if="row.length > 0">
      <div style="max-height: 300px; overflow-y: auto">
        <div class="section" v-for="(item, index) in row" :key="index">
          <!-- <div class="text">部门名称</div> -->
          <div class="msg">{{ item.name }}</div>
        </div>
      </div>
    </template>
    <div v-else style="text-align: center; color: gray">暂无数据</div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    informatData: {
      type: Object
    }
  },
  setup(props) {
    const { show, title, row } = toRefs(props.informatData)
    return {
      show,
      title,
      row
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: 12px;
  .text {
    height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }

  .msg {
    height: 20px;
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    margin-top: 6px;
  }
}
</style>
