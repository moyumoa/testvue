<template>
  <div class="china_map">
    <div class="title">{{ textTop }}</div>
    <div :id="china_map_id" class="main"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import china from './china.json'
export default {
  name: 'china_map',
  props: {
    textTop: {
      type: String
    },
    mapTip: {
      type: String
    },
    id: {
      type: String
    },
    dataList: {
      type: Array
    },
    piecesList: {
      type: Array
    }
  },
  data() {
    return {
      china_map_id: ''
    }
  },
  created() {
    this.getId()
  },
  mounted() {
    this.buildMap(this.china_map_id)
  },
  watch: {
    // 监听数据的变化 有变化需要重新渲染地图
    dataList: {
      handler: function (val) {
        if (val) {
          this.changeChinaMapData()
        }
      },
      immediate: true
    }
  },
  methods: {
    getId() {
      this.china_map_id = this.id + Math.floor(Math.random() * 10000)
    },
    buildMap(val) {
      // 等拿到数据之后在进行地图表的注册
      if (this.dataList.length === 0) {
        setTimeout(() => {
          this.buildMap(val)
        }, 300)
        return
      }
      echarts.registerMap('china', china, {})
      const myChart = echarts.init(document.getElementById(val))
      const option = {
        tooltip: {
          backgroundColor: 'rgba(81, 81, 81, 0.8)',
          borderColor: 'rgba(109, 109, 110, 1)',
          padding: [5, 10],
          color: '#ffffff',
          formatter: function (params, ticket, callback) {
            const str =
              `<span style="color:#fff">${params.name}</span>` +
              '<br/>' +
              `<div style="display: inline-block;margin-right: 6px;background:${params.color};width:8px;height:8px;border-radius: 50%;" ></div>` +
              `<span style="color:#fff">${params.seriesName}</span>` +
              `<span style="color:#fff"> : </span>` +
              `<span style="color:#fff">${params.value}</span>`
            return str
          } // 数据格式化
        },
        visualMap: {
          title: '区域图例',
          type: 'piecewise', // 图注分段显示
          pieces: this.piecesList,
          left: 'left',
          top: 'bottom',
          show: true, // 图注
          backgroundColor: '#FDFDFD',
          padding: [12, 16]
        },
        geo: {
          map: 'china',
          roam: false, // 不开启缩放和平移
          zoom: 1.23, // 视角缩放比例
          label: {
            show: true,
            fontSize: '10', // 注意：地图省份名字字体如果过大会导致字体重叠
            color: 'rgba(0,0,0,0.7)'
          },
          itemStyle: {
            borderColor: 'rgba(0, 0, 0, 0.2)'
          },
          emphasis: {
            areaColor: '#F3B329', // 鼠标选择区域颜色
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 20,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        series: [
          {
            name: this.mapTip,
            type: 'map',
            geoIndex: 0,
            data: this.dataList
          }
        ]
      }
      myChart.setOption(option, true)
      myChart.resize()
    },
    changeChinaMapData() {
      setTimeout(() => {
        this.buildMap(this.china_map_id)
      }, 300)
    }
  }
}
</script>

<style scoped>
.china_map {
  width: calc(50% - 10px);
  height: 530px;
  background: #ffffff;
  border-radius: 4px;
}

.title {
  width: calc(100% - 48px);
  margin: 22px auto 0px;
  height: 25px;
  font-size: 18px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #303133;
  line-height: 25px;
  text-align: left;
}

.main {
  width: calc(100% - 48px);
  height: calc(100% - 50px);
  margin: auto;
}
</style>
