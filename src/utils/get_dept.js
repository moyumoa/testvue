import { getLazyDeptTree, queryDepartment } from '@/api/main/dept.js'
// 获取每个部门的全路径ID
export function changeDeptFullId() {}
// 获取每个部门的全路径名字
export function changeDeptFullPath() {}

// 获取第一个部门信息 编辑矩阵号信息需要这个数据来判断部门是否一致
export function getFirstDeptInfo(isUsePermission) {
  return new Promise((resolve, reject) => {
    getLazyDeptTree({
      deptId: null,
      isUsePermission: isUsePermission
    })
      .then(res => {
        if (res.code === 0) {
          const resData = res.data || []
          if (resData && resData.length > 0) {
            const info = [
              {
                value: resData[0].id,
                label: resData[0].name,
                fullIds: [resData[0].id],
                fullPath: resData[0].fullPath
              }
            ]
            resolve(info)
          } else {
            reject(new Error())
          }
        } else {
          reject(new Error())
        }
      })
      .catch(() => {
        reject(new Error())
      })
  })
}

// 根据部门ID获取部门全路径信息 查询跟部门会出错
export function getFullInfoById(ids, multipmultiplele) {
  return new Promise((resolve, reject) => {
    queryDepartment({
      deptIds: ids
    })
      .then(res => {
        if (res.code === 0 && res.data && res.data.records && res.data.records.length > 0) {
          if (multipmultiplele) {
            resolve(res.data.records)
          } else {
            const resData = res.data.records[0]
            const nameList = resData.name ? resData.name.split('/') : []
            const fullId = resData.parentIds
              ? resData.parentIds.substring(resData.parentIds.length - 1) === '/'
                ? resData.parentIds + resData.departmentId
                : resData.parentIds
              : resData.departmentId

            const ids = fullId.split('/').map(x => {
              return parseInt(x)
            })

            const info = {
              value: resData.departmentId,
              label: nameList && nameList.length > 0 ? nameList[nameList.length - 1] : '',
              fullPath:
                nameList && nameList.length > 1 ? nameList.slice(1).join('/') : resData.name,
              fullIds: [ids]
            }
            console.log('ifff', info)
            resolve(info)
          }
        } else {
          reject(new Error(1))
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
