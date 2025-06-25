<template>
  <div class="page" v-loading="loading">
    <div class="page_title">员工授权内容</div>
    <div class="page_container">
      <el-checkbox-group v-model="checkList" @change="checkListChange">
        <el-checkbox disabled :label="1">
          抖音基础授权
          <el-tooltip
            popper-class="tooltip-class"
            placement="top"
            content=""
            :style="{ 'margin-left': '4px' }"
          >
            <template #content>
              <div style="max-width: 400px">
                仅授权抖音基础账号信息，可获得视频热度指数等维度数据
              </div>
            </template>
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 8px"
            />
          </el-tooltip>
        </el-checkbox>
        <el-checkbox :label="2">
          高级数据权限
          <el-tooltip
            popper-class="tooltip-class"
            placement="top"
            content=""
            :style="{ 'margin-left': '4px' }"
          >
            <template #content>
              <div style="max-width: 400px">通过授权MCN机构可获取准确播放量和更丰富维度数据</div>
            </template>
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 8px"
            />
          </el-tooltip>
        </el-checkbox>
        <el-checkbox :label="3">线索数据权限</el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>
<script setup>
import { selectBrand } from '@/api/system_setting/brand_info'
import { updateBrandConfig } from '@/api/system_setting/setting'
import { debounce } from '@/utils/tools'
import { useStore } from 'vuex'
const store = useStore()
const checkList = ref([1]) // 选中的数据
const loading = ref(false)
const configValue = ref({})
// 多选框选中的数据变化
const checkListChange = debounce(val => {
  console.log('变化', val, configValue.value)
  updateBrandConfig({
    xuserConfig: JSON.stringify({
      ...configValue.value,
      allowDyMcnAuth: checkList.value.indexOf(2) > -1,
      allowCluesAuth: checkList.value.indexOf(3) > -1
    })
  })
    .then(res => {
      // 失败了更新数据
      if (res.code !== 0) {
        getInfo()
      } else {
        store.commit('user/setAllowDyMcnAuth', checkList.value.indexOf(2) > -1)
        store.commit('user/setAllowCluesAuth', checkList.value.indexOf(3) > -1)
      }
    })
    .catch(() => {
      getInfo()
    })
}, 800)

// 初始化
function getInfo() {
  console.log('回显上一次的数据')
  loading.value = true
  selectBrand({})
    .then(res => {
      if (res.code === 0 && res.data?.xuserConfig) {
        const xuserConfig = JSON.parse(res.data.xuserConfig)
        console.log('数据', xuserConfig)
        configValue.value = xuserConfig
        const list = [1]
        if (xuserConfig.allowDyMcnAuth) {
          list.push(2)
        }
        if (xuserConfig.allowCluesAuth) {
          list.push(3)
        }
        checkList.value = list
        loading.value = false
      } else {
        loading.value = false
        checkList.value = [1]
      }

      store.commit('user/setAllowDyMcnAuth', checkList.value.indexOf(2) > -1)
      store.commit('user/setAllowCluesAuth', checkList.value.indexOf(3) > -1)
    })
    .catch(() => {
      loading.value = false
      checkList.value = [1]
    })
}
onMounted(() => {
  getInfo()
})
</script>
<style lang="scss" scoped>
.page {
  width: 100%;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 4px;
}
.page_title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: #323233;
  display: flex;
}
:deep .el-checkbox__label {
  display: flex;
  align-items: center;
}
</style>
