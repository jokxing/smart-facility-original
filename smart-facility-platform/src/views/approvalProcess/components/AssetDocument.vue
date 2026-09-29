<template>
    <div>
        <Table
            v-loading="loading"
            :tableData="tableData"
            :data="list"
            @handleConfiguration="handleConfiguration"
            @handleSet="handleSet">
            <template v-slot="{data,prop}">
                <div v-if="prop === 'enabled'">
                    <el-switch
                        v-model="data.enabled"
                        active-color="#3F51B5"
                        :active-value="1"
                        :inactive-value="0"
                        @change="handleSwitch(data)">
                    </el-switch>
                </div>
                <div v-if="prop === 'updateDate'">
                    {{ data.updateDate | localToUtc }}
                </div>
            </template>
        </Table>
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
      <configuration ref="configuration"/>
    </div>
</template>

<script>
import Table from "@c/Tables";
import Pagination from "@/components/Pagination/index";
import {getProcessSettingQuery, postProcessOperate} from "@/api/activiti";
import {items, TIME_FORMAT} from "@/utils/constant";
import moment from "moment";
import Configuration from "@/views/approvalProcess/components/Configuration";

export default {
    components: {
      Configuration,
        Table,
        Pagination
    },
    data() {
        const _this = this;
        return {
            tableData: [
                {
                    label: "#",
                    type: "index"
                },
                {
                    label: _this.$t('labDevice.proSetName'),
                    prop: "proSetName"
                },
                {
                  label: _this.$t('labDevice.proSetName1'),
                  prop: "proSetName"
                },
                {
                    label: _this.$t('labDevice.description'),
                    prop: "description"
                },
                {
                    label: _this.$t('labDevice.updateDate'),
                    prop: "updateDate",
                    isSlot: true
                },
                {
                    label: _this.$t('labDevice.handleConfiguration'),
                    isButton: true,
                    clickList: [
                      {
                        text: _this.$t('labDevice.handleConfiguration'),
                        click: "handleConfiguration",
                      },
                    ]
                },
                {
                    label: _this.$t('route.approvalProcessSet'),
                    isButton: true,
                    clickList: [
                        {
                            text: _this.$t('route.approvalProcessSet'),
                            click: "handleSet",
                        },
                    ]
                },
                {
                    label: _this.$t('labDevice.enabled'),
                    prop: "enabled",
                    isSlot: true
                },
                // {
                //   label: "操作",
                //   isButton: true,
                //   clickList: [
                //     {
                //       text: "删除",
                //       click: "handleSet",
                //     },
                //   ]
                // },
            ],
            list: [],
            items: {
                pageSize: 20,
                pageNum: 1,
                sorter: ""
            },
            total: 0,
            loading: false
        }
    },
    created() {
        this.getList();
    },
    computed: {
        dateFormat() {
            return function (value) {
                if (value) {
                    return moment(Number(value)).format(TIME_FORMAT);
                }
            }
        }
    },
    methods: {
        getList() {
            this.loading = true;
            getProcessSettingQuery(this.items).then(res => {
                this.loading = false;
                if (res.code) {
                    this.list = res.items.list;
                    if (res.items.pageNum === items.PAGE_NUM) {
                        this.total = res.items.total;
                    }
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.$message.error(e);
                this.loading = false;
            })
        },
        handleSet(row) {
            this.$router.push({
                name: "ApprovalProcessSet",
                params: {
                    type: row.type,
                    typeName: row.proSetName,
                    id: row.proSetCode
                }
            })
        },
        handleConfiguration(row) {
          this.$refs.configuration.open(row);
        },
        handleSwitch(data) {
            postProcessOperate({
                id: data.id,
                companyId: data.companyId,
                enabled: data.enabled,
                proSetCode: data.proSetCode
            }).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('hardware.systemSuccess'));
                } else {
                    data.enabled = !data.enabled;
                    this.$message.error(res.message);
                }
            }).catch(e => {
                console.log(e)
            })
        }
    },
}
</script>