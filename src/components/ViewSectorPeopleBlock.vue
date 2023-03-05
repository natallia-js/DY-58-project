<template>
  <div v-if="peopleArray.length === 0">
    -
  </div>
  <div v-else>
    <p
      v-for="user of getSortedUsersData(peopleArray, ifStationPeople)"
      :key="user._id"
      :class="[
        'p-ml-4',
        { 'dy58-online-onduty': user.online && user.onDuty },
        { 'dy58-online-notonduty': user.online && !user.onDuty },
        { 'dy58-error-message': !user.appsCredentials || user.appsCredentials.length == 0 }
      ]"
    >
      {{ user.userStringInfo }}
    </p>
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
