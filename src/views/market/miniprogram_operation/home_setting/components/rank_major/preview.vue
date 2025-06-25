<template>
  <div>
    <!-- AI视频、AI图片、AI文案由于没有配置项，就放在这里写死  -->
    <div class="one_AI one_AI1">
      <div class="content_line">
        <!-- 数字人口播 -->
        <div class="line_half line_szr">
          <img
            class="img1"
            src="https://tagvv-1256030678.file.myqcloud.com/2025031202zfh.png"
            alt=""
          />
        </div>

        <!-- 爆款仿制 -->
        <div class="line_half">
          <img
            class="img3"
            src="https://tagvv-1256030678.file.myqcloud.com/20250226c5rrn.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <div class="one_AI one_AI2">
      <div class="content_line">
        <!-- AI视频创作 -->
        <div class="line_half">
          <img
            class="img2"
            src="https://tagvv-1256030678.file.myqcloud.com/20250211mb3m6.png"
            alt=""
          />
        </div>
        <!-- AI图文创作 -->
        <div class="line_half">
          <img
            class="img2"
            src="https://tagvv-1256030678.file.myqcloud.com/20250211lq6py.png"
            alt=""
          />
        </div>
      </div>
      <div class="content_line" style="margin-top: 12px">
        <div class="line_half">
          <!-- 一键成片 -->
          <div class="line_half2">
            <img
              class="img5"
              src="https://tagvv-1256030678.file.myqcloud.com/202503126w166.png"
              alt=""
            />
          </div>
          <!-- 图集成片 -->
          <div class="line_half2">
            <img
              class="img5"
              src="https://tagvv-1256030678.file.myqcloud.com/202503124hyjh.png"
              alt=""
            />
          </div>
        </div>
        <div class="line_half">
          <!-- AI智能包装 -->
          <div class="line_half2">
            <img
              class="img5"
              src="https://tagvv-1256030678.file.myqcloud.com/20250312ckzyr.png"
              alt=""
            />
          </div>
          <!-- AI封面制作 -->
          <div class="line_half2">
            <img
              class="img5"
              src="https://tagvv-1256030678.file.myqcloud.com/20250312d8gao.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <div class="one_AI one_AI3">
      <div class="content_line">
        <!-- AI文案专家 -->
        <img
          class="img4"
          src="https://tagvv-1256030678.file.myqcloud.com/20250211erh3m.png"
          alt=""
        />
      </div>
    </div>
    <!-- <div class="ai_text_warp">
      <div class="ai_title">AI文案工具</div>
      <div class="item_warp">
        <div
          class="text_item"
          v-for="(item, index) in textList"
          :key="index"
          :style="{ backgroundColor: item.baColor ? item.baColor : '' }"
        >
          <img :src="item.icon" alt="" class="icon" />
          <div class="text_info">
            <p class="label">{{ item.label }}</p>
            <p class="sub_title">{{ item.subTitle }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="ai_text_warp">
      <div class="ai_title">AI视频工具</div>
      <div class="item_warp">
        <div
          class="text_item"
          v-for="(item, index) in publishWayList"
          :key="index"
          :style="{ backgroundColor: item.baColor ? item.baColor : '' }"
        >
          <img :src="item.icon" alt="" class="icon" />
          <div class="text_info">
            <p class="label">{{ item.label }}</p>
            <p class="sub_title">{{ item.subTitle }}</p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
// const props = defineProps({
//   data: {
//     type: Object,
//     data() {
//       return {}
//     }
//   },
//   chooseTab: {
//     type: String
//   }
// })
// console.log('props.data', props.data)
// const textList = [
//   {
//     label: '文案创作',
//     subTitle: '行业文案一键生成',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/20240806v3obm.png',
//     baColor: '#EAF5FF'
//   },
//   {
//     label: '爆款标题',
//     subTitle: '爆款标题一键创作',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/2024053030076.png',
//     baColor: '#FEEBEE'
//   },
//   {
//     label: '智能仿写',
//     subTitle: '优质文案轻松仿写',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/202405303g8fe.png',
//     baColor: '#FDF1E5'
//   },
//   {
//     label: '文案提取',
//     subTitle: '视频文案提取',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/202405300unsh.png',
//     baColor: '#EDEFFD'
//   }
// ]
// const publishWayList = [
//   {
//     label: '一键成片',
//     subTitle: '关键词自动成片',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/202405306qbgz.png',
//     baColor: '#E6F7F5'
//   },
//   {
//     label: '模板跟拍',
//     subTitle: '海量模板替换',
//     icon: 'https://tagvv-1256030678.file.myqcloud.com/20240530p6i0b.png',
//     baColor: '#EEF0FD'
//   }
// ]
</script>

<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';

.one_AI {
  .content_line {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    .img4 {
      width: 351px;
      height: 76px;
      object-fit: contain;
      display: flex;
    }
    .line_half2 {
      width: calc((100% - 10px) / 2);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
    .line_half {
      width: calc((100% - 11px) / 2);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
    .img1 {
      width: 170px;
      height: 156px;
      object-fit: contain;
      display: flex;
    }
    .img2 {
      width: 170px;
      height: 66px;
      object-fit: contain;
      display: flex;
    }
    .img5 {
      width: 80px;
      height: 74px;
      object-fit: contain;
      display: flex;
    }
    .img3 {
      width: 100%;
      height: 156px;
      object-fit: contain;
      display: flex;
    }
    .line_line {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }
  }
}
.one_AI1 {
  margin-top: 8px;
}
.one_AI2 {
  margin-top: 12px;
}
.one_AI3 {
  margin-top: 12px;
}
</style>
