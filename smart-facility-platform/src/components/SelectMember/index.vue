<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.selectMember')"
        :visible.sync="dialogVisible"
        append-to-body
        class="add-member"
        width="40%">
        <div class="body">
            <el-form class="left" :model="form" label-position="top">
                <el-form-item :label="$t('common.placeholder')">
                    <el-input
                        v-model="keyword"
                        class="select-change"
                        clearable
                        :placeholder="$t('labDevice.inputMember')"
                        @input="handleDepartmentChange">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-checkbox-group v-model="form.userIds">
                        <el-col v-for="item in personnels" :key="item.id" :lg="12" :sm="12" :xs="12">
                            <el-checkbox
                                :key="item.id"
                                :disabled="bindingUser[item.id]"
                                :label="item.id"
                                @change="handleUserChange($event,item.id)">
                                {{ item.name }}

                                <!-- 个人微信的绑定状态 -->
                                <i class="icon-weixin" v-if="item.isBoundWeixin" style="margin: 5px; color: green"/>
                                <i class="icon-weixin" v-else style="margin: 5px; color: lightgrey"/>

                                <!-- 企业微信的绑定状态 -->
                                <!-- <i class="icon-enterprise-weChat" v-if="item.isBoundQyWeixin" style="color: green"/>-->
                                <!-- <i class="icon-enterprise-weChat" v-else style="color: lightgrey"/>-->

                            </el-checkbox>
                        </el-col>
                    </el-checkbox-group>
                    <div v-if="!personnels.length" class="empty">{{ $t('common.notMessage1') }}</div>
                </el-form-item>
                <pagination
                    :layout="'total, prev, pager, next, jumper'"
                    :limit.sync="pageSize"
                    :page-count="5"
                    :page.sync="pageNum"
                    :total="total"
                    @pagination="handleGetUserList"/>
            </el-form>
            <div class="right">
                <p>{{ $t('common.selected') }}</p>
                <div >
                    <el-tag
                        v-for="tag in tags"
                        :key="tag.id"
                        closable
                        type="info"
                        @close="handleCloseTag(tag)">
                        {{ tag.name }}
                    </el-tag>
                </div>
            </div>
        </div>
        <span slot="footer">
            <el-button :disabled="btnDisabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :disabled="btnDisabled" :loading="btnDisabled" type="primary"
                       @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {getUserList} from "@/api/user";
import Pagination from "@c/Pagination/index";

export default {
    components: {
        Pagination
    },
    props: {
        limit: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            dialogVisible: false,
            btnDisabled: false,
            keyword: "",
            pageSize: 20,
            pageNum: 1,
            total: 0,
            form: {
                userIds: []
            },
            personnels: [],
            bindingUser: {},
            tags: []
        }
    },
    computed: {
        // 员工备选项(不包含已选)
        personnelListOptions() {
            return this.personnels.filter(
                (item) => !this.form.userIds.includes(item.id),
            );
        },
    },
    methods: {
        open(tag) {
            if (tag) {
                this.tags = JSON.parse(tag);
                this.form.userIds = [];
                for (var i = 0; i < this.tags.length; i++) {
                    this.form.userIds.push(this.tags[i].id)
                }
            }

            this.dialogVisible = true;
            this.bindingUser = {};
            this.handleGetUserList()
        },
        handleGetUserList() {
            this.personnels = [];
            getUserList({
                pageNum: this.pageNum,
                keyword: this.keyword,
                pageSize: this.pageSize
            }).then(res => {
                this.personnels = res.items.list;
                this.total = res.items.total;
            })
        },
        handleDepartmentChange() {
            this.pageSize = 20;
            this.pageNum = 1;
            this.handleGetUserList();
        },
        handleUserChange(event, id) {
            if (this.limit && this.form.userIds.length > this.limit) {
                this.form.userIds.pop();
                return this.$message.warning(this.$t('labDevice.maxChange') + this.limit + this.$t('labDevice.people'));
            }
            if (event) {
                for (var i = 0; i < this.personnels.length; i++) {
                    if (this.personnels[i].id === id) {
                        this.tags.push(
                            {
                                name: this.personnels[i].name,
                                id: this.personnels[i].id,
                                departmentName: this.personnels[i].departmentName,
                                departmentId: this.personnels[i].departmentId,
                                isBoundWeixin:this.personnels[i].isBoundWeixin,
                                isBoundQyWeixin:this.personnels[i].isBoundQyWeixin,
                            }
                        )
                    }
                }
            } else {
                for (var i = 0; i < this.tags.length; i++) {
                    if (this.tags[i].id === id) {
                        this.tags.splice(i, 1)
                    }
                }
            }
        },
        handleCloseTag(tag) {
            for (var i = 0; i < this.tags.length; i++) {
                if (this.tags[i].id === tag.id) {
                    this.tags.splice(i, 1);
                }
            }
            for (var i = 0; i < this.form.userIds.length; i++) {
                if (this.form.userIds[i] === tag.id) {
                    this.form.userIds.splice(i, 1);
                }
            }
        },
        handleSubmit() {
            this.$emit('handle', this.tags);
            this.handleClose();
            this.dialogVisible = false;
        },
        handleClose() {
            this.keyword = "",
                this.pageSize = 20,
                this.pageNum = 1,
                this.total = 0,
                this.form = {
                    userIds: []
                },
                this.personnels = [],
                this.bindingUser = {},
                this.tags = [];
            this.dialogVisible = false;
        }
    },
}
</script>

<style lang="less" scoped>
.add-member {
    /deep/ .el-dialog__body {
        padding-top: 0;
    }

    /deep/ .margin-center {
        margin-top: 0;
    }

    .body {
        display: flex;

        .left {
            width: 70%;
            border-right: 1px #F0F2FC solid;
            padding-right: 2%;

            /deep/ .el-checkbox {
                line-height: 24px;
            }

        }

        .right {
            padding-left: 40px;

            p {
                line-height: 36px;
                padding-bottom: 10px;
            }

            div {
                display: flex;
                flex-direction: column;
                max-height: 480px;
                overflow-y: scroll;

                .el-tag {
                    height: 40px;
                    line-height: 40px;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
            }



        }
    }
}
</style>