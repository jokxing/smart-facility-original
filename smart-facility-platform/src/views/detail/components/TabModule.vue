<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      v-for="item in tabsList"
      :label="item.label"
      :name="item.value"
      :key="item.value"
    >
      <div class="btnGroup">
        <el-button
          type="primary"
          class="btn-default icon-reserve"
          v-if="activeName == 1"
          @click="handleAdd($t('labDevice.orderApply'))"
          >&nbsp;{{ $t('labDevice.addOrder') }}</el-button
        >
        <el-button
          type="primary"
          class="btn-default"
          v-else-if="activeName == 2"
          :disabled="status === 3"
          @click="handleAdd($t('labDevice.addMaintenance'))"
          >{{ $t('labDevice.addMaintenance') }}</el-button
        >
        <el-button
          type="primary"
          class="btn-default icon-staff-settings"
          v-else-if="activeName == 3 && roleId != 5"
          @click="handleAddUser"
          >&nbsp;{{ $t('common.addPrincipal') }}</el-button
        >
        <el-button
          type="primary"
          class="btn-default"
          v-else-if="activeName == 4 && roleId != 5"
          @click="handleOpenBindingDevice"
          >{{ $t('common.bindDevice') }}</el-button
        >
      </div>
      <SelfTable
        v-if="activeName != 6"
        :key="activeName"
        :loading="loading"
        :columns="item.column"
        :pageSize="pageSize"
        :pageNum="pageNum"
        :total="total"
        :tabledata="dataSource"
        :isKey="isKey"
        @pageNumChange="handlePageNumChange"
        @pageSizeChange="handlePageSizeChange"
      >
        <el-table-column slot="name" :label='$t("common.name")' >
          <template v-slot="scope">
            <el-button type="text" @click="handleSeedDetail(scope.row)"
              ><span>{{ scope.row.name }}</span>
            </el-button>
          </template>
        </el-table-column>

        <template v-if="activeName == 1">
          <el-table-column
            slot="status"
            :label='$t("hardware.status")'

            width="120"
          >
            <template v-slot="scope">
              {{ getScreenName(scope.row.status, orderStatusSet) }}
            </template>
          </el-table-column>
          <el-table-column
            slot="operate"
            :label='$t("common.handle")'

            fixed="right"
            width="120">
            <template v-slot="scope" v-if="roleId != 5 || (roleId == 5 && scope.row.userId == userId)">
              <el-button type="text" :disabled="scope.row.status == 2 || scope.row.status == 3" @click="handleEdit($t('labDevice.updateOrder'), scope.row)"
                >{{ $t('labDevice.change') }}
              </el-button>
              <el-button type="text" :disabled="scope.row.status == 2 || scope.row.status == 3" @click="handleOrderCancle(scope.row)"
                >{{ $t('common.cancel') }}
              </el-button>
            </template>
          </el-table-column>
        </template>

        <template v-if="activeName == 2">
          <el-table-column slot="urlList" :label="$t('common.img')" >
            <template v-slot="scope">
              <div class="image">
                <el-image
                  v-for="(item, index) in scope.row.urlList"
                  :url="item"
                  :key="index"
                  :src="item"
                  :preview-src-list="item"
                ></el-image>
              </div>
            </template>
          </el-table-column>

          <el-table-column slot="status" :label='$t("hardware.status")'  width="80">
            <template v-slot="scope">
              {{ getScreenName(scope.row.completeFlag, maintenanceStatusSet) }}
            </template>
          </el-table-column>
          <el-table-column
            slot="operate"
            :label='$t("common.handle")'

            fixed="right"
            width="180"
          >
            <template v-slot="scope">
              <el-button
                type="text"
                @click="handleEdit($t('labDevice.updateNextMaintenanceDate'), scope.row)"
              >
                {{ $t('labDevice.nextMaintenanceDate') }}
              </el-button>
              <el-button
                type="text"
                v-if="scope.row.completeFlag == 0"
                @click="handleMaintenceConfirm(scope.row)"
                >{{ $t('labDevice.inspectConfirm') }}
              </el-button>
            </template>
          </el-table-column>
        </template>

        <template v-if="activeName == 3">
          <el-table-column
            slot="weixin"
            :label='$t("system.noticeWeixin")'

            width="120">
            <template v-slot="scope">
              <el-tag
                :type="scope.row.weixin === -1 ? 'info' : 'success'"
                v-html="alarmType(scope.row.weixin)">
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            slot="weixin"
            :label='$t("system.noticeSms")'
            width="120">
            <template v-slot="scope">
              <el-tag
                :type="scope.row.sms === -1 ? 'info' : 'success'"
                v-html="alarmType(scope.row.sms)">
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            slot="phone"
            :label='$t("system.noticeCall")'

            width="120">
            <template v-slot="scope">
              <el-tag
                :type="scope.row.phone === -1 ? 'info' : 'success'"
                v-html="alarmType(scope.row.phone)">
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            slot="time"
            :label='$t("common.timeFrame")'

            width="220">
            <template v-slot="scope">
              {{
                handleTimeQuantum(
                    scope.row.timeFrom,
                    scope.row.timeTo,
                    scope.row.timeFlag
                )
              }}
            </template>
          </el-table-column>
          <el-table-column
            slot="operate"
            :label='$t("common.handle")'
            width="150"
            v-if="roleId != 5"
          >
            <template v-slot="scope">
              <el-button type="text" @click="handleAlarmSystem(scope.row)"
                >{{ $t("labDevice.alarmSystem") }}
              </el-button>
              <el-button type="text" @click="handleRemoveBindDing(scope.row, activeName)"
                >{{ $t("common.delete") }}
              </el-button>
            </template>
          </el-table-column>
        </template>

        <template v-if="activeName == 4">
          <el-table-column slot="value" :label='$t("common.value")'  width="300">
            <template v-slot="scope">
                <hardwareValue :data="scope.row"/>
            </template>
          </el-table-column>

          <el-table-column
            slot="status"
            :label='$t("hardware.status")'
            width="200"
          >
            <template v-slot="scope">
              <div class="text">
                <div class="line">
                  {{ $t('hardware.signalStrength') }}：{{ scope.row.signalStrength }}
                </div>
                <!-- <div class="line">电量：B0（强）</div> -->
              </div>
            </template>
          </el-table-column>

          <el-table-column
            slot="status"
            :label="$t('hardware.bindStatus')"
          >
            <template v-slot="scope">
              <span>{{ scope.row.isBind ? $t('labDevice.no') : $t('labDevice.yes') }}</span>
            </template>
          </el-table-column>

          <el-table-column
            slot="operate"
            :label="$t('common.handle')"

            width="100"
            v-if="roleId != 5"
          >
            <template v-slot="scope">
              <el-button v-if="!scope.row.isBind" type="text" @click="handleRemoveBindDing(scope.row, activeName)"
                >{{ $t('common.unBind') }}
              </el-button>
            </template>
          </el-table-column>
        </template>
      </SelfTable>
    </el-tab-pane>
    <history-alarm-record :things-id="detailId" v-if="activeName == 6" :things-type="4" :sensors="sensors"/>
    <AlarmSystem ref="AlarmSystem" @handle="handleReflesh()"/>


    <BindingDevice ref="BindingDevice" @handle="handleBindingEquipment"/>

    <SetPrincipal ref="SetPrincipal" @handle="handleThingsUserList"/>
  </el-tabs>
</template>
<script>
import SelfTable from "@/components/Table";
import AlarmSystem from "@/views/device/components/AlarmSystem";
import SetPrincipal from "@/components/SetPrincipal";
import {
  orderStatusSet,
  maintenanceStatusSet,
  bindedStatusSet,
} from "../config.js";
import BindingDevice from "@/components/BindingDevice";
import {
  postMaintenanceList,
  getinstrumentUserList,
  getInstrumentReservationSchedulerList,
  getInstrumentReservationCancle,
  getMaintenanceComplete,
  postInstrumentThingsRemove,
  getInstrumentThingsAdd
} from "@/api/labDevice";
import { getThingsUserList } from "@/api/principal";
import { removeThingsUser } from "@/api/user";
import { mapState, mapMutations } from "vuex";
import HistoryAlarmRecord from "@c/HistoryAlarmRecord";
import HardwareValue from "@c/HardwareValue/index";
export default {
  props: {
    status: {
      type: Number,
      default: null
    },
    detailId: {
      type: Number,
      default: null
    },
    bindDatas: {
      type: Array,
      default: ""
    },
    sensors: {
      type: Array,
      default: ""
    }
  },
  components: {
    HistoryAlarmRecord,
    SelfTable,
    AlarmSystem,
    BindingDevice,
    HardwareValue,
    SetPrincipal
  },
  data() {
    const _this = this;
    return {
      // 用户层级
      roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
      userId: JSON.parse(localStorage.getItem('USERINFO')).id,
      // 日程
      isFullcalendar: false,

      orderStatusSet,
      maintenanceStatusSet,
      bindedStatusSet,
      loading: false,
      dataSource: [],
      pageSizes: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      tabsList: [
        {
          label: _this.$t("labDevice.orderUseLog"),
          value: "1",
          column: [
            {
              title: _this.$t("labDevice.useName"),
              dataIndex: "userName",
            },
            {
              title: _this.$t("labDevice.telNo"),
              dataIndex: "tel",
            },
            {
              title: _this.$t("labDevice.labDeviceName"),
              dataIndex: "instrumentName",
            },
            {
              title: _this.$t("labDevice.labDeviceNo"),
              dataIndex: "instrumentNo",
            },
            {
              title: _this.$t("labDevice.applyTime"),
              dataIndex: "createDate",
            },
            {
              title: _this.$t("labDevice.startTime"),
              dataIndex: "timeFrom",
            },
            {
              title: _this.$t("labDevice.endTime"),
              dataIndex: "timeTo",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "status",
              slot: "status",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.maintenanceRecord"),
          value: "2",
          column: [
            {
              title: _this.$t("common.createName"),
              dataIndex: "userName",
            },
            {
              title: _this.$t("labDevice.telNo"),
              dataIndex: "tel",
            },
            {
              title: _this.$t("labDevice.labDeviceName"),
              dataIndex: "instrumentName",
            },
            {
              title: _this.$t("labDevice.labDeviceNo"),
              dataIndex: "instrumentNo",
            },
            {
              title: _this.$t("labDevice.applyTime"),
              dataIndex: "createDate",
            },
            {
              title: _this.$t("labDevice.endTime"),
              dataIndex: "completeDate",
            },
            {
              title: _this.$t("labDevice.nextMaintenanceDate"),
              dataIndex: "nextMaintenanceDate",
              width: "110"
            },
            {
              title: _this.$t("labDevice.remark"),
              dataIndex: "remark",
            },
            // {
            //   title: _this.$t("common.img"),
            //   dataIndex: "urlList",
            //   slot: "urlList",
            // },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "completeFlag",
              slot: "status",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.informPersonnel"),
          value: "3",
          column: [
            {
              title: _this.$t('system.name'),
              dataIndex: "userName",
            },
            {
              title: _this.$t('system.noticeWeixin'),
              dataIndex: "weixin",
              slot: "weixin",
            },
            {
              title: _this.$t('system.noticeSms'),
              dataIndex: "sms",
              slot: "sms",
            },
            {
              title: _this.$t('system.noticeCall'),
              dataIndex: "phone",
              slot: "phone",
            },
            {
              title: _this.$t('common.timeFrame'),
              dataIndex: "time",
              slot: "time",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.bindDevice"),
          value: "4",
          column: [
            {
              title: _this.$t('common.name'),
              dataIndex: "name",
            },
            {
              title: _this.$t('common.no'),
              dataIndex: "no",
            },
            {
              title: _this.$t('common.value'),
              dataIndex: "value",
              slot: "value",
            },
            {
              title: _this.$t('hardware.status'),
              dataIndex: "status",
              slot: "status",
            },
            {
              title: _this.$t('common.handle'),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.inOrOut"),
          value: "5",
          column: [
            {
              title: _this.$t("common.name"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("labDevice.model"),
              dataIndex: "model",
            },
            {
              title: _this.$t("labDevice.specification"),
              dataIndex: "standard",
            },
            {
              title: _this.$t("labDevice.outTime"),
              dataIndex: "takeoutTime",
            },
            {
              title: _this.$t("labDevice.returnTime"),
              dataIndex: "returnTime",
            },
            {
              title: _this.$t("labDevice.lookVoid"),
              dataIndex: "media",
            },
            {
              title: _this.$t("labDevice.useBeforeNum"),
              dataIndex: "preQuantity",
            },
            {
              title: _this.$t("labDevice.useAfterNum"),
              dataIndex: "afterQuantity",
            },
            {
              title: _this.$t("common.remark"),
              dataIndex: "remark",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.historyLog"),
          value: "6",
          // column: [
          //   {
          //     title: "报警数值",
          //     dataIndex: "number",
          //   },
          //   {
          //     title: "联系范围",
          //     dataIndex: "range",
          //   },
          //   {
          //     title: "类型",
          //     dataIndex: "type",
          //   },
          //   {
          //     title: "报警时间",
          //     dataIndex: "warnningTime",
          //   },
          //   {
          //     title: "持续状态",
          //     dataIndex: "keepTime",
          //   },
          //   {
          //     title: "恢复值",
          //     dataIndex: "resetValue",
          //   },

          //   {
          //     title: "操作",
          //     dataIndex: "operate",
          //     slot: "operate",
          //   },
          // ],
        },
      ],
      activeName: "1",
      isKey: true
    };
  },
  methods: {
    ...mapMutations("detail", {
      addModal: "ADDMODAL",
      editModal: "EDITMODAL",
      handleReflesh: "TABMODULEREFLESH",
      handleBindReflesh: "ISREFLESHBIND",
    }),
    handleAdd(title) {
      if(this.activeName == "1"){
        this.$emit("goIsFullcalendar")
      }else{
        this.addModal({
          title,
          type: +this.activeName,
        });
      }
    },
    handleAddUser() {
      this.$refs.SetPrincipal.open(0, this.detailId, 4);
    },

    handleEdit(title, data) {
      this.editModal({
        title,
        editData: data,
        type: +this.activeName,
      });
    },

    // 报警设置
    handleAlarmSystem(row) {
      this.$refs.AlarmSystem.open(row);
    },
    // 解除
    handleRemoveBindDing(row, index) {
      if(index == 3){
        var text = this.$t('common.deletePrincipalMessage1') + row.userName + this.$t('common.deletePrincipalMessage2')
        this.$confirm(text, this.$t('common.delete'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: "warning",
        }).then(() => {
          this.handleRemoveThingsUser(row)
        }).catch(() => {});
      }
      if(index == 4) {
        this.$confirm(this.$t('labDevice.unbindDeviceAndLab'), this.$t('common.delete'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: "warning",
        }).then(() => {
          this.removeBindAsync(row);
        }).catch(() => {});
      }
    },

    handleOrderCancle(row) {
      if(row.status == 1){
        this.$message.error(this.$t('labDevice.notOrder'))
      }else{
        this.$confirm(this.$t('labDevice.isCancelOrder'), this.$t('labDevice.cancelOrder'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: "warning",
        })
          .then(() => {
            this.orderDeleteAsync(row.id);
          })
          .catch(() => {});
      }
    },
    handleMaintenceConfirm(row) {
      this.$confirm(this.$t('labDevice.maintaining'), this.$t('labDevice.inspectConfirm'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      })
        .then(() => {
          this.maintenceAsyncConfirmAsync(row.id);
        })
        .catch(() => {});
    },
    handleClick(tab, event) {
      if(this.activeName === '4'){
        this.isKey = false;
      }else{
        this.isKey = true;
      }
      this.dataSource = []
    },
    handlePageNumChange(num) {
      this.pageNum = num;
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
    },

    getScreenName(id, arry) {
      let str = "";
      let temp = arry.map((a) => {
        if (a.value == id) {
          str = a.label;
        }
      });
      return str;
    },

    // 移除设备管理人员
    handleRemoveThingsUser(data){
      var obj = {
        thingsId: data.instrumentId,
        type: 4,
        userId: data.userId
      }
      removeThingsUser(obj).then(res => {
        if (res.code === 1) {
          this.$message({
            type: "success",
            message: this.$t('common.deleteSuccess'),
          });
          this.handleReflesh();
        }
      }).catch(err => {
        this.$message({
          type: "error",
          message: err,
        });
      })
    },
    // 移除绑定的智能硬件
    async removeBindAsync(data) {
      try {
        let { id, type } = data;
        let obj = {
          equipmentId: id,
          equipmentType: type,
          thingsId: this.detailData.id,
        };
        let result = await postInstrumentThingsRemove(obj);
        if (result.code === 1) {
          this.$message({
            type: "success",
            message: this.$t('common.deleteSuccess'),
          });
          // this.handleReflesh();
          this.handleBindReflesh();
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    // 绑定智能硬件按钮
    handleOpenBindingDevice() {
      this.$refs.BindingDevice.open(2);
    },
    // 绑定智能硬件成功后更新数据
    handleBindingEquipment (row) {
      const data = [
        {
          thingsId: this.detailData.id,
          equipmentId: row.equipmentId,
          equipmentType: row.equipmentType
        }
      ]
      getInstrumentThingsAdd(data).then(res => {
        if (res.code) {
          this.$message.success(this.$t('hardware.bindSuccess'));
          this.handleBindReflesh();
          this.loading = true;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    // 添加负责人成功更新数据
    handleThingsUserList() {
      var data = {
        thingId: this.detailId,
        pageSize: this.pageSize,
        pageNum: this.pageNum
      }
      this.getPrincipalData(data)
    },

    async orderDeleteAsync(id) {
      try {
        let result = await getInstrumentReservationCancle({}, id);
        if (result.code === 1) {
          this.$message({
            type: "success",
            message: this.$t('labDevice.cancelSuccess'),
          });
          this.handleReflesh();
        }else{
          this.$message.error(result.message)
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    async maintenceAsyncConfirmAsync(id) {
      try {
        let result = await getMaintenanceComplete({ maintenanceId: id });
        if (result.code === 1) {
          this.$message({
            type: "success",
            message: this.$t('labDevice.confirmSuccess'),
          });
          this.handleReflesh();
          this.$parent.desc.status = 4
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    async getOrderData(schedulerParam) {
      try {
        let result = await getInstrumentReservationSchedulerList(
          schedulerParam
        );
        this.dataSource = [];
        let temp = [];
        let total = 0;
        if (result.code == 1) {
          temp = result.items.list;
          total = result.items.total;
        } else {
          this.$message.error(result.message);
        }
        this.total = total;
        var _this = this;
        setTimeout(function(){
          _this.dataSource = temp;
          _this.loading = false;
        },700)
      } catch (err) {
        this.loading = false;
        this.dataSource = [];
        throw err;
      }
    },

    async getPrincipalData(principalParam) {
      try {
        let result = await getThingsUserList(principalParam);
        let temp = [];
        let total = 0;
        if (result.code == 1) {
          temp = result.items.list;
          total = result.items.total;
        } else {
          this.$message.error(result.message);
        }
        this.loading = false;
        this.total = total;
        this.dataSource = temp;
      } catch (err) {
        this.loading = false;
        this.dataSource = [];
        throw err;
      }
    },

    async getMaintenanceData(maintainParam) {
      try {
        let result = await postMaintenanceList(maintainParam);
        let temp = [];
        let total = 0;
        if (result.code == 1) {
          temp = result.items.list;
          total = result.items.total;
        } else {
          this.$message.error(result.message);
        }
        this.loading = false;
        this.total = total;
        this.dataSource = temp;
      } catch (err) {
        this.loading = false;
        this.dataSource = [];
        throw err;
      }
    },

    async getInstrumentUserData(maintainParam) {
      try {
        let result = await getinstrumentUserList(maintainParam);
        let temp = [];
        let total = 0;
        if (result.code == 1) {
          temp = result.items.list;
          total = result.items.total;
        } else {
          this.$message.error(result.message);
        }
        this.loading = false;
        this.total = total;
        this.dataSource = temp;
      } catch (err) {
        this.loading = false;
        this.dataSource = [];
        throw err;
      }
    },
    // 判断报警状态
    alarmType(index) {
      if (index === -1) {
        return this.$t('hardware.alarmArray00');
      }
      if (index === 0) {
        return this.$t('hardware.alarmArray0');
      }
      if (index > 0) {
        return this.$t('hardware.alarm2') + ' ' + index + ' ' + this.$t('hardware.alarm3');
      }
    },
    // 拼接时间段
    handleTimeQuantum(from, to, timeFlag) {
      if (from.length >8) {
        return (
            moment(from).format("HH:mm:ss") +
            "~" +
            moment(to).format("HH:mm:ss") +
            (timeFlag ? "（" + this.$t('common.abnormal') + "）" : "（" + this.$t('hardware.alarmArray00') + "）")
        );
      } else {
       return from + "~" + to + (timeFlag ? "（" + this.$t('common.abnormal') + "）" : "（" + this.$t('hardware.alarmArray00') + "）");
      }
    }
  },
  computed: {
    ...mapState("detail", {
      detailData: "detailData",
      isReflesh: "tabModuleReFlesh",
      bindDataReflesh: "bindDataReflesh",
      bindData: "bindData",
    }),
    tableParams() {
      // let { pageSize, pageNum, activeName, isReflesh, detailId, bindData } = this;
      let { pageSize, pageNum, activeName, isReflesh, detailId } = this;
      return {
        pageSize,
        pageNum,
        activeName,
        isReflesh,
        detailId: detailId,
      };
    },
  },
  watch: {
    bindDatas: {
      handler(newVal){
        if(this.activeName === '4'){
          this.loading = false;
          this.dataSource = newVal;
        }
      }
    },
    tableParams: {
      handler(newVal) {
        let { detailId, pageSize, pageNum, activeName } = newVal;
        this.loading = true;
        switch (activeName) {
          case "1":
            this.getOrderData({
              instrumentId: detailId,
              pageSize,
              pageNum,
            });
            break;
          case "2":
            this.getMaintenanceData({
              instrumentId: detailId,
              pageSize,
              pageNum,
            });
            break;
          case "3":
            this.loading = false;
            this.dataSource = [];
            this.total = 0;
            this.getPrincipalData({
              thingId: detailId,
              pageSize,
              pageNum,
            });
            break;
          case "4":
            this.loading = false;
            this.dataSource = this.bindDatas;
            this.total = 0;
            break;
          case "5":
            this.loading = false;
            this.dataSource = [];
            this.total = 0;
            break;
          case "6":
            this.loading = false;
            this.dataSource = [];
            this.total = 0;
            break;
        }
      },
      immediate: true,
    },
  },
};
</script>
<style lang="less" scoped>
.danger {
  color: #ff4949;
}
.line {
  span {
    margin-right: 5px;
    &:last-child {
      margin: 0;
    }
  }
}
.btnGroup {
  height: 40px;
  margin-bottom: 15px;
  float: right;
}
</style>
