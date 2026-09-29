<template>
    <el-form ref="form" :disabled="type === 2" :model="form" :label-position="'left'" :label-width="'auto'">
        <el-descriptions :title="$t('common.basicInformation')"></el-descriptions>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('common.name')" required>
                    <el-input
                        class="input-with-select"
                        v-model.trim="form.instrumentName"
                        :placeholder="$t('common.inputName')"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('common.no')" required>
                    <el-input
                        class="input-with-select"
                        v-model.trim="form.instrumentNo"
                        oninput="value=value.replace(/[^A-Za-z10-9]/g, '')"
                        :placeholder="$t('common.no')">
                    </el-input>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.classify')" required>
                    <select-asset-classify
                        :is-class="true"
                        class="input-with-select"
                        :id.sync="form.types"
                        :select-tree-value.sync="form.types"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.specificationsAndModels')">
                    <el-input
                        class="input-with-select"
                        oninput="value=value.replace(/[^A-Za-z10-9]/g, '')"
                        v-model.trim="form.instrumentModel"/>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.brand')">
                    <el-input class="input-with-select" v-model.trim="form.brandName"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('common.img')">
                    <div>
                        <div v-if="type == 2">
                            <span v-if="!form.logoUrl">-</span>
                            <img v-else class="img" :src="BASE_URL + form.logoUrl" alt="">
                        </div>
                        <div v-else class="flex">
                            <img v-if="form.logoUrl" class="img margin-small-right" :src="BASE_URL + form.logoUrl" alt="">
                            <el-button type="primary" @click="$refs.selectUrl.open()">{{ form.logoUrl ? $t('labDevice.resetChange') : $t('labDevice.changeImg') }}</el-button>
                        </div>
                    </div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-descriptions :title="$t('labDevice.installDepartment')"></el-descriptions>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('common.owningRoom')" required>
                    <el-select ref="roomSelect"
                               v-model="form.storageLocationId"
                               class="input-with-select"
                               filterable
                               :placeholder="$t('common.selectRoom')">
                        <el-option
                            v-for="item in roomList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('common.owningDepartment')">
                    <select-department
                        class="input-with-select"
                        :department-id.sync="form.departmentId"
                        :select-tree-value.sync="form.departmentId"/>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.responsibleUser')">
                    <el-select
                        class="input-with-select"
                        :disabled="!form.departmentId"
                        v-model.trim="form.responsibleUserId"
                        :placeholder="$t('labDevice.changeResponsibleUser')">
                        <el-option
                            v-for="item in useList"
                            :key="item.id"
                            :value="item.id"
                            :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.installedTime')">
                    <el-date-picker
                        class="input-with-select"
                        v-model="form.installedTime"
                        type="datetime"
                        :placeholder="$t('common.selectTime')"/>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-descriptions :title="$t('labDevice.userMessage')"></el-descriptions>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.departmentName')" required>
                    <select-department
                        class="input-with-select"
                        :department-id.sync="form.useDeptId"
                        :select-tree-value.sync="form.useDeptId"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.manager')">
                    <el-select
                        class="input-with-select"
                        v-model="form.manageUserId"
                        :disabled="!form.useDeptId"
                        :placeholder="$t('labDevice.changeManager')">
                        <el-option
                            v-for="item in custodians"
                            :key="item.id"
                            :value="item.id"
                            :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.measured')">
                    <el-radio-group v-model="form.measured">
                        <el-radio :label="1">{{ $t('labDevice.yes') }}</el-radio>
                        <el-radio :label="0">{{ $t('labDevice.no') }}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.checkDate')">
                    <el-date-picker
                        :disabled="!form.measured"
                        class="input-with-select"
                        v-model="form.checkDate"
                        type="datetime"
                        :placeholder="$t('common.selectTime')"/>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.verified')">
                    <el-radio-group v-model="form.verified" class="margin-small-right">
                        <el-radio :label="1">{{ $t('labDevice.need') }}</el-radio>
                        <el-radio :label="0">{{ $t('labDevice.noNeed') }}</el-radio>
                    </el-radio-group>
                    <chuxou-upload
                        v-if="type != 2 && form.verified"
                        :accept="'file'"
                        class="upload"
                        :acceptTips="item.acceptTips"
                        :dir="'file'"
                        :limit="1"
                        :value="verifiedReport"
                        @handleUploadSuccess="handleUploadSuccess($event, 'verifiedReport')"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.sOPSituation')">
                    <el-radio-group v-model="form.sOPSituation" class="margin-small-right">
                        <el-radio :label="1">{{ $t('labDevice.need') }}</el-radio>
                        <el-radio :label="0">{{ $t('labDevice.noNeed') }}</el-radio>
                    </el-radio-group>
                    <chuxou-upload
                        v-if="type != 2 && form.sOPSituation"
                        :accept="'file'"
                        class="upload"
                        :acceptTips="item.acceptTips"
                        :dir="'file'"
                        :limit="1"
                        :value="sOPSituationReport"
                        @handleUploadSuccess="handleUploadSuccess($event, 'sOPSituationReport')"
                    />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-descriptions :title="$t('labDevice.assetMessage')"></el-descriptions>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.purchaseDate')">
                    <el-date-picker
                        class="input-with-select"
                        v-model="form.purchaseDate"
                        type="datetime"
                        :placeholder="$t('common.selectTime')"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.contractNumber')">
                    <el-input
                        class="input-with-select"
                        oninput="value=value.replace(/[^A-Za-z10-9]/g, '')"
                        v-model.trim="form.contractNumber"/>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.amountIncludeTax')">
                    <el-input
                        class="input-with-select"
                        type="number"
                        v-model.trim="form.amountIncludeTax"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.assetNo')">
                    <el-input
                        class="input-with-select"
                        oninput="value=value.replace(/[^A-Za-z10-9]/g, '')"
                        v-model.trim="form.assetNumber"/>
                </el-form-item>
            </el-col>
            <el-col :span="24">
                <el-descriptions :title="$t('labDevice.electricParameter')"></el-descriptions>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.voltage')">
                    <el-input class="input-with-select" type="number" v-model.trim="form.voltage"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.ratedPower')">
                    <el-input class="input-with-select" type="number" v-model.trim="form.ratedPower"/>
                </el-form-item>
            </el-col>
            <el-col :span="24">
                <el-descriptions :title="$t('labDevice.vender')"></el-descriptions>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.contactUserName')">
                    <el-input class="input-with-select" v-model.trim="form.contactUserName"/>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('labDevice.contactUserTel')">
                    <el-input
                        class="input-with-select"
                        oninput="value=value.replace(/[^10-9]/g, '')"
                        v-model.trim="form.contactUserTel"/>
                </el-form-item>
            </el-col>
        </el-row>
        <select-url ref="selectUrl" @handle="handleLogoUrl"/>
    </el-form>
</template>

<script>
import ChuxouUpload from "@c/ChuxouUpload";
import SelectDepartment from "@c/SelectdePartment";
import {BASE_URL, INSTRUMENTTYPE} from "@/utils/constant";
import {getRoomList} from "@/api/room";
import {getInstrumentNewInfoExpandInfo} from "@/api/activiti";
import SelectUrl from "./SelectUrl";
import SelectAssetClassify from "@c/SelectAssetClassify";

export default {
    name: "FullWarehouseFrom",
    components: {
        SelectUrl,
        ChuxouUpload,
        SelectDepartment,
        SelectAssetClassify

    },
    props: ["form", "type", "id"],
    data() {
        return {
            item: {},
            sOPSituationReport: [],
            INSTRUMENTTYPE,
            logoUrl: [],
            roomList: [],
            verifiedReport: [],
            userItem: {
                departmentId: "",
                pageNum: 1,
                keyword: "",
                pageSize: 100
            },
            BASE_URL,
            useList: [],
            custodians: [],
        }
    },
    watch: {
        "form.departmentId": {
            handler(obj) {
                if (obj) {
                    this.userItem.departmentId = obj;
                    this.$store.dispatch("sys/getUsers", this.userItem).then(res => {
                        this.useList = res;
                    })
                }
            }
        },
        "form.useDeptId": {
            handler(obj) {
                if (obj) {
                    this.userItem.departmentId = obj;
                    this.$store.dispatch("sys/getUsers", this.userItem).then(res => {
                        this.custodians = res;
                    })
                }
            }
        },
        "form.storageLocationId": {
            handler(val) {
                if (typeof val === "string") {
                    this.form.storageLocationId = val * 1;
                }
            }
        },

    },
    created() {
        this.handleGetRoomList();
    },
    methods: {
        async handleGetRoomList() {
            const res = await getRoomList({pageSize: 10000, pageNum: 1});
            if (res.code) {
                this.roomList = res.items.list;
            }
        },
        handleLogoUrl(url) {
            console.log(url)
            this.form.logoUrl = url;
        },
        handleUploadSuccess(e, key) {
            this[key] = e;
            if (this[key].length) {
                const arr = this[key];
                this.form[key] = arr[0].name;
            } else {
                this.form[key] = "";
            }
        },
    }
}
</script>

<style lang="less" scoped>
.input-with-select {
    width: 90% !important;
}

.flex {
    height: 36px;
    line-height: 36px;
}

.upload {
    margin-left: 100px;
}

.img {
    width: 60px;
    height: 60px;
}
</style>
