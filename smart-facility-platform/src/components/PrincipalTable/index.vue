<template>
  <el-table border :default-sort = "{order: 'descending'}" v-loading="loading" size="medium" :data="equipmentUsers">
    <el-table-column fixed label="#" width="70px" type="index">
      <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
      </template>
    </el-table-column>
    <el-table-column sortable :label="$t('system.name')" prop="userName"></el-table-column>
    <el-table-column :label="$t('common.phoneAlarm')" prop="tel">
      <template v-slot="scope">
        <el-tag
            :type="scope.row.phone === -1 ? 'info' : 'success'"
            v-html="alarmType(scope.row.phone)"
        ></el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="$t('common.weixinAlarm')" prop="weixin">
      <template v-slot="scope">
        <el-tag
            :type="scope.row.weixin === -1 ? 'info' : 'success'"
            v-html="alarmType(scope.row.weixin)"
        ></el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="$t('common.smsAlarm')" prop="sms">
      <template v-slot="scope">
        <el-tag
            :type="scope.row.sms === -1 ? 'info' : 'success'"
            v-html="alarmType(scope.row.sms)"
        ></el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="$t('common.timeFrame')" prop="timeFrom" min-width="200">
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
    <el-table-column :label="$t('common.handle')" min-width="110">
      <template v-slot="scope">
        <el-button v-if="handleLevel(scope.row)" type="text" @click="handleAlarmSystem(scope.row)">{{ $t('hardware.alarmSystem') }}
        </el-button>
        <el-button v-if="handleLevel(scope.row)" type="text" class="abnormal" @click="handleDeleteEquipmentUsers(scope.row)">{{ $t('common.delete') }}
        </el-button>
      </template>
    </el-table-column>
    <AlarmSystem :type="type" ref="AlarmSystem" @handle="handleParent"/>
  </el-table>
</template>

<script>
import moment from "moment";
import {removeEquipmentUser, removeThingsUser} from "@/api/user";
import AlarmSystem from "@/views/device/components/AlarmSystem";
import store from "@/store";

export default {
  name: "index",
  props: {
    equipmentUsers: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    items: {
      type: Object,
      default: () => {}
    },
    type: {
      type: Number,
      default: 0
    },
  },
  components: {
    AlarmSystem
  },
  methods: {
    alarmType(index) {
      if (index === -1) {
        return this.$t('hardware.alarmArray00');
      }
      if (index === 0) {
        return this.$t('hardware.alarmArray0');
      }
      if (index > 0) {
        return this.$t('hardware.alarm2') + index + this.$t('hardware.alarm3');
      }
    },
    handleParent() {
      this.$emit("change");
      try {
        this.$parent.handleEquipmentUsers();
      } catch (error) {
        this.$parent.$parent.handleEquipmentUsers();
      }
    },
    handleAlarmSystem(row) {
      this.$refs.AlarmSystem.open(row);
    },
    handleDeleteEquipmentUsers(row) {
      this.$confirm(this.$t('common.deletePrincipalMessage1') + row.userName + this.$t('common.deletePrincipalMessage2'), this.$t('common.deletePrincipal'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        if (row.type == 11 || row == 4) {
          removeThingsUser({
            thingsId: row.instrumentId,
            type: row.type,
            userId: row.userId
          }).then(res => {
            this.handleMessage(res);
          })
        } else {
          removeEquipmentUser({
            equipmentId: row.equipmentId,
            userId: row.userId,
            type: row.type,
          }).then((res) => {
            this.handleMessage(res);
          });
        }
      }).catch(() => {
        this.$message.info(this.$t('common.deleteCanceled'));
      });
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(this.$t('common.deleteSuccess'));
        this.handleParent();
      } else {
        this.$message.error(res.message);
      }
    },
    handleTimeQuantum(from, to, timeFlag) {
      if (from.length >8) {
        return (
            moment(from).format("HH:mm:ss") +
            "~" +
            moment(to).format("HH:mm:ss") +
            (timeFlag ? "（"+this.$t('common.abnormal')+"）" : "（"+this.$t('hardware.alarmArray00')+"）")
        );
      } else {
       return from + "~" + to + (timeFlag ? "（"+this.$t('common.abnormal')+"）" : "（"+this.$t('hardware.alarmArray00')+"）");
      }
    },
    handleLevel(row) {
      if (!store.state.level) {
        return row.userId === JSON.parse(localStorage.getItem("USERINFO")).id;
      } else {
        return true;
      }
    }
  }
}
</script>

<style scoped>

</style>
