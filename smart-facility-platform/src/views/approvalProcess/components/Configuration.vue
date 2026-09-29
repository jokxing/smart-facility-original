<!--单据配置-->
<template>
  <el-dialog
    :before-close="handleClose"
    :close-on-click-modal="false"
    :title="$t('labDevice.handleConfiguration')"
    :visible.sync="dialogVisible"
    width="30%"
    append-to-body>
    <el-row type="flex" justify="end" v-if="configurations.length">
      <span class="margin-small-right">{{ $t('labDevice.lastUpdateTime') }}：{{ dateFormat(configurations[0].updateDate) }}</span>
      <span>{{ $t('labDevice.updateUser') }}： {{ configurations[0].updateUserName }}</span>
    </el-row>
    <el-table
      :data="configurations"
      class="margin-center"
      max-height="410"
      border
      style="width: 100%">
      <el-table-column
        prop="fieldName"
        :label="$t('labDevice.fieldName')"
        width="150">
      </el-table-column>
      <el-table-column
        prop="alias"
        :label="$t('labDevice.alias')"
        width="150">
        <template v-slot="{$index,row}">
          <el-input @blur="handleHideEdit($index)" v-if="$index == isEdit" v-model.trim="row.fieldAlisa"></el-input>
          <a @click="handleShowEdit($index)" v-else>{{ row.fieldAlisa }} <i class="icon-edit"></i></a>
        </template>
      </el-table-column>
      <el-table-column
        prop="switch"
        :label="$t('labDevice.showed')">
          <template v-slot="{row}">
              <a v-if="!(row.defaulted === 1)" @click="handleShowed(row)"
                 :class="row.showed ? 'icon-visible' : 'icon-invisible'"></a>
              <span v-else :class="row.showed ? 'icon-visible' : 'icon-invisible'"></span>
          </template>
      </el-table-column>
      <el-table-column
        prop="required"
        :label="$t('labDevice.defaulted')">
        <template v-slot="{row}">
            <el-switch :disabled="row.defaulted === 1 || !row.showed" v-model="row.required"/>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getActivitiConfigGetList, postActivitiConfigUpdateFrom} from "@/api/activiti";
import moment from "moment";
import {TIME_FORMAT} from "@/utils/constant";

export default {
    name: "Configuration",
    data() {
        return {
            dialogVisible: false,
            disabled: false,
            isEdit: null,
            configurations: []
        }
    },
    watch: {
        configurations: {
            handler(arr) {

            },
            deep: true
        }
    },
    computed: {
        dateFormat() {
            return function (value) {
                if (value) {
                    return moment(Number(value)).format(TIME_FORMAT);
                }
            }
        }
    },
  methods: {
      handleShowed(row) {
          row.showed = !row.showed
          if (!row.showed) {
              row.required = false;
          }
      },
    handleClose() {
      this.dialogVisible = false;
    },
    open(row) {
      this.dialogVisible = true;
      this.configurations = [];
      getActivitiConfigGetList({proSetCode: row.proSetCode}).then(res => {
          if (res.code) {
              res.items.map(item => {
                  item.required = !!item.required;
                  this.configurations.push(item);
              })
          }
      })
    },
    handleHideEdit() {
      this.isEdit = null;
    },
    handleShowEdit(index) {
      this.isEdit = index;
    },
    handleSubmit() {
        const arr = JSON.parse(JSON.stringify(this.configurations))
        arr.map(item => {
            item.required = item.required ? 1 : 0;
        })
        postActivitiConfigUpdateFrom(arr).then(res => {
            if (res.code) {
                this.$message.success(this.$t('labDevice.editSuccess'));
                this.handleClose();
            } else {
                this.$message.error(res.message);
            }
        })
    }
  }
}
</script>

<style scoped>
.icon-visible, .icon-invisible {
    font-size: 24px;
}

</style>