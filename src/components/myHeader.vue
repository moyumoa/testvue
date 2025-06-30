<template>
    <div v-if="!isMac" class="myHeader_wrap" :class="this.$store.state.blueHead?'blue':''">
        <div class="menu_wrap" v-if="!this.$store.state.blueHead">
            <div class="minimize_wrap" @click="min">
                <img src="@/assets/imgs/min_window.png" alt="">
            </div>
            <div class="close_wrap" @click="close">
                <img src="@/assets/imgs/close_window.png" alt="">
            </div>
        </div>
        <div class="menu_wrap" v-else>
            <div class="minimize_wrap" @click="min">
                <img src="@/assets/imgs/min-window-blue.png" alt="">
            </div>
            <div class="close_wrap" @click="close">
                <img src="@/assets/imgs/close-window-blue.png" alt="">
            </div>
        </div>
    </div>
    <div v-else class="mac_myHeader_wrap" :class="this.$store.state.blueHead?'blue':''"></div>
</template>
<script>
const ipcRenderer = require('electron').ipcRenderer
export default {
    data() {
        return {
            isMac: false
        }
    },
    methods:{
        min(){
            ipcRenderer.send('window-min');  
        },
        close(){
            ipcRenderer.send('window-close');
        }
    },
    created(){
        if(process.platform=='darwin'){
            this.isMac = true
        }else{
            this.isMac = false
        }
    },
    mounted(){

    }
}
</script>
<style lang="less" scoped>
    .myHeader_wrap{
        -webkit-app-region: drag;
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        > .menu_wrap{
            height: 100%;
            display: flex;
            align-items: center;
            -webkit-app-region: no-drag;

            > div{
                height: 24px;
                padding: 0 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                cursor: pointer;
                &:hover{
                    background: rgba(0, 0, 0, 0.1);
                }
                > img{
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }
    .blue{
        background: #68ADFF;

        > .menu_wrap{
            > div{
                &:hover{
                    background: rgba(255, 255, 255, 0.2);
                }
            }
        }
    }
    .mac_myHeader_wrap{
        width: 100%;
        height: 16px;
    }
</style>