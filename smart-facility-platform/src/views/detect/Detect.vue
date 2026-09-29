<template>
  <div class="session detect">
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('hardware.detected')" name="first"/>
      <el-tab-pane :label="$t('hardware.histroyLog')" name="second"/>
    </el-tabs>
    <div class="search-bar-container">
      <div>
        <el-date-picker
            v-model="value2"
            :picker-options="pickerOptions"
            class="margin-small-right"
            :end-placeholder="$t('common.endDate')"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            type="daterange"
            unlink-panels>
        </el-date-picker>
        <el-input
            v-model.trim="items.keyword"
            class="input-with-select"
            clearable
            :placeholder="$t('hardware.inputNameOrNo')"
            @keyup.enter.native="handleQuery">
          <el-button slot="append" class="el-button-host" icon="icon-search1" @click="handleQuery"/>
        </el-input>
      </div>
      <div>
        <el-button v-if="$store.state.level" class="icon-addto" type="primary" @click="handleApplyForDetect">
            {{ $t('hardware.addDetect') }}
        </el-button>
      </div>
    </div>
    <inspect-table :total="total" :items="items" :active-name="activeName" :detects.sync="detects" :loading.sync="loading" @handle="handleDeviceDrawer"/>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleQuery"/>
    </div>
    <inspect ref="inspect" @handle="handleQuery"/>
    <device-drawer v-if="deviceDrawer" :id="deviceId" :is-drawer.sync="deviceDrawer"/>
    <device-drawer-new  :id.sync="deviceId" :is-drawer.sync="deviceDrawerNew"/>
    <alerter-drawer v-if="alerterDrawer" :id="alerterId" :is-drawer.sync="alerterDrawer"/>
    <outage-alarm-drawer v-if="outageAlarmDrawer" :id="outageAlarmId" :is-drawer.sync="outageAlarmDrawerNew"/>
    <outage-alarm-drawer-new v-if="outageAlarmDrawerNew" :id="outageAlarmId" :is-drawer.sync="outageAlarmDrawerNew"/>
    <smart-socket-drawer
        v-if="smartSocketDrawer"
        :id="smartSocketId"
        :is-drawer.sync="smartSocketDrawer"
        @handle="handleClose"/>
  </div>
</template>
<script>
import {items, TIME_FORMAT} from "@/utils/constant";
import {getDetectHistoryList, getDetectList} from "@/api/detect";
import Pagination from "@c/Pagination/index";
import moment from "moment";
import Inspect from "@/views/detect/components/Inspect";
import InspectTable from "@c/InspectTable";
import DeviceDrawer from "@/views/device/components/DeviceDrawer";
import DeviceDrawerNew from "@/views/device/components/DeviceDrawerNew";
import smartSocketDrawer from "@/views/smartSocket/components/SmartSocketDrawer";
import outageAlarmDrawer from "@/views/powerOutageAlarm/components/PowerDrawer";
import outageAlarmDrawerNew from "@/views/powerOutageAlarm/components/PowerDrawerNew";
import alerterDrawer from "@/views/alarmAcousto/components/AlerterDrawer";

export default {
  name: "Detect",
  components: {
      DeviceDrawerNew,
      outageAlarmDrawerNew,
    DeviceDrawer,
    smartSocketDrawer,
    alerterDrawer,
    outageAlarmDrawer,
    InspectTable,
    Inspect,
    Pagination,
  },
  data() {
      const _this = this;
    return {
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        departmentId: null,
        keyword: "",
        endDate: "",
        starDate: ""
      },
        deviceDrawerNew: false,
        outageAlarmDrawerNew: false,
      total: 0,
      loading: false,
      detects: [],
      activeName: "first",
      value2: "",
      deviceDrawer: false,
      alerterDrawer: false,
      smartSocketDrawer: false,
      outageAlarmDrawer: false,
      deviceId: "",
      alerterId: "",
      smartSocketId: "",
      outageAlarmId: "",
      pickerOptions: {
        shortcuts: [{
          text: _this.$t('common.recentlyWeek'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t('common.recentlyMonth'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t('common.recentlyThreeMonth'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    };
  },
  created() {
    this.handleQuery();
  },
  watch: {
    activeName: function (value) {
      this.value2 = "";
      this.items = {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        departmentId: null,
        keyword: "",
        endDate: "",
        starDate: ""
      };
      this.handleQuery();
    }
  },
  provide() {
    return {
      query: this.handleQuery
    }
  },
  methods: {
    handleApplyForDetect() {
      this.$refs.inspect.open();
    },
    handleHistoryDetectList() {
      this.handleInitDate();
      getDetectHistoryList(this.items).then(res => {
        this.handleInitDetect(res);
      })
    },
    handleInitDetect(res) {
      this.loading = false;
      if (res.code) {
        this.detects = res.items.list;
        if (res.items.pageNum === items.PAGE_NUM) {
          this.total = res.items.total;
        }
      } else {
        this.$message.error(res.message);
      }
    },
    handleClose(value) {
      this.smartSocketDrawer = value;
    },
    handleInitDate() {
      if (this.value2) {
        this.items.endDate = moment(this.value2[1]).format(TIME_FORMAT);
        this.items.starDate = moment(this.value2[0]).format(TIME_FORMAT);
      } else {
        this.items.endDate = "";
        this.items.starDate = "";
      }
      this.loading = true;
      this.detects = [];
    },
    handleDetectList() {
      this.handleInitDate();
      getDetectList(this.items).then((res) => {
        this.handleInitDetect(res);
      });
    },
    handleQuery() {
      if (this.activeName === "first") {
        this.handleDetectList();
      } else {
        this.handleHistoryDetectList();
      }
    },
    handleDeviceDrawer(item) {
        if(item.openTwoSystem){
            if (!item['type']) {
                console.log(item)
                this.deviceDrawerNew = true;
                this.deviceId = item.strId;
                return
            }
            switch (item.type) {
                case 10:
                    this.deviceDrawerNew = true;
                    this.deviceId = item.strId;
                    break
                case 8:
                    this.outageAlarmDrawerNew = true;
                    this.outageAlarmId = item.strId;
                    break
                default:
                    this.deviceDrawerNew = true;
                    this.deviceId = item.strId;
                    break
            }
        } else {
            if (!item['type']) {
                this.deviceDrawer = true;
                this.deviceId = item.strId;
                return
            }
            switch (item.type) {
                case 10:
                    this.smartSocketDrawer = true;
                    this.smartSocketId = item.strId;
                    break
                case 8:
                    this.outageAlarmDrawer = true;
                    this.outageAlarmId = item.strId;
                    break
                case 7:
                    this.alerterDrawer = true;
                    this.alerterId = item.strId;
                    break
                default:
                    this.deviceDrawer = true;
                    this.deviceId = item.strId;
            }
        }
    }
  },
};
</script>
<style scoped>
.search-bar-container {
  margin-top: 0;
}
</style>
