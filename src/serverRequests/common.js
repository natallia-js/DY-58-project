import axios from 'axios';
import { store } from '@/store';
import { APP_CODE_NAME } from '@/constants/appCredentials';
import { LOGOUT_ACTION } from '@/store/action-types';

export async function makeServerRequest({ url, method, params }) {
  let response;
  try {
    if (method === 'POST') {
      const sendParams = !params
        ? { applicationAbbreviation: APP_CODE_NAME }
        : { ...params, applicationAbbreviation: APP_CODE_NAME };
      response = await axios.post(url, sendParams, { withCredentials: true });
    } else if (method === 'GET') {
      response = await axios.get(url, { withCredentials: true });
    }
    return response;
  } catch (error) {
    // Если сервер на запрос пользователя выдает ошибку с кодом 410, то ДУ-58 должен
    // автоматически осуществить переход на страницу авторизации пользователя. Почему?
    // Потому что ошибка 410 генерируется сервером только в том случае, если в текущей
    // сессии не найдены данные по приложению (в нашем случае ДУ-58) и текущему пользователю.
    // Это означает, что сессия была удалена, и для продолжения работы приложения
    // необходимо заново войти в систему. Следовательно, нам необходимо осуществить локальный
    // выход из системы (с сервером сейчас бесполезно общаться), после чего ДУ-58, не обнаружив
    // токена текущего пользователя и остальных его данных, автоматически перейдет на
    // страницу авторизации
    if (error?.response?.status === 410) {
      store.dispatch(LOGOUT_ACTION, { onlyLocally: true });
    }
    throw error;
  }
}
