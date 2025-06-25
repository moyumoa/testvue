<template>
  <el-cascader
    :size="props.size"
    v-model="value"
    :props="areaProps"
    :placeholder="props.placeholder"
    @change="onChange"
  ></el-cascader>
</template>

<script setup>
import { areaList } from '@vant/area-data'

const { province_list: provinceList, county_list: countyList, city_list: cityList } = areaList

const props = defineProps({
  modelValue: [Number, String, Array, Object],
  // 显示列数，3-省市区，2-省市，1-省
  columnsNum: {
    type: [Number, String],
    default: 3
  },
  size: {
    type: String,
    default: 'default' // large / default / small
  },
  props: Object,
  placeholder: {
    type: String,
    default: '请选择'
  }
})
const emit = defineEmits(['update:modelValue', 'change'])
const { columnsNum } = toRefs(props)

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const areaProps = {
  lazy: true,
  // todo 三级直辖市回显有问题 暂时没有解决
  lazyLoad(node, resolve) {
    const { level, data } = node
    // console.log(node)
    let resultList = []
    // 第一列 省
    if (level === 0) {
      resultList = Object.keys(provinceList).map(item => ({
        value: provinceList[item],
        code: item,
        // value: item,
        label: provinceList[item],
        leaf: +columnsNum.value === 1
      }))
      // console.log('level1', resultList)
    }
    // 第二列 市
    if (level === 1) {
      const code = data.code.substring(0, 2)
      resultList = Object.keys(cityList)
        .filter(item => code === item.substring(0, 2))
        .map(item => ({
          value: cityList[item],
          code: item,
          // value: item,
          label: cityList[item],
          leaf: +columnsNum.value <= 2
        }))
      // console.log('level2', code, resultList)
    }
    // 第三列 区
    if (level === 2) {
      resultList = cityList
      const code = data.code.substring(0, 4)
      resultList = Object.keys(countyList)
        .filter(item => code === item.substring(0, 4))
        .map(item => ({
          value: countyList[item],
          code: item,
          // value: item,
          label: countyList[item],
          leaf: true
        }))
      // console.log('level3', code, resultList)
    }
    resolve(resultList)
  },
  ...props.props
}

function onChange() {
  emit('change', ...arguments)
}
</script>

<style lang="scss" scoped></style>
