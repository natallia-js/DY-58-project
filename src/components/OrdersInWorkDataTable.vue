<template>
  <div>
    <ConfirmPopup group="confirmDelStationReceiver"></ConfirmPopup>

    <ShowIncomingOrderDlg
      :showDlg="state.showIncomingOrderDlg"
      dlgTitle="Информация о рабочем распоряжении"
      :order="state.chosenOrder"
      :orderNeedsToBeConfirmed="false"
      @close="hideOrderInfo"
    >
    </ShowIncomingOrderDlg>

    <DataTable
      :value="getWorkingOrders"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      dataKey="id"
      :scrollable="true" scrollHeight="flex"
      v-model:expandedRows="state.expandedRows"
    >
      <Column
        :expander="true"
        :style="{ minWidth: getExpanderColumnObject.width, textAlign: getExpanderColumnObject.align, alignItems: 'center', justifyContent: 'center' }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      />

      <Column v-for="col of getWorkMessTblColumnsExceptExpander"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ minWidth: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div
            style="width:100%;height:100%"
            :class="[{
              'dy58-order-being-deleted': getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId),
            }]"
          >
            <div
              v-if="[getWorkMessTblColumnsTitles.seqNum, getWorkMessTblColumnsTitles.orderNum].includes(col.field)"
              style="text-align:center"
              :class="[{
                'dy58-order-dispatched-on-this-global-poligon':
                  getUserWorkPoligon && slotProps.data.senderWorkPoligon &&
                  getUserWorkPoligon.type === slotProps.data.senderWorkPoligon.type &&
                  String(getUserWorkPoligon.code) === String(slotProps.data.senderWorkPoligon.id)
              }]"
            >
              <span v-if="col.field === getWorkMessTblColumnsTitles.orderNum && !slotProps.data.sendOriginal">
                {{ slotProps.data[col.field] }}<br/><span class="dy58-order-copy">копия</span>
              </span>
              <span v-else>
                {{ slotProps.data[col.field] }}
              </span>
            </div>
            <!-- столбцы данных -->
            <span v-else-if="![
              getWorkMessTblColumnsTitles.expander,
              getWorkMessTblColumnsTitles.state,
              getWorkMessTblColumnsTitles.orderReceiveStatus].includes(col.field)"
            >
              {{ slotProps.data[col.field] }}
            </span>
            <!-- столбец статуса -->
            <div v-else-if="col.field === getWorkMessTblColumnsTitles.orderReceiveStatus">
              <div v-if="isDSP_or_DSPoperator">
                <p v-if="slotProps.data[col.field].notDeliveredNotConfirmed > 0 || slotProps.data[col.field].notDeliveredNotConfirmedOnStation > 0">
                  <span class="p-mr-2">Не доставлено:</span>
                  <Badge class="dy58-not-delivered-order" :value="`${slotProps.data[col.field].notDeliveredNotConfirmed}/${slotProps.data[col.field].notDeliveredNotConfirmedOnStation}`"></Badge>
                </p>
                <p v-if="slotProps.data[col.field].deliveredButNotConfirmed > 0 || slotProps.data[col.field].deliveredButNotConfirmedOnStation > 0">
                  <span class="p-mr-2">Не подтверждено:</span>
                  <Badge class="dy58-not-confirmed-order" :value="`${slotProps.data[col.field].deliveredButNotConfirmed}/${slotProps.data[col.field].deliveredButNotConfirmedOnStation}`"></Badge>
                </p>
              </div>
              <div v-else>
                <p v-if="slotProps.data[col.field].notDeliveredNotConfirmed > 0">
                  <span class="p-mr-2">Не доставлено:</span>
                  <Badge class="dy58-not-delivered-order" :value="slotProps.data[col.field].notDeliveredNotConfirmed"></Badge>
                </p>
                <p v-if="slotProps.data[col.field].deliveredButNotConfirmed > 0">
                  <span class="p-mr-2">Не подтверждено:</span>
                  <Badge class="dy58-not-confirmed-order" :value="slotProps.data[col.field].deliveredButNotConfirmed"></Badge>
                </p>
              </div>
            </div>
            <!-- столбец состояния и действий -->
            <div v-else-if="col.field === getWorkMessTblColumnsTitles.state">
              <!-- вместо кнопок действий пользователя над распоряжением отображаем статус ожидания,
              если распоряжение "занято" и над ним нельзя выполнять каких-либо действий -->
              <i v-if="!canUserPerformAnyActionOnOrder(slotProps.data.id)"
                class="pi pi-spin pi-check-circle"
              ></i>
              <!-- кнопки допустимых действий над распоряжением -->
              <div v-else>
                <div class="p-mb-1">
                  <Button
                    icon="pi pi-ellipsis-h"
                    class="p-button-info p-button-sm dy58-order-action-button"
                    v-tooltip.bottom="'Подробнее'"
                    @click="showOrderInfo(slotProps.data)"
                  />
                </div>
                <div v-if="canOrdersChainBeDeleted(slotProps.data.id)" class="p-mb-1">
                  <Button
                    icon="pi pi-times"
                    class="p-button-secondary p-button-sm dy58-order-action-button"
                    v-tooltip.bottom="slotProps.data.chainMembersNumber > 1 ? 'Не показывать цепочку' : 'Не показывать'"
                    @click="deleteOrdersChain(slotProps.data.orderChainId)"
                  />
                </div>
                <div v-if="canDispatchOrdersConnectedToGivenOrder(slotProps.data.id) &&
                  createRelativeOrderContextMenuItems(slotProps.data.id) &&
                  createRelativeOrderContextMenuItems(slotProps.data.id).length"
                >
                  <TieredMenu
                    :ref="`createOrderMenu${slotProps.data.id}`"
                    :model="createRelativeOrderContextMenuItems(slotProps.data.id)"
                    :popup="true"
                    :id="`overlay_tmenu${slotProps.data.id}`"
                  />
                  <Button
                    icon="pi pi-file"
                    class="p-button-success p-button-sm dy58-order-action-button"
                    v-tooltip.bottom="'Создать'"
                    @click="(event) => $refs[`createOrderMenu${slotProps.data.id}`].toggle(event)"
                    aria-haspopup="true"
                    :aria-controls="`overlay_tmenu${slotProps.data.id}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-grid" style="width:100%;background:var(--dy58-expand-row-bg-color);margin:0;">

          <!-- Текст распоряжения -->

          <div class="p-col">
            <div v-html="slotProps.data.orderText"></div>
            <div><b>Передал:</b> {{ `${slotProps.data.post} ${slotProps.data.fio} ${slotProps.data.place}` }}</div>
            <div v-if="slotProps.data.assertDateTime">
              <b>Утверждение:</b> {{ slotProps.data.assertDateTime }}
            </div>
          </div>

          <!-- Адресаты распоряжения -->

          <div class="p-col">

            <!-- Если таблица основных адресатов распоряжения на глобальных рабочих полигонах пуста, не отображаем ее -->

            <div v-if="slotProps.data.receivers && slotProps.data.receivers.length">
              <p>Адресаты:</p>
              <DataTable :value="slotProps.data.receivers">
                <Column v-for="col2 of getWorkMessReceiversTblColumns"
                  :field="col2.field"
                  :header="col2.title"
                  :key="col2.field"
                  :style="{ width: col2.width, }"
                  headerClass="dy58-table-header-cell-class"
                  bodyClass="dy58-table-content-cell-class dy58-send-table-data-cell"
                >
                  <template #body="slotProps2">
                    <!-- правило отображения данных всех столбцов, кроме столбца с датой подтверждения распоряжения -->
                    <div v-if="col2.field !== getWorkMessReceiversTblColumnsTitles.confirmDateTime"
                      style="width:100%"
                      :class="[
                        {'dy58-not-delivered-order': !slotProps2.data.deliverDateTime && !slotProps2.data.confirmDateTime},
                        {'dy58-not-confirmed-order': slotProps2.data.deliverDateTime && !slotProps2.data.confirmDateTime},
                      ]"
                    >
                      <span v-if="col2.field === getWorkMessReceiversTblColumnsTitles.place && !slotProps2.data.sendOriginal">
                        {{ slotProps2.data[col2.field] }}<br/>(<span class="dy58-order-copy">копия</span>)
                      </span>
                      <span v-else>
                        {{ slotProps2.data[col2.field] }}
                      </span>
                    </div>
                    <!-- правило отображения информации в столбце с датой подтверждения распоряжения -->
                    <div v-else>
                      <!-- если дата подтверждения указана, то отображаем ее -->
                      <span v-if="slotProps2.data[col2.field]">
                        {{ getDateTimeString(slotProps2.data[col2.field]) }}
                      </span>
                      <!-- в противном случае отображаем кнопку подтверждения (если подтверждение возможно) -->
                      <Button
                        v-else-if="canOrderBeConfirmedFor(slotProps.data)"
                        icon="pi pi-check"
                        class="p-button-info p-button-sm dy58-order-action-button"
                        v-tooltip="'Подтвердить'"
                        @click="confirmOrderForOthers($event, slotProps.data.id, [{
                          workPoligonType: slotProps2.data.type,
                          workPoligonId: slotProps2.data.id,
                          post: slotProps2.data.post,
                          fio: slotProps2.data.fio,
                        }])"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>

              <!-- Если распоряжение не может быть подтверждено за всех его неподтвержденных адресатов
              ввиду его "занятости", отображаем состояние прогресса -->
              <div v-if="!canUserPerformAnyActionOnOrder(slotProps.data.id)"
                style="text-align:right"
              >
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <!-- Отображаем кнопку подтверждения распоряжения за всех, если есть хотя бы одна неподтвержденная
              запись в таблице -->
              <div v-else-if="canOrderBeConfirmedFor(slotProps.data) &&
                getOrderUnconfirmedWorkPoligons(slotProps.data.receivers).length"
                style="text-align:right"
              >
                <Button
                  label="Подтвердить все"
                  class="p-button-primary p-button-text"
                  @click="confirmOrderForOthers($event, slotProps.data.id,
                    getOrderUnconfirmedWorkPoligons(slotProps.data.receivers).map((item) => ({
                      workPoligonType: item.type,
                      workPoligonId: item.id,
                      post: item.post,
                      fio: item.fio,
                    })))"
                />
              </div>
              <br />
            </div>

            <div v-if="getOrderOtherUnconfirmedWorkPoligons(slotProps.data.otherReceivers).length">
              <div>
                Не подтверждено иными адресатами: {{ getOrderOtherUnconfirmedWorkPoligons(slotProps.data.otherReceivers).length }}
              </div>
              <Button
                label="Подтвердить"
                class="p-button-primary p-button-text"
                @click="confirmOrderForOtherReceivers($event, slotProps.data.id)"
              />
              <br />
            </div>

            <!-- Блок получателей распоряжения на станции будет отображен только в том случае, если присутствует
            хотя бы одна запись в таблице получателей на станции. Это автоматически означает, что данная информация
            будет отображаться только ДСП и Оператору при ДСП -->

            <div v-if="slotProps.data.stationReceivers && slotProps.data.stationReceivers.length">
              <p>Получатели на станции:</p>
              <DataTable :value="slotProps.data.stationReceivers">
                <Column v-for="col3 of getWorkMessStationReceiversTblColumns"
                  :field="col3.field"
                  :header="col3.title"
                  :key="col3.field"
                  :style="{ width: col3.width, }"
                  headerClass="dy58-table-header-cell-class"
                  bodyClass="dy58-table-content-cell-class dy58-send-table-data-cell"
                >
                  <template #body="slotProps3">
                    <!-- правило отображения данных всех столбцов, кроме столбца с датой подтверждения распоряжения -->
                    <div v-if="col3.field !== getWorkMessStationReceiversTblColumnsTitles.confirmDateTime"
                      style="width:100%"
                      :class="[
                        {'dy58-not-delivered-order': !slotProps3.data.deliverDateTime && !slotProps3.data.confirmDateTime},
                        {'dy58-not-confirmed-order': slotProps3.data.deliverDateTime && !slotProps3.data.confirmDateTime},
                      ]"
                    >
                      {{ slotProps3.data[col3.field] }}
                    </div>
                    <!-- правило отображения информации в столбце с датой подтверждения распоряжения -->
                    <div v-else>
                      <!-- если дата подтверждения указана, то отображаем ее -->
                      <div v-if="slotProps3.data[col3.field]">
                        {{ getDateTimeString(slotProps3.data[col3.field]) }}
                      </div>
                      <!-- в противном случае отображаем кнопки подтверждения и удаления (если данные операции возможны);
                      удалить адресата возможно только в том случае, если он не успел подтвердить данное распоряжение -->
                      <div v-else class="p-d-flex p-flex-row p-flex-wrap">
                        <Button
                          v-if="canOrderBeConfirmedForOnStation(slotProps.data)"
                          icon="pi pi-check"
                          class="p-button-info p-button-sm dy58-order-action-button p-m-1"
                          v-tooltip="'Подтвердить'"
                          @click="confirmOrderForOthers($event, slotProps.data.id, [{
                            workPoligonType: slotProps3.data.type,
                            workPoligonId: slotProps3.data.id,
                            workPlaceId: slotProps3.data.workPlaceId,
                            post: slotProps3.data.post,
                            fio: slotProps3.data.fio,
                          }])"
                        />
                        <Button
                          v-if="canOrderBeDeletedStationWorkPlaceReceiver(slotProps.data)"
                          icon="pi pi-times"
                          class="p-button-secondary p-button-sm dy58-order-action-button p-m-1"
                          v-tooltip="'Удалить'"
                          @click="deleteOrderStationWorkPoligon($event, slotProps.data.id, slotProps3.data.workPlaceId)"
                        />
                      </div>
                    </div>
                  </template>
                </Column>
              </DataTable>
              <!-- Если распоряжение не может быть подтверждено за всех его неподтвержденных адресатов
              на станции ввиду его "занятости", отображаем состояние прогресса -->
              <div v-if="!canUserPerformAnyActionOnOrder(slotProps.data.id)"
                style="text-align:right"
              >
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <!-- Отображаем кнопку подтверждения распоряжения за всех на станции, если есть хотя бы
              одна неподтвержденная запись в таблице -->
              <div v-else-if="canOrderBeConfirmedForOnStation(slotProps.data) &&
                getOrderUnconfirmedStationWorkPoligons(slotProps.data.stationReceivers).length"
                style="text-align:right"
              >
                <Button
                  label="Подтвердить все"
                  class="p-button-primary p-button-text"
                  @click="confirmOrderForOthers($event, slotProps.data.id,
                    getOrderUnconfirmedStationWorkPoligons(slotProps.data.stationReceivers).map((item) => ({
                      workPoligonType: item.type,
                      workPoligonId: item.id,
                      workPlaceId: item.workPlaceId,
                      post: item.post,
                      fio: item.fio,
                    })))"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

    </DataTable>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useConfirm } from 'primevue/useconfirm';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import ShowIncomingOrderDlg from '@/components/ShowIncomingOrderDlg';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER,
    CLEAR_ALL_CONFIRM_ORDERS_FOR_OTHERS_RESULTS_SEEN_BY_USER,
    SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
    CLEAR_ALL_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
  } from '@/store/mutation-types';

  export default {
    name: 'dy58-orders-in-work-data-table',

    components: {
      ShowIncomingOrderDlg,
    },

    setup() {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        expandedRows: [],
        showIncomingOrderDlg: false,
        chosenOrder: null,
      });

      const getWorkMessTblColumns = computed(() => store.getters.getWorkMessTblColumns);
      const getWorkMessTblColumnsTitles = computed(() => store.getters.getWorkMessTblColumnsTitles);

      const getWorkMessTblColumnsExceptExpander = computed(() =>
        getWorkMessTblColumns.value.filter((el) => el.field !== getWorkMessTblColumnsTitles.value.expander));

      const getExpanderColumnObject = computed(() =>
        getWorkMessTblColumns.value.find((el) => el.field === getWorkMessTblColumnsTitles.value.expander));

      const getDeleteOrdersChainAction = computed(() => store.getters.getDeleteOrdersChainAction);
      const getCreateRelativeOrderContextMenu = computed(() => store.getters.getCreateRelativeOrderContextMenu);

      const createRelativeOrderContextMenuItems = computed(() =>
        (orderId) => getCreateRelativeOrderContextMenu.value(orderId)
      );

      const showOrderInfo = (order) => {
        state.chosenOrder = order;
        state.showIncomingOrderDlg = true;
      };

      const hideOrderInfo = () => {
        state.chosenOrder = null;
        state.showIncomingOrderDlg = false;
      };

      const deleteOrdersChain = (chainId) => {
        getDeleteOrdersChainAction.value(chainId, confirm);
      };

      const getDateTimeString = (datetime, showSeconds = false) => {
        return getLocaleDateTimeString(datetime, showSeconds);
      };

      /**
       * Значение параметра confirmWorkPoligons - массив объектов с информацией о рабочих полигонах / рабочих
       * местах на станции, за которые необходимо подтвердить распоряжение.
       */
      const confirmOrderForOthers = (event, orderId, confirmWorkPoligons) => {
        if (confirmWorkPoligons && confirmWorkPoligons.length) {
          confirm.require({
            target: event.currentTarget,
            group: 'confirmDelStationReceiver',
            message: `Подтвердить ${confirmWorkPoligons.length === 1 ? '' : 'неподтвержденные записи'}?`,
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
              store.dispatch('confirmOrderForOthers', { orderId, confirmWorkPoligons });
            },
          });
        }
      };

      /**
       * Для подтверждения распоряжения за "Иных" адресатов.
       */
      const confirmOrderForOtherReceivers = (event, orderId) => {
        confirm.require({
          target: event.currentTarget,
          group: 'confirmDelStationReceiver',
          message: 'Подтвердить за иных адресатов?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            store.dispatch('confirmOrderForOtherReceivers', orderId);
          },
        });
      };

      /**
       * Для заданного списка исходных (указанных явно пользователем при создании) адресатов распоряжения
       * возвращает массив таких адресатов, для которых не было подтверждения получения данного распоряжения.
       */
      const getOrderUnconfirmedWorkPoligons = (receivers) => {
        return receivers ? receivers.filter((el) => !el.confirmDateTime) : [];
      };

      /**
       * Для заданного списка исходных (указанных явно пользователем при создании) иных адресатов распоряжения
       * возвращает массив таких адресатов, для которых не было подтверждения получения данного распоряжения.
       */
      const getOrderOtherUnconfirmedWorkPoligons = (otherReceivers) => {
        return otherReceivers ? otherReceivers.filter((el) => !el.confirmDateTime) : [];
      };

      /**
       * Для заданного списка адресатов распоряжения на станции возвращает массив таких адресатов,
       * для которых не было подтверждения получения данного распоряжения.
       */
      const getOrderUnconfirmedStationWorkPoligons = (stationReceivers) => {
        return stationReceivers ? stationReceivers.filter((el) => !el.confirmDateTime) : [];
      };

      /**
       * Позволяет удалить адресата распоряжения из списка получателей распоряжения на рабочих местах станции.
       * Удаление производится как в рамках основной таблицы распоряжений, так и в рамках таблицы рабочих
       * распоряжений на сервере.
       */
      const deleteOrderStationWorkPoligon = (event, orderId, workPlaceId) => {
        confirm.require({
          target: event.currentTarget,
          group: 'confirmDelStationReceiver',
          message: 'Удалить запись?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            store.dispatch('delStationWorkPlaceReceiver', { orderId, workPlaceId });
          },
        });
      };

      /**
       * Отображение результатов подтверждения распоряжений за других лиц (на сервере).
       */
      watch(() => store.getters.getConfirmOrdersForOthersResultsUnseenByUserNumber, (newVal) => {
        if (newVal === 0) {
          return;
        }
        const seenOrderIdsResults = [];
        store.getters.getConfirmOrdersForOthersResultsUnseenByUser.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          seenOrderIdsResults.push(result.orderId);
        });
        store.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER, seenOrderIdsResults);
        store.commit(CLEAR_ALL_CONFIRM_ORDERS_FOR_OTHERS_RESULTS_SEEN_BY_USER);
      });

      /**
       * Отображение результатов удаления получателей распоряжения на рабочих местах станции (на сервере).
       */
      watch(() => store.getters.getDelStationWorkPlaceReceiverResultsUnseenByUserNumber, (newVal) => {
        if (newVal === 0) {
          return;
        }
        const seenOrderIdsResults = [];
        store.getters.getDelStationWorkPlaceReceiverResultsUnseenByUser.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          seenOrderIdsResults.push(result.orderId);
        });
        store.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER, seenOrderIdsResults);
        store.commit(CLEAR_ALL_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER);
      });

      return {
        state,
        isECD: computed(() => store.getters.isECD),
        getUserWorkPoligon: computed(() => store.getters.getUserWorkPoligon),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        getWorkingOrders: computed(() => store.getters.getWorkingOrders),
        getWorkMessReceiversTblColumnsTitles: computed(() => store.getters.getWorkMessReceiversTblColumnsTitles),
        getWorkMessStationReceiversTblColumnsTitles: computed(() => store.getters.getWorkMessStationReceiversTblColumnsTitles),
        getWorkMessReceiversTblColumns: computed(() => store.getters.getWorkMessReceiversTblColumns),
        getWorkMessStationReceiversTblColumns: computed(() => store.getters.getWorkMessStationReceiversTblColumns),
        canUserPerformAnyActionOnOrder: computed(() => store.getters.canUserPerformAnyActionOnOrder),
        canOrdersChainBeDeleted: computed(() => store.getters.canOrdersChainBeDeleted),
        canDispatchOrdersConnectedToGivenOrder: computed(() => store.getters.canDispatchOrdersConnectedToGivenOrder),
        canOrderBeConfirmedFor: computed(() => store.getters.canOrderBeConfirmedFor),
        canOrderBeConfirmedForOnStation: computed(() => store.getters.canOrderBeConfirmedForOnStation),
        canOrderBeDeletedStationWorkPlaceReceiver: computed(() => store.getters.canOrderBeDeletedStationWorkPlaceReceiver),
        getOrdersChainsBeingDeleted: computed(() => store.getters.getOrdersChainsBeingDeleted),
        canUserConfirmOrdersForOthersOnStationWorkPlaces: computed(() => store.getters.canUserConfirmOrdersForOthersOnStationWorkPlaces),
        getWorkMessTblColumnsTitles,
        getWorkMessTblColumnsExceptExpander,
        getExpanderColumnObject,
        createRelativeOrderContextMenuItems,
        showOrderInfo,
        hideOrderInfo,
        deleteOrdersChain,
        getDateTimeString,
        confirmOrderForOthers,
        confirmOrderForOtherReceivers,
        getOrderUnconfirmedWorkPoligons,
        getOrderOtherUnconfirmedWorkPoligons,
        getOrderUnconfirmedStationWorkPoligons,
        deleteOrderStationWorkPoligon,
      };
    },
  }
</script>
