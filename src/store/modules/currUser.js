import {
  APP_CODE_NAME,
  APP_CREDENTIALS,
  WORK_POLIGON_TYPES,
} from '@/constants/appCredentials';
import {
  SET_USER_CREDENTIAL,
  SET_USER_WORK_POLIGON,
  SET_USER_TOKEN,
  SET_USER_PASS_DUTY_TIME,
  SET_USER_TAKE_PASS_DUTY_TIMES,
  CANCEL_LOGOUT,
  PREPARE_FOR_LOGOUT,
  START_LOGOUT_PROCESS,
  LOGOUT_FINISHED_WITH_ERROR,
  LOGOUT_FINISHED_WITHOUT_ERROR,
  SET_USER_DATA_ON_LOGIN,
  CLEAR_USER_DATA_ON_LOGOUT,
  CLEAR_LOGIN_RESULT,
  SET_LOGIN_RESULT,
  SET_USER_OFFLINE_STATUS,
  SET_USER_ALL_WORK_OFFLINE_STATUS,
} from '@/store/mutation-types';
import {
  LOGIN_ACTION,
  TRY_LOGIN_VIA_SESSION_ACTION,
  LOGIN_VIA_LOCAL_STORAGE_ACTION,
  LOGOUT_ACTION,
} from '@/store/action-types';
import {
  startWorkWithoutTakingDuty,
  takeDutyUser,
  logoutUser,
  logoutWithDutyPass,
  whoAmI,
} from '@/serverRequests/auth.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getUserWorkPoligonsArray from '@/additional/getUserWorkPoligonsArray';
import { getUserFIOString, getUserPostFIOString } from '@/store/modules/personal/transformUserData';
import {
  saveUserDataInLocalStorage,
  getUserDataFromLocalStorage,
  updateUserDataInLocalStorage,
} from '@/additional/localStorage';


/**
 * Проверяет информацию, переданную для входа пользователя в систему.
 * Если возникает ошибка проверки, выбрасывает исключение.
 * В случае успеха возвращает список полномочий, которые определены для пользователя в отношении текущего приложения
 * и которые текущее приложение "знает". Также, возвращает список рабочих полигонов, определенных для пользователя
 * и связанных с выбранными полномочиями.
 */
function checkUserAuthData(payload) {
  const { userId, jtwToken, userInfo, credentials, workPoligons } = payload;

  if (!userId) {
    throw new Error('Не указан id пользователя для входа в Систему. Обратитесь к Администратору Системы');
  }
  if (!jtwToken) {
    throw new Error('Не указан токен пользователя для входа в Систему. Обратитесь к Администратору Системы');
  }
  if (!userInfo || !userInfo.name || !userInfo.surname || !userInfo.service) {
    throw new Error('Не указаны (указаны не все) данные пользователя для входа в Систему. Обратитесь к Администратору Системы');
  }
  if (!credentials || !credentials.length) {
    throw new Error('Для данного пользователя не определены полномочия. Обратитесь к Администратору Системы');
  }

  // Проверяем, имеет ли пользователь право работать в данном приложении
  let userAppCredentials;

  // Среди приложений ГИД НЕМАН, с которыми разрешено работать пользователю, ищем текущее приложение,
  // и, если находим, извлекаем из него полномочия, которыми наделен пользователь в отношении данного приложения
  for (let cred of credentials) {
    if (cred.appAbbrev === APP_CODE_NAME) {
      userAppCredentials = cred.creds; // массив строк с условными названиями полномочий
      break;
    }
  }
  if (!userAppCredentials || !userAppCredentials.length) {
    throw new Error('Для данного пользователя не определены полномочия для работы с ДУ-58. Обратитесь к Администратору Системы');
  }

  // Проверяем найденные полномочия пользователя в текущем приложении (хотя бы одно полномочие
  // должно быть "известно" текущему приложению)
  userAppCredentials = userAppCredentials.filter((cred) => Object.values(APP_CREDENTIALS).includes(cred));

  if (!userAppCredentials || !userAppCredentials.length) {
    throw new Error('Для данного пользователя определены неверные полномочия для работы с ДУ-58. Обратитесь к Администратору Системы');
  }

  // Осталось проверить рабочие полигоны. Причем во взаимосвязи с полномочиями пользователя:
  // конкретный тип полномочия подразумевает конкретный тип рабочего полигона
  if (!workPoligons || !workPoligons.length) {
    throw new Error('Для данного пользователя не определен рабочий полигон. Обратитесь к Администратору Системы')
  }

  let userCredsWithPoligons = [];
  let workPoligonExists = false; // будет true, если хотя бы для одного из типов полномочий существует хотя бы один рабочий полигон
  userAppCredentials.forEach((cred) => {
    const obj = { cred };
    // ---> ДСП
    if (cred === APP_CREDENTIALS.DSP_FULL) {
      const poligon = workPoligons.find((poligon) => poligon.type === WORK_POLIGON_TYPES.STATION);
      if (!poligon) {
        obj.poligons = [];
      } else {
        obj.poligons = [{
          type: WORK_POLIGON_TYPES.STATION,
          workPoligons: poligon.workPoligons.filter((wp) => wp.poligonId && !wp.subPoligonId),
        }];
      }
    // ---> Оператор при ДСП
    } else if (cred === APP_CREDENTIALS.DSP_Operator) {
      const poligon = workPoligons.find((poligon) => poligon.type === WORK_POLIGON_TYPES.STATION);
      if (!poligon) {
        obj.poligons = [];
      } else {
        obj.poligons = [{
          type: WORK_POLIGON_TYPES.STATION,
          workPoligons: poligon.workPoligons.filter((wp) => wp.poligonId && wp.subPoligonId),
        }];
      }
    // ---> ДНЦ
    } else if (cred === APP_CREDENTIALS.DNC_FULL) {
      // filter, а не find, несмотря на то что все равно будет найден максимум 1 элемент (нужен пустой
      // массив, если ничего не будет найдено)
      obj.poligons = workPoligons.filter((poligon) => poligon.type === WORK_POLIGON_TYPES.DNC_SECTOR);
    // ---> ЭЦД
    } else if (cred === APP_CREDENTIALS.ECD_FULL) {
      // filter, а не find, несмотря на то что все равно будет найден максимум 1 элемент (нужен пустой
      // массив, если ничего не будет найдено)
      obj.poligons = workPoligons.filter((poligon) => poligon.type === WORK_POLIGON_TYPES.ECD_SECTOR);
    // ---> Ревизор
    } else if (cred === APP_CREDENTIALS.REVISOR) {
      obj.poligons = [...workPoligons];
    }
    if (obj.poligons && obj.poligons.length) {
      workPoligonExists = true;
    }
    userCredsWithPoligons.push(obj);
  });

  if (!workPoligonExists) {
    throw new Error('Для данного пользователя не определен рабочий полигон. Обратитесь к Администратору Системы')
  }

  return userCredsWithPoligons;
}


export const currUser = {
  state: {
    id: null,         // id пользователя
    name: '',         // имя
    fatherName: '',   // отчество
    surname: '',      // фамилия
    post: '',         // должность
    service: '',      // принадлежность службе
    token: null,      // token пользователя
    loginDateTime: null, // время входа в систему (время, когда в системе вызывается метод login)
    lastTakeDutyTime: null, // время последнего принятия дежурства
    lastPassDutyTime: null, // время последней сдачи дежурства
    possibleCredentialsWithPoligons: null, // все полномочия пользователя в данной системе с соответствующими возможными
                                           // рабочими полигонами (из них необходимо выбрать одно полномочие и один полигон)
    credential: null, // конкретное (одно) полномочие пользователя в данной системе
    workPoligon: null,  // информация о рабочем полигоне (одном) пользователя
    isAuthenticated: false, // true (прошел) либо false (не прошел) пользователь полную аутентификацию в системе
                            // (не только login и password, но и полномочия в системе, и рабочий полигон)
    loginProcessIsUnderway: false, // true - идет процесс входа в систему, false - не идет
    loginResult: null,
    startLogout: false, // true (false) - начать (не начинать) процесс выхода из системы
    logoutWithDutyPass: false, // true (false) - выход из системы со сдачей (без сдачи) дежурства
    logoutProcessIsUnderway: false, // true (false) - идет (не идет) процесс выхода из системы
    logoutError: null,
    // если true, то в данный момент пользователь работает в режиме offline, false - в режиме online
    workOffline: false,
    // если true, то пользователь вошел в систему для работы в режиме offline, а значит, что
    // workOffline всегда должно быть true (workOfflineAllTheTime устанавливается только в момент входа в систему)
    workOfflineAllTheTime: false,
  },

  getters: {
    getUserId(state) {
      return state.id;
    },
    getUserName(state) {
      return state.name;
    },
    getUserFatherName(state) {
      return state.fatherName;
    },
    getUserSurname(state) {
      return state.surname;
    },
    getUserPost(state) {
      return state.post;
    },
    getUserService(state) {
      return state.service;
    },
    getUserFIO(state) {
      return getUserFIOString({ name: state.name, fatherName: state.fatherName, surname: state.surname });
    },
    getUserPostFIO(state) {
      return getUserPostFIOString({ post: state.post, name: state.name, fatherName: state.fatherName, surname: state.surname });
    },
    getUserToken(state) {
      return state.token;
    },
    isLoginProcessUnderway(state) {
      return state.loginProcessIsUnderway;
    },
    getLoginResult(state) {
      return state.loginResult;
    },
    getLastTakeDutyTime(state) {
      return state.lastTakeDutyTime;
    },
    getLastPassDutyTime(state) {
      return state.lastPassDutyTime;
    },
    getLoginDateTime(state) {
      return state.loginDateTime;
    },
    getAllPossibleCredentialsWithPoligons(state) {
      return state.possibleCredentialsWithPoligons;
    },
    getUserCredential(state) {
      return state.credential;
    },
    getUserWorkPoligon(state) {
      return state.workPoligon;
    },
    userWorkPoligonIsStation(state) {
      return state.workPoligon && state.workPoligon.type === WORK_POLIGON_TYPES.STATION;
    },
    isUserAuthenticated(state) {
      return state.isAuthenticated;
    },
    isDSP(state) {
      return state.credential === APP_CREDENTIALS.DSP_FULL;
    },
    isDSP_or_DSPoperator(state) {
      return state.credential === APP_CREDENTIALS.DSP_FULL || state.credential === APP_CREDENTIALS.DSP_Operator;
    },
    isDSPoperator(state) {
      return state.credential === APP_CREDENTIALS.DSP_Operator;
    },
    isDNC(state) {
      return state.credential === APP_CREDENTIALS.DNC_FULL;
    },
    isECD(state) {
      return state.credential === APP_CREDENTIALS.ECD_FULL;
    },
    isRevisor(state) {
      return state.credential === APP_CREDENTIALS.REVISOR;
    },
    getStartLogout(state) {
      return state.startLogout;
    },
    getlogoutWithDutyPass(state) {
      return state.logoutWithDutyPass;
    },
    isLogoutProcessUnderway(state) {
      return state.logoutProcessIsUnderway;
    },
    getLogoutError(state) {
      return state.logoutError;
    },
    isUserOnDuty(state) {
      if (!state.lastTakeDutyTime) {
        return false;
      }
      if (state.lastPassDutyTime && state.lastTakeDutyTime.getTime() <= state.lastPassDutyTime.getTime()) {
        return false;
      }
      return true;
    },
    /**
     * Возвращает время сдачи дежурства по умолчанию.
     */
    getDefaultPassDutyTime(_state, getters) {
      if (!getters.isUserOnDuty) {
        return null; // случай, когда пользователь не на дежурстве
      }
      const today = new Date();
      const nowHour = today.getHours();
      if (nowHour > 0 && nowHour < 12) {
        // утренняя сдача дежурства
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0, 0);
      }
      // вечерняя сдача дежурства
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0, 0, 0);
    },
    /**
     *
     */
    ifUserWorksOffline(state) {
      return state.workOffline;
    },
  },

  mutations: {
    /**
     * Сохраняет полномочия пользователя (строка credential).
     * userCredential пользователя в localStorage не меняем, если новый credential не определен.
     */
    [SET_USER_CREDENTIAL] (state, credential) {
      state.credential = credential;
      if (credential) {
        updateUserDataInLocalStorage({ userCredential: credential });
      }
    },

    /**
     * Сохраняет рабочий полигон пользователя.
     * userWorkPoligon - объект с полями type, code, subCode
     * userWorkPoligon пользователя в localStorage не меняем, если новый userWorkPoligon не определен.
     */
    [SET_USER_WORK_POLIGON] (state, userWorkPoligon) {
      state.workPoligon = userWorkPoligon;
      if (userWorkPoligon) {
        updateUserDataInLocalStorage({ userWorkPoligon });
      }
    },

    /**
     * Сохраняет token пользователя (строка token).
     * token пользователя в localStorage не меняем, если новый token не определен.
     */
    [SET_USER_TOKEN] (state, { token }) {
      state.token = token;
      if (token) {
        updateUserDataInLocalStorage({ userToken: token });
      }
    },

    /**
     * Сохраняет дату и время последней сдачи дежурства пользователем (строка lastPassDutyTime).
     * lastPassDutyTime пользователя в localStorage также меняем.
     */
     [SET_USER_PASS_DUTY_TIME] (state, { lastPassDutyTime }) {
      state.lastPassDutyTime = lastPassDutyTime;
      updateUserDataInLocalStorage({ lastPassDutyTime });
    },

    /**
     * Сохраняет даты и время последнего принятия и сдачи дежурства пользователем (строки
     * lastTakeDutyTime и lastPassDutyTime).
     */
    [SET_USER_TAKE_PASS_DUTY_TIMES] (state, { lastTakeDutyTime, lastPassDutyTime }) {
      state.lastTakeDutyTime = lastTakeDutyTime;
      state.lastPassDutyTime = lastPassDutyTime;
      updateUserDataInLocalStorage({ lastTakeDutyTime, lastPassDutyTime });
    },

    [CLEAR_LOGIN_RESULT] (state) {
      state.loginResult = null;
    },

    [SET_LOGIN_RESULT] (state, { error, message }) {
      state.loginResult = {
        error,
        message,
      };
    },

    [SET_USER_DATA_ON_LOGIN] (state, payload) {
      const {
        userId,
        userToken,
        userInfo,
        userCredsWithPoligons,
        userCredential,
        userWorkPoligon,
        lastTakeDutyTime,
        lastPassDutyTime,
      } = payload;

      state.id = userId;
      state.token = userToken;
      state.name = userInfo.name;
      state.surname = userInfo.surname;
      state.fatherName = userInfo.fatherName || '';
      state.post = userInfo.post;
      state.service = userInfo.service;
      state.possibleCredentialsWithPoligons = userCredsWithPoligons; // именно все возможные полномочия в данном приложении!
      state.credential = userCredential;
      state.workPoligon = userWorkPoligon;
      state.lastTakeDutyTime = lastTakeDutyTime,
      state.lastPassDutyTime = lastPassDutyTime,

      state.isAuthenticated = true;
      state.loginDateTime = new Date();

      // Помещаем информацию о пользователе в localStorage - вдруг связь с сервером пропадет и
      // нужно будет хоть как-то работать с системой
      saveUserDataInLocalStorage(JSON.stringify(payload));
    },

    /**
     *
     */
    [CANCEL_LOGOUT] (state) {
      state.startLogout = false;
      state.logoutProcessIsUnderway = false;
      state.logoutError = null;
    },

    /**
     *
     */
    [PREPARE_FOR_LOGOUT] (state, logoutWithDutyPass) {
      state.logoutWithDutyPass = logoutWithDutyPass;
      state.startLogout = true;
    },

    [START_LOGOUT_PROCESS] (state) {
      state.logoutProcessIsUnderway = true;
      state.logoutError = null;
    },

    [LOGOUT_FINISHED_WITH_ERROR] (state, error) {
      state.logoutProcessIsUnderway = false;
      state.logoutError = error;
    },

    [LOGOUT_FINISHED_WITHOUT_ERROR] (state) {
      state.logoutProcessIsUnderway = false;
    },

    [CLEAR_USER_DATA_ON_LOGOUT] (state) {
      state.id = null;
      state.token = null;
      state.name = '';
      state.surname = '';
      state.fatherName = '';
      state.post = '';
      state.service = '';
      state.possibleCredentialsWithPoligons = null;
      state.credential = null;
      state.workPoligon = null;
      state.lastTakeDutyTime = null;
      state.lastPassDutyTime = null;

      state.isAuthenticated = false;
      state.loginDateTime = null;
    },

    [SET_USER_OFFLINE_STATUS] (state, status) {
      if (!state.workOfflineAllTheTime)
        state.workOffline = status;
    },

    [SET_USER_ALL_WORK_OFFLINE_STATUS] (state, status) {
      state.workOfflineAllTheTime = status;
      if (status)
        state.workOffline = status;
    },
  },

  actions: {
    /**
     * Позволяет осуществить вход в систему.
     */
    async [LOGIN_ACTION] (context, payload) {
      const {
        userId,
        jtwToken,
        userInfo,
        lastTakeDutyTime, // не указывается, если takeDuty = true; предполагается, что значение строковое
        lastPassDutyTime, // не указывается, если takeDuty = true; предполагается, что значение строковое
        credentials,
        workPoligons,
        takeDuty,
        lastCredential,
        lastWorkPoligon,
        offline,
      } = payload;

      // Без этой строчки не пойдут запросы на сервер в текущей функции
      context.commit(SET_USER_TOKEN, { token: jtwToken });

      context.commit(CLEAR_LOGIN_RESULT);
      context.state.loginProcessIsUnderway = true;

      try {
        // Проверяем полученную информацию, предназначенную для входа пользователя в систему
        const userCredsWithPoligons = checkUserAuthData({ userId, jtwToken, userInfo, credentials, workPoligons });

        // Для пользователя, для которого определены lastCredential и/или lastWorkPoligon, проверяем,
        // есть ли данные параметры среди userCredsWithPoligons и соответствуют ли они друг другу
        let trueLastCredential = false;
        let trueLastWorkPoligon = false;
        const credWithPoligons = !lastCredential ? null : userCredsWithPoligons.find((cred) => cred.cred === lastCredential);
        if (credWithPoligons) {
          trueLastCredential = true;
          const credPoligon = !lastWorkPoligon ? null : credWithPoligons.poligons.find((poligon) =>
            (poligon.type === lastWorkPoligon.type) &&
            poligon.workPoligons.find((wp) =>
              wp.poligonId === lastWorkPoligon.code &&
              ((!lastWorkPoligon.subCode && !wp.subPoligonId) || (wp.subPoligonId === lastWorkPoligon.subCode))
            )
          );
          if (credPoligon) {
            trueLastWorkPoligon = true;
          } else {
            // если полигон явно не удалось определить, то и полномочие считаем неопределенным
            // (нам нужно, чтобы определены/неопределены были оба одновременно)
            trueLastCredential = false;
          }
        }

        // полномочие, с которым будет работать пользователь (если удалось однозначно определить)
        const userCredential = trueLastCredential ? lastCredential :
          (userCredsWithPoligons && userCredsWithPoligons.length === 1 ? userCredsWithPoligons[0].cred : null);

        // рабочий полигон, на котором будет работать пользователь (если удалось однозначно определить)
        const userWorkPoligon = trueLastWorkPoligon ? lastWorkPoligon :
          (!userCredential || (userCredsWithPoligons[0].poligons.length > 1) ||
            (userCredsWithPoligons[0].poligons[0].workPoligons.length > 1)) ? null :
          {
            type: userCredsWithPoligons[0].poligons[0].type,
            code: userCredsWithPoligons[0].poligons[0].workPoligons[0].poligonId,
            subCode: userCredsWithPoligons[0].poligons[0].workPoligons[0].subPoligonId || null,
          };

        let _lastTakeDutyTime = lastTakeDutyTime; // строка
        let _lastPassDutyTime = lastPassDutyTime; // строка
        let userToken = jtwToken;

        context.commit(SET_USER_ALL_WORK_OFFLINE_STATUS, offline);
        context.commit(SET_USER_OFFLINE_STATUS, offline);

        // если удалось однозначно определить полномочие и рабочий полигон пользователя,
        // то отправляем запрос на сервер о начале работы на данном рабочем полигоне;
        // вид запроса зависит от того, входит пользователь в систему с принятием дежурства или без

        if (!offline && userCredential && userWorkPoligon) {
          let responseData;
          if (takeDuty === true) {
            responseData = await takeDutyUser({
              workPoligonType: userWorkPoligon.type,
              workPoligonId: userWorkPoligon.code,
              workSubPoligonId: userWorkPoligon.subCode,
              specialCredentials: [userCredential],
            });
          } else {
            responseData = await startWorkWithoutTakingDuty({
              workPoligonType: userWorkPoligon.type,
              workPoligonId: userWorkPoligon.code,
              workSubPoligonId: userWorkPoligon.subCode,
              specialCredentials: [userCredential],
            });
          }
          userToken = responseData.token;
          _lastTakeDutyTime = responseData.lastTakeDutyTime;
          _lastPassDutyTime = responseData.lastPassDutyTime;
        }

        context.commit(SET_USER_DATA_ON_LOGIN, {
          userId,
          userToken,
          userInfo,
          userCredsWithPoligons,
          userCredential,
          userWorkPoligon,
          lastTakeDutyTime: _lastTakeDutyTime ? new Date(_lastTakeDutyTime) : null,
          lastPassDutyTime: _lastPassDutyTime ? new Date(_lastPassDutyTime) : null,
          credentials,
          workPoligons,
        });

        const message = (userCredential && userWorkPoligon) ? 'Вход в систему выполнен успешно' :
          'Для входа в систему необходимо определить полномочия и рабочий полигон';
        context.commit(SET_LOGIN_RESULT, { error: false, message });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка входа в систему');
        context.commit(SET_LOGIN_RESULT, { error: true, message: errMessage });

      } finally {
        context.state.loginProcessIsUnderway = false;
      }
    },


    /**
     * Пытается авторизовать пользователя через сессию на сервере.
     */
    async [TRY_LOGIN_VIA_SESSION_ACTION] (context) {
      if (context.state.isAuthenticated) {
        return;
      }
      try {
        const responseData = await whoAmI();
        if (responseData.token) {
          await context.dispatch(LOGIN_ACTION, {
            userId: responseData.userId,
            jtwToken: responseData.token,
            userInfo: responseData.userInfo,
            lastTakeDutyTime: responseData.lastTakeDutyTime,
            lastPassDutyTime: responseData.lastPassDutyTime,
            credentials: responseData.credentials,
            workPoligons: getUserWorkPoligonsArray(responseData),
            takeDuty: false,
            lastCredential: responseData.lastCredential && responseData.lastCredential.length ? responseData.lastCredential[0] : null,
            lastWorkPoligon: responseData.lastWorkPoligon
              ? {
                type: responseData.lastWorkPoligon.type,
                code: responseData.lastWorkPoligon.id,
                subCode: responseData.lastWorkPoligon.workPlaceId,
              } : null,
            offline: false,
          });
        }
      } catch (error) {
        // ничего не делаем при неудачной попытке аутентифицироваться автоматически через сессию,
        // пользователю будет просто предложено снова войти в систему
      }
    },

    /**
     * Пытается авторизовать пользователя через localStorage.
     */
    async [LOGIN_VIA_LOCAL_STORAGE_ACTION] (context) {
      if (context.state.isAuthenticated) {
        return;
      }
      let localStorageUserData = getUserDataFromLocalStorage();
      if (localStorageUserData) {
        localStorageUserData = JSON.parse(localStorageUserData);
        context.dispatch(LOGIN_ACTION, {
          userId: localStorageUserData.userId,
          jtwToken: localStorageUserData.userToken,
          userInfo: localStorageUserData.userInfo,
          lastTakeDutyTime: localStorageUserData.lastTakeDutyTime ? new Date(localStorageUserData.lastTakeDutyTime) : null,
          lastPassDutyTime: localStorageUserData.lastPassDutyTime ? new Date(localStorageUserData.lastPassDutyTime) : null,
          credentials: localStorageUserData.credentials,
          workPoligons: localStorageUserData.workPoligons,
          takeDuty: false,
          lastCredential: localStorageUserData.userCredential,
          lastWorkPoligon: localStorageUserData.userWorkPoligon,
          offline: true,
        });
      }
    },

    /**
     * Позволяет выйти из системы как со сдачей, так и без сдачи дежурства.
     */
    async [LOGOUT_ACTION] (context, { onlyLocally }) {
      if (!context.state.isAuthenticated) {
        return;
      }
      context.commit(START_LOGOUT_PROCESS);

      if (!onlyLocally) {
        try {
          //let responseData;
          if (context.state.logoutWithDutyPass) {
            const responseData = await logoutWithDutyPass();
            context.commit(SET_USER_PASS_DUTY_TIME, responseData.lastPassDutyTime);
          } else {
            /*responseData = */await logoutUser();
          }
          //context.commit(SET_USER_TOKEN, { token: responseData.token });
        }
        catch (error) {
          const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка выхода из системы');
          context.commit(LOGOUT_FINISHED_WITH_ERROR, errMessage);
          return;
        }
      } else {
        context.commit(SET_USER_TOKEN, { token: null });
      }
      // Здесь обязательно нужен хоть какой-то временной интервал, т.к. при onlyLocally = true
      // после context.commit(START_LOGOUT_PROCESS) сразу идет context.commit(LOGOUT_FINISHED_WITHOUT_ERROR),
      // и в коде ShowBeforeLogoutDlg не срабатывает watch на state.logoutProcessIsUnderway
      setTimeout(() => {
        context.commit(LOGOUT_FINISHED_WITHOUT_ERROR);
        context.commit(CLEAR_USER_DATA_ON_LOGOUT);
      }, 100);
    },
  },
};
