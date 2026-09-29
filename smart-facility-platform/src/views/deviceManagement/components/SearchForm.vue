<template>
    <div class="search-form-com">
        <el-form
            class="search-form"
            ref="elForm"
            :model="formData"
            label-width="auto"
            inline
            label-position="left"
            @submit.native.prevent
        >
            <el-form-item>
                <el-cascader
                    :options="addressOptions"
                    :props="{
                        multiple: true,
                        checkStrictly: false,
                        children: 'subDivisions',
                        label: 'name',
                        value: 'id',
                        disabled: 'disabled'
                      }"
                    :show-all-levels="false"
                    :placeholder="$t('labDevice.addressScreen')"
                    collapse-tags
                    clearable
                    class="margin-small-right device-select w250"
                    popper-class="room-select"
                    v-model="formData.addressSelection"
                    @change="handleFormChange('addressSelection', formData.addressSelection)"
                ></el-cascader>
            </el-form-item>
            <el-form-item>
                <el-cascader
                    :options="departmentData"
                    :props="{
                    multiple: true,
                    checkStrictly: true,
                    children: 'subDivisions',
                    label: 'name',
                    value: 'id'
                  }"
                    :placeholder="$t('common.owningDepartment')"
                    collapse-tags
                    clearable
                    class="margin-small-right device-select  w250"
                    v-model="formData.departmentSelection"
                    @change="handleFormChange('departmentSelection', formData.departmentSelection)"
                ></el-cascader>
            </el-form-item>
            <el-form-item>
                <el-cascader
                    :options="deviceOptions"
                    :props="{
                    multiple: true,
                    checkStrictly: true,
                    children: 'childrenList',
                    label: 'name',
                    value: 'types'
                  }"
                    :placeholder="$t('labDevice.labDeviceType')"
                    collapse-tags
                    clearable
                    class="w160 margin-small-right device-select"
                    v-model="formData.typesListSelection"
                    @change="handleFormChange('typesListSelection', formData.typesListSelection)"
                ></el-cascader>
            </el-form-item>

            <el-form-item>
                <el-select
                    class="w160 margin-small-right"
                    v-model="formData.status"
                    filterable
                    @change="handleFormChange('status', formData.status)"
                    clearable
                    :placeholder="$t('labDevice.runStatus')">
                    <el-option
                        v-for="item in statusArray"
                        :key="item.id"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select
                    class="w160 margin-small-right"
                    v-model="formData.sensorStatus"
                    filterable
                    @change="handleFormChange('sensorStatus', formData.sensorStatus)"
                    clearable
                    :placeholder="$t('labDevice.paramStatus')">
                    <el-option
                        v-for="item in STATUSSET"
                        :key="item.id"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select
                    class="w160 margin-small-right"
                    v-model="formData.objType"
                    filterable
                    @change="handleFormChange('objType', formData.objType)"
                    clearable
                    :placeholder="$t('common.relatedHardware')">
                    <el-option
                        v-for="item in equipmentTypeOptions"
                        :key="item.code"
                        :label="item.name"
                        :value="item.code">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import SelectDepartment from '@c/SelectdePartment'
// import ChartDimension from '@c/ChartDimension'
import {getEquipmentBindEquipmentType, getInstrumentCategoryInfoList} from '@/api/labDevice'
// import SelectDepartmentUser from '@/components/SelectDepartmentUser'
import SelectInstrument from '@/components/SelectInstrument'
import {getMapGardenList} from '@/api/mapSet'
import dictMixin from '../mixin/dict.mixin'

export default {
    mixins: [dictMixin],
    props: {
        formData: {
            type: Object,
            default: () => {
            }
        }
    },
    data() {
        return {
            addressOptions: [], // 地理位置筛选级联选择器数据
            copyAddressOptions: [], // 备份地理位置筛选级联选择器数据
            deviceOptions: [],
            dataType: [
                {INTERVAL: 1, LABEL: "本日"},
                {INTERVAL: 2, LABEL: "本周"},
                {INTERVAL: 3, LABEL: "本月"},
            ],
            departmentIdList: [],
            allMinDep: [],
            firstDep: [],
            secDep: [],
            thirdDep: [],
            gardenIds: [],
            floorIds: [],
            roomIdList: [],
            categoryIds: [],
            subCategoryIds: [],
            allMinCategoryIds: [],
            equipmentTypeOptions: []
        }
    },
    components: {
        SelectDepartment,
        // ChartDimension,
        // SelectDepartmentUser,
        SelectInstrument
    },
    computed: {
        departmentData() {
            let departments = []
            const traverse = (array, _proto) => {
                let am = array.map((arr) => {
                    if (arr[_proto] && arr[_proto].length && arr[_proto].length > 0) {
                        traverse(arr[_proto], _proto);
                    } else if (Array.isArray(arr[_proto] && arr[_proto]) && !arr[_proto].length > 0) {
                        delete arr[_proto]
                    }
                    arr.id = arr["id"].toString();
                });
                return array;
            };
            departments = JSON.parse(JSON.stringify(this.$store.state.departments));
            return traverse(departments, "subDivisions");
        }
    },
    mounted() {
    },
    methods: {
        // 点击刷新按钮之后，表单状态要恢复
        handleRefshCallback() {
            this.departmentIdList = []
            this.allMinDep = []
            this.firstDep = []
            this.secDep = []
            this.thirdDep = []
            this.gardenIds = []
            this.floorIds = []
            this.roomIdList = []
            this.categoryIds = []
            this.subCategoryIds = []
            this.allMinCategoryIds = []
            this.addressOptions = JSON.parse(JSON.stringify(this.copyAddressOptions))
        },
        handleDeviceTypeChange() {
            let categoryIds = [],
                subCategoryIds = [],
                allMinCategoryIds = []
            if (this.formData.typesListSelection.length) {
                this.formData.typesListSelection.forEach((item) => {
                    if (Array.isArray(item)) {
                        if (item[0]) {
                            categoryIds.push(item[0])
                        }
                        if (item[1]) {
                            subCategoryIds.push(item[1])
                        }
                        allMinCategoryIds.push(item[item.length - 1])
                    }
                })
            }
            this.allMinCategoryIds = allMinCategoryIds
            this.categoryIds = categoryIds
            this.subCategoryIds = subCategoryIds
        },
        handleFormChange(prop, data) {
            if (prop === 'departmentSelection') {
                this.handleDepartmentSelection()
                data.firstDep = this.firstDep
                data.secDep = this.secDep
                data.thirdDep = this.thirdDep
                data.allMinDep = this.allMinDep
            } else if (prop === 'addressSelection') {
                this.handleAddressSelectionData()
                data.gardenIds = this.gardenIds
                data.floorIds = this.floorIds
                data.roomIdList = this.roomIdList
            } else if (prop === 'typesListSelection') {
                this.handleDeviceTypeChange()
                data.allMinCategoryIds = this.allMinCategoryIds
            } else if (prop === 'instrumentIdList') {
                this.formData.instrumentIdList = data?.[0] || []
            } else if (prop === 'managerIdList') {
                this.formData.managerIdList = data?.[0] || []
            }
            this.$emit('change', {prop, data})
        },
        handleAddressSelectionData() {
            let gardenIds = [],
                floorIds = [],
                roomIdList = []
            if (this.formData.addressSelection.length) {
                this.formData.addressSelection.forEach((item) => {
                    if (Array.isArray(item)) {
                        if (item[0]) {
                            gardenIds.push(item[0])
                        }
                        if (item[1]) {
                            floorIds.push(item[1])
                        }
                        if (item[2]) {
                            roomIdList.push(item[2])
                        }
                    }
                })
            }
            this.gardenIds = gardenIds
            this.floorIds = floorIds
            this.roomIdList = roomIdList
            if ((this.gardenIds.length >= 1 || this.floorIds.length >= 1) && this.formData.addressSelection.length) {
                this.handleAddressOptionsDisabled()
            } else {
                this.addressOptions = JSON.parse(JSON.stringify(this.copyAddressOptions))
            }
            console.log(271, this.gardenIds, this.floorIds, this.roomIdList)
        },
        // 限制地理位置级联选择器第一级、第二级单选
        handleAddressOptionsDisabled() {
            this.addressOptions.forEach((item) => {
                if (item.id === this.gardenIds[0]) {
                    item.disabled = false
                    item.subDivisions.forEach(s => {
                        if (s.id !== this.floorIds[0]) {
                            s.disabled = true
                        }
                    })
                } else {
                    item.disabled = true
                }
            })
            console.log(281, this.addressOptions, this.floorIds)
        },
        handleDepartmentSelection() {
            // 一级部门、二级部门、三级部门、所有选中的最细的部门级别id
            let firstDep = [],
                secDep = [],
                thirdDep = [],
                allMinDep = []
            if (this.formData.departmentSelection.length) {
                this.formData.departmentSelection.forEach((item) => {
                    if (Array.isArray(item)) {
                        if (item[0]) {
                            firstDep.push(item[0])
                        }
                        if (item[1]) {
                            secDep.push(item[1])
                        }
                        if (item[2]) {
                            thirdDep.push(item[2])
                        }
                        allMinDep.push(item[item.length - 1])
                    }
                })
            }
            this.allMinDep = allMinDep
            this.firstDep = firstDep
            this.secDep = secDep
            this.thirdDep = thirdDep
            this.departmentIdList = allMinDep
        },
        handleButtonClick(type) {
            if (type === 'refresh') {
                this.handleRefshCallback()
            }
            this.$emit('buttonClick', type)
        },
        handleChartDimension($event, type, callbackName) {
            if (callbackName === 'handleUseRanKingDateType') this.currentType = $event
            this.$emit('handleChartDimension', {$event, type, callbackName})
        },
        async queryAllDeviceType() {
            await getInstrumentCategoryInfoList().then(res => {
                if (res.items && res.items.length) {
                    this.deviceOptions = this.handleAssetClassifyOptions(res.items)
                }
            })
        },
        // 处理设备分类级联选择器数据，删除为空数组的childrenList
        handleAssetClassifyOptions(list) {
            list.forEach((item) => {
                if (item.childrenList && Array.isArray(item.childrenList)) {
                    if (!item.childrenList.length) {
                        delete item.childrenList
                    } else {
                        this.handleAssetClassifyOptions(item.childrenList)
                    }
                }
            })
            return list
        },
        // 获取地理位置级联选择器数据
        handleGetMapGardenList() {
            this.addressOptions = []
            getMapGardenList().then((res) => {
                if (res.code && res.items.length) {
                    for (const item of res.items) {
                        let grandpaKey = 'a'
                        let grandpa = {
                            key: grandpaKey + item.gardenId,
                            id: String(item.gardenId),
                            name: item.gardenName,
                            subDivisions: [],
                            disabled: false
                        }
                        for (const element of item.subDivisions) {
                            let fatherKey = 'b'
                            let father = {
                                key: fatherKey + element.id,
                                id: String(element.id),
                                name: element.name,
                                subDivisions: [],
                                disabled: false
                            }
                            grandpa.subDivisions.push(father)
                            for (const sun of element.subDivisions) {
                                let sunKey = 'c'
                                let grandson = {
                                    key: sunKey + sun.id,
                                    id: String(sun.id),
                                    name: sun.name,
                                    disabled: false
                                }
                                father.subDivisions.push(grandson)
                            }
                        }
                        this.addressOptions.push(grandpa)
                    }
                    this.copyAddressOptions = JSON.parse(JSON.stringify(this.addressOptions))
                }
            })
        },
        handleGetEquipmentTypeList() {
            getEquipmentBindEquipmentType({objType: 2}).then((res) => {
                if (res.code && res.items.length) {
                    this.equipmentTypeOptions = res.items
                }
            })
        },
    },
    created() {
        this.queryAllDeviceType()
        // 地理位置数据
        this.handleGetMapGardenList()
        this.handleGetEquipmentTypeList()
    }
}
</script>
<style lang="less" scoped>
.search-form-com {
    .w160 {
        width: 160px !important;
    }

    .w215 {
        width: 215px !important;
    }

    .w250 {
        width: 250px !important;
    }
}

.search-form-com /deep/ .el-form-item {
    margin-bottom: 10px;
    margin-right: 0px;
}

/deep/ .el-input__inner {
    height: 40px !important;
}

</style>
