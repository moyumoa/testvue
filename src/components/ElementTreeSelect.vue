<template>  <el-popover
    placement="bottom-start"
    width="300"
    trigger="click"
    v-model="popoverVisible"
    @show="onPopoverShow"
    :disabled="disabled"
  >
    <!-- 树组件 -->
    <el-tree
      ref="tree"
      :data="options"
      :props="treeProps"
      highlight-current
      @node-click="handleTreeSelect"
      :disabled="disabled"
      :expand-on-click-node="false"
      node-key="id"
      :current-node-key="value"
      :default-expanded-keys="defaultExpandedKeys"
      :lazy="true"
      :load="handleLoadNode"
    />

    <el-input
      slot="reference"
      v-model="selectedLabel"
      :placeholder="placeholder"
      readonly
      :disabled="disabled"
      @focus="!disabled && (popoverVisible = true)"
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
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loadNode: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      popoverVisible: false,
      selectedLabel: '',
      defaultExpandedKeys: [], // 默认展开的节点
      treeProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'isLeaf'
      }
    }
  },
  computed: {},
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.updateLabelByValue(val)
        // 如果有值，设置当前选中节点并展开到该节点
        if (val && this.$refs.tree) {
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(val)
            // 展开到选中节点
            this.expandToSelectedNode(val)
          })
        }
      }
    },
    options: {
      immediate: true,
      handler() {
        this.updateLabelByValue(this.value)
        // 当options更新时，如果有选中值，重新展开到该节点
        if (this.value) {
          this.$nextTick(() => {
            this.expandToSelectedNode(this.value)
          })
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.updateLabelByValue(this.value)
      if (this.value && this.$refs.tree) {
        this.$refs.tree.setCurrentKey(this.value)
        this.expandToSelectedNode(this.value)
      }
    })
  },
  methods: {
    handleTreeSelect(node) {
      this.selectedLabel = node.label
      this.$emit('input', node.id)
      this.$emit('change', node)
      this.popoverVisible = false
      
      // 设置当前选中节点
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(node.id)
      }
    },
    
    // 由父组件调用，设置节点标签
    setNodeLabel(label) {
      this.selectedLabel = label
    },
    
    updateLabelByValue(val) {
      if (!val) {
        this.selectedLabel = ''
        return
      }
      
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
      
      const label = findLabel(this.options)
      
      if (label) {
        this.selectedLabel = label
      } else if (val) {
        // 如果在当前options中找不到标签，请求父组件提供
        console.log('在options中未找到节点标签，请求父组件提供:', val)
        this.$emit('request-node-label', val)
        // 暂时显示节点ID，避免空白
        this.selectedLabel = `节点 ${val}`
      }
    },
    
    onPopoverShow() {
      console.log('下拉框打开，当前选中值:', this.value)
      
      // 确保当前选中的节点被正确高亮和展开
      if (this.value && this.$refs.tree) {
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.value)
          this.expandToSelectedNode(this.value)
        })
      }
    },
    
    // 展开到选中节点（懒加载模式下简化处理）
    expandToSelectedNode(nodeId) {
      if (!nodeId || !this.$refs.tree) {
        return
      }
      
      try {
        console.log('懒加载模式下展开到选中节点:', nodeId)
        
        // 在懒加载模式下，直接设置当前选中节点
        // el-tree会根据需要自动加载和展开路径
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(nodeId)
            console.log('设置当前选中节点完成:', nodeId)
          }
        })
      } catch (error) {
        console.error('展开到选中节点失败:', error)
      }
    },
    
    // 获取节点路径（从根节点到目标节点）
    getNodePath(targetId) {
      const path = []
      
      const findPath = (nodes, target, currentPath) => {
        for (const node of nodes) {
          const newPath = [...currentPath, node.id]
          
          if (node.id === target) {
            path.push(...newPath)
            return true
          }
          
          if (node.children && node.children.length > 0) {
            if (findPath(node.children, target, newPath)) {
              return true
            }
          }
        }
        return false
      }
      
      findPath(this.options, targetId, [])
      return path
    },
    
    // 懒加载节点（传递给父组件处理）
    handleLoadNode(node, resolve) {
      // 直接调用父组件传入的loadNode方法
      if (this.loadNode) {
        this.loadNode(node, resolve)
      } else {
        resolve([])
      }
    }
  }
}
</script>

<style scoped>
.el-input {
  cursor: pointer;
}
.el-popover__reference {
  width: 200px;
}
.el-tree {
  max-height: 300px;
  overflow-y: auto;
}
</style> 