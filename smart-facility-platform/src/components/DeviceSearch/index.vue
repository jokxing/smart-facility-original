<template>
  <div class="search-bar-container">
    <div>
      <SelectDepartment
          :departmentId.sync="items.departmentId"
          :is-company="true"
          :select-tree-value.sync="items.departmentId"
          @change="getValue"/>
      <el-input
          v-model.trim="items.keyword"
          class="input-with-select"
          clearable
          :placeholder="$t('common.inputKeyword')"
          @keyup.enter.native="handleQuery($STATUS.ALL)">
        <el-button
            slot="append"
            class="el-button-host"
            icon="icon-search1"
            @click="handleQuery($STATUS.ALL)">
        </el-button>
      </el-input>
    </div>
    <div>
      <el-button v-if="$store.state.level" class="el-button-host" @click="handleAdd"><i class="icon-addto"></i>
          {{ $t('hardware.addDevice') }}
      </el-button>
      <el-button v-if="$store.state.level" @click="multiSelect = !multiSelect">
        {{ multiSelect ? "取消批量设置" : "批量设置" }}
      </el-button>
      <el-button v-if="$store.state.level" @click="importFileVisible = !importFileVisible">导入</el-button>
      <el-button v-if="$store.state.level" @click="handleExport">导出</el-button>
    </div>
  </div>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";

export default {
  name: "index",
  components: {
    SelectDepartment,
  },
  methods: {
    handleQuery() {

    },
    getValue() {},
    handleAdd() {},
    handleExport() {}
  }
}
</script>

<style scoped>

</style>
