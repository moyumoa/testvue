<template>
  <div class="login_wrap">
    <img class="logo_img" src="@/assets/imgs/login_logo.png" alt="">
    <div class="change_wrap">
      <span :class="loginType===1?'active':''" @click="changeType(1)">密码登录</span>
      <b></b>
      <span :class="loginType===2?'active':''" @click="changeType(2)">验证码登录</span>
    </div>
    <div v-if="loginType===1" class="login_form login_password">
      <div class="input_wrap" :class="login_mobile_tip?'red_border':''">
        <img src="@/assets/imgs/phone-icon.png" alt="">
        <el-input v-model="login_mobile" placeholder="请输入手机号" maxlength="20" @blur="phoneBlur"></el-input>
        <p v-show="login_mobile_tip" class="login_tip">{{login_mobile_tip}}</p>
      </div>
      <div class="input_wrap" :class="login_password_tip?'red_border':''">
        <img src="@/assets/imgs/password-icon.png" alt="">
        <el-input v-model="login_password" placeholder="请输入密码" type="password" maxlength="20" @blur="passwordBlur"></el-input>
        <p v-show="login_password_tip" class="login_tip">{{login_password_tip}}</p>
      </div>
    </div>
    <div v-else class="login_form">
      <div class="input_wrap" :class="code_mobile_tip?'red_border':''">
        <img src="@/assets/imgs/phone-icon.png" alt="">
        <el-input v-model="code_mobile" placeholder="请输入手机号" maxlength="20" @blur="codePhoneBlur"></el-input>
        <p v-show="code_mobile_tip" class="login_tip">{{code_mobile_tip}}</p>
      </div>
      <div class="input_wrap verifyCode_input" :class="code_value_tip?'red_border':''">
          <img src="@/assets/imgs/password-icon.png" alt="">
          <el-input v-model="code_value" placeholder="请输入验证码" maxlength="20" @blur="codeBlur"></el-input>
          <span></span>
          <div v-if="code_iscode===1" class="get_code_wrap" @click="getLoginCode" v-debounce>获取验证码</div>
          <div v-else class="get_code_wrap down_code_wrap">{{code_count}}秒后获取</div>
          <p v-show="code_value_tip" class="login_tip">{{code_value_tip}}</p>
        </div>
    </div>
    <div class="login_btn" @click="loginType===1?login():loginCode()" v-debounce>登 录</div>
  </div>
</template>

<script>
import api from '@/api/login'
import md5 from 'js-md5'
import electronStore from 'electron-store'
// import store from '../../store'
const localsStore = new electronStore();

export default {
  data(){
    return{
      // 密码登录
      loginType: 1,
      login_mobile: '', // 手机号
      login_password: '', // 密码
      login_mobile_tip: '', // 手机号提示
      login_password_tip: '', // 密码提示
      // 验证码登录
      code_mobile: '', // 手机号
      code_value: '', // 验证码
      code_mobile_tip: '', // 手机号提示
      code_value_tip: '', // 验证码提示
      code_iscode: 1, // 验证码
      code_count: 30, // 验证码倒计时
    }
  },
  methods:{
    // 选择登录方式
    changeType(type){
      this.loginType = type
    },
    // 输入框失去焦点
    phoneBlur(){
      if(this.login_mobile===''){
        this.login_mobile_tip = '请输入手机号'
        return
      }else if(!(/^1[3456789]\d{9}$/.test(this.login_mobile))){
        this.login_mobile_tip = '请输入正确的手机号'
        return
      }else{
        this.login_mobile_tip = ''
      }
    },
    // password
    passwordBlur(){
      if(this.login_password===''){
        this.login_password_tip = '请输入密码'
        return
      }else{
        this.login_password_tip = ''
      }
    },
    // codephone
    codePhoneBlur(){
      if(this.code_mobile===''){
        this.code_mobile_tip = '请输入手机号'
        return
      }else if(!(/^1[3456789]\d{9}$/.test(this.code_mobile))){
        this.code_mobile_tip = '请输入正确的手机号'
        return
      }else{
        this.code_mobile_tip = ''
      }
    },
    // codeBlur
    codeBlur(){
      if(this.code_value===''){
        this.code_value_tip = '请输入验证码'
        return
      }else{
        this.code_value_tip = ''
      }
    },
    // 获取验证码-登录
    getLoginCode(){
      let _this = this;
      _this.code_mobile_tip = '';
      if(!_this.code_mobile){
        _this.code_mobile_tip = '请输入手机号'
        return
      }else if(!(/^1[3456789]\d{9}$/.test(_this.code_mobile))){
        _this.code_mobile_tip = '请输入正确的手机号'
        return
      }else{
        _this.code_iscode = 2;
        _this.code_count = 30;
        let timer = setInterval(() => {
          _this.code_count--;
          if (_this.code_count <= 0) {
            clearInterval(timer);
            _this.code_iscode = 1;
          }
        }, 1000);
        let data = {
          phone: _this.code_mobile
        }
        api.getCode(data).then().catch(res=>{
          _this.code_mobile_tip = res.msg
          _this.code_count = 0
          clearInterval(timer);
          _this.code_iscode = 1;
        })
      }
    },
    // 密码登录
    login(){
      let _this = this;
      _this.login_mobile_tip = '';
      _this.login_password_tip = '';
      if(!_this.login_mobile){
        _this.login_mobile_tip = '请输入手机号'
        return
      }else if(!(/^1[3456789]\d{9}$/.test(_this.login_mobile))){
        _this.login_mobile_tip = '请输入正确的手机号'
        return
      }else if(_this.login_password==''){
        _this.login_password_tip = '请输入密码'
        return
      }
      let data = {
        phone: _this.login_mobile,
        password: md5(_this.login_password),
        loginType: 2,
        pwdType: 'password'
      }
      api.loginAccount(data).then(res=>{
        console.log(res.data)
        localsStore.set('USERTOKEN', res.data.tokenValue);
        localsStore.set('USERNAME', res.data.userName);
        localsStore.set('userInfo', res.data);
        localsStore.set('USERPHONE', _this.login_mobile);
        _this.$router.push({ name: "login_company" });
      }).catch(res=>{
        _this.login_password_tip = res.msg
      })
    },
    // 验证码登录
    loginCode(){
      let _this = this;
      _this.code_mobile_tip = '';
      _this.code_value_tip = '';
      if(!_this.code_mobile){
        _this.code_mobile_tip = '请输入手机号'
        return
      }else if(!(/^1[3456789]\d{9}$/.test(_this.code_mobile))){
        _this.code_mobile_tip = '请输入正确的手机号'
        return
      }else if(_this.code_value==''){
        _this.code_value_tip = '请输入验证码'
        return
      }
      let data = {
        phone: _this.code_mobile,
        checkCode: _this.code_value,
        loginType: 2
      }
      api.codeLogin(data).then(res=>{
        localsStore.set('USERTOKEN', res.data.tokenValue);
        localsStore.set('USERNAME', res.data.userName);
        localsStore.set('userInfo', res.data);
        localsStore.set('USERPHONE', _this.code_mobile);
        _this.$router.push({ name: "login_company" });
      }).catch(res=>{
        _this.code_value_tip = res.msg
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import './login.less';
</style>