<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
      title="编辑信号源">
    <el-form v-model="signalSourceList">
      <el-form-item v-for="item in signalSourceList" :key="item.idx" :label="labelName(item.idx)">
        <el-input v-if="item.idx <= 4" v-model.trim="item.name" class="select-change-p" maxlength="10" placeholder="请输入"/>
        <br v-if="item.idx > 4"/>
        <div v-if="item.idx > 4">
          <el-form-item label="名称" label-width="90px">
            <el-input v-model="item.name" class="select-change-p" maxlength="10" placeholder="请输入"/>
          </el-form-item>
        </div>
        <div v-if="item.idx > 4">
          <el-form-item class="margin-center" label="单位" label-width="90px">
            <el-select v-model="item.unitId" class="select-change-p" placeholder="请选择监控数据单位">
              <el-option
                  v-for="item in units"
                  :key="item.id"
                  :label="labelUnit(item)"
                  :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">取 消</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getSignalSourceEdit, getSignalSourceUnit} from "@/api/alertor";
import {ERROR} from "@/utils/constant";

const defense = {
  1: "防区一",
  2: "防区二",
  3: "防区三",
  4: "防区四",
  5: "防区五",
}
export default {
  name: "Defense",
  data() {
    return {
      dialogVisible: false,
      units: [],
      no: null,
      signalSourceList: [],
      disabled: false
    }
  },
  computed: {
    labelName() {
      return (val) => {
        return defense[val];
      }
    }
  },
  methods: {
    open(no, signalSource) {
      this.no = no;
      this.dialogVisible = true;
      this.signalSourceList = JSON.parse(JSON.stringify(signalSource));
      getSignalSourceUnit().then(res => {
        this.units = res.items;
      });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    async handleSubmit() {
      this.disabled = true;
      try {
        const res = await getSignalSourceEdit({
          equipmentNo: this.no,
          signalSourceList: this.signalSourceList
        });
        this.disabled = false;
        if (res.code) {
          this.$message.success("编辑防区成功");
          this.$parent.handleGetSignalSourceList();
          this.handleClose();
        } else {
          this.$message.error(res.message);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    labelUnit(item) {
      if (item.unit) {
        return item.name + "（" + item.unit + "）";
      } else {
        return item.name;
      }
    }
  }
}
</script>
