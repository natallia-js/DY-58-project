<template>
  <div v-if="peopleArray.length === 0">
    -
  </div>
  <div v-else>
    <div
      v-for="user of getSortedUsersData(peopleArray, ifStationPeople)"
      :key="user._id"
      :class="[
        'p-ml-4',
        { 'dy58-error-message': !user.appsCredentials || user.appsCredentials.length == 0 }
      ]"
    >
      <!-- отображение значков, которые указывают на online-статусы "на дежурстве" / "не на дежурстве" текущего пользователя
      (например, если пользователь зашел с одного браузера одного рабочего места, то количество значков = 1; если пользователь
      зашел с двух разных рабочих мест либо браузеров, то значков уже будет два) -->
      <span
        v-for="onlineStatus of user.onlineStatuses"
        :key="onlineStatus.clientIP + onlineStatus.userAgent"
        :class="[
          'dy58-online-marker',
          { 'dy58-online-onduty-fill': onlineStatus.onDuty },
          { 'dy58-online-notonduty-fill': !onlineStatus.onDuty },
        ]"
      />
      {{ user.userStringInfo }}
      <!-- отображение online-статусов "на дежурстве" / "не на дежурстве" текущего пользователя, а также полномочия, с которым он
      вошел в систему, ip-адреса, с которого он вошел, а также наименования серии браузеров, которой принадлежит тот браузер, с
      которого пользователь вошел в систему) -->
      <p
        v-for="onlineStatus of user.onlineStatuses"
        :key="onlineStatus.clientIP + onlineStatus.userAgent"
        :class="[
          'p-ml-4',
          { 'dy58-online-onduty-color': onlineStatus.onDuty },
          { 'dy58-online-notonduty-color': !onlineStatus.onDuty },
        ]"
      >
        - вошел как {{ onlineStatus.currentCredential }} <!--({{ onlineStatus.clientIP }}; {{ onlineStatus.userAgent }}) -->
      </p>
    </div>
  </div>
</template>

<script>
  import getSortedUsersData from '@/additional/getSortedUsersData';

  export default {
    name: 'dy58-view-sector-people-block',

    props: {
      peopleArray: {
        type: Array,
        required: true,
      },
      ifStationPeople: {
        type: Boolean,
        required: true,
      },
    },

    setup() {
      return {
        getSortedUsersData,
      };
    },
  }
</script>
