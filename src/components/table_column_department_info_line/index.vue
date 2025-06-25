<template>
  <div class="module_department_box">
    <el-tooltip effect="dark" placement="right" v-if="$data.list?.length">
      <template #content>
        <div style="max-width: 300px">
          <div v-for="(item, index) in $data.list" :key="index">{{ item.all }}</div>
        </div>
      </template>
      <div class="dept_box">
        <div :class="[className]" v-for="(item, index) in $data.list" :key="index">
          {{ item.name }}
        </div>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
const props = defineProps({
  departmentName: String, // 部门名称
  // 部门路径连接符
  connectStr: {
    type: String,
    default: '-'
  },
  // 后端数据部门名称分割字符
  divisionStr: {
    type: String,
    default: '|'
  },
  trigger: {
    type: String,
    default: 'hover' // 如何触发tooltip， click ，hover
  },
  className: {
    type: String,
    default: '' // 自定义样式名
  },
  tipPlacement: {
    type: String,
    default: 'top' // 提示的显示位置
  },
  showDpeartTitle: {
    type: Boolean,
    default: false // 是否显示部门两个字--只适合于单个部门的情况
  }
})
const { departmentName, divisionStr, connectStr } = toRefs(props)

const $data = reactive({
  list: []
})

watch(
  () => departmentName,
  () => {
    if (departmentName && departmentName.value && departmentName.value !== '--') {
      $data.list = []
      const depList = departmentName.value.split(divisionStr.value)
      let midList = []
      depList.forEach(item => {
        const paths = item.split(connectStr.value)
        const lastPath = paths[paths.length - 1]
        let canPush = true // 能否显示 false代表当前midList内已有相同的子部门
        midList.forEach(i => {
          if (i.name === lastPath) {
            canPush = false
            const str = i.all + ',' + paths.join('/') // 如果子部门相同，跟部门不同，就拼接起来
            midList = midList.map(x => {
              const y = x
              if (y.name === lastPath) {
                y.all = str // 放在all字段里
              }
              return y
            })
          } else {
            canPush = true
          }
        })
        if (canPush)
          midList.push({
            name: lastPath,
            all: item,
            visible: false
          })
      })
      $data.list = midList
    } else {
      $data.list = []
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.department_info {
  font-size: 12px;
  .depart_item {
    // display: inline-block;
    cursor: pointer;
    margin: 2px 5px 2px 0;
  }
}

:deep .el-tag__content {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.department_info_tooltip-class {
  padding: 0 !important;
}
.module_department_box {
  display: flex;
  flex-direction: row;
}
.depart_item {
  @include mult_line(1);
}
.tag_depart_name {
  padding: 0px 9px;
  font-size: 12px;
  color: #409eff;
  line-height: 22px;
  background: rgb(236, 245, 255);
  border: 1px solid rgb(217, 236, 255);
  border-radius: 4px;
}
.dept_flex {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}
.dept_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  div {
    @include mult_line(1);
    margin-top: 6px;
    margin-right: 4px;
    font-weight: 400;
    font-size: 12px;
    color: #364fcd;
    line-height: 18px;
    padding: 0 4px;
    border-radius: 3px;
    border: 1px solid rgba(54, 79, 205, 0.4);
  }
  .max {
    width: max-content;
    max-width: 80px !important;
  }
}
</style>
