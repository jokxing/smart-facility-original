<template>
    <div v-html="handleSignalStateFilter(data.signalStrength)">
    </div>
</template>
<script>
import {signalStateFilter} from "@/utils/methods";

export default {
    name: "index",
    props:{
      data: {
        type: Object,
        default: () => {}
      },
      type: {
        type: [Number,String],
        default: 0
      }
    },
  data(){
    return {
      weak: -82,
      center: -72,
      strong: 0
    }
  },
  methods: {
    handleSignalStateFilter(data) {
      return (this.type ? "" : this.$t('hardware.signalStrength') + "：") + signalStateFilter(data, "dBm", this.weak, this.center, this.strong);
    }
  }
}
</script>
