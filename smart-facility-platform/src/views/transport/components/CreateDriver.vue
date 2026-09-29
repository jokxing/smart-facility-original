<template>
    <el-dialog
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        append-to-body>
        <el-form :model="form" :rules="rules" ref="ruleForm" label-position="left" label-width="auto">

            <!-- 姓名： -->
            <el-form-item :label="$t('system.name')" prop="userId">
                <el-select
                    class="select-change-p"
                    v-model="form.userId"
                    filterable
                    remote
                    :remote-method="getUsers"
                    @change="selectedUser"
                    @visible-change="selectUserVisibleChange"
                    :loading="searchUsersLoading"
                    :placeholder="$t('common.placeholder')">
                    <el-option
                        v-if="type===1"
                        :value="oldUser.id"
                        :label="oldUser.name">
                        {{ oldUser.name }}
                        <span style="color: darkgray">（{{ oldUser.tel }}）</span>
                    </el-option>
                    <el-option
                        v-for="user in users"
                        :value="user.id"
                        :key="user.id"
                        :label="user.name">
                        {{ user.name }}
                        <span style="color: darkgray">（{{ user.tel }}）</span>
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item :label="$t('transport.sex')" prop="sex">
                <el-select v-model="form.sex" :placeholder="$t('common.placeholder')">
                    <el-option
                        v-for="item in sexOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('transport.age')" prop="age">
                <el-input
                    v-model.trim="form.age"
                    type="number"
                    min="18"
                    onKeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode || event.which))) || event.which === 8"
                    class="select-change-p"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('labDevice.telNo')" prop="tel">
                <el-input
                    v-model.trim="form.tel"
                    maxlength="20"
                    class="select-change-p"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.idCard')" prop="idCard">
                <el-input
                    v-model.trim="form.idCard"
                    maxlength="20"
                    class="select-change-p"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :loading="loading" :disabled="loading" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {
    addUserDriver,
    updateUserDriver
} from "@/api/transport";
import {miniListUserIdNameTel} from "@/api/user";

function defaultFormData() {
    return {
        id: null,
        userId: null,
        driverName: "",
        sex: 1,
        age: 18,
        tel: "",
        idCard: ""
    }
}

export default {
    name: "CreateDriver",
    components: {},
    emits: ['handle'],
    data() {
        const _this = this;
        // 检查手机号
        let checkTel = (rule, value, callback) => {
            if (!value || value === '') {
                return callback();
            } else {
                // 校验手机号
                let regExp = new RegExp("^1[3456789]\\d{9}$");
                if (regExp.test(value)) {
                    callback();
                } else {
                    callback(new Error(_this.$t('system.telRule')));
                }
            }
        };
        // 检查身份证
        let checkIdCard = (rule, value, callback) => {
            if (!value || value === '') {
                return callback();
            } else {
                // 校验手机号
                let regExp = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                if (regExp.test(value)) {
                    callback();
                } else {
                    callback(new Error(_this.$t('transport.idCardRule')));
                }
            }
        };
        let ageCheck = (rule, value, callback) => {
            if (value < 18) {
                callback(new Error(_this.$t('transport.ageCardRule')))
            } else {
                callback()
            }
        }
        return {
            title: _this.$t('transport.addDriver'),
            dialogVisible: false,
            form: defaultFormData(),
            searchUsersLoading: false,
            loading: false,
            users: [],
            oldUser: {
                id: '',
                name: '',
                tel: ''
            },
            type: 0,//0新增，1修改
            rules: {
                userId: [
                    {required: true, message: _this.$t('transport.inputDriverName'), trigger: 'blur'},
                ],
                tel: [
                    {validator: checkTel, trigger: 'blur'}
                ],
                idCard: [
                    {validator: checkIdCard, trigger: 'blur'}
                ],
                age: [
                    {validator: ageCheck, trigger: "blur"}
                ]
            },
            sexOptions: [{
                value: 1,
                label: _this.$t('transport.man')
            }, {
                value: 2,
                label: _this.$t('transport.woman')
            }],
        }
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
            this.$refs.ruleForm.resetFields();
            this.form = defaultFormData();
        },
        open(type, row) {
            if (type) {
                this.title = this.$t('transport.editDriver');
                this.form = {...row};
                this.oldUser.id = row.userId;
                this.oldUser.name = row.driverName;
                this.oldUser.tel = row.tel;
            } else {
                this.title = this.$t('transport.addDriver');
            }
            this.type = type;
            this.dialogVisible = true;
        },
        getUsers(keyword) {
            this.searchUsersLoading = true;
            miniListUserIdNameTel({keyword}).then(res => {
                if (res.code) {
                    this.users = res.items;
                } else {
                    this.$message.error(res.message);
                }
            }).finally(() => {
                this.searchUsersLoading = false;
            })
        },
        selectedUser(userId) {
            for (let user of this.users) {
                if (userId === user.id) {
                    this.form.tel = user.tel;
                    break;
                }
            }
        },
        selectUserVisibleChange(visible) {
            if (visible) {
                this.getUsers('');
            }
        },
        handleSubmit() {
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (this.type) {
                        updateUserDriver(this.form).then(res => {
                            this.handleMessage(res);
                        }).catch(() => {
                            this.loading = false;
                        })
                    } else {
                        addUserDriver(this.form).then(res => {
                            this.handleMessage(res);
                        }).catch(() => {
                            this.loading = false;
                        })
                    }
                } else {
                    this.$message.error(this.$t('transport.inputCorrect'));
                    return false;
                }
            });
        },
        handleMessage(res) {
            this.loading = false;
            if (res.code) {
                this.$message.success(this.title + this.$t('common.success'));
                this.$emit("handle", this.type);
                this.handleClose();
            } else {
                this.$message.error(res.message);
            }
        }
    }
}
</script>

