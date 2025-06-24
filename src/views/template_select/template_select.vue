<template>
  <div class="template_select">
    <div class="template-item" @click="matterTemplate()">传素材</div>
    <div class="template-item" @click="videoTemplate()">传视频模板</div>
  </div>
</template>
<script>
export default {
  data(){
    return{

    }
  },
  methods:{
    matterTemplate() {
      this.$router.push({ name: "matter_template" })
    },
    // 传视频模板
    videoTemplate(){
      this.$router.push({ name: "home" })
    }
  }
}
</script>
<style lang="less" scoped>
@import './template_select.less';
</style>