<!-- 主页表格 -->
<template>
    <div>
      <el-table
        :data="list"
        stripe
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="70">
        </el-table-column>
        <el-table-column
          prop="transportNo"
          :label="$t('transport.transportNo')">
            <template v-slot="{row}">
                <a @click="$refs.waybillInfo.open({id: row.objId * 1, name: row.transportNo,
                            no: row.transportNo})">{{ row.transportNo }}</a>
            </template>
        </el-table-column>
        <el-table-column
          prop="professionNo"
          :label="$t('transport.professionNo')">
        </el-table-column>
        <el-table-column
          prop="carBoard"
          :label="$t('route.refrigeratedTruck')">
        </el-table-column>
        <el-table-column
          v-if="isOverrun"
          :label="$t('hardware.alarmScoped')">
          <template slot-scope="scope">
           <span v-if="scope.row.monitorNormalMin !== undefined && scope.row.monitorNormalMax !== undefined">
             {{ scope.row.monitorNormalMin }} ~ {{ scope.row.monitorNormalMax }} {{scope.row.unit}}
           </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="monitorSensorVal"
          v-if="isOverrun"
          :label="$t('transport.alarmValue')">
          <template slot-scope="scope">
           <span v-if="scope.row.monitorSensorVal !== undefined">
             {{ scope.row.monitorSensorVal }} {{scope.row.unit}}
           </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="durationFormat"
          v-if="isOverrun"
          :label="$t('hardware.beepAlarmTime')">
        </el-table-column>
        <el-table-column
            :label="$t('transport.updateDate')">
          <template slot-scope="scope">
           <span v-if="scope.row.alarmStartTime !== undefined">
             {{ scope.row.alarmStartTime | localToUtc }}
           </span>
            <span v-if="scope.row.createDate !== undefined">
             {{ scope.row.createDate | localToUtc }}
           </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="monitorAlarmEndTime"
          v-if="isOverrun"
          :label="$t('labDevice.endTime')">
            <template v-slot="{row}">
                {{ row.monitorAlarmEndTime | localToUtc }}
            </template>
        </el-table-column>
        <el-table-column
          v-if="!isOverrun"
          :label="$t('transport.coord')">
           <template slot-scope="scope">
             <span v-if="scope.row.longitude !== undefined">
                {{ scope.row.longitude }},{{ scope.row.latitude }}
             </span>
           </template>
        </el-table-column>
      </el-table>
        <waybill-info ref="waybillInfo"/>
    </div>
</template>

<script>
import WaybillInfo from "@/views/transport/components/WaybillInfo";

export default {
  name: "TransportIndexTable",
    components: {
        WaybillInfo,
    },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    isOverrun: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>

</style>