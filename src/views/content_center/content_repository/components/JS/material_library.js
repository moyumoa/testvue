/**
 * @param fname 文件名称
 * @return 0:other 1:图片image 2:txt 3:excel 4:word 5:pdf 6:ppt 7:视频video 8:音频radio 9:zip 10:rar
 */
function initFiletype(fname) {
  // 匹配上传文件用来显示icon
  let result = ''
  let suffix = ''
  try {
    const flieArr = fname.indexOf('.') > -1 ? fname.split('.') : fname.split('/')
    suffix = flieArr[flieArr.length - 1]
  } catch (e) {
    suffix = ''
  }
  if (suffix === '') {
    return ''
  }
  // 图片格式JPEG,dds,PSD,PDT,WebP,XMP,GIF,BMP,SVG,TIFF,
  const imglist = [
    'png',
    'PNG',
    'jpg',
    'JPG',
    'jpeg',
    'bmp',
    'gif',
    'JPEG',
    'dds',
    'DDS',
    'PSD',
    'psd',
    'PDT',
    'pdt',
    'WebP',
    'webp',
    'XMP',
    'xmp',
    'GIF',
    'BMP',
    'SVG',
    'svg',
    'TIFF',
    'tiff',
    'jfif'
  ]
  // 进行图片匹配
  result = imglist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'image'
    return result
  }

  // 匹配txt
  const txtlist = ['txt']
  result = txtlist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'txt'
    return result
  }

  // 匹配excel
  const excellist = ['xls', 'xlsx']
  result = excellist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'excel'
    return result
  }

  // 匹配word
  const wordlist = ['doc', 'docx']
  result = wordlist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'word'
    return result
  }

  // 匹配pdf
  const pdflist = ['pdf']
  result = pdflist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'pdf'
    return result
  }

  // 匹配ppt
  const pptlist = ['ppt']
  result = pptlist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'ppt'
    return result
  }

  // 匹配视频
  const videolist = [
    'wmv',
    'asf',
    'asx',
    'rm',
    'rmvb',
    'mp4',
    '3gp',
    'mov',
    'm4v',
    'avi',
    'dat',
    'mkv',
    'flv',
    'vob',
    'WMV',
    'ASF',
    'ASX',
    'RM',
    'RMVB',
    'MP4',
    '3GP',
    'MOV',
    'M4V',
    'AVI',
    'DAT',
    'MKV',
    'FLV',
    'VOB',
    'video/mp4',
    'video/quicktime',
    'quicktime'
  ]
  result = videolist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'video'
    return result
  }

  // 匹配音频
  const radiolist = [
    'MP3',
    'AAC',
    'WAV',
    'WMA',
    'CDA',
    'FLAC',
    'M4A',
    'MID',
    'MKA',
    'MP2',
    'MPA',
    'MPC',
    'APE',
    'OFR',
    'OGG',
    'RA',
    'WV',
    'TTA',
    'AC3',
    'DTS',
    'mp3',
    'aac',
    'wav',
    'wma',
    'cda',
    'flac',
    'm4a',
    'mid',
    'mka',
    'mp2',
    'mpa',
    'mpc',
    'ape',
    'ofr',
    'ogg',
    'ra',
    'wv',
    'tta',
    'ac3',
    'dts',
    'ogm',
    'mpeg'
  ]
  result = radiolist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'radio'
    return result
  }

  // 匹配zip
  const ziplist = ['zip']
  result = ziplist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'zip'
    return result
  }

  // 匹配zip
  const rarlist = ['rar']
  result = rarlist.some(function (item) {
    return item === suffix
  })
  if (result) {
    result = 'rar'
    return result
  }
  // 匹配字体
  const fontlist = [
    'ttf','otf'
  ]
  result = fontlist.some(function (item) {
    return item === suffix.toLowerCase()
  })
  if (result) {
    result = 'font'
    return result
  }

  result = 'other'
  return result
}

export default initFiletype
