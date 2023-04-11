<template>
  <Toast />

  <Dialog
    :header="!editExistingTakeDutyOrder ? 'Новая запись о приеме/сдаче дежурства' : 'Редактирование текущей записи о приеме/сдаче дежурства'"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <order-number
          :canEditOrderNumber="!editExistingTakeDutyOrder"
          :wrongOrderNumber="v$.number.$invalid && submitted"
          :value="v$.number.$model"
          @input="v$.number.$model = $event"
        />
        <small
          v-if="(v$.number.$invalid && submitted) || v$.number.$pending.$response"
          class="p-error"
        >
          Не указан/неверно указан номер документа
        </small>
      </div>

      <!-- ДАТА И ВРЕМЯ СОЗДАНИЯ РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="create-date-time-string" :class="{'p-error':v$.createDateTimeString.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дата и время создания</span>
        </label>
        <InputText
          id="create-date-time-string"
          disabled
          v-model="v$.createDateTimeString.$model"
          :class="{'p-invalid':v$.createDateTimeString.$invalid && submitted}"
        />
        <small
          v-if="(v$.createDateTimeString.$invalid && submitted) || v$.createDateTimeString.$pending.$response"
          class="p-error"
        >
          Не определены/неверно определены дата и время создания документа
        </small>
      </div>

      <!-- КТО И ВО СКОЛЬКО СДАЛ ДЕЖУРСТВО -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="pass-duty-user-post-fio" :class="{'p-error':v$.passDutyUserPostFIO.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дежурство сдал</span>
        </label>
        <Dropdown
          id="pass-duty-user-post-fio"
          v-model="v$.passDutyUserPostFIO.$model"
          :options="getCurrStationDSPUsers"
          optionLabel="userPostFIO"
          dataKey="userId"
          :class="{'p-invalid':v$.passDutyUserPostFIO.$invalid && submitted}"
        >
        </Dropdown>
        <small
          v-if="(v$.passDutyUserPostFIO.$invalid && submitted) || v$.passDutyUserPostFIO.$pending.$response"
          class="p-error"
        >
          Определите ФИО работника, сдавшего дежурство
        </small>
      </div>
      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="pass-duty-date-time" :class="{'p-error':v$.passDutyDateTime.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Время сдачи дежурства</span>
        </label>
        <Calendar
          id="pass-duty-date-time"
          :showTime="true"
          hourFormat="24"
          :hideOnDateTimeSelect="true"
          :showIcon="true"
          :manualInput="true"
          v-model="v$.passDutyDateTime.$model"
          :class="{'p-invalid':v$.passDutyDateTime.$invalid && submitted}"
        />
        <small
          v-if="(v$.passDutyDateTime.$invalid && submitted) || v$.passDutyDateTime.$pending.$response"
          class="p-error"
        >
          Не определено/неверно определено время сдачи дежурства
        </small>
      </div>

      <!-- СМЕННЫЙ ПЕРСОНАЛ, КОТОРЫЙ СДАЕТ ДЕЖУРСТВО -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <DataTable id="adjacent-station-pass-futy-shift" :value="state.usersThatPassDuty"
          v-model:expandedRows="expandedPassDutyUsersRows" responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column :expander="true" headerStyle="width:3rem" headerClass="dy58-take-pass-duty-personal-table-header" />
          <Column field="groupName"
            header="Персонал станции, сдающий дежурство"
            headerClass="dy58-take-pass-duty-personal-table-header"
          >
            <template #body="slotProps">
              {{ slotProps.data.groupName }} {{ `: ${usersThatPassDutyStrings[slotProps.data.groupCode] || ''}` }}
            </template>
          </Column>
          <template #expansion="slotProps">
            <DataTable
              :value="slotProps.data.items"
              dataKey="key"
              class="p-datatable-gridlines p-datatable-sm"
              :rowHover="true"
              responsiveLayout="scroll"
              selectionMode="single"
              v-model:selection="state.selectedPassDutyUsers[slotProps.data.groupCode]"
            >
              <Column field="userPostFIO" header="Работник" headerStyle="width:50%" bodyStyle="width:50%"></Column>
              <Column field="takeOrPassDutyTime" header="Дата-время сдачи дежурства">
                <template #body="slotProps">
                  <Calendar
                    :showTime="true"
                    hourFormat="24"
                    :hideOnDateTimeSelect="true"
                    :showIcon="true"
                    v-model="slotProps.data.takeOrPassDutyTime"
                  />
                </template>
              </Column>
              <template #footer>
                <small>
                  Для снятия выделения со строки таблицы необходимо удерживать клавишу Ctrl
                </small>
              </template>
            </DataTable>
          </template>
        </DataTable>
      </div>

      <!-- КТО И ВО СКОЛЬКО ПРИНЯЛ ДЕЖУРСТВО -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="take-duty-user-post-fio" :class="{'p-error':v$.takeDutyUserPostFIO.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дежурство принял</span>
        </label>
        <Dropdown
          id="take-duty-user-post-fio"
          v-model="v$.takeDutyUserPostFIO.$model"
          :options="getCurrStationDSPUsers"
          optionLabel="userPostFIO"
          dataKey="userId"
          :class="{'p-invalid':v$.takeDutyUserPostFIO.$invalid && submitted}"
        >
        </Dropdown>
        <small
          v-if="(v$.takeDutyUserPostFIO.$invalid && submitted) || v$.takeDutyUserPostFIO.$pending.$response"
          class="p-error"
        >
          Определите ФИО работника, принявшего дежурство
        </small>
      </div>
      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="take-duty-date-time" :class="{'p-error':v$.takeDutyDateTime.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Время приема дежурства</span>
        </label>
        <Calendar
          id="take-duty-date-time"
          :showTime="true"
          hourFormat="24"
          :hideOnDateTimeSelect="true"
          :showIcon="true"
          :manualInput="true"
          v-model="v$.takeDutyDateTime.$model"
          :class="{'p-invalid':v$.takeDutyDateTime.$invalid && submitted}"
        />
        <small
          v-if="(v$.takeDutyDateTime.$invalid && submitted) || v$.takeDutyDateTime.$pending.$response"
          class="p-error"
        >
          Не определено/неверно определено время приема дежурства
        </small>
      </div>

      <!-- СМЕННЫЙ ПЕРСОНАЛ, С КОТОРЫМ ДСП ЗАСТУПАЕТ НА ДЕЖУРСТВО -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <DataTable id="adjacent-station-take-futy-shift" :value="state.usersThatTakeDuty"
          v-model:expandedRows="expandedTakeDutyUsersRows" responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column :expander="true" headerStyle="width:3rem" headerClass="dy58-take-pass-duty-personal-table-header" />
          <Column field="groupName"
            header="Персонал станции, принимающий дежурство"
            headerClass="dy58-take-pass-duty-personal-table-header"
          >
            <template #body="slotProps">
              {{ slotProps.data.groupName }} {{ `: ${usersThatTakeDutyStrings[slotProps.data.groupCode] || ''}` }}
            </template>
          </Column>
          <template #expansion="slotProps">
            <DataTable
              :value="slotProps.data.items"
              dataKey="key"
              class="p-datatable-gridlines p-datatable-sm"
              :rowHover="true"
              responsiveLayout="scroll"
              selectionMode="single"
              v-model:selection="state.selectedTakeDutyUsers[slotProps.data.groupCode]"
            >
              <Column field="userPostFIO" header="Работник" headerStyle="width:50%" bodyStyle="width:50%"></Column>
              <Column field="takeOrPassDutyTime" header="Дата-время принятия дежурства">
                <template #body="slotProps">
                  <Calendar
                    :showTime="true"
                    hourFormat="24"
                    :hideOnDateTimeSelect="true"
                    :showIcon="true"
                    v-model="slotProps.data.takeOrPassDutyTime"
                  />
                </template>
              </Column>
              <template #footer>
                <small>
                  Для снятия выделения со строки таблицы необходимо удерживать клавишу Ctrl
                </small>
              </template>
            </DataTable>
          </template>
        </DataTable>
      </div>

      <!-- ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label for="additional-order-text" :class="{'p-error':v$.additionalOrderText.$invalid && submitted}">
          <span class="p-text-bold">Дополнительная информация</span>
        </label>
        <textarea
          id="additional-order-text"
          v-model="state.additionalOrderText"
          rows="5"
          :style="{ width: '100%', minWidth: '100%', maxWidth: '100%' }"
          class="p-component p-p-2"
        />
        <small
          v-if="(v$.additionalOrderText.$invalid && submitted) || v$.additionalOrderText.$pending.$response"
          class="p-error"
        >
          Проверьте правильность указания дополнительной информации
        </small>
      </div>

      <div class="p-col-12 p-mt-2 p-text-right">
        <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning p-mb-2">
          На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание документа текущего типа. Ожидаю ответ...
        </div>
        <Button type="submit" class="p-mr-2" label="Сохранить" :disabled="getDispatchOrdersBeingProcessed >= 1" />
        <Button class="p-button-secondary" label="Закрыть" @click="closeDialog" />
      </div>
    </form>
  </Dialog>
</template>


<script>
  import { computed, reactive, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useVuelidate } from '@vuelidate/core';
  import { required } from '@vuelidate/validators';
  import { useConfirm } from 'primevue/useconfirm';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
    SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
    OrderPatternElementType,
    OrderPatternElementType_Future,
  } from '@/constants/orderPatterns';
  import {
    DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS,
    ORDER_TEXT_SOURCE,
    FILLED_ORDER_INPUT_ELEMENTS,
  } from '@/constants/orders';
  import { useWatchCurrentDateTime } from '@/components/CreateOrders/NewOrder/watchCurrentDateTime';
  import isValidDateTime from '@/additional/isValidDateTime';
  import isNumber from '@/additional/isNumber';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { getOrderTextParamValue, getOrderTextParamValueToEdit } from '@/additional/getOrderTextParamValue';
  import { getUserPostFIOString } from '@/store/modules/personal/transformUserData';
  import OrderNumber from '@/components/CreateOrders/OrderNumber';
  import getStationWorkPlaceFullCode from '@/additional/getStationWorkPlaceFullCode';
  import { DISPATCH_ORDER_ACTION, EDIT_DISPATCHED_ORDER_ACTION } from '@/store/action-types';

  export default {
    name: 'dy58-create-dsp-take-duty-order-dialog',

    emits: ['close'],

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
    },

    components: {
      OrderNumber,
    },

    setup(props, { emit }) {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();
      const expandedPassDutyUsersRows = ref();
      const expandedTakeDutyUsersRows = ref();

      const orderType = ORDER_PATTERN_TYPES.ORDER;

      // Существующее (ранее изданное) распоряжение о принятии дежурства НА ДАННОМ РАБОЧЕМ МЕСТЕ
      const existingDSPTakeDutyOrder = computed(() => store.getters.getExistingDSPTakeDutyOrder);

      // Список пользователей из числа ДСП данного рабочего полигона, которые зарегистрированы на данном рабочем месте
      // (с которого производится издание текущего распоряжения)
      const getCurrStationDSPUsers = computed(() =>
        store.getters.getCurrStationDSPUsers.map((item) => ({
          userId: item.userId,
          userPostFIO: getUserPostFIOString({ post: item.post, name: item.name, fatherName: item.fatherName, surname: item.surname }),
        })));

      const state = reactive({
        dlgVisible: false,
        number: '',
        createDateTime: '',
        createDateTimeString: '',
        updateCreateDateTimeRegularly: true,
        passDutyUserPostFIO: null,
        passDutyDateTime: '',
        takeDutyUserPostFIO: null,
        takeDutyDateTime: '',
        additionalOrderText: null,
        // Списки пользователей данного рабочего полигона (станции), которые зарегистрированы на рабочих местах операторов
        // при ДСП (нужны для формирования списков персонала, принимающего и сдающего дежурство)
        usersThatTakeDuty: [],
        usersThatPassDuty: [],
        // Выбранные пользователи рабочих мест (которые будут фиругировать в распоряжении о приеме-сдаче дежурства)
        selectedTakeDutyUsers: {},
        selectedPassDutyUsers: {},
      });

      const takeDutyTimeNoLessPassDutyTime = (value) => {
        return value >= state.passDutyDateTime;
      };

      const rules = reactive({
        number: { required, isNumber },
        createDateTime: { required, isValidDateTime },
        createDateTimeString: { required },
        passDutyUserPostFIO: { required },
        passDutyDateTime: { required, isValidDateTime },
        takeDutyUserPostFIO: { required },
        takeDutyDateTime: { required, isValidDateTime, takeDutyTimeNoLessPassDutyTime },
        selectedTakeDutyUsers: {},
        selectedPassDutyUsers: {},
        additionalOrderText: {},
      });

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state, { $scope: false });

      const editExistingTakeDutyOrder = computed(() => store.getters.canEditExistingTakeDutyOrder);

      const initOrderNumber = () => {
        if (!editExistingTakeDutyOrder.value) {
          state.number = store.getters.getNextOrdersNumber(orderType);

        } else if (existingDSPTakeDutyOrder.value) {
          state.number = existingDSPTakeDutyOrder.value.number;

        } else {
          state.number = '';
        }
      };

      const initOrderCreateDateTime = () => {
        if (!editExistingTakeDutyOrder.value) {
          state.createDateTime = store.getters.getCurrDateTimeWithoutMilliseconds;
          state.createDateTimeString = store.getters.getCurrDateTimeString;

        } else if (existingDSPTakeDutyOrder.value) {
          state.createDateTime = existingDSPTakeDutyOrder.value.createDateTime;
          state.createDateTimeString = getLocaleDateTimeString(existingDSPTakeDutyOrder.value.createDateTime, true);

        } else {
          state.createDateTime = '';
          state.createDateTimeString = '';
        }
      };

      // Ищет объект пользователя текущего рабочего места, который соответствует указанному в запросе
      // параметру текста распоряжения
      const getCurrStationWorkPlaceUserObjectFromOrderText = (paramName, orderText) => {
        if (!paramName || !orderText || !orderText.length || !getCurrStationDSPUsers.value) {
          return null;
        }
        return getOrderTextParamValue(paramName, orderText);
      };

      const initOrderPassData = () => {
        if (!editExistingTakeDutyOrder.value) {
          if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
            const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
            if (prevValue) {
              state.passDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
            }
          } else {
            state.passDutyUserPostFIO = null;
          }
          state.passDutyDateTime = store.getters.getDefaultPassDutyTime;

        } else if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          if (prevValue) {
            state.passDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
          }
          state.passDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);
        } else {
          state.passDutyUserPostFIO = null;
          state.passDutyDateTime = store.getters.getDefaultPassDutyTime;
        }
      };

      const initOrderTakeData = () => {
        if (!editExistingTakeDutyOrder.value) {
          state.takeDutyUserPostFIO = !store.getters.getUserId ? null :
            {
              userId: store.getters.getUserId,
              userPostFIO: store.getters.getUserPostFIO({}),
            };
          state.takeDutyDateTime = store.getters.getLastTakeDutyTime;

        } else if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          if (prevValue) {
            state.takeDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
          }
          state.takeDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);

        } else {
          state.takeDutyUserPostFIO = null;
          state.takeDutyDateTime = '';
        }
      };

      /**
       * Пользователи на всех рабочих местах операторов при ДСП станции (информация, которая была получена от сервера).
       * Параметр time - время приема/сдачи дежурства (у всех пользователей в таблице выбора оно одинаково).
       */
      const defaultWorkPlacesUsers = (time) =>
        store.getters.getCurrStationDSPandOperatorUsersThatDoNotBelongToCurrWorkPlace.map((item) => ({
          ...item,
          items: item.items.map((el) => ({
            key: el.key,
            workPlaceId: el.workPlaceId, // обязательно! (понадобится в дальнейшем для формирования списка получателей всех действующих распоряжений на станции)
            placeTitle: store.getters.getCurrStationWorkPlaceNameById(el.workPlaceId),
            userId: el.userId,
            post: el.post, // обязательно! (-//-)
            name: el.name, // обязательно! (-//-)
            fatherName: el.fatherName, // обязательно! (-//-)
            surname: el.surname, // обязательно! (-//-)
            userPostFIO: getUserPostFIOString({ post: el.post, name: el.name, fatherName: el.fatherName, surname: el.surname }),
            takeOrPassDutyTime: time,
          })),
        }));

      const initTakeAndPassDutyStationShift = () => {
        // В первую очередь(!), устанавливаем весь персонал станции (всех рабочих мест, кроме текущего) -
        // делаем 2 копии массива (для определения тех лиц, которые принимают дежурство, и тех,
        // которые дежурство сдают)
        const defaultTakeDutyUsers = defaultWorkPlacesUsers(state.takeDutyDateTime);
        const defaultPassDutyUsers = defaultWorkPlacesUsers(state.passDutyDateTime);
        state.usersThatTakeDuty = defaultTakeDutyUsers;
        state.usersThatPassDuty = defaultPassDutyUsers;

        // Текст предыдущего распоряжения ДСП о приеме-сдаче дежурства
        const prevOrderText = existingDSPTakeDutyOrder.value ? existingDSPTakeDutyOrder.value.orderText : null;
        const userWorkPoligon = store.getters.getUserWorkPoligon;
        if (!prevOrderText || !userWorkPoligon) {
          return; // не найдена текущая запись о приеме-сдаче дежурства либо в ней нет текста
        }

        const getTakeOrPassDutyUserObject = (arr, userId, workPlaceId) => {
          if (!arr || !arr.length) {
            return null;
          }
          const workPlaceFullCode = getStationWorkPlaceFullCode(userWorkPoligon.code, workPlaceId);
          const usersGroup = arr.find((group) => group.groupCode === workPlaceFullCode);
          if (usersGroup && usersGroup.items && usersGroup.items.length) {
            return usersGroup.items.find((el) => el.userId === userId);
          }
          return null;
        };

        const addSelectedRecord = (selectedRecordsObject, groupCode, record) => {
          // Случай, когда на одном рабочем месте можно выбирать несколько работников
          /*if (selectedRecordsObject[groupCode]) {
            selectedRecordsObject[groupCode].push(record);
          } else {
            selectedRecordsObject[groupCode] = [record];
          }*/
          // 1 рабочее место = 1 работник
          selectedRecordsObject[groupCode] = record;
        };

        const prevTakeDutyPersonal = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_PERSONAL, existingDSPTakeDutyOrder.value.orderText.orderText);

        // Если необходимо отредактировать текущую запись о приеме-сдаче дежурства, то из нее нам необходимо
        // извлечь и установить ранее определенную информацию о персонале, который принимает и сдает дежурство
        if (editExistingTakeDutyOrder.value && existingDSPTakeDutyOrder.value) {
          // Устанавливаем персонал, который принимает дежурство
          if (prevTakeDutyPersonal instanceof Array) {
            prevTakeDutyPersonal.forEach((item) => {
              const existingUserObject = getTakeOrPassDutyUserObject(defaultTakeDutyUsers, item.userId, item.workPlaceId);
              if (existingUserObject) {
                if (item.takeOrPassDutyTime) {
                  existingUserObject.takeOrPassDutyTime = new Date(item.takeOrPassDutyTime);
                }
                addSelectedRecord(state.selectedTakeDutyUsers, getStationWorkPlaceFullCode(userWorkPoligon.code, item.workPlaceId), existingUserObject);
              }
            });
          }
          const prevPassDutyPersonal = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_PERSONAL, existingDSPTakeDutyOrder.value.orderText.orderText);
          // Устанавливаем персонал, который сдает дежурство
          if (prevPassDutyPersonal instanceof Array) {
            prevPassDutyPersonal.forEach((item) => {
              const existingUserObject = getTakeOrPassDutyUserObject(defaultPassDutyUsers, item.userId, item.workPlaceId);
              if (existingUserObject) {
                if (item.takeOrPassDutyTime) {
                  existingUserObject.takeOrPassDutyTime = new Date(item.takeOrPassDutyTime);
                }
                addSelectedRecord(state.selectedPassDutyUsers, getStationWorkPlaceFullCode(userWorkPoligon.code, item.workPlaceId), existingUserObject);
              }
            });
          }
        // Если будет создаваться новая запись о приеме-сдаче дежурства, то из предыдущей такой записи необходимо
        // извлечь информацию о персонале, который ранее принимал дежурство, и установить ее в качестве персонала,
        // сдающего дежурство, в новой записи о приеме-сдаче дежурства
        } else {
          // Устанавливаем персонал, который сдает дежурство (дата-время сдачи дежурства - как у сдающего дежурство ДСП)
          if (prevTakeDutyPersonal && prevTakeDutyPersonal instanceof Array) {
            prevTakeDutyPersonal.forEach((item) => {
              const existingUserObject = getTakeOrPassDutyUserObject(defaultPassDutyUsers, item.userId, item.workPlaceId);
              if (existingUserObject) {
                if (item.takeOrPassDutyTime) {
                  existingUserObject.takeOrPassDutyTime = store.getters.getLastTakeDutyTime;
                }
                addSelectedRecord(state.selectedPassDutyUsers, getStationWorkPlaceFullCode(userWorkPoligon.code, item.workPlaceId), existingUserObject);
              }
            });
          }
        }
      };

      const initAdditionalOrderText = () => {
        if (editExistingTakeDutyOrder.value && existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          state.additionalOrderText = getOrderTextParamValueToEdit(FILLED_ORDER_INPUT_ELEMENTS.NOTE, existingDSPTakeDutyOrder.value.orderText.orderText);
        } else {
          state.additionalOrderText = null;
        }
      };

      // Действия на показ/скрытие диалога
      watch(() => props.showDlg, (newVal) => {
        state.dlgVisible = newVal;
        if (newVal) {
          // Инициализация элементов формы диалога в зависимости от того, хочет пользователь
          // создать новое распоряжение либо отредактировать существующее
          initOrderNumber();
          initOrderCreateDateTime();
          state.updateCreateDateTimeRegularly = !editExistingTakeDutyOrder.value;
          initOrderPassData();
          initOrderTakeData();
          initTakeAndPassDutyStationShift();
          initAdditionalOrderText();
        } else {
          state.usersThatTakeDuty = [];
          state.usersThatPassDuty = [];
          state.selectedTakeDutyUsers = {};
          state.selectedPassDutyUsers = {};
          expandedPassDutyUsersRows.value = null;
          expandedTakeDutyUsersRows.value = null;
        }
      });

      // Отслеживаю изменение номера последнего изданного распоряжения заданного типа
      watch(() => store.getters.getNextOrdersNumber(orderType), (newVal) => state.number = newVal);

      // Изменение значения времени сдачи дежурства основным ДСП приводит к установке такого же
      // значения во всех полях сдачи и принятия дежурства на рабочих местах
      watch(() => state.passDutyDateTime, (newVal) => {
        state.takeDutyDateTime = newVal;
        state.usersThatPassDuty.forEach((group) => {
          if (group.items && group.items.length) {
            group.items.forEach((item) => item.takeOrPassDutyTime = newVal);
          }
        });
        state.usersThatTakeDuty.forEach((group) => {
          if (group.items && group.items.length) {
            group.items.forEach((item) => item.takeOrPassDutyTime = newVal);
          }
        });
      });

      // Для оперативного отображения даты-времени издания распоряжения при создании нового распоряжения
      useWatchCurrentDateTime({ state, props, store });

      const newNumberOverlayPanel = ref();
      const changeOrderNumber = (event) => {
        newNumberOverlayPanel.value.toggle(event);
      };

      const closeDialog = () => { emit('close') };

      const handleSubmit = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          showErrMessage('Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля');
          return;
        }
        confirm.require({
          message: 'Сохранить распоряжение?',
          header: 'Подтверждение действия',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            dispatchOrder();
          },
        });
      };

      const displayTakeOrPassUserString = (user) =>
        !user ? '' : `${user.userPostFIO} (${user.takeOrPassDutyTime ? getLocaleDateTimeString(new Date(user.takeOrPassDutyTime), false) : '?'})`;

      const getOrderTextObject = () => {
        // flattening arrays
        const selectedTakeDutyUsersArray = [].concat.apply([], Object.values(state.selectedTakeDutyUsers).filter((el) => el));
        const selectedPassDutyUsersArray = [].concat.apply([], Object.values(state.selectedPassDutyUsers).filter((el) => el));

        const orderText = [
          { type: OrderPatternElementType.TEXT, ref: null, value: `Дежурство принял${selectedTakeDutyUsersArray.length ? 'и:' : ''}` },
          {
            type: OrderPatternElementType_Future.OBJECT,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO,
            value: { userId: state.takeDutyUserPostFIO.userId, value: state.takeDutyUserPostFIO.userPostFIO },
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: '(' },
          {
            type: OrderPatternElementType.DATETIME,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_DATETIME,
            value: state.takeDutyDateTime,
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: `)${selectedTakeDutyUsersArray.length ? ',' : ''}` },
          { type: OrderPatternElementType.LINEBREAK, ref: null, value: null },
        ];

        if (selectedTakeDutyUsersArray.length) {
          orderText.push(
            {
              type: OrderPatternElementType_Future.OBJECTS_LIST,
              ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_PERSONAL,
              value: selectedTakeDutyUsersArray.map((el) => ({ ...el, value: displayTakeOrPassUserString(el) })),
            },
            { type: OrderPatternElementType.LINEBREAK, ref: null, value: null }
          );
        }

        orderText.push(
          { type: OrderPatternElementType.TEXT, ref: null, value: `Дежурство сдал${selectedPassDutyUsersArray.length ? 'и:' : ''}` },
          {
            type: OrderPatternElementType_Future.OBJECT,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_FIO,
            value: { userId: state.passDutyUserPostFIO.userId, value: state.passDutyUserPostFIO.userPostFIO },
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: '(' },
          {
            type: OrderPatternElementType.DATETIME,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_DATETIME,
            value: state.passDutyDateTime,
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: `)${selectedPassDutyUsersArray.length ? ',' : ''}` },
        );

        if (selectedPassDutyUsersArray.length || state.additionalOrderText) {
          orderText.push({ type: OrderPatternElementType.LINEBREAK, ref: null, value: null });
        }

        if (selectedPassDutyUsersArray.length) {
          orderText.push(
            {
              type: OrderPatternElementType_Future.OBJECTS_LIST,
              ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_PERSONAL,
              value: selectedPassDutyUsersArray.map((el) => ({ ...el, value: displayTakeOrPassUserString(el) })),
            }
          );
          if (state.additionalOrderText) {
            orderText.push({ type: OrderPatternElementType.LINEBREAK, ref: null, value: null });
          }
        }

        if (state.additionalOrderText) {
          orderText.push({
            type: OrderPatternElementType.TEXT,
            ref: FILLED_ORDER_INPUT_ELEMENTS.NOTE,
            value: state.additionalOrderText,
          });
        }

        return {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
          orderText,
        };
      };

      /**
       * Издание распоряжения (отправка на сервер).
       */
      const dispatchOrder = () => {
        if (!editExistingTakeDutyOrder.value) {
          // Издание нового распоряжения
          store.dispatch(DISPATCH_ORDER_ACTION, {
            type: orderType,
            number: +state.number,
            createDateTime: state.createDateTime,
            place: null,
            timeSpan: { start: state.takeDutyDateTime, end: null, tillCancellation: true },
            orderText: getOrderTextObject(),
            dncToSend: [],
            dspToSend: [], // не адресовать текущей станции!!! (иначе придется править бэкенд)
            ecdToSend: [],
            otherToSend: [],
            orderChainId: null,
            createdOnBehalfOf: null,
            showOnGID: false,
            specialTrainCategories: [SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN],
            idOfTheOrderToCancel: existingDSPTakeDutyOrder.value ? existingDSPTakeDutyOrder.value._id : null,
          });
        } else if (existingDSPTakeDutyOrder.value) {
          // Редактирование распоряжения
          store.dispatch(EDIT_DISPATCHED_ORDER_ACTION, {
            type: orderType,
            id: existingDSPTakeDutyOrder.value._id,
            timeSpan: { start: state.takeDutyDateTime, end: null, tillCancellation: true },
            orderText: getOrderTextObject(),
          });
        }
      };

      /**
       * Для отображения результата операции издания распоряжения (отправки на сервер).
       */
      watch(() => store.getters.getDispatchOrderResult, (newVal) => {
        if (!newVal || newVal.orderType !== orderType) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
          // если диалог не закрывать, то нужно раскомментировать выше строки для обновления номера распоряжения
          closeDialog();
        } else {
          showErrMessage(newVal.message);
        }
      });

      /**
       * Для отображения результата операции редактирования распоряжения (на сервере).
       */
      watch(() => store.getters.getEditDispatchedOrderResult, (newVal) => {
        if (!newVal || newVal.orderType !== orderType) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
          closeDialog();
        } else {
          showErrMessage(newVal.message);
        }
      });

      return {
        state,
        expandedPassDutyUsersRows,
        expandedTakeDutyUsersRows,
        submitted,
        v$,
        editExistingTakeDutyOrder,
        getCurrStationDSPUsers,
        newNumberOverlayPanel,
        changeOrderNumber,
        closeDialog,
        handleSubmit,
        usersThatTakeDutyStrings: computed(() => {
          const resObj = {};
          Object.entries(state.selectedTakeDutyUsers).forEach((item) => {
            // Случай, когда на одном рабочем месте можно выбирать несколько работников
            //resObj[item[0]] = item[1].map((el) => displayTakeOrPassUserString(el)).join(', ');
            // 1 рабочее место = 1 работник
            resObj[item[0]] = displayTakeOrPassUserString(item[1]);
          });
          return resObj;
        }),
        usersThatPassDutyStrings: computed(() => {
          const resObj = {};
          Object.entries(state.selectedPassDutyUsers).forEach((item) => {
            // Случай, когда на одном рабочем месте можно выбирать несколько работников
            //resObj[item[0]] = item[1].map((el) => displayTakeOrPassUserString(el)).join(', ');
            // 1 рабочее место = 1 работник
            resObj[item[0]] = displayTakeOrPassUserString(item[1]);
          });
          return resObj;
        }),
        // Количество распоряжений текущего типа, для которых в настоящее время запущен процесс издания (сохранения на сервере)
        getDispatchOrdersBeingProcessed: computed(() => store.getters.getDispatchOrdersBeingProcessed(orderType)),
      };
    },
  };
</script>


<style lang="scss" scoped>
  :deep(.dy58-take-pass-duty-personal-table-header) {
    background-color: var(--surface-b) !important;
  }

  :deep(.p-datatable-thead) {
    visibility: collapse;
  }
</style>
