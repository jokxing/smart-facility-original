<template>
    <div>
        <el-drawer
            :before-close="handleClose"
            :modal="false"
            :visible.sync="isDrawer"
            :withHeader="false"
            destroy-on-close
            v-loading="loading"
            size="50%"
            class="set-approver">
            <div v-if="!loading" class="detail-padding">
                <DrawerNav :name="$t('labDevice.setAuditor')" @handle="handleClose"/>
                <div class="ml">
                    <el-input v-model.trim="form.auditStepName" class="input-with-select"></el-input>
                </div>
                <el-radio-group class="ml margin-center" v-model="radio">
                    <el-radio-button label="1">{{ $t('labDevice.basicsSet') }}</el-radio-button>
                    <el-radio-button label="2">{{ $t('labDevice.fromRule') }}</el-radio-button>
                    <el-radio-button v-if="form.auditType != -1 && form.auditType != 99" label="3">{{ $t('labDevice.handleRule') }}</el-radio-button>
                </el-radio-group>
                <div v-show="radio == 1" class="margin-center">
                    <el-form class="margin-center" ref="form" :model="form">
                        <el-form-item v-if="form.auditType != -1 && form.auditType != 99" :label="$t('labDevice.auditor1')" required>
                            <el-tag
                                v-for="tag in tags"
                                :key="tag.id"
                                closable
                                type="info"
                                @close="handleCloseTag(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-button
                                icon="el-icon-plus"
                                class="add-member"
                                @click="handleShowSelectMember(tags, 0)">
                                {{ $t('labDevice.addMember') }}
                            </el-button>
                        </el-form-item>
                        <el-form-item :label="$t('labDevice.copyUser')">
                            <el-tag
                                v-for="tag in ccUsers"
                                :key="tag.id"
                                closable
                                type="info"
                                @close="handleCloseccTag(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-button
                                icon="el-icon-plus"
                                class="add-member"
                                @click="handleShowSelectMember(ccUsers, 1)">
                                {{ $t('labDevice.addMember') }}
                            </el-button>
                            <el-button
                                type="text"
                                @click="ccUsers = []">
                                {{ $t('labDevice.empty') }}
                            </el-button>
                        </el-form-item>
                        <el-form-item v-if="form.auditType != -1 && form.auditType != 99" :label="$t('labDevice.approvalType')">
                            <el-radio-group v-model="form.auditType">
                                <el-radio :label="1">{{ $t('labDevice.countersign') }}</el-radio>
                                <br/>
                                <el-radio :label="0">{{ $t('labDevice.orSign') }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <p class="offline">{{ $t('labDevice.copyUserPs') }}</p>
                    </el-form>
                    <p class="abnormal" v-if="form.auditType != -1 && form.auditType != 99">{{ $t('labDevice.copyUserPs1') }}</p>
                </div>
                <div class="margin-center" v-if="radio == 2 && resource">
                    <el-table
                        class="ml"
                        :data="form.processFormConfigInstList"
                        ref="table"
                        border
                        style="width: 95%">
                        <el-table-column
                            prop="fieldAlisa"
                            :label="$t('labDevice.fieldName')">
                        </el-table-column>
                        <el-table-column>
                            <template
                                #header>
                                <el-checkbox
                                    @change="val => handleCheckAllChange(val,0)"
                                    v-model="isShow"
                                >{{ $t('labDevice.isLook') }}
                                </el-checkbox>
                            </template>
                            <template v-slot="{row, $index}">
                                <el-checkbox
                                    @change="val => selectOne(val ,row,0, $index)"
                                    :true-label="1"
                                    :disabled="row.defaulted ===1"
                                    :false-label="0"
                                    :checked="true"
                                    v-model="row.showed"/>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="name"
                            :label="$t('common.edit')"
                            width="180">
                            <template #header>
                                <el-checkbox
                                    @change="val => handleCheckAllChange(val,1)"
                                    v-model="isEdit"
                                >{{ $t('common.edit') }}
                                </el-checkbox>
                            </template>
                            <template v-slot="{row, $index}">
                                <el-checkbox
                                    :disabled="row.defaulted === 1"
                                    @change="val => selectOne(val ,row,1, $index)"
                                    :true-label="1"
                                    :false-label="0"
                                    v-model="row.edited"/>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div v-show="radio == 3" class="margin-center">
                    <el-form ref="form" :model="form">
                        <el-form-item :label="$t('labDevice.requireSignature')">
                            <el-checkbox :true-label="1" :false-label="0" v-model="form.requireSignature">{{ $t('labDevice.requireSignature1') }}
                            </el-checkbox>
                        </el-form-item>
                        <el-form-item :label="$t('labDevice.requireSignature')">
                            <el-checkbox :true-label="1" :false-label="0" v-model="form.requireComments">{{ $t('labDevice.requireComments1') }}
                            </el-checkbox>
                        </el-form-item>

                    </el-form>
                </div>
                <div class="footer-button">
                    <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
                </div>
            </div>
        </el-drawer>
        <SelectMember ref="selectMember" :limit="5" @handle="handleSelectMember"/>
    </div>
</template>

<script>
import DrawerNav from "@c/DrawerNav/index";
import SelectMember from "@c/SelectMember";
import {deepCopyObject} from "@/utils/QuickUtils";
import {getActivitiConfigGetList} from "@/api/activiti";

export default {
    components: {
        DrawerNav,
        SelectMember
    },
    data() {
        return {
            nodeName: false,
            loading: false,
            isDrawer: false,
            form: {
                resource: 1,
                processFormConfigInstList: []
            },
            tags: [],
            nodeFields: [],
            radio: "1",
            resource: false,
            isShow: false,
            isEdit: false,
            ccUsers: [],
            isCcUsers: 0
        }
    },
    watch: {
        "form.processFormConfigInstList": {
            handler(arr) {
            },
            deep: true
        },
    },
    methods: {
        open(userArray, item, ccUsers) {
            if (userArray) {
                this.tags = userArray;
            }
            this.radio = "1";
            this.ccUsers = ccUsers;
            this.isDrawer = true;
            this.loading = true;
            this.resource = false;
            getActivitiConfigGetList({proSetCode: item.proSetCode}).then(res => {
                this.form = item;
                this.loading = false;
                if (res.code) {
                    this.form.processFormConfigInstList = this.handleFieldAlisa(this.form.processFormConfigInstList, res.items);
                    const arr = res.items.filter(item => item.showed === 1);
                    const arrObj = arr.reduce((prev, current) => {
                        prev[current.fieldKey] = current;
                        return prev;
                    }, {})
                    const arrNew = res.items.filter(item => item.showed === 0);
                    if (this.form.processFormConfigInstList.length) {
                        this.form.processFormConfigInstList.map((item, index) => {
                            arrNew.map(data => {
                                if (data.fieldKey === item.fieldKey) {
                                    this.form.processFormConfigInstList.splice(index, 1);
                                }
                            })
                            delete arrObj[item.fieldKey];
                        })
                        for (const key in arrObj) {
                            const data = arrObj[key];
                            if (data.showed === 0) {
                                return
                            }
                            this.form.processFormConfigInstList.push({
                                defaulted: data.defaulted,
                                edited: 0,
                                fieldKey: data.fieldKey,
                                fieldName: data.fieldName,
                                showed: 1,
                                required: data.required,
                                sort: data.sort,
                                fieldAlisa: data.fieldAlisa
                            })
                        }
                    } else {
                        arr.map(item => {
                            if (item.showed) {
                                const obj = {
                                    defaulted: item.defaulted,
                                    edited: 0,
                                    fieldKey: item.fieldKey,
                                    fieldName: item.fieldName,
                                    showed: 1,
                                    required: item.required,
                                    sort: item.sort,
                                    fieldAlisa: item.fieldAlisa
                                }
                                this.form["processFormConfigInstList"].push(obj)
                            }
                        })
                    }
                    this.isShow = true;
                    let showNum = 0;
                    let editNum = 0;
                    this.form.processFormConfigInstList.map(item => {
                        if (item.edited) {
                            editNum += 1;
                        }
                        if (item.showed) {
                            showNum += 1;
                        }
                    })
                    this.isShow = showNum === this.form.processFormConfigInstList.length;
                    this.isEdit = editNum === this.form.processFormConfigInstList.length;
                }
                this.resource = true;
            })
        },
        handleFieldAlisa(arr1, arr2) {
            const arrObj = arr2.reduce((prev, current) => {
                prev[current.fieldKey] = current;
                return prev;
            }, {})
            arr1.map(item => {
                if (arrObj[item.fieldKey]) {
                    item.fieldAlisa = arrObj[item.fieldKey].fieldAlisa;
                }
            })
            return arr1;
        },
        handleSelectMember(array) {
            if (this.isCcUsers) {
                this.ccUsers = array.splice(0, 100);
                if (array.length === 100) {
                    return this.$message.warning(this.$t('labDevice.ccUsers1'));
                }
            } else {
                this.tags = array;
            }
        },
        handleShowSelectMember(tags, index) {
            this.isCcUsers = index;
            this.$refs.selectMember.open(JSON.stringify(tags))
        },
        handleCloseTag(tag) {
            this.tags.splice(this.tags.indexOf(tag), 1);
        },
        handleCloseccTag(tag) {
            this.ccUsers.splice(this.ccUsers.indexOf(tag), 1);
        },
        handleClose() {
            this.isDrawer = false;
        },
        handleSubmit() {
            if (this.form.auditType != -1 && this.form.auditType != 99 && !this.tags.length) {
                return this.$message.error(this.$t('labDevice.notAuditor'));
            }
            this.$emit("handle", this.tags, this.form, this.ccUsers);
            this.isDrawer = false;
        },
        // 全选功能
        handleCheckAllChange(val, index, i) {
            if (index) {
                this.isEdit = val;
                if (val) {
                    this.form.processFormConfigInstList.map(item => {
                        if (item.defaulted !== 1) {
                            item.edited = 1;
                        }
                    })
                } else {
                    this.form.processFormConfigInstList.map(item => {
                        item.edited = 0;
                    })
                }
            } else {
                this.isShow = val;
                if (val) {
                    this.form.processFormConfigInstList.map(item => {
                        item.showed = 1;
                    })
                } else {
                    this.form.processFormConfigInstList.map(item => {
                        if (item.defaulted !== 1) {
                            item.showed = 0;
                        }
                    })
                }
            }
        },
        // 单选
        selectOne(val,row, index, i) {
            let show = 0;
            let edit = 0;
            if (index) {
                row.edited = val;
            } else {
                row.showed = val;
                if (!(row.showed)) {
                    row.edited = 0;
                }
            }
            this.form.processFormConfigInstList.map(item => {
                if (item.edited) {
                    edit++;
                }
                if (item.showed) {
                    show++;
                }
            })
            this.isEdit = edit === this.form.processFormConfigInstList.length;
            this.isShow = show === this.form.processFormConfigInstList.length;

        }
    },
}
</script>

<style lang="less" scoped>
.set-approver {
    .el-form-item {
        display: flex;

        /deep/ .el-tag {
            height: 40px;
            margin-right: 10px;
            margin-bottom: 10px;
            line-height: 40px;
            font-size: 14px;
            color: #555;
            float: left;
        }

        .el-radio {
            line-height: 36px;
        }
    }

    .add-member {
        height: 40px;
        background: #EFF5FF;
        border: 1px dashed #448AFF !important;
        color: #448AFF !important;
        float: left;
        display: flex;
        align-items: center;
    }

    p {
        padding-left: 30px;
        margin-top: 20px;
    }

    .footer-button {
        width: 100%;
        text-align: right;
        position: absolute;
        bottom: 80px;
        right: 30px;
    }

    .ml {
        margin-left: 20px;
    }
}
</style>