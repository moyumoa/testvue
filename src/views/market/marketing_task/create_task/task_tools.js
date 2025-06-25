/**
 * @description: 根据ckey查cvalue
 * @param {Object} taskInfo 任务详情
 * @param {String} configKey 任务详情大类ckey
 * @param {String} ckey 要查询的ckey
 * @return {String | Number} cvalue
 */
export function getCkeyOfCvalue(taskInfo, configKey, ckey) {
  for (const i in taskInfo.infoConfigs) {
    const config = taskInfo.infoConfigs[i]
    if (config.ckey === configKey) {
      const requirementList = config.children
      for (const k in requirementList) {
        const requirement = requirementList[k]
        if (requirement.ckey === ckey) {
          return requirement.cvalue
        }
      }
    }
  }
}
