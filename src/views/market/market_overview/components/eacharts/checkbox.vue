<template>
  <div class="checkbox">
    <el-checkbox-group v-model="data.checkedCities">
      <el-checkbox
        v-for="i in data.cities"
        :label="i.id"
        :key="i.id"
        :style="{ '--color': i.color }"
      >
        {{ i.name }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  setup(props) {
    const data = reactive({
      checkedCities: ['laishanqu', 'fushanqu'],
      cities: [
        { id: 'fushanqu', name: '福山区', color: '#f47920' },
        { id: 'zhifuqu', name: '芝罘区', color: '#6950a1' },
        { id: 'laishanqu', name: '莱山区', color: '#840228' }
      ]
    })
    return {
      data
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate
    .el-checkbox__inner) {
  background-color: var(--color);
  border: 1px solid var(--color);
}
:deep(.el-checkbox__inner:hover) {
  border-color: var(--color);
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--color);
}
:deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  border-color: var(--color);
}
</style>
