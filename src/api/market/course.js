import request from '@/utils/request'

// 课程列表
export const getCourseList = data => {
  return request.post(`/mission/course/courseList`, data)
}
// 新建课程
export const createCourse = data => {
  return request.post(`/mission/course/saveCourse`, data)
}
// 编辑课程
export const updateCourse = data => {
  return request.post(`/mission/course/updateCourse`, data)
}
// 删除课程
export const deleteCourse = data => {
  return request.post(`/mission/course/api/delCourse`, data)
}
// 课程详情
export const getCourseDetail = data => {
  return request.post(`/mission/course/api/getCourseById`, data)
}
// 课程列表 - 特殊搜索
export const getCourseListByName = data => {
  return request.post(`/mission/course/courseListByName`, data)
}
