<template>
    <div class="loading_wrap">
        <!-- <div class="radial-indicator-container">
            <div class="percentloop">
            <div class="circle-left" :style="{ backgroundColor: color}">
                <div :style="{ backgroundColor: backgroundColor}" ref="leftcontent"></div>
            </div>
            <div class="circle-right" :style="{ backgroundColor: color}">
                <div :style="{ backgroundColor: backgroundColor}" ref="rightcontent"></div>
            </div>
            <div class="content-wrap">
                <span class="content-number" :title="percent+'%'">{{percent}}%</span>
            </div>
            </div>
        </div>
        <span class="content-text" :title="content">{{content}}</span> -->
        <div class="loadingImg_wrap">
            <img src="@/assets/imgs/header/loading.gif" alt="">
            <span>{{content}}</span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'loadingPopup',
    props: {
        size: {
            type: [String, Number],
            default: 120
        },
        content: String,
        color: {
            type: String,
            default: '#00b3ef'
        },
        backgroundColor: {
            type: String,
            default: '#7fd9f7'
        },
        percentNum: {
            type: [String, Number],
            default: 0
        },
        speed: {
            // suggest 1~3
            type: [String, Number],
            default: 1
        },
    },
    data () {
        return {
            percent: 0,
            initDeg: 0,
            timeId: null,
            animationing: true
        }
    },
    created () {
        // this.goRotate(this.transformToDeg(this.percentNum))
    },
    // watch: {
    //     'percentNum': function (val) {
    //         if (!this.animationing) return;
    //         clearInterval(this.timeId)
    //         this.goRotate(this.transformToDeg(val))
    //     }
    // },
    methods: {
        transformToDeg (percent) {
            let deg = 0
            if (percent >= 100) {
                deg = 360
            } else {
                deg = parseInt(360 * percent / 100)
            }
            return deg
        },
    
        transformToPercent (deg) {
            let percent = 0
            if (deg >= 360) {
                percent = 100
            } else {
                percent = parseInt(100 * deg / 360)
            }
            return percent
        },
    
        //  > 180
        rotateLeft (deg) {
            this.$refs.leftcontent.style.transform = 'rotate(' + (deg - 180) + 'deg)'
        },
    
        //  < 180
        rotateRight (deg) {
        this.$refs.rightcontent.style.transform = 'rotate(' + deg + 'deg)'
        },
    
        goRotate (deg) {
            this.timeId = setInterval(() => {
                if (deg > this.initDeg) {
                    this.initDeg += Number(this.speed)
                    if (this.initDeg >= 180) {
                        this.rotateLeft(this.initDeg)
                        this.rotateRight(180)
                    } else {
                        this.rotateRight(this.initDeg)
                    }
                } else {
                    this.initDeg -= Number(this.speed)
                    if (this.initDeg >= 180) {
                        this.rotateLeft(this.initDeg)
                    } else {
                        this.rotateLeft(180)
                        this.rotateRight(this.initDeg)
                    }
                }
                const remainer = Number(deg) - this.initDeg
                if (Math.abs(remainer) <= this.speed) {
                    this.initDeg += remainer
                    if (this.initDeg > 180) {
                        this.rotateLeft(this.initDeg)
                        this.rotateRight(180)
                    } else {
                        this.rotateRight(this.initDeg)
                    }
                    this.percent = this.transformToPercent(this.initDeg)
                    this.animationFinished()
                }else{
                    this.percent = this.transformToPercent(this.initDeg)
                }
            }, 10)
            },
        animationFinished () {
            this.percent = this.percentNum
            clearInterval(this.timeId)
            this.timeId = null
            if(this.percentNum==100 || this.percentNum==0){
                this.animationing = false
                this.$emit('animationFinished')
            }
        }
    },
    destroyed() {
        // this.animationing = false
        // this.timeId = null
        // clearInterval(this.timeId)
    }
}
</script>
<style lang="less" scoped>
.loadingImg_wrap{
    width: 150px;
    height: 150px;
    position: relative;

    > img{
        position: absolute;
        width: 100%;
        height: 100%;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
    }
    > span{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        color: #2388FF;
        font-weight: 550;
    }
}
.loading_wrap{
    left: 0;
    top: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 3000;
}
.radial-indicator-container{
    width: 120px;
    height: 120px;
}
.radial-indicator-container .percentloop {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
}
 
.radial-indicator-container .circle-left,
.radial-indicator-container .circle-right {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
}
 
.radial-indicator-container .circle-left>div,
.radial-indicator-container .circle-right>div {
  width: 100%;
  height: 100%;
  transform-origin: right center;
  /* transition: all .5s linear; */
}
 
.radial-indicator-container .circle-right {
  left: 50%;
}
 
.radial-indicator-container .circle-right>div {
  transform-origin: left center;
}
 
.radial-indicator-container .content-wrap {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 1);
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #000;
}
 
.radial-indicator-container .content-wrap .content-number {
    font-size: 36px;
    font-weight: bold;
    color: #FFFFFF;
    cursor: pointer;
}
 
.content-text {
    height: 28px;
    font-size: 20px;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 28px;
    cursor: pointer;
    margin-top: 30px;
}
</style>