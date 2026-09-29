<template>
  <div>
    <div class="common-select">
      <el-select
        ref="child"
        :disabled="disabled"
        v-model="valueInner"
        :multiple="multiple"
        :placeholder="placeholder"
        :remote-method="remoteMethod"
        :loading="loading"
        v-on="listeners"
        filterable
        :clearable="clearable"
        :remote="remote"
        :allow-create="allowCreate"
        :collapse-tags="collapseTags"
        :default-first-option="defaultFirstOption"
        :filter-method="filterMethodDefined && filterableMethod"
      >
        <el-option
          v-for="item in options"
          :key="item[keyField || valueField]"
          :label="showLabel(item)"
          :value="item[valueField || keyField]"
          :disabled="item.disabled"
        >
          <div>
            <slot :row="item">
              <span style="float: left">{{ showLabel(item) }}</span>
              <span
                v-if="showKeyField"
                :style="{
                  float: showKeyField ? 'right' : 'left',
                  color: '#8492a6',
                  fontSize: '13px'
                }"
                >{{ item[keyField] }}</span
              >
            </slot>
          </div>
        </el-option>
      </el-select>
    </div>
  </div>
</template>
<script>
/**
 * 用法
 * <common-select
 *  @change="change"  钩子函数，用户点击切换选项
 *  @input="input"    钩子函数，输入框输入回显
 *  @initChange="initChange" 钩子函数，首次渲染回显
 *  returnObj         change事件触发时是否返回object
 *  value             当前选中的值
 *  multiple          是否多选
 *  remote            是否为远程搜索
 *  queryMethod       远程搜索方法
 *  placeholder       占位提示符
 *  valueField
 *  keyField
 *  showKeyField
 *  labelField        el-option的label:如果需要回显输入框的值与key一样，需设置el-option的label和key为同一个值，代码请参照上面
 *  params            远程搜索的参数
 *  data              下拉数据源（配置此项，remote也要配置成false,且queryMethod不需要配置）
 *  resMethod         返回数据重构钩子
 *  allow-create      是否允许用户创建新条目，需配合 filterable 使用
 *  defaultFirstOption 在输入框按下回车，选择第一个匹配项
 * filterMethodDefined 自定义筛选条件
 * eg://item：option选项，val：当前模糊搜索的值
 * filterMethodDefined(item, val) {
 *    return item.greigeFabricName.includes(val) || item.greigeFabricCode.includes(val)
 * }
 * ></common-select>
 */

import _ from 'lodash'

export default {
  name: 'commonSelect',
  mixins: [],
  props: {
    value: { type: [String, Number, Array], default: null },
    multiple: { type: Boolean, default: false },
    returnObj: { type: Boolean, default: false },
    remote: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    optionsTitle: { type: Object, default: () => new Object() },
    queryMethod: {
      type: Function,
      default() {
        return null
      }
    },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '' },
    filterable: { type: Boolean, default: true },
    valueField: { type: String, default: 'label' },
    keyField: { type: String, default: 'value' },
    labelField: { type: [String, Function], default: '' },
    showKeyField: { type: Boolean, default: false },
    params: {
      type: Object,
      default: () => {}
    },
    data: { type: Array, default: null },
    resMethod: Function,
    isSysDict: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: false },
    defaultFirstOption: { type: Boolean, default: false },
    filterMethodDefined: Function,
    collapseTags: { type: Boolean, default: false },
    //当必填参数都有值时才去查询
    needParams: {
      type: Array,
      default: ()=>[]
    },
    listKeyName: {
      type: String
    }
  },
  data() {
    return {
      options: [],
      copyOptions: [],
      valueInner: this.value,
      list: [],
      loading: false,
      paramsInner: this.params,
      filtermMethod: function () {}
    }
  },
  mounted() {
    this.remoteMethod()
  },
  computed: {
    listeners() {
      let vm = this
      return Object.assign({}, this.$listeners, {
        input(event) {
          vm.$emit('input', event)
        },
        change(event) {
          if (!vm.multiple) {
            if (vm.returnObj) {
              if (!event) {
                vm.$emit('change', '')
                return
              }
              let result = vm.options.filter((item) => {
                if (item[vm.valueField || vm.keyField] === event) {
                  vm.$emit('change', item)
                  // vm.$emit('input', item[vm.keyField])
                  return item
                }
              })
              if (!result || result.length == 0) {
                vm.$emit('change', '')
              }
            } else {
              vm.$emit('change', event)
            }
          } else {
            // 多选
            // console.log(event);
            if (vm.returnObj) {
              let res = vm.options.filter((item) => {
                let flag = event.includes(item[vm.keyField])
                if (flag) return item
              })
              vm.$emit('change', res)
            } else {
              vm.$emit('change', event)
            }
          }
        }
      })
    }
  },
  methods: {
    remoteMethod(keyword) {
      this.getList(this.paramsInner, keyword)
    },
    async getList (params, keyword) {
      if (this.data !== null) {
        this.options = this.data || []
        this.copyOptions = JSON.parse(JSON.stringify(this.options))
      } else {
        //当必填字段没有值时，直接返回空数组
        let missingRequiredRaram = this.needParams.find(item => {
          let ls = params[item]
          return !ls || (Array.isArray(ls) && !ls.length)
        })
        if(missingRequiredRaram) return this.options = []

        this.queryMethod({...params, keyword}).then(async (res) => {
          if (res.items) {
            let options = []
            if (Array.isArray(res.items) && res.items.length) {
              res.items.forEach(v => {
                if (v[this.listKeyName].length) {
                  v[this.listKeyName].forEach(ls => {
                    // 去重
                    if (!options.find(o => o.id === ls.id)) {
                      options.push(ls)
                    }
                  })
                }
              })
            } else {
              options = []
            }
            
            if (this.resMethod) {
              options = this.resMethod(options)
            }
            this.options = options
            if (
              Object.keys(this.optionsTitle).length > 0 &&
              this.options.length > 0
            ) {
              this.options = [this.optionsTitle, ...this.options]
            }
          }else{
            if (this.resMethod) {
              this.options = this.resMethod(res)
            }
          }
          this.copyOptions = JSON.parse(JSON.stringify(this.options))
          this.loading = false
          // 获取与当前value匹配的项目，并触发initChange回调
          let filterItem =
            this.options &&
            this.options.filter((item) => {
              if (item[this.keyField] === this.value) {
                return item
              }
            })
          // 如果接口返回的数据不包含已选的数据，需要清空已选的数据
          if (this.options.length) {
            if (this.multiple) {
              if (this.valueInner.length) {
                this.valueInner = this.valueInner.filter(v => this.options.find(o => o.value === v) && v)
              }
            } else {
              this.valueInner = this.options.find(o => o.value === this.valueInner)?.value
            }
          } else {
            this.valueInner = this.multiple ? [] : ''
          }
          this.$emit('initChange', this.multiple ? filterItem : filterItem[0])
        })
      }
    },
    // 处理下拉框显示
    showLabel(item) {
      if (typeof this.labelField === 'function') {
        return this.labelField(item)
      } else {
        return this.labelField ? item[this.labelField] : item[this.valueField]
      }
    },
    //自定义筛选条件
    filterableMethod(val) {
      if (!val) {
        this.options = JSON.parse(JSON.stringify(this.copyOptions))
      } else {
        if (
          this.filterMethodDefined &&
          typeof this.filterMethodDefined == 'function'
        ) {
          this.options = this.copyOptions.filter((item) => {
            return this.filterMethodDefined(item, val)
          })
        } else {
          this.options = this.copyOptions.filter((item) => {
            return this.filterMethodDefault(item, val)
          })
        }
      }
    },
    //默认filter方法
    filterMethodDefault(item, val) {
      let label = this.showLabel(item)
      return label.includes(val)
    }
  },
  watch: {
    params: {
      handler (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          //判断两个对象的内容是否完全相等
          this.paramsInner = newVal
          this.getList(this.paramsInner)
        }
      },
      deep: true
      // immediate: true // 不开启首次加载就执行监听
    },
    value: {
      handler(newVal) {
        this.valueInner = newVal

        // 获取与当前value匹配的项目，并触发initChange回调
        if (this.options.length) {
          let filterItem = this.options.filter((item) => {
            if (item[this.keyField] === this.value) {
              return item
            }
          })
          this.$emit('initChange', this.multiple ? filterItem : filterItem[0])
        }
        this.options = JSON.parse(JSON.stringify(this.copyOptions))
      },
      deep: true,
      immediate: true
    },
    data: {
      handler(newVal) {
        this.options = newVal || []
        this.copyOptions = JSON.parse(JSON.stringify(this.options))
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
<style lang="less" scoped>
.common-select {
  width: 100%;
}
.common-select /deep/ .el-select {
  width: 100%;
  .el-select__input {
    width: 100%;
  }
}
</style>
