/*
 * @Description: 面包屑里要用的路径
 */

import Dictionary from './Dictionary'
const ROUTE_PATH = new Dictionary()
ROUTE_PATH.add(1, '/content_market/course_management/edit_course', '新建/编辑学习课程')
ROUTE_PATH.add(2, '/sumwhy_video/Assemblyline/assemblyline_details', '流水线设置')
ROUTE_PATH.add(3, '/sumwhy_video/template_space/template_edit', '模板分镜')
ROUTE_PATH.add(4, '/content_market/audit_center/KOS_detail', '审核列表')

export { ROUTE_PATH }
