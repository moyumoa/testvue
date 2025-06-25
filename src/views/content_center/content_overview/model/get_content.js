/**
 * 获取问答芝士和内容周报
 */
import { listKnowledge, weeklyReport } from '@/api/content_center/content_overview'
export function getContent() {
  const rightContent = reactive([
    // {
    //   loading: true,
    //   name: '问答芝士',
    //   list: [],
    //   link: ''
    // },
    {
      loading: true,
      name: '内容小结',
      list: [],
      link: ''
    }
  ])
  // 文章-获取问答芝士的内容
  function getQAFun() {
    rightContent[0].loading = true
    listKnowledge()
      .then(res => {
        if (res.code === 0) {
          rightContent[0].list = res.data || []
        }
        rightContent[0].loading = false
      })
      .catch(() => {
        rightContent[0].loading = false
      })
  }
  // 文章-获取内容周报的内容
  function getWeeklyFun() {
    rightContent[0].loading = true
    weeklyReport()
      .then(res => {
        if (res.code === 0) {
          rightContent[0].list = res.data || []
        }
        rightContent[0].loading = false
      })
      .catch(() => {
        rightContent[0].loading = false
      })
  }
  return {
    rightContent,
    getQAFun,
    getWeeklyFun
  }
}
