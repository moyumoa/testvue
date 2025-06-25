<template>
  <iframe :src="previewUrl" style="width: 100%; height: 60vh" frameborder="0"></iframe>
</template>
<script setup>
const props = defineProps({
  url: String
})

const { url } = toRefs(props)
const getPreviewUrl = url => {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
}
const previewUrl = ref(getPreviewUrl(url.value))
</script>
