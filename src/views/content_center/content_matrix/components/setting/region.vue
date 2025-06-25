<template>
  <div class="conditionPage">
    <div
      :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'"
      style="align-items: flex-start"
    >
      <div class="conditionTitle" style="line-height: 21px; margin-top: 6px">地区:</div>
      <div style="width: 88%">
        <div
          class="regionBox"
          :style="form.isShowAll ? 'height:auto' : 'height:215px;overflow:hidden'"
        >
          <!-- 华北地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkNorthChinaAll"
              :indeterminate="isIndeterminateNorthChina"
              @change="checkAllNorthChina"
              style="margin-right: 20px"
            >
              华北地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedNorthChinaCities" @change="checkedNorthChina">
              <el-checkbox v-for="city in form.northChinaRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 东北地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkNortheastAll"
              :indeterminate="isIndeterminateNortheast"
              @change="checkAllNortheast"
              style="margin-right: 20px"
            >
              华北地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedNortheastCities" @change="checkedNortheast">
              <el-checkbox v-for="city in form.northeastRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 华东地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkEastChinaAll"
              :indeterminate="isIndeterminateEastChina"
              @change="checkAllEastChina"
              style="margin-right: 20px"
            >
              华东地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedEastChinaCities" @change="checkedEastChina">
              <el-checkbox v-for="city in form.eastChinaRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 华中地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkCentralChinaAll"
              :indeterminate="isIndeterminateCentralChina"
              @change="checkAllCentralChina"
              style="margin-right: 20px"
            >
              华中地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedCentralChinaCities" @change="checkedCentralChina">
              <el-checkbox v-for="city in form.centralChinaRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 华南地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkSouthChinaAll"
              :indeterminate="isIndeterminateSouthChina"
              @change="checkAllSouthChina"
              style="margin-right: 20px"
            >
              华南地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedSouthChinaCities" @change="checkedSouthChina">
              <el-checkbox v-for="city in form.southChinaRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 西南地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkSouthwestAll"
              :indeterminate="isIndeterminateSouthwest"
              @change="checkAllSouthwest"
              style="margin-right: 20px"
            >
              西南地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedSouthwestCities" @change="checkedSouthwest">
              <el-checkbox v-for="city in form.southwestRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 西北地区 -->
          <div style="display: flex; margin-bottom: 13px">
            <el-checkbox
              v-model="checkNorthwestAll"
              :indeterminate="isIndeterminateNorthwest"
              @change="checkAllNorthwest"
              style="margin-right: 20px"
            >
              西北地区
            </el-checkbox>
            <el-checkbox-group v-model="checkedNorthwestCities" @change="checkedNorthwest">
              <el-checkbox v-for="city in form.northwestRegion" :key="city" :label="city">
                {{ city }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="showAllBox">
          <div v-if="!form.isShowAll" class="down" @click="form.isShowAll = true">展开</div>
          <div v-else class="up" @click="form.isShowAll = false">收起</div>
          <el-icon v-if="!form.isShowAll" class="down_icon" @click="form.isShowAll = true">
            <i-arrow-down />
          </el-icon>
          <el-icon v-else class="up_icon" @click="form.isShowAll = false"><i-arrow-up /></el-icon>
        </div>
      </div>
    </div>
    <el-icon
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('region')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
const emit = defineEmits(['changeRegion', 'changeConditionList'])
const props = defineProps({
  errorStu: {
    type: Boolean,
    default: false
  },
  regionAll: {
    type: Array,
    default() {
      return []
    }
  }
})
const regionAll = toRef(props, 'regionAll')
const form = reactive({
  chooseRegion: [], // 选择的地区列表
  isShowAll: false, // 是否展示所有地区
  northChinaRegion: ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区'], // 华北地区列表
  northeastRegion: ['辽宁省', '吉林省', '黑龙江省'], // 东北地区列表
  eastChinaRegion: ['上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '台湾省'], // 华东地区列表
  centralChinaRegion: ['河南省', '湖北省', '湖南省'], // 华中地区列表
  southChinaRegion: ['广东省', '广西壮族自治区', '海南省', '香港特别行政区', '澳门特别行政区'], // 华南地区列表
  southwestRegion: ['重庆市', '四川省', '贵州省', '云南省', '西藏自治区'], // 西南地区列表
  northwestRegion: ['陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'] // 西北地区列表
})
// 关闭筛选条件
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}
// 华北地区
const checkNorthChinaAll = ref(false)
const isIndeterminateNorthChina = ref(false)
const checkedNorthChinaCities = ref([])
// 全选(或取消全选)华北地区的回调
const checkAllNorthChina = val => {
  checkAll(val, 'northChinaRegion')
}
// 选中(或取消选中)单个华北地区的回调
const checkedNorthChina = value => {
  checkOneRegion(value, 'northChinaRegion')
}

// 东北地区
const checkNortheastAll = ref(false)
const isIndeterminateNortheast = ref(false)
const checkedNortheastCities = ref([])
// 全选(或取消全选)东北地区的回调
const checkAllNortheast = val => {
  checkAll(val, 'northeastRegion')
}
// 选中(或取消选中)单个东北地区的回调
const checkedNortheast = value => {
  checkOneRegion(value, 'northeastRegion')
}

// 华东地区
const checkEastChinaAll = ref(false)
const isIndeterminateEastChina = ref(false)
const checkedEastChinaCities = ref([])
// 全选(或取消全选)华东地区的回调
const checkAllEastChina = val => {
  checkAll(val, 'eastChinaRegion')
}
// 选中(或取消选中)单个华东地区的回调
const checkedEastChina = value => {
  checkOneRegion(value, 'eastChinaRegion')
}

// 华中地区
const checkCentralChinaAll = ref(false)
const isIndeterminateCentralChina = ref(false)
const checkedCentralChinaCities = ref([])
// 全选(或取消全选)华中地区的回调
const checkAllCentralChina = val => {
  checkAll(val, 'centralChinaRegion')
}
// 选中(或取消选中)单个华中地区的回调
const checkedCentralChina = value => {
  checkOneRegion(value, 'centralChinaRegion')
}

// 华南地区
const checkSouthChinaAll = ref(false)
const isIndeterminateSouthChina = ref(false)
const checkedSouthChinaCities = ref([])
// 全选(或取消全选)华南地区的回调
const checkAllSouthChina = val => {
  checkAll(val, 'southChinaRegion')
}
// 选中(或取消选中)单个华南地区的回调
const checkedSouthChina = value => {
  checkOneRegion(value, 'southChinaRegion')
}

// 西南地区
const checkSouthwestAll = ref(false)
const isIndeterminateSouthwest = ref(false)
const checkedSouthwestCities = ref([])
// 全选(或取消全选)西南地区的回调
const checkAllSouthwest = val => {
  checkAll(val, 'southwestRegion')
}
// 选中(或取消选中)单个西南地区的回调
const checkedSouthwest = value => {
  checkOneRegion(value, 'southwestRegion')
}

// 西北地区
const checkNorthwestAll = ref(false)
const isIndeterminateNorthwest = ref(false)
const checkedNorthwestCities = ref([])
// 全选(或取消全选)西北地区的回调
const checkAllNorthwest = val => {
  checkAll(val, 'northwestRegion')
}
// 选中(或取消选中)单个西北地区的回调
const checkedNorthwest = value => {
  checkOneRegion(value, 'northwestRegion')
}

// 全选或取消全选的回调
const checkAll = function (val, type) {
  switch (type) {
    case 'northChinaRegion':
      checkedNorthChinaCities.value = val ? form.northChinaRegion : []
      isIndeterminateNorthChina.value = false
      checkedCities(form.northChinaRegion, checkedNorthChinaCities.value)
      break
    case 'northeastRegion':
      checkedNortheastCities.value = val ? form.northeastRegion : []
      isIndeterminateNortheast.value = false
      checkedCities(form.northeastRegion, checkedNortheastCities.value)
      break
    case 'eastChinaRegion':
      checkedEastChinaCities.value = val ? form.eastChinaRegion : []
      isIndeterminateEastChina.value = false
      checkedCities(form.eastChinaRegion, checkedEastChinaCities.value)
      break
    case 'centralChinaRegion':
      checkedCentralChinaCities.value = val ? form.centralChinaRegion : []
      isIndeterminateCentralChina.value = false
      checkedCities(form.centralChinaRegion, checkedCentralChinaCities.value)
      break
    case 'southChinaRegion':
      checkedSouthChinaCities.value = val ? form.southChinaRegion : []
      isIndeterminateSouthChina.value = false
      checkedCities(form.southChinaRegion, checkedSouthChinaCities.value)
      break
    case 'southwestRegion':
      checkedSouthwestCities.value = val ? form.southwestRegion : []
      isIndeterminateSouthwest.value = false
      checkedCities(form.southwestRegion, checkedSouthwestCities.value)
      break
    case 'northwestRegion':
      checkedNorthwestCities.value = val ? form.northwestRegion : []
      isIndeterminateNorthwest.value = false
      checkedCities(form.northwestRegion, checkedNorthwestCities.value)
      break
  }
}
// 选择单个地区或取消的回调
const checkOneRegion = function (value, type) {
  const checkedCount = value.length
  switch (type) {
    case 'northChinaRegion':
      checkNorthChinaAll.value = checkedCount === form.northChinaRegion.length
      isIndeterminateNorthChina.value =
        checkedCount > 0 && checkedCount < form.northChinaRegion.length
      checkedCities(form.northChinaRegion, checkedNorthChinaCities.value)
      break
    case 'northeastRegion':
      checkNortheastAll.value = checkedCount === form.northeastRegion.length
      isIndeterminateNortheast.value =
        checkedCount > 0 && checkedCount < form.northeastRegion.length
      checkedCities(form.northeastRegion, checkedNortheastCities.value)
      break
    case 'eastChinaRegion':
      checkEastChinaAll.value = checkedCount === form.eastChinaRegion.length
      isIndeterminateEastChina.value =
        checkedCount > 0 && checkedCount < form.eastChinaRegion.length
      checkedCities(form.eastChinaRegion, checkedEastChinaCities.value)
      break
    case 'centralChinaRegion':
      checkCentralChinaAll.value = checkedCount === form.centralChinaRegion.length
      isIndeterminateCentralChina.value =
        checkedCount > 0 && checkedCount < form.centralChinaRegion.length
      checkedCities(form.centralChinaRegion, checkedCentralChinaCities.value)
      break
    case 'southChinaRegion':
      checkSouthChinaAll.value = checkedCount === form.southChinaRegion.length
      isIndeterminateSouthChina.value =
        checkedCount > 0 && checkedCount < form.southChinaRegion.length
      checkedCities(form.southChinaRegion, checkedSouthChinaCities.value)
      break
    case 'southwestRegion':
      checkSouthwestAll.value = checkedCount === form.southwestRegion.length
      isIndeterminateSouthwest.value =
        checkedCount > 0 && checkedCount < form.southwestRegion.length
      checkedCities(form.southwestRegion, checkedSouthwestCities.value)
      break
    case 'northwestRegion':
      checkNorthwestAll.value = checkedCount === form.northwestRegion.length
      isIndeterminateNorthwest.value =
        checkedCount > 0 && checkedCount < form.northwestRegion.length
      checkedCities(form.northwestRegion, checkedNorthwestCities.value)
      break
  }
}
// 计算选中的地区
function checkedCities(cityList, chooseList) {
  const newList = []
  form.chooseRegion.forEach(item => {
    if (!cityList.includes(item)) {
      newList.push(item)
    }
  })
  form.chooseRegion = newList
  form.chooseRegion = [...form.chooseRegion, ...chooseList]
  emit('changeRegion', form.chooseRegion)
}

onMounted(() => {
  form.chooseRegion = regionAll.value
  form.chooseRegion.forEach(item => {
    if (form.northChinaRegion.includes(item)) {
      checkedNorthChinaCities.value.push(item)
      const checkedCount = checkedNorthChinaCities.value.length
      checkNorthChinaAll.value = checkedCount === form.northChinaRegion.length
      isIndeterminateNorthChina.value =
        checkedCount > 0 && checkedCount < form.northChinaRegion.length
    } else if (form.northeastRegion.includes(item)) {
      checkedNortheastCities.value.push(item)
      const checkedCount = checkedNortheastCities.value.length
      checkNortheastAll.value = checkedCount === form.northeastRegion.length
      isIndeterminateNortheast.value =
        checkedCount > 0 && checkedCount < form.northeastRegion.length
    } else if (form.eastChinaRegion.includes(item)) {
      checkedEastChinaCities.value.push(item)
      const checkedCount = checkedEastChinaCities.value.length
      checkEastChinaAll.value = checkedCount === form.eastChinaRegion.length
      isIndeterminateEastChina.value =
        checkedCount > 0 && checkedCount < form.eastChinaRegion.length
    } else if (form.centralChinaRegion.includes(item)) {
      checkedCentralChinaCities.value.push(item)
      const checkedCount = checkedCentralChinaCities.value.length
      checkCentralChinaAll.value = checkedCount === form.centralChinaRegion.length
      isIndeterminateCentralChina.value =
        checkedCount > 0 && checkedCount < form.centralChinaRegion.length
    } else if (form.southChinaRegion.includes(item)) {
      checkedSouthChinaCities.value.push(item)
      const checkedCount = checkedSouthChinaCities.value.length
      checkSouthChinaAll.value = checkedCount === form.southChinaRegion.length
      isIndeterminateSouthChina.value =
        checkedCount > 0 && checkedCount < form.southChinaRegion.length
    } else if (form.southwestRegion.includes(item)) {
      checkedSouthwestCities.value.push(item)
      const checkedCount = checkedSouthwestCities.value.length
      checkSouthwestAll.value = checkedCount === form.southwestRegion.length
      isIndeterminateSouthwest.value =
        checkedCount > 0 && checkedCount < form.southwestRegion.length
    } else if (form.northwestRegion.includes(item)) {
      checkedNorthwestCities.value.push(item)
      const checkedCount = checkedNorthwestCities.value.length
      checkNorthwestAll.value = checkedCount === form.northwestRegion.length
      isIndeterminateNorthwest.value =
        checkedCount > 0 && checkedCount < form.northwestRegion.length
    }
  })
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
// .regionBox {
// display: flex;
// flex-direction: row;
// justify-content: flex-start;
// align-items: flex-start;
// flex-wrap: wrap;
// }
.regionBox:last-child {
  margin-bottom: 0 !important;
}
.showAllBox {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  color: #364fcd;
  cursor: pointer;
}
.down_icon {
  color: #364fcd;
  font-size: 14px;
  cursor: pointer;
}
.up_icon {
  color: #364fcd;
  font-size: 14px;
  cursor: pointer;
}
</style>
