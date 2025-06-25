<template>
  <div class="produce_steps">
    <div
      class="steps_item"
      :class="{ steps_item_done: item.done }"
      v-for="(item, index) in props.stepList"
      :key="index"
    >
      <div
        class="next_line"
        :class="{ next_line_active: index - 1 < currentSteps }"
        v-if="index !== 0"
      ></div>
      <div class="icon_warp">
        <!-- 当前 + 未完成 -->
        <div
          class="next_index"
          :class="{ current_next: index == currentSteps }"
          v-if="index >= currentSteps"
        >
          {{ index + 1 }}
        </div>
        <!-- 完成 -->
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240328vwopp.png"
          alt=""
          class="icon_active"
          v-else
        />
      </div>

      <div
        class="item_name"
        :class="{ item_name_active: index == currentSteps, item_name_over: index < currentSteps }"
      >
        {{ item.name || '-' }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stepList: {
    type: Array,
    default: () => {
      return [
        {
          name: '步骤一',
          done: false
        },
        {
          name: '步骤二',
          done: false
        },
        {
          name: '步骤三',
          done: false
        },
        {
          name: '步骤四',
          done: false
        }
      ]
    }
  },
  currentSteps: {
    type: Number,
    default: 0
  } // 当前步骤
})
const { currentSteps } = toRefs(props) // 当前步骤

console.log('props.stepList', props.stepList)
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.produce_steps {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  min-height: 52px;
  background: #ffffff;
  border-radius: 4px;
  .steps_item {
    display: flex;
    align-items: center;
    max-width: 258px;
    .icon_warp {
      margin-left: 16px;
      .icon_active {
        width: 18px;
        height: 18px;
      }
      &:first-child {
        margin-left: 0;
      }
      .next_index {
        width: 18px;
        height: 18px;
        background: #bfc4cd;
        border-radius: 50%;
        font-weight: 600;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
        color: #fff;
      }
      .current_next {
        background: #364fcd;
        border-color: #364fcd;
        color: #fff;
      }
    }
    .item_name {
      margin-left: 8px;
      white-space: nowrap;
    }
    .item_name_active {
      color: #303133;
    }
    .item_name_over {
      color: #364fcd;
    }
    .next_line {
      height: 1px;
      width: 160px;
      background: #e8e8e8;
      margin-left: 16px;
    }
    .next_line_active {
      background: #364fcd;
    }
  }
}
</style>
