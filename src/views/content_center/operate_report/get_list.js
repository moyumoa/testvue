export function handleGetList() {
  const tabVal = ref('1')
  function changeTab(val) {
    tabVal.value = val
  }
  return {
    tabVal,
    changeTab
  }
}
