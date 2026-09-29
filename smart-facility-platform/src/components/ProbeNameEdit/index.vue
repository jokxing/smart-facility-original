<template>
  <el-dialog
      :title="$t('hardware.sensorNameEdit')"
      width="734px"
      :visible="modalVisible"
      :before-close="handleModalClose"
      destroy-on-close
      :close-on-click-modal="false"
      custom-class="modal-probeName"
      :modal-append-to-body="false">
    <el-table
        :data="probeName"
        v-loading="loading"
        border
        style="width: 100%">
      <el-table-column
          type="index"
          label="#"
          width="70px">
      </el-table-column>
      <el-table-column
          prop="sensorName"
          :label="$t('hardware.sensorName')">
      </el-table-column>
      <el-table-column
          prop="equipmentName"
          :label="$t('hardware.owningDevice')"
          width="200px">
      </el-table-column>
      <el-table-column
          prop=""
          :label="$t('hardware.sensorAlias1')">
        <template v-slot="scope">
          <div>
            <el-input v-model.trim="scope.row.sensorAlias" maxlength="12" v-if="scope.row.isEdit"></el-input>
            <el-button type="text" v-else @click="handleEdit(scope.row)">{{ scope.row.sensorAlias }}<i class="icon-edit"></i></el-button>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="" :label="$t('hardware.senseSwitch')" width="100px">
        <template>
          <el-switch></el-switch>
        </template>
      </el-table-column> -->
      <el-table-column
          :label="$t('common.handle')"
          width="100">
        <template v-slot="scope">
          <el-button type="text" @click="handlePreservation(scope.row)">{{ $t('system.save') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import {getEquipmentSensorAliasList, postEquipmentSensorAliasUpdate} from "@/api/labDevice"

export default {
  data() {
    return {
      loading: true,
      modalVisible: false,
      probeName: [],
      type: null,
    }
  },
  methods: {
    open(id, type) {
      this.type = type;
      this.modalVisible = true;
      this.loading = false;
      // type 硬件0,设备4,房间11
      getEquipmentSensorAliasList({id: id, type: type}).then(res => {
        if (res.code == 1) {
          for (var i = 0; i < res.items.length; i++) {
            res.items[i]['isEdit'] = false
          }
          this.probeName = res.items;
        }
      })
    },
    handleModalClose() {
      this.modalVisible = false;
      this.$emit('handle')
    },
    handleEdit(row) {
      row.isEdit = true;
    },
    handlePreservation(row) {
      row.isEdit = false;
      var data = {
        id: row.id,
        sensorAlias: row.sensorAlias,
        type: this.type
      };
      postEquipmentSensorAliasUpdate(data).then(res => {
        if (res.code) {
          if (res.code === 1) {
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
        } else {
          this.$message.error(res.message)
        }
      })
    }
  },
}
</script>