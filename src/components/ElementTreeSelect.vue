<template>
  <el-popover
    placement="bottom-start"
    width="300"
    trigger="click"
    v-model="popoverVisible"
    @show="onPopoverShow"
  >
    <el-tree
      :data="options"
      :props="treeProps"
      highlight-current
      @node-click="handleTreeSelect"
      :default-expand-all="true"
    />
    <el-input
      slot="reference"
      v-model="selectedLabel"
      :placeholder="placeholder"
      readonly
      @focus="popoverVisible = true"
      suffix-icon="el-icon-arrow-down"
      style="width: 200px"
    />
  </el-popover>
</template>

<script>
export default {
  name: 'ElementTreeSelect',
  props: {
    value: {
      type: [String, Number, null],
      default: null
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  },
  data() {
    return {
      popoverVisible: false,
      selectedLabel: '',
      treeProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.updateLabelByValue(val)
      }
    },
    options: {
      immediate: true,
      handler() {
        this.updateLabelByValue(this.value)
      }
    }
  },
  methods: {
    handleTreeSelect(node) {
      this.selectedLabel = node.label
      this.$emit('input', node.id)
      this.$emit('change', node)
      this.popoverVisible = false
    },
    updateLabelByValue(val) {
      const findLabel = (nodes) => {
        for (const node of nodes) {
          if (node.id === val) return node.label
          if (node.children) {
            const label = findLabel(node.children)
            if (label) return label
          }
        }
        return ''
      }
      this.selectedLabel = findLabel(this.options) || ''
    },
    onPopoverShow() {
      // 可选：弹出时做点什么
    }
  }
}
</script>

<style scoped>
.el-input {
  cursor: pointer;
}
</style> 