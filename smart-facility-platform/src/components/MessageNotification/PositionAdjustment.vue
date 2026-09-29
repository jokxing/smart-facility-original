<template>
  <el-dialog
    :before-close="handleClose"
    :close-on-click-modal="false"
    :title="$t('labDevice.updateLocation')"
    append-to-body
    :visible.sync="dialogFormVisible">
    <el-form :model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('labDevice.isMove')" label-width="120px" required>
        <el-select class="input-with-select" v-model="status">
          <el-option :value="1" :label="$t('labDevice.yes')"></el-option>
          <el-option :value="0" :label="$t('labDevice.no')"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="!status" :label="$t('labDevice.moveAddress')" label-width="120px" required>
        <el-select class="input-with-select" v-model="form.roomId" :placeholder="$t('common.placeholder')">
          <el-option
            v-for="item in rooms"
            :key="item.id"
            :value="item.id"
            :label="item.name + ' (' + item.gatewayName + ')'"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('room.groupMsg')" label-width="120px">
        <el-input class="input-with-select" type="textarea" v-model.trim="form.remark" :placeholder="$t('common.inputComment')"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" v-loading="loading" @click="onsubmit">{{ $t('common.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import SelectRoomTree from "@c/SelectRoomTree";
import {postPropertyIgnorePosition, postPropertyPositionChange, postPropertyUnusualMsgIgnore} from "@/api/property";
import {getRoomPositionRoomList} from "@/api/room";

export default {
  name: "PositionAdjustment",
  components: {SelectRoomTree},
  data() {
    return {
      dialogFormVisible: false,
      form: {
        roomName: "",
        roomId: "",
        msgIdList: [],
        remark: ""
      },
      status: 1,
      loading: false,
      rooms: []
    }
  },
  methods: {
    selectRoom(id, name) {
      this.form.roomId = id;
      this.form.roomName = name;
    },
    handleClose() {
      this.dialogFormVisible = false;
      this.form = {
        roomName: "",
        roomId: "",
        msgIdList: [],
        remark: ""
      }
      this.$emit('close')
    },
    open(id) {
      this.dialogFormVisible = true;
      this.form.msgIdList.push(id);
      getRoomPositionRoomList().then(res => {
        if (res.code) {
          this.rooms = res.items;
        }
      })
    },
    onsubmit() {
      this.loading = true;
      if (this.status) {
        delete this.form.roomId;
        delete this.form.roomName;
        postPropertyUnusualMsgIgnore(this.form).then(res => {
          this.loading = false;
          if (res.code) {
            this.$message.success(this.$t('common.editSuccess'));
            this.handleClose();
          } else {
            this.$message.error(res.message);
          }
        })
      } else {
        if (this.form.roomId) {
          this.rooms.map((item) => {
            if (item.id === this.form.roomId) {
              this.form.roomName = item.name + item.gatewayName
            }
          })
        }
        postPropertyPositionChange(this.form).then(res => {
          this.loading = false;
          if (res.code) {
            this.$message.success(this.$t('common.editSuccess'));
            this.handleClose();
          } else {
            this.$message.error(res.message);
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>