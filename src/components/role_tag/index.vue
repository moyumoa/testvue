<template>
  <div class="role-tag">
    <p class="role pink" v-if="role === '管理员'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role blue" v-if="role === '主播'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role green" v-if="role === '场控'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role orange" v-if="role === '运营'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role purple" v-if="role === '中控'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role cyan" v-if="role === '投手'">
      <span class="scale-size">{{ role }}</span>
    </p>
    <p class="role red" v-if="role === '财务'">
      <span class="scale-size">{{ role }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'roleTag',
  props: {
    role: {
      type: String,
      default: '主播'
    }
  }
}
</script>

<style lang="scss" scoped>
.role {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 16px;
  border-radius: 9px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 400;
  .scale-size {
    display: inline-block;
    transform: scale(0.83);
  }
}
.blue {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}
.green {
  background: #dcf8d5;
  border: 1px solid #bff2b2;
  color: #27c24e;
}
.red {
  background: #ffcecc;
  border: 1px solid #ffa5a2;
  color: #ff0b00;
}
.orange {
  background: #feefd0;
  border: 1px solid #fde3ac;
  color: #faad14;
}
.purple {
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  color: #722ed1;
}
.pink {
  background: #fff0f6;
  border: 1px solid #ffadd2;
  color: #eb2f96;
}
.cyan {
  background: #e6fffb;
  border: 1px solid #9aebe3;
  color: #13c2c2;
}
</style>
