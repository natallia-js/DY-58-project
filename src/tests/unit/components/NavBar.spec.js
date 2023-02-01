import { mount } from '@vue/test-utils';
import NavBar from '../../../components/NavBar.vue';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import { store } from '../../../store';

describe('test NavBar', () => {
  it('test show user info dialog', () => {
    const wrapper = mount(NavBar, {
      global: {
        plugins: [store],
        components: {
          Button,
          Menubar,
        },
      },
    });
    const button = wrapper.find('Button');
    console.log(button);
    button.trigger('@click')();
    expect(wrapper.vm.showUserDataDlg).toEqual(true);
  });
});
