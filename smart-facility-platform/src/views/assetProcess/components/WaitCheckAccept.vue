<!-- 待入库 -->
<template>
    <el-dialog
        :title="$t('labDevice.checkAndAcceptApply')"
        :close-on-click-modal="false"
        :before-close="handleClose"
        append-to-body
        width="45%"
        :visible.sync="dialogFormVisible">
        <el-form :model="form" v-if="requireObj">
            <el-row>
                <el-col :span="12" v-if="requireObj['applyUserId'] && requireObj['applyUserId'].showed">
                    <el-form-item :label="$t('labDevice.applyUserName')" :required="requireObj['applyUserId'].required">
                        <el-input disabled class="input-with-select" v-model="form.name" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="requireObj['procOrderNo'] && requireObj['procOrderNo'].showed">
                    <el-form-item :label="$t('labDevice.applyNo1')" :required="requireObj['procOrderNo'].required">
                        <el-input class="input-with-select" v-model="form.procOrderNo" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="requireObj['applyDate'] && requireObj['applyDate'].showed">
                    <el-form-item :label="$t('labDevice.applyTime')" :required="requireObj['applyDate'].required">
                        <el-date-picker
                            v-model="form.applyDate"
                            type="datetime"
                            :disabled="requireObj['applyDate'].edited !== 1"
                            class="input-with-select"
                            format="yyyy-MM-dd"
                            value-format="yyyy-MM-dd"
                            :placeholder="$t('common.selectTime')">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="requireObj['measurementDate'] && requireObj['measurementDate'].showed">
                    <el-form-item :label="$t('labDevice.measurementDate')" :required="requireObj['measurementDate'].required">
                        <el-date-picker
                            v-model="form.measurementDate"
                            type="datetime"
                            :disabled="requireObj['measurementDate'].edited !== 1"
                            class="input-with-select"
                            format="yyyy-MM-dd HH:mm:ss"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="$t('common.selectTime')">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="requireObj['sOPSituationReport'] && requireObj['sOPSituationReport'].showed">
                    <el-form-item :label="$t('labDevice.sopsituationReport1')" :required="requireObj['sOPSituationReport'].required">
                        <chuxou-upload
                            :accept="'file'"
                            class="upload"
                            :disabled="requireObj['sOPSituationReport'].edited !== 1"
                            :acceptTips="$t('labDevice.sopsituationReport2')"
                            :dir="'file'"
                            :limit="1"
                            :value="verifiedReport"
                            @handleUploadSuccess="handleUploadSuccess($event, 'verifiedReport')"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="requireObj['accessoryUrl'] && requireObj['accessoryUrl'].showed">
                    <el-form-item :label="$t('labDevice.accessoryUrl')" :required="requireObj['accessoryUrl'].required">
                        <chuxou-upload
                            :accept="'file'"
                            class="upload"
                            :disabled="requireObj['accessoryUrl'].edited !== 1"
                            :acceptTips="$t('labDevice.accessoryUrl1')"
                            :dir="'file'"
                            :limit="1"
                            :value="accessoryUrl"
                            @handleUploadSuccess="handleUploadSuccess($event, 'accessoryUrl')"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="requireObj['remarks'] && requireObj['remarks'].showed">
                    <el-form-item :label="$t('common.remark')" :required="requireObj['remarks'].required">
                        <el-input :disabled="requireObj['remarks'].edited !== 1" type="textarea" class="input-with-select" v-model="form.remarks" :placeholder="$t('common.inputComment')"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item :label="$t('labDevice.waitList')">
                        <el-table
                            :data="list"
                            max-height="300"
                            border
                            style="width: 100%">
                            <el-table-column type="index" label="#" width="70"/>
                            <el-table-column
                                prop="instrumentName"
                                :label="$t('labDevice.assetName')"
                                min-width="120">
                            </el-table-column>
                            <el-table-column
                                prop="instrumentNo"
                                :label="$t('labDevice.assetNo')"
                                min-width="120">
                            </el-table-column>
                            <el-table-column
                                prop="assetCategoryName"
                                :label="$t('labDevice.classify')">
                            </el-table-column>
                            <el-table-column
                                prop="departmentName"
                                :label="$t('labDevice.departmentName')">
                            </el-table-column>
                            <el-table-column
                                prop="roomName"
                                :label="$t('common.owningRoom')">
                            </el-table-column>
                            <el-table-column
                                prop="address"
                                :label="$t('common.handle')">
                                <template v-slot="{row, $index}">
                                    <el-button type="text" @click="handleDelete($index)" class="abnormal">{{ $t('common.delete') }}</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button :disabled="disabled" @click="dialogFormVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button :disabled="disabled" :loading="disabled" type="primary" @click="onsubmit">{{ $t('common.confirm') }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";
import ChuxouUpload from "@c/ChuxouUpload";
import moment from "moment";
import {getActivitiGetStarShow, postActivitiApplyStorage} from "@/api/activiti";
import {FLOW_NUMBER} from "@/utils/constant";

export default {
    name: "WaitCheckAccept",
    components: {
        SelectDepartment,
        ChuxouUpload,
    },
    data() {
        return {
            dialogFormVisible: false,
            form: {
                procOrderNo: "",
                applyUserId: "",
                sopsituationReport: "",
                type: 4,
                instrumentIds: [],
                name: "",
                accessoryUrl: ""
            },
            accessoryUrl: [],
            verifiedReport: [],
            list: [],
            requireObj: "",
            disabled: false
        }
    },
    methods: {
        handleUploadSuccess(e, key) {
            this[key] = e;
        },
        open(type, array) {
            const userInfo = JSON.parse(localStorage.getItem("USERINFO"));
            this.form.applyUserId = userInfo.id;
            this.form.name = userInfo.name;
            this.dialogFormVisible = true;
            const date = moment(new Date()).format("YYYYMMDD");
            const random = Math.floor(Math.random() * 100000 + 1);
            this.form.procOrderNo = "RK" + date + (random + "").padStart(5, "0");
            this.list = array;
            this.form.applyDate = moment(new Date()).format("YYYY-MM-DD");
            getActivitiGetStarShow({proSetCode: FLOW_NUMBER.checkAccept}).then(res => {
                if (res.code) {
                    this.requireObj = res.items.reduce((prev, current) => {
                        prev[current.fieldKey] = {
                            showed: current.showed,
                            edited: current.edited,
                            required: Boolean(current.required)};
                        return prev;
                    },{})
                }
            })
        },
        handleClose() {
            this.dialogFormVisible = false;
            this.form = {
                procOrderNo: "",
                applyUserId: "",
                sopsituationReport: "",
                type: 4,
                instrumentIds: [],
                name: ""
            };
            this.verifiedReport = [];
            this.list = [];
            this.accessoryUrl = [];
        },
        onsubmit() {
            this.form.instrumentIds = [];
            this.list.map(item => {
                this.form.instrumentIds.push(item.instrumentId);
            })
            if (this.verifiedReport.length) {
                this.form.sopsituationReport = this.verifiedReport[0].name;
            }
            if (this.accessoryUrl.length) {
                this.form.accessoryUrl = this.accessoryUrl[0].name;
            }
            this.disabled = true;
            postActivitiApplyStorage(this.form).then(res => {
                this.disabled = false;
                if (res.code) {
                    this.$message.success(this.$t('labDevice.applySuccess'));
                    this.handleClose();
                    this.$emit("handle")
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.disabled = false;
                console.log(e);
            })
        },
        handleDelete(index) {
            this.list.splice(index, 1);
        }
    }
}
</script>

<style scoped>

</style>