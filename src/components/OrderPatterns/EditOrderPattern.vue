import React, { useEffect, useState } from 'react';
import { Typography, Popover, Row, Col, Space } from 'antd';
import { EditOrderPatternElement } from '../EditOrderPatternElement';
import { OrderPatternElementType } from '../constants';
import getOrderPatternElementView from '../getOrderPatternElementView';
import { ORDER_PATTERN_ELEMENT_FIELDS } from '../../../constants';

const { Title, Text } = Typography;

<template>
  <div class="dy58-title-small p-text-center p-mb-4">Редактирование шаблона</div>
  <div v-for="(array, arrayIndex) of orderPatternArrays" :key="arrayIndex">
    <template v-for="(patternElement, arrIndex) of array" :key="arrIndex">
      <Cursor
        v-if="(arrayIndex === 0 && arrIndex === 0 && insertOrderElementPos === -1) ||
              (arrIndex === 0 && patternElement.index === insertOrderElementPos)"
      />

      <div :class="[
        'outer-cursor-block': true,
        'not-edited-order-pattern-element-block': patternElement.key !== editedPatternElementId,
        'edited-order-pattern-element-block': patternElement.key === editedPatternElementId,
      ]">
        <!-- popover -->
      </div>

      <Cursor
        v-if="(arrIndex !== array.length - 1 || arrayIndex === orderPatternArrays.length - 1) &&
              (patternElement.index === insertOrderElementPos - 1)"
      />
    </template>
  </div>

  <div v-if="editedPatternElementId" class="order-pattern-border order-pattern-block">
    <div>
      <div class="p-text-bold">Редактирование элемента шаблона</div>
      <EditOrderPatternElement
        element={orderPattern.find((el) => el[ORDER_PATTERN_ELEMENT_FIELDS.KEY] === editedPatternElementId)}
        submitOrderPatternElementCallback={
          (editedPatternElement) => editPatternElementCallback(editedPatternElementId, editedPatternElement)
        }
        okButtonText="Применить редактирование"
      />
    </div>
  </div>


  {
    orderPatternArrays.map((array, arraysIndex) => (
      <Row key={arraysIndex}>
      {
        array.map((patternElement, arrIndex) => (
          <React.Fragment key={patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY]}>
            {
              ((arraysIndex === 0 && arrIndex === 0 && insertOrderElementPos === -1) ||
              (arrIndex === 0 && patternElement.index === insertOrderElementPos)) &&
              <Cursor />
            }
            <Col
              className={
                patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                'not-edited-order-pattern-element-block' :
                'edited-order-pattern-element-block'
              }
              style={{ width: 'auto', margin: '0 10px 10px 0' }}
            >
              {
                <Popover
                  content={
                    <div>
                      <p>
                        <a href="#!" onClick={() =>
                          patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                          setEditedPatternElementId(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY]) :
                          setEditedPatternElementId(null)}
                        >
                          {
                            patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                            'Редактировать' : 'Отменить редактирование'
                          }
                        </a>
                      </p>
                      <p>
                        <a href="#!" onClick={() => delPatternElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                          Удалить
                        </a>
                      </p>
                      <p>
                        <a href="#!" onClick={() => setCursorBeforeElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                          Вставить элемент перед
                        </a>
                      </p>
                      <p>
                        <a href="#!" onClick={() => setCursorAfterElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                          Вставить элемент после
                        </a>
                      </p>
                    </div>
                  }
                  trigger="click"
                >
                  <Row>
                    <Col>
                      {getOrderPatternElementView(patternElement)}
                    </Col>
                  </Row>
                </Popover>
              }
            </Col>
            {
              (arrIndex !== array.length - 1 || arraysIndex === orderPatternArrays.length - 1) &&
              (patternElement.index === insertOrderElementPos - 1) &&
              <Cursor />
            }
          </React.Fragment>
        ))
      }
      </Row>
    ))
  }
  {
    editedPatternElementId &&
    <div className="order-pattern-border order-pattern-block">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Text strong>Редактирование элемента шаблона</Text>
        <EditOrderPatternElement
          element={orderPattern.find((el) => el[ORDER_PATTERN_ELEMENT_FIELDS.KEY] === editedPatternElementId)}
          submitOrderPatternElementCallback={
            (editedPatternElement) => editPatternElementCallback(editedPatternElementId, editedPatternElement)
          }
          okButtonText="Применить редактирование"
        />
      </Space>
    </div>
  }
</template>


<script>
  import Cursor from './Cursor';

  export default {
    name: 'dy58-edit-order-pattern',

    data() {
      return {
        orderPatternArrays: [],
      };
    },

    props: [
      '',
    ],
  }
</script>


<style lang="scss" scoped>
  @mixin order-pattern-element-block($border-color) {
    border-width: 2px;
    border-style: solid;
    border-color: $border-color;
  }

  .not-edited-order-pattern-element-block {
    @include order-pattern-element-block(var(--surface-400));
  }

  .edited-order-pattern-element-block {
    @include order-pattern-element-block(var(--primary-color));
  }

  .outer-cursor-block {
    width: auto;
    margin: 0 10px 10px 0;
  }

  .order-pattern-border {
    border-width: 1px;
    border-style: solid;
    border-color: var(--primary-color);
  }

  .order-pattern-block {
    padding: 0.5rem;
  }
</style>


  const {
    orderPattern,
    insertOrderElementPos,
    setCursorBeforeElementCallback,
    setCursorAfterElementCallback,
    delPatternElementCallback,
    editPatternElementCallback,
  } = props;
  const [orderPatternArrays, setOrderPatternArrays] = useState([]);
  const [editedPatternElementId, setEditedPatternElementId] = useState(null);

  useEffect(() => {
    if (!orderPattern || !orderPattern.length) {
      setEditedPatternElementId(null);
      setOrderPatternArrays([]);
      return;
    }

    if (!orderPattern.find((el) => el[ORDER_PATTERN_ELEMENT_FIELDS.KEY] === editedPatternElementId)) {
      setEditedPatternElementId(null);
    }

    const linebreakElementsIndexes = [];
    const orderPatternForWork = [];
    orderPattern.forEach((element, index) => {
      if (element[ORDER_PATTERN_ELEMENT_FIELDS.TYPE] === OrderPatternElementType.LINEBREAK) {
        linebreakElementsIndexes.push(index);
      }
      orderPatternForWork.push({
        ...element,
        index,
      });
    });
    linebreakElementsIndexes.push(orderPattern.length);

    let prevLinebreakIndex = 0;
    const orderPatternToDraw = [];
    linebreakElementsIndexes.forEach((element) => {
      const arrayPart = orderPatternForWork.slice(prevLinebreakIndex, element + 1);
      prevLinebreakIndex = element + 1;
      if (arrayPart && arrayPart.length) {
        orderPatternToDraw.push(arrayPart);
      }
    });
    setOrderPatternArrays(orderPatternToDraw);
  }, [editedPatternElementId, orderPattern]);


  return (
    <>
      <Title level={4} className="center">Редактирование шаблона</Title>
      {
        orderPatternArrays.map((array, arraysIndex) => (
          <Row key={arraysIndex}>
          {
            array.map((patternElement, arrIndex) => (
              <React.Fragment key={patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY]}>
                {
                  ((arraysIndex === 0 && arrIndex === 0 && insertOrderElementPos === -1) ||
                  (arrIndex === 0 && patternElement.index === insertOrderElementPos)) &&
                  <Cursor />
                }
                <Col
                  className={
                    patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                    'not-edited-order-pattern-element-block' :
                    'edited-order-pattern-element-block'
                  }
                  style={{ width: 'auto', margin: '0 10px 10px 0' }}
                >
                  {
                    <Popover
                      content={
                        <div>
                          <p>
                            <a href="#!" onClick={() =>
                              patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                              setEditedPatternElementId(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY]) :
                              setEditedPatternElementId(null)}
                            >
                              {
                                patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY] !== editedPatternElementId ?
                                'Редактировать' : 'Отменить редактирование'
                              }
                            </a>
                          </p>
                          <p>
                            <a href="#!" onClick={() => delPatternElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                              Удалить
                            </a>
                          </p>
                          <p>
                            <a href="#!" onClick={() => setCursorBeforeElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                              Вставить элемент перед
                            </a>
                          </p>
                          <p>
                            <a href="#!" onClick={() => setCursorAfterElementCallback(patternElement[ORDER_PATTERN_ELEMENT_FIELDS.KEY])}>
                              Вставить элемент после
                            </a>
                          </p>
                        </div>
                      }
                      trigger="click"
                    >
                      <Row>
                        <Col>
                          {getOrderPatternElementView(patternElement)}
                        </Col>
                      </Row>
                    </Popover>
                  }
                </Col>
                {
                  (arrIndex !== array.length - 1 || arraysIndex === orderPatternArrays.length - 1) &&
                  (patternElement.index === insertOrderElementPos - 1) &&
                  <Cursor />
                }
              </React.Fragment>
            ))
          }
          </Row>
        ))
      }
      {
        editedPatternElementId &&
        <div className="order-pattern-border order-pattern-block">
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Text strong>Редактирование элемента шаблона</Text>
            <EditOrderPatternElement
              element={orderPattern.find((el) => el[ORDER_PATTERN_ELEMENT_FIELDS.KEY] === editedPatternElementId)}
              submitOrderPatternElementCallback={
                (editedPatternElement) => editPatternElementCallback(editedPatternElementId, editedPatternElement)
              }
              okButtonText="Применить редактирование"
            />
          </Space>
        </div>
      }
    </>
  );
};
