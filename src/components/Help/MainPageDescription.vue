<template>
  <div>
    <h3 id="main-page-description" class="dy58-help-contents-item">Главная страница</h3>

    <h4 id="side-menu-description" class="dy58-help-contents-item">Боковое меню</h4>
    <p class="dy58-help-paragraph">
      Боковое меню предназначено для отображения статистики по оперативной информации, перехода к форме
      создания (редактирования) документа о приеме-сдаче дежурства и редактирования настроек системы.
    </p>
    <p class="dy58-help-paragraph">
      Пункты меню:
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/takePassDuty.png')" class="dy58-help-img-style" />
      - переход на форму создания циркулярного распоряжения (в случае ДНЦ)
      либо создание записи о приеме-сдаче дежурства (в случае ДСП);
      только для пользователя, находящегося на дежурстве!
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/editTakePassDuty.png')" class="dy58-help-img-style" />
      - только для находящегося на дежурстве ДСП: переход к форме редактирования текущей записи
      о приеме-сдаче дежурства (созданной текущим пользователем)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/incomingOrdersPerShift.png')" class="dy58-help-img-style" />
      - количество документов, созданных и адресованных текущему рабочему полигону с начала приема дежурства
      текущим пользователем (если на значке нет бейджа с числом, то количество таких документов равно нулю)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/notConfirmed.png')" class="dy58-help-img-style" />
      - количество документов в таблице "Входящие уведомления" (если на значке нет бейджа с числом, то
      входящих документов нет)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/ordersInWork.png')" class="dy58-help-img-style" />
      - количество документов в таблице "Документы в работе" (если на значке нет бейджа с числом, то
      документов, находящихся в работе, нет)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/DR.png')" class="dy58-help-img-style" />
      - только для ДНЦ: количество документов с отметкой "ДР" (если на значке нет бейджа с числом,
      то количество таких документов равно нулю)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/N.png')" class="dy58-help-img-style" />
      - только для ДНЦ: количество документов с отметкой "Н" (если на значке нет бейджа с числом, то
      количество таких документов равно нулю)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/P.png')" class="dy58-help-img-style" />
      - только для ДНЦ: количество документов с отметками "ПВ", "ПД", "ПВПД" (если на значке нет бейджа с числом,
      то количество таких документов равно нулю)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/VM.png')" class="dy58-help-img-style" />
      - только для ДНЦ: количество документов с отметкой "ВМ" (если на значке нет бейджа с числом, то
      количество таких документов равно нулю)
    </p>
    <p class="dy58-help-paragraph">
      <img :src="require('@/assets/img/settings.png')" class="dy58-help-img-style" />
      - переход к форме редактирования настроек системы
    </p>
    <to-help-start-block />

    <h4 id="incoming-notifications-description" class="dy58-help-contents-item">Таблица "Входящие уведомления"</h4>
    <p class="dy58-help-paragraph">
      Таблица "Входящие уведомления" предназначена для отображения документов, созданных на рабочем полигоне,
      отличном от текущего, и адресованных текущему рабочему полигону.
      Каждая запись в первом столбце таблицы содержит значок в виде песочных часов. Если он черного цвета
      <img :src="require('@/assets/img/hourglass_black.png')" class="dy58-help-img-style-nobgcolor" />,
      то с момента прихода документа прошло не более 5 минут. Если значок красного цвета
      <img :src="require('@/assets/img/hourglass_red.png')" class="dy58-help-img-style-nobgcolor" />,
      то документ пришел более 5 минут назад.
    </p>
    <to-help-start-block />

    <h4 id="orders-in-work-description" class="dy58-help-contents-item">Таблица "Документы в работе"</h4>
    <p class="dy58-help-paragraph">
      Таблица "Документы в работе" предназначена для отображения оперативных документов текущего рабочего полигона.
    </p>
    <to-help-start-block />
  </div>
</template>

<script>
  import ToHelpStartBlock from './ToHelpStartBlock';

  export default {
    name: 'dy58-main-page-description',

    components: {
      ToHelpStartBlock,
    },
  }
</script>
