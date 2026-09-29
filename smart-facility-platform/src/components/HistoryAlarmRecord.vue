<template>
  <div>
    <el-radio-group v-if="isTab" v-model="tabPosition" style="margin-bottom: 16px">
      <el-radio-button v-for="item in sensors" :key="item.id" :label="item.id">{{ item.name }}</el-radio-button>
    </el-radio-group>
    <el-tabs v-model="sensorsType" @tab-click="handleCutType">
      <el-tab-pane
          v-for="(item, index) in idxType"
          :key="item.idx"
          :label="item.sensorType.name"
          :name="index + ''"
          :disabled="disabled"
      >
        <AlarmTable
            :is-column="IS_Colum[item.type] && 1000"
            :items="alarmItems"
            :loading="alarmLoading"
            :table-data.sync="alarmMessages"
            :total="alarmTotal"
            @handle="handleAlarmProcess"
        />
      </el-tab-pane>
      <el-tab-pane :disabled="disabled" :label="$t('common.offLineAlarm')" name="1000">
        <AlarmTable
            :is-column="1000"
            :items="alarmItems"
            :loading="alarmLoading"
            :table-data.sync="alarmMessages"
            :total="alarmTotal"
            @handle="handleAlarmProcess"/>
      </el-tab-pane>
      <el-tab-pane :disabled="disabled" :label="$t('labDevice.myAlarm')" name="2000">
        <el-table
            v-loading="alarmLoading"
            :data="alarmMessages"
            :default-sort="{order: 'descending'}"
            :row-height="40"
            border
            class="mt8">
          <el-table-column fixed label="#" width="70px" type="index">
            <template v-slot="scope">
            <span v-if="`${alarmTotal !== 0}`">{{
                (alarmItems.pageNum - 1) * alarmItems.pageSize + scope.$index + 1
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
              key="0"
              :show-overflow-tooltip="true"
              :label="$t('hardware.alarmValue')"
              prop="value">
            <template v-slot="scope">
              <span>{{ handleAlarmScope(scope.row).value }}</span>
            </template>
          </el-table-column>
          <el-table-column
              key="1"
              :show-overflow-tooltip="true"
              :label="$t('hardware.alarmScoped')">
            <template v-slot="scope">
              <span>{{ handleAlarmScope(scope.row).scope }}</span>
            </template>
          </el-table-column>
          <el-table-column
              :show-overflow-tooltip="true"
              :label="$t('hardware.alarmType')">
            <template v-slot="scope">
              {{ handleSensorType(scope.row.sensorType) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('labDevice.alarmStartTime')" min-width="150" prop="createDate" sortable>
              <template v-slot="{row}">
                  {{ row.createDate | localToUtc }}
              </template>
          </el-table-column>
          <el-table-column
              :show-overflow-tooltip="true"
              :label="$t('common.receptionUse')"
              prop="userName"/>
          <el-table-column
              :show-overflow-tooltip="true"
              :label="$t('common.receptionType')"
              prop="receptionList">
            <template v-slot="scope">
              <div v-for="item in scope.row.receptionList">
                {{ item }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.receptionTime')" prop="messageDate" min-width="150" sortable>
              <template v-slot="{row}">
                  {{ row.messageDate | localToUtc }}
              </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div class="paging">
      <pagination
          v-show="alarmTotal > alarmItems.pageSize"
          :limit.sync="alarmItems.pageSize"
          :page.sync="alarmItems.pageNum"
          :total.sync="alarmTotal"
          @pagination="handleGetAlarmList"/>
    </div>
    <AlarmProcessing ref="AlarmProcessing" @handle="handleCutType"/>
  </div>
</template>

<script>
import AlarmTable from "@c/AlarmTable/index";
import Pagination from "@c/Pagination/index";
import {getAlarmHistoryDevice, getHistoryDeviceAlarm} from "@/api/device";
import {items} from "@/utils/constant";
import AlarmProcessing from "@/views/device/components/AlarmProcessing";
import {sensorType} from "@/utils/methods";

let lastName, id;
export default {
  name: "HistoryAlarmRecord",
  components: {
    AlarmTable,
    Pagination,
    AlarmProcessing
  },
  props: {
    sensors: {
      type: Array,
      default: () => []
    },
    isTab: {
      type: Boolean,
      default: true
    },
    thingsId: {
      type: [String, Number],
      default: ""
    },
    thingsType: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      sensorsType: "",
      isColumn: null,
      alarmLoading: false,
      alarmMessages: [],
      tabPosition: "",
      idxType: [],
      alarmTotal: 0,
      alarmItems: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      type: 1,
      idx: null,
      disabled: false
    }
  },
  watch: {
    tabPosition: {
      handler: function (newValue, old) {
        this.sensors.map(item => {
          if (item.id == newValue) {
            this.idxType = item.sensors;
            this.sensorsType = "0";
          }
        });
        if (!this.idxType.length) {
          this.sensorsType = "1000";
        }
        this.handleCutType();
      },
      deep: true
    },
    sensors: {
      handler: function (newValue) {
        this.handleSensorBtnType(newValue);
      },
      deep: true
    }
  },
  mounted() {
    lastName = "";
    this.handleSensorBtnType(this.sensors);
  },
  methods: {
    handleSensorBtnType(array) {
      if (array.length) {
        const obj = array[0];
        if (obj["id"]) {
          this.tabPosition = obj.id;
        } else {
          this.sensorType = obj.deviceId;
          this.tabPosition = obj.deviceId;
          this.idxType = array;
          this.deviceName = this.defaultName;
        }
      }
    },
    handleSensorType(value) {
      return sensorType(value);
    },
    handleGetAlarmList() {
      this.alarmLoading = true;
      this.handleGetAlarmHistoryDevice()
    },
    handleAlarmProcess(row) {
      this.$refs.AlarmProcessing.open(row);
    },
    handleCutType(e) {
      this.handleInitItems();
      this.alarmLoading = true;
      const index = Number(this.sensorsType);
      if (index === 1000) {
        this.type = 1000;
      } else if (index === 2000) {
        this.type = 2000;
      } else {
        this.type = this.idxType[index].type;
      }
      this.handleGetAlarmHistoryDevice( e ? e.index : "");
    },
    handleGetAlarmHistoryDevice(idx) {
      this.disabled = true;
      if (this.type == 2000) {
        const obj = {
          deviceId: this.tabPosition,
          pageNum: this.alarmItems.pageNum,
          pageSize: this.alarmItems.pageSize,
          thingsType: this.thingsType,
          thingsId: this.thingsId
        }
        if (!this.thingsType) {
          delete obj.thingsType;
        }
        getHistoryDeviceAlarm(obj).then(res => {
          this.disabled =false;
          this.alarmMessages = res.items.list;
          this.alarmLoading = false;
          if (this.alarmItems.pageNum === items.PAGE_NUM) {
            this.alarmTotal = res.items["total"] && res.items.total;
          }
        })
      } else {
        const obj = {
          deviceId: this.tabPosition,
          pageNum: this.alarmItems.pageNum,
          pageSize: this.alarmItems.pageSize,
          idx: Number(this.type) === 1 ? this.sensorsType : null,
          type: this.type,
          thingsType: this.thingsType,
          thingsId: this.thingsId
        }
        getAlarmHistoryDevice(obj).then(res => {
          this.disabled =false;
          this.alarmMessages = res.items.list;
          if (this.alarmItems.pageNum === items.PAGE_NUM && JSON.stringify(res.items)!=="{}") {
            this.alarmTotal = res.items["total"] && res.items.total;
          }
          this.alarmLoading = false;
        })
      }

    },
    handleInitItems() {
      this.alarmTotal = 0;
      this.alarmItems = {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      }
    },
  }
}
</script>

