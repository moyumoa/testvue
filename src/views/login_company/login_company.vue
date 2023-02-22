<template>
  <div class="home_wrapper" >
    <div class="head_wrap">
      <h4 class="name">{{userPhone}}</h4>
      <img class="logo" src="@/assets/imgs/video-icon.png" alt="">
      <img class="name_logo" src="@/assets/imgs/name-logo.png" alt="">
    </div>
    <div class="home_container">
      <div class="form_wrap">
        <div class="form_item">
          <div class="input_wrap">
            <span>品牌</span>
            <b></b>
            <!-- 下拉框 -->
            <el-select v-model="selectedBrandId" placeholder="请选择品牌">
              <el-option
                  v-for="option in brandList"
                  :key="option.brandId"
                  :label="option.brandName"
                  :value="option.brandId"
              ></el-option>
            </el-select>
            <img src="@/assets/imgs/select-icon.png" alt="">
          </div>
        </div>
        <div class="upload_btn" @click="goNext" v-debounce>进入后台</div>
        <div class="back_btn" @click="goback" v-debounce>返回上一步</div>
      </div>
    </div>
  </div>
</template>
<script>
import electronStore from 'electron-store'
import api from '../../api';
const localsStore = new electronStore();
const _store = new electronStore();
export default {
  inject: ['reload'],
  data(){
    return{
      userName: '',
      userPhone: _store.get('USERPHONE'),
      // 品牌
      brandList: _store.get('userInfo.loginBrandVos') ,
      selectedBrand: {},
      selectedBrandId: null,
    }
  },
  created() {
    this.brandList = _store.get('userInfo.loginBrandVos')
    this.selectedBrandId = this.brandList[0].brandId
  },
  methods:{
    goback(){
      this.$router.push({ name: "login" });
    },

    goNext(){
      const param={
        brandId: this.selectedBrandId,
        loginCode: _store.get('userInfo.loginCode'),
        loginType: 2,
        userId: this.brandList[0].userId   // userId都一样
      }
      api.loginAccount(param).then(res=>{
        // 成功了就进入
        localsStore.set('USERTOKEN', res.data.tokenValue);
        localsStore.set('USERNAME', res.data.userName);
        this.$router.push({ name: "home" })
        console.log(res)
      }).catch(res=>{
        this.$message.error(res.msg)
        if(res.code == 200002){
          this.goback()
        }
        console.log(res.msg)
      })
    },
  },
}
</script>
<style lang="less" scoped>
@import './login_company.less';
</style>