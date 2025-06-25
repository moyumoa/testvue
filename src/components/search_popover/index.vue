<template>
  <div ref="popup" class="popover_page">
    <div class="popover_mask" v-if="visible" @click="visible = false"></div>

    <div class="popover_content">
      <el-button
        :class="{ search_btn: true, blue_search_btn: hasParam }"
        @click.stop="showPopverFun"
      >
        <i class="icon iconfont icon-shaixuan"></i>
        筛选
      </el-button>

      <div class="popver_container" v-show="visible" @click.stop="">
        <div class="popver_head">
          <div class="head_left">筛选</div>
          <div class="head_right" @click="resetFun">重置</div>
        </div>
        <div class="popver_content">
          <slot name="content">
            <xm_search ref="xmSearchRef" :searchComponents="searchComponents"></xm_search>
          </slot>

          <div class="popver_btn">
            <el-button @click="cancelFun">取消</el-button>
            <el-button type="primary" @click="saveFun">完成</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'
import { setBusinessChooseParam } from '@/utils/search.js'
import { throttle, isNotEmpty } from '@/utils/tools'
import { defineProps } from 'vue'
import { getQuery } from '@/utils/get_query'
const props = defineProps({
  searchQuery: Object,
  hasGroup: Boolean,
  hasBusiness: Boolean,
  searchParams: Array
})
const { searchQuery, hasGroup, hasBusiness } = toRefs(props)

const visible = ref(false)
const hasParam = ref(false)
const searchComponents = ref([])
// 显示或隐藏弹出框
function showPopverFun() {
  if (!visible.value) {
    console.log('xxx', props.searchParams, isNotEmpty(props.searchParams), searchComponents.value)
    if (isNotEmpty(props.searchParams)) {
      searchComponents.value = JSON.parse(JSON.stringify(props.searchParams))
      xmSearchRef.value?.initQuery(JSON.parse(JSON.stringify(props.searchParams)))
    } else {
      xmSearchRef.value?.reset()
    }
  }
  nextTick(() => {
    console.log('vvvvvvvv', searchComponents.value)
    visible.value = !visible.value
  })
}
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      searchComponents.value.forEach(item => {
        if (item.filed === 'groupIds') {
          item.selects = res.data || []
        }
      })
    }
  })
}
// 更新业务主体筛选项
const initSearch = function () {
  if (isNotEmpty(props.searchQuery)) {
    searchComponents.value = JSON.parse(JSON.stringify(searchQuery.value))
  }
  if (hasGroup.value) {
    getNewGroupList()
  }
  if (hasBusiness.value) {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
}
initSearch()
const emits = defineEmits(['updateQuery'])
const xmSearchRef = ref()
// 检测对象里的数据是否有值
function hasData(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 确保属性是对象自身的，而不是从原型链继承的
      if (typeof obj[key] !== 'undefined' && obj[key] !== null) {
        // 对于对象和数组，需要进一步检查
        if (typeof obj[key] === 'object') {
          if (hasData(obj[key])) {
            return true // 发现有数据的嵌套对象
          }
        } else {
          // 对于其他数据类型，如字符串、数字等，直接进行检查
          if (obj[key].toString().trim() !== '') {
            return true // 发现有数据的属性
          }
        }
      }
    }
  }
  return false // 没有发现有数据的属性
}
// 完成
const saveFun = throttle(() => {
  const query = getQuery(searchComponents.value)
  console.log('xxxxxxxx111', hasData(query))
  hasParam.value = hasData(query)
  emits('updateQuery', query, searchComponents.value)
  visible.value = false
}, 500)
// 取消
const cancelFun = throttle(() => {
  visible.value = false
}, 500)
// 重置
const resetFun = throttle(() => {
  xmSearchRef.value?.reset()
}, 500)
</script>
<style lang="scss" scoped>
.search_btn {
  margin-left: 16px;
  padding: 8px 14px;
  font-weight: 400;
  font-size: 14px;
  color: #595959;
  line-height: 20px;
  i {
    margin-right: 6px;
    font-size: 16px;
    color: #999;
  }
}
.blue_search_btn {
  border: 1px solid #364fcd;
  color: #364fcd;
  i {
    color: #364fcd;
  }
}
.popover_page {
  position: relative;
  z-index: 2002;
}
.popover_mask {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: transparent;
}
.popver_container {
  z-index: 9;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 4px;
  width: 520px;
  position: absolute;
  right: 0;
  top: 40px;
  padding: 16px 0 16px 20px;
  .popver_head {
    margin-bottom: 16px;
    padding-right: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .head_left {
      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
    }
    .head_right {
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
    }
  }
  .popver_btn {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-right: 20px;
    .el-button {
      width: 74px;
    }
    .el-button + .el-button {
      margin-left: 16px;
    }
  }
}
:deep(.xm_search) {
  padding: 0;
  .search_item {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-right: 20px;
    .item_label {
      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
      margin-bottom: 10px;
    }
  }
  .search_item:nth-child(2n) {
    margin-right: 0;
  }
  .search_item:last-child {
    display: none;
  }
}
</style>
