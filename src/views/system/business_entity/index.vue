<template>
  <div class="business_entity">
    <EntityCard
      :ref="getEntityCardRef"
      class="entity_card"
      v-for="item in entityList"
      :key="item.principalType"
      :info="item"
      :entity-list="entityList"
      @update="handleUpdate"
      @updateBrother="updateOther"
    ></EntityCard>
  </div>
</template>

<script setup>
import EntityCard from '@/views/system/business_entity/components/entity_card.vue'
import { getBusinessEntity } from '@/api/system_setting/business_entity.js'
import { useStore } from 'vuex'
const store = useStore()
const entityList = ref(null)
// 获取页面的开启信息
const init = () => {
  handleUpdate()
}
const entityCardRef = ref([])
const getEntityCardRef = el => {
  const id = el?.info?.id
  const index = entityCardRef.value.findIndex(x => x?.info?.id === id)
  if (index === -1) {
    entityCardRef.value.push(el)
  }
}

// 刷新
const handleUpdate = (refresh = true) => {
  getBusinessEntity({}).then(res => {
    if (res.code === 0) {
      entityList.value = res.data || []
    }
  })
}

const updateOther = () => {
  entityCardRef.value.forEach(item => {
    if (item?.info?.isOpen === 1) {
      item.reset(true)
    }
  })
}
init()

onBeforeUnmount(() => {
  // 页面离开时刷新store里的业务主体
  store.dispatch('user/getBusinessEntityFun')
})
</script>

<style lang="scss" scoped>
.business_entity {
  display: flex;

  .entity_card + .entity_card {
    margin-left: 16px;
  }
}
</style>
