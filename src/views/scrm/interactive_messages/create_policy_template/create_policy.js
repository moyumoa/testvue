import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { savePolicyDetail, getPolicyDetail } from '@/api/scrm/policy'

/**
 * @description: 创建/更新策略模板
 * @param {Form} formRef 表单ref
 * @param {Number} id 策略模板id
 */
export default function createPolicy(formRef, id, type) {
  const templateInfo = ref({
    name: '',
    description: '',
    rules: [
      {
        keywords: [],
        replyContent: ''
      }
    ]
  })
  const saving = ref(false)
  const router = useRouter()

  const rules = {
    name: [
      {
        required: true,
        message: '请输入模板名称',
        trigger: 'blur'
      }
    ]
  }

  function cancel() {
    router.go(-1)
  }

  function saveTemplate() {
    console.log(templateInfo.value)
    formRef.value.validate(vaild => {
      if (vaild) {
        saving.value = true
        const _rules = templateInfo.value.rules.map(e => {
          return {
            auto_reply_keywords: e.keywords,
            auto_reply_seq: [
              {
                reply_type: 'text',
                reply_content: e.replyContent
              }
            ]
          }
        })
        const param = {
          isDel: 0,
          template: [
            {
              auto_reply_name: '',
              auto_reply_mode: 'keywords',
              version: '',
              auto_reply_options: _rules
            }
          ],
          templateDesc: templateInfo.value.description,
          templateName: templateInfo.value.name,
          templateType: 1
        }
        if (id) param.id = id
        console.log('param', param)
        savePolicyDetail(param)
          .then(() => {
            ElMessage.success('创建成功')
            router.push('/scrm/policy_template')
          })
          .finally(() => {
            saving.value = false
          })
      }
    })
  }

  onMounted(() => {
    // 查看默认模板要传type:1
    if (id) {
      const query = {
        id
      }
      if (type) {
        query.type = 1
      } else {
        query.type = null
      }
      getPolicyDetail(query).then(res => {
        const _detail = res.data
        const _rules = _detail.template[0].auto_reply_options.map(e => {
          return {
            keywords: e.auto_reply_keywords,
            replyContent: e.auto_reply_seq[0].reply_content
          }
        })
        templateInfo.value = {
          name: _detail.templateName,
          description: _detail.templateDesc,
          rules: _rules
        }
      })
    }
  })

  return {
    templateInfo,
    rules,
    saving,
    cancel,
    saveTemplate
  }
}
