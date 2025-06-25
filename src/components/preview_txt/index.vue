<template>
  <textarea
    style="
      width: 100%;
      height: 60vh;
      box-sizing: border-box;
      border: none;
      line-height: 1.5;
      padding: 16px;
    "
    :value="txtContent"
    readonly
  ></textarea>
</template>
<script setup>
import axios from 'axios'
const props = defineProps({
  url: String
})

const { url } = toRefs(props)
const txtContent = ref('')
const fetchTxtContent = async () => {
  const response = await axios.get(url.value)
  txtContent.value = response.data
}
fetchTxtContent()
</script>
