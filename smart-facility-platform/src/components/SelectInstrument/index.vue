<template>
  <common-select
    v-model="instrumentId"
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
    :listKeyName="'instrumentVOS'"
  >
  </common-select>
</template>

<script>
import { queryinstrumentTypeByName } from '@/api/labDevice'
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
      instrumentId: this.value,
      instrumentList: [],
      api: queryinstrumentTypeByName
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
          if (event && vm.instrumentList) {
            if (Array.isArray(event)) {
              event.forEach(v => {
                let staff = vm.instrumentList.find(s => s.value === v)
                nameList.push(staff.label)
              })
              name = nameList.join(',')
            } else {
              name = vm.instrumentList.find((v) => event === v.value).label
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
        this.instrumentId = val || ''
      },
      immediate: true
    }
  },

  methods: {
    input(data) {
      this.$emit('input', data)
    },
    resMethod(options) {
      let instrumentList = []
      if (options.length) {
        instrumentList = options.map((i) => {
          const { name = '', id = '' } = i
          return {
            label: name,
            value: String(id)
          }
        })
      }
      this.instrumentList = instrumentList
      return instrumentList
    }
  }
}
</script>
