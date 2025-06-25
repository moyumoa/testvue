<template>
  <!-- table 分矩阵号组信息 -->
  <div>
    <template v-if="showAll">
      <div class="group_list" v-if="groups">
        <el-tooltip
          popper-class="tooltip-class tooltip_group_list"
          placement="top"
          v-for="(item, index) in groups"
          :key="index"
          :content="item"
        >
          <div class="group">
            {{ item || item.groupName }}
          </div>
        </el-tooltip>
      </div>
    </template>
    <template v-else>
      <div class="group_list" v-if="groups">
        <template v-for="(item, index) in groups" :key="index">
          <div class="group" v-if="index < 2">{{ item.groupName }}</div>
        </template>
        <el-tooltip
          v-if="groups && groups.length > 2"
          popper-class="tooltip-class tooltip_group_list"
          placement="right"
        >
          <template #content>
            <div class="group" v-for="(item, index) in groups" :key="index">
              {{ item.groupName }}
            </div>
          </template>
          <div class="more">...</div>
        </el-tooltip>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  groups: Array,
  showAll: {
    type: Boolean,
    default: true // 是否显示全部
  }
})
const { groups, showAll } = toRefs(props)
</script>

<style lang="scss" scoped>
.group_list {
  margin-top: 4px;
  .group {
    display: inline-block;
    padding: 0 8px;
    line-height: 20px;
    background: #dce1f8;
    border-radius: 2px;
    color: #364fcd;
    font-size: 12px;
    margin-right: 8px;
    margin-top: 2px;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }
}
</style>

<style lang="scss">
.tooltip_group_list {
  max-width: 200px;
  padding-top: 5px;
  padding-bottom: 0;
  .group {
    display: inline-block;
    padding: 0 8px;
    margin-bottom: 5px;
    line-height: 20px;
    background: #dce1f8;
    border-radius: 2px;
    color: #364fcd;
    font-size: 12px;
    margin-right: 8px;
  }
}
</style>
