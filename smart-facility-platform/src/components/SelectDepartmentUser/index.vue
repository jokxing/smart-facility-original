<template>
  <common-select
    v-model="staffId"
    :key="componentKey"
    :placeholder="placeholder || ''"
    :keyField="keyField"
    :labelField="labelField"
    :valueField="valueField"
    :queryMethod="api"
    :remote="remote"
    :resMethod="resMethod"
    :returnObj="false"
    :params="params"
    v-bind="$attrs"
    v-on="listeners"
    :listKeyName="'headUserVOList'"
  >
  </common-select>
</template>

<script>
import { getDepartmentHeadUser } from '@/api/user'
export default {
  props: {
    params: { type: Object, default: () => {} },
    value: { type: [String, Array], default: null },
    labelField: { type: String, default: 'label' },
    valueField: { type: String, default: 'value' },
    keyField: { type: String, default: 'value' },
    remote: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    componentKey: { type: String, default: '' }
  },
  components: {},
  data() {
    return {
      staffId: this.value,
      staffList: [],
      api: getDepartmentHeadUser
    }
  },
  computed: {
    listeners() {
      let vm = this
      return Object.assign({}, this.$listeners, {
        input(event) {
          vm.$emit('input', event)
        },
        change(event) {
          let nameList = [], name = ''
          if (event && vm.staffList) {
            if (Array.isArray(event)) {
              event.forEach(v => {
                let staff = vm.staffList.find(s => s.value === v)
                nameList.push(staff.label)
              })
              name = nameList.join(',')
            } else {
              name = vm.staffList.find((v) => event === v.value).label
            }
          }
          vm.$emit('change', event, name)
        },
        initChange(event) {
          vm.$emit('initChange', event)
        }
      })
    }
  },
  mounted() {},

  watch: {
    value: {
      handler(val) {
        this.staffId = val || ''
      },
      immediate: true
    }
  },

  methods: {
    input(data) {
      this.$emit('input', data)
    },
    resMethod(options) {
      let staffList = []
      if (options.length) {
        staffList = options.map((i) => {
          const { name = '', id = '', departmentId='' } = i
          return {
            label: name,
            value: String(id),
            departmentId
          }
        })
      }
      this.staffList = staffList
      return staffList
    }
  }
}
</script>
