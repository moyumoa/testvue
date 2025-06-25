<template>
  <div class="select_poi_input">
    <div
      :class="['platform_icon', `xm_platformIcon_${info.platform}_${info.iconWidth}`]"
      v-if="info.showIcon"
    ></div>
    <el-select
      popper-class="poi_select"
      :disabled="disabled"
      :style="{ width: '490px' }"
      v-model="$data.selectInfo"
      filterable
      remote
      remote-show-suffix
      clearable
      value-key="poi"
      :remote-method="_getPOIList"
      placeholder="请输入关键词搜索POI位置"
      @change="onSelectPOI($event)"
    >
      <el-option
        v-for="item in $data.POIListAllInfo"
        :key="item.poi"
        :label="item.poiName"
        :value="item"
      >
        <div class="one_options" v-if="info.platform == 1">
          <div class="option_name">{{ item.poiName || '' }}</div>
          <div class="option_addr">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.simpleAddr }}
          </div>
        </div>
        <div class="one_options" v-if="info.platform == 2">
          <div class="option_name">{{ item.poiName || '' }}</div>
          <div class="option_addr">
            {{ item.subname }}
          </div>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script setup>
import { poiLocation, xhsLocation } from '@/api/market/store'
import { isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        showIcon: false,
        platform: 1,
        iconWidth: 20
      }
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  selectPOiInfo: {
    type: Object, // 回显选中
    default: () => {
      return {}
    }
  }
})

const { info, disabled, selectPOiInfo } = toRefs(props)
const emits = defineEmits(['select'])
const $data = reactive({
  selectInfo: null, // 选择的
  poiLoading: false,
  POIListAllInfo: [] // 用于返回
})
// 获取抖音poi位置
function getDy(name) {
  poiLocation({
    keyword: name || ''
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const list = res.data || []
        $data.POIListAllInfo = list.map(item => {
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
        })
      } else {
        $data.POIListAllInfo = []
      }
      $data.poiLoading = false
    })
    .catch(() => {
      $data.POIListAllInfo = []

      $data.poiLoading = false
    })
}
// 获取小红书poi位置
function getXhs(name) {
  xhsLocation({
    keyword: name || ''
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const list = res.data || []
        $data.POIListAllInfo = list.map(item => {
          return {
            poi: item.poiOid,
            poiName: item.name,
            subname: item.subname,
            source: item.source
          }
        })
      } else {
        $data.POIListAllInfo = []
      }
      $data.poiLoading = false
    })
    .catch(() => {
      $data.POIListAllInfo = []

      $data.poiLoading = false
    })
}
// 获取POI列表
function _getPOIList(name) {
  if (name) {
    $data.poiLoading = true
    if (info.value.platform === 2) {
      getXhs(name)
    } else {
      getDy(name)
    }
  }
}
function onSelectPOI() {
  emits('select', info.value.platform, $data.selectInfo)
}
onMounted(() => {
  if (isNotEmpty(selectPOiInfo.value)) {
    const list = []
    if (info.value.platform === 1) {
      const backPoi = {
        poi: selectPOiInfo.value.poi,
        poiName: selectPOiInfo.value.poiName
      }
      list.push(backPoi)
    }
    if (info.value.platform === 2) {
      const backPoi = {
        poi: selectPOiInfo.value.poi,
        poiName: selectPOiInfo.value.poiName,
        subname: selectPOiInfo.value.subname,
        source: selectPOiInfo.value.source
      }
      list.push(backPoi)
    }
    $data.POIListAllInfo = list
    $data.selectInfo = selectPOiInfo.value
  }
})
</script>

<style lang="scss" scoped>
.select_poi_input {
  position: relative;
  padding-left: 28px;
  .platform_icon {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}
</style>
