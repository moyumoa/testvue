import { isNotEmpty } from '@/utils/tools'

// 标题转换 根据风险等级进行颜色突出显示
// type Number 1 标题文案 2 口播文案
// text String 文本内容
// resultList Array 风险等级结果
// addLength Boolean 是否显示字数
// addId Boolean 是否显示id 用于点击的时候知道是哪个id

export function textAnalysisFun(type, text, results, addLength, addId) {
  console.log('x', text)
  // 首先收集所有需要高亮的片段及其位置
  const highlights = []
  console.log('x', results)
  results.forEach(result => {
    if (!result.auditText) return
    const searchText = result.auditText
    let index = 0

    while (index !== -1) {
      index = text.indexOf(searchText, index)
      if (index !== -1) {
        highlights.push({
          start: index,
          end: index + searchText.length,
          text: searchText,
          score: result.score,
          question: result.question ? result.question.replace(/"/g, "'") : '',
          opinion: result.opinion ? result.opinion.replace(/"/g, "'") : '',
          questionAndOpinion: result.questionAndOpinion
            ? result.questionAndOpinion.replace(/"/g, "'")
            : '',
          id: result.id
        })
        index += searchText.length
      }
    }
  })
  console.log('638', highlights)
  // 按起始位置排序
  highlights.sort((a, b) => a.start - b.start)

  // 合并重叠或相邻的高亮区域
  const mergedHighlights = []
  if (highlights.length > 0) {
    let current = { ...highlights[0] }

    for (let i = 1; i < highlights.length; i++) {
      if (highlights[i].start < current.end) {
        // 重叠或相邻，合并
        // current.end = Math.max(current.end, highlights[i].end)
        // current.end = current.end
        current.text = text.substring(current.start, current.end)
        
      } else {
        mergedHighlights.push(current)
        current = { ...highlights[i] }
      }
    }
    mergedHighlights.push(current)
  }

  // 生成最终的HTML字符串
  // 从后往前替换，避免位置偏移问题
  let resultText = text
  for (let i = mergedHighlights.length - 1; i >= 0; i--) {
    const h = mergedHighlights[i]
    const before = resultText.substring(0, h.start)
    const after = resultText.substring(h.end)
    const highlighted = `<span class="score_score ${riskLevelMap[h.score].color}_score
    ${addId ? 'mark_cursor' : ''}" data-tipcontent="${riskLevelMap[h.score].label || ''}：${
      h.questionAndOpinion ? h.questionAndOpinion : `${h.question}${h.opinion}`
    }" data-type="${type}" data-id="${addId ? h.id : null}">${h.text}</span>`
    resultText = before + highlighted + after
  }

  console.log('处理结果', resultText)
  // 移除末尾的单个字符
  if (resultText.endsWith('\n')) {
    resultText = resultText.slice(0, -1) // 移除末尾的单个字符
  }

  const newText = text ? text.replace(/\n/g, '') : ''
  if (addLength) resultText += `<span style="color: #909399">(共计${newText?.length || 0}字)</span>`

  return resultText
}
export function textAn333alysisFun(type, text, results, addLength, addId) {
  // 按auditText长度降序排序，先处理长的文本，避免短文本匹配影响长文本
  const sortedResults = [...results].sort((a, b) => b.auditText.length - a.auditText.length)

  // 创建一个数组来记录已经被处理的文本位置
  const processedRanges = []

  sortedResults.forEach(result => {
    const searchText = result.auditText

    let index = text.indexOf(searchText)

    while (index !== -1) {
      // 检查当前位置是否已经被其他高亮处理过
      const isProcessed = processedRanges.some(range => index >= range.start && index < range.end)

      if (!isProcessed) {
        // 创建高亮HTML
        const highlighted = `<span class="score_score ${riskLevelMap[result.score].color}_score
        ${addId ? 'mark_cursor' : ''}" data-tipcontent="${
          riskLevelMap[result.score].label || ''
        }：${result.question}${result.opinion}" data-type="${type}" data-id="${
          addId ? result.id : null
        }" >${searchText}</span>`

        // 替换文本
        text = text.substring(0, index) + highlighted + text.substring(index + searchText.length)

        // 记录已处理的文本范围
        processedRanges.push({
          start: index,
          end: index + highlighted.length
        })

        // 更新索引位置（因为文本长度已改变）
        index = text.indexOf(searchText, index + highlighted.length)
      } else {
        // 如果已经处理过，跳过这个位置
        index = text.indexOf(searchText, index + 1)
      }
    }
  })

  console.log('res', text)
  return text
}
export function textAnalys22isFun1(type, text, resultList, addLength, addId) {
  // 按评估分数从高到低排序
  const sortedList = isNotEmpty(resultList) ? resultList.sort((a, b) => b.score - a.score) : []

  // 用于存储已经处理过的内容，避免重复处理
  const processedTexts = new Set()

  // 遍历排序后的列表，逐个标红
  let resultText = text

  sortedList.forEach(item => {
    const { auditText } = item
    // 如果当前文本已经被处理过，则跳过
    if (processedTexts.has(auditText)) return

    // 标红处理
    const escapedText = auditText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
    const regex = new RegExp(escapedText, 'g')

    resultText = resultText.replace(
      regex,
      `<span class="score_score ${riskLevelMap[item.score].color}_score
      ${addId ? 'mark_cursor' : ''}" data-tipcontent="${riskLevelMap[item.score].label || ''}：${
        item.question
      }${item.opinion}" data-type="${type}" data-id="${addId ? item.id : null}">$&</span>`
    )

    // 将当前文本加入已处理集合
    processedTexts.add(auditText)
  })

  if (addLength) resultText += `<span style="color: #909399">(共计${text?.length || 0}字)</span>`
  return resultText
}

// 风险等级
export const riskLevelMap = {
  3: {
    color: 'green',
    label: '低风险'
  },
  4: {
    color: 'orange',
    label: '中风险'
  },
  5: {
    color: 'red',
    label: '高风险'
  }
}

// 分数颜色 90以上绿色 60以上黄色 其余红色
export const getScoreColor = score => {
  return score >= 90 ? 'green' : score >= 60 ? 'orange' : 'red'
}
