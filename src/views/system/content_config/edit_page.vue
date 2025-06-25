<template>
  <div class="edit_wrapper">
    <div class="edit_header">知识库</div>
    <div class="edit_main">
      <div class="form_wrapper">
        <el-form :model="form" :rules="rules" ref="refForm" label-width="120px">
          <el-form-item label="排序：" prop="sort">
            <el-input
              v-model.number="form.sort"
              placeholder="请输入序号"
              style="width: 450px"
              maxlength="3"
            />
            <p class="sort_tip">请填写0-999内整数，相同排序按照创建时间倒序排优先级</p>
          </el-form-item>
          <el-form-item label="图标：" prop="icon">
            <el-radio-group v-model="form.icon" style="margin-top: 12px">
              <template v-for="item in icons" :key="item.link">
                <el-radio class="item_radio" :label="item.link">
                  <img class="radio_img" :src="item.img" alt="" />
                </el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="名称：" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入名称"
              maxlength="6"
              style="width: 450px"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="跳转链接：" prop="docUrl">
            <el-input v-model="form.docUrl" placeholder="请输入跳转链接" style="width: 450px" />
            <el-popover
              placement="right"
              :width="isWeChat ? dialogWidth : '360px'"
              trigger="hover"
              popper-class="g_popper_gray"
            >
              <template #reference>
                <i class="iconfont icon-wenhao"></i>
              </template>
              <div class="tips" v-if="!isWeChat">
                <p>1.点击云文档，点击我的空间，创建文件夹</p>
                <img src="@/assets/images/content_config/img8.png" alt="" style="width: 287px" />
                <p>2.点击创建的文件夹的分享按钮</p>
                <img src="@/assets/images/content_config/img9.png" alt="" style="width: 287px" />
                <p>3.开启链接分享，复制文件夹链接，填写链接</p>
                <img src="@/assets/images/content_config/img10.png" alt="" style="width: 327px" />
              </div>
              <div
                v-else
                class="tip_box"
                :style="{
                  height: dialogHeight
                }"
              >
                <div>1.打开微盘，新增共享空间</div>
                <div class="img_box">
                  <img class="img1" src="@/assets/images/tip/link_1.png" alt />
                  <img class="img2" src="@/assets/images/tip/link_2.png" alt />
                </div>
                <div class="margin_12" style="width: 90%">
                  2.点击权限管理，点击【安全设置】，开启“启用成员邀请链接”及“通过链接加入空间无需审批”，可设置相应权限
                </div>
                <div class="img_box">
                  <img class="img3" src="@/assets/images/tip/link_3.png" alt />
                </div>
                <div class="img_box">
                  <img class="img3" src="@/assets/images/tip/link_4.png" alt />
                </div>
                <div class="img_box">
                  <img class="img3" src="@/assets/images/tip/link_5.png" alt />
                </div>
                <div class="margin_12">3.返回，点击成员邀请链接进行复制，粘贴</div>
                <div class="img_box">
                  <img class="img3" src="@/assets/images/tip/link_6.png" alt />
                </div>
              </div>
            </el-popover>
          </el-form-item>
          <el-form-item label="状态：" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="示例：">
            <div style="position: relative">
              <p style="color: #909399; font-size: 12px; margin-bottom: 12px">小程序底部页面展示</p>
              <img class="bg" src="@/assets/images/content_config/bg.png" alt="" />
              <div v-if="currentIcon" class="currentImg">
                <img :src="currentIcon" alt="" />
                <p>{{ form.name }}</p>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="edit_footer flex_center">
      <el-button @click="onBack">返回</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import img1 from '@/assets/images/content_config/img1.png'
import img2 from '@/assets/images/content_config/img2.png'
import img3 from '@/assets/images/content_config/img3.png'
import img4 from '@/assets/images/content_config/img4.png'
import img5 from '@/assets/images/content_config/img5.png'
import img6 from '@/assets/images/content_config/img6.png'
import img7 from '@/assets/images/content_config/img7.png'
import {
  addKnowledgeBaseSetting,
  updateKnowledgeBaseSetting
} from '@/api/system_setting/content_config'
import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'

const dialogWidth = ref('500px')
const dialogHeight = ref('800px')
function resizeFun() {
  if (document.body.clientWidth > 1600) {
    dialogWidth.value = '500px'
    dialogHeight.value = '800px'
  } else {
    dialogWidth.value = '400px'
    dialogHeight.value = '600px'
  }
}

window.addEventListener('resize', () => {
  resizeFun()
})
const $message = inject('$message')
const router = useRouter()
const refForm = ref(null)
const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
const icons = [
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon1.png',
    img: img1
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon2.png',
    img: img2
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon3.png',
    img: img3
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon4.png',
    img: img4
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon5.png',
    img: img5
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon6.png',
    img: img6
  },
  {
    link: 'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/icon/icon7.png',
    img: img7
  }
]
const currentIcon = computed(() => {
  const item = icons.find(i => i.link === form.value.icon) || {}
  return item.img
})
const form = ref({
  sort: 0,
  icon: '',
  name: '',
  docUrl: '',
  status: 1
})
const rules = ref({
  sort: [
    { required: true, pattern: /^([1-9]\d{0,2}|0)$/, message: '请输入0-999', trigger: 'blur' }
  ],
  icon: [{ required: true, message: '请选择', trigger: 'change' }],
  name: [{ required: true, message: '请输入', trigger: 'blur' }],
  docUrl: [
    {
      required: true,
      pattern: /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/,
      message: '请输入正确的链接',
      trigger: 'blur'
    }
  ],
  status: [{ required: true, message: '请选择', trigger: 'blur' }]
})

const onSave = throttle(() => {
  refForm.value.validate(valid => {
    if (valid) {
      if (!form.value.id) {
        addKnowledgeBaseSetting({ ...form.value, brandId }).then(res => {
          $message.success('新增成功')
          onBack()
        })
      } else {
        updateKnowledgeBaseSetting({ ...form.value, brandId }).then(res => {
          $message.success('修改成功')
          onBack()
        })
      }
    }
  })
}, 700)
const onBack = () => {
  router.go(-1)
}

onMounted(() => {
  resizeFun()
  if (localStorage.getItem('editData')) {
    const data = JSON.parse(localStorage.getItem('editData'))
    form.value = data
  }
})
onBeforeUnmount(() => {
  localStorage.removeItem('editData')
})
</script>

<style lang="scss" scoped>
.edit_header {
  padding: 17px 24px;
  font-size: 18px;
  color: #323233;
  line-height: 20px;
  border-bottom: 1px solid #e8e8e8;
}
.edit_main {
  height: calc(100vh - 230px);
  background-color: #fff;
  .form_wrapper {
    padding: 12px 0 32px 250px;
    .sort_tip {
      font-size: 12px;
      color: #909399;
      line-height: 17px;
      margin-top: 4px;
    }
    .item_radio {
      flex-direction: row-reverse;
      :deep(.el-radio__input) {
        position: absolute;
        right: 0;
        bottom: 0;
      }
      .radio_img {
        width: 48px;
        height: 48px;
      }
    }
    .icon-wenhao {
      color: #909399;
      font-size: 14px;
      margin-left: 8px;
    }
    .bg {
      width: 222px;
      height: 124px;
    }
    .currentImg {
      position: absolute;
      top: 100px;
      left: 10px;
      text-align: center;
      img {
        width: 20px;
        height: 20px;
        object-fit: cover;
        vertical-align: middle;
      }
      p {
        min-width: 45px;
        font-size: 14px;
        transform: scale(0.5);
        color: #1f2329;
        line-height: 16px;
      }
    }
    :deep(.el-form-item__content) {
      height: auto;
    }
  }
}
.edit_footer {
  background: #ffffff;
  border-radius: 4px;
  padding: 13px 0;
  width: 100%;
  margin-top: 16px;
}

.tips {
  padding: 12px 0 0 6px;
  > p {
    margin-left: 12px;
    margin: 12px 0 5px 0;
    font-size: 12px;
    color: #fff;
  }
}
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
.tip_box {
  overflow-y: auto;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  line-height: 20px;
  .margin_12 {
    margin-top: 12px;
  }
  .img_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    margin-top: 12px;
    img + img {
      margin-left: 16px;
    }

    .img1 {
      width: 34px;
    }

    .img2 {
      width: 403px;
    }
    .img3 {
      width: 402px;
    }

    @media screen and (max-width: 1600px) {
      .img1 {
        width: 28px;
      }

      .img2 {
        width: 330px;
      }
      .img3 {
        width: 350px;
      }
    }
  }
}
</style>
