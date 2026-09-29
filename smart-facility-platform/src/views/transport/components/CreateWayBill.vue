<template>
    <el-dialog
        :close-on-click-modal="false"
        :title="titles[type]"
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        width="47%"
        append-to-body>
        <template v-if="hiddenModel!==2">
            <div class="clearfix">
                <div class="title">{{ $t('transport.transportInform') }}</div>
            </div>
            <div class="margin-center">
                <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="auto">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.transportNo')">
                                <el-input
                                    v-model.trim="form.transportNo"
                                    class="select-change-p"
                                    disabled/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.professionNo')" prop="professionNo">
                                <el-input
                                    class="select-change-p"
                                    v-model="form.professionNo"
                                    :placeholder="$t('transport.inputProfessionNo')">
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.consigner')" prop="deliverId">
                                <el-select
                                    filterable
                                    remote
                                    clearable
                                    reserve-keyword
                                    :remote-method="getAllDelivers"
                                    class="select-change-p"
                                    @blur="getAllDelivers()"
                                    v-model="form.deliverId"
                                    :placeholder="$t('transport.changeConsigner')">
                                    <el-option
                                        v-for="item in delivers"
                                        :key="item.id"
                                        :label="item.receiptDeliverUserName"
                                        @click.native="selectDeliver(item)"
                                        :value="item.id">
                                        {{ item.receiptDeliverUserName }}
                                        <span style="color: darkgray">（{{ item.tel }}）</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.consignee')" prop="receiveId">
                                <el-select
                                    filterable
                                    clearable
                                    remote
                                    reserve-keyword
                                    :remote-method="getAllReceipts"
                                    @blur="getAllDelivers()"
                                    class="select-change-p"
                                    v-model="form.receiveId"
                                    :placeholder="$t('transport.changeConsignee')">
                                    <el-option
                                        v-for="item in receipts"
                                        :key="item.id"
                                        :label="item.receiptDeliverUserName"
                                        @click.native="selectReceipt(item)"
                                        :value="item.id">
                                        {{ item.receiptDeliverUserName }}
                                        <span style="color: darkgray">（{{ item.tel }}）</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('route.deliverUnit')">
                                <el-input
                                    class="select-change-p"
                                    disabled
                                    v-model.trim="form.deliverUnits"
                                    :placeholder="$t('common.pleaseInput')"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('route.receiptUnit')">
                                <el-input
                                    class="select-change-p"
                                    disabled
                                    v-model.trim="form.receiveUnits"
                                    :placeholder="$t('common.pleaseInput')"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.consignerAddress')">
                                <el-input
                                    class="select-change-p"
                                    disabled
                                    v-model.trim="form.deliverAddress"
                                    :placeholder="$t('common.pleaseInput')"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('transport.consigneeAddress')">
                                <el-input
                                    class="select-change-p"
                                    disabled
                                    v-model.trim="form.receiveAddress"
                                    :placeholder="$t('common.pleaseInput')"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item :label="$t('common.remark')">
                                <el-input
                                    class="select-change-p"
                                    type="textarea"
                                    v-model.trim="form.comment"
                                    :placeholder="$t('common.pleaseInput')"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </template>
        <template v-if="hiddenModel!==1">
            <div class="clearfix">
                <div class="title">{{ $t('transport.productList') }}</div>
                <el-button
                    @click="handleSelectSample"
                    class="icon-add-to">
                    {{ $t('transport.addProduct') }}
                </el-button>
            </div>
            <el-table
                class="margin-center"
                :data="form.samples"
                max-height="250"
                border
                style="width: 100%">
                <el-table-column type="index" label="#" width="70"/>
                <el-table-column
                    prop="sampleNo"
                    :label="$t('transport.productNo')"
                    min-width="100">
                </el-table-column>
                <el-table-column
                    prop="sampleName"
                    :label="$t('transport.productName')"
                    min-width="100">
                </el-table-column>
                <el-table-column
                    prop="amount"
                    min-width="80"
                    :label="$t('common.num')">
                    <template v-slot="{row}">
                        <el-input-number
                            v-model.number.trim="row.amount"
                            :min="1"
                            :controls="false"/>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="unitName"
                    min-width="80"
                    :label="$t('transport.unit')">
                </el-table-column>
                <el-table-column
                    prop="address"
                    :label="$t('common.handle')"
                    fixed="right"
                    width="80">
                    <template v-slot="scope">
                        <el-button
                            class="abnormal"
                            type="text"
                            @click="deleteASample(scope.$index)">{{ $t('common.cancel') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <span slot="footer" class="dialog-footer">
            <el-button
                :disabled="submitButtonDisabled"
                @click="handleClose">
                {{ $t('common.cancel') }}
            </el-button>
            <el-button
                :disabled="submitButtonDisabled"
                v-loading="submitButtonDisabled"
                type="primary"
                @click="handleSubmit()">
                {{ $t('common.confirm') }}
            </el-button>
        </span>
        <select-sample-dialog ref="selectSampleDialog"/>
    </el-dialog>
</template>

<script>


import {createTransportOrder, miniQueryReceiptDeliverAddress, updateTransportOrder} from "@/api/transport";
import SelectSampleDialog from "@/views/transport/components/SelectSampleDialog";

function defaultForm() {
    return {
        // 用于提交的参数：
        id: null,
        transportNo: '',
        professionNo: '',
        deliverId: null,
        receiveId: null,
        comment: '',
        samples: [],
        // 用于显示的参数:
        deliverAddress: '',
        deliverUnits: '',
        receiveAddress: '',
        receiveUnits: '',
        state: 0,
    }
}

export default {
    name: "CreateWayBill",
    components: {SelectSampleDialog},
    emits: ['created', 'updated'],
    data() {
        const _this = this;
        return {
            titles: [_this.$t('transport.addTransport'), _this.$t('transport.editTransport')],
            dialogVisible: false,
            type: 0,
            hiddenModel: 0,

            delivers: [],
            receipts: [],
            form: defaultForm(),

            rules: {
                professionNo: [
                    {required: true, message: _this.$t('transport.inputProfessionNo'), trigger: 'blur'}
                ],
                deliverId: [
                    {required: true, message: _this.$t('transport.changeConsigner'), trigger: 'blur'}
                ],
                receiveId: [
                    {required: true, message: _this.$t('transport.changeConsignee'), trigger: 'blur'}
                ]
            },
            submitButtonDisabled: false,

        }
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
            if (this.type !== 1) {
                this.$refs.form.resetFields();
            }
        },
        /**
         *
         * @param type 0: 新增，1、编辑
         * @param hiddenModel 0: 全部显示  1：隐藏产品列表  2：隐藏基本信息
         */
        open(type, row, hiddenModel = 0) {
            // console.log(row);
            if (type) {
                this.form = {
                    id: row.id,
                    transportNo: row.transportNo,
                    professionNo: row.professionNo,
                    deliverId: row.deliverId,
                    receiveId: row.receiveId,
                    comment: row.comment,
                    samples: this.formatSampleInfos(row.sampleInfos),
                    //
                    deliverAddress: row.deliverAddress,
                    deliverUnits: row.deliverUnits,
                    receiveAddress: row.receiveAddress,
                    receiveUnits: row.receiveUnits,
                    state: row.state,
                }
            } else {
                this.form = defaultForm();
            }
            this.getAllDelivers();
            this.getAllReceipts();
            this.type = type;
            this.hiddenModel = hiddenModel;
            this.dialogVisible = true;

        },
        formatSampleInfos(infos) {
            let newInfos = [];
            infos.forEach(info => {
                newInfos.push({
                    sampleInfoId: info.sampleId,
                    amount: info.amount,
                    sampleName: info.sampleName,
                    sampleNo: info.sampleNo,
                    unitName: info.unitName,
                })
            });
            return newInfos;
        },
        getAllDelivers(keyWord) {
            miniQueryReceiptDeliverAddress({keyWord, types: 0}).then(res => {
                if (res.code) {
                    this.delivers = res.items;
                }
            })
        },
        getAllReceipts(keyWord) {
            miniQueryReceiptDeliverAddress({keyWord, types: 1}).then(res => {
                if (res.code) {
                    this.receipts = res.items;
                }
            })
        },
        selectDeliver(item) {
            this.form.deliverAddress = item.address;
            this.form.deliverUnits = item.receiptDeliverName;
        },
        selectReceipt(item) {
            this.form.receiveAddress = item.address;
            this.form.receiveUnits = item.receiptDeliverName;
        },
        handleSelectSample() {
            let selectedIds = [];
            this.form.samples.forEach(sample => {
                selectedIds.push(sample.sampleInfoId)
            });
            this.$refs.selectSampleDialog.openSelect(
                selectedIds,
                selectedItems => {
                    this.putSamples(selectedItems);
                }
            );
        },
        putSamples(selectedItems) {
            selectedItems.forEach(item => {
                let has = false;
                for (let sample of this.form.samples) {
                    if (sample.sampleInfoId === item.id) {
                        has = true;
                        break;
                    }
                }
                if (!has) {
                    this.form.samples.push({
                        sampleInfoId: item.id,
                        amount: 1,
                        sampleNo: item.sampleNo,
                        sampleName: item.sampleNo,
                        unitName: item.unitName,
                    })
                }
            })
        },
        deleteASample(index) {
            this.form.samples.splice(index, 1);
        },
        handleSubmit() {

            this.submitButtonDisabled = true;
            if (this.type === 1) {
                this.updateWaybill();
            } else {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.createWaybill();
                    } else {
                        this.$message.error(this.$t('transport.inputCorrect'));
                        return false;
                    }

                })
            }

        },

        updateWaybill() {
            updateTransportOrder(this.form).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.editSuccess'));
                    this.$emit('updated');
                    this.handleClose();
                } else {
                    this.$message.error(res.message);
                }
            }).catch(res => {
                this.$message.error(res.message);
            }).finally(() => {
                this.submitButtonDisabled = false;
            })
        },

        createWaybill() {
            createTransportOrder(this.form).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.addSuccess'));
                    this.$emit('created');
                    this.handleClose();
                } else {
                    this.$message.error(res.message);
                }
            }).catch(res => {
                this.$message.error(res.message);
            }).finally(() => {
                this.submitButtonDisabled = false;
            })
        },
    }
}
</script>

<style lang="less" scoped>
.title {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    line-height: 1.5;
}

/deep/ .el-dialog__body {
    max-height: 500px;
    overflow-y: auto;
}
</style>