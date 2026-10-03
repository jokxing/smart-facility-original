<template>
  <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body>
    <el-form v-model="form" label-width="auto" label-position="left">
      <el-form-item :rules="[{required: true}]" :label="$t('common.name')">
        <el-input
            v-model.trim="form.name"
            autocomplete="off"
            maxlength="14"
            class="select-change-p"
            :placeholoder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :rules="[{required: true}]" :label="$t('common.no')">
        <el-input
            v-model.trim="form.no"
            autocapitalize="off"
            maxlenth="15"
            class="select-change-p"
            oninput="value=value.replace(/[^A-Za-z0-9]/g, '')"
            :placeholoder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :label="$t('common.owningDepartment')" required>
        <select-department class="select-change-p" :select-tree-value.sync="form.departmentId" :department-id.sync="form.departmentId"/>
      </el-form-item>
      <el-form-item :label="$t('room.owningFloor')" required>
        <floor-select-tree
            :is-class="true"
            :id.sync="form.floorId"
            :buildingId.sync="form.buildingId"
            :select-tree-value.sync="form.floorId"
            :graden-name.sync="form.gradenName"
            class="select-change-p"
            :building-name.sync="form.buildingName"
            :floorName.sync="form.floorName"
            :data="$parent.floors"/>
      </el-form-item>
      <el-form-item :label="$t('common.remark')">
        <el-input
            v-model.trim="form.remark"
            :rows="4"
            autocomplete="off"
            maxlength="30"
            class="select-change-p"
            show-word-limit
            type="textarea"/>
      </el-form-item>
      <el-form-item v-if="isDemo" label="房间底图">
        <chuxou-upload
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            :limit="1"
            :max="5"
            :demo-local="true"
            :value="fileList"
            @handleUploadSuccess="handleMapUpload"
        />
        <div class="demo-map-hint">可选；PNG/JPEG ≤5MB。缺图时中控不串用其他房间底图。</div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import SelectTree from "@/components/SelectTree";
import {addRoom, updateRoomBasic} from "@/api/room";
import SelectDepartment from "@c/SelectdePartment";
import FloorSelectTree from "@c/FloorSelectTree";
import ChuxouUpload from "@/views/room/components/chuxouUpload";
import {resolveRoomMapUrl} from "@/utils/demoRoomMapUrl";
import {isDemoMediaKey, peekDemoMediaUrl} from "@/utils/demoMediaStore";

const isDemo = process.env.VUE_APP_DEMO === 'true';

export default {
  name: "Create",
  components: {
    FloorSelectTree,
    SelectDepartment,
    SelectTree,
    ChuxouUpload
  },
  inject: ["reload"],
  data() {
      const _this = this;
    return {
      isDemo,
      title: _this.$t('room.addRoom'),
      dialogVisible: false,
      fileList: [],
      originalMapUrl: "",
      form: {
        buildingName: "",
        buildingId: 0,
        companyId: 0,
        departmentId: localStorage.getItem("departmentId"),
        departmentName: "",
        equipmentStatus: 0,
        hasHazardousGoods: true,
        id: 0,
        imageUrls: "",
        floorId: "",
        floorName: "",
        name: "",
        no: "",
        projectName: "",
        remark: "",
        senorStatus: 0,
        status: 0,
        unitName: "",
        userNames: "",
        gradenName: "",
        mapUrl: ""
      },
      selectTreeValue: "0",
      type: 0,
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.selectTreeValue = "0";
      this.fileList = [];
      this.originalMapUrl = "";
      this.form = {
        buildingName: "",
        companyId: 0,
        departmentId: localStorage.getItem("departmentId"),
        departmentName: "",
        equipmentStatus: 0,
        hasHazardousGoods: true,
        id: 0,
        imageUrls: "",
        floorId: "",
        name: "",
        no: "",
        projectName: "",
        remark: "",
        senorStatus: 0,
        status: 0,
        unitName: "",
        userNames: "",
        mapUrl: ""
      };
    },
    open(type, row) {
      this.fileList = [];
      this.originalMapUrl = "";
      if (type) {
        this.title = this.$t('room.editRoom');
        let {remark, id, name, no, departmentId, floorId, buildingName, gradenName, mapUrl} = row;
        departmentId = departmentId.toString();
        this.form = {
          id,
          name,
          no,
          floorId: floorId.toString(),
          buildingName,
          gradenName,
          departmentId: departmentId,
          remark,
          mapUrl: mapUrl || ""
        }
        this.originalMapUrl = mapUrl || "";
        if (mapUrl) {
          const preview = resolveRoomMapUrl(mapUrl) || (isDemoMediaKey(mapUrl) ? peekDemoMediaUrl(mapUrl) : '');
          this.fileList = [{name: mapUrl, uid: String(id), url: preview}];
        }
        this.selectTreeValue = departmentId;
      } else {
        this.title = this.$t('room.addRoom');
      }
      this.type = type;
      this.dialogVisible = true;
    },
    handleMapUpload(list) {
      this.fileList = list || [];
      const file = this.fileList[0];
      this.form.mapUrl = file && file.name ? file.name : '';
    },
    handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('common.isNotName'));
      }
      if (!this.form.no) {
        return this.$message.error(this.$t('common.isNotNo'));
      }
      if (!this.form.departmentId) {
        return this.$message.error(this.$t('common.selectDepartemnt'));
      }
      if(!Number(this.form.floorId)){
        return this.$message.error(this.$t('room.selectOwningFloor'));
      }
      this.form.floorId = Number(this.form.floorId);
      if (this.fileList && this.fileList[0] && this.fileList[0].name) {
        this.form.mapUrl = this.fileList[0].name;
      } else if (this.type) {
        this.form.mapUrl = this.originalMapUrl || '';
      }
      if (this.type && this.originalMapUrl && this.form.mapUrl && this.form.mapUrl !== this.originalMapUrl) {
        this.$message.info('替换底图不会自动迁移或清除已有布局。');
      }
      if (this.type) {
        return updateRoomBasic(this.form).then(res => {
          this.handleMessage(res);
          return res;
        }).catch(() => this.$message.error('保存失败，请重试。'));
      }
      return addRoom(this.form).then(res => {
        this.handleMessage(res);
        return res;
      }).catch(() => this.$message.error('保存失败，请重试。'));
    },
    handleMessage(res) {
      if (res.code === 1) {
        this.$message.success(this.title + this.$t('common.success'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>

