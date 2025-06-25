/**
 *
 * @param {Object} searchComponents - 筛选条件
 * @param {Array} dateFileds - 如果筛选条件包含时间选择器，填开始和结束时间的字段名
 * @description 获取对应的参数
 */
import { dateFormat, isNotEmpty } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'
export function getQuery(
  searchComponents,
  dateFileds = ['liveStartTimeFrom', 'liveStartTimeTo'],
  needTime = true,
  businessFiled = 'businessQueryParams'
) {
  const searchObj = {}
  const businessList = []
  for (const item of searchComponents) {
    if (!item.hiddenItem) {
      // 处理proxy对象
      if (item.type === 'dateRange') {
        const vals = { list: typeof item.val === 'object' ? toRaw(item.val || []) : [] }
        const _startTime =
          vals.list.length > 1 ? dateFormat(vals.list[0]) + (needTime ? ' 00:00:00' : '') : ''
        const _endTime =
          vals.list.length > 1 ? dateFormat(vals.list[1]) + (needTime ? ' 23:59:59' : '') : ''
        item.startTimeVal
          ? (searchObj[item.startTimeVal] = _startTime)
          : (searchObj[dateFileds[0]] = _startTime)
        item.endTimeVal
          ? (searchObj[item.endTimeVal] = _endTime)
          : (searchObj[dateFileds[1]] = _endTime)
      } else if (item.type === 'datetimerange') {
        const vals = { list: typeof item.val === 'object' ? toRaw(item.val || []) : [] }
        const _startTime =
          vals.list.length > 1 ? dateFormat(vals.list[0], 'YYYY-MM-DD hh:mm:ss') : ''
        const _endTime = vals.list.length > 1 ? dateFormat(vals.list[1], 'YYYY-MM-DD hh:mm:ss') : ''
        item.startTimeVal
          ? (searchObj[item.startTimeVal] = _startTime)
          : (searchObj[dateFileds[0]] = _startTime)
        item.endTimeVal
          ? (searchObj[item.startTimeVal] = _endTime)
          : (searchObj[dateFileds[1]] = _endTime)
      } else if (item.type === 'date') {
        searchObj[item.filed] = item.val ? dateFormat(toRaw(item.val)) + ' 00:00:00' : ''
      } else if (item.type === 'select') {
        searchObj[item.filed] = item.val === -1 || item.val === '' ? null : item.val
      } else if (item.type === 'cascader') {
        searchObj[item.filed] = item.val ? toRaw(item.val) : item.val
      } else if (item.type === 'numberRange' || item.type === 'numberRange2') {
        searchObj[item.minFiled] = item.minVal
        searchObj[item.maxFiled] = item.maxVal
      } else if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
        if (isNotEmpty(item.ids) || item.isCheckAll) {
          businessList.push({
            [item.idFiled || 'businessIds']: item.ids,
            [item.checkAllFiled || 'isAllSelect']: item.isCheckAll,
            principalType: item.principalType
          })
        }
      } else if (item.type === 'newLabelFilterV2') {
        searchObj[item.filed] = item.val ? item.val.map(x => x.id) : []
      } else if (item.type === 'fail') {
        if (isNotEmpty(item.val)) {
          searchObj[item.filed] = [item.val?.id || '0']
        } else {
          searchObj[item.filed] = null
        }
      } else {
        searchObj[item.filed] = item.val
      }
    }
  }
  if (businessList && businessList.length > 0) {
    searchObj[businessFiled] = businessList
  }
  return searchObj
}

/**
 * @description  当筛选条件有数值范围的时候，要判断输入的数值是否符合要求
 * @return {Boolean} numberRangeStu
 */
export function checkNumberRange(searchComponents) {
  console.log('searchComponents', searchComponents)
  let numberRangeStu = false
  searchComponents.forEach(x => {
    if (x.type === 'numberRange' && x.checkStu) {
      numberRangeStu = true
    }
  })
  if (numberRangeStu) {
    ElMessage({ type: 'error', message: '请规范输入内容' })
  }
  return numberRangeStu
}
