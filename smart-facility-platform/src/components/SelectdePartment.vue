<template>
  <SelectTree
      :accordion="false"
      :class="isClass ? 'select-change-p': 'input-with-select margin-small-right'"
      :clearable="true"
      :model.sync="departmentId"
      :options="departmentData"
      :prop="props"
      :value.sync="selectTreeValue"
      :is-company.sync="isCompany"
      :placeholder="placeholder != '' ? placeholder : $t('common.selectDepartemnt')"
      ref="select"
      :disabled="disabled"
      @getValue="getValue($event)"/>
</template>

<script>
import SelectTree from "@c/SelectTree/index";

let departments;
export default {
  name: "SelectDepartment",
  components: {
    SelectTree
  },
  props: {
    departmentId: {
      type: [String,Number],
      default: ""
    },
    isClass: {
      type: Boolean,
      default: false
    },
    selectTreeValue: {
      type: [String,Number],
      default: "0"
    },
      departments: {
        type: Array,
        default: () => []
      },
    isCompany: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "subDivisions",
      },
    }
  },
  computed: {
    departmentData() {
      const traverse = (array, _proto) => {
        let am = array.map((arr) => {
          if (arr[_proto] && arr[_proto].length && arr[_proto].length > 0) {
            traverse(arr[_proto], _proto);
          }
          arr.id = arr["id"].toString();
        });
        return array;
      };
      let departments = [];
        if (this.departments.length > 0) {
            departments = this.departments;
        } else {
            departments = JSON.parse(JSON.stringify(this.$store.state.departments));
        }
      if (this.isCompany) {
        departments.unshift({id: 0, name: JSON.parse(localStorage.getItem("USERINFO")).companyName, subDivisions: []});
      }
      return traverse(departments, "subDivisions");
    },
  },
  methods: {
    getValue(value) {
      this.$emit("update:selectTreeValue", value);
      this.$emit("update:departmentId", value);
      this.$emit("change");
    },
  }
}
</script>
