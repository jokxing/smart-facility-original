<template>
  <div class="ip-input">
    <div v-for="(item, index) in ipArray" :key="index" class="ip-input-value">
      <el-input
          v-model.trim="item.value"
          maxlength="3"
          oninput="value=value.replace(/[^0-9]/g, '')"
          @blur="handleBlur(item, index)"
          @input="handleVerify(item, index)"></el-input>
      <span v-if="index !== 3">.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "IpInput",
  props: {
    ip: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      ipArray: [
        {value: ""},
        {value: ""},
        {value: ""},
        {value: ""},
      ]
    }
  },
  mounted() {
    if (this.ip) {
      this.ip.split(".").map((item, index) => {
        this.$set(this.ipArray, index, {value: item})
      })
    }
  },
  watch: {
    ipArray: {
      handler: function (ipArray) {
        this.$emit("handle", this.ipArray);
      },
      deep: true
    }
  },
  methods: {
    handleVerify(item, index) {
      if (item.value > 255) {
        return this.$message.warning(this.$t("hardware.ipInput"))
      }
    },
    handleBlur(item, index) {
      if (index === 3 && !item.value) {
        let bool = 0;
        this.ipArray.map((ip, i) => {
          if (ip.value && i <= 2) {
            bool += 1;
          }
        })
        bool === 3 && (item.value = 0);
      }
    },
  }
}
</script>

<style lang="less" scoped>
.ip-input {
  width: 230px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  border: 1px solid #e5e5e5;
  border-radius: 4px;

  .ip-input-value {
    display: flex;
    width: 100%;
    height: 100%;

    /deep/ .el-input__inner {
      border: none;
      width: 53px;
      height: 100%;
      text-align: end;
    }

    span {
      line-height: 3;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.ip-input:focus-within {
  border: 1px solid #1890ff;
}
</style>
