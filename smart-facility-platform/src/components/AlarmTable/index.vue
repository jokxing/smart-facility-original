<template>
  <el-table
      v-loading="loading"
      :data="tableData"
      :default-sort="{order: 'descending'}"
      :row-height="40"
      border
      class="mt8">
    <el-table-column fixed label="#" width="70px" type="index">
      <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
      </template>
    </el-table-column>
    <el-table-column
        v-if="!(isColumn === 1000)"
        key="0"
        :show-overflow-tooltip="true"
        :label="$t('hardware.alarmValue')"
        prop="value">
      <template v-slot="scope">
        <span>{{ handleAlarmScope(scope.row).value }}</span>
      </template>
    </el-table-column>
    <el-table-column
        v-if="!(isColumn === 1000)"
        key="1"
        :show-overflow-tooltip="true"
        :label="$t('hardware.alarmScoped')">
      <template v-slot="scope">
        <span>{{ handleAlarmScope(scope.row).scope }}</span>
      </template>
    </el-table-column>
    <el-table-column
        key="2"
        min-width="200"
        :label="$t('labDevice.alarmTime')">
      <template v-slot="scope">
        <div>
            {{ $t('labDevice.startTime') }}：{{ scope.row.createDate }}
        </div>
        <div>
            {{ $t('labDevice.endTime') }}：{{ scope.row.updateDate }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
        key="3"
        :show-overflow-tooltip="true"
        :label="$t('hardware.beepAlarmTime')"
        prop="duration"/>
    <el-table-column
        v-if="!(isColumn === 1000)"
        key="4"
        :show-overflow-tooltip="true"
        :label="$t('hardware.updateValue')"
        prop="updateValue"/>
    <el-table-column :label="$t('common.handle')" :show-overflow-tooltip="true" min-width="110">
      <template v-slot="scope">
        <el-button v-if="scope.row['updateDate']" :class="scope.row.process ? '' : 'abnormal'" type="text"
                   @click="handleAlarmProcess(scope.row)">{{ scope.row.process ? $t("hardware.editDisposeAlarm") : $t("hardware.addDisposeAlarm") }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "index",
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    isColumn: {
      type: Number,
      default: null
    },
    total:{
      type: Number,
      default: 0
    },
    items: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    handleAlarmProcess(row) {
      this.$emit("handle", row);
    }
  }
}
</script>

