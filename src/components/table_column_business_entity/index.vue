<template>
  <div v-if="list && list.length > 0">
    <el-tooltip effect="dark" placement="right">
      <template #content>
        <div style="max-width: 300px">
          {{ list.join('/') }}
        </div>
      </template>
      <div class="businessEntity_tag_box">
        <div
          :class="['one_tag', list.length > 1 ? 'max_tag' : '']"
          v-for="(item, index) in list"
          :key="index"
        >
          {{ item }}
        </div>
      </div>
    </el-tooltip>
  </div>
</template>
<script setup>
const props = defineProps({
  list: {
    type: Array,
    default() {
      return []
    }
  }
})
const { list } = toRefs(props)
</script>
<style lang="scss" scoped>
// 业务主体tag
.businessEntity_tag_box {
  display: flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  .one_tag {
    // max-width: 100px;
    max-width: 100%;
    @include mult_line(1);
    margin-top: 6px;
    margin-right: 4px;
    font-weight: 400;
    font-size: 12px;
    color: #364fcd;
    line-height: 18px;
    padding: 0 4px;
    border-radius: 3px;
    border: 1px solid rgba(54, 79, 205, 0.4);
  }
  .max_tag {
    width: max-content;
    max-width: 80px !important;
  }
}
</style>
