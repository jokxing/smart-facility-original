<template>
  <el-table
      v-loading="loading"
      :data="detects"
      border
      :default-sort="{order: 'descending'}">
    <el-table-column label="#" width="70px" type="index">
      <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('hardware.devciceName')" min-width="130" prop="equipmentName" sortable>
      <template v-slot="scope">
        <a @click="handleDrawer(scope.row)">{{ scope.row.equipmentName }}</a>
      </template>
    </el-table-column>
    <el-table-column :label="$t('hardware.detectUserName')" prop="userName" sortable/>
    <el-table-column :label="$t('common.owningDepartment')" min-width="150" prop="departmentName" sortable/>
    <el-table-column :label="$t('hardware.status')" prop="completeFlag" min-width="100">
      <template v-slot="scope">
        <span :class="scope.row.completeFlag ? '' : 'abnormal'">
          {{ scope.row.completeFlag ? $t('hardware.detectedFinish') : $t('hardware.detected') }}
        </span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('hardware.detectDate')" min-width="160" prop="detectDate" sortable>
        <template v-slot="scope">
            {{ scope.row.detectDate | localToUtc }}
        </template>
    </el-table-column>
    <el-table-column :label="$t('hardware.detectDateFinish')" v-if="activeName !== 'first'" min-width="160" prop="completeDate" sortable/>
    <el-table-column :label="$t('hardware.nextDetectDate')" min-width="160" prop="nextDetectDate" sortable/>
    <el-table-column :label="$t('hardware.reportFileName')" v-if="activeName !== 'first'" prop="report">
      <template v-slot="scope">
        <a @click="handlePreviewInspect(scope.row.reportUrl)">{{ scope.row.reportUrl }}</a>
      </template>
    </el-table-column>
    <el-table-column v-if="$store.state.level" fixed="right" :label="$t('common.handle')" :width="activeName !== 'first'? 120 : 180">
      <template v-slot="scope">
        <el-button type="text" @click="handleEdit(scope.$index, scope.row)">{{ $t('hardware.nextDetectDate') }}</el-button>
        <el-button v-if="!scope.row.completeFlag" type="text" @click="handleDelete(scope.$index, scope.row)">{{ $t('hardware.detectedFinish') }}
        </el-button>
        <el-button v-if="!scope.row.completeFlag" type="text" @click="handleCancel(scope.$index, scope.row)">{{ $t('common.cancel') }}
        </el-button>
      </template>
    </el-table-column>
    <edit ref="edit" @handle="handleQuery"/>
    <inspected ref="inspected" @handle="handleQuery"/>

  </el-table>
</template>

<script>
import Edit from "@/views/detect/components/Edit";
import Inspected from "@/views/detect/components/Inspected";
import {BASE_URL} from "@/utils/constant";
import {getDetectComplete} from "@/api/detect";

export default {
  name: "InspectTable",
  components: {
    Edit,
    Inspected,
  },
  props: {
    detects: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    activeName: {
      type: String,
      default: "first"
    },
    total: {
      type: Number,
      default: 0
    },
    items: {
      type: Object,
      default: () => {}
    }

  },
  inject: ["query"],
  methods: {
    handlePreviewInspect(url) {
      window.open(BASE_URL + url)
    },
    handleEdit(index, row) {
      this.$refs.edit.open(row);
    },
    handleDelete(index, row) {
      this.$refs.inspected.open(row);
    },
    handleQuery() {
      this.query();
    },
    handleDrawer(row) {
      this.$emit("handle", row);
    },
    handleCancel(index, row) {
      this.$confirm(this.$t('hardware.fixDetect'), this.$t('hardware.fixDetectTitle'), {
        confirmButtonText: this.$t("common.confirm"),
        cancelButtonText: this.$t("common.cancel"),
        type: "warning"
      }).then(() => {
        getDetectComplete({
          detectId: row.detectId,
          reportFileName: ""
        }).then(res => {
          if (res.code) {
            this.$message.success(res.message);
            this.query();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t("common.cancelHandle"));
      })

    }
  }
}
</script>
