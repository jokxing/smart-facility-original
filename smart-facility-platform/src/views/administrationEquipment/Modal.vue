<template>
  <el-dialog
    :title="isEdit ? '修改设备' : '新增设备'"
    width="634px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    custom-class="modal-default modal-labDevice"
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <div class="modal-default-content">
          <el-form
            :model="ruleForm"
            ref="labDeviceForm"
            :rules="rules"
            label-width="85px"
          >
            <div class="flexBox">
              <!-- <el-form-item label="所属部门" prop="departmentId">
                <el-select
                  v-model="ruleForm.departmentId"
                  placeholder="请选择部门"
                  @change="handleDeptSelect"
                >
                  <el-option
                    v-for="item in departmentList"
                    :label="item.name"
                    :value="item.id"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item> -->
              <el-form-item label="部门" prop="departmentId">
                <SelectTree
                  :model="ruleForm.departmentId"
                  :prop="props"
                  :options="departmentData"
                  :value="selectTreeValue"
                  :clearable="isClearable"
                  :accordion="isAccordion"
                  @getValue="getValue($event)"
                  placeholder="请选择部门"
                />
              </el-form-item>

              <!-- <el-form-item label="所属房间" prop="roomId">
                <SelectFilter
                  :vmodel="ruleForm.roomId"
                  placeholder="请选择房间"
                  :data="roomList"
                  @remote_method="remoteMethod"
                  @set_model_value="handleSetRoomId"
                />
              </el-form-item> -->
              <el-form-item label="所属房间" prop="roomId">
                <el-select v-model="ruleForm.roomId" placeholder="请选择房间">
                  <el-option
                    v-for="item in roomList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="设备名称" prop="name">
                <el-input
                  v-model="ruleForm.name"
                  placeholder="请填写设备名称"
                  maxlength="26"
                ></el-input>
              </el-form-item>

              <el-form-item label="设备编号" prop="no">
                <el-input
                  v-model="ruleForm.no"
                  placeholder="请填写设备编号"
                ></el-input>
              </el-form-item>

              <el-form-item label="设备类型" prop="types">
                <el-select
                  v-model="ruleForm.types"
                  placeholder="请选择设备类型"
                  @change="getPictureData"
                >
                  <el-option
                    v-for="item in INSTRUMENTTYPE"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="设备型号" prop="model">
                <el-input
                  v-model="ruleForm.model"
                  placeholder="请填写设备型号"
                ></el-input>
              </el-form-item>
              <el-form-item label="购买日期" prop="buyDate">
                <el-date-picker
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="选择购买日期"
                  v-model="ruleForm.buyDate"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="设备价格" prop="price">
                <el-input-number
                  v-model="ruleForm.price"
                  :precision="2"
                  placeholder="请填写设备价格"
                ></el-input-number>
              </el-form-item>
              <el-form-item label="连接的网关" prop="network">
                <el-input
                  v-model="ruleForm.network"
                  placeholder="连接的网关"
                ></el-input>
              </el-form-item>
            </div>

            <div class="upload-box flexBox">
              <div class="input-row-label">系统图片</div>
              <el-image
                class="picBox"
                :src="BASE_URL + iconActive"
                :preview-src-list="[BASE_URL + iconActive]"
              >
              </el-image>
              <!-- <img class="picBox" :src="BASE_URL + iconActive" /> -->
            </div>
            <div class="upload-box flexBox">
              <span class="input-row-label"></span>
              <div class="systemIcon-group">
                <div
                  v-for="(item, index) in pictureList"
                  :key="index"
                  :class="iconActive === item ? 'active' : ''"
                  :style="{
                    background: `url(${BASE_URL + item}) no-repeat`,
                    backgroundSize: '100% auto',
                    backgroundPosition: 'center center',
                  }"
                  class="systemIcon-list"
                  @click="handleSelectSystemIcon(item)"
                ></div>
              </div>
            </div>

            <el-form-item label="说明" prop="remark">
              <el-input
                type="textarea"
                v-model="ruleForm.remark"
                placeholder="请填写说明"
                maxlength="50"
                rows="4"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleFormSubmit('labDeviceForm')"
      >
        确 定</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import SelectTree from "@/components/SelectTree";
import { getDepartment } from "@/api/department";
import {STATUS_VALUE, INSTRUMENTTYPE, BASE_URL, ERROR} from "@/utils/constant";
import { getInstrumentAdd, getInstrumentUpdate } from "@/api/labDevice";
import { getRoomList } from "@/api/room";
import { getFileInstrumentPic } from "@/api/upload";
import SelectFilter from "@/components/SelectFilter";
import { mapState, mapMutations } from "vuex";
import moment from "moment";
export default {
  components: {
    SelectFilter,
    SelectTree,
  },
  data() {
    return {
      INSTRUMENTTYPE,
      BASE_URL,
      pictureList: [],
      iconActive: "",
      departmentList: [],
      roomList: [],
      submitLoading: false,
      departmentId: "",
      ruleForm: {
        departmentId: "",
        name: "",
        no: "",
        addr: "",
        model: "",
        price: "",
        resource: "",
        productionDate: "",
        types: 2,
        buyDate: moment(new Date()).format("YYYY-MM-DD")
      },
      rules: {
        departmentId: [
          { required: true, message: "请选择部门", trigger: "change" },
        ],
        name: [
          { required: true, message: "设备名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 26,
            message: "长度在 2 到 26 个字符",
            trigger: "blur",
          },
        ],
        no: [
          {
            required: true,
            message: "设备编号不能为空",
            trigger: "blur",
          },
        ],
      },
      isClearable: true, // 可清空（可选）
      isAccordion: false, // 可收起（可选）
      selectTreeValue: "0", // 初始ID（可选）
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "subDivisions",
      },
    };
  },
  created() {
    this.getDepartmentData();
    this.getPictureData();
    this.getRoomData({ pageSize: 10000, pageNum: 1 });
    if (this.isEdit) {
      let { logoUrl, departmentId } = this.editData;
      this.selectTreeValue = departmentId.toString();
      this.iconActive = logoUrl;
      this.ruleForm = {
        ...this.editData,
        departmentId: departmentId.toString(),
      };
    }
  },
  computed: {
    ...mapState("lab", {
      isEdit: "isEdit",
      editData: "editData",
    }),
    departmentData() {
      const traverse = (array, _proto) => {
        let am = array.map((arr) => {
          if (arr[_proto].length && arr[_proto].length > 0) {
            traverse(arr[_proto], _proto);
          }
          arr.id = arr["id"].toString();
        });
        return array;
      };
      return traverse(this.departmentList, "subDivisions");
    },
  },

  methods: {
    ...mapMutations("lab", {
      handleHideModal: "HIDEMODAL",
      handleReflesh: "REFLESH",
    }),

    // remoteMethod(val) {
    //   console.log(val);
    //   if (val.trim()) {
    //     this.getRoomData({ keyword: val, pageSize: 10000, pageNum: 1 });
    //   }
    // },
    getValue(value) {
      this.selectTreeValue = value;
      this.ruleForm = { ...this.ruleForm, departmentId: value };
    },

    handleModalClose(done) {
      done();
      this.handleHideModal();
    },

    handleDeptSelect(key) {
      this.departmentId = key;
    },
    // handleSetRoomId(value) {
    //   this.ruleForm.roomId = value;
    // },

    // 选中系统图片
    handleSelectSystemIcon(value) {
      this.iconActive = value;
    },

    // 系统图片列表
    async getPictureData() {
      try {
        let pictures = [];
        var data = {
          type: this.ruleForm.types
        };
        let result = await getFileInstrumentPic(data);
        if (result.code == 1) {
          pictures = result.items;
          if (!this.isEdit && pictures.length && pictures.length > 0) {
            this.iconActive = pictures[0];
          }
        }
        this.pictureList = pictures;
      } catch (err) {
        this.pictureList = [];
        throw err;
      }
    },

    async addAsny() {
      try {
        this.submitLoading = true;
        let result = await getInstrumentAdd({ ...this.ruleForm });
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success("新增成功");
          this.handleHideModal();
          this.handleReflesh();
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },

    async updateAsny() {
      try {
        this.submitLoading = true;
        let result = await getInstrumentUpdate({ ...this.ruleForm });
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success("修改成功");
          this.handleHideModal();
          this.handleReflesh();
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },

    handleFormSubmit(formData) {
      if (this.submitLoading) return;
      this.$refs[formData].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            this.updateAsny();
          } else {
            this.addAsny();
          }
        }
      });
    },
    handleCancel() {
      this.handleHideModal();
    },

    async getRoomData(obj) {
      const _ = this;
      try {
        let temp = [];
        let result = await getRoomList(obj);
        if (result.code === STATUS_VALUE.NORMAL) {
          temp = result.items.list;
        } else {
          temp = [];
        }
        _.roomList = temp;
      } catch (err) {
        _.roomList = [];
        this.$message.error(ERROR);
        throw err;
      }
    },

    async getDepartmentData() {
      const _ = this;
      try {
        let temp = [];
        let result = await getDepartment();
        if (result.code === STATUS_VALUE.NORMAL) {
          temp = result.items.list;
        } else {
          temp = [];
        }
        _.departmentList = temp;
      } catch (err) {
        _.departmentList = [];
        this.$message.error(ERROR);
        throw err;
      }
    },
  },
};
</script>

<style lang="less">
@import "../../style/default.less";
</style>
<style lang="less" scoped>
.modal-labDevice {
  .input-row-label {
    display: inline-block;
    width: 85px;
    text-align: right;
    padding: 0 12px 0 0;
  }

  .upload-box {
    margin-bottom: 10px;
    .picBox {
      width: 100px;
      height: 100px;
      border: 1px solid #e5e5e5;
      border-radius: 3px;
    }
  }

  .systemIcon-group {
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    .systemIcon-list {
      width: 60px;
      height: 60px;
      line-height: 60px;
      text-align: center;
      border: 1px solid #e5e5e5;
      margin: 0 10px 10px 0;
      border-radius: 3px;
      cursor: pointer;
      position: relative;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        border-color: #409eff;

        &::before {
          content: "";
          position: absolute;
          right: 0;
          bottom: 0;
          border: 12px solid #409eff;
          border-top-color: transparent;
          border-left-color: transparent;
        }

        &::after {
          content: "";
          width: 3px;
          height: 8px;
          position: absolute;
          right: 4px;
          bottom: 4px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          transform: rotate(45deg);
        }
      }

      .iconfont {
        font-size: 32px;
      }
    }
  }
}
</style>
