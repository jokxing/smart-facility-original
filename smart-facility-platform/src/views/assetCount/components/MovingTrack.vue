<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.moving')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="434px"
        class="moving-track">
        <el-timeline v-if="move != ''" v-loading="loading">
            <el-timeline-item :hide-timestamp="true" placement="top">
                <div class="name">
                    <div>{{ $t('common.equipment') }}：<span>{{ move.instrumentName }}</span></div>
                    <div>
                        <el-link 
                            type="primary" 
                            :disabled="move.inventoryAfterIgnore === 1" 
                            :underline="false" 
                            @click="handleIgnore('after')">
                            {{ $t('labDevice.overlook') }}
                        </el-link>
                        <el-link 
                            v-if="move.inventoryAfterIgnore === 0" 
                            type="primary" 
                            :underline="false" 
                            @click="$emit('handleAdjustment',2, move, 'after')">
                            {{ $t('labDevice.updateLocation') }}
                        </el-link>
                    </div>
                </div>
                <div class="item">
                    <div>{{ $t('labDevice.moveLocation') }}：<span>{{ move.inventoryAfterRoomName }}</span></div>
                    <p>{{ move.afterTime }}</p>
                </div>
            </el-timeline-item>
            <el-timeline-item :hide-timestamp="true" placement="top">
                <div class="name">
                    <div>{{ $t('common.equipment') }}：<span>{{ move.instrumentName }}</span></div>
                    <div>
                        <el-link 
                            type="primary" 
                            :disabled="move.inventoryBeforeIgnore === 1" 
                            :underline="false" 
                            @click="handleIgnore('before')">
                            {{ $t('labDevice.overlook') }}
                        </el-link>
                        <el-link 
                            v-if="move.inventoryBeforeIgnore === 0" 
                            type="primary" 
                            :underline="false" 
                            @click="$emit('handleAdjustment',2, move, 'before')">
                            {{ $t('labDevice.updateLocation') }}
                        </el-link>
                    </div>
                </div>
                <div class="item">
                    <div>{{ $t('labDevice.checkBefore') }}：<span>{{ move.inventoryBeforeRoomName }}</span></div>
                    <p>{{ move.beforeTime }}</p>
                </div>
            </el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleClose">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { postPropertyIgnorePosition } from "@/api/property"
    export default {
        data() {
            return {
                dialogVisible: false,
                move:"",
                loading: false,
            }
        },
        methods: {
            open(row){
                this.dialogVisible = true;
                this.move = row;
            },
            handleIgnore(type) {
                if(type === 'after'){
                    var data = {
                        ignoreAfter: 1,
                        ignoreBefore: this.move.InventoryBeforeIgnore,
                        instrumentNo: this.move.instrumentNo,
                        inventoryId: this.move.inventoryId,
                        movePropertyId: this.move.id
                    }
                    // this.move.inventoryAfterIgnore = 1
                }else{
                    var data = {
                        ignoreAfter: this.move.inventoryAfterIgnore,
                        ignoreBefore: 1,
                        instrumentNo: this.move.instrumentNo,
                        inventoryId: this.move.inventoryId,
                        movePropertyId: this.move.id
                    }
                    // this.move.InventoryBeforeIgnore = 1
                }
                this.loading = true;
                postPropertyIgnorePosition(data).then(res => {
                    this.loading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('labDevice.overlookSuccess'));
                            this.$emit('handle');

                            if(type === 'after'){
                                this.move.inventoryAfterIgnore = 1
                            }else{
                                this.move.inventoryBeforeIgnore = 1
                            }
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false
            },
        },
    }
</script>

<style lang="less" scoped>
    .moving-track{
        .name{
            display: flex;
            justify-content: space-between;
            &:first-child{
                color: #888;
                span{
                    color: #555;
                }
            }
            .el-link{
                margin-right: 10px;
            }
        }
        .item{
            div{
                color: #888;
                margin: 8px 0;
                span{
                    color: #555;
                }
            }
            p{
                color: #888;
            }
        }
    }
</style>