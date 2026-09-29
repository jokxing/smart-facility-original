<template>
    <div class="company">
        <div class="system-edit">
            <el-button v-if="roleId < 4" class="el-icon-edit" @click="handleShowBalance">&nbsp;{{
                    $t('system.balance')
                }}
            </el-button>
            <el-button v-if="!isEdit && roleId < 4" class="el-icon-edit" @click="handleEdit" type="primary">
                &nbsp;{{ $t('common.edit') }}
            </el-button>
        </div>
        <div class="session">
            <el-form ref="form" :model="form" label-position="left" label-width="auto" :rules="rules"
                     class="form-default">
                <el-form-item :label="$t('system.companyName')" prop="name">
                    <el-input
                        v-model="form.name"
                        :disabled="!isEdit"
                        :placeholder="!isEdit && !form.linkMan ? '' : $t('system.inputCompanyName')"
                        class="input-with-select"
                        maxlength="26"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system.money')" prop="money">
                    <el-input v-model="form.money"
                              class="input-with-select"
                              disabled></el-input>
                </el-form-item>
                <el-form-item :label="$t('labDevice.contactUserName')" prop="linkMan">
                    <el-input
                        v-model="form.linkMan"
                        class="input-with-select"
                        :disabled="!isEdit"
                        :placeholder="!isEdit && !form.linkMan ? '' : $t('system.inputLinkMan')"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('labDevice.telNo')" prop="tel">
                    <el-input
                        v-model="form.tel"
                        :disabled="!isEdit"
                        class="input-with-select"
                        :placeholder="!isEdit && !form.tel ? '' : $t('system.inputLinkMan')"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system.email')" prop="email">
                    <el-input
                        v-model="form.email"
                        :disabled="!isEdit"
                        class="input-with-select"
                        :placeholder="!isEdit && !form.email ? '' : $t('system.inputEmail')"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system.companyAddress')" prop="address">
                    <el-input
                        v-model="form.address"
                        :disabled="!isEdit"
                        :placeholder="!isEdit && !form.address ? '' :  $t('system.inputCompanyAddress')"
                        class="system-input-address"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('common.remark')" prop="remark">
                    <el-input
                        v-model="form.remark"
                        :disabled="!isEdit"
                        :placeholder="!isEdit && !form.remark ? '' : $t('common.inputRemark')"
                        class="system-input"
                        maxlength="50"
                        show-word-limit
                        type="textarea"
                    ></el-input>
                </el-form-item>
                <el-form-item v-if="isEdit">
                    <el-button
                        :loading="loading"
                        type="primary"
                        @click="handleSubmit('form')">{{ $t('system.save') }}
                    </el-button>
                    <el-button @click="handleCancle">{{ $t('common.cancel') }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="system-img">
            <div class="title">▍ {{ $t('labDevice.sysIcon') }}</div>
            <div class="session">
                <div class="system-img-upload">
                    <chuxou-upload
                        :limit="1"
                        :max="2"
                        @handleUploadSuccess="handleUploadSuccess"
                        :value="systemImgs"></chuxou-upload>
                    <div>{{ $t('system.imgUpload') }}</div>
                </div>
                <div class="margin-center">
<!--                    <el-button>{{ $t('common.cancel') }}</el-button>-->
                    <el-button type="primary" :disabled="systemImgs.length === 0" @click="handleUploadImg">
                        {{ $t('system.save') }}
                    </el-button>
                </div>
            </div>
        </div>
        <balance :is-drawer.sync="showBalance"/>
    </div>
</template>
<script>
import {getCompanyGetLogo, getCompanyInfo, postCompanyUpdate, postCompanyUpdateLogo} from "@/api/system";
import {BASE_URL, STATUS_VALUE} from "@/utils/constant";
import Balance from "@/views/system/components/Balance";
import ChuxouUpload from "@/views/room/components/chuxouUpload"

export default {
    components: {
        Balance,
        ChuxouUpload
    },
    data() {
        const _this = this;
        return {
            showBalance: false, // 余额
            rules: {
                name: [
                    {
                        max: 30,
                        message: _this.$t('system.inputMax30'),
                        trigger: "blur",
                    },
                ],
                linkMan: [
                    {
                        max: 30,
                        message: _this.$t('system.inputMax30'),
                        trigger: "blur",
                    },
                ],
                tel: [
                    {
                        pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
                        message: _this.$t('system.telRule'),
                        trigger: "change",
                    },
                ],
                email: [
                    {
                        pattern:
                            /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                        message: _this.$t('system.emailRule'),
                        trigger: "change",
                    },
                ],
            },
            form: {
                name: "",
                money: 0,
                linkMan: "",
                tel: "",
                email: "",
                address: "",
                remark: "",
            },
            isEdit: false,
            loading: false,
            roleId: "",
            systemImgs: []
        };
    },
    mounted() {
        this.getBaseInfo();
        let useInfo = JSON.parse(localStorage.getItem("USERINFO"));
        let {roleId} = useInfo;
        this.roleId = roleId;
    },
    methods: {
        async getBaseInfo() {
            try {
                let result = await getCompanyInfo();
                if (result.code === STATUS_VALUE.NORMAL) {
                    this.form = result.items;
                    this.form.money = this.form.money / 10;
                    if (this.form.logoUrl) {
                        this.systemImgs.push({name: this.form.logoUrl, uid: 2365565, url: BASE_URL + this.form.logoUrl})
                    }
                } else {
                    this.form = {};
                    this.$message.error(result.message);
                }
            } catch (err) {
                this.$message.error(this.$t('common.networkError'));
            }
        },
        async updateAsync(params) {
            try {
                this.loading = true;
                let result = await postCompanyUpdate(params);
                if (result.code === STATUS_VALUE.NORMAL) {
                    this.loading = false;
                    this.$message.success(this.$t('common.updateSuccess'));
                    this.isEdit = false;
                } else {
                    this.loading = false;
                    this.$message.error(result.message);
                }
            } catch (err) {
                this.loading = false;
                this.$message.error(this.$t('common.networkError'));
            }
        },

        handleEdit() {
            this.isEdit = true;
        },
        handleCancle() {
            this.isEdit = false;
            this.getBaseInfo()
        },
        handleShowBalance() {
            this.showBalance = true;
        },
        handleSubmit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.form.name == "") {
                        return this.$message.error(this.$t('system.inputCompanyName'))
                    }
                    if (this.form.linkMan == "") {
                        return this.$message.error(this.$t('system.inputLinkMan'))
                    }
                    if (this.form.tel == "") {
                        return this.$message.error(this.$t('system.telNo'))
                    }
                    this.updateAsync(this.form);
                } else {
                    return false;
                }
            });
        },
        handleUploadSuccess(arr) {
            this.systemImgs = arr;
            console.log(arr)
        },
        handleUploadImg() {
            if (this.systemImgs.length === 0) {
                return
            }
            this.calculateImageSize(this.systemImgs[0].url).then(res => {
                    postCompanyUpdate({logoUrl: this.systemImgs[0].name}).then(res => {
                        if (res.code) {
                            this.$message.success(this.$t('labDevice.saveSuccess'));
                            this.$store.commit("setLogoUrl", this.systemImgs[0].name)
                        } else {
                            this.$message.error(res.message)
                        }
                    })
            });

        },
        calculateImageSize(url) {
            return new Promise(function (resolve, reject) {
                const image = document.createElement("img");
                image.addEventListener("load", function (e) {
                    resolve({
                        width: e.target.width,
                        height: e.target.height,
                    });
                });
                image.addEventListener("error", function () {
                    reject();
                });
                // 将图片的url地址添加到图片地址中
                image.src = url;
            });
        }
    },
};
</script>
<style lang="less" scoped>
@import "../../style/default.less";
@import "./index.less";

.form-default {
    ///deep/ .el-form-item__label {
    //  color: #555555;
    //  font-weight: 400;
    //  line-height: 40px;
    //}

    /deep/ .el-form-item__content {
        line-height: 40px;
    }

    .el-select {
        width: 200px;
        height: 40px;

        .el-input__inner {
            height: 40px;
            line-height: 40px;
        }
    }

    .el-input {
        width: 200px;

        /deep/ .el-input__inner {
            height: 40px;
            line-height: 40px;
        }
    }

    .input-block {
        .el-input {
            width: 100%;
        }
    }

    .el-input-number {
        width: 200px;
        line-height: 40px;

        .el-input-number__decrease,
        .el-input-number__increase {
            height: 38px;
        }
    }
}

.company {
    position: relative;

    .system-img {
        margin-top: 20px;

        .title {
            line-height: 1.5;
            font-size: 18px;
            font-weight: bold;
            color: #3F51B5;
            z-index: 1;
            position: relative;
        }

    }

    /deep/ .el-upload-list--picture-card .el-upload-list__item {
        width: auto;
        height: auto;
    }
}
</style>
