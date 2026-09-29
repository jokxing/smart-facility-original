<template>
  <div class="sticky-head">
    <el-table
        ref="table"
        v-loading="loading"
        stripe
        border
        :data="exports">
      <el-table-column label="#" type="index" width="70px">
        <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (pageNum - 1) * pageSize + scope.$index + 1
              }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.exportContent')" prop="content">
        <template v-slot="scope">
            <el-tooltip :content="scope.row.content" placement="top">
                <a class="show-over-tooltip" @click="handleShowDetailList(scope.row.id)">{{ scope.row.content }}</a>
            </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.exportTimeHorizon')" prop="timeHorizon" min-width="180px">
          <template v-slot="{row}">
              <template v-if="row.timeHorizonArr && row.timeHorizonArr.length===2">
                  {{ row.timeHorizonArr[0] }}
                  ~ <br>
                  {{ row.timeHorizonArr[1] }}
              </template>
          </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.sensorStr')" prop="sensorStr">
          <template v-slot="{row}">
              <el-tooltip :content="row.sensorStr" placement="top">
                  <p class="show-over-tooltip">{{ row.sensorStr }}</p>
              </el-tooltip>
          </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.exportInterval')" prop="interval" width="200">
        <template v-slot="scope">
          {{ handleInterval(scope.row.interval) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.exportDate')" prop="createDate" min-width="180px">
          <template v-slot="{row}">
              <template v-if="row.createDate">
                  {{ $t('hardware.createTask') }}：{{row.createDate | localToUtc}}
              </template>
              <br>
              <template v-if="row.startDate">
                  {{ $t('hardware.startExport') }}：{{row.startDate | localToUtc}}
              </template>
              <br>
              <template v-if="row.endDate">
                  {{ $t('hardware.endExport') }}：{{row.endDate | localToUtc}}
              </template>
          </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.exportProgress')" prop="sensor" width="200">
        <template v-slot="{row}">
            <el-progress
                v-if="row.status == 1 || row.status == 3"
                :text-inside="true"
                :stroke-width="20"
                :percentage="Math.floor(row.progress*100)"
                :status="statuNames[row.status]"/>
            <span v-else-if="row.status == 0" style="color: darkgray">
            {{ $t('hardware.tasking') }}<br>
            <template v-if="runningExportId && row.id">
              {{ $t('hardware.taskAt') }} {{ row.id - runningExportId }}
            </template>
          </span>
            <span v-else-if="row.status == 2" style="color: orange">
            {{ $t('hardware.exportError') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.handle')" min-width="150">
        <template v-slot="scope">
          <el-button v-if="scope.row.status!==3" type="text" disabled>{{ $t('common.download') }}</el-button>
          <!-- 文件名中包含特殊字符如+，跳转时特殊字符会被转义，下载报错 -->
          <a v-else download="" :href="url + encodeURIComponent(scope.row.url)">{{ $t('common.download') }}</a>
        </template>
      </el-table-column>
    </el-table>
    <data-detail-list ref="DataDetailList"/>
  </div>
</template>

<script>
import {BASE_URL, historyTimeInterval} from "@/utils/constant";
import DataDetailList from "@/views/dataExport/components/DataDetailList";
import mixin from "@/utils/mixin";
export default {
  name: "DataExportLog",
  components: {DataDetailList},
  props: {
    exports: {
      type: Array,
      default: () => []
    },
    runningExportId: {
      type: Number,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false
    },
    pageNum: {
      type: [Number, String],
      default: 1
    },
    total: {
      type: [Number, String],
      default: 0
    },
    pageSize: {
      type: [Number, String],
      default: 10
    }
  },
  data() {
    return {
      url: BASE_URL,
      statuNames: [undefined, undefined, 'exception', 'success'],
    }
  },
    watch: {
        exports() {

        }
    },
    methods: {
    handleShowDetailList(id) {
      this.$refs.DataDetailList.open(id);
    },

    handleInterval(value) {
      for (const item of historyTimeInterval) {
        if (item.id === value) {
          return item.name
        }
      }
    }
  }
}
</script>
<style lang="less" src="../../../style/table_sticky.less" scoped></style>
<style lang="less" scoped>
.show-over-tooltip {
    display: -webkit-box;
    text-overflow: ellipsis;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
</style>