import { getConfigByGroup, updateConfig } from '@/api/market/miniprogram_operation.js'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from '@/utils/tools.js'

export function operationConfig(configKey, subtitleObj) {
  const { CONFIG_GROUP, SWITCH_KEY, LIST_KEY } = configKey
  const switchValue = ref(false)
  const onSwitch = value => {
    const data = {
      configGroup: CONFIG_GROUP,
      configKey: SWITCH_KEY,
      configValue: value ? 1 : 0
    }
    updateConfig(data).then(res => {
      if (res.code === 0) {
        ElMessage.success('操作成功')
      }
    })
  }
  const subtitle = computed(() => {
    return switchValue.value ? subtitleObj.open : subtitleObj.close
  })

  const list = ref([])

  const getInfo = () => {
    getConfigByGroup({
      configGroup: CONFIG_GROUP
    }).then(res => {
      if (res.code === 0) {
        switchValue.value = res?.data.find(item => item.key === SWITCH_KEY)?.value === '1'
        const temp = res?.data.find(item => item.key === LIST_KEY)?.value
        if (!isEmpty(temp)) list.value = JSON.parse(temp)
      }
    })
  }
  const updateInfo = (data = list.value) => {
    updateConfig({
      configGroup: CONFIG_GROUP,
      configKey: LIST_KEY,
      configValue: JSON.stringify(data)
    }).catch(res => {
      console.error(res)
    })
  }
  const updateInfoByDebounce = debounce(updateInfo, 1000)
  return {
    switchValue,
    onSwitch,
    subtitle,
    list,
    getInfo,
    updateInfo,
    updateInfoByDebounce
  }
}
