import { OrderPatternElementType } from '@/constants/orderPatterns';
import { getLocaleDateString, getLocaleTimeString, getLocaleDateTimeString } from '@/additional/dateTimeConvertions';

function getInitialValue(value) {
  return value;
}

function getStringByArray(value) {
  return value ? value.join(', '): '';
}

const mapParentChildElementTypes = [
  { parentType: OrderPatternElementType.INPUT, childType: OrderPatternElementType.INPUT, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.TEXT_AREA, childType: OrderPatternElementType.TEXT_AREA, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.SELECT, childType: OrderPatternElementType.SELECT, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.SELECT, childType: OrderPatternElementType.INPUT, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.MULTIPLE_SELECT, childType: OrderPatternElementType.MULTIPLE_SELECT, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.MULTIPLE_SELECT, childType: OrderPatternElementType.INPUT, childValueGetter: getStringByArray },
  { parentType: OrderPatternElementType.DATE, childType: OrderPatternElementType.DATE, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.DATE, childType: OrderPatternElementType.DATETIME, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.DATE, childType: OrderPatternElementType.INPUT, childValueGetter: getLocaleDateString },
  { parentType: OrderPatternElementType.TIME, childType: OrderPatternElementType.TIME, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.TIME, childType: OrderPatternElementType.INPUT, childValueGetter: getLocaleTimeString },
  { parentType: OrderPatternElementType.DATETIME, childType: OrderPatternElementType.DATETIME, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.DATETIME, childType: OrderPatternElementType.DATE, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.DATETIME, childType: OrderPatternElementType.INPUT, childValueGetter: getLocaleDateTimeString },
  { parentType: OrderPatternElementType.TIMETIME_OR_TILL_NOTICE, childType: OrderPatternElementType.TIMETIME_OR_TILL_NOTICE, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.TIMETIME_OR_TILL_NOTICE, childType: OrderPatternElementType.INPUT, childValueGetter: getInitialValue },
  { parentType: OrderPatternElementType.DR_TRAIN_TABLE, childType: OrderPatternElementType.DR_TRAIN_TABLE, childValueGetter: getInitialValue },
];

function getChildOrderPatternElementValueByParentElementValue(parentElementType, parentElementValue, childElementType) {
  if (!parentElementType || !childElementType)
    return null;
  const parentChildTypesMap = mapParentChildElementTypes.find((el) => el.parentType === parentElementType && el.childType === childElementType);
  if (parentChildTypesMap) {
    return parentChildTypesMap.childValueGetter(parentElementValue);
  }

  return '';
}

export default getChildOrderPatternElementValueByParentElementValue;
