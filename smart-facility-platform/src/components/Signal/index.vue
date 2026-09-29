<template>
  <div class="signal">
    <div :class="`signalState ${data.signalStrength > weak ? 'signalState-weak' : ''}`"/>
    <div :class="`signalState ${data.signalStrength > center ? 'signalState-centre' : ''}`"/>
    <div :class="`signalState ${data.signalStrength > strong ? 'signalState-strong' : ''}`"/>
    <div class="signalStateTitle" v-html="handleSignalStateFilter(data.signalStrength)">
    </div>
  </div>
</template>
<script>
import {signalStateFilter} from "@/utils/methods";

export default {
  name: "index",
  props: ["data"],
  data() {
    return {
      weak: 0,
      center: 10,
      strong: 20
    }
  },
  methods: {
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "", 0, 10, 20);
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../style/signal.less";
</style>
