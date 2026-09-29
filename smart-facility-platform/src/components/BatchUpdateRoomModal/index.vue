<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.updateRoom')"
        :visible.sync="dialogVisible"
        append-to-body
        class="update-modal"
        destroy-on-close>
        <el-form label-position="left" label-width="auto">
            <el-form-item :label="$t('common.owningRoom')">
                <el-select 
                    v-model="roomId"
                    class="select-change-p"
                    :placeholder="$t('common.selectRoom')">
                    <el-option
                        v-for="item in roomList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button
                :loading="submitLoading"
                type="primary"
                @click="handleSubmit">
                {{ $t('common.confirm') }}
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { getRoomList } from '@/api/room'
    export default {
        data() {
            return {
                dialogVisible: false,
                submitLoading: false,
                // 房间列表
                roomList: [],
                roomId: "",
                // 提交数据
                form: {
                    ids: []
                },
            }
        },  
        methods: {
            open() {
                this.dialogVisible = true;
                this.getRoomData()
            },
            getRoomData() {
                getRoomList({pageSize: 10000, pageNum: 1}).then(res => {
                    if (res.code) {
                        this.roomList = res.items.list
                    }
                }).catch(err => {
                    
                })
            },
            // 关闭弹窗
            handleModalClose() {
                this.dialogVisible = false;
                this.submitLoading = false;
            },
            handleSubmit(){
                this.submitLoading = true;
                this.$emit("handle",this.roomId)
            }
        },
    }
</script>