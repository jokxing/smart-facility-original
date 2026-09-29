<template>
  <el-select
    v-model="model"
    :placeholder="placeholder"
    filterable
    remote
    :remote-method="remoteMethod"
    :loading="loading"
  >
    <el-option
      v-for="item in data"
      :label="item[options.label]"
      :value="item[options.value]"
      :key="item[options.value]"
    ></el-option>
  </el-select>
</template>

<script>
import { throttle } from "@/utils/methods";
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    vmodel: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default: () => ({
        label: "name",
        value: "id",
        key: "id",
      }),
    },
  },
  data() {
    return {
      model: this.vmodel,
      loading: false,
    };
  },
  watch: {
    model: {
      handler(newVal) {
        this.$emit("set_model_value", newVal);
      },
      immediate: true,
    },
  },
  methods: {
    remoteMethod(query) {
      let _ = this;
      throttle(
        function () {
          //节流函数
          _.loading = true;
          _.$emit("remote_method", query);
        },
        300,
        { leading: true }
      )();
      _.loading = false;
    },
  },
};
</script>
