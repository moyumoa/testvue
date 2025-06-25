import { getSectionTree } from '@/api/system_setting/section'

export default function sectionModel() {
  const leftTree = ref([])

  // 获取树结构
  function getData() {
    const params = {}
    getSectionTree(params).then(res => {
      leftTree.value = res.data
    })
  }

  return {
    getData,
    leftTree,
    filterNode
  }
}

// 树节点增加子节点统计数
// function setTreePath(init = false, tree) {
//   for (const item of tree) {
//     item.num = init ? -1 : item.children ? item.children.length : -1
//     if (item.children && item.children.length > 0) {
//       setTreePath(false, item.children, item)
//     }
//   }
// }
// tree筛选
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
