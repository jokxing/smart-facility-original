<template>
    <div>
        <!--     搜索和新增按钮-->
        <div class="search-bar-container">
            <el-input
                v-model="param.key"
                class="input-with-select"
                :placeholder="$t('common.inputKeyword')"
                @keyup.enter.native="handleFilter">
                <el-button
                    @click="handleFilter"
                    class="el-button-host"
                    slot="append"
                    icon="icon-search1"/>
            </el-input>
            <el-button
                @click="handleAddCarBrand"
                class="defaultBtn"
                icon="el-icon-plus"
                type="primary">
                {{ $t('transport.addBrandName') }}
            </el-button>
        </div>
        <!--                表格数据-->
        <div class="sticky-head">
            <el-table
                stripe
                :data="carBrandTable"
                size="medium"
                border
                ref="multipleTable"
                v-loading="tableLoading">
                <el-table-column label="#" type="index" width="100px">
                    <template v-slot="scope">
                        <!-- 有分页时，序号显示 -->
                        <span v-if="`${total != 0}`">
                                {{ (param.pageNum - 1) * param.pageSize + scope.$index + 1 }}
                            </span>
                        <!-- 无分页时，序号显示 -->
                        <span v-else>{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="brandNo" :label="$t('common.no')"></el-table-column>
                <el-table-column prop="brandName" :label="$t('transport.brandName1')"></el-table-column>
                <el-table-column :label="$t('common.handle')" width="150px">
                    <template v-slot="scope">
                        <el-button type="text" @click="handleEditCarBrand(scope.row)">{{ $t('common.edit') }}</el-button>
                        <el-button type="text" class="abnormal" @click="handleDeleteCarBrand(scope.row)">{{ $t('common.delete') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!--                分页-->
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="param.pageSize"
                :page.sync="param.pageNum"
                @pagination="getList"
                :total="total"/>
        </div>

        <!--        新增或编辑车品牌-->
        <CreateCarBrand ref="CreateCarBrand" @handle="handleFilter"/>
    </div>
</template>

<script>
import {getCommonBrandList, removeCommonBrand} from "@/api/transport";
import CreateCarBrand from "@/views/transport/components/CreateCarBrand";
import Pagination from "@c/Pagination";
import mixin from "@/utils/mixin";

export default {
    name: "ListCarBrand",
    components: {
        Pagination,
        CreateCarBrand,
    },
    data() {
        return {
            // 车品牌
            carBrandTable: [],
            tableLoading: false,
            // 分页查询信息
            param: {
                pageNum: 1,
                pageSize: 10,
                key: ""
            },
            total: 0,
        }
    },
    created() {
    },
    watch: {
        list() {

        }
    },
    mounted() {
        ;
    },
    methods: {
        handleFilter() {
            this.param.pageNum = 1
            this.getList();
        },
        // 获取车品牌列表
        getList() {
            this.tableLoading = true;
            getCommonBrandList(this.param).then(res => {
                if (res.code) {
                    let {list, total} = res.items
                    this.carBrandTable = list
                    this.total = total
                } else {
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.tableLoading = false;
            })
        },
        // 点击新增车品牌
        handleAddCarBrand() {
            this.$refs.CreateCarBrand.open(0);
        },
        // 点击编辑车品牌
        handleEditCarBrand(row) {
            this.$refs.CreateCarBrand.open(1, row);
        },
        // 点击移除车品牌
        handleDeleteCarBrand(row) {
            this.$confirm(this.$t('transport.deleteBrandNameMessage') + row.brandName + this.$t('transport.deleteBrandNameMessage1'), this.$t('transport.deleteBrandName'), {
                type: "warning",
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel')
            }).then(() => {
                removeCommonBrand([row.id]).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (Math.ceil(--this.total / this.param.pageSize) <this.param.pageNum) {
                            this.param.pageNum--;
                        }
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
    }
}
</script>

<style lang="less" src="../../../style/table_sticky.less" scoped>

</style>