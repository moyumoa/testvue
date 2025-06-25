<template>
  <xm_table v-loading="loading" :data="listData" v-model:page="page" @getTableData="getList">
    <el-table-column label="序号" prop="num" />
    <el-table-column label="姓名" prop="name" />
  </xm_table>
</template>

<script setup>
import { pageList } from '../model/get_list'
const { state, getList } = pageList()

const { loading, listData, page } = { ...toRefs(state) }
</script>

<style lang="scss"></style>
