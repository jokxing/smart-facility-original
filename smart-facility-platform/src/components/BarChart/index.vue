<template>
  <ve-bar
      :data="dataCharts"
      :loading="dataCharts.loading"
  />
</template>

<script>
import VeBar from "v-charts/lib/bar.common"

export default {
  name: "index",
  components: {
    VeBar
  },
  props: {
    dataCharts: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>

</style>
