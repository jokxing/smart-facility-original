import MainTable from './MainTable'
import CommonSelect from './CommonSelect'
import DeviceStatus from './DeviceStatus'
import ImageViewer from './ImageViewer/index.vue'

const componentPackages = {
  install: function (Vue) {
    Vue.component('MainTable', MainTable)
    Vue.component('common-select', CommonSelect)
    Vue.component('DeviceStatus', DeviceStatus)
    Vue.component('ImageViewer', ImageViewer)
  }
}

export default componentPackages