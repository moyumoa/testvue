/**
 * 金币换礼--开关
 */
import { getByKey, getByKeyLimit, updateConfig } from '@/api/market/gold_exchange_gifts.js'
import { dateFormat } from '@/utils/tools.js'
export function pageSwitch() {
  const $confirm = inject('$confirm')
  const message = inject('$message')
  const goldSwitch = reactive({
    value: false,
    id: null,
    configKey: 'auto_withdraw_when_empty_stock',
    loading: false
  })
  const limitSwitch = reactive({
    value: '', // 限购配置信息
    id: null,
    group: null,
    key: 'global_exchange_limit_config',
    loading: false,
    isOpen: false // 开关信息 入参时要放到value里
  })

  const form = reactive({
    // 表单数据
    limitTime: '', // 限购时间，默认一个月
    limitGoods: 1 // 限购商品
  })

  // 开关之前的提示
  function stockBeforeChange() {
    return new Promise(resolve => {
      if (!goldSwitch.value) {
        $confirm({
          title: '系统提醒',
          content: '开启该功能后，若库存为0，则自动下架，是否确认？',
          success() {
            stockChange(resolve)
          }
        })
      } else {
        stockChange(resolve)
      }
    })
  }
  // 获取是否开启无库存自动下架
  function getSwitchInfo() {
    getByKey().then(res => {
      if (res.code === 0) {
        goldSwitch.id = res.data ? res.data.id : null
        goldSwitch.value = res.data ? res.data.value === 'true' : false
      }
    })
  }
  // 限购开关，开启之前
  function limitBeforeChange() {
    return new Promise(resolve => {
      console.log('当前按钮状态', limitSwitch.isOpen)
      if (!limitSwitch.isOpen) {
        _getByKeyLimit().then(() => {
          $confirm({
            title: '系统提醒',
            content: `开启该功能后，在${form.limitTime[0]}至${form.limitTime[1]}，用户可兑换商品次数为：${form.limitGoods}，是否确认？`,
            confirmButtonText: '确认',
            success() {
              limitChange(resolve)
            }
          })
        })
      } else {
        limitChange(resolve)
      }
    })
  }
  // 限购开关接口
  function limitChange(resolve) {
    limitSwitch.loading = true
    updateConfig({
      configKey: limitSwitch.key,
      configValue: getParams(!limitSwitch.isOpen)
    })
      .then(res => {
        if (res.code === 0) {
          limitSwitch.loading = false
          message.success('操作成功')
          return resolve(true)
        } else {
          limitSwitch.loading = false
          return resolve(false)
        }
      })
      .catch(() => {
        limitSwitch.loading = false
        return resolve(false)
      })
  }

  // 获取全场限购配置
  function _getByKeyLimit() {
    return new Promise(resolve => {
      getByKeyLimit()
        .then(res => {
          if (res.code === 0) {
            if (!res.data) res.data = { isOpen: false }
            // 初始时，如果没有配置不会返回data体
            if (res.data.value !== undefined) {
              // 接口有保存,回显&刷新本地
              const limitData = JSON.parse(res.data.value)
              form.limitTime = [
                dateFormat(new Date(limitData.startTime), 'YYYY-MM-DD hh:mm:ss'),
                dateFormat(new Date(limitData.endTime), 'YYYY-MM-DD hh:mm:ss')
              ]
              form.limitGoods = limitData.times
              limitSwitch.isOpen = limitData.isOpen
            } else {
              form.limitTime = defaultTime()
            }
          }
          resolve()
        })
        .catch(() => {
          form.limitTime = defaultTime()
          form.limitGoods = 1
          resolve()
        })
    })
  }

  function stockChange(resolve) {
    goldSwitch.loading = true
    updateConfig({
      id: goldSwitch.id,
      configKey: goldSwitch.configKey,
      configValue: !goldSwitch.value
    })
      .then(res => {
        if (res.code === 0) {
          goldSwitch.loading = false
          message.success('操作成功')
          return resolve(true)
        } else {
          goldSwitch.loading = false
          return resolve(false)
        }
      })
      .then(() => {
        goldSwitch.loading = false
        return resolve(false)
      })
  }
  // 获取时间选择器的默认时间，今天的00:00:00-30天后的23:59:59
  function defaultTime() {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${
      today.getMonth() + 1 < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1
    }-${today.getDate() < 10 ? '0' + today.getDate() : today.getDate()}`
    const thirtyDay = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const thirtyDayStr = `${thirtyDay.getFullYear()}-${
      thirtyDay.getMonth() + 1 < 10 ? '0' + (thirtyDay.getMonth() + 1) : thirtyDay.getMonth() + 1
    }-${thirtyDay.getDate() < 10 ? '0' + thirtyDay.getDate() : thirtyDay.getDate()}`
    return [`${todayStr} 00:00:00`, `${thirtyDayStr} 23:59:59`]
  }

  const rules = {
    // 表单验证规则
    limitTime: [{ required: true, message: '请选择限购时间', trigger: 'blur' }],
    limitGoods: [{ required: true, message: '请输入限购商品', trigger: 'blur' }]
  }

  // 获取表单参数
  function getParams(isOpen = false) {
    console.log('通过form处理参数', form)
    const startTime = new Date(form.limitTime[0]).getTime()
    const endTime = new Date(form.limitTime[1]).getTime()
    const times = form.limitGoods
    return JSON.stringify({ startTime, endTime, times, isOpen })
  }
  // 更改限购设置
  function changeLimitData() {
    limitSwitch.isOpen = false
    // 调用接口，保存选择的数据，但是不开启
    const params = {
      configKey: 'global_exchange_limit_config',
      configValue: getParams()
    }

    updateConfig(params)
      .catch(() => {
        message.error('保存失败')
      })
      .then(() => {
        message.success('保存成功')
      })
  }

  onMounted(() => {
    getSwitchInfo()
    _getByKeyLimit()
  })
  return {
    goldSwitch,
    limitSwitch,
    stockBeforeChange,
    changeLimitData,
    stockChange,
    limitBeforeChange,
    rules,
    form
  }
}
