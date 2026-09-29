<template>
  <div>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body width="28%">
      <el-form v-model="form" label-position="left" label-width="auto">
        <el-form-item
            required
            :label="$t('system.gradeName')">
          <el-input
              v-model.trim="form.gradeName"
              autocomplete="off"
              class="select-change-p"
              maxlength="20"
              :placeholder="$t('common.pleaseInput')"
              :disabled="select"/>
        </el-form-item>
        <el-form-item :label="$t('system.groupName')">
          <div @click="handleSelectGroup">
            <el-input
                class="select-change-p"
                :readonly="true"
                :placeholder="$t('common.placeholder')"
                v-model="form.groupName"
                :disabled="select">
              <template slot="append"> ></template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item :label="$t('room.groupMsg')">
          <el-input
              type="textarea"
              rows="5"
              v-model.trim="form.gradeMsg"
              maxlength="200"
              autocomplete="off"
              show-word-limit
              :placeholder="$t('common.inputComment')"
              class="select-change-p"
              :disabled="select">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button v-if="select" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button v-else :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" v-if="!select" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
    </el-dialog>
    <select-group ref="SelectGroup" @handle="handleGetGroup"/>
  </div>
</template>

<script>

import {items} from "@/utils/constant";
import {checkEquipmentNo} from "@/api/device";
import {queryGroup, insertGrade, updateGrade} from "@/api/system"
import SelectGroup from "@/views/system/components/SelectGroup";

export default {
  name: "CreateDeviceLevel",
  components: {
    SelectGroup,
  },
  data() {
      const _this = this
    return {
      dialogVisible: false,
      dialogGroup: false,
      groupData: [],
      total: 0,
      title: _this.$t('system.addLabDevice'),
      radio: '',
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        query: "",
      },
      multiSelect: false,
      form: {
        gradeName: "", //等级名称
        gradeMsg: "", //描述
        groupName: "", //群组
        groupId: "",//群组id
        id: "",//等级id
      },
      loading: false,
      disabled: false,
      select:false,
      type: 0,
    }
  },
  methods: {
    handleSelectGroup() {
      if (this.select) {
        return;
      }
      this.$refs.SelectGroup.open(this.form);
    },
    handleGetGroup(item) {
      this.form.groupName = item.groupName;
      this.form.groupId = item.groupId;
    },
    handleClose() {
      this.form = {
        id: "",//等级id
        gradeName: "", //等级名称
        gradeMsg: "", //描述
        groupName: "", //群组
        groupId: "",//群组id
      };
      this.dialogVisible = !this.dialogVisible;
    },
    /**
     * 打开弹窗
     * @param type 0： 新增、1： 编辑
     * @param items
     */
    open(type, items) {
      this.dialogVisible = !this.dialogVisible;
      this.type = type;
      if (type === 0) {
        this.title = this.$t('system.addLabDevice');
      } 
      if (type === 1) {
        this.title = this.$t('system.editLabDevice');
        this.form.id = items.id;
        this.select = false;
        this.form.gradeName = items.gradeName || null; //等级名称
        this.form.gradeMsg = items.gradeMsg || null;    //描述
        this.form.groupName = items.groupName || null; //群组
        this.form.groupId = items.groupId || null;//群组id
      }
      if (type === 2) {
        this.title = this.$t('system.editLabDevice');
        this.form.id = items.id;
        this.select = true;
        this.form.gradeName = items.gradeName || null; //等级名称
        this.form.gradeMsg = items.gradeMsg || null;    //描述
        this.form.groupName = items.groupName || null; //群组
        this.form.groupId = items.groupId || null;//群组id
      }
    },
    //确定提交增加设备等级
    handleSubmit() {
      if (!this.form.gradeName) {
        return this.$message.error(this.$t('system.inputLabDevice'));
      }
      this.disabled = true;
      let temp = []
      temp.push(this.form.groupId);
      this.form.groupId = temp;
      if (this.type == 1) {
        updateGrade(this.form).then(res => {
          this.handleResult(res);
        }).finally(()=>{
          this.disabled = false;
        });
      } else {
        insertGrade(this.form).then(res => {
          this.handleResult(res);
        }).finally(()=>{
          this.disabled = false;
        });
      }
    },
    handleResult(res) {
      if (res.code) {
        this.$message.success(res.message || this.title + this.$t('common.success'));
        this.handleClose();
        this.$emit("getList");
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../style/variable";

/deep/ .el-input-group__append {
  padding: 0 20px !important;
  color: @555 !important;
  background: #F4F4F9 !important;

  .el-button {
    height: 35px;
  }

  i {
    color: @white;
  }
}

/deep/ .el-input-group__append, .el-input-group__prepend {
  border: none !important;
}
</style>