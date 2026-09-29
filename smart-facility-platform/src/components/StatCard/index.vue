<template>
  <el-card class="p-30" shadow="hover">
    <div @click="handleQuery" class="text-center counter-lg">
      <div class="counter-label text-uppercase">{{ title }}</div>
      <div class="counter-number-group">
        <span class="counter-number" :class="classColor">{{ num }}</span>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "index",
  props: {
    title: {
      type: String,
      default: ""
    },
    num: {
      type: Number,
      default: 0
    },
    classColor: {
      type: String,
      default: ""
    }
  },
  methods: {
    handleQuery() {
      this.$emit("click");
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 0 !important;
}

.p-30 {
  padding: 30px;
  text-align: center;
  margin-right: 16px;
  box-shadow: 1px 0 5px 2px #dfe6ec;
  cursor: pointer;

  .text-center {
    width: 100px;
  }

  .counter-number-group {
    font-size: 40px;
    line-height: 1.571429;
    color: #424242;
  }

  .text-uppercase {
    text-transform: uppercase !important;
  }
}

.counter-label {
  color: #757575;
  font-size: 16px;
}
</style>

