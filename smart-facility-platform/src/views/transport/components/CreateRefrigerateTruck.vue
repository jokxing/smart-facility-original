<template>
    <el-dialog
        :close-on-click-modal="false"
        :title="titles[model]"
        :visible.sync="visible"
        :before-close="handleClose"
        append-to-body>
        <el-form :model="form" :rules="rules" ref="formEl" label-position="left" label-width="auto">
            <el-form-item :label="$t('transport.carBoard')" prop="carBoard">
                <el-input
                    v-model.trim="form.carBoard"
                    maxlength="50"
                    class="select-change-p"
                    :placeholder="$t('transport.inputCarBoard')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.brandName')" prop="brandId">
                <el-select
                    class="select-change-p"
                    :placeholder="$t('transport.brandName')"
                    filterable
                    remote
                    :remote-method="getAllCarBrand"
                    v-model="form.brandId">
                    <el-option :value="null" label="">{{ $t('common.placeholder') }}</el-option>
                    <el-option
                        v-for="carBrand in carBrands"
                        :key="carBrand.id"
                        :value="carBrand.id"
                        :label="carBrand.brandName"/>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('transport.modelName')" prop="modelId">
                <el-select
                    class="select-change-p"
                    :placeholder="$t('transport.modelName')"
                    filterable
                    remote
                    :remote-method="getAllCarModel"
                    v-model="form.modelId">
                    <el-option :value="null" label="">{{ $t('common.placeholder') }}</el-option>
                    <el-option
                        v-for="carModel in carModels"
                        :key="carModel.id"
                        :value="carModel.id"
                        :label="carModel.modelName"/>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('transport.driverName')" prop="driverId">
                <el-select
                    class="select-change-p"
                    :placeholder="$t('transport.driverName')"
                    @change="handleSelectedDriver"
                    filterable
                    remote
                    :remote-method="getAllDriver"
                    v-model="form.driverId">
                    <el-option :value="null" label="">{{ $t('common.placeholder') }}</el-option>
                    <el-option
                        v-for="driver in drivers"
                        :key="driver.id"
                        :value="driver.id"
                        :label="driver.driverName">
                        {{ driver.driverName }}
                        <span style="color: darkgray">（{{ driver.tel }}）</span>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('transport.driverTel')" prop="tel">
                <el-input
                    v-model="form.tel"
                    maxlength="20"
                    class="select-change-p"
                    disabled
                    :placeholder="$t('transport.driverTel')"/>
            </el-form-item>
            <el-form-item :label="$t('common.remark')" prop="comment">
                <el-input
                    type="textarea"
                    v-model="form.comment"
                    class="select-change-p"
                    :placeholder="$t('common.remark')"/>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
      <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :loading="loading" :disabled="loading" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
    </el-dialog>
</template>

<script>

import {
    createRefrigerateCar,
    getRefrigerateCarEditor,
    miniListAllCarBrand,
    miniListAllCarModel,
    miniListAllDriver, updataRefrigerateCar,
} from "@/api/transport";

function defaultForm() {
    return {
        id: null,
        tel: '',
        carBoard: '',
        brandId: null,
        modelId: null,
        driverId: null,
        comment: '',
    };
};
export default {
    name: "CreateRefrigerateTruck",
    emits: ['created', 'updated'],
    data() {
        const _this = this;
        return {
            titles: [_this.$t('transport.addChillCar'), _this.$t('transport.editChillCar')],
            model: 0,
            visible: false,
            loading: false,
            // 下拉框的选项->
            carStates: [_this.$t('transport.leaveUnused'), _this.$t('transport.inTransit')],
            carModels: [],
            carBrands: [],
            drivers: [],
            form: defaultForm(),
            rules: {
                carBoard: [
                    {required: true, message: _this.$t('transport.inputCarBoard'), target: 'blur'}
                ]
            },
        }
    },
    methods: {
        /**
         *
         * @param model 0：新增  1：编辑
         * @param id
         */
        open(model, id) {
            this.model = model;
            this.form = defaultForm();
            this.getAllCarModel();
            this.getAllCarBrand();
            this.getAllDriver();
            if (model === 1) {
                this.getEditor(id);
            }
            this.visible = true;
        },
        getAllCarModel(keyWord) {
            miniListAllCarModel({keyWord}).then(res => {
                if (res.code) {
                    this.carModels = res.items;
                }
            })
        },
        getAllCarBrand(keyWord) {
            miniListAllCarBrand({keyWord}).then(res => {
                if (res.code) {
                    this.carBrands = res.items;
                }
            })
        },
        getAllDriver(keyWord) {
            miniListAllDriver({keyWord}).then(res => {
                if (res.code) {
                    this.drivers = res.items;
                }
            })
        },
        getEditor(id) {
            getRefrigerateCarEditor(id).then(res => {
                if (res.code) {
                    this.form = res.items;
                }
            })
        },
        handleSelectedDriver() {
            this.form.tel = '';
            if (this.form.driverId) {
                for (let driver of this.drivers) {
                    if (driver.id === this.form.driverId) {
                        this.form.tel = driver.tel;
                        break;
                    }
                }
            }
        },
        handleClose() {
            this.visible = false;
            this.$refs.formEl.resetFields();
        },
        handleSubmit() {
            this.$refs.formEl.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (this.model) {
                        this.updataData();
                    } else {
                        this.createData();
                    }
                } else {
                    this.$message.error(this.$t('transport.inputCorrect'));
                    return false;
                }
            });
        },

        updataData() {
            updataRefrigerateCar(this.form).then(res => {
                this.loading = false;
                if (res.code) {
                    this.$message.success(this.$t('transport.editChillCarSuccess'));
                    this.visible = false;
                    this.$emit('updated');
                } else {
                    this.$message.error(res.message)
                }
            }).catch(res => {
                this.loading = false;
                this.$message.error(res.message);
            })
        },
        createData() {
            createRefrigerateCar(this.form).then(res => {
                this.loading = false;
                if (res.code) {
                    this.$message.success(this.$t('transport.addChillCarSuccess'));
                    this.visible = false;
                    this.$emit('created');
                } else {
                    this.$message.error(res.message)
                }
            }).catch(res => {
                this.loading = false;
                this.$message.error(res.message);
            })
        }

    }
}
</script>

<style scoped>

</style>