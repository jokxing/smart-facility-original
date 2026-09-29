<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('system.depList')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="500px"
        top="10vh"
        custom-class="selectDepartmentList-dialog">
        <p :title="companyName" class="icon-building1 cursor"> {{ companyName }}</p>
        <el-tree
            :data="data"
            show-checkbox
            default-expand-all
            node-key="id"
            ref="tree"
            highlight-current
            :check-strictly="true"
            :props="defaultProps"
            :default-checked-keys="departmentIds"
            class="tree-default tree"
            @check-change="handleChange">
        </el-tree>

        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { postDataAuthDistribute } from "@/api/dataAuth"
    export default {
        props: {
            dimension: {
                type: Number,
                default: null
            },
            type: {
                type: Number,
                default: null
            },
            userId: {
                type: Number,
                default: null
            },
        },
        data() {
            return {
                loading: false,
                dialogVisible: false,
                companyName: "",
                data: [],
                defaultProps: {
                    children: 'subDivisions',
                    label: 'name'
                },
                items: {
                    dimension: 0,
                    thingsIdList: [],
                    type: 0,
                    userId: 0
                },
                departmentIds: []
            }
        },
        methods: {
            open(departmentList,companyName,departmentIds) {
                this.dialogVisible = true;
                this.companyName = companyName;
                this.departmentIds = departmentIds;
                this.items.thingsIdList = departmentIds;
                this.data = departmentList
            },
            handleChange() {
                this.items.thingsIdList = this.$refs.tree.getCheckedNodes(false).map((item) => {
                    return item.id
                });
            },
            submitForm() {
                this.items.dimension = this.dimension;
                this.items.type = this.type;
                this.items.userId = this.userId;
                this.loading = true;
                postDataAuthDistribute(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.$message.success(this.$t('system.allotSuccess'));
                        this.handleModalClose();
                        this.$emit("handle")
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleModalClose() {
                this.dialogVisible = false;
                this.departmentIds = []
            }
        },
    }
</script>

<style lang="less" scoped>
    .selectDepartmentList-dialog{
        .el-dialog__body{
            overflow-y: auto;
            max-height: 550px;
        }

        .tree-container {
            overflow: hidden;
        }
        .tree /deep/ .el-tree-node {
            position: relative;
            padding-left: 12px ;
        }

        .tree /deep/ .el-tree-node__children {
            padding-left: 8px;
        }

        .tree /deep/ .el-tree-node :last-child:before {
            height: 20px;
        }

        .tree /deep/ .el-tree > .el-tree-node:before {
            border-left: none;
        }
        .tree /deep/ .el-tree-node:before {
            content: '';
            left: 7px;
            position: absolute;
            right: auto;
            border-width: 1px;
            border-left: 1px dashed #D4D6E2;
            bottom: 0;
            top: -1px;
            width: 1px;
        }

        .tree /deep/ .el-tree-node:after {
            content: '';
            left: 7px;
            position: absolute;
            border-width: 1px;
            border-top: 1px dashed #D4D6E2;
            top:18px;
            width: 10px ;
        }
    }
</style>