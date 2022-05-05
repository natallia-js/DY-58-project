import {
  APP_CODE_NAME,
  APP_CREDENTIALS,
  USER_CREDENTIALS_LOCAL_STORAGE_NAME,
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
} from '@/store/mutation-types';
import {
  startWorkWithoutTakingDuty,
  takeDutyUser,
  logoutUser,
  logoutWithDutyPass,
} from '@/serverRequests/auth.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { getUserFIOString, getUserPostFIOString } from '@/store/modules/personal/transformUserData';


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
    }
  },

  mutations: {
    /**
     * Сохраняет полномочия пользователя (строка credential), в т.ч. в LocalStorage.
     */
    [SET_USER_CREDENTIAL] (state, credential) {
      state.credential = credential;

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
      locStorUserData.lastCredential = credential;
      localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
    },

    /**
     * Сохраняет рабочий полигон пользователя, в т.ч. в LocalStorage.
     * workPoligon - объект с полями type, code, subCode
     */
    [SET_USER_WORK_POLIGON] (state, workPoligon) {
      state.workPoligon = workPoligon;

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
      locStorUserData.lastWorkPoligon = workPoligon;
      localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
    },

    /**
     * Сохраняет token пользователя (строка token), в т.ч. в LocalStorage.
     */
    [SET_USER_TOKEN] (state, { token, saveInLocalStorage }) {
      state.token = token;

      if (saveInLocalStorage) {
        const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
        locStorUserData.userToken = token;
        localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
      }
    },

    /**
     * Сохраняет дату и время последней сдачи дежурства пользователем (строка lastPassDutyTime),
     * в т.ч. в LocalStorage.
     */
     [SET_USER_PASS_DUTY_TIME] (state, { lastPassDutyTime }) {
      state.lastPassDutyTime = lastPassDutyTime;

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
      locStorUserData.lastPassDutyTime = lastPassDutyTime;
      localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
    },

    /**
     * Сохраняет даты и время последнего принятия и сдачи дежурства пользователем (строки
     * lastTakeDutyTime и lastPassDutyTime), в т.ч. в LocalStorage.
     */
    [SET_USER_TAKE_PASS_DUTY_TIMES] (state, { lastTakeDutyTime, lastPassDutyTime }) {
      state.lastTakeDutyTime = lastTakeDutyTime;
      state.lastPassDutyTime = lastPassDutyTime;

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
      locStorUserData.lastTakeDutyTime = lastTakeDutyTime;
      locStorUserData.lastPassDutyTime = lastPassDutyTime;
      localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
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

      localStorage.removeItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME);

      state.isAuthenticated = false;
      state.loginDateTime = null;
    },
  },

  actions: {
    /**
     * Позволяет осуществить вход в систему.
     */
    async login(context, payload) {
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
      } = payload;

      // Без этой строчки не пойдут запросы на сервер в текущей функции
      context.commit(SET_USER_TOKEN, { token: jtwToken, saveInLocalStorage: false });

      context.commit(CLEAR_LOGIN_RESULT);
      context.state.loginProcessIsUnderway = true;

      try {
        // Проверяем полученную информацию, предназначенную для входа пользователя в систему
        const userCredsWithPoligons = checkUserAuthData(payload);

        // Для пользователя, для которого определены lastCredential и/или lastWorkPoligon (это происходит
        // при входе в систему с данными, подгруженными из Local Storage), проверяем,
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

        // если удалось однозначно определить полномочие и рабочий полигон пользователя,
        // то отправляем запрос на сервер о начале работы на данном рабочем полигоне;
        // вид запроса зависит от того, входит пользователь в систему с принятием дежурства или без

        if (userCredential && userWorkPoligon) {
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

        localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify({
          userId,
          userToken,
          userInfo,
          userCredentials: credentials, // именно все полномочия во всех приложениях ГИД НЕМАН!
          userWorkPoligons: workPoligons,
          lastTakeDutyTime: _lastTakeDutyTime,
          lastPassDutyTime: _lastPassDutyTime,
          lastCredential: userCredential, // полномочие ДСП, Оператора при ДСП, ДНЦ либо ЭЦД
          lastWorkPoligon: userWorkPoligon,
        }));

        context.commit(SET_USER_DATA_ON_LOGIN, {
          userId,
          userToken,
          userInfo,
          userCredsWithPoligons,
          userCredential,
          userWorkPoligon,
          lastTakeDutyTime: _lastTakeDutyTime ? new Date(_lastTakeDutyTime) : null,
          lastPassDutyTime: _lastPassDutyTime ? new Date(_lastPassDutyTime) : null,
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
     * Пытается авторизовать пользователя через LocalStorage браузера.
     */
    async tryLoginViaLocalStorage(context) {
      if (context.state.isAuthenticated) {
        return;
      }

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));

      if (!locStorUserData || !locStorUserData.userId || !locStorUserData.userToken ||
        !locStorUserData.userInfo || !locStorUserData.userCredentials || !locStorUserData.userWorkPoligons) {
        return;
      }

      await context.dispatch('login', {
        userId: locStorUserData.userId,
        jtwToken: locStorUserData.userToken,
        userInfo: locStorUserData.userInfo,
        lastTakeDutyTime: locStorUserData.lastTakeDutyTime,
        lastPassDutyTime: locStorUserData.lastPassDutyTime,
        credentials: locStorUserData.userCredentials,
        workPoligons: locStorUserData.userWorkPoligons,
        // Login из Local Storage не подразумевает вход в систему с дополнительным принятием дежурства
        takeDuty: false,
        lastCredential: locStorUserData.lastCredential,
        lastWorkPoligon: locStorUserData.lastWorkPoligon,
      });
    },

    /**
     * Позволяет выйти из системы как со сдачей, так и без сдачи дежурства.
     */
    async logout(context) {
      if (!context.state.isAuthenticated) {
        return;
      }
      context.commit(START_LOGOUT_PROCESS);
      try {
        let responseData;
        if (context.state.logoutWithDutyPass) {
          responseData = await logoutWithDutyPass();
          context.commit(SET_USER_PASS_DUTY_TIME, responseData.lastPassDutyTime);
        } else {
          responseData = await logoutUser();
        }
        context.commit(SET_USER_TOKEN, { token: responseData.token, saveInLocalStorage: true });
      }
      catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка выхода из системы');
        context.commit(LOGOUT_FINISHED_WITH_ERROR, errMessage);
        return;
      }
      context.commit(LOGOUT_FINISHED_WITHOUT_ERROR);
      context.commit(CLEAR_USER_DATA_ON_LOGOUT);
    },
  },
};
