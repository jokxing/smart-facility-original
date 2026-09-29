<template>
  <div>
    <el-descriptions :title="$t('hardware.associatedHardwareOverview')">
      <template slot="extra">
        <el-button v-if="$store.state.level" type="primary" @click="handleBindingEquipment">{{ $t("common.bindDevice") }}</el-button>
      </template>
    </el-descriptions>
    <el-table
        v-loading="loading"
        :data="alerterData"
        border
        :default-sort="{order: 'descending'}">
      <el-table-column fixed label="#" width="70px" type="index">
        <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed :label="$t('common.name')" prop="name" sortable>
        <template v-slot="scope">
          <a @click="handleShowDrawer(scope.row)">
            {{ scope.row.name }}
          </a>
        </template>
      </el-table-column>
      <el-table-column fixed :label="$t('common.no')" prop="no" sortable>
        <template v-slot="scope">
          <a @click="handleShowDrawer(scope.row)">
            {{ scope.row.no }}
          </a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.value')" min-width="240">
        <template v-slot="scope">
          <hardwareValue :data="scope.row"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.status')" min-width="170">
        <template v-slot="scope">
          <device-signal :data="scope.row"/>
          <div>{{ $t('hardware.kwh') }}：&nbsp;{{ scope.row.battery }} V</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" :label="$t('common.handle')" min-width="100">
        <template v-slot="scope">
          <el-button type="text" @click="handleDeletAlertor(scope.row)">{{ $t("common.unBind") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleSearchThingsAlertor"/>
    </div>
    <BindingDevice ref="BindingDevice" :thing-type="true" @handle="handleBindingAlertor"/>
  </div>
</template>

<script>
import BindingDevice from "@c/BindingDevice/index";
import Pagination from "@c/Pagination/index";
import {addThingsAlertor, deleteAlertorThings, getSearchThingsAlertor} from "@/api/alertor";
import {items} from "@/utils/constant";
import HardwareValue from "@c/HardwareValue/index";
import DeviceSignal from "@c/DeviceSignal/index";

export default {
  name: "Common",
  props: {
    alerterId: {
      type: [Number, String],
      default: null,
    },
  },
  components: {
    BindingDevice,
    HardwareValue,
    DeviceSignal,
    Pagination
  },
  data() {
    return {
      alerterData: [],
      loading: false,
      items: {
        alertorId: null,
        keyword: "",
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      total: 0,
      isDrawer: false,
      deviceId: null,

    }
  },
  created() {
    this.handleInit();
  },
  methods: {
    handleShowDrawer(id) {
      this.$emit("handle", id)
    },
    handleInit() {
      this.items.alertorId = this.alerterId;
      this.handleSearchThingsAlertor();
    },
    handleBindingEquipment() {
      this.$refs.BindingDevice.open();
    },
    handleDeletAlertor(row) {
      this.$confirm(this.$t("hardware.unBindMessage"), this.$t("hardware.unBindTitle"), {
        type: "warning",
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonText: this.$t("common.confirm")
      }).then(() => {
        deleteAlertorThings({
          thingsId: this.alerterId,
          equipmentId: row.id,
          equipmentType: row.type
        }).then(res => {
          this.handleMessage(res, this.$t("hardware.unBinded"));
          this.handleSearchThingsAlertor();
        })
      }).catch(() => {
        return this.$message.info(this.$t('common.cancelHandle'));
      })
    },
    handleSearchThingsAlertor() {
      this.alerterData = [];
      this.loading = true;
      getSearchThingsAlertor(this.items).then(res => {
        this.loading = false;
        if (res.code) {
          this.alerterData = res.items.list;
          (res.items.pageNum === items.PAGE_NUM && res.items["total"]) && (this.total = res.items.total);
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleBindingAlertor(row) {
      addThingsAlertor({
        thingsId: this.alerterId,
        equipmentId: row.id,
        equipmentType: row.equipmentTypeCode
      }).then(res => {
        this.handleMessage(res, this.$t('hardware.bindSuccess'));
      })
    },
    handleMessage(res, txt) {
      if (res.code) {
        this.$message.success(txt);
        this.handleSearchThingsAlertor();
      } else {
        this.$message.error(res.message);
      }
    },
  },

}
</script>

<style scoped>

</style>
