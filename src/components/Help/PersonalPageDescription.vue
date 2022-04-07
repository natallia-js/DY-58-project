<template>
  <div>
    <h3 id="personal-page-description" class="dy58-help-contents-item">Страница "Персонал"</h3>
    <p class="dy58-help-paragraph">
      На данной странице представлена информация о персонале рабочего полигона и связанных рабочих полигонов
      (см. раздел "Страница 'Рабочий полигон'"). Информация о персонале подгружается в момент входа пользователя
      в систему после того как будет загружена информация о структуре рабочего полигона и связанных с ним
      рабочих полигонов.
    </p>
    <to-help-start-block />
  </div>
</template>

<script>
  import ToHelpStartBlock from './ToHelpStartBlock';

  export default {
    name: 'dy58-personal-page-description',

    components: {
      ToHelpStartBlock,
    },
  }
</script>
