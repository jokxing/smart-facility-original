<template>
  <div class="asset-maintenance session">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="定期保养计划" name="1">
        <upkeep-plan/>
      </el-tab-pane>
      <el-tab-pane label="资产维保" name="2">
        <maintenance/>
      </el-tab-pane>
      <el-tab-pane label="资产点检" name="3">
        <spot-check/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import UpkeepPlan from "@/views/assetMaintenance/components/UpkeepPlan";
import Maintenance from "@/views/assetMaintenance/components/Maintenance";
import SpotCheck from "@/views/assetMaintenance/components/SpotCheck";

export default {
  name: "AssetMaintenance",
  components: {
    SpotCheck,
    Maintenance,
    UpkeepPlan
  },
  data() {
    return {
      activeName: "1"
    }
  },
  methods: {
    handleClick() {
    }
  }
}
</script>

<style scoped>

</style>
