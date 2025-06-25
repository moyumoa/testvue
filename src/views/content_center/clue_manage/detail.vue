<template>
  <div>
    <detail1 v-if="page === 1"></detail1>
    <detail2 v-if="page === 2" :id="id"></detail2>
  </div>
</template>

<script setup>
import detail1 from './detail1.vue'
import detail2 from './detail2.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const page = ref()
const id = ref()
if (route && route.query && route.query.id) {
  page.value = 2
  id.value = route.query.id
} else {
  page.value = 1
}
</script>

<style></style>
