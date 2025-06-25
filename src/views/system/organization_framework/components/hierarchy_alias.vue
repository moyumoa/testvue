<template>
  <div class="form_item">
    <div class="form_item_label">层级别名：</div>
    <div class="form_item_content">
      <div>
        <el-button type="primary" @click="$data.aliasDialog.show = true">设置</el-button>
        <div class="tip">层级别名会体现在相关的报表统计中</div>
      </div>
      <div class="list_box">
        <div class="one_list" v-for="(item, index) in $data.aliasDialog.list" :key="index">
          <div class="one_half" style="width: 100px">{{ item.title }}：</div>
          <div class="one_half">{{ item.alias }}</div>
        </div>
      </div>
    </div>
    <aliasDOM
      v-if="$data.aliasDialog.show"
      :aliasDialog="$data.aliasDialog"
      @updateList="init"
    ></aliasDOM>
  </div>
</template>
<script setup>
import { aliasList } from '@/api/system_setting/section'
import aliasDOM from './alias_dialog.vue'
import { useStore } from 'vuex'
const store = useStore()
const $data = reactive({
  aliasDialog: {
    show: false,
    list: [
      {
        label: 1,
        title: '一级别名',
        alias: '事业部'
      },
      {
        label: 2,
        title: '二级别名',
        alias: '零售中心'
      },
      {
        label: 3,
        title: '三级别名',
        alias: '大区'
      }
    ]
  }
})

function init() {
  aliasList().then(res => {
    if (res.code === 0) {
      const list = res.data || []
      if (list.length > 0) {
        list.sort((a, b) => {
          return a.level - b.level
        })
        // 防止只返回一级部门、二级部门、四级部门的出现
        const levelList = new Array(parseInt(list.length > 0 ? list[list.length - 1].level : 0))
        list.forEach(x => {
          levelList[parseInt(x.level) - 1] = x.alias
        })
        for (let i = 0; i < 3; i++) {
          $data.aliasDialog.list[i].alias = levelList[i]
        }
        console.log(levelList)
        store.commit('user/setLevelAlias', levelList)
      }
    }
  })
}
init()
</script>
<style lang="scss" scoped>
.list_box {
  margin-top: 10px;
  width: 400px;
  border: 1px solid #ebeef5;
  .one_list {
    width: 100%;
    height: 44px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_half {
      padding-left: 10px;
      width: 100%;
    }
    &:hover {
      background: rgba(245, 247, 250, 1);
    }
  }
  .one_list + .one_list {
    border-top: 1px solid #ebeef5;
  }
}
</style>
