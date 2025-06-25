<template>
  <!--  类型主体 四种颜色  蓝 橙 绿 以及 不选中-->
  <img
    v-if="type === 2"
    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/56d10dfd9d2746d8b54413acdbb3bf1a_1686744094050.png"
    alt="blue"
    :class="['entity_icon', `${size}_icon`]"
  />
  <img
    v-if="type === 3"
    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/def2c7cee3b74d15b00c66e0f984393a_1686744149533.png"
    alt="orange"
    :class="['entity_icon', `${size}_icon`]"
  />
  <img
    v-if="type === 4"
    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/abc8c78687c64a5cbba62bb427e72494_1686744173316.png"
    alt="green"
    :class="['entity_icon', `${size}_icon`]"
  />
  <img
    v-if="type === 1"
    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/718695414d324092890156204bd8f977_1685522849733.png"
    alt="none"
    :class="['entity_icon', `${size}_icon`]"
  />
</template>

<script setup>
const props = defineProps({
  type: {
    type: [Number, String],
    default: 1
  },
  size: {
    type: String,
    default: 'default' // large 48px | default 16px| small
  }
})
const { type, size } = toRefs(props)
</script>

<style lang="scss" scoped>
.entity_icon {
  display: inline-flex;
}

.default_icon {
  width: 16px;
  height: 16px;
}

.large_icon {
  width: 48px;
  height: 48px;
}
</style>
