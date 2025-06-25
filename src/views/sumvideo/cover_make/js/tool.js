/**
 * @description  计算文字的宽度
 * @param {String} text - 文字内容
 * @param {Number} font - 字体样式
 * @param {Number} canvasW- 画布的宽度
 * @param {Number} canvasH - 画布的高度
 * @return {Object}
 */
export function getTextSize(text, fontSize, lineSpacing, canvasW, canvasH, addTextNum) {
  let width = null
  let height = null
  let x = null
  let y = null
  width = canvasW
  height = getTextHeight([text], fontSize, lineSpacing)
  // 防止每次添加都在同一个位置
  const initY = addTextNum % 2 === 0 ? 31 : 41
  x = 0
  y = canvasH - initY - height // 41的由来：UI上文字就是默认距底41px
  console.log('rrr', text, width, height, x, y, canvasH)
  return {
    width,
    height,
    x,
    y
  }
}

export function getTextWidth(text, font = 'normal 12px sans-serif') {
  console.log('text', text, font)
  let tCanvas = null
  // re-use canvas object for better performance
  const canvas = tCanvas || (tCanvas = document.createElement('canvas'))
  const context = canvas.getContext('2d')
  context.font = font
  const dom = context.measureText(text)
  return {
    width: dom.width,
    height: dom.fontBoundingBoxAscent + dom.fontBoundingBoxDescent,
    dom: dom
  }
}

export function getTextHeight(textList, fontSize, lineSpacing) {
  let len = 0
  textList.forEach((x, i) => {
    let l = fontSize * 1.482
    if (x && x.length > 0) {
      l = l * 1.36 + 1.4 + (i > 0 ? lineSpacing || 0 : 0)
    } else {
      l = l + (i > 0 ? lineSpacing || 0 : 0)
    }
    len = len + l
  })
  console.log('len', len, fontSize, lineSpacing, textList)
  return len
}
// 获取最新的Index
export function getNewIndex(form) {
  return getAllLength(form) + 1
}
// 获取元素总数
function getAllLength(form) {
  let index = 0
  // 获取图片和文字元素的数组长度。新添加的就是数组长度+1
  if (form && form.textStyle && form.textStyle.length > 0) {
    index += form.textStyle.length
  }
  if (form && form.imageStyle && form.imageStyle.length > 0) {
    index += form.imageStyle.length
  }
  return index
}
// 上移一层
export function moveUpFun(level, form, newForm) {
  console.log('上移', level, form)
  // 如果当前的level已经是最高的，就不能再上移了
  if (level < getAllLength(form)) {
    if (form && form.textStyle && form.textStyle.length > 0) {
      form.textStyle.forEach((x, i) => {
        if (level === x.level) {
          x.level += 1
          newForm.textStyle[i].level += 1
        } else if (level + 1 === x.level) {
          x.level -= 1
          newForm.textStyle[i].level -= 1
        }
      })
    }
    if (form && form.imageStyle && form.imageStyle.length > 0) {
      form.imageStyle.forEach((x, i) => {
        if (level === x.level) {
          x.level += 1
          newForm.imageStyle[i].level += 1
        } else if (level + 1 === x.level) {
          x.level -= 1
          newForm.imageStyle[i].level -= 1
        }
      })
    }
  }
}

// 下移一层
export function moveDownFun(level, form, newForm) {
  console.log('下移', level, form)
  // 如果当前的level已经是最低的[最低就是1]，就不能再下移了
  if (level > 1) {
    if (form && form.textStyle && form.textStyle.length > 0) {
      form.textStyle.forEach((x, i) => {
        if (level === x.level) {
          x.level -= 1
          newForm.textStyle[i].level -= 1
        } else if (level - 1 === x.level) {
          x.level += 1
          newForm.textStyle[i].level += 1
        }
      })
    }
    if (form && form.imageStyle && form.imageStyle.length > 0) {
      form.imageStyle.forEach((x, i) => {
        if (level === x.level) {
          x.level -= 1
          newForm.imageStyle[i].level -= 1
        } else if (level - 1 === x.level) {
          x.level += 1
          newForm.imageStyle[i].level += 1
        }
      })
    }
  }
}

// 置顶图层
export function toppingFun(index, level, form, newForm, type) {
  console.log('置顶', index, level, form)
  // 如果当前的level已经是最高的，就不能再置顶了
  if (level < getAllLength(form)) {
    if (form && form.textStyle && form.textStyle.length > 0) {
      form.textStyle.forEach((x, i) => {
        if (x.level > level) {
          x.level -= 1

          newForm.textStyle[i].level -= 1
        }
      })
      if (type === 'text') {
        form.textStyle[index].level = getAllLength(form)
        newForm.textStyle[index].level = getAllLength(newForm)
      }
    }
    if (form && form.imageStyle && form.imageStyle.length > 0) {
      form.imageStyle.forEach((x, i) => {
        if (x.level > level) {
          x.level -= 1
          newForm.imageStyle[i].level -= 1
        }
      })
      if (type === 'image') {
        form.imageStyle[index].level = getAllLength(form)
        newForm.imageStyle[index].level = getAllLength(newForm)
      }
    }
  }
}

// 置底图层
export function bottomingFun(index, level, form, newForm, type) {
  console.log('置底', index, level, form, type)
  // 如果当前的level已经是最低的[最低就是1]，就不能再置底了
  if (level > 1) {
    if (form && form.textStyle && form.textStyle.length > 0) {
      form.textStyle.forEach((x, i) => {
        if (x.level < level) {
          x.level += 1
          newForm.textStyle[i].level += 1
        }
      })
      if (type === 'text') {
        form.textStyle[index].level = 1
        newForm.textStyle[index].level = 1
      }
    }
    if (form && form.imageStyle && form.imageStyle.length > 0) {
      form.imageStyle.forEach((x, i) => {
        if (x.level < level) {
          x.level += 1
          newForm.imageStyle[i].level += 1
        }
      })
      if (type === 'image') {
        form.imageStyle[index].level = 1
        newForm.imageStyle[index].level = 1
      }
    }
  }
}
