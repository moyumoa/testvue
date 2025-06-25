<template>
  <div class="module_department_box">
    <!-- table 部门信息 -->
    <div :class="['department_info ', className]" v-if="$data.list?.length">
      <el-tooltip
        popper-class="department_info_tooltip-class"
        :placement="tipPlacement"
        v-model:visible="item.visible"
        v-for="(item, index) in $data.list"
        :key="index"
      >
        <template #content>
          <div
            style="padding: 5px 10px; max-width: 500px"
            @mouseenter="item.visible = true"
            @mouseleave="item.visible = false"
          >
            <p v-for="(i, e) in item.all.split(',')" :key="e">{{ i }}</p>
          </div>
        </template>
        <div
          :class="{ depart_item: true, tag_depart_name: !showDpeartTitle }"
          @click="item.visible = true"
          @mouseenter="onMouseenter(item)"
          @mouseleave="item.visible = false"
        >
          <span class="depart_item_title" v-if="showDpeartTitle">部门：</span>
          <span>{{ item.name }}</span>
        </div>
      </el-tooltip>
    </div>
    <div v-else :class="[className]">
      <span class="depart_item_title" v-if="showDpeartTitle">部门：</span>
      -
    </div>
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
const onMouseenter = item => {
  if (props.trigger === 'hover') {
    item.visible = true
  }
}
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
</style>
