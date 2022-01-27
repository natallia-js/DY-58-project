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

    <ContextMenu ref="menu" :model="workOrdersTableContextMenuItems" />

    <DataTable
      :value="getWorkingOrders"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      dataKey="id"
      :scrollable="true" scrollHeight="flex"
      v-model:expandedRows="state.expandedRows"
      contextmenu
      v-model:contextMenuSelection="state.selectedWorkOrdersTableRecord"
      @rowContextmenu="handleWorkOrdersTableRightClick"
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
              'dy58-order-being-deleted': getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId)
            }]"
          >
            <span v-if="![
              getWorkMessTblColumnsTitles.expander,
              getWorkMessTblColumnsTitles.state,
              getWorkMessTblColumnsTitles.orderReceiveStatus].includes(col.field)"
            >
              {{ slotProps.data[col.field] }}
            </span>
            <div v-if="col.field === getWorkMessTblColumnsTitles.orderReceiveStatus">
              <p v-if="slotProps.data[col.field].notDelivered > 0">
                <span class="p-mr-2">Не доставлено:</span>
                <Badge class="dy58-not-delivered-order" :value="slotProps.data[col.field].notDelivered"></Badge>
              </p>
              <p v-if="slotProps.data[col.field].notConfirmed > 0">
                <span class="p-mr-2">Не подтверждено:</span>
                <Badge class="dy58-not-confirmed-order" :value="slotProps.data[col.field].notConfirmed"></Badge>
              </p>
            </div>
            <div v-else-if="col.field === getWorkMessTblColumnsTitles.state">
              <!-- Вместо кнопок действий пользователя над распоряжением отображаем статус ожидания,
              если идет один из следующих процессов, связанных с текущим распоряжением:
              1. подтверждение за получателей на глобальных полигонах управления
              2. подтверждение за получателей на станционных рабочих местах
              3. удаление цепочки распоряжений, частью которой является данное распоряжение -->
              <i
                v-if="isOrderBeingConfirmedForOthers(slotProps.data.id) ||
                  isOrderBeingDeletedStationWorkPlaceReceiver(slotProps.data.id) ||
                  getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId)"
                class="pi pi-spin pi-check-circle"
              ></i>
              <div v-else>
                <div class="p-mb-1">
                  <Button
                    icon="pi pi-ellipsis-h"
                    class="p-button-info p-button-sm dy58-order-action-button"
                    v-tooltip.bottom="'Подробнее'"
                    @click="showOrderInfo(slotProps.data)"
                  />
                </div>
                <div class="p-mb-1">
                  <Button
                    v-if="canUserDelConfirmedOrdersChains"
                    icon="pi pi-times"
                    class="p-button-secondary p-button-sm dy58-order-action-button"
                    v-tooltip.bottom="slotProps.data.chainMembersNumber > 1 ? 'Не показывать цепочку' : 'Не показывать'"
                    @click="deleteOrdersChain(slotProps.data.orderChainId)"
                  />
                </div>
                <div>
                  <TieredMenu
                    :ref="`createOrderMenu${slotProps.data.id}`"
                    :model="createRelativeOrderContextMenuItems(slotProps.data.id)"
                    :popup="true"
                    :id="`overlay_tmenu${slotProps.data.id}`"
                  />
                  <Button
                    v-if="canUserDispatchOrders && isOrderActive(slotProps.data.id)"
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
          <div class="p-col">
            <div v-if="!slotProps.data.sendOriginal"><b>КОПИЯ</b></div>
            <div class="dy58-order-pattern-border p-p-1" v-html="slotProps.data.orderText"></div>
            <div><b>Из:</b> {{ slotProps.data.place }}</div>
            <div><b>Автор:</b> {{ `${slotProps.data.post} ${slotProps.data.fio}` }}</div>
          </div>
          <div class="p-col">

            <!-- Если таблица адресатов распоряжения на глобальных рабочих полигонах пуста, не отображаем ее -->

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
                    <div v-if="col2.field !== getWorkMessReceiversTblColumnsTitles.confirmDateTime"
                      style="width:100%"
                      :class="[
                        {'dy58-not-delivered-order': !slotProps2.data.deliverDateTime},
                        {'dy58-not-confirmed-order': slotProps2.data.deliverDateTime && !slotProps2.data.confirmDateTime},
                      ]"
                    >
                      {{ slotProps2.data[col2.field] }}
                    </div>
                    <div v-else>
                      <span v-if="slotProps2.data[col2.field]">
                        {{ getDateTimeString(slotProps2.data[col2.field]) }}
                      </span>
                      <Button
                        v-else-if="canUserConfirmOrderForOthers &&
                          !getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                          !isOrderBeingConfirmedForOthers(slotProps.data.id) &&
                          !isOrderBeingDeletedStationWorkPlaceReceiver(slotProps.data.id) &&
                          orderCanBeConfirmedFor(slotProps.data)"
                        label="Подтвердить"
                        class="p-button-primary p-button-text"
                        @click="confirmOrderForOthers(slotProps.data.id, [{
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
              <div v-if="isOrderBeingConfirmedForOthers(slotProps.data.id) ||
                isOrderBeingDeletedStationWorkPlaceReceiver(slotProps.data.id)"
                style="text-align:right"
              >
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <div v-else-if="canUserConfirmOrderForOthers &&
                  !getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                  orderCanBeConfirmedFor(slotProps.data) &&
                  getOrderUnconfirmedWorkPoligons(slotProps.data.receivers).length"
                style="text-align:right"
              >
                <Button
                  label="Подтвердить все"
                  class="p-button-primary p-button-text"
                  @click="confirmOrderForOthers(slotProps.data.id,
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

            <div v-if="canUserConfirmOrdersForOthersOnStationWorkPlaces">
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
                    <div v-if="col3.field !== getWorkMessStationReceiversTblColumnsTitles.confirmDateTime"
                      style="width:100%"
                      :class="[
                        {'dy58-not-delivered-order': !slotProps3.data.deliverDateTime},
                        {'dy58-not-confirmed-order': slotProps3.data.deliverDateTime && !slotProps3.data.confirmDateTime},
                      ]"
                    >
                      {{ slotProps3.data[col3.field] }}
                    </div>
                    <div v-else>
                      <div v-if="slotProps3.data[col3.field]">
                        {{ getDateTimeString(slotProps3.data[col3.field]) }}
                      </div>
                      <div
                        v-else-if="canUserConfirmOrderForOthers &&
                          !getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                          orderCanBeConfirmedForOnStation(slotProps.data) &&
                          !isOrderBeingConfirmedForOthers(slotProps.data.id) &&
                          !isOrderBeingDeletedStationWorkPlaceReceiver(slotProps.data.id)"
                        >
                        <Button
                          label="Подтвердить"
                          class="p-button-primary p-button-text"
                          @click="confirmOrderForOthers(slotProps.data.id, [{
                            workPoligonType: slotProps3.data.type,
                            workPoligonId: slotProps3.data.id,
                            workPlaceId: slotProps3.data.workPlaceId,
                            post: slotProps3.data.post,
                            fio: slotProps3.data.fio,
                          }])"
                        />
                      </div>
                      <div v-if="orderStationWorkPlaceReceiverCanBeDeleted(slotProps.data, slotProps3.data.type, slotProps3.data.id, slotProps3.data.workPlaceId)">
                        <Button
                          label="Удалить"
                          class="p-button-primary p-button-text"
                          @click="deleteOrderStationWorkPoligon($event, slotProps.data.id, slotProps3.data.workPlaceId)"
                        />
                      </div>
                    </div>
                  </template>
                </Column>
              </DataTable>
              <div v-if="isOrderBeingConfirmedForOthers(slotProps.data.id) ||
                isOrderBeingDeletedStationWorkPlaceReceiver(slotProps.data.id)"
                style="text-align:right"
              >
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <div v-else-if="!getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                  orderCanBeConfirmedForOnStation(slotProps.data) &&
                  getOrderUnconfirmedStationWorkPoligons(slotProps.data.stationReceivers).length"
                style="text-align:right"
              >
                <Button
                  label="Подтвердить все"
                  class="p-button-primary p-button-text"
                  @click="confirmOrderForOthers(slotProps.data.id,
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
  import { computed, reactive, ref, watch } from 'vue';
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
      const menu = ref();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        expandedRows: [],
        selectedWorkOrdersTableRecord: null,
        showIncomingOrderDlg: false,
        chosenOrder: null,
      });

      const getWorkMessTblColumns = computed(() => store.getters.getWorkMessTblColumns);
      const getWorkMessTblColumnsTitles = computed(() => store.getters.getWorkMessTblColumnsTitles);

      const getWorkMessTblColumnsExceptExpander = computed(() =>
        getWorkMessTblColumns.value.filter((el) => el.field !== getWorkMessTblColumnsTitles.value.expander));

      const getExpanderColumnObject = computed(() =>
        getWorkMessTblColumns.value.find((el) => el.field === getWorkMessTblColumnsTitles.value.expander));

      const canUserDelConfirmedOrdersChains = computed(() => store.getters.canUserDelConfirmedOrdersChains);

      const getDeleteOrdersChainAction = computed(() => store.getters.getDeleteOrdersChainAction);

      const getCreateRelativeOrderContextMenu = computed(() => store.getters.getCreateRelativeOrderContextMenu);

      const workOrdersTableContextMenuItems = computed(() => {
        const items = [];
        if (state.selectedWorkOrdersTableRecord) {
          if (canUserDelConfirmedOrdersChains.value) {
            const ordersInChain = store.getters.getOrdersInChain(state.selectedWorkOrdersTableRecord.orderChainId);
            items.push({
              label: `Не показывать ${ordersInChain.length === 1 ? 'распоряжение' : 'цепочку распоряжений'}`,
              icon: 'pi pi-times',
              command: () => {
                getDeleteOrdersChainAction.value(state.selectedWorkOrdersTableRecord.orderChainId, confirm);
              },
            });
          }
          const createRelativeOrderContextMenuItems =
            getCreateRelativeOrderContextMenu.value(state.selectedWorkOrdersTableRecord.id);
          if (createRelativeOrderContextMenuItems.length) {
            items.push(...createRelativeOrderContextMenuItems);
          }
        }
        if (!items.length) {
          items.push({
            label: 'У вас нет прав на выполнение действий над распоряжениями',
          });
        }
        return items;
      });

      const getUserWorkPoligon = computed(() => store.getters.getUserWorkPoligon);

      /**
       * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов
       * (т.е. за те полигоны, которые присутствовали в секции "Кому" при издании распоряжения).
       * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
       * котором работает пользователь (в случае ДСП и оператора ДСП одной станции: их рабочие
       * полигоны - разные: рабочий полигон = рабочее место).
       * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
       * за других.
       */
      const orderCanBeConfirmedFor = computed(() => {
        return (order) =>
          (
            order && order.senderWorkPoligon && getUserWorkPoligon.value &&
            (order.senderWorkPoligon.type === getUserWorkPoligon.value.type) &&
            (String(order.senderWorkPoligon.id) === String(getUserWorkPoligon.value.code)) &&
            (
              (!order.senderWorkPoligon.workPlaceId && !getUserWorkPoligon.value.subCode) ||
              (order.senderWorkPoligon.workPlaceId && getUserWorkPoligon.value.subCode && String(order.senderWorkPoligon.workPlaceId) === String(getUserWorkPoligon.value.subCode))
            )
          ) ? true : false;
      });

      /**
       * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов
       * в рамках станции (т.е. подтвердить за конкретные рабочие места).
       * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
       * котором работает пользователь (в случае ДСП и оператора ДСП одной станции: их рабочие
       * полигоны - разные: рабочий полигон = рабочее место) либо если распоряжение адресовалось
       * текущей станции в момент его издания (в этом случае за других может подтвердить распоряжение
       * как ДСП, так и Оператор при ДСП).
       * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
       * за других в рамках станции.
       */
      const orderCanBeConfirmedForOnStation = computed(() => {
        return (order) =>
          (
            orderCanBeConfirmedFor.value(order) ||
            (
              order.receivers && getUserWorkPoligon.value && order.receivers.find((el) =>
                (el.type === getUserWorkPoligon.value.type) &&
                (String(el.id) === String(getUserWorkPoligon.value.code))
              )
            )
          ) ? true : false;
       });

      /**
       * Возвращает true, если возможно удаление адресата распоряжения из таблицы адресатов на рабочих
       * местах станции, false - в противном случае. Такое удаление для конкретной записи таблицы возможно
       * лишь в том случае, если распоряжение было издано на данном рабочем месте либо если удаляет запись
       * лицо с того рабочего места, которому распоряжение адресовалось.
       */
      const orderStationWorkPlaceReceiverCanBeDeleted = computed(() => {
        return (order, workPoligonType, workPoligonId, workPlaceId) =>
          (
            orderCanBeConfirmedFor.value(order) ||
            (
              getUserWorkPoligon.value && (getUserWorkPoligon.value.type === workPoligonType) &&
              (String(getUserWorkPoligon.value.code) === String(workPoligonId)) &&
              (
                (!getUserWorkPoligon.value.subCode && !workPlaceId) ||
                (getUserWorkPoligon.value.subCode && workPlaceId && String(getUserWorkPoligon.value.subCode) === String(workPlaceId))
              )
            )
          ) ? true : false;
      });

      const createRelativeOrderContextMenuItems = (orderId) => {
        return getCreateRelativeOrderContextMenu.value(orderId);
      };

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

      const handleWorkOrdersTableRightClick = (event) => {
        menu.value.show(event.originalEvent);
      };

      const getDateTimeString = (datetime, showSeconds) => {
        return getLocaleDateTimeString(datetime, showSeconds);
      };

      /**
       * Значение параметра confirmWorkPoligons - массив объектов с информацией о рабочих полигонах / рабочих
       * местах на станции, за которые необходимо подтвердить распоряжение.
       */
      const confirmOrderForOthers = (orderId, confirmWorkPoligons) => {
        if (confirmWorkPoligons && confirmWorkPoligons.length) {
          store.dispatch('confirmOrderForOthers', { orderId, confirmWorkPoligons });
        }
      };

      /**
       * Для заданного списка исходных (указанных явно пользователем при создании) адресатов распоряжения
       * возвращает массив таких адресатов, для которых не было подтверждения получения данного распоряжения.
       */
      const getOrderUnconfirmedWorkPoligons = (receivers) => {
        return receivers ? receivers.filter((el) => !el.confirmDateTime) : [];
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
        menu,
        getWorkingOrders: computed(() => store.getters.getWorkingOrders),
        getWorkMessReceiversTblColumnsTitles: computed(() => store.getters.getWorkMessReceiversTblColumnsTitles),
        getWorkMessStationReceiversTblColumnsTitles: computed(() => store.getters.getWorkMessStationReceiversTblColumnsTitles),
        getWorkMessReceiversTblColumns: computed(() => store.getters.getWorkMessReceiversTblColumns),
        getWorkMessStationReceiversTblColumns: computed(() => store.getters.getWorkMessStationReceiversTblColumns),
        getOrdersChainsBeingDeleted: computed(() => store.getters.getOrdersChainsBeingDeleted),
        isOrderBeingConfirmedForOthers: computed(() => store.getters.isOrderBeingConfirmedForOthers),
        canUserConfirmOrderForOthers: computed(() => store.getters.canUserConfirmOrderForOthers),
        canUserDispatchOrders: computed(() => store.getters.canUserDispatchOrders),
        isOrderActive: computed(() => store.getters.isOrderActive),
        canUserConfirmOrdersForOthersOnStationWorkPlaces: computed(() => store.getters.canUserConfirmOrdersForOthersOnStationWorkPlaces),
        isOrderBeingDeletedStationWorkPlaceReceiver: computed(() => store.getters.isOrderBeingDeletedStationWorkPlaceReceiver),
        getWorkMessTblColumnsTitles,
        canUserDelConfirmedOrdersChains,
        getWorkMessTblColumnsExceptExpander,
        getExpanderColumnObject,
        workOrdersTableContextMenuItems,
        orderCanBeConfirmedFor,
        orderCanBeConfirmedForOnStation,
        orderStationWorkPlaceReceiverCanBeDeleted,
        createRelativeOrderContextMenuItems,
        showOrderInfo,
        hideOrderInfo,
        deleteOrdersChain,
        handleWorkOrdersTableRightClick,
        getDateTimeString,
        confirmOrderForOthers,
        getOrderUnconfirmedWorkPoligons,
        getOrderUnconfirmedStationWorkPoligons,
        deleteOrderStationWorkPoligon,
      };
    },
  }
</script>
