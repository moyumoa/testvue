<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
    <upgradeannouncement></upgradeannouncement>
  </el-config-provider>
</template>

<script>
import upgradeannouncement from '@/views/main/upgrade_announcement/index.vue'
import { useI18n } from 'vue-i18n'
export default {
  components: { upgradeannouncement },
  name: 'App',
  setup() {
    const i18n = useI18n()
    const locale = computed(() => {
      return {
        name: i18n.locale.value,
        el: i18n.messages.value[i18n.locale.value].el
      }
    })
    return {
      locale
    }
  }
}
</script>
<style lang="scss">
:root {
  --el-color-primary: #364fcd;
}

::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  margin: 0 2px;
}
::-webkit-scrollbar-thumb {
  border-radius: 7px;
  background-color: #c0c2c2;
}
</style>
