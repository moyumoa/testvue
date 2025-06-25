/*
 * @Description: 内容中台通用字段
 */

import Dictionary from './Dictionary'
import matrixTyped from '@/assets/images/content_center/matrix_typed1.png'
import matrixTypep from '@/assets/images/content_center/matrix_typep1.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer1.png'
import grayMatrix from '@/assets/images/content_center/change_gray.png'
import blueMatrix from '@/assets/images/content_center/change.png'
import matrixEmployee from '@/assets/images/content_center/matrix_employee.png'

// 企业号的ICON
const eaccountRoleICON = new Dictionary()
eaccountRoleICON.add(1, 'PERSONAL', matrixTyped)
eaccountRoleICON.add(2, 'EAccountM', matrixTypep)
eaccountRoleICON.add(3, 'EAccountS', matrixTyper)
eaccountRoleICON.add(3, 'EAccountK', matrixTyper)

// 企业号的ICON
const matrixTypeICON = new Dictionary()
matrixTypeICON.add(2, 'EAccountM', { img: grayMatrix, name: '普通企业号' })
matrixTypeICON.add(3, 'EAccountS', { img: blueMatrix, name: '认证企业号' })
matrixTypeICON.add(4, 'EAccountK', { img: blueMatrix, name: '认证企业号' })
matrixTypeICON.add(5, 'EAccountEmployeeS', { img: matrixEmployee, name: '员工号-认证企业号' })
matrixTypeICON.add(6, 'EAccountEmployeeK', { img: matrixEmployee, name: '员工号-认证企业号' })

// 抖音号类型
const DYAllType = new Dictionary()
DYAllType.add(1, 'EAccountS', '认证企业号')
DYAllType.add(2, 'EAccountM', '普通企业号')
DYAllType.add(3, 'EAccountK', '认证企业号')
DYAllType.add(4, 'PERSONAL', '个人号')
DYAllType.add(5, 'EAccountEmployeeS', '员工号-认证企业号')
DYAllType.add(6, 'EAccountEmployeeK', '员工号-认证企业号')

// 抖音号所有类型数组
const DYALLTypeList = [
  'EAccountS',
  'EAccountM',
  'EAccountK',
  'PERSONAL',
  'EAccountEmployeeS',
  'EAccountEmployeeK'
]
// 员工号的类型数组
const DYEmployeeType = ['EAccountEmployeeS', 'EAccountEmployeeK']

// 小红书账号类型
const customerUserType = new Dictionary()
customerUserType.add(1, 'COMMON', '个人号')
customerUserType.add(2, 'BUSINESS', '专业号')

// 内容挂载类型
const contentAnchorType = new Dictionary()
contentAnchorType.add(-1,'全部')
contentAnchorType.add(3,'电商小黄车')
contentAnchorType.add(5,'线索小风车')
contentAnchorType.add(6,'团购小房子')
contentAnchorType.add(2,'POI位置')
contentAnchorType.add(4,'小程序')

export {
  eaccountRoleICON,
  matrixTypeICON,
  DYAllType,
  DYEmployeeType,
  DYALLTypeList,
  customerUserType,
  contentAnchorType
}
