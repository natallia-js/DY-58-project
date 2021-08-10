<template>
  <TabView>
    <TabPanel header="Распоряжение">
      <new-order/>
    </TabPanel>
    <TabPanel header="Заявка">
      <new-request/>
    </TabPanel>
    <TabPanel header="Уведомление">
      <new-notification/>
    </TabPanel>
  </TabView>
</template>


<script>
  import NewOrder from '../components/CreateOrders/NewOrder';
  import NewRequest from '../components/CreateOrders/NewRequest';
  import NewNotification from '../components/CreateOrders/NewNotification';
  // import internationalizationDateTimeOptions from '../constants/internationalizationDateTimeOptions';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-new-order-page',

    components: {
      NewOrder,
      NewRequest,
      NewNotification,
    },

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.createOrder);

      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      // Следующий участок кода очень важно держать именно здесь, а не во вложенных
      // компонентах NewOrder, NewRequest, NewNotification, поскольку если положить его
      // в каждый из вложенных компонентов, то будет следующая проблема: при переходе ко
      // вложенному компоненту с помощью this.$router.push(...) инициализация компонентов
      // Datepicker, Timepicker, FormSelect,... будет лишь "поверхностной" и, в частности, в
      // этих компонентах не произойдет переход на русский язык. Этого всего не будет, если
      // соответствующую страницу полностью перезагрузить, но нам этого не надо.
/*
      let elems = document.querySelectorAll('.datepicker');
      M.Datepicker.init(elems, {
        autoClose: false,
        format: 'dd.mm.yyyy',
        defaultDate: Date.now(),
        setDefaultDate: true,
        firstDay: 1,
        isRTL: false,
        i18n: internationalizationDateTimeOptions.dateOptions,
      });

      elems = document.querySelectorAll('.timepicker');
      M.Timepicker.init(elems, {
        showClearBtn: false,
        defaultTime: 'now',
        twelveHour: false,
        i18n: internationalizationDateTimeOptions.timeOptions,
      });

      elems = document.querySelectorAll('select');
      M.FormSelect.init(elems, {});

      elems = document.querySelectorAll('.tooltipped');
      M.Tooltip.init(elems, {});
*/
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    },

    methods: {
      goToMainPage() {
        this.$router.push('/');
      },
    },
  }
</script>


<style scoped>
</style>
