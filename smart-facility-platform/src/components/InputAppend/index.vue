<template>
  <el-input
      v-model.trim="keyword"
      class="input-with-select"
      clearable
      :placeholder="placeholder"
      @clear="handleClear"
      @keyup.enter.native="handleReturnValue">
    <el-button
        slot="append"
        class="el-button-host"
        icon="icon-search1"
        @click="handleReturnValue">
    </el-button>
  </el-input>
</template>

<script>
import i18n from "@/i18n";
export default {
  name: "index",
  props: {
    placeholder: {
      type: String,
      default: i18n.t("common.inputKeyword")
    }
  },
  data() {
    return {
      keyword: ""
    }
  },
  methods: {
    handleReturnValue() {
      this.$emit("update:keyword", this.keyword)
      this.$emit("handle", this.keyword);
    },
    handleClear() {
      this.$emit("update:keyword", "")
      this.$emit("handle", "");
    }
  }
}
</script>

<style scoped>

</style>
