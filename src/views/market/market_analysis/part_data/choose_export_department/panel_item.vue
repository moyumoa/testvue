<template>
  <span class="panel_item_wrapper">
    <div class="panel_item">
      <div class="list">
        <div style="width: 100%" v-for="(item, index) in list" :key="index">
          <div
            :class="$data.selectedIndex === index ? 'one_box active' : 'one_box'"
            @click="onSelect(item, index)"
          >
            <el-checkbox
              @click="onChange(item, index)"
              :indeterminate="item.checked === 1"
              :model-value="item.checked === 2"
            ></el-checkbox>
            <p>{{ item.name }}</p>
            <el-icon v-if="item.children && item.children.length">
              <i-arrow-right />
            </el-icon>
          </div>
        </div>

        <div class="no_data_box" v-if="list.length === 0">暂无符合条件的数据</div>
      </div>
    </div>
    <panel-item
      v-if="$data.subList.length"
      :list="$data.subList"
      @change="updateCheck"
    ></panel-item>
  </span>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  list: Array
})
const { list } = toRefs(props)
const emits = defineEmits(['change'])

const $data = reactive({
  selectedIndex: -1,
  subList: []
})

// 选中
const onChange = throttle(function (item, index) {
  item.checked = item.checked ? 0 : 2
  // 全选
  if (item.name === '全部') {
    list.value.forEach(e => {
      e.checked = item.checked
    })
  } else {
    const checkLen = list.value.filter(e => e.id && e.checked)
    if (list.value[0].name === '全部') {
      // 全选
      if (checkLen && checkLen.length === list.value.length - 1) {
        list.value[0].checked = 2
      } else {
        // 取消全选
        list.value[0].checked = 0
      }
    }
  }
  emits('change')
}, 100)

// 点击
function onSelect(item, index) {
  $data.selectedIndex = index
  $data.subList = []
  setTimeout(() => {
    $data.subList = list.value[index].children
  }, 0)
}

function updateCheck() {
  emits('change')
}
</script>

<script>
export default {
  name: 'panelItem'
}
</script>

<style scoped lang="scss">
.panel_item_wrapper {
  display: inline-block;
  height: 388px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}
.panel_item {
  display: inline-block;
  vertical-align: top;
  min-width: 180px;
  height: 100%;
  border-right: 1px solid #eceef5;
  overflow-y: auto;
  &.last-item {
    border-right: none;
  }
  .list {
    width: 100%;
    position: relative;
    padding-top: 8px;
    .one_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      height: 36px;
      line-height: 36px;
      padding: 0 10px;
      margin-bottom: 4px;
      cursor: pointer;
      &.active {
        background: #eff3fd;
      }
      &:hover {
        background: #eff3fd;
      }
      p {
        flex: 1;
        @include mult_line(1);
        margin: 0 5px 0 16px;
        font-size: 14px;
      }
    }
    .one_box + .one_box {
      // border-top: 1px solid #eceef5;
    }
  }
  .no_data_box {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #999;
  }
}
</style>
