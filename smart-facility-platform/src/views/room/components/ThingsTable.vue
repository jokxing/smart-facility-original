<template>
  <div>
    <el-table
        v-loading="loading"
        :data="tableData"
        :default-sort="{order: 'descending'}"
        class="margin-center"
        border
        size="medium">
      <el-table-column fixed label="#" width="70px" type="index">
        <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('room.thingName')" prop="name" sortable>
        <template v-slot="scope">
          <a @click="handleShowThingDrawer(scope.row.id)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('room.thingNo')" prop="no" sortable/>
      <el-table-column :label="$t('room.createDate')" prop="createDate" sortable width="200">
          <template v-slot="{row}">
              {{ row.createDate | localToUtc }}
          </template>
      </el-table-column>
      <el-table-column :label="$t('common.remark')" prop="remark"/>
      <el-table-column v-if="$store.state.level && !isDemo" :label="$t('common.handle')" min-width="150">
        <template v-slot="scope">
          <el-button type="text" @click="handleEditThing(scope.row)">{{ $t('common.edit') }}</el-button>
          <el-button type="text" @click="handleRemoveThing(scope.row)">{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "ThingsTable",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    items: {
      type: Object,
      default: () => {}
    }

  },
  data() {
    return {
      isDemo: process.env.VUE_APP_DEMO === 'true'
    };
  },
  methods: {
    handleEditThing(row) {
      this.$emit("handleEdit", row);
    },
    handleRemoveThing(row) {
      this.$emit("handleDelete", row);
    },
    handleShowThingDrawer(row) {
      this.$emit("handlePath", row);
    }
  }
}
</script>

<style scoped>

</style>
