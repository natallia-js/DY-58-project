import { createApp } from 'vue';
import { store } from './store';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';

import locale from './constants/locale';

import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import './assets/theme/bootstrap4-light-blue/theme.css';
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import MegaMenu from 'primevue/megamenu';
import PanelMenu from 'primevue/panelmenu';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Card from 'primevue/card';
import Tooltip from 'primevue/tooltip';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Calendar from 'primevue/calendar';
import SelectButton from 'primevue/selectbutton';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import ProgressSpinner from 'primevue/progressspinner';
import InlineMessage from 'primevue/inlinemessage';
import Dialog from 'primevue/dialog';
import TreeSelect from 'primevue/treeselect';
import Tree from 'primevue/tree';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmPopup from 'primevue/confirmpopup';
import ContextMenu from 'primevue/contextmenu';
import Fieldset from 'primevue/fieldset';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(VueAxios, axios);
app.use(PrimeVue, { locale });
app.use(ToastService);
app.use(ConfirmationService);

app.directive('tooltip', Tooltip);

app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);
app.component('MegaMenu', MegaMenu);
app.component('PanelMenu', PanelMenu);
app.component('Card', Card);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Calendar', Calendar);
app.component('SelectButton', SelectButton);
app.component('Dropdown', Dropdown);
app.component('RadioButton', RadioButton);
app.component('Checkbox', Checkbox);
app.component('ProgressSpinner', ProgressSpinner);
app.component('InlineMessage', InlineMessage);
app.component('Dialog', Dialog);
app.component('TreeSelect', TreeSelect);
app.component('Tree', Tree);
app.component('ConfirmPopup', ConfirmPopup);
app.component('ContextMenu', ContextMenu);
app.component('Fieldset', Fieldset);

app.mount('#app');
