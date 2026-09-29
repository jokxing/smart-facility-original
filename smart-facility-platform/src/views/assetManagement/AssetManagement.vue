<template>
  <div class="asset session">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="采购申请" name="10">
        <purchase-request/>
      </el-tab-pane>
      <el-tab-pane label="领用/退还单" name="1">
        <receive/>
      </el-tab-pane>
      <el-tab-pane label="借用/归还单" name="2">
        <borrow/>
      </el-tab-pane>
      <el-tab-pane label="使用/预约单" name="3">
        <reservation-list/>
      </el-tab-pane>
      <el-tab-pane label="设备文件受控" name="4">
        <equipment-file/>
      </el-tab-pane>
      <el-tab-pane label="报修单" name="5">
        <maintenance-form/>
      </el-tab-pane>
      <el-tab-pane label="维修单" name="6">
        <repair-bill/>
      </el-tab-pane>
      <el-tab-pane label="资产变更" name="7">
        <assets-change/>
      </el-tab-pane>
      <el-tab-pane label="处置单" name="8">
        <ticket/>
      </el-tab-pane>
      <el-tab-pane label="入库验收" name="11">
        <check-and-accept/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Receive from "@/views/assetManagement/components/Receive";
import Borrow from "@/views/assetManagement/components/Borrow";
import ReservationList from "@/views/assetManagement/components/ReservationList";
import EquipmentFile from "@/views/assetManagement/components/EquipmentFile";
import MaintenanceForm from "@/views/assetManagement/components/MaintenanceForm";
import AssetsChange from "@/views/assetManagement/components/AssetsChange";
import AssetInventory from "@/views/assetManagement/components/AssetInventory";
import PurchaseRequest from "@/views/assetManagement/components/PurchaseRequest";
import CheckAndAccept from "@/views/assetManagement/components/CheckAndAccept";
import Ticket from "@/views/assetManagement/components/Ticket";
import RepairBill from "@/views/assetManagement/components/RepairBill";
export default {
  name: "AssetManagement",
  components: {
    RepairBill,
    Ticket,
    CheckAndAccept,
    PurchaseRequest,
    AssetInventory,
    AssetsChange,
    MaintenanceForm,
    EquipmentFile,
    ReservationList,
    Borrow,
    Receive
  },
  data() {
    return {
      activeName: "10"
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
