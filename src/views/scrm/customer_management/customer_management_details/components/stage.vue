<template>
  <div class="stage">
    <div class="title">
      客户阶段
      <span class="inactive" v-if="active < 0">无效</span>
    </div>
    <div class="container">
      <el-steps :active="active" align-center>
        <el-step title="新客户" />
        <el-step title="初步接触" />
        <el-step title="有意向" />
        <el-step title="已到店" />
        <el-step title="已成交" />
      </el-steps>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  step: {
    type: Number,
    default: 0
  }
})
const active = computed({
  get() {
    return props.step > 5 ? -1 : props.step - 1
  }
})

// watch(i)
</script>

<style lang="scss" scoped>
.stage {
  margin-top: 16px;
  background-color: #fff;
  padding-bottom: 1px;

  .title {
    padding: 22px 24px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #dcdee0;

    .inactive {
      margin-left: 12px;
      padding: 0 4px;
      height: 18px;
      background: #ffebeb;
      border-radius: 2px;
      border: 1px solid #df4545;
      font-size: 12px;
      color: #d40000;
      line-height: 18px;
      vertical-align: middle;
      display: inline-block;
      font-weight: 400;
    }
  }

  .container {
    background-color: #f6f7f8;
    margin: 24px;
    padding: 20px 0;

    .el-steps {
      width: 600px;
    }

    :deep(.el-step) {
      .el-step__head {
        .is-text {
          border: unset;
          background-color: #f6f7f8;

          .el-step__icon-inner {
            color: transparent;
            border-radius: 50%;
            background-color: $theme_color;
            width: 9px;
            height: 9px;
          }
        }

        .el-step__line {
          height: 1px;
        }
      }

      .is-finish {
        font-size: 14px;
        font-weight: bold;
        color: #303133;

        .el-step__line {
          background-color: $theme_color;
        }
      }

      .is-process {
        font-size: 14px;
      }

      .is-wait {
        font-size: 14px;

        .is-text {
          border: unset;

          .el-step__icon-inner {
            color: transparent;
            border-radius: 50%;
            background-color: #bfc4cd;
            width: 9px;
            height: 9px;
          }
        }
      }
    }
  }
}
</style>
