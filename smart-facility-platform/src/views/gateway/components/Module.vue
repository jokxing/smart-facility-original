<template>
  <div>
    <div class="detail-padding">
      <DrawerNav :is-width="false" :name="gateway.name" :type="1" @handle="handleClose"/>
      <el-descriptions :title="$t('common.basicInformation')"></el-descriptions>
      <div class="layout-row">
        <div style="margin-right: 24px">
          <div :class="gateway.status === 1 ? 'circular-normal' : 'circular-abnormal'" class="circular">
            {{ gateway.status === 1 ? $t('common.normal') : $t('common.offLine') }}
          </div>
        </div>
        <div>
          <el-descriptions :column="2">
            <el-descriptions-item :label="$t('common.no')">{{ gateway.macId ? gateway.macId : "" }}</el-descriptions-item>
            <el-descriptions-item :label="$t('hardware.signalStrength')">
              <div v-html="handleSignalStateFilter(gateway.signalStrength)"></div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.companyName')">{{
                gateway.companyName ? gateway.companyName : ""
              }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.owningDepartment')">{{ gateway.departmentName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.creatDate')">{{ gateway.createDate ? $options.filters['localToUtc'](gateway.createDate) : "" }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.reportDate')">{{ gateway.reportDate ? $options.filters['localToUtc'](gateway.reportDate) : "" }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.remark')">{{ gateway.remark ? gateway.remark : "" }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-descriptions :title="$t('hardware.associatedHardwareOverview')"></el-descriptions>
      <el-table
          v-loading="loading"
          :data="device"
          border
          :default-sort="{order: 'descending'}"
          size="medium">
        <el-table-column fixed :label="$t('common.serialNumber')" width="70px" type="index">
          <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed :label="$t('common.name')" sortable>
          <template v-slot="scope">
            <a @click="handleDeviceDrawer(scope.row.strId)">{{ scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.no')" prop="no" sortable></el-table-column>
        <el-table-column :label="$t('hardware.value')" min-width="240">
          <template v-slot="scope">
            <hardwareValue :data="scope.row"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('hardware.status')" min-width="190">
          <template v-slot="scope">
            <device-signal :data="scope.row"/>
            <div>{{ $t('hardware.kwh') + "：" + scope.row.battery + "  V" }}</div>
            <div v-if="scope.row.panId">PanId：{{ scope.row.panId }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.reportDate')" prop="reportDate" min-width="160" sortable>
            <template v-slot="scope">
                {{ scope.row.reportDate | localToUtc }}
            </template>
        </el-table-column>
        <el-table-column :label="$t('common.owningDepartment')" prop="departmentName" sortable/>
      </el-table>
      <div class="paging">
        <pagination
            v-show="total > 10"
            :limit.sync="items.pageSize"
            :page.sync="items.pageNum"
            :total="total"
            @pagination="getList"/>
      </div>
    </div>
    <drawer :hideSensorsTypes="[17,1001]" :id="deviceId" :is-drawer.sync="isDeviceDrawer"/>
  </div>
</template>
<script>
import Pagination from "@/components/Pagination"
import {getGatewayAround, getGatewayDetail} from "@/api/gateway";
import {items} from "@/utils/constant";
import {signalStateFilter} from "@/utils/methods"
import HardwareValue from "@/components/HardwareValue";
import DeviceSignal from "@/components/DeviceSignal"
import moment from "moment"
import Drawer from "@/views/device/components/DeviceDrawerNew";
import DrawerNav from "@c/DrawerNav/index";
import DeviceStatusGarden from "@c/DeviceStatusGarden/index";

export default {
  name: "Module",
  components: {
    Drawer,
    Pagination,
    DeviceStatusGarden,
    HardwareValue,
    DeviceSignal,
    DrawerNav
  },
  props: {
    id: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      device: [],
      loading: false,
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      gateway: {},
      total: 0,
      gatewayId: null,
      deviceId: "",
      isDeviceDrawer: false
    }
  },
  mounted() {
    this.getGatewayDetail();
  },
  computed: {
    statusType() {
      const newTime = moment().format("YYYY-MM-DD HH:mm:ss");
      let m1 = moment(newTime),
          m2 = moment(this.gateway.reportDate);
      return Math.abs(m2.diff(m1, 'minute')) <= 120;
    }
  },
  methods: {
    getGatewayDetail() {
      getGatewayDetail({gatewayId: this.id}).then(res => {
        if (res.code) {
          this.gatewayId = res.items.id;
          this.gateway = res.items;
          this.getList();
        }
      });
    },
    getList() {
      this.loading = true;
      getGatewayAround({
        concentratorId: this.gatewayId,
      }).then(res => {
        if (res.code) {
          this.device = res["items"] && res.items;
          if (res["items"] && res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total;
          }
        }
        this.loading = false;
      })
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "", 0, 10, 20);
    },
    handleDeviceDrawer(id) {
      this.deviceId = id;
      this.isDeviceDrawer = true;
    },
    handleClose() {
      this.$emit("handleCloseDrawer", false);
    }
  }
}
</script>
