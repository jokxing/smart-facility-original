<template>
  <el-dialog
    :before-close="handleModalClose"
    :close-on-click-modal="false"
    :title="isEdit ? $t('labDevice.addLabDevice') : $t('labDevice.updateLabDevice')"
    :visible="true"
    append-to-body
    destroy-on-close
    width="42%"
  >
    <div v-loading="loading" class="labDevice-modal">
      <el-row>
        <el-form
          ref="labDeviceForm"
          :model="ruleForm"
          :rules="rules"
          label-position="left" label-width="auto"
        >
          <el-col :span="12">
              <el-form-item :label="$t('labDevice.labDeviceName')" prop="name">
              <el-input
                v-model="ruleForm.name"
                class="select-change-p"
                maxlength="26"
                :placeholder="$t('labDevice.inputLabDeviceName')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item :label="$t('labDevice.labDeviceNo')" prop="no">
              <el-input
                v-model="ruleForm.no"
                class="select-change-p"
                maxlength="30"
                :placeholder="$t('labDevice.inputLabDeviceNo')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item :label="$t('labDevice.labDeviceType')" prop="types">

                <select-asset-classify
                    :is-class="true"
                    :id.sync="types"
                    :select-tree-value.sync="types"/>
            </el-form-item>

            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('common.department')" prop="departmentId">
                    <select-department
                        :department-id.sync="ruleForm.departmentId"
                        :select-tree-value.sync="ruleForm.departmentId"
                        class="select-change-p"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.labDeviceRatedWorkingTime')" prop="status">
                    <el-input-number
                        v-model="ruleForm.workingHours"
                        :min="0"
                        :max="100"
                        :step="0.01"
                        :precision="2"
                        :placeholder="$t('common.inputNum')"
                        class="select-change"
                    ></el-input-number>
                    <span class="unit">{{ $t('labDevice.host') }}/{{ $t('common.day3') }}</span>
                </el-form-item>
            </el-col>
          <el-col :span="12">
              <el-form-item :label="$t('common.principal')">
              <el-select class="select-change-p" filterable v-model="ruleForm.managerId">
                <el-option
                  v-for="item in userList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item :label="$t('common.owningRoom')" prop="roomId">
              <SelectRoomTree
                @getValue="selectRoom"
                class="select-change-p"
                :updateRoomName="ruleForm.roomName"
                :room-id.sync="ruleForm.roomId"
                :select-tree-value.sync="ruleForm.roomId"
              />
            </el-form-item>

                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('labDevice.labDeviceBrand')" prop="brand">
                            <el-input
                                v-model="ruleForm.brand"
                                class="select-change-p"
                                maxlength="10"
                                :placeholder="$t('labDevice.inputLabDeviceBrand')"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('labDevice.labDeviceModel')" prop="model">
                            <el-input
                                maxlength="20"
                                v-model="ruleForm.model"
                                class="select-change-p"
                                :placeholder="$t('labDevice.selectLabDeviceModel')"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('labDevice.labDeviceBuyDate')" prop="buyDate">
                            <el-date-picker
                                v-model="ruleForm.buyDate"
                                class="select-change-p"
                                :placeholder="$t('labDevice.selectLabDeviceBuyDate')"
                                type="date"
                                value-format="yyyy-MM-dd"
                            ></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('labDevice.labDevicePrice')" prop="price">
                            <el-input-number
                                v-model="ruleForm.price"
                                :precision="2"
                                class="select-change-p"
                                :placeholder="$t('labDevice.selectLabDevicePrice')"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('labDevice.labDeviceGrade')">

                            <el-select v-model="ruleForm.gradeId" class="select-change-p">
                                <el-option :key="undefined" :label="$t('common.placeholder')" :value="undefined"/>
                                <el-option v-for="item in gradeList" :key="item.id" :label="item.gradeName" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('common.remark')" prop="remark">
                            <el-input
                                v-model="ruleForm.remark"
                                class="select-change-p"
                                maxlength="50"
                                :placeholder="$t('labDevice.inputRemark')"
                                show-word-limit
                                type="textarea"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item v-if="!loading" :label="$t('labDevice.sysImg')" prop="iconActive">
                            <div class="upload-box">
                                <!-- 可以搜索系统图片 -->
                                <div class="search-box">
                                    <el-input
                                        class="select-change-p"
                                        @input="handeSearch"
                                        v-model="picTitle"
                                        :placeholder="$t('labDevice.searchSysImg')"
                                    />
                                </div>
                                <!-- 可以搜索系统图片 -->
                                <div class="picBox">
                                    <img v-if="iconActive" :src="isLogoUrl ? BASE_URL + iconActive : iconActive" />
                                    <span class="no-url" v-if="!isLogoUrl">{{ $t('labDevice.notImg') }}</span>
                                </div>
                            </div>
                            <div class="upload-box flexBox">
                                <div v-if="pictureLoading">{{ $t('labDevice.loadingImg') }}</div>
                                <div v-else>
                                    <div v-if="pictureList && pictureList.length > 0" class="systemIcon-group">
                                        <div
                                            v-for="(item, index) in pictureList"
                                            :key="index"
                                            @click="handleSelectSystemIcon(item.url)"
                                            :class="iconActive === item.url ? 'active' : ''"
                                            :style="{
                        backgroundImage: `url(${BASE_URL + item.url})`,
                      }"
                      class="systemIcon-list">
                      <span :title="item.title">{{ item.title }}</span>
                    </div>
                  </div>
                                    <div class="systemIcon-group" v-else>{{ $t('labDevice.notSearchSysImg') }}</div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <el-row justify="center" type="flex" v-if="!loading">
          <pagination
            v-show="total > 10"
            :limit.sync="items.pageSize"
            :page.sync="items.pageNum"
            :total="total"
            @pagination="getFileUrlByTitle"/>
      </el-row>
      <el-dialog :visible.sync="pictureVisible">
        <img :src="imageUrl" alt="" width="100%"/>
      </el-dialog>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t("common.cancel") }}</el-button>
        <el-button
            :loading="submitLoading"
            type="primary"
            @click="handleFormSubmit('labDeviceForm')"
        >
          {{ $t("common.confirm") }}</el-button>
      </span>
    </el-dialog>
</template>
<script>
import SelectTree from "@/components/SelectTree";
import SelectDepartment from "@c/SelectdePartment";
import {getDepartment} from "@/api/department";
import {getRoomList} from "@/api/room";
import {getFilePolicy, getFileUrlByTitle} from "@/api/upload";
import {STATUS_VALUE, INSTRUMENTTYPE, items, ERROR} from "@/utils/constant";
import {getInstrumentAdd, getInstrumentUpdate} from "@/api/labDevice";
import {getGradeGetList} from "@/api/system";
import {BASE_URL} from "@/utils/constant.js";
import {mapState, mapMutations} from "vuex";
import moment from "moment";
import Pagination from "@c/Pagination/index";

import SelectRoomTree from "@c/SelectRoomTree";
import SelectAssetClassify from "@c/SelectAssetClassify";

import i18n from "@/i18n";
const UPLOADTYPE = [
    {
        label: i18n.t('labDevice.customUpdate'),
        value: 1,
    },
    {
        label: i18n.t('labDevice.sysIcon'),
        value: 2,
    },
];

const SYSTEMICONSET = [
    {
        label: "液氮罐",
        value: "equipment005",
    },
    {
        label: "多门柜子",
        value: "cabinet002",
    },
    {
        label: "抽屉柜",
        value: "cabinet001",
    },
    {
        label: "电冰箱",
        value: "refrigerator001",
    },
    {
        label: "挂式空调",
        value: "air-conditioner-equipment002",
    },
    {
        label: "立式空调",
        value: "air-conditioner-equipment001",
    },
    {
        label: "危化品罐",
        value: "refrigeration-equipment",
    },
    {
        label: "视频设备",
        value: "videoe-quipment",
    },
    {
        label: "设备3",
        value: "equipment002",
    },
    {
        label: "电源开关",
        value: "power-supply",
    },
    {
        label: "存储设备",
        value: "storage-device",
    },
    {
        label: "设备1",
        value: "equipment004",
    },
    {
        label: "设备2",
        value: "equipment001",
    },
];

export default {
  props: ["roomId", "type"],
  components: {
    SelectTree,
    Pagination,
    SelectDepartment,
    SelectRoomTree,
      SelectAssetClassify
  },
  data() {
      const _this = this;
    return {
      // 系统图片
      picTitle: "",
      loading: false,
      pictureList: [],
      pictureLoading: false,
      UPLOADTYPE,
      SYSTEMICONSET,
      INSTRUMENTTYPE,
      picHost: "",
      departmentList: [],
      roomList: [],
      imageUrl: "",
      imageName: "",
      submitLoading: false,
      ossData: {},
      iconActive: "",
      isLogoUrl: false,
      pictureVisible: false,
      BASE_URL,
      ruleForm: {
        departmentId: localStorage.getItem("departmentId"),
        roomId: "",
        name: "",
        no: "",
        types: 1,
        // addr: "",
        buyDate: moment(new Date()).format("YYYY-MM-DD"),
        brand: "",
        model: "",
        price: "",
        remark: "",
        managerId: null,
        managerName: "",
        systemIcon: 1,
        gradeId: null,
        workingHours: 7.5
          // resource: "",
        // productionDate: "",
      },
      rules: {
        departmentId: [
            {required: true, message: _this.$t('common.selectDepartemnt'), trigger: "change"},
        ],
        name: [
            {required: true, message: _this.$t('common.isNotName'), trigger: "blur"},
          {
            min: 2,
            max: 26,
            message: _this.$t('labDevice.max2ToMax26'),
            trigger: "blur",
          },
        ],
        no: [
          {
            required: true,
            message: _this.$t('labDevice.labDeviceNotNo'),
            trigger: "blur",
          },
        ],
        types: [
          {
            required: true,
            message: _this.$t('labDevice.labDeviceNotType'),
            trigger: "change",
          },
        ],
      },
      isClearable: true, // 可清空（可选）
      isAccordion: false, // 可收起（可选）
      selectTreeValue: localStorage.getItem("departmentId"), // 初始ID（可选）
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "subDivisions",
      },
      disabled: false,
      items: {
        pageSize: 18,
        pageNum: 1
      },
      total: 0,
      systemList: [],
      gradeList: [],
      userList: [],
        types: null,
        classify: [],
    };
  },
  created() {
    this.getEquipmentGrade();
    this.getRoomData();
    this.getPolicy();
    this.handleGetUserList();
    this.ruleForm.roomId = this.roomId;
    this.disabled = !!this.roomId;

    this.classify = this.$store.state.assetClassify;
    if (this.type == 4) {
      this.ruleForm.types = 1;
    } else {
      this.ruleForm.types = this.type;
    }
    if (this.isEdit) {
      this.loading = true;
      let {logoUrl, departmentId, roomId} = this.editData;
      this.selectTreeValue = departmentId.toString();
      let systemIconType = 1;
      this.iconActive = logoUrl ? logoUrl : require("../../assets/systemImages/equipment.png");
      this.isLogoUrl = !!logoUrl;
      this.ruleForm = {
        ...this.editData,
        systemIcon: systemIconType,
        departmentId: departmentId.toString(),
        roomId: roomId
      };
    }
    const _this = this;
      function typesFn(arr) {
          arr.map(item => {
              if (item.types === _this.ruleForm.types * 1) {
                  _this.types = item.id;
              } else {
                  return typesFn(item.childrenList)
              }
          })
      }
      typesFn(this.classify)
    this.getFileUrlByTitle();
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
  watch: {
    "ruleForm.managerId": {
      handler(val) {
        this.userList.map(item => {
          if (item.id === val) {
            this.ruleForm["managerName"] = item.name;
          }
        })
      }
    }
  },
  mounted() {
  },
  methods: {
    // 根据title选择系统图片
    getFileUrlByTitle() {
      let _this = this;
      setTimeout(() => {
        let data = {
          title: _this.picTitle,
          type: _this.ruleForm.types,
          pageNum: _this.items.pageNum,
          pageSize: _this.items.pageSize
        };
        _this.pictureLoading = true;
        getFileUrlByTitle(data)
          .then(res => {

                        _this.pictureLoading = false;
                        _this.pictureList = res.items.list;
                        if(!_this.isEdit){
                            _this.iconActive = _this.pictureList.length > 0 ? _this.pictureList[0].url : require("../../assets/systemImages/equipment.png");
                            _this.isLogoUrl = true
                        }
                        _this.total = res.items.total;
                    })
                    .catch(err => {
                        _this.pictureList = [];
                        console.log(err);
                    });
            }, 200);
        },
        // 输入事件进行系统图片搜索
        handeSearch() {
            this.items.pageNum = 1;
            this.items.pageSize = 18;
            this.getFileUrlByTitle()
        },
        // 选择房间
        selectRoom(id, name) {
            this.ruleForm.roomId = id;
            this.ruleForm.roomName = name;
        },
        ...mapMutations("lab", {
            handleHideModal: "HIDEMODAL",
            handleReflesh: "REFLESH",
        }),
        handleGetUserList() {
            this.$store.dispatch("sys/getUsers", {pageSize: 10000, pageNum: 1}).then(res => {
                this.userList = res;
            })
        },
        handleScroll() {
            this.$refs.typesSelect.blur();
            this.$refs.roomSelect.blur();
            this.$refs.departmentSelect.$refs.select.blur()
        },

        handleSelectSystemIcon(value) {
            this.isLogoUrl = true;
            this.iconActive = value;
        },

        handleModalClose(done) {
            done();
            this.handleHideModal();
        },
        handleAvatarSuccess(res, file) {
            if (res.code === 1) {
                this.imageName = res.items.fileName;
                this.imageUrl = BASE_URL + res.items.fileName;
            } else {
                this.$message.error(res.message);
            }
        },
        handlePictureCardPreview(file) {
            this.pictureVisible = true;
        },

        // 选择房间
        handleRoomChange(e) {
            for (var i = 0; i < this.roomList.length; i++) {
                if (this.roomList[i].id == e) {
                    return this.ruleForm.roomName = this.roomList[i].name;
                }
            }
        },

        getEquipmentGrade() {
            getGradeGetList().then(res => {
                if (res.code === 1) {
                    this.gradeList = res.items
                }
            })
        },

    async addAsny() {
      try {
        this.submitLoading = true;
        let submitParams = {...this.ruleForm};
        submitParams = {
          ...submitParams,
          logoUrl: this.iconActive,
        };
        // }
        let result = await getInstrumentAdd(submitParams);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
            this.$message.success(this.$t('common.addSuccess'));
          this.handleHideModal();
          this.handleReflesh();
            this.$emit("handle")
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
    getValue(value) {
      this.selectTreeValue = value;
      this.ruleForm = {...this.ruleForm, departmentId: value};
    },
    async getPolicy() {
      try {
        let result = await getFilePolicy({});
        if (result.code === 1) {
          let {host, accessKey, callback, dir, policy, signature} =
            result.items;
          this.ossData = {
            policy,
            signature,
            OSSAccessKeyId: accessKey,
            dir,
            host,
            callback,
          };
          this.picHost = host;
        }
      } catch (err) {
          this.$message.error(this.$t('labDevice.signError'));
      }
    },
    async updateAsny() {
      try {
        this.submitLoading = true;
        let submitParams = {...this.ruleForm};
        let {systemIcon} = this.ruleForm;
        submitParams = {
          ...submitParams,
          logoUrl: this.iconActive,
        };
        let result = await getInstrumentUpdate({...submitParams});
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
            this.$message.success(this.$t('common.editSuccess'));
          this.handleHideModal();
          this.handleReflesh();
          this.$emit("handle")
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
            const _this = this;
            function typesFn(arr) {
                arr.map(item => {
                    if (item.id === _this.types * 1) {
                        _this.ruleForm.types = item.types;
                    } else {
                        return typesFn(item.childrenList)
                    }
                })
            }
            typesFn(this.classify)
          if (this.isEdit) {
            this.updateAsny();
          } else {
            this.addAsny();
          }
        }
      });
    },
    handleCancel() {
      this.items.pageNum = 1;
      this.items.pageSize = 18;
      this.total = 0;
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
                if (this.isEdit) {
                    this.ruleForm.departmentId = this.editData.departmentId.toString();
                }
                _.departmentList = temp;
            } catch (err) {
                _.departmentList = [];
                this.$message.error(ERROR);
                throw err;
            }
        },
        async getRoomData() {
            const _ = this;
            try {
                let temp = [];
                let result = await getRoomList({pageSize: 10000, pageNum: 1});
                this.loading = false;
                if (result.code === STATUS_VALUE.NORMAL) {
                    temp = result.items.list;
                } else {
                    temp = [];
                }
                if (this.isEdit) {
                    this.ruleForm.roomId = this.editData.roomId;
                }
                _.roomList = temp;
            } catch (err) {
                _.roomList = [];
                this.$message.error(ERROR);
                throw err;
            }
        },
        async beforeAvatarUpload(file) {
            const isJPG = file.type === "image/jpeg" || file.type === "image/png";
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isJPG) {
                this.$message.error(this.$t('common.updateImg'));
                return;
            }
            if (!isLt2M) {
                this.$message.error(this.$t('common.updateImgMax2'));
            }
            const {dir} = this.ossData;
            this.ossData = {...this.ossData, key: `${dir}/${file.name}`};
            return isJPG && isLt2M && this.picHost;
        },
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll)
    },
};
</script>

<style lang="less">
@import "../../style/default.less";
</style>
<style lang="less" scoped>
@import "./index.less";

.search-box {
    width: 220px;
    display: flex;
    margin-bottom: 20px;
}

.select-change {
    width: 220px !important;
}

.uploadType {
    margin-bottom: 5px;
}

.upload-box {
    margin-left: 15px;

    .picBox {
        width: 100px;
        height: 100px;
        border: 1px solid #e5e5e5;
        border-radius: 3px;
        position: relative;
        margin-left: 85px;
        margin-bottom: 10px;
        text-align: center;
        img{
            max-width: 100%;
            height: 100%;
        }
        .no-url{
            position: absolute;
            right: 5px;
            top: 3px;
            line-height: 20px;
            color: #fff;
            font-size: 12px;
        }
    }
}

/deep/ .el-dialog__body {
    padding-bottom: 0 !important;
    border-bottom: none;
}

.systemIcon-group {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    margin-left: 85px;

  .systemIcon-list {
    width: 60px;
    height: 60px;
    border: 1px solid #e5e5e5;
    margin-right: 10px;
    margin-bottom: 30px;
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    background-size: 100% 100%;
    position: relative;
    span{
      width: 60px;
      display: block;
      text-align: center;
      position: absolute;
      bottom: -30px;
      font-size: 10px;
      overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

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

.labDevice-modal {
    height: 450px;
    overflow-y: auto;
    .el-form{
        display: flex;
        flex-wrap: wrap;
    }
}

.dialog-footer {
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: block;
    padding: 20px 0;
    position: relative;

    &::before {
        content: "";
        width: calc(100% + 40px);
        height: 1px;
        background-color: #eee;
        position: absolute;
        left: -20px;
        top: 0;
    }
}
</style>
