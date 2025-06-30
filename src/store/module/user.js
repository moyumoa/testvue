import api from '../../api'

export default {
  state: {},
  mutations: {},
  getters: {},
  actions: {
    // 获取权限菜单
    getPermissionsList({ commit }) {
      return new Promise((resolve, reject) => {
        // 是否选择过公司
        let companyCode = +localStorage.getItem('companyCode') || null
        let userCompanyType = null
        try {
          api.user
            .getLoginUser()
            .then(data => {
              if (data.code === 200) {
                localStorage.setItem('userInfo', JSON.stringify(data.data))
                // 公司实时过滤
                let companyList = data.data.companyList
                let checkCompany = companyList.filter(item => item.companyCode === companyCode)
                if (checkCompany.length > 0) {
                  userCompanyType = checkCompany[0].checkCompany
                } else {
                  companyCode =
                    companyList && companyList.length > 0 ? companyList[0].companyCode : null
                  userCompanyType = companyList[0].userCompanyType
                }
                localStorage.setItem('companyCode', companyCode)
                commit('setCompanyList', companyList)
                // 获取菜单
                return api.user.initUserPermission(companyCode, userCompanyType)
              } else {
                throw 'error'
              }
            })
            .then(res => {
              if (res.code === 200) {
                const menuList = res.data || []
                for (let item of menuList) {
                  if (Array.isArray(item.childrenList) && item.childrenList.length > 0) {
                    for (let child of item.childrenList) {
                      if (child.check) {
                        item.check = true
                        break
                      }
                    }
                  }
                }
                commit('setMenuList', menuList)
                resolve(menuList)
              } else {
                throw 'error'
              }
            })
        } catch (error) {
          reject()
        }
      })
    },
  }
}
