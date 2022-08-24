<template>
  <Dialog
    :header="`Выберите получателя ${sectorName || ''}`"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:500px"
    :modal="true"
    @hide="closeDialog"
  >
    <Listbox
      v-model="selectedUser"
      :options="personal"
      optionValue="value"
      :multiple="false"
    >
      <template #option="slotProps">
        <div>
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </Listbox>
    <!--
    <MultiSelect
      style="width:100%"
      :options="personal"
      optionLabel="label"
      optionValue="value"
      dataKey="value"
      v-model="selectedPeople"
    />-->
    <template #footer>
      <Button
        v-if="selectedUser && (!selectedPerson || selectedUser.id !== selectedPerson.id)"
        label="Выбрать"
        @click="chooseUser"
        class="p-mt-2"
      />
      <Button v-if="selectedPerson" label="Отменить текущий выбор" @click="unChooseUser" class="p-mt-2" />
      <Button label="Отмена" @click="closeDialog" class="p-mt-2" />
      <!--<Button
        v-if="selectedPeople"
        label="Выбрать"
        @click="choosePeople"
        class="p-mt-2"
      />
      <Button label="Отмена" @click="closeDialog" class="p-mt-2" />-->
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { ADD_OTHER_GET_ORDER_RECORD } from '@/store/mutation-types';

  export default {
    name: 'dy58-choose-other-personal-dialog',

    emits: ['input','close'],

    data() {
      return {
        dlgVisible: false,
        selectedUser: null,
        //dataToSelect: null,
        //selectedPeople: null,
      };
    },

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
      personal: {
        type: Array,
        required: true,
      },
      selectedPerson: {
        type: Object,
        required: false,
      },
      /*prevSelectedPeople: {
        type: Array,
        required: false,
      },*/
      sectorName: {
        type: String,
      },
    },

    computed: {
      ...mapGetters([
        'getStructuralDivisions',
      ]),
    },

    watch: {
      showDlg: function(val) {
        this.dlgVisible = val;
        if (val) {
          //this.selectedPeople = this.prevSelectedPeople;
          this.selectedUser = this.selectedPerson;
          console.log(this.personal)
        }
      },
    },

    methods: {
      chooseUser() {
        if (this.selectedUser) {
          const person = this.getStructuralDivisions.find((el) => el.additionalId === this.selectedUser);
          if (person) {
            this.$store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...person, existingStructuralDivision: true });
          }
        }
        /*this.$store.commit(SET_USER_CHOSEN_STATUS, {
          userId: this.selectedUser.id,
          chooseUser: true,
          workPoligonType: this.workPoligonType,
          workPoligonId: this.sectorId,
        });*/
        this.closeDialog();
      },

      unChooseUser() {
        /*this.$store.commit(SET_USER_CHOSEN_STATUS, {
          userId: this.selectedUser.id,
          chooseUser: false,
          workPoligonType: this.workPoligonType,
          workPoligonId: this.sectorId,
        });*/
        this.selectedUser = null;
        this.closeDialog();
      },

      /*choosePeople() {
        this.$emit('input', this.selectedPeople);
        this.closeDialog();
      },*/

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
