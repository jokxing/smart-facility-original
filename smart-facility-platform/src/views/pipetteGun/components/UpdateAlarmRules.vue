<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('hardware.updateAlarmRules')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="434px">
        <el-form :model="ruleDate" v-loading="loading" label-width="auto" label-position="left">
            <el-form-item v-for="(item,index) in ruleArray" :key="index" :label="item.label">
                <el-time-select
                    v-model="ruleDate[item.value]"
                    :picker-options="{
                        start: '00:00',
                        step: '00:15',
                        end: '23:45'
                    }"
                    :placeholder="$t('common.selectTime1')"
                    @change="handleChange(item, $event)">
                </el-time-select>
                <i class="el-icon-delete abnormal" @click="handleDelete(item)"></i>
            </el-form-item>
            <div class="add" @click="handleAdd" v-if="ruleArray.length < 5">
                <i class="el-icon-plus"></i>
            </div>
            <el-alert
                :closable="false"
                center
                show-icon
                :title="$t('labDevice.alarmPs')"
                type="warning">
            </el-alert>
        </el-form>
        
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnDisabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :disabled="btnDisabled" type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { getGunPipetteAlarmGetRule, postGunPipetteAlarmBatchRule } from "@/api/gun";
    export default {
        data() {
            const _this = this;
            return {
                loading: false,
                btnLoading: false,
                dialogVisible: false,
                btnDisabled: false,
                ruleDate: {
                    rule1: "",
                    rule2: "",
                    rule3: "",
                    rule4: "",
                    rule5: "",
                },
                form:{
                    gunId: []
                },
                ruleArray: [
                    {
                       label: _this.$t("labDevice.returnDate") +  _this.$t("common.one") ,
                       value: "rule1"
                    }
                ]
            }
        },
        methods: {
            open(is, row){
                this.dialogVisible = true;  
                if(is){
                    this.form.gunId.push(row.pipetteGunId)
                    this.loading = true;
                    getGunPipetteAlarmGetRule({gunId:row.pipetteGunId}).then(res => {
                        this.loading = false;
                        if(res.code == 1){
                            if(res.items){
                                this.ruleDate.rule1 = res.items.rule1;
                                this.ruleDate.rule2 = res.items.rule2;
                                this.ruleDate.rule3 = res.items.rule3;
                                this.ruleDate.rule4 = res.items.rule4;
                                this.ruleDate.rule5 = res.items.rule5;
                            }
                        }
                        var num = 0;
                        this.ruleArray = [];
                        for(var key in this.ruleDate){
                            if(this.ruleDate[key] != ""){
                                if(this.ruleDate[key]){
                                    num++;
                                    this.ruleArray.push({
                                        label: this.$t("labDevice.returnDate") + (num === 1 ?  this.$t("common.one") : num === 2 ?  this.$t("common.two") : num === 3 ? this.$t("common.three") : num === 4 ? this.$t("common.four") : this.$t("common.five")),
                                        value: key,
                                        date: this.ruleDate[key]
                                    })
                                }
                            }else{
                                this.ruleArray = [
                                    {
                                        label: this.$t("labDevice.returnDate") + this.$t("common.one") ,
                                        value: "rule1"
                                    }
                                ];
                            }
                        }
                    })
                }else{
                    this.form.gunId = row;
                }
            },
            handleChange(item,e) {
                var num = 0;
                var ruleArray = [];
                for(var key in this.ruleDate){
                    if(key != item.value){
                        if(this.ruleDate[key] == e){
                            this.ruleDate[item.value] = ''
                            return e && this.$message.error("归还截止时间不能相同");
                        }
                    }

                    if(this.ruleDate[key] != "" && this.ruleDate[key]){
                        num++;
                        ruleArray.push({
                            label: "归还截止时间" + (num === 1 ?  this.$t("common.one") : num === 2 ?  this.$t("common.two") : num === 3 ? this.$t("common.three") : num === 4 ? this.$t("common.four") : this.$t("common.five")),
                            value: key,
                            date: this.ruleDate[key]
                        })
                    }
                }
                this.ruleArray = ruleArray
            },
            handleAdd() {
                var label = "";
                if((this.ruleArray.length+1) === 1){
                    label = "归还截止时间" + this.$t("common.one")
                }
                if((this.ruleArray.length+1) === 2){
                    label = "归还截止时间" + this.$t("common.two")
                }
                if((this.ruleArray.length+1) === 3){
                    label = "归还截止时间" + this.$t("common.three")
                }
                if((this.ruleArray.length+1) === 4){
                    label = "归还截止时间" + this.$t("common.four")
                }
                if((this.ruleArray.length+1) === 5){
                    label = "归还截止时间" + this.$t("common.five")
                }
                this.ruleArray.push({
                    label: label,
                    value: 'rule' + (this.ruleArray.length + 1),
                    date: ""
                })
            },
            handleDelete(item){
                var ruleArray = [];
                for (let i = 0, len = this.ruleArray.length; i < len; i++) {
                    if (this.ruleArray[i].value != item.value) {
                        ruleArray.push(this.ruleArray[i])
                    }
                }
                
                var new_ruleArray = [];
                for(var i = 0; i < ruleArray.length; i++){
                    new_ruleArray.push({
                        label: "归还截止时间" + (num === 1 ?  this.$t("common.one") : num === 2 ?  this.$t("common.two") : num === 3 ? this.$t("common.three") : num === 4 ? this.$t("common.four") : this.$t("common.five")),
                        value: 'rule' + (i + 1),
                        date: ruleArray[i].date
                    })
                }
                this.ruleArray = new_ruleArray;

                this.ruleDate = {
                    rule1: "",
                    rule2: "",
                    rule3: "",
                    rule4: "",
                    rule5: "",
                };
                for(var i = 0; i < new_ruleArray.length; i++){
                    if(new_ruleArray[i].date != ""){
                        this.ruleDate[new_ruleArray[i].value] = new_ruleArray[i].date
                    }
                }
            },
            handleSubmit() {
                var data = {
                    gunIdList: this.form.gunId
                }
                for(var i = 0; i < this.ruleArray.length; i++){
                    if(this.ruleDate[this.ruleArray[i].value]){
                        data[this.ruleArray[i].value] = this.ruleDate[this.ruleArray[i].value]
                    }
                }
                this.btnLoading = true;
                postGunPipetteAlarmBatchRule(data).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code == 1){
                            this.handleClose();
                            this.$message.success(this.$t('common.editSuccess'));
                            this.$emit("handle")
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.form = {
                    gunId: []
                };
                this.ruleDate = {
                    rule1: "",
                    rule2: "",
                    rule3: "",
                    rule4: "",
                    rule5: "",
                };
                this.ruleArray = [
                    {
                       label: '归还截止时间' + this.$t("common.one") ,
                       value: "rule1"
                    }
                ]
            },
        },
    }
</script>

<style lang="less" scoped>
    .el-icon-delete{
        margin-left: 10px;
        cursor: pointer;
    }
    .add{
        width: 60px;
        height: 60px;
        background-color: #F4F4F9;
        border-radius: 6px;
        text-align: center;
        line-height: 60px;
        margin-left: 112px;
        margin-bottom: 20px;
        i{
            font-size: 16px;
        }
    }
</style>