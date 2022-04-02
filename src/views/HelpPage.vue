<template>
  <div class="p-grid">
    <div class="p-col-fixed" style="width:250px">
      <MegaMenu :model="contentsItems" orientation="vertical" style="width:100%;height:100%;" />
    </div>
    <div class="p-col">
      <h2 class="p-text-center p-mt-3 p-mb-2">Руководство пользователя</h2>
      <system-enter-description />
      <main-page-description />
      <work-poligon-page-description />
      <personal-page-description />
      <journal-page-description />
      <create-order-page-description />
      <order-patterns-page-description />
      <system-exit-description />
    </div>
  </div>
</template>


<script>
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import SystemEnterDescription from '@/components/Help/SystemEnterDescription';
  import MainPageDescription from '@/components/Help/MainPageDescription';
  import WorkPoligonPageDescription from '@/components/Help/WorkPoligonPageDescription';
  import PersonalPageDescription from '@/components/Help/PersonalPageDescription';
  import JournalPageDescription from '@/components/Help/JournalPageDescription';
  import CreateOrderPageDescription from '@/components/Help/CreateOrderPageDescription';
  import OrderPatternsPageDescription from '@/components/Help/OrderPatternsPageDescription';
  import SystemExitDescription from '@/components/Help/SystemExitDescription';

  export default {
    name: 'dy58-help-page',

    components: {
      SystemEnterDescription,
      MainPageDescription,
      WorkPoligonPageDescription,
      PersonalPageDescription,
      JournalPageDescription,
      CreateOrderPageDescription,
      OrderPatternsPageDescription,
      SystemExitDescription,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.help);

      const contentsItems = [
        {
          label: 'Вход в систему',
          url: '#system-enter-description',
        },
        {
          label: 'Главная страница',
          url: '#main-page-description',
        },
        {
          label: 'Страница "Рабочий полигон"',
          url: '#work-poligon-page-description',
        },
        {
          label: 'Страница "Персонал"',
          url: '#personal-page-description',
        },
        {
          label: 'Страница "Журнал"',
          url: '#journal-page-description',
        },
        {
          label: 'Страница "Создать"',
          url: '#create-page-description',
        },
        {
          label: 'Страница "Шаблоны распоряжений"',
          url: '#patterns-page-description',
        },
        {
          label: 'Выход из системы',
          url: '#system-exit-description',
        },
      ];

      return {
        contentsItems,
      };
    },
  }
</script>


<style lang="scss" scoped>
  .p-megamenu {
    border-radius: 0;
    background-color: var(--surface-b);
  }

  :deep(.p-menuitem-link:hover) {
    border: 1px solid black;
  }

  :deep(.p-menuitem-text) {
    color: black !important;
  }
</style>
