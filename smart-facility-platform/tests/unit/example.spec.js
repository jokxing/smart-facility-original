import { shallowMount } from '@vue/test-utils'
import Device from "@/views/device/Device";

describe('Device.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(Device, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
