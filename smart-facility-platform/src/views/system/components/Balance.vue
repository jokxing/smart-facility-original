<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :withHeader="false"
        size="70%">
        <div class="detail-container">
            <div class="detail-padding">
                <DrawerNav :is-width="false" :name="$t('system.balance')" @handle="handleClose"/>
                <div v-if="$store.state.level" class="detail-handle">
                    <div>
                        <el-switch
                            v-if="$store.state.level"
                            v-model="alarm"
                            :inactive-text="$t('system.moneyAlarm')"
                            @change="handlePostCompanyMoney"
                        ></el-switch>
                    </div>
                </div>
                <div class="alarm-handle">
                    <span>{{ $t('hardware.alarmRules') }}</span>
                    <a v-if="edit" class="el-icon-edit" :title="$t('hardware.updateAlarmRules')"
                       @click="handleEditBalance"></a>
                    <el-button v-else size="mini" type="primary" @click="handleEditBalance">{{
                            $t('system.save')
                        }}
                    </el-button>
                </div>
                <ul class="alarm-message">
                    <li>
                        <div class="alarm-message-title">{{ $t('system.tipMoney') }}</div>
                        <div class="alarm-message-num">
                            <span v-if="edit">{{ money.tipMoney }}</span>
                            <el-input
                                v-else
                                v-model="money.tipMoney"
                                oninput="value=value.replace(/[^\d]/g,'')"
                                @blur="verifyMoney"></el-input>
                            {{ $t('labDevice.yuan') }}
                        </div>
                        <div v-show="isMoney" class="abnormal">{{ moneyPs }}</div>
                    </li>
                    <li>
                        <div class="alarm-message-title">{{ $t('system.overdraftAmount') }}</div>
                        <div class="alarm-message-num">
                            <span>{{ money.overdraft || 0 }}</span>
                            {{ $t('labDevice.yuan') }}
                        </div>
                        <div v-show="interval" class="abnormal">{{ intervalPs }}</div>
                    </li>
                </ul>
            </div>
            <div class="detail-padding-nocolor">
                <el-descriptions class="margin-center" :title="$t('system.informUser')">
                    <template v-if="$store.state.level" slot="extra">
                        <el-button class="icon-staff-settings" type="primary" @click="handleSetPrincipal">
                            &nbsp;{{ $t('common.addPrincipal') }}
                        </el-button>
                    </template>
                </el-descriptions>
                <principal-table
                    :equipment-users="equipmentUsers"
                    :items="principalItems"
                    :loading="loading"
                    :total="principalTotal"
                    :type="1"
                    @change="handleEquipmentUsers"/>
                <div class="paging">
                    <pagination
                        v-show="principalTotal > principalItems.pageSize"
                        :limit.sync="principalItems.pageSize"
                        :page.sync="principalItems.pageNum"
                        :total="principalTotal"
                        @pagination="handleEquipmentUsers"/>
                </div>
            </div>
            <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>

        </div>

    </el-drawer>
</template>

<script>
import DrawerNav from "@c/DrawerNav/index";
import PrincipalTable from "@c/PrincipalTable/index";
import Pagination from "@c/Pagination/index";
import {items} from "@/utils/constant";
import SetPrincipal from "@c/SetPrincipal/index";
import {getEquipmentUserList} from "@/api/user";
import {getCompanyMoney, postCompanyUpdateMoney} from "@/api/system";

export default {
    name: "Balance",
    props: {
        isDrawer: {
            type: Boolean,
            default: true
        }
    },
    components: {
        DrawerNav,
        PrincipalTable,
        Pagination,
        SetPrincipal,

    },
    data() {
        const _this = this;
        return {
            alarm: false,
            edit: true,
            interval: false,
            isMoney: false,
            principalTotal: 0,
            money: {
                overdraft: 0,
                tipMoney: 100,
            },
            moneyPs: _this.$t('system.moneyPs'),
            intervalPs: _this.$t('system.intervalPs'),
            principalItems: {
                pageNum: items.PAGE_NUM,
                pageSize: items.PAGE_SIZE,
                equipmentId: 0,
                equipmentType: "DEVICE",
            },
            equipmentUsers: [],
            loading: false
        }
    },
    watch: {
        isDrawer(newValue) {
            if (newValue) {
                this.handleGetCompanyMoney();
                this.handleEquipmentUsers();
            }
        }
    },
    methods: {
        handleClose() {
            this.$emit("update:isDrawer", false)
        },
        verifyMoney() {
            if (Number(this.money.tipMoney) < 100) {
                this.money.tipMoney = 100;
                this.isMoney = false;
                this.$message.warning(this.$t('system.moneyPs'));
                return
            }
            this.isMoney = false;
        },
        async handleGetCompanyMoney() {
            const res = await getCompanyMoney();
            if (res.code) {
                this.money = res.items;
                this.alarm = this.money.openMoneyTip === 1;
            } else {
                this.$message.error(res.message);
            }
        },
        async handlePostCompanyMoney() {
            this.money["openMoneyTip"] = this.alarm ? 1 : 2;
            try {
                const res = await postCompanyUpdateMoney(this.money);
                if (res.code) {
                    this.$message.success(this.$t('common.operateSuccess'))
                } else {
                    await this.handleGetCompanyMoney();
                    this.$message.error(res.message);
                }
            } catch (e) {
                this.$message.error(e)
            }
        },
        handleEditBalance() {
            if (!this.edit) {
                if (this.isMoney || this.interval) {
                    return
                }
                this.handlePostCompanyMoney();
            }
            this.edit = !this.edit;
        },
        handleSetPrincipal() {
            this.$refs.SetPrincipal.open(0, 0);
        },
        handleEquipmentUsers() {
            getEquipmentUserList(this.principalItems).then(res => {
                const {pageNum, total, list} = res.items;
                this.equipmentUsers = list;
                if (pageNum === items.PAGE_NUM) {
                    this.principalTotal = total;
                }
            });
        },
    }
}
</script>

<style lang="less" scoped>
.alarm-handle {
    font-size: 18px;
    font-weight: bold;
    color: #444444;
    line-height: 30px;
    display: flex;
    align-items: center;

    span {
        margin-right: 20px;
    }
}

.alarm-message {
    line-height: 40px;
    margin-top: 20px;

    li {
        display: flex;

        .alarm-message-title {
            width: 200px;
        }

        .alarm-message-num {
            font-weight: bold;
            display: flex;

            .el-input {
                width: 100px !important;
                margin-right: 16px;
            }

            span {
                margin-right: 16px;
            }
        }

        .abnormal {
            font-size: 12px;
            margin-left: 8px;
        }
    }
}
</style>
