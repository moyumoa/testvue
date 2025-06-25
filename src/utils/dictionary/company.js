/*
 * @Author: Dong wen hao
 * @Date: 2022-04-27 10:34:56
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-04-27 10:34:56
 * @Description: 公司级别通用字段
 */

import Dictionary from './Dictionary'

// 组织架构
const ORG_STRUCTURE = new Dictionary()
ORG_STRUCTURE.add(1, 'custom', '自建')
ORG_STRUCTURE.add(2, 'lark', '飞书')
ORG_STRUCTURE.add(3, 'wxwork', '企业微信')
ORG_STRUCTURE.add(4, 'wxwork', '企业微信')
ORG_STRUCTURE.add(5, 'wx', '微信')

// 矩阵号渠道
const PLATFORM = new Dictionary()
PLATFORM.add(1, '', '抖音')
PLATFORM.add(2, '', '视频号')
PLATFORM.add(3, '', '小红书')
PLATFORM.add(4, '', '快手')

export { ORG_STRUCTURE, PLATFORM }
