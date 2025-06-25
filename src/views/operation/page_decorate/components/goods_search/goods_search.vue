<template>
  <div class="">
    <!-- <template v-if="props.componentData.position == 'normal'"> -->
    <div class="good_search">
      <div
        :class="{
          search_box: true
        }"
        :style="{
          height: props.componentData.height + 'px',
          lineHeight: props.componentData.height + 'px',
          textAlign: props.componentData.textAlign,
          borderRadius:
            props.componentData.searchStyle == 'circle' ? props.componentData.height + 'px' : '2px'
        }"
      >
        <el-icon><i-search /></el-icon>
        搜索商品
      </div>
    </div>
    <!-- </template>
    <template v-else>
      <el-affix :offset="196">
        <div class="good_search">
          <div
            :class="{
              search_box: true
            }"
            :style="{
              height: props.componentData.height + 'px',
              lineHeight: props.componentData.height + 'px',
              textAlign: props.componentData.textAlign,
              borderRadius:
                props.componentData.searchStyle == 'circle'
                  ? props.componentData.height + 'px'
                  : '2px'
            }"
          >
            <el-icon><i-search /></el-icon>
            搜索商品
          </div>
        </div>
      </el-affix>
    </template> -->
  </div>
</template>

<script setup>
const props = defineProps({
  componentData: {
    type: Object
  }
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.good_search {
  width: 100%;
  padding: 5px 16px;
  background: #f6f8fa;
  .search_box {
    width: 100%;
    color: #c0c4cc;
    background: #fff;
    padding: 0 12px;
  }
  .search_square {
    border-radius: 2px;
  }
  :deep(.el-icon) {
    top: 1.5px;
  }
}
</style>
