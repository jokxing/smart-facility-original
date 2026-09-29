<template>
    <el-dialog
        :title="$t('system.informUser1')"
        :visible.sync="dialogVisible"
        destroy-on-close
        append-to-body
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        :before-close="handleClose"
        width="400px"
        class="notice-member"
        @close="handleClose">
        <el-form label-width="80px">
            <el-form-item :label="$t('system.groupUser')">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{ $t('system.changeAll') }}</el-checkbox>
                <el-checkbox-group class="checkbox-group-style" v-model="checkedPersonnel" @change="handleChecked">
                    <el-checkbox v-for="item in groupPersonnel" :label="item.id" :key="item.id">
                        {{ item.name }}
                        <!-- 个人微信的绑定状态 -->
                        <i class="icon-weixin" v-if="item.isBoundWeixin" style="margin: 5px; color: green"/>
                        <i class="icon-weixin" v-else style="margin: 5px; color: lightgrey"/>

                        <!-- 企业微信的绑定状态 -->
                        <!-- <i class="icon-enterprise-weChat" v-if="item.isBoundQyWeixin" style="color: green"/>-->
                        <!-- <i class="icon-enterprise-weChat" v-else style="color: lightgrey"/>-->

                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    export default {
        props:{
            groupPersonnel:{
                type: Array,
                default: []
            } 
        },
        data() {
            return {
                loading: false,
                dialogVisible: false,
                checkAll: false,
                checkedPersonnel: [],
                // personnels: [],
                isIndeterminate: false
            }
        },
        methods: {
            open(item) {
                this.dialogVisible = true;
                this.isIndeterminate = false;
                this.checkedPersonnel = item.userIds;

                let checkedCount = item.userIds.length;
                this.checkAll = checkedCount === this.groupPersonnel.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.groupPersonnel.length
            },
            handleCheckAllChange(val) {
                this.checkedPersonnel = []
                if(val){
                    for(var i = 0; i < this.groupPersonnel.length; i++){
                        this.checkedPersonnel.push(this.groupPersonnel[i].id)
                    }
                }
                this.isIndeterminate = false;
            },
            handleChecked(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.groupPersonnel.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.groupPersonnel.length;
            },
            handleSubmit() { 
                var arr = [];
                for(var i = 0; i < this.groupPersonnel.length; i++){
                    for(var j = 0; j < this.checkedPersonnel.length; j++){
                        if(this.groupPersonnel[i].id === this.checkedPersonnel[j]){
                            arr.push(this.groupPersonnel[i])
                        }
                    }
                }
                this.$emit('handle', arr);
                this.dialogVisible = false;
            },
            handleClose() {
                this.dialogVisible = false;
            }
        },
    }
</script>

<style lang="less" scoped>
    .notice-member{
        .el-checkbox{
            margin-right: 0;
            width: 50%;
        }
    }
    .checkbox-group-style {
        max-height: 450px;
        overflow-y: scroll
    }
</style>