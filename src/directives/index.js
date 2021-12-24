import debounce from './module/debounce'

const importDirective = Vue => {
  // 防抖
  Vue.directive('debounce',debounce);
  
}

export default importDirective
