<template>
    <div>
        <el-dialog
            :title="$t('hardware.alarmSystem')"
            :visible.sync="dialogVisible"
            width="80%"
            :before-close="handleClose"
            destroy-on-close
            append-to-body
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            @close="handleClose"
            custom-class="advanced-alarmSet"
            top="8vh">
            <el-table
                max-height="400px"
                :data="sensors"
                v-loading="loading"
                style="width: 100%">
                <el-table-column type="index" fixed="left" label="#" width="50" align="center"/>
                <el-table-column prop="equipmentName" fixed="left" :label="$t('hardware.owningDevice')" width="90"/>
                <el-table-column
                    prop=""
                    :label="$t('other.whatResult')"
                    fixed="left"
                    width="150">
                    <template v-slot="{row}">
                        <div>
                            <div class="sensor-name-div" style="max-width: 90px;">{{ row.sensorAlias }}</div>
                            <!-- 单位 -->
                            <div v-if="row.sensorUnit" class="sensor-name-div" style="width: 40px;text-align: center;">
                                ({{ row.sensorUnit }})
                            </div>
                            <!-- 提示 -->
                            <el-tooltip
                                v-if="row.inlay === 0"
                                class="item" effect="dark"
                                placement="right"
                                :content="inlaySensorTip">
                                <i class="el-icon-warning-outline" style="margin-left: 5px;"></i>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column
                    prop=""
                    :label="$t('other.monitorTimeHeader')"
                    :render-header="monitorTimeHeader"
                    min-width="170">
                    <template v-slot="{row}">
                        <p v-if="row.rules.length===0">{{ $t('other.notMonitorTimeHeader') }}</p>
                        <template v-else>
                            <el-radio-group class="monitor-select-time" v-model="row.showingRule" size="mini">
                                <el-radio-button v-for="(rule,ruleIndex) in row.rules" :label="rule.id" :key="rule.id">
                                    {{ $t('other.timeHeader') }}{{ ruleIndex + 1 }}
                                </el-radio-button>
                            </el-radio-group>
                            <template v-for="rule in row.rules">
                                <div class="monitor-time" v-show="rule.id==row.showingRule" :key="rule.id">
                                    <p>{{ weekCycleToString(rule.weekCycle) }}</p>
                                    <p v-if="rule.weekCycle.length">{{ rule.startTime }} ~ {{ rule.endTime }}</p>
                                </div>
                            </template>
                        </template>
                    </template>
                </el-table-column>

                <el-table-column :label="$t('other.alarmScoped')" min-width="340">
                    <template v-slot="{row}">
                        <div v-if="row.validCat === sensorValidCats.RANGE">
                            <div class="alarm-arr" v-for="(limit,limitIndex) in ruleLimits[row.showingRule]"
                                 :key="limitIndex">
                                <el-tooltip class="item" effect="dark" placement="left">
                                    <div slot="content">
                                        <span>{{ limitOptions[limit.alarmLevel].minTip }}</span>
                                    </div>
                                    <i class="el-icon-warning-outline"></i>
                                </el-tooltip>
                                &nbsp;
                                <el-input-number
                                    class="alarm-input"
                                    v-model="limit.normalMin"
                                    style="width: 65px"
                                    :min="normalMinValidMin(row, limitIndex)"
                                    :max="normalMinValidMax(row, limitIndex)"
                                    :controls="false"
                                />
                                <i class="el-icon-arrow-left"></i>
                                <el-select
                                    class="alarm-select"
                                    style="width: 95px"
                                    v-model="limit.alarmLevel"
                                    :placeholder="$t('common.placeholder')"
                                    @change="handleChangeAlarmLevel(ruleLimits[row.showingRule])"
                                    :disabled="limit.alarmLevel === 1 && !levenOneLimit_isNotOnly(ruleLimits[row.showingRule])">
                                    <el-option
                                        v-for="item in limitOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="optionDisabled(ruleLimits[row.showingRule],item.value)">
                                    </el-option>
                                </el-select>
                                <i class="el-icon-arrow-left"></i>
                                <el-input-number
                                    class="alarm-input"
                                    v-model="limit.normalMax"
                                    style="width: 65px"
                                    :min="normalMaxValidMin(row, limitIndex)"
                                    :max="normalMaxValidMax(row, limitIndex)"
                                    :controls="false"
                                />
                                &nbsp;
                                <el-tooltip class="item" effect="dark" placement="right">
                                    <div slot="content">
                                        <span>{{ limitOptions[limit.alarmLevel].maxTip }}</span>
                                    </div>
                                    <i class="el-icon-warning-outline"></i>
                                </el-tooltip>
                                &nbsp;
                                <i class="el-icon-delete abnormal"
                                   v-if="limit.alarmLevel !== 1 || levenOneLimit_isNotOnly(ruleLimits[row.showingRule])"
                                   @click="handleDelAlarm(ruleLimits[row.showingRule],limitIndex)"></i>
                            </div>
                            <div class="alarm-add"
                                 v-show="row.rules.length>0 && ruleLimits[row.showingRule].length<4"
                                 @click="handleAddAlarm(row)">
                                <!--                handleAddAlarm(ruleLimits[row.showingRule],row.showingRule,row.id)-->
                                <span><i class="el-icon-plus"></i></span>
                                {{ $t('hardware.add') }}
                            </div>
                        </div>
                        <div v-else>
                            <template v-for="(limit,limitIndex) in ruleLimits[row.showingRule]">
                                <div class="alarm-arr" :key="limit.id">
                                    <el-switch
                                        v-model="limit.normalOpen"
                                        :active-value="1"
                                        :inactive-value="2"/>
                                    &nbsp;
                                    <el-tooltip
                                        class="item"
                                        effect="dark"
                                        placement="right"
                                        :content="noLimitSensorSwicthTip(row.monitorSensorId)">
                                        <i class="el-icon-warning-outline"></i>
                                    </el-tooltip>
                                    &nbsp;
                                    <i class="el-icon-delete abnormal"
                                       v-if="ruleLimits[row.showingRule].length>1"
                                       @click="handleDelAlarm(ruleLimits[row.showingRule],limitIndex)"/>
                                </div>
                            </template>
                            <!--                -->
                            <div class="alarm-add"
                                 v-show="row.rules.length>0 && ruleLimits[row.showingRule].length<1"
                                 @click="handleAddAlarm(row)">
                                <span><i class="el-icon-plus"/></span>
                                {{ $t('hardware.add') }}
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('system.groupName')"
                    :render-header="noticeGroupHeader"
                    width="190%">
                    <template v-slot="{row}">
                        <template v-for="(limit,limitIndex) in ruleLimits[row.showingRule]">
                            <div class="group-col-arr" :key="limitIndex">
                                <div>
                                    <el-button class="group-col-button" type="text" @click="selectNoticeGroup(limit)">
                                        {{ $t('system.changeGroup') }}
                                    </el-button>
                                    <el-button class="group-col-button" type="text"
                                               @click="editNoticeGroup(2, limit.noticeGroups)">{{ $t('system.look') }}
                                    </el-button>
                                    <el-button class="group-col-button" type="text"
                                               @click="editNoticeGroup(1, limit.noticeGroups)">{{ $t('common.edit') }}
                                    </el-button>
                                </div>
                                <template v-for="(group,groupIndex) in limit.noticeGroups">
                                    <el-tag
                                        v-if="groupIndex<1"
                                        size="mini"
                                        type="info"
                                        closable
                                        :key="group.id"
                                        @close="limit.noticeGroups.splice(groupIndex,1)">
                                        {{ ellipsisString(group.groupName, 8) }}
                                    </el-tag>
                                </template>
                                &nbsp;
                                <el-tag
                                    v-if="limit.noticeGroups.length > 1"
                                    size="mini"
                                    type="info">
                                    ...
                                </el-tag>
                                <el-tag
                                    v-if="limit.noticeGroups.length===0"
                                    style="border: 0;background-color: rgba(0,0,0,0)"
                                    size="mini">
                                    &nbsp;
                                </el-tag>
                            </div>
                        </template>
                        <div class="alarm-add"
                             v-show="row.rules.length>0 && ruleLimits[row.showingRule].length<4 && row.validCat === sensorValidCats.RANGE">
                            <span style="background-color: rgba(0,0,0,0)">&nbsp;　</span>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="paging">
                <pagination
                    v-show="sensorTotal > 10"
                    :total="sensorTotal"
                    :page-sizes="[10,20,50,100]"
                    :page.sync="sensorPage.pageNum"
                    :limit.sync="sensorPage.pageSize"
                    @pagination="pagination"
                />
            </div>
            <span slot="footer" class="dialog-footer">
        <!--"取消对报警范围的修改和对通知组的选择"-->
        <el-button :disabled="loading" @click="handleClose">{{ $t('common.close') }}</el-button>
                <!--"使报警范围和通知组生效"-->
        <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('other.saveChange') }}</el-button>
      </span>
        </el-dialog>
        <NoticeGroupModal ref="noticeGroupModal"/>
        <MonitorTimeSet ref="monitorTimeSet" @comfirm="getList"/>
        <BatchNoticeGroupModal ref="batchNoticeGroupModal"/>
        <EditNoticeGroup ref="editNoticeGroup" @addedGroup="addedGroup"/>
        <IssuedResult ref="issuedResult"/>
    </div>
</template>

<script>
import NoticeGroupModal from "./components/NoticeGroupModal";
import MonitorTimeSet from "./components/MonitorTimeSet";
import BatchNoticeGroupModal from "./components/BatchNoticeGroupModal";
import EditNoticeGroup from "@c/EditNoticeGroup";
import Pagination from "@c/Pagination"
import IssuedResult from "@c/IssuedResult";
import {queryMonitorAlarmRule, setMonitorAlarmRuleLimits} from "@/api/room";
import {
    deepCopyObject,
    // getTimeLimit,
    numStringListToNumList,
    ellipsisString,
    objListFindByMember
} from "@/utils/QuickUtils"
import {throttle} from "@/utils/methods";

export default {
    components: {
        NoticeGroupModal,
        MonitorTimeSet,
        BatchNoticeGroupModal,
        EditNoticeGroup,
        IssuedResult,
        Pagination
    },
    data() {
        const _this = this;
        return {
            dialogVisible: false,
            obj: {
                id: null, //对象id
                type: null, //对象类型  1: 硬件. 2:设备. 3:房间. 4:站点. 5:车辆. 6:运单 101 移液枪
                name: null //对象名
            },
            sensorTotal: 0,
            sensorPage: {
                pageSize: 10,
                pageNum: 1,
            },
            sensorValidCats: {
                EQUALS: 1,//二维类
                RANGE: 3, //范围类
            },
            weekDayText: [_this.$t('other.sunday'), _this.$t('other.monday'), _this.$t('other.tuesday'), _this.$t('other.wednesday'), _this.$t('other.thursday'), _this.$t('other.friday'), _this.$t('other.saturday'), _this.$t('other.sunday'),],
            // 内置指标的提示
            inlaySensorTip: _this.$t('other.offLineAlarmInform'),
            // 二维类指标（只有开关的指标）的开关按钮提示
            // 报警范围等级定义表
            limitOptions: [
                {
                    value: 0,
                    label: _this.$t('other.earlyWarning'),
                    minTip: _this.$t('other.earlyWarningMin'),
                    maxTip: _this.$t('other.earlyWarningMax'),
                },
                {
                    value: 1,
                    label: _this.$t('other.overrun'),
                    minTip: _this.$t('other.overrunMin'),
                    maxTip: _this.$t('other.overrunMax'),
                },
                {
                    value: 2,
                    label: _this.$t('other.mOverrun'),
                    minTip: _this.$t('other.mOverrunMin'),
                    maxTip: _this.$t('other.mOverrunMax'),
                },
                {
                    value: 3,
                    label: _this.$t('other.sOverrun'),
                    minTip: _this.$t('other.sOverrunMin'),
                    maxTip: _this.$t('other.sOverrunMax'),
                },
            ],
            loading: false,
            //表格数据：
            sensors: [],
            rules: {},
            ruleLimits: {},
            //编辑时间的表单
            tempRules: [],
        }
    },
    methods: {
        noLimitSensorSwicthTip(monitorSeneorId) {
            switch (monitorSeneorId) {
                case 48:
                    return this.$t('other.openAsset');
                default:
                    return this.$t('other.openDevice');
            }
        },
        ellipsisString,
        open(obj) {
            this.obj = obj;
            this.dialogVisible = true;
            this.getList();
        },
        pagination() {
            this.getList();
        },
        resetTableDatas() {
            this.tempRules = [];
            this.sensors = [];
            this.ruleLimits = {};
            this.rules = [];
        },
        optionDisabled(limits, level) {
            return objListFindByMember(limits, "alarmLevel", level).index >= 0;
        },
        weekCycleSubRanges(weekDays) {
            //一段时间的开始和结束：
            let startDay = 0, endDay = 0;
            //很多段时间放一起：[{startday,endday},{...},...]
            let dayRanges = [];

            //拆解
            weekDays.forEach((weekDay, index) => {
                if (index === 0) {
                    startDay = endDay = weekDay;
                } else if (endDay + 1 === weekDay) {
                    endDay = weekDay;
                } else {
                    dayRanges.push({startDay, endDay});
                    startDay = endDay = weekDay;
                }
            })
            dayRanges.push({startDay, endDay});

            return dayRanges;
        },
        //报警周期表示成文字
        weekCycleToString(weekDays) {

            if (weekDays.length === 0) {
                return this.$t('other.dayNotAlarm');
            }

            //拆解时间段列表
            let dayRanges = this.weekCycleSubRanges(weekDays);

            //返回值：
            let str = '';
            //时间段表示成文字
            dayRanges.forEach((rang, index) => {
                if (index > 0) {
                    str += '，';
                }
                if (rang.startDay === rang.endDay) {
                    str += this.weekDayText[rang.startDay];
                } else if (rang.startDay === 1 && rang.endDay === 7) {
                    str += this.$t('other.everyday');
                } else {
                    str += this.weekDayText[rang.startDay] + ' ~ ' + this.weekDayText[rang.endDay];
                }
            })

            return str;//+ '\n' + startTime + "~" + endTime;
        },

        //告警范围以时间规则ID（ruleId）归类
        analysisRuleLimits(ruleLimits) {
            let ruleLimitMap = {};
            ruleLimits.forEach(limit => {
                if (!(limit.objRuleId in ruleLimitMap)) {
                    ruleLimitMap[limit.objRuleId] = [];
                }
                ruleLimitMap[limit.objRuleId].push(limit);
            })
            return ruleLimitMap;
        },

        //解析时间设置表
        analysisRules(resRules) {
            let now = new Date();
            let rules = {};
            let tempRules = [];
            resRules.forEach((resRule, index) => {
                if (!resRule.ids) {
                    resRule.ids = []
                }
                if (!resRule.objSensorIds) {
                    resRule.objSensorIds = []
                }

                //
                resRule.index = index;
                // console.log(resRule.weekCycle.split(","))
                resRule.weekCycle = resRule.weekCycle ? numStringListToNumList(resRule.weekCycle.split(',')).sort() : [];

                //给 "时间编辑面板" 的数据
                let tempRule = deepCopyObject(resRule);
                // console.log(tempRule.startTime, tempRule.endTime)
                tempRule.time = [tempRule.startTime, tempRule.endTime];
                // tempRule.time = getTimeLimit(tempRule.startTime, tempRule.endTime, now);
                // console.log(tempRule.time)
                tempRules.push(tempRule);

                /**
                 * 给表格显示部分的数据
                 */

                //转为以7表示星期天
                if (resRule.weekCycle.length && resRule.weekCycle[0] === 0) {
                    resRule.weekCycle.shift();
                    resRule.weekCycle.push(7);
                }

                //
                let objSensorIds = Object.assign([], resRule.objSensorIds)
                objSensorIds.forEach(objSensorId => {
                    tempRule = Object.assign({}, resRule);
                    tempRule.id = resRule.ids.shift();
                    delete tempRule.ids;
                    tempRule.objSensorId = resRule.objSensorIds.shift();
                    delete tempRule.objSensorIds;
                    if (!(objSensorId in rules))
                        rules[objSensorId] = [];
                    rules[objSensorId].push(tempRule);
                })

            })
            this.tempRules = tempRules;
            this.rules = rules;

        },


        //指标关联时间设置表
        linkSensorRule(sensors, ruleLimits) {
            sensors.forEach(sensor => {
                sensor.rules = (sensor.id in this.rules) ? this.rules[sensor.id] : [];
                sensor.showingRule = null;
                if (sensor.rules.length > 0) {
                    sensor.showingRule = sensor.rules[0].id;
                }
                this.inspectLimits(sensor, ruleLimits);
            })
            ///
            this.ruleLimits = ruleLimits;
            this.sensors = sensors;
        },

        //检查一个指标的报警范围列表
        inspectLimits(sensor, limits) {
            if (sensor.objId === sensor.equipmentId) {
                sensor.equipmentName = this.obj.name;
            }
            sensor.rules.forEach(rule => {
                if (!(limits[rule.id]) || !(Array.isArray(limits[rule.id]))) {
                    limits[rule.id] = [];
                } else {
                    limits[rule.id].forEach(limit => {
                        limit.equipmentName = sensor.equipmentName;

                    })
                }
            });


        },

        //形成默认的报警范围
        createDefaultLimit(objSensor, level) {
            let limitLevel1 = {
                id: null,
                alarmLevel: level,
                duration: 0,
                normalCat: objSensor.validCat,
                normalEq: null,
                normalMax: null,
                normalMin: null,
                noticeGroups: [],
                objRuleId: objSensor.showingRule,
                objSensorId: objSensor.id,
                companyId: objSensor.companyId,
                equipmentId: objSensor.equipmentId,//
                normalOpen: 1,
                objId: objSensor.objId,
                objType: objSensor.objType,
                monitorSensorIdx: objSensor.monitorSensorIdx,
                monitorSensorName: objSensor.sensorAlias,
                sensorUnit: objSensor.sensorUnit,
                equipmentName: objSensor.equipmentName
            }
            if (objSensor.validCat === this.sensorValidCats.RANGE) {
                limitLevel1.normalMax = objSensor.alarmInitMax;
                limitLevel1.normalMin = objSensor.alarmInitMin;
            } else {
                // limitLevel1.normalEq = objSensor.alarmInitEq;
                limitLevel1.normalEq = objSensor.defaultAlarmEq;
            }

            return limitLevel1;
        },

        editNoticeGroup(modelNum, noticeGroups) {
            if (noticeGroups.length === 0) {
                this.$message(this.$t('other.alarmNotGroup'));
            } else {
                this.$refs.editNoticeGroup.open(modelNum, noticeGroups, 1);
            }
        },

        // handelNormalMinChang(limit,sensor,index){
        //   let min = this.normalMinValidMin(sensor,index);
        //   let max = this.normalMinValidMax(sensor,index);
        //   if(limit.normalMin<min){
        //     limit.normalMin = min;
        //   }else if(limit.normalMin>max){
        //     limit.normalMin = max;
        //   }
        // },
        // handelNormalMaxChang(limit,sensor,index){
        //   let min = this.normalMaxValidMin(sensor,index);
        //   let max = this.normalMaxValidMax(sensor,index);
        //   if(limit.normalMax<min){
        //     limit.normalMax = min;
        //   }else if(limit.normalMax>max){
        //     limit.normalMax = max;
        //   }
        // },

        normalMinValidMin(sensor, index) {
            let limits = this.ruleLimits[sensor.showingRule];
            if (index === limits.length - 1) {
                return sensor.validMin;
            } else {
                return limits[index + 1].normalMin;
            }
        },
        ///!!!
        normalMinValidMax(sensor, index) {
            let limits = this.ruleLimits[sensor.showingRule];

            if (index === 0) {
                return limits[0].normalMax;
            } else {
                return limits[index - 1].normalMin;
            }

        },

        normalMaxValidMin(sensor, index) {
            let limits = this.ruleLimits[sensor.showingRule];
            if (index === 0) {
                return limits[0].normalMin;
            } else {
                return limits[index - 1].normalMax;
            }
        },
        normalMaxValidMax(sensor, index) {
            let limits = this.ruleLimits[sensor.showingRule];
            if (index === limits.length - 1) {
                return sensor.validMax;
            } else {
                return limits[index + 1].normalMax;
            }
        },

        // 编辑通知组点击另存为成功后
        addedGroup({groups, newGroup}) {
            // 组只能单选时，先清空
            while (groups.length) {//
                groups.pop();//
            }//
            groups.push(newGroup);//
        },

        //表格当前行的报警范围中，范围等级为1的不止一个
        levenOneLimit_isNotOnly(limits) {
            let num = 0;
            for (let i = 0; i < limits.length; i++) {
                if (limits[i].alarmLevel === 1) {
                    num++;
                    if (num > 1) {
                        return true;
                    }
                }
            }
            return false;
        },

        // 获取列表（节流）
        getList() {
            let that = this;
            that.getList = throttle(() => {
                that.getList_();
            }, 1000);
            that.getList();
        },

        // 获取列表
        getList_() {
            this.loading = true;
            queryMonitorAlarmRule({objId: this.obj.id, objType: this.obj.type, ...this.sensorPage}).then(res => {
                if (res.code === 1) {
                    this.resetTableDatas();
                    if (res.items) {
                        let items = res.items;

                        let ruleLimits = null;
                        items.ruleLimits && (ruleLimits = this.analysisRuleLimits(items.ruleLimits));
                        items.rules && this.analysisRules(items.rules);
                        items.sensors && this.linkSensorRule(items.sensors, ruleLimits);

                        this.sensorTotal = items.sensorTotal ? items.sensorTotal : 0;
                    }
                } else {
                    this.$message.error(res.massage);
                }
            }).finally(res => {
                this.loading = false;
            });

        },

        monitorTimeHeader() {
            return (
                <div>
                    {this.$t('other.monitorTimeHeader')} <i class='el-icon-setting'
                                                            on-click={() => this.showMonitorTime()}></i>
                </div>
            )
        },
        noticeGroupHeader() {
            return (
                <div>
                    {this.$t('system.groupName')} <i class='el-icon-setting'
                                                     on-click={() => this.batchSelectNoticeGroup()}></i>
                </div>
            )
        },

        // 监控时间范围
        showMonitorTime() {
            this.$refs.monitorTimeSet.open(this.obj, this.sensors, this.tempRules)
        },

        // 选择通知组
        selectNoticeGroup(limit) {
            this.$refs.noticeGroupModal.open(limit)
        },

        // 批量选择通知组
        batchSelectNoticeGroup() {
            this.$refs.batchNoticeGroupModal.open(this.sensors, this.ruleLimits)
        },

        // 添加报警范围设置
        handleAddAlarm(objSensor) {
            let limits = [...this.ruleLimits[objSensor.showingRule]];
            let level = 1;
            if (limits.length > 0) {
                for (level = 0; level < 4; level++) {
                    if (objListFindByMember(limits, "alarmLevel", level).index === -1) {
                        break;
                    }
                }
            }
            let newLimit = this.createDefaultLimit(objSensor, level);

            limits.push(newLimit);
            this.sortLimitsByLevel(limits);

            this.setNewLimit(newLimit, limits);

            this.ruleLimits[objSensor.showingRule] = limits;
        },

        setNewLimit(newLimit, limits) {
            let index = limits.indexOf(newLimit);
            if (index < limits.length - 1) {
                newLimit.normalMin = limits[index + 1].normalMin;
                newLimit.normalMax = limits[index + 1].normalMax;
            }
        },

        handleChangeAlarmLevel(limits) {
            this.sortLimitsByLevel(limits);
        },
        // 按报警等级排序
        sortLimitsByLevel(limits) {
            let newLimits = []
            limits.forEach(limit => {
                newLimits[limit.alarmLevel] = limit;
            })
            let limit = null;
            limits.splice(0, limits.length);
            while (newLimits.length) {
                limit = newLimits.shift();
                if (limit) {
                    limits.push(limit);
                }
            }
        },

        // 删除报警范围设置
        handleDelAlarm(limits, index) {
            limits.splice(index, 1);
        },

        // 提交变更
        handleSubmit() {

            let objSensorIds = [];
            this.sensors.forEach(sensor => {
                objSensorIds.push(sensor.id)
            })
            let limits = [];
            let run = true;
            for (let i in this.ruleLimits) {
                const arr = this.ruleLimits[i];
                if (arr.length > 1) {
                    run = this.handleRunSubmit(arr);
                }
                this.ruleLimits[i].forEach(limit => {
                    limits.push(limit);
                })
            }
            // console.log(run)
            if (!run) {
                return;
            }
            this.loading = true;
            setMonitorAlarmRuleLimits({
                objType: this.obj.type,
                objId: this.obj.id,
                objSensorIds,
                limits: limits
            }).then(res => {
                if (res.code === 1) {
                    this.$emit('handle');
                    this.$refs.issuedResult.open(res.items)
                }
            }).catch(e => {
            }).finally(() => {
                this.getList();
                this.loading = false;
            })
        },
        handleRunSubmit(arr) {
            let run = true;
            for (let j = 0; j < arr.length; j++) {
                const item_j = arr[j];
                console.log(item_j)
                if ((item_j.normalMin !== 0 && item_j.normalMax !== 0) && (!item_j.normalMax || !item_j.normalMin)) {
                    run = false;
                    this.$message.error(this.$t('common.isNotInput'));
                    break;
                }
                for (let k = j + 1; k < arr.length; k++) {
                    const item_k = arr[k];
                    if (item_j.alarmLevel === 0 && (item_j.normalMin <= item_k.normalMin || item_j.normalMax >= item_k.normalMax)) {
                        run = false;
                        this.$message.error(this.$t('other.waitAlarmErr'));
                        break;
                    }
                    if (item_j.normalMin == item_k.normalMin && item_j.normalMax == item_k.normalMax && run) {
                        run = false;
                        this.$message.error(this.$t('other.alarmErr'))
                        break
                    }
                }
                if (!run) {
                    break
                }
            }
            return run
        },
        handleClose() {
            this.resetTableDatas();
            this.dialogVisible = false;
        }
    },
}
</script>

<style lang="less" scoped>

.advanced-alarmSet {


    .el-icon-setting {
        cursor: pointer;
    }

    .sensor-name-div {
        display: inline-block;
        vertical-align: middle;
    }

    .monitor-time {
        margin-bottom: 8px;
    }

    .monitor-select-time {
        margin-bottom: 8px;
    }

    .monitor-select-time span {
        //background-color: red;
    }

    .alarm-select {
        width: 130px;
    }

    .alarm-input {
        width: 80px;
    }

    .el-icon-warning-outline {
        color: #CBA575;
        cursor: pointer;
        vertical-align: middle;
    }

    .alarm-arr {
        margin-top: 17px;
        margin-bottom: 15px;
    }

    .alarm-arr:nth-child(1) {
        margin-top: 10px;
    }

    // .group-col-arr:nth-child(1){
    //   //margin-top: 0px;
    // }

    .alarm-add {
        color: #3078F0;
        line-height: 28px;
        cursor: pointer;

        span {
            width: 28px;
            height: 28px;
            text-align: center;
            line-height: 28px;
            background-color: #E1ECFF;
            border-radius: 4px;
            display: block;
            float: left;
            margin-right: 16px;

            i {
                font-size: 14px;
            }
        }
    }

    .el-icon-delete {
        cursor: pointer;
        vertical-align: middle;
    }

    .group-col-button {
        padding-bottom: 0;
    }
}
</style>
