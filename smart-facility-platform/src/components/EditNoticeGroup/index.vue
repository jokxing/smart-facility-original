<template>
    <el-dialog
        :title="titles[type] + $t('system.groupName')"
        :visible.sync="dialogVisible"
        destroy-on-close
        append-to-body
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        :before-close="handleClose"
        width="61.7%"
        top="8vh"
        class="edit-notice-group"
        @close="handleClose">
        <el-tabs
            type="card"
            @tab-click="handleTabClick"
            style="margin-top: -10px"
            v-if="groups.length>1">
            <el-tab-pane
                v-for="group in groups"
                :key="group.id"
                :label="group.groupName"/>
        </el-tabs>
        <el-form  label-position="left" label-width="auto">
            <el-row class="group-name">
                <el-col :span="12">
                    <el-form-item :label="$t('system.noticeName')" required>
                        <el-input
                            type="textarea"
                            v-model="form.groupName"
                            :placeholder="$t('common.inputName')"
                            :disabled="disabled"
                            maxlength="50"
                            show-word-limit/>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('room.groupMsg')">
                        <el-input
                            type="textarea"
                            v-model="form.groupMsg"
                            :placeholder="$t('common.inputComment')"
                            :disabled="disabled"
                            maxlength="200"
                            show-word-limit/>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item :label="$t('system.selectUsers')">
                        <div class="select-people" :class="{ 'noDrop': disabled }"
                             @click="$refs.selectMember.open(JSON.stringify(selectUserTag))">
                            <el-tag
                                v-for="tag in selectUserTag"
                                :key="tag.id"
                                :closable="!disabled"
                                type="info"
                                @close="handleCloseTag(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <i class="el-icon-arrow-right"></i>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="notice-set" :class="{ 'noDrop': disabled }">
            <el-descriptions :title="$t('system.selectUsers')"/>
            <div class="box" v-for="(item, index) in noticeSetArr" :key="index">
                <el-descriptions :title="$t('system.selectUsers') + (index + 1)">
                    <template slot="extra">
                        <i v-if="!disabled" class="el-icon-delete abnormal" @click="handleDelNoticeSet(index)"></i>
                    </template>
                </el-descriptions>
                <el-form label-position="left" label-width="auto" >
                    <el-row>
                        <el-col :span="14">
                            <el-form-item :label="$t('system.systemUser')">
                                <div class="item" style="max-height: none;height: auto;min-height: 30px;"
                                     :class="{ 'noDrop': disabled }"
                                     @click="handleSetPersonnel(item,index)">
                                    <template v-for="(tag,index) in item.setPersonnel">
                                        <el-tag
                                            v-if="index<4"
                                            :key="tag.id"
                                            :closable="!disabled"
                                            type="info"
                                            @close="handleClosePersonnelTag(tag,item)">
                                            {{ tag.name }}
                                        </el-tag>
                                        <el-tag
                                            v-if="index===4"
                                            :key="0"
                                            type="info">
                                            ...
                                        </el-tag>
                                    </template>
                                    <i class="el-icon-arrow-right"></i>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item :label="$t('common.timeFrame')">
                                <el-time-picker
                                    class="item"
                                    :disabled="disabled"
                                    is-range
                                    value-format="HH:mm:ss"
                                    format="HH:mm:ss"
                                    v-model="item.date"
                                    :range-separator="$t('common.most')"
                                    :start-placeholder="$t('common.startTime')"
                                    :end-placeholder="$t('common.endTime')"
                                    :placeholder="$t('common.selectDateScope')"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item :label="$t('system.informType')" class="notice-mode">
                                <div class="flex">
                                    <el-checkbox
                                        v-model="item.isWx"
                                        :disabled="disabled"
                                        @change="item.isWx && (item.wx==='')  && (item.wx=0)">{{ $t('system.weChat') }}
                                    </el-checkbox>
                                    <el-select
                                        v-model="item.wx"
                                        allow-create
                                        default-first-option
                                        :disabled="!item.isWx"
                                        :placeholder="$t('common.placeholder')">
                                        <el-option
                                            v-for="v in item.alarmList"
                                            :key="v.id"
                                            :label="v.name"
                                            :value="v.id">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div>
                                    <el-checkbox v-model="item.isSms" :disabled="disabled"
                                                 @change="item.isSms && (item.sms==='')  && (item.sms=0)">{{ $t('system.sms') }}
                                    </el-checkbox>
                                    <el-select
                                        v-model="item.sms"
                                        allow-create
                                        default-first-option
                                        :disabled="!item.isSms"
                                        :placeholder="$t('common.placeholder')">
                                        <el-option
                                            v-for="v in item.alarmList"
                                            :key="v.id"
                                            :label="v.name"
                                            :value="v.id">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="flex">
                                    <el-checkbox
                                        v-model="item.isPhone" :disabled="disabled"
                                        @change="item.isPhone && (item.phone==='')  && (item.phone=0)">{{ $t('system.phone') }}
                                    </el-checkbox>
                                    <el-select
                                        v-model="item.phone"
                                        allow-create
                                        default-first-option
                                        :disabled="!item.isPhone"
                                        :placeholder="$t('common.placeholder')">
                                        <el-option
                                            v-for="v in item.alarmList"
                                            :key="v.id"
                                            :label="v.name"
                                            :value="v.id">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="flex">
                                    <span class="margin-small-right">{{ $t('system.recoverNormal') }}</span>
                                    <el-select
                                        v-model="item.receiveResumeMessageFlag"
                                        allow-create
                                        default-first-option
                                        :placeholder="$t('common.placeholder')">
                                        <el-option
                                            v-for="v in item.receiveList"
                                            :key="v.id"
                                            :label="v.name"
                                            :value="v.id">
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row class="notice-interval">
                        <el-col :span="24">
                            <el-form-item :label="$t('system.informInt')">
                                <div class="minute">
                                    <el-input-number v-model="item.min1" :disabled="disabled" :controls="false" :min="0"
                                                     :max="1440"/>
                                    <span>{{ $t('common.minute') }}</span>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;~&nbsp;
                                <div class="minute">
                                    <el-input-number v-model="item.min2" :disabled="disabled" :controls="false"
                                                     @input="item.max=item.min2"
                                                     :min="15"
                                                     :max="1440"/>
                                    <span>{{ $t('common.minute') }}</span>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span class="margin-small-right">{{ $t('system.press') }}</span>
                                <div class="minute">
                                    <el-input-number v-model="item.minute" :disabled="disabled"
                                                     :min="1"
                                                     :step="1"
                                                     :controls="false"/>
                                    <span>{{ $t('common.minute') }}</span>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{{ $t('system.int1') }}</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <!--                                <span class="abnormal">未设置通知间隔的时间段默认按5分钟间隔通知1次</span>-->
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item>
                                <div class="minute" style="opacity: 0"></div>
                                &nbsp;&nbsp;&nbsp;&nbsp;>&nbsp;
                                <div class="minute">
                                    <el-input-number v-model="item.max" :disabled="true"
                                                     :controls="false"></el-input-number>
                                    <span>{{ $t('common.minute') }}</span>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span class="margin-small-right">{{ $t('system.press') }}</span>
                                <div class="minute">
                                    <el-input-number v-model="item.minute1" :disabled="disabled"
                                                     :min="1"
                                                     :step="1"
                                                     :controls="false"/>
                                    <span>{{ $t('common.minute') }}</span>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span >{{ $t('system.int1') }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </div>
        <div class="add-alarm-set" v-if="type!==2">
            <el-button icon="el-icon-plus" @click="handleAddAlarmSet">{{ $t('system.addAlarmSystem') }}</el-button>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>

            <el-button
                :disabled="loading"
                @click="handleAlseAddNoticeGroup"
                v-if="fromView===1 && type===1 &&  loginUserRoleId<5">
                {{ $t('system.save1') }}
            </el-button>

            <el-button
                type="primary"
                v-if="fromView===2 && type!==2 &&  (loginUserRoleId===4 && isOnDepartment() || loginUserRoleId<4)"
                :loading="loading"
                @click="handleSubmit">
                {{ $t('system.save') }}
            </el-button>

            <el-button
                :disabled="loading"
                @click="handleAlseAddNoticeGroup"
                v-else-if="fromView===2 && type!==2 ">
                {{ $t('system.save1') }}
            </el-button>
        </span>
        <NoticeMember ref="noticeMember" :groupPersonnel="selectUserTag" @handle="handleNoticeMember"/>
        <SelectMember ref="selectMember" @handle="handleSelectMember"/>


        <el-dialog append-to-body
                   :title="$t('system.save1')"
                   :visible.sync="newNameInputVisible">
            <div>
                <span style="display: inline-block;vertical-align: top;padding: 5px">{{ $t('system.informGroup') }}：</span>
                <el-input
                    style="display: inline-block;vertical-align: top;"
                    type="textarea"
                    class="select-change"
                    clearable
                    show-word-limit
                    :placeholder="$t('common.inputName')"
                    maxlength="50"
                    v-model="newGroupName"/>
            </div>
            <span slot="footer">
                <el-button :disabled="newNameBtnDisabled" @click="newNameInputVisible=false">{{ $t('common.cancel') }}</el-button>
                <el-button :disabled="newNameBtnDisabled" :loading="newNameBtnDisabled" type="primary"
                           @click="handleNewNameSubmit">{{ $t('common.confirm') }}</el-button>
            </span>
        </el-dialog>
    </el-dialog>
</template>

<script>
import NoticeMember from "@c/NoticeMember";
import SelectMember from "@c/SelectMember";
import {ALARMARRAY} from "@/utils/constant";
import {getGroupDetails, postNoticeGroupAdd, postNoticeGroupUpdate} from "@/api/system";
import moment from "moment";
import {deepCopyObject, getTimeLimit, objListFindByMember} from "@/utils/QuickUtils";
import i18n from "@/i18n";
// 初始化通知配置信息
function informObj() {
    let obj = {
        min1: 0,
        min2: 15,
        date: ['00:00:00', '23:59:59'],
        isWx: true,
        isSms: false,
        isPhone: false,
        wx: 0,
        sms: 0,
        phone: 0,
        alarmList: ALARMARRAY,
        isFlag: false,
        receiveResumeMessageFlag: 1,
        setPersonnel: [],
        userIds: [],
        minute: 5,
        minute1: 30,
        max: 15,
        receiveList: [
            {name: i18n.t('hardware.alarmArray13'), id: 1},
            {name: i18n.t('hardware.alarmArray14'), id: 0},
        ],

    };
    return obj;
}

export default {
    components: {
        NoticeMember,
        SelectMember
    },
    data() {
        return {
            titles: [i18n.t('common.add1'), i18n.t('common.edit'), i18n.t('system.look')],
            dialogVisible: false,
            disabled: false,
            loading: false,
            selectUserTag: [],
            form: {
                groupName: "",
                groupMsg: "",
                noticeGroupStaffs: [],
                noticeGroupStrategyItemVos: []
            },
            groupId: "",
            departmentId: 0,
            loginUserDepartmentId: 0,
            loginUserDepartmentTree: null,
            loginUserRoleId: null,
            groups: [],
            noticeSetArr: [informObj()],
            setPersonnelIndex: 0,
            type: 0,
            fromView:2,
            newNameInputVisible: false,
            newGroupName: '',
            newNameBtnDisabled: false
        }
    },
    methods: {
        /**
         * 打开
         * @param openModel 0：新增、1：编辑、2：查看
         * @param groups 通知组列表，新增时不需要传入。结构：[{id:123, groupName:'xxx'}, ...]
         * @param fromView 1:表示从报警设置页面打开窗口，2：表示从通知组管理页面打开窗口
         */
        open(openModel, groups, fromView) {

            this.dialogVisible = true;
            this.type = openModel;
            this.fromView = fromView;

            if (groups && groups.length > 0) {
                this.groups = groups;
                this.handleTabClick({index: 0});
            } else {
                this.groups = [];
                this.groupId = "";
                this.resetForm();
            }
            this.disabled = openModel === 2;
        },


        // 点击通知组卡片
        handleTabClick({index}) {
            this.groupId = this.groups[index].id;
            this.handleGetGroupDetails();
        },

        // 寻找自己部门以下的部门（包括自己部门）
        findDepartment() {
            let dpms = deepCopyObject(this.$store.state.departments);
            this.loginUserDepartmentTree = this.findDepartment_(dpms, this.loginUserDepartmentId);
        },
        findDepartment_(treeList, id) {
            let returnTree = null;
            for (let tree of treeList) {
                if (tree.id === id) {
                    returnTree = tree;
                    break;
                } else if (tree.subDivisions) {
                    returnTree = this.findDepartment_(tree.subDivisions, id);
                    if (returnTree) break;
                }
            }
            return returnTree;
        },
        // 判断通知组属于自己部门
        isOnDepartment() {
            if (
                this.departmentId !== null
                && this.loginUserDepartmentId !== null
                && this.loginUserDepartmentTree !== null
            ) {
                if (this.findDepartment_([this.loginUserDepartmentTree], this.departmentId)) {
                    return true;
                }
            }

            return false;
        },
        // 重设内容
        resetForm() {
            this.form = {
                groupName: "",
                groupMsg: "",
                noticeGroupStaffs: [],
                noticeGroupStrategyItemVos: []
            }
            this.noticeSetArr = [informObj()];
        },

        // 选择人员-删除人员
        handleCloseTag(tag) {
            for (let i = 0; i < this.selectUserTag.length; i++) {
                if (this.selectUserTag[i].id === tag.id) {
                    this.selectUserTag.splice(i, 1)
                }
            }

            // 根据被删除的选中人员，通知设置的人员相同的话也要删除
            this.closeedTag(tag);
        },

        // 根据被删除的选中人员，通知设置的人员相同的话也要删除
        closeedTag(tag){

            for (let i = 0; i < this.noticeSetArr.length; i++) {
                for (let j = 0; j < this.noticeSetArr[i].userIds.length; j++) {
                    if (this.noticeSetArr[i].userIds[j] === tag.id) {
                        this.noticeSetArr[i].userIds.splice(j, 1)
                    }
                }
                for (let k = 0; k < this.noticeSetArr[i].setPersonnel.length; k++) {
                    if (this.noticeSetArr[i].setPersonnel[k].id === tag.id) {
                        this.noticeSetArr[i].setPersonnel.splice(k, 1)
                    }
                }
            }
        },
        // 设置人员
        handleSetPersonnel(item, index) {
            if (!this.disabled) {
                // console.log(item)
                this.$refs.noticeMember.open(item);
                this.setPersonnelIndex = index
            }
        },
        handleNoticeMember(arr) {
            this.noticeSetArr[this.setPersonnelIndex].setPersonnel = arr;
            this.noticeSetArr[this.setPersonnelIndex].userIds = [];
            for (let i = 0; i < arr.length; i++) {
                this.noticeSetArr[this.setPersonnelIndex].userIds.push(arr[i].id)
            }
        },
        // 删除设置的人员
        handleClosePersonnelTag(tag, item) {
            for (let i = 0; i < item.setPersonnel.length; i++) {
                if (item.setPersonnel[i].id === tag.id) {
                    item.setPersonnel.splice(i, 1)
                }
            }
            for (let i = 0; i < item.userIds.length; i++) {
                if (item.userIds[i] === tag.id) {
                    item.userIds.splice(i, 1)
                }
            }
        },
        // 添加通知设置
        handleAddAlarmSet() {
            this.noticeSetArr.push(informObj());
        },
        // 删除通知设置
        handleDelNoticeSet(index) {
            this.noticeSetArr.splice(index, 1)
        },
        handleSelectMember(tags) {
            this.selectUserTag.forEach(oldTag=>{
                if(objListFindByMember(tags,'id',oldTag.id).item===null){
                    this.closeedTag(oldTag);
                }
            })

            this.selectUserTag = tags;




        },
        handleSubmit() {
            switch (this.type) {
                case 0:
                    this.handleAddNoticeGroup();
                    break;
                case 1:
                    this.handleUpdateNoticeGroup();
                    break;
            }
        },
        handleAlseAddNoticeGroup() {
            this.newNameInputVisible = true;
            this.newGroupName = this.form.groupName;
        },
        handleNewNameSubmit() {
            this.form.groupName = this.newGroupName;
            this.newNameBtnDisabled = true;
            this.handleAddNoticeGroup(() => {
                this.newNameInputVisible = false;
                this.newNameBtnDisabled = false;
            })
        },
        // 请求数据格式化
        handleRequestData() {
            // 群组人员设置
            const users = [];
            this.selectUserTag.map(item => {
                users.push({
                    "staffId": item.id,
                    "staffName": item.name,
                    "deptId": item.departmentId,
                    "deptName": item.departmentName,
                })
            });
            this.form.noticeGroupStaffs = users;
            this.form.noticeGroupStrategyItemVos = this.handleInfoMessage();
        },
        // 提交信息处理
        handleInfoMessage() {
            const informArray = [];
            this.noticeSetArr.map(item => {
                const informUsers = []; // 通知人员
                const informType = {
                    "startTime": item.date[0],
                    "endTime": item.date[1],
                    "noticeSms": item.isSms ? item.sms : -1,
                    "noticeWeixin": item.isWx ? item.wx : -1,
                    "noticeCall": item.isPhone ? item.phone : -1,
                    restoreNotice: item.receiveResumeMessageFlag
                };
                if (item["noticeIntervalId"]) {
                    informType["id"] = item.noticeIntervalId;
                }
                // 通知方式
                const informInterval = [
                    {
                        "startAlarmTime": item.min1,
                        "endAlarmTime": item.min2,
                        "noticePeriod": item.minute,
                        "normalCat": ""
                    },
                    {
                        "startAlarmTime": item.max,
                        "endAlarmTime": "",
                        "noticePeriod": item.minute1,
                        "normalCat": 3
                    }
                ];
                if (item["intervalId1"]) {
                    informInterval[0].id = item.intervalId1;
                }
                if (item["intervalId2"]) {
                    informInterval[1].id = item.intervalId2;
                }
                // 通知间隔
                item.setPersonnel.map(user => {
                    const userObj = {
                        "staffId": user.id,
                        "staffName": user.name,
                        "deptId": user.departmentId,
                        "deptName": user.departmentName
                    };
                    if (user["strategyId"]) {
                        userObj.strategyId = user.strategyId;
                    }
                    informUsers.push(userObj);
                })
                informArray.push({
                    noticeStaffs: informUsers,
                    noticeGroupStrategyVo: informType,
                    noticeGroupStrategyItemsVo: informInterval
                })
            })
            return informArray;
        },
        handleAddNoticeGroup(callbackFunc) {
            if (this.form.groupName === "") {
                this.$message.error(this.$t('common.isNotName'));
                return
            }

            this.handleRequestData();
            this.form.companyId = JSON.parse(localStorage.getItem("USERINFO")).companyId;
            postNoticeGroupAdd(this.form).then(res => {
                if (res.code === 1 && res.items) {
                    this.$emit('addedGroup', {groups: this.groups, newGroup: res.items});
                }
                this.handleMessage(res);
            }).finally(() => {
                if (callbackFunc) callbackFunc();
            })
        },
        handleUpdateNoticeGroup() {
            if (this.form.groupName === "") {
                this.$message.error(this.$t('common.isNotName'));
                return
            }
            this.handleRequestData();
            this.form.companyId = JSON.parse(localStorage.getItem("USERINFO")).companyId;
            postNoticeGroupUpdate(this.form).then(res => {
                this.handleMessage(res);
                this.$emit('addedGroup', {
                    groups: this.groups, newGroup: {
                        groupName: this.form.groupName,
                        id: this.groupId,
                    }
                });
            })
        },
        handleMessage(res) {
            if (res.code) {
                this.$message.success(this.$t('labDevice.saveSuccess'));
                this.$emit("handle");
                this.handleClose();
            } else {
                this.$message.error(res.message);
            }
        },
        handleGetGroupDetails() {
            this.selectUserTag = [];
            this.noticeSetArr = [];
            getGroupDetails({groupId: this.groupId}).then(res => {
                if (res.code) {
                    this.form.id = res.items.id;
                    this.form.groupName = res.items.groupName;
                    this.form.groupMsg = res.items.groupMsg;
                    this.departmentId = res.items.departmentId;
                    this.loginUserDepartmentId = res.items.loginUserDepartmentId;
                    this.loginUserRoleId = res.items.loginUserRoleId;
                    this.findDepartment();
                    if (res.items['noticeGroupStaffs']) {
                        this.handleResponseUser(res.items.noticeGroupStaffs);
                    }
                    if (res.items['notificationSettingsVos']) {
                        this.handleResponseInform(res.items.notificationSettingsVos);
                    }
                }
            })
        },
        handleClose() {
            this.dialogVisible = false;
            this.selectUserTag = [];
        },
        // 回显通知人
        handleResponseUser(noticeGroupStaffs) {
            noticeGroupStaffs.map(item => {
                this.selectUserTag.push({
                    id: item.staffId,
                    name: item.staffName,
                    departmentName: item.deptName,
                    departmentId: item.deptId,
                    isBoundWeixin: item.isBoundWeixin,
                    isBoundQyWeixin: item.isBoundQyWeixin
                })
            })
        },
        /**
         * 用于判断是否开启消息通知
         * @param value
         * @returns {boolean}
         */
        check(value) {
            let index;
            if (value === -1) {
                index = false;
            } else if (value === 0) {
                index = true
            } else {
                index = true;
            }
            return index;
        },
        /**
         * 回显通知信息
         * @param notificationSettingsVos
         */
        handleResponseInform(notificationSettingsVos) {
            notificationSettingsVos.map(item => {
                const obj = informObj();
                const {
                    id,
                    endTime,
                    noticeCall,
                    noticeSms,
                    noticeWeixin,
                    restoreNotice,
                    startTime
                } = item.noticeGroupStrategy;

                // const dateDefault = "1971-01-01 ";
                obj["noticeIntervalId"] = id;
                obj.date = [startTime, endTime];
                obj.wx = this.check(noticeWeixin) ? noticeWeixin : "";
                obj.sms = this.check(noticeSms) ? noticeSms : "";
                obj.phone = this.check(noticeCall) ? noticeCall : "";
                obj.isWx = this.check(noticeWeixin);
                obj.isSms = this.check(noticeSms);
                obj.isPhone = this.check(noticeCall);
                obj.receiveResumeMessageFlag = restoreNotice;
                obj.setPersonnel = [];
                item.noticeGroupStrategyStaffs.map(user => {
                    obj.setPersonnel.push({
                        departmentId: user.deptId,
                        departmentName: user.deptName,
                        groupId: user.groupId,
                        id: user.staffId,
                        name: user.staffName,
                        strategyId: user.strategyId
                    });
                    // 选择人员时的勾选状态也要回显
                    obj.userIds.push(user.staffId);
                });
                if (item.noticeGroupStrategyItems.length) {
                    obj["intervalId1"] = item.noticeGroupStrategyItems[0].id;
                    obj["intervalId2"] = item.noticeGroupStrategyItems[1].id;
                    obj.min1 = item.noticeGroupStrategyItems[0].startAlarmTime;
                    obj.min2 = item.noticeGroupStrategyItems[0].endAlarmTime;
                    // obj.max = item.noticeGroupStrategyItems[1].startAlarmTime;
                    obj.max = obj.min2;
                    obj.minute = item.noticeGroupStrategyItems[0].noticePeriod;
                    obj.minute1 = item.noticeGroupStrategyItems[1].noticePeriod;
                }
                this.noticeSetArr.push(obj);
            })
        }
    },

}
</script>

<style lang="less" scoped>
.edit-notice-group {
    .noDrop {
        cursor: no-drop !important;
        pointer-events: none;
    }

    /deep/ .el-dialog__body {
        max-height: 680px;
        overflow-y: auto;
    }

    .group-name {
        .el-input, .el-textarea {
            width: calc(100% - 100px);
        }
    }

    /deep/ .el-textarea .el-input__count {
        background-color: initial;
    }

    .select-people {
        width: 100%;
        max-height: 160px;
        min-height: 40px;
        overflow-y: scroll;
        background-color: #F4F4F9;
        float: right;
        border-radius: 4px;
        padding-top: 2px;
        padding-right: 40px;
        position: relative;
        cursor: pointer;

        .el-tag {
            margin-left: 10px;
            background-color: #fff;
        }

        i {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
        }
    }

    .notice-set {
        /deep/ .el-descriptions__title {
            font-size: 16px !important;
        }

        .el-tag {
            margin-right: 10px;
        }

        .box {
            padding: 14px 20px;
            background-color: #F6F6F6;
            border-radius: 8px;
            margin-bottom: 10px;

            /deep/ .el-descriptions__header {
                .el-descriptions__title {
                    font-size: 14px !important;
                    font-weight: initial;
                    color: #333;
                }

                i {
                    cursor: pointer;
                }
            }

            .el-form {
                .item {
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    background-color: #fff;
                    border-radius: 6px;
                    padding-left: 10px;
                    padding-right: 40px;
                    position: relative;
                    cursor: pointer;

                    i.el-icon-arrow-right {
                        position: absolute;
                        top: 50%;
                        right: 10px;
                        transform: translateY(-50%);
                    }

                    /deep/ .el-range-input {
                        background-color: #fff;
                    }
                }

                /deep/ .el-input--medium .el-input__inner {
                    background-color: #fff;
                    margin-left: 10px;
                }

                .notice-mode {
                    /deep/ .el-form-item__content {
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        .flex {
                            display: flex;
                            margin-bottom: 8px;
                            .el-checkbox {
                                margin-right: 8px;
                            }
                        }
                    }

                }

                .notice-interval {
                    /deep/ .el-form-item__content {
                        display: flex;
                        //justify-content: space-between;
                    }

                    .minute {
                        width: 120px;
                        position: relative;

                        .el-input-number {
                            width: 100% !important;

                            /deep/ .el-input__inner {
                                text-align: left;
                            }
                        }

                        span {
                            position: absolute;
                            top: 0;
                            right: 8px;
                            z-index: 1;
                        }
                    }
                }
            }
        }
    }

    .add-alarm-set {
        .el-button {
            width: 400px;
            background-color: #E1ECFF;
            border: 0;
            color: #3078F0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 50px auto 0;

            i {
                vertical-align: middle;
            }
        }
    }
}
</style>
