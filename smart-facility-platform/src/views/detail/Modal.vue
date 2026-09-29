<template>
  <el-dialog
    :title="modalTitle"
    width="634px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    :close-on-click-modal="false"
    custom-class="modal-default"
    :modal-append-to-body="false"
    append-to-body
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <div class="modal-default-content">
          <el-form :model="form" ref="form" :rules="rules" label-position="left" label-width="auto">
            <!-- 新增预约 -->
            <template v-if="modalType === 1">
              <el-form-item
                :label="$t('labDevice.orderUsername')"
                prop="userName"
                class="input-row-block"
              >
                <el-input
                  v-model="form.userName"
                  placeholder=""
                  disabled
                ></el-input>
              </el-form-item>

              <el-form-item :label="$t('labDevice.orderTime')" prop="dateBetween">
                <DateTimeSelect
                  :dateTime="dateTime"
                  :startDisabled="startDisabled"
                  @getDateTime="getDateTime" />
              </el-form-item>

              <!-- <el-form-item label="备注" prop="remark">
                <el-input
                  type="textarea"
                  v-model="form.remark"
                  placeholder="请填写备注"
                  maxlength="50"
                  rows="5"
                  show-word-limit
                ></el-input>
              </el-form-item> -->
            </template>
            <!-- 申请维保 -->
            <template v-else-if="modalType === 2">
              <template v-if="!isEdit">
                <el-form-item :label="$t('labDevice.remark')" prop="remark">
                  <el-input
                    type="textarea"
                    v-model="form.remark"
                    :placeholder="$t('labDevice.inputRemark')"
                    maxlength="50"
                    rows="5"
                    show-word-limit
                  ></el-input>
                </el-form-item>
                <div class="formDesc">{{ $t('labDevice.addMaintenanceHint') }}</div>
              </template>
              <template v-else>
                <el-form-item
                  :label="$t('labDevice.nextMaintenanceDate')"
                  :label-width="lang.indexOf('zh') > -1 ? '120px' : '170px'"
                  prop="nextMaintenanceDate"
                >
                  <el-date-picker
                    v-model="form.nextMaintenanceDate"
                    :picker-options="dateOptions"
                    type="datetime"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    :placeholder="$t('common.selectTime')"
                  >
                  </el-date-picker>
                </el-form-item>
              </template>
            </template>
            <!-- 添加管理人 -->
            <template v-else-if="modalType === 3">
              <el-form-item label="部门" prop="departmentId">
                <SelectTree
                  :model="form.departmentId"
                  :prop="props"
                  :options="departmentData"
                  :value="selectTreeValue"
                  :clearable="isClearable"
                  :accordion="isAccordion"
                  @getValue="getValue($event)"
                  placeholder="请选择部门"
                />
              </el-form-item>
              <el-form-item label="负责人" prop="userIds">
                <el-select
                  v-model="form.userIds"
                  multiple
                  collapse-tags
                  placeholder="请选择负责人"
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="报警方式" prop="alarmType">
                <el-checkbox-group v-model="form.alarmType">
                  <el-checkbox
                    v-for="item in alarmTypeList"
                    :key="item.value"
                    :label="item.label"
                    @change="getAlarmType(item.value,$event)"
                  ></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </template>

            <!-- 进出管理 -->
            <!-- <template v-else-if="modalType === 3">
              <el-form-item label="使用前存量" prop="">
                <el-input
                  v-model="form.pre"
                  placeholder="请输入使用前存量"
                ></el-input>
              </el-form-item>
              <el-form-item label="使用后存量">
                <el-input
                  v-model="form.sux"
                  placeholder="请输入使用后存量"
                ></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input
                  type="textarea"
                  v-model="form.remark"
                  placeholder="请填写备注"
                  maxlength="50"
                  rows="5"
                  show-word-limit
                ></el-input>
              </el-form-item>
            </template> -->

            <!-- 补充记录 -->
            <template v-else-if="modalType === 4">
              <el-form-item label="物品名称" prop="">
                <el-input
                  v-model="form.pre"
                  placeholder="请输入物品名称"
                  maxlength="26"
                ></el-input>
              </el-form-item>

              <el-form-item label="型号" prop="">
                <el-input
                  v-model="form.pre"
                  placeholder="请输入型号"
                ></el-input>
              </el-form-item>

              <el-form-item label="规格" prop="">
                <el-input
                  v-model="form.pre"
                  placeholder="请输入规格"
                ></el-input>
              </el-form-item>

              <el-form-item label="使用前存量" prop="">
                <el-input
                  v-model="form.pre"
                  placeholder="请输入使用前存量"
                ></el-input>
              </el-form-item>
              <el-form-item label="使用后存量">
                <el-input
                  v-model="form.sux"
                  placeholder="请输入使用后存量"
                ></el-input>
              </el-form-item>

              <el-form-item label="备注" prop="remark">
                <el-input
                  type="textarea"
                  v-model="form.remark"
                  placeholder="请填写备注"
                  maxlength="50"
                  rows="5"
                  show-word-limit
                ></el-input>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleFormSubmit('form')"
      >
        {{ $t('common.confirm') }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { getUserList, addThingsConscientious} from "@/api/user";
import { getDepartment } from "@/api/department";
import {ERROR, STATUS_VALUE} from "@/utils/constant";
import {
  getInstrumentUpdate,
  getInstrumentReservationAdd,
  getInstrumentReservationUpdate,
  postMaintenanceUpdateMaintenance,
  postMaintenanceAdd,
} from "@/api/labDevice";
import { mapState, mapMutations } from "vuex";
import SelectTree from "@/components/SelectTree";
import DateTimeSelect from "@/components/DateTimeSelect";
import moment from "moment";
export default {
  components: {
    SelectTree,
    DateTimeSelect
  },
  props: {
    detailId: {
      type: Number,
      default: ""
    }
  },
  data() {
    return {
      lang: localStorage.getItem('lang'),
      alarmTypeList: [
        {
          label: "手机报警",
          value: "phone",
        },
        {
          label: "短信报警",
          value: "sms",
        },
        {
          label: "微信报警",
          value: "weixin",
        },
      ],
      departmentList: [],
      imageUrl: "",
      submitLoading: false,
      userList: [],
      defaultTime: [],
      dateOptions:{
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      form: {
        userName: "",
        departmentId: "",
        name: "",
        no: "",
        addr: "",
        model: "",
        price: "",
        resource: "",
        productionDate: "",
        alarmType: [],
        userIds: [],
        dateBetween: []
      },
      datePickerOption: {
        disabledDate: (time) => {
          let nowDate = new Date();
          let oneDay = 1000 * 60 * 60 * 24;
          // let oneYearLater = new Date(nowDate.getTime() + oneDay * 365);
          let yesterday = new Date(nowDate.getTime() - oneDay);
          return time.getTime() < yesterday;
        }
      },
      rules: {
        userIds: [
          { required: true, message: "请选择负责人", trigger: "change" },
        ],
        name: [
          { required: true, message: "设备名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
        no: [
          {
            required: true,
            message: "设备编号不能为空",
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
      // 添加管理人提交的数据
      addManagementData: {
        userIds: [],
        weixin: -1,
        sms: -1,
        phone: -1,
        type: 4,
        thingsId: ""
      },
      // 禁止更改开始时间
      startDisabled: false,
      // 开始时间与结束时间的对象
      dateTime: {}
    };
  },
  computed: {
    ...mapState("detail", {
      detailData: "detailData",
      modalTitle: "modalTitle",
      modalType: "modalType",
      isEdit: "isEdit",
      editData: "editData",
      makeAnAppointment: "makeAnAppointment",
      userName: "userName"
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
  created() {
    this.getDepartmentData();
    let obj = this.detailData;
    if (this.isEdit) {
      let { timeFrom, timeTo, status ,userName} = this.editData;
      let dateBetween = [timeFrom, timeTo];
      obj = { ...obj, dateBetween };
      this.form = {...obj,alarmType:[]};
      this.form.userName = userName;
      this.dateTime = {
        start: moment(timeFrom).format("YYYY-MM-DD HH:mm"),
        end: moment(timeTo).format("YYYY-MM-DD HH:mm")
      };
      if(status == 1){
        this.startDisabled = true;
      }

      // if(this.modalType == 2){
      //   this.form.nextMaintenanceDate = ""
      // }
    }else{
      this.form.userName = this.userName;
      // 预约-赋值预约时间
      if(this.makeAnAppointment && this.makeAnAppointment != ""){
        this.dateTime = this.makeAnAppointment;
        // 选择月模式
        if(this.makeAnAppointment.allDay){
          var myGetTime = new Date().getTime();
          var start = this.makeAnAppointment.start + " " + moment(myGetTime + 60 * 1000).format('HH:mm');
          var end = this.makeAnAppointment.end + " 23:59"
          this.form.dateBetween = [start,end]
        }else{ //选择周模式或日模式
          this.form.dateBetween = [this.makeAnAppointment.start, this.makeAnAppointment.end]
        }
      }
    }
  },
  mounted() {
    this.handleGetUserList()
  },
  methods: {
    ...mapMutations("detail", {
      handleHideModal: "HIDEMODAL",
      handleReflesh: "TABMODULEREFLESH",
      handleHiddenModal: "HIDDENMODAL"
    }),

    handleModalClose(done) {
      done();
      this.$refs["form"].resetFields();
      this.handleHideModal();
    },

    getDateTime(e){
      this.form.dateBetween = e;
    },

    getValue(value) {
      this.selectTreeValue = value;
      this.form = { ...this.form, departmentId: value };
      this.departmentId = value;
      this.handleGetUserList()
    },

    async updateMaintenance() {
      try {
        this.submitLoading = true;
        const { nextMaintenanceDate } = this.form;
        const { id } = this.editData;

        let obj = {
          nextMaintenanceDate,
          maintenanceId: id,
        };
        let result = await postMaintenanceUpdateMaintenance(obj);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success(this.$t('hardware.systemSuccess'));
          this.handleHideModal();
          this.$refs["form"].resetFields();
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

    async addMaintenance() {
      try {
        this.submitLoading = true;
        const { remark } = this.form;
        const {
          companyId,
          departmentId,
          departmentName,
          id,
          name,
          no,
          createUserId,
        } = this.detailData;

        let obj = {
          companyId,
          departmentId,
          departmentName,
          instrumentId: id,
          instrumentName: name,
          instrumentNo: no,
          remark,
          userId: createUserId,
        };
        let result = await postMaintenanceAdd(obj);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success(this.$t('labDevice.maintenanceSuccess'));
          this.handleHideModal();
          this.$refs["form"].resetFields();
          this.handleReflesh();
          this.$parent.desc.status = 3
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

    async orderAddAsync() {
      try {
        this.submitLoading = true;
        const { userName, dateBetween, remark } = this.form;
        const {
          companyId,
          companyName,
          departmentId,
          id,
          name,
          no,
          createUserId,
        } = this.detailData;

        let obj = {
          userName,
          companyId,
          departmentId,
          instrumentId: id,
          instrumentName: name,
          instrumentNo: no,
          remark,
          userId: createUserId,
        };
        if (dateBetween) {
          let timeFrom = dateBetween[0];
          let timeTo = dateBetween[1];
          obj = { ...obj, timeFrom, timeTo };
        }
        let result = await getInstrumentReservationAdd(obj);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success("新增成功");
          this.handleHideModal();
          this.$refs["form"].resetFields();
          this.handleReflesh();
          this.$emit("goIsFullcalendar")
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

    async orderEditAsync() {
      try {
        this.submitLoading = true;
        const { dateBetween, remark } = this.form;
        const { id } = this.editData;
        const instrumentId = this.detailData.id;
        let obj = {
          id,
          remark,
          instrumentId,
        };
        if (dateBetween) {
          let timeFrom = dateBetween[0];
          let timeTo = dateBetween[1];
          obj = { ...obj, timeFrom, timeTo };
        }
        let result = await getInstrumentReservationUpdate(obj);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success("更改成功");
          this.handleHideModal();
          this.$refs["form"].resetFields();
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
    // 负责人列表
    handleGetUserList() {
      this.userList = [];
      getUserList({
        departmentId: this.departmentId,
        pageNum: 1,
        pageSize: 1000
      }).then(res => {
        this.userList = res.items.list;
      })
    },
    // 报警方式赋值
    getAlarmType (value,event) {
      this.addManagementData[value] = event ? 0 : -1
    },
    // 确认提交
    handleFormSubmit(formData) {
      if (this.submitLoading) return;
      this.$refs[formData].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            switch (this.modalType) {
              case 1:
                var dateBetween = this.form.dateBetween;
                if(new Date().getTime() > new Date(dateBetween[1]).getTime()){
                  this.$message.error("预约结束时间不能小于当前时间")
                }else{
                  this.orderEditAsync();
                }
                break;
              case 2:
                if(new Date(this.form.nextMaintenanceDate).getTime() < new Date(this.editData.createDate).getTime()){
                  this.$message.error("下次维保时间不能小于当前维保的申请时间")
                }else{
                  this.updateMaintenance();
                }
                break;
            }
          } else {
            switch (this.modalType) {
              case 1:
                var dateBetween = this.form.dateBetween;
                if(new Date(dateBetween[0]).getTime() > new Date(dateBetween[1]).getTime()){
                  this.$message.error("预约开始时间不能大于结束时间")
                }else{
                  this.orderAddAsync();
                }
                break;
              case 2:
                this.addMaintenance();
                break;
              case 3:
                this.addManagement();
                break;
            }
          }
        }
      });
    },
    // 添加管理人员请求
    addManagement () {
      this.submitLoading = true;
      this.addManagementData.userIds = this.form.userIds;
      this.addManagementData.thingsId = this.detailId;
      addThingsConscientious(this.addManagementData).then(res => {
        this.submitLoading = false;
        if (res.code === STATUS_VALUE.NORMAL) {
          this.$message.success("添加负责人成功！");
          this.handleHiddenModal();
          this.handleReflesh();
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleCancel() {
      this.$refs["form"].resetFields();
      this.handleHideModal();
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
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG或者PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
  },
};
</script>

<style lang="less">
@import "../../style/default.less";
</style>
<style lang="less" scoped>
.formDesc {
  padding-left: 16px;
  color: #ff4949;
}
</style>
