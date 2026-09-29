<template>
    <el-dialog
        :title="$t('labDevice.timeInterval')"
        append-to-body
        :before-close="handleClose"
        :close-on-click-modal="false"
        width="23%"
        :visible.sync="dialogFormVisible">
        <el-form v-model="form" label-position="left" label-width="auto">
            <el-form-item :label="$t('labDevice.timeType')">
                <el-select class="w215" v-model="form.periodType">
                    <el-option :value="1" :label="$t('common.workday')"></el-option>
                    <el-option :value="2" :label="$t('common.naturalDay')"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('labDevice.timePeriod')">
                <div class="flex">
                    <el-select class="w100" v-model="form.start">
                        <el-option :disabled="item >= form.end" v-for="(item, index) in hours24" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                    <span class="mg">-</span>
                    <el-select class="w100" v-model="form.end">
                        <el-option :disabled="item <= form.start" v-for="(item, index) in reverseHours" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                </div>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="onsubmit">{{ $t('common.confirm') }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name: "SearchTimeFrame",
    data() {
        return {
            dialogFormVisible: false,
            form: {
                periodType: 1,
                start: "",
                end: ""
            },
            hours24: [],
            reverseHours: []
        }
    },
    methods: {
        handleQ(val) {
            let str = ""
            if (val < 10) {
                str = val.toString().padStart(2, '0')
            } else {
                str = val
            }
            return str;
        },
        handleClose() {
            this.dialogFormVisible = false;
        },
        open() {
            this.hours24 = [];
            this.reverseHours = [];
            this.form = {
                periodType: 1,
                start: "00",
                end: 23
            }
            this.dialogFormVisible = true;
            for (let i = 0; i <= 23; i++) {
                this.hours24.push(this.handleQ(i));
            }
            this.reverseHours = JSON.parse(JSON.stringify(this.hours24)).reverse();
        },
        onsubmit() {
            this.handleClose();
            this.$emit("handle", this.form);
        }
    }
}
</script>

<style scoped>
.w100 {
    width: 90px !important;
}
.mg {
    margin: 0 10px;
}
</style>