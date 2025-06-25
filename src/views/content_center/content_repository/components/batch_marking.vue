<template>
  <div class="batch_marking">
    <el-select
      v-model="selectValue"
      multiple
      filterable
      :filter-method="optionsFilter"
      default-first-option
      :reserve-keyword="false"
      :placeholder="placeholder || '选择标签'"
      remote
      @change="selectChange"
      @focus="focusData"
    >
      <!-- <el-option
        v-if="type !== '批量去标' && newTagName"
        :label="`创建新标签：${newTagName || ''}`"
        value="creat"
        @click="addNewTag"
      ></el-option> -->
      <el-option
        v-for="item in tagList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
  </div>
</template>
<script setup>
import { defineEmits } from 'vue'
import { getTags } from '@/api/content_center/material_library'
import { getSearchLabel } from '@/api/content_center/content_manage.js'

const props = defineProps({
  origin: {
    type: String || Number,
    default: '' // 页面来源：素材库finishProductStore 商品场景库 productScene 商品实拍库的商品标签 productShootByGood  商品实拍库的模特标签 productShootByModel 媒体资源库 mediaResource
  },
  placeholder: String,
  tagType: Number, // 标签type
  useTagType: Boolean, // 根据标签type去请求公共的标签接口
  chooseTags: Array // 回显的标签ID列表
})

const emit = defineEmits(['choseOptions'])
const newTagId = ref('')
const newTagName = ref('')
const origin = toRef(props, 'origin')
const placeholder = toRef(props, 'placeholder')
const tagType = toRef(props, 'tagType')
const useTagType = toRef(props, 'useTagType')
const tagList = ref([])
function init() {
  const creativePromise = useTagType.value
    ? getTags({
        tagType: tagType.value,
        orderSetting: '',
        pageNo: 1,
        pageSize: 1000,
        searchCount: true,
        tagName: '',
        source: 0
      })
    : origin.value === 'finishProductStore'
    ? getSearchLabel({
        orderSetting: '',
        pageNo: 1,
        pageSize: 1000,
        searchCount: true,
        tagName: ''
      })
    : getTags({
        tagType: 1,
        orderSetting: '',
        pageNo: 1,
        pageSize: 1000,
        searchCount: true,
        tagName: '',
        source: 0
      })

  creativePromise
    .then(res => {
      // console.log(res, '获取 标签列表的 res')
      tagList.value = res.data.records
      if (newTagId.value) {
        selectValue.value.push(newTagId.value)
        emit('choseOptions', selectValue.value)
        newTagId.value = ''
      }
      console.log(selectValue.value, 'selectValue.value')
    })
    .catch(err => console.log(err, 'err'))
}
init()
// 批量去标不显示创建
// const type = toRef(props.batchAbout, 'type')

// 已经选择的标签
const selectValue = ref([])
// const tagListBackups = JSON.parse(JSON.stringify(tagList.value))
function selectChange(val) {
  // console.log(val, 'val')
  if (!val) return
  if (val[val.length - 1] === 'creat') {
    selectValue.value = selectValue.value.filter(item => {
      console.log(item !== 'creat', 'cdccd')
      return item !== 'creat'
    })
    console.log(selectValue.value, 'selectValue.value')
    return
  }
  // console.log(selectValue.value, '子组件 selectValue.value')
  // 选择的值传给父组件
  emit('choseOptions', selectValue.value)
  // console.log('触发select change')
  // console.log(selectValue.value)
}
const data = ref([])

function focusData() {
  if (selectValue.value.length === 0) {
    init()
  }
}

function optionsFilter(value) {
  if (!value) {
    init()
    return
  }
  // console.log(value, 'optionsFilter')
  newTagName.value = value
  const str = `S*${value}S*`
  const reg = new RegExp(str, 'i')
  data.value = []
  tagList.value.forEach(item => {
    if (reg.test(item.name)) {
      data.value.push(item)
    }
  })
  console.log(
    data.value.some(item => item.name === value),
    'data.value.some(item => item.name === value)'
  )
  if (data.value.some(item => item.name === value)) newTagName.value = ''
  tagList.value = data.value
}

onMounted(() => {
  if (props.chooseTags && props.chooseTags.length > 0) {
    selectValue.value = JSON.parse(JSON.stringify(props.chooseTags))
  }
})
</script>
<style lang="scss" scoped>
.el-select {
  width: 100%;
}
.el-select__tags {
  max-width: 100%;
}
.create-new {
  margin-top: 10px;
  padding: 0 32px 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 34px;
  line-height: 34px;
  font-size: 16px;
  color: #606266;
  cursor: pointer;
}
.create-new:hover {
  background-color: #f5f7fa;
}
.tips {
  font-size: 14px;
  margin-top: 26px;
  font-weight: 400;
  color: #909399;
}
</style>
