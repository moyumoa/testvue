<template>
  <div class="poi_box">
    <div class="poi_name" v-if="disabled">
      {{ isNotEmpty(poiInfo) ? poiInfo.poiName : '请输入需要挂载POI位置名称' }}
    </div>
    <el-select
      v-else
      popper-class="poi_select"
      :style="{ width: '100%' }"
      v-model="poiInfo"
      filterable
      remote
      clearable
      :remote-method="getList"
      :disabled="disabled"
      placeholder="请输入需要挂载POI位置名称"
      value-key="poi"
      :fit-input-width="true"
      :loading="poiLoading"
    >
      <el-option v-for="item in poiList" :key="item.poi" :label="item.poiName" :value="item">
        <div class="one_options">
          <div class="option_name">{{ item.poiName || '' }}</div>
          <div class="option_addr" v-if="type === 'xhs'">
            {{ item.subname }}
          </div>
          <div class="option_addr" v-else>
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.simpleAddr }}
          </div>
        </div>
      </el-option>
    </el-select>
  </div>
</template>
<script setup>
import { poiLocation, xhsLocation } from '@/api/market/store'

import { isNotEmpty } from '@/utils/tools'

const props = defineProps({
  type: {
    type: String,
    default: 'xhs'
  },
  disabled: Boolean,
  list: Array, // 默认的POI列表
  PoiInfo: Object
})
const { type, disabled } = toRefs(props)
const poiInfo = ref({}) // 设置的POI信息
const poiList = ref([]) // 获取的POI列表
const emits = defineEmits(['update:PoiInfo'])
watch(
  () => poiInfo.value,
  val => {
    emits('update:PoiInfo', val)
  },
  {
    deep: true
  }
)

onMounted(() => {
  // 因为有些POI根据选中的名字是无法搜索到的，所以这种况下回显就需要自己拼凑
  // if (isNotEmpty(props.list)) {
  //   poiList.value = JSON.parse(JSON.stringify(props.list))
  // } else {
  //   getList()
  // }
  if (isNotEmpty(props.PoiInfo)) {
    poiInfo.value = JSON.parse(JSON.stringify(props.PoiInfo))
    poiList.value = [poiInfo.value]
  }
})
const poiLoading = ref(false)
function getList(name) {
  if (name) {
    poiLoading.value = true
    const locationPromise =
      type.value === 'xhs'
        ? xhsLocation({
            keyword: name || ''
          })
        : poiLocation({
            keyword: name || ''
          })
    locationPromise
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data || []
          poiList.value = list.map(item => {
            if (type.value === 'xhs') {
              return {
                poi: item.poiOid,
                poiName: item.name,
                subname: item.subname,
                source: item.source
              }
            } else {
              const {
                simplePoiInfo: { addressInfo, poiId, poiName }
              } = item
              return {
                poi: poiId,
                poiName,
                storeName: poiName,
                province: addressInfo.province,
                city: addressInfo.city,
                district: addressInfo.district,
                simpleAddr: addressInfo.simpleAddr,
                cityCode: addressInfo.cityCode
              }
            }
          })
        } else {
          poiList.value = []
        }
        poiLoading.value = false
      })
      .catch(() => {
        poiList.value = []
        poiLoading.value = false
      })
  }
}
</script>
<style lang="scss" scoped>
.poi_name {
  line-height: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: not-allowed;
  border: 1px solid #e4e7ed;
  padding: 0 31px 0 11px;
  background: #f5f7fa;
  color: #c0c4cc;
  @include mult_line(1);
}
</style>
