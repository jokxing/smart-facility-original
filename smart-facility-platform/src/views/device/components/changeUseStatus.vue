<template>
    <el-dialog :title="$t('hardware.fixUseStatus')" append-to-body :visible.sync="dialogFormVisible">
        <el-form :model="form" label-width="auto" label-position="left">
            <el-form-item :label="$t('hardware.useStatusChange')">
                <el-select v-model="form.afterChangeStatus" class="select-change-p">
                    <el-option v-for="(item, key) in deviceUseStatus" :key="key" :value="Number(key)"
                               :label="item.str"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.remark')">
                <el-input type="textarea" class="select-change-p" maxlength="50" :placeholder="$t('common.pleaseInput')"
                          v-model="form.description"></el-input>
            </el-form-item>
            <el-form-item>
                <div class="abnormal select-change-p" style="line-height: 1.5">
                    {{ $t('hardware.useStatusChangeHint') }}
                </div>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="close">{{ $t('common.cancel') }}</el-button>
            <el-button :loading="loading" type="primary" @click="submit">{{
                    $t('common.confirm')
                }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script>
import {DEVICE_USE_STATUS} from "@/utils/constant";
import {postEquipmentUseStatus} from "@/api/device";

export default {
    name: "changeUseStatus",
    data() {
        return {
            dialogFormVisible: false,
            form: {
                description: "",
                afterChangeStatus: 1
            },
            deviceUseStatus: DEVICE_USE_STATUS,
            devices: [],
            loading: false
        }
    },
    methods: {
        open(arr) {
            console.log(arr)
            this.devices = arr;
            if (this.devices.length === 1) {
                const obj = this.devices[0];
                this.form.description = obj?.useStatusRemark || "";
                this.form.afterChangeStatus = obj?.useStatus || "";
            }
            this.dialogFormVisible = true;
        },
        close() {
            this.devices = [];
            this.dialogFormVisible = false;
            this.form = {
                description: "",
                afterChangeStatus: 1
            }
        },
        submit() {
            this.loading = true;
            const arr = [];
            this.devices.map(item => {
                const obj = {
                    equipmentName: item.name,
                    equipmentNo: item.no,
                    equipmentId: item.id,
                    afterChangeStatus: this.form.afterChangeStatus,
                    description: this.form.description
                }
                arr.push(obj);
            })
            postEquipmentUseStatus(arr).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('labDevice.updateSuccess'));
                    this.$emit("handle")
                    this.close();
                } else {
                    this.$message.error(res.message);
                }
            }).finally(() => {
                this.loading = false;
            }).catch(e => {
                this.$message.error(e)
            })
        }
    }
}
</script>

<style scoped>

</style>