import store from '@/store'
import { isNotEmpty } from '@/utils/tools.js'

// 根据已开启的业务主体生成筛选项
export function setBusinessChooseParam(param, shrink) {
  const list = []
  store.state.user.businessEntityList.forEach((item, index) => {
    list.push({
      shrink: shrink || false,
      type: item.isGroup ? 'chooseBusinessGroup' : 'chooseBusiness',
      principalType: item.principalType,
      label: item.isGroup ? `${item.principalName}分组` : item.principalName,
      placeholder: item.isGroup ? `请选择${item.principalName}分组` : `请选择${item.principalName}`,
      isCheckAll: isNotEmpty(param) ? param[item.principalType].isCheckAll : false, // 是否全选
      ids: isNotEmpty(param) ? param[item.principalType].ids : [], // 全选的时候这里是要移除的id列表 非全选的时候 这里是要选中的id列表
      idFiled: `businessIds`,
      checkAllFiled: `isAllSelect`,
      multiple: true,
      isGetId: true // 返回数据只要存ID
      // defaultVal:[{value:645,label:'大区'}]
    })
  })

  return list
}
