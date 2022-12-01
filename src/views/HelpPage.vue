<template>
  <div class="p-d-flex p-flex-row p-mr-0 p-mt-0 dy58-user-manual-text-block">
    <div class="p-p-0" style="flex-basis:250px">
      <Menu :model="contentsItems" orientation="vertical" style="width:100%;height:100%;">
        <template #item="{item}">
          <a :href="item.url" class="p-menuitem-link">{{ item.label }}</a>
        </template>
      </Menu>
    </div>
    <div class="p-m-3 p-p-0" style="flex:1">
      <h2 class="p-text-center p-mb-2" id="user-manual-start">Руководство пользователя</h2>
      <system-enter-description />
      <to-help-start-block />
      <main-menu-description />
      <to-help-start-block />
      <footer-description />
      <to-help-start-block />
      <main-page-description />
      <to-help-start-block />
      <create-order-page-description />
      <to-help-start-block />
      <journal-page-description />
      <to-help-start-block />
      <work-poligon-page-description />
      <to-help-start-block />
      <personal-page-description />
      <to-help-start-block />
      <order-patterns-page-description />
      <to-help-start-block />
      <system-exit-description />
      <to-help-start-block />
    </div>
  </div>
</template>


<script>
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import SystemEnterDescription from '@/components/Help/SystemEnterDescription';
  import MainMenuDescription from '@/components/Help/MainMenuDescription';
  import MainPageDescription from '@/components/Help/MainPageDescription';
  import WorkPoligonPageDescription from '@/components/Help/WorkPoligonPageDescription';
  import PersonalPageDescription from '@/components/Help/PersonalPageDescription';
  import JournalPageDescription from '@/components/Help/JournalPageDescription';
  import CreateOrderPageDescription from '@/components/Help/CreateOrderPageDescription';
  import OrderPatternsPageDescription from '@/components/Help/OrderPatternsPageDescription';
  import SystemExitDescription from '@/components/Help/SystemExitDescription';
  import FooterDescription from '@/components/Help/FooterDescription';
  import ToHelpStartBlock from '@/components/Help/ToHelpStartBlock';

  export default {
    name: 'dy58-help-page',

    components: {
      SystemEnterDescription,
      MainMenuDescription,
      MainPageDescription,
      WorkPoligonPageDescription,
      PersonalPageDescription,
      JournalPageDescription,
      CreateOrderPageDescription,
      OrderPatternsPageDescription,
      SystemExitDescription,
      FooterDescription,
      ToHelpStartBlock,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.help);

      const contentsItems = [
        {
          label: 'Вход в систему',
          url: '#system-enter-description',
          items: [],
        },
        {
          label: 'Главное меню системы',
          url: '#main-menu-description',
          items: [],
        },
        {
          label: 'Нижний колонтитул',
          url: '#footer-description',
          items: [],
        },
        {
          label: 'Главная страница',
          url: '#main-page-description',
          items: [
            { label: 'Боковое меню', url: '#side-menu-description' },
            { label: 'Запись о приеме-сдаче дежурства ДСП', url: '#dsp-take-pass-order-description' },
            { label: 'Таблица "Входящие уведомления"', url: '#incoming-notifications-description' },
            { label: 'Секция "Документы в работе"', url: '#orders-in-work-description' },
          ],
        },
        {
          label: 'Страница "Создать"',
          url: '#create-order-page-description',
          items: [],
        },
        {
          label: 'Страница "Журнал"',
          url: '#journal-page-description',
          items: [],
        },
        {
          label: 'Страница "Рабочий полигон"',
          url: '#work-poligon-page-description',
          items: [],
        },
        {
          label: 'Страница "Персонал"',
          url: '#personal-page-description',
          items: [],
        },
        {
          label: 'Страница "Шаблоны документов"',
          url: '#order-patterns-page-description',
          items: [],
        },
        {
          label: 'Выход из системы',
          url: '#system-exit-description',
          items: [],
        },
      ];

      return {
        contentsItems,
      };
    },
  }
</script>


<style lang="scss" scoped>
  .dy58-user-manual-text-block {
    background-color: #ffffff;
  }

  :deep(.p-menu) {
    border-radius: 0;
    background-color: var(--surface-b);
  }

  :deep(.p-menu-list > li) {
    background-color: var(--surface-6);
    cursor: pointer;
  }

  :deep(.p-menu-list > li:hover) {
    background-color: var(--surface-d) !important;
    border: 1px solid var(--primary-color);
    border-radius: 10px;
  }

  :deep(.p-menu-list > li > a:hover) {
    background-color: var(--surface-d) !important;
  }

  :deep(.p-menu .p-menuitem-link) {
    padding: 0;
  }

  :deep(.p-menuitem) {
    padding: 0.75rem 1rem 0.75rem 2rem;
  }
</style>
