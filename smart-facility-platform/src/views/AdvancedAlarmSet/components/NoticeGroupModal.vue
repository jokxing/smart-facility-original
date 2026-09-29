<template>
  <el-dialog
      :title="$t('system.changeGroup')"
      :visible.sync="dialogVisible"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="handleClose"
      width="800px"
      @opened="opened"
      @close="handleClose">
    <SelectNotificationGroup ref="selectNotificationGroup" v-model="checkGroupList"/>
    <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
  </el-dialog>
</template>

<script>
import SelectNotificationGroup from "./SelectNotificationGroup";
import {deepCopyObject} from "@/utils/QuickUtils";

export default {
  components: {
    SelectNotificationGroup
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      limit: null,
      checkGroupList: []
    }
  },
    watch: {
        checkGroupList: {
            handler(newArr,oldArr) {
                if (newArr.length > 0 && oldArr.length > 0) {
                    const newObj = newArr[0];
                    const oldObj = oldArr[0];
                    if (newObj.id == oldObj.id && newObj.groupName == oldObj.groupName) {
                        this.checkGroupList = [];
                    }
                }
            }
        }
    },
  methods: {
    open(limit) {
      this.limit = limit;
      this.checkGroupList = deepCopyObject(limit.noticeGroups);
      this.dialogVisible = true;
    },
    opened() {
      this.$refs.selectNotificationGroup.onShowMethod();
    },
    handleSubmit() {
      this.limit.noticeGroups = this.checkGroupList;
      this.dialogVisible = false;
    },
    handleClose() {
      this.dialogVisible = false;
    }
  },
}
</script>