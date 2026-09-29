<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    append-to-body
    :before-close="handleClose"
    :width="!inputType ? '30%' : '45%'">
    <el-select v-if="!(submitType === 2 || submitType === 0)" class="input-type" v-model="inputType">
      <el-option :value="0" :label="$t('labDevice.simpleMode')"></el-option>
      <el-option :value="1" :label="$t('labDevice.fullMode')"></el-option>
    </el-select>
    <SubmitForm v-if="!inputType" :formData="formData" :data.sync="data"/>
    <full-warehouse-from :type.sync="submitType" :room-list.sync="roomList" :form.sync="items" v-else/>
    <span slot="footer" class="dialog-footer" v-if="submitType !== 2">
            <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :disabled="disabled" type="primary" :loading="disabled" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
  </el-dialog>
</template>

<script>
import SubmitForm from "@c/SubmitForm";
import FullWarehouseFrom from "@/views/assetProcess/components/FullWarehousMessage";
import {INSTRUMENTTYPE} from "@/utils/constant";
import {
    getInstrumentNewInfoExpandInfo,
    postInstrumentNewInfoExpand,
    postInstrumentNewInfoExpandFull,
    postInstrumentNewInfoExpandUpdate
} from "@/api/activiti";
import {getRoomList} from "@/api/room";
import i18n from "@/i18n";
const TITLE = {
  0: i18n.t('labDevice.editCheckAndAccept'),
  1: i18n.t('labDevice.addCheckAndAccept'),
  2: i18n.t('labDevice.lookCheckAndAccept')
}

export default {
  components: {
    FullWarehouseFrom,
    SubmitForm
  },
  data() {
    return {
      inputType: 0,
      dialogVisible: false,
      disabled: false,
      title: i18n.t('labDevice.addCheckAndAccept'),
      roomList: [],
      formData: [
        {
          label: i18n.t('common.name'),
          prop: "instrumentName",
          type: "text",
          isRequired: true,
          placeholder: i18n.t('common.inputName'),
          maxlength: 16
        },
        {
          label: i18n.t('common.no'),
          prop: "instrumentNo",
          type: "text",
          isRequired: true,
          placeholder: i18n.t('common.inputNo'),
          maxlength: 16,
        },
        {
          label: i18n.t('labDevice.classify'),
          prop: "types",
          type: "selectClass",
          placeholder: "请选择分类",
          isRequired: true,
        },
        {
          label: i18n.t('common.owningRoom'),
          prop: "storageLocationId",
          type: "selectRoom",
          placeholder: i18n.t('common.selectRoom'),
          isRequired: true
        },
        {
          label: i18n.t('labDevice.departmentName'),
          prop: "useDeptId",
          type: "selectDepartment",
          placeholder: i18n.t('common.selectDepartemnt'),
          isRequired: true
        }
      ],
      items: {
        instrumentName: "",
        instrumentNo: "",
        types: 1,
        instrumentModel: "",
        brandName: "",
        logoUrl: "",
        storageLocationId: null,
        departmentId: null,
        responsibleUserId: null,
        installedTime: "",
        useDeptId: "",
        manageUserId: null,
        measured: 1,
        checkDate: "",
        verified: 1,
        verifiedReport: "",
        sOPSituation: 1,
        purchaseDate: "",
        contractNumber: "",
        amountIncludeTax: "",
        assetNumber: "",
        voltage: "",
        ratedPower: "",
        contactUserName: "",
        contactUserTel: ""
      },
      data: {
        instrumentName: "",
        types: "",
        storageLocationId: null,
        useDeptId: "",
        instrumentNo: ""
      },
      submitType: 0,
      classify: []
    }
  },
  methods: {
    /**
     * @param type 0、新增，1、编辑
     */
    open(type, id) {
      this.submitType = type;
      this.dialogVisible = true;
      this.title = TITLE[type];
      this.classify = this.$store.state.assetClassify;
      if (type !== 1) {
        this.inputType = 1;
        this.handleGetInfo(id);
      }
    },
    typesFn(arr, obj1, obj2) {
          arr.map(item => {
              if (item.id === obj1.types * 1) {
                  obj2.types = item.types;
              } else {
                  return this.typesFn(item.childrenList, obj1, obj2)
              }
          })
      },
    handleSubmit() {
      if (this.submitType === 1) {
        if (this.inputType) {
            const obj = JSON.parse(JSON.stringify(this.items));
            this.typesFn(this.classify, this.items, obj);
            this.handleFullAdd(obj);
        } else {
            const obj = JSON.parse(JSON.stringify(this.data));
            this.typesFn(this.classify, this.data, obj);
            this.handleFullAdd(obj);
        }
      } else {
          const obj = JSON.parse(JSON.stringify(this.items));
          this.typesFn(this.classify, this.items, obj);
          this.handleEdit(obj)
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.inputType = 0;
      Object.keys(this.items).map(item => {
        this.items[item] = "";
      })
      Object.keys(this.data).map(item => {
        this.data[item] = null;
      })
    },
    //详情
      handleGetInfo(instrumentId) {
          this.disabled = true;
          getInstrumentNewInfoExpandInfo({instrumentId}).then(res => {
              this.disabled = false;
              if (res.code) {
                  Object.keys(this.items).map(item => {
                      this.items[item] = res.items[item];
                  })
                  this.items.gradeId = res.items.gradeId;
                  this.items.modelId = res.items.modelId;
                  this.items.id = instrumentId;
                  this.items.instrumentId = instrumentId;
                  const _this = this;

                  function typesFn(arr) {
                      arr.map(item => {
                          if (item.types === res.items.types * 1) {
                              _this.items.types = item.id;
                          } else {
                              return typesFn(item.childrenList)
                          }
                      })
                  }

                  typesFn(this.classify);
              }
          }).catch(e => {
              this.disabled = false;
          })
      },

    // 完整模式入库
    handleFullAdd(item) {
      this.disabled = true;
      postInstrumentNewInfoExpandFull(item).then(res => {
        this.disabled = false;
        this.handleMessage(res);
      }).catch(e => {
        this.disabled = false;
      })
    },
    handleEdit(item) {
      this.disabled = true;
      postInstrumentNewInfoExpandUpdate(item).then(res => {
        this.disabled = false;
        this.handleMessage(res);
      }).catch(e => {
        this.disabled = false;
      })
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(this.title + i18n.t('common.success'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  },
}
</script>
<style lang="less" scoped>
.el-dialog {
    position: relative;

    .input-type {
        width: 200px !important;
        position: absolute;
        top: 16px;
        right: 10%;
    }

    .left {
        left: 18%;
    }
}
</style>