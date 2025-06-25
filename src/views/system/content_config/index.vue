<template>
  <div class="content_config_wrapper g_bg">
    <div class="config_header">
      <div class="header_title">
        知识库
        <el-popover
          placement="right"
          :width="400"
          trigger="hover"
          popper-class="g_popper_gray"
          style="border: 1px solid red"
        >
          <template #reference>
            <i class="iconfont icon-wenhao"></i>
          </template>
          <div class="tips">
            <p>添加知识库后，将在小程序首页展示，点击跳转到相关链接页面</p>
            <img src="@/assets/images/content_config/demo1.png" alt="" style="margin-right: 20px" />
            <img src="@/assets/images/content_config/demo2.png" alt="" />
          </div>
        </el-popover>
      </div>
      <el-button type="primary" @click="linkTo">新增知识库</el-button>
    </div>
    <div v-if="list.length !== 0" class="config_main">
      <div class="config_content">
        <template v-for="item in list" :key="item.id">
          <div class="item">
            <div class="item_content">
              <img :src="item.icon" alt="" />
              <div class="item_content_info">
                <el-tooltip :content="item.name" placement="top" effect="dark">
                  <div class="item_content_info_name line-hidden1">
                    {{ item.name }}
                  </div>
                </el-tooltip>
                <div class="item_content_info_en line-hidden1">{{ item.docUrl }}</div>
                <div class="table_point reverse" v-if="item.status === 0">已禁用</div>
                <div class="table_point" v-if="item.status === 1">已启用</div>
              </div>
            </div>
            <div class="item_footer">
              <span @click="onView(item)">查看</span>
              <span @click="onEdit(item)">编辑</span>
              <span @click="changeStatus(item)">
                {{ item.status === 1 ? '禁用' : '启用' }}
              </span>
              <el-popconfirm title="确定删除该知识库吗？" @confirm="onDel(item.id)">
                <template #reference>
                  <span style="color: #f85151">删除</span>
                </template>
              </el-popconfirm>
            </div>
            <div class="item_num flex_center">{{ item.sort }}</div>
          </div>
        </template>
      </div>
    </div>
    <div v-else class="no_data flex_center">
      <div>
        <p>知识库暂无内容，点击右上方按钮立即新建吧</p>
        <img src="@/assets/images/content_config/no_data.png" alt="" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="查看" width="537px" custom-class="hide_footer_line">
      <div class="view_dialog">
        <div class="list_item">
          <div class="label">图标：</div>
          <div class="content">
            <img :src="current.icon" alt="" style="width: 36px; height: 36px" />
          </div>
        </div>
        <div class="list_item">
          <div class="label">名称：</div>
          <div class="content">{{ current.name }}</div>
        </div>
        <div class="list_item">
          <div class="label">跳转链接：</div>
          <div class="content">{{ current.docUrl }}</div>
        </div>
        <div class="list_item">
          <div class="label">状态：</div>
          <div class="content">
            <div class="table_point reverse" v-if="current.status === 0">已禁用</div>
            <div class="table_point" v-if="current.status === 1">已启用</div>
          </div>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  getKnowledgeBaseSettingPage,
  deleteKnowledgeBaseSetting,
  updateKnowledgeBaseSetting
} from '@/api/system_setting/content_config'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const $message = inject('$message')
const router = useRouter()
const dialogVisible = ref(false)
const current = ref({})
const list = ref([])

const onView = data => {
  current.value = data
  dialogVisible.value = true
}
const onEdit = item => {
  localStorage.setItem('editData', JSON.stringify(item))
  router.push('content_config/edit_page')
}
const changeStatus = row => {
  const copy = JSON.parse(JSON.stringify(row))
  copy.status = copy.status === 1 ? 0 : 1
  updateKnowledgeBaseSetting(copy).then(res => {
    $message.success('修改成功')
    getList()
  })
}
const onDel = id => {
  ElMessageBox.confirm('删除后小程序不显示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteKnowledgeBaseSetting({ id }).then(res => {
      $message.success('删除成功')
      getList()
    })
  })
}
const linkTo = () => {
  router.push('content_config/edit_page')
}
const getList = () => {
  const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
  getKnowledgeBaseSettingPage({
    pageSize: 999,
    pageNum: 1,
    brandId
  }).then(res => {
    list.value = res.data.records
  })
}

onMounted(getList)
</script>

<style lang="scss" scoped>
.content_config_wrapper {
  height: calc(100% - 50px);
  .config_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header_title {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      > .icon-wenhao {
        color: #909399;
        font-size: 14px;
        margin-left: 8px;
      }
    }
  }
  .config_main {
    height: calc(100% - 32px);
    overflow-y: auto;
    .config_content {
      margin-top: 18px;
      display: grid;
      grid-template-columns: repeat(auto-fill, 313px);
      gap: 14px;
      .item {
        border-radius: 4px;
        border: 1px solid #cccfdf;
        width: 313px;
        margin-right: 16px;
        position: relative;
        &_content {
          display: flex;
          padding: 16px;
          > img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 14px;
          }
          &_info {
            &_name {
              max-width: 150px;
              font-size: 16px;
              font-weight: 500;
              color: #323233;
              line-height: 22px;
            }
            &_en {
              max-width: 150px;
              margin: 4px 0 12px 0;
              color: #909399;
              line-height: 20px;
            }
            .table_point {
              font-size: 12px;
              color: #909399;
              line-height: 17px;
            }
          }
        }
        &_footer {
          border-top: 1px solid #cccfdf;
          background: #f7f8fa;
          padding: 11px;
          border-radius: 0px 0px 4px 4px;
          span {
            cursor: pointer;
            color: $theme-color;
            padding: 0 21px;
            border-right: 1px solid #cccfdf;
            &:last-child {
              border-right: 0;
            }
            &:hover {
              text-decoration: none;
            }
          }
        }
        &_num {
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: #d5d8e6;
          color: #364fcd;
          font-size: 12px;
          position: absolute;
          top: 8px;
          right: 8px;
        }
      }
    }
  }
  .no_data {
    height: calc(100% - 32px);
    overflow-y: auto;
    text-align: center;
    img {
      margin-top: 24px;
      max-width: 60%;
    }
  }
  @media screen and (max-width: 1200px) {
    .no_data {
      img {
        max-width: 80%;
      }
    }
  }
  @media screen and (max-width: 800px) {
    .no_data {
      img {
        max-width: 100%;
      }
    }
  }
}

.tips {
  padding: 12px 0 0 6px;
  > p {
    margin-left: 12px;
    margin-bottom: 16px;
    font-size: 12px;
    color: #fff;
  }
  > img {
    width: 148px;
    height: 320px;
  }
}
.view_dialog {
  .list_item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    .label {
      width: 100px;
      text-align: right;
      margin-right: 24px;
    }
    .content {
    }
  }
}
</style>
