<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.updateLocation')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="520px"
        class="position-adjustment">
        <el-form ref="form" :model="ruleDate" label-width="100px" v-if="dialogVisible">
            <el-form-item :label="$t('labDevice.moveLocation')" prop="aroundFlag">
                <el-select v-model="ruleDate.aroundFlag" :placeholder="$t('common.placeholder')" :disabled="disabled">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <span>&nbsp;&nbsp;&nbsp;{{ ruleDate.aroundFlag === 1 ? row.inventoryBeforeRoomName : row.inventoryAfterRoomName }}</span>
            </el-form-item>
            <el-form-item :label="$t('labDevice.updateLocationRoom')" prop="roomId">
                <el-select 
                    v-model="ruleDate.roomId" 
                    class="select-change"
                    :placeholder="$t('common.selectRoom')"
                    filterable>
                    <el-option
                        v-for="item in roomList"
                        :key="item.id"
                        :label="item.name + (item.gatewayName ? '（' + item.gatewayName + '）' : '')"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.remark')" prop="remark">
                <el-input class="select-change" type="textarea" v-model="ruleDate.remark" :placeholder="$t('common.inputRemark')"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button  type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { postPropertyPositionChange } from "@/api/property"; 
    import { getRoomPositionRoomList } from "@/api/room";
    export default {
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                btnLoading: false,
                inventoryBeforeRoomName: "",
                ruleDate: {
                    movePropertyId: null,
                    roomId: null, 
                    inventoryId: null,
                    instrumentNo: "",
                    aroundFlag: null,
                    remark: "",
                    labelNo: ""
                },
                options: [
                    {
                        value: 1,
                        label: _this.$t('labDevice.checkBefore')
                    }, 
                    {
                        value: 0,
                        label: _this.$t('labDevice.moveAfter')
                    }
                ],
                disabled: false,
                row: "",
                roomList: []
            }
        },
        mounted() {
            this.getRoomList()
        },
        methods: {
            getRoomList() {
                getRoomPositionRoomList().then(res => {
                    if(res.code === 1){
                        this.roomList = res.items
                    }
                })
            },
            open(index,row,type){
                this.row = row;
                // index 1列表操作进来，2移动轨迹进来
                this.dialogVisible = true;
                if(index === 1){
                    this.disabled = false
                }else{
                    this.disabled = true
                };

                this.ruleDate.instrumentNo = row.instrumentNo;
                this.ruleDate.inventoryId = row.inventoryId;
                this.ruleDate.movePropertyId = row.id;
                this.ruleDate.labelNo = row.labelNo;

                // type before移动前，after移动后
                this.ruleDate.aroundFlag = type === 'before' ? 1 : 0
            },
            handleClose() {
                this.dialogVisible = false;
                this.$refs.form.resetFields();
            },
            handleSubmit() {
                if(!this.ruleDate.roomId){
                    return this.$message.error(this.$t('labDevice.updateNotLocationRoom'))
                }
                if(this.ruleDate.aroundFlag === 0){
                    this.ruleDate['beforeRoomId'] = this.row.inventoryAfterRoomId;
                    this.ruleDate['beforeRoomName'] = this.row.inventoryAfterRoomName;
                }else{
                    this.ruleDate['beforeRoomId'] = this.row.inventoryBeforeRoomId;
                    this.ruleDate['beforeRoomName'] = this.row.inventoryBeforeRoomName;
                }
                this.btnLoading = true;
                postPropertyPositionChange(this.ruleDate).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('labDevice.updateLocationSuccess'));
                            this.handleClose();
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            }
        },
    }
</script>

<style lang="less" scoped>
    .position-adjustment{
        .el-select{
            width: 160px;
        }
    }
</style>