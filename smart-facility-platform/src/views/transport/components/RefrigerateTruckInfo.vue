<template>
  <el-drawer
      :before-close="handleClose"
      :modal="false"
      :visible.sync="isDrawer"
      :with-header="false"
      size="70%">

    <div v-if="isDrawer" class="detail-container" v-loading="loading">

      <!--   标题     -->
      <div class="detail-padding">
        <div class="clearfix ng-binding ">
          ▍ {{ obj.name }}
          <el-button type="text" @click="handleClose">
            <i class="el-icon-close"/>
          </el-button>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="detail-padding">
        <el-descriptions :column="4" :title="$t('common.basicInformation')">
          <template slot="extra">
            <el-button
                type="primary"
                class="icon-edit"
                @click="handleEdit">
                {{ $t('common.edit') }}
            </el-button>
          </template>
          <el-descriptions-item :label="$t('transport.carBoard')">{{ details.carBoard }}</el-descriptions-item>
          <el-descriptions-item :label="$t('transport.brandName')">{{ details.brandName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('transport.modelName')">{{ details.modelName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.createName')">{{ details.createUserName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('transport.driverName')">
            {{ details.driverName }}
            &nbsp;
            <el-button
                type="text"
                style="padding: 0;"
                @click="handleSetDriver">
                {{ $t('labDevice.change') }} >
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('transport.driverTel')">{{ details.tel }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.creatDate')">{{ details.createDate }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <!-- 最新状态 -->
      <div class="detail-padding-nocolor" v-loading="stateLoading">
        <el-descriptions :column="4" :title="$t('hardware.newStatus')">
          <template slot="extra">
<!--            <el-button-->
<!--                icon="icon-add-to"-->
<!--                @click="$refs.sensorTable.open(0, obj.type, {id:obj.id,no:obj.no})">-->
<!--                {{ $t('labDevice.addSensor') }}-->
<!--            </el-button>-->
            <el-button
                icon="icon-edit"
                @click="$refs.probeNameEdit.open({id: obj.id, no:obj.no}, obj.type)">
                {{ $t('labDevice.sensorEdit') }}
            </el-button>
            <el-button
                icon="icon-reset"
                @click="getNewStates">
                {{ $t('hardware.reset') }}
            </el-button>
          </template>
        </el-descriptions>
        <div class="new-state" v-if="sensors.length > 0" >
          <el-row :gutter="20">
            <el-col v-for="(item, index) in sensors" :key="index" :sm="8" :xl="8">
              <MonitorSensor v-if="!item.deleteFlag" :sensors="item"/>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 车辆运单记录 -->
      <div class="detail-padding">
        <el-descriptions :column="4" :title="$t('transport.vehicleLog')">
          <template #extra>
            <el-button icon="icon-export" @click="exportWaybills">
                {{ $t('common.export') }}
            </el-button>
          </template>
        </el-descriptions>
        <el-table
            stripe
            v-loading="historyWaybillLoading"
            border
            :data="historyWaybills">
          <el-table-column
              fixed="left"
              label="#"
              width="60px"
              align="center">
            <template v-slot="scope">
              {{ (historyWaybillsQuery.pageNum - 1) * historyWaybillsQuery.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="transportNo" :label="$t('transport.transportNo')"/>
          <el-table-column prop="professionNo" :label="$t('transport.professionNo')"/>
          <el-table-column prop="driverName" :label="$t('transport.driverName')"/>
          <el-table-column prop="driverTel" :label="$t('transport.driverTel')"/>
          <el-table-column prop="createUserName" :label="$t('transport.transportUserName')"/>
          <el-table-column :label="$t('transport.consigner')">
            <template v-slot="{row}">
              {{ row.deliverUnits }}
              -
              {{ row.deliverName }}
              -
              {{ row.deliverAddress }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('transport.consignee')">
            <template v-slot="{row}">
              {{ row.receiveUnits }}
              -
              {{ row.receiveName }}
              -
              {{ row.receiveAddress }}
            </template>
          </el-table-column>
          <el-table-column prop="createDate" :label="$t('transport.transportCreateDate')">
              <template v-slot="{row}">
                  {{ row.createDate | localToUtc }}
              </template>
          </el-table-column>
          <el-table-column prop="completeTime" :label="$t('transport.transportCompleteTime')">
              <template v-slot="{row}">
                  {{ row.completeTime | localToUtc }}
              </template>
          </el-table-column>
        </el-table>
        <div class="paging">
          <pagination
              v-show="historyWaybillsTotal > 10"
              :limit.sync="historyWaybillsQuery.pageSize"
              :page.sync="historyWaybillsQuery.pageNum"
              :total="historyWaybillsTotal"
              @pagination="getWaybills"/>
        </div>
      </div>
    </div>
    <!--  组件  -->
<!--    <MonitorInfo class="detail-padding" v-if="sensorsFlag.length > 0 && details" :objId="obj.id" :sensors="sensorsFlag" :type="obj.type" />-->
    <SelectDriverDialog ref="selectDriverDialog" :dialogTitle="$t('transport.allocationDrivers')"/>
    <CreateRefrigerateTruck ref="creatTruck" @updated="updated"/>
    <AdvancedAlarmSet ref="AdvancedAlarmSet" @handle="getDetail"/>
    <ProbeNameEdit
        ref="probeNameEdit"
        @handle="getNewStates"
        @handleSensorTable="handleSensorTable"/>
    <SensorTable
        ref="sensorTable"
        @handle="getNewStates"
        @handleProbeNameEdit="$refs.probeNameEdit.handleSensorChange(1)"/>
  </el-drawer>
</template>

<script>
import SensorTable from "@c/SensorTable";
import AdvancedAlarmSet from "@/views/AdvancedAlarmSet/index";
import SelectDriverDialog from "@/views/transport/components/SelectDriverDialog"
import CreateRefrigerateTruck from "@/views/transport/components/CreateRefrigerateTruck"
import Pagination from "@c/Pagination";
import MonitorSensor from "@c/MonitorSensor";
import {
  exportRefrigerateCarWaybill,
  getRefrigerateCarDetails,
  getRefrigerateCarWaybill,
  updateRefrigerateCarDriver
} from "@/api/transport";
import moment from "moment";
import mixin from "@/utils/mixin";
import {getOpenMonitorFlag} from "@/api/monitorIndicator";
import ProbeNameEdit from "@c/ProbeNameEditNew";


export default {
  name: "RefrigerateTruckInfo",
  emits: ['updatedInfo'],
  components: {
    SensorTable,
    AdvancedAlarmSet,
    SelectDriverDialog,
    CreateRefrigerateTruck,
      ProbeNameEdit,
    Pagination,
    MonitorSensor,
  },
  data() {
    return {
      obj: {
        id: null,
        type: 5, // 车辆
        name: '',
        no: ''
      },
      isDrawer: false,
      loading: false,
      // 基本信息
      details: {},
      // 最新状态
      sensors: [],
      stateLoading:false,
      // 运单记录
      historyWaybills: [],
      historyWaybillsTotal: 0,
      historyWaybillLoading: false,
      historyWaybillsQuery: {
        pageNum: 1,
        pageSize: 10,
      },
    }
  },
  methods: {
    open(obj) {
      this.obj = {type: 5, ...obj};
      this.isDrawer = true;
      this.getDetail();
      this.getNewStates();
      this.getWaybills();
    },
    getDetail() {
      this.loading = true;
      getRefrigerateCarDetails(this.obj.id).then(res => {
        if (res.code) {
          this.details = res.items;
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    getNewStates() {
      const data = {
        objId: this.obj.id,
        objType: this.obj.type,
      };
      this.stateLoading = true;
      getOpenMonitorFlag(data).then(res => {
        if(res.code === 1){
          this.sensors = res.items.list;
        }
      }).finally(()=>{
        this.stateLoading = false;
      })
    },
    getWaybills() {
      this.historyWaybillLoading = true;
      getRefrigerateCarWaybill({
        ...this.historyWaybillsQuery,
        ...this.obj
      }).then(res => {
        if (res.code) {
          this.historyWaybills = res.items.list;
          this.historyWaybillsTotal = res.items.total;
        }
      }).finally(() => {
        this.historyWaybillLoading = false;
      })
    },
    exportWaybills() {
      new Promise(resolve => {
        this.$message.warning(this.$t('common.exportMessage'));
        setTimeout(() => {
          resolve();
        }, 1500)
      }).then(() => {
        exportRefrigerateCarWaybill({carId: this.obj.id}).then(res => {
          const data = moment(new Date()).format("YYYYMMDDHHmmss");
          mixin.methods.download(
              res,
              decodeURIComponent(this.$t('route.refrigeratedTruck')+'（'+this.details.carBoard+"）- "+ this.$t('transport.transportLogExport') +" - " + data, "UTF-8")
          )
        })
      })
    },

    handleSetDriver() {
      this.$refs.selectDriverDialog.openSelect(driverId => {
        updateRefrigerateCarDriver({id: this.obj.id, driverId}).then(res => {
          this.getDetail();
          this.$emit('updatedInfo');
        });
      });
    },
    handleEdit() {
      this.$refs.creatTruck.open(1, this.obj.id);
    },
    updated() {
      this.getDetail();
      this.$emit('updatedInfo');
    },

    // 探头编辑-更换
    handleSensorTable(row) {
      this.$refs.sensorTable.open(1, 2, row);
    },

    handleClose() {
      this.isDrawer = false;
    },
  }
}
</script>

<style lang="less" scoped>

@import "../../../style/variable";

.ng-binding {
  font-size: 20px;
  font-weight: @fwbold;
  color: @subjectColor;
}
</style>