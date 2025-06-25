/*
 * @Author: Dong wen hao
 * @Date: 2022-01-07 15:29:57
 * @LastEditors: Dong wen hao
 * @LastEditTime: 2022-01-07 15:53:19
 * @Description: 导出格式
 */

import Dictionary from './Dictionary'

// 导出格式
const EXPORT_TYPE = new Dictionary()
EXPORT_TYPE.add('text/plain', 'txt')
EXPORT_TYPE.add('application/vnd.ms-excel', 'xls')
EXPORT_TYPE.add('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx')
EXPORT_TYPE.add('application/msword', 'doc')
EXPORT_TYPE.add('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
EXPORT_TYPE.add('video/mp4', 'mp4')

export { EXPORT_TYPE }
