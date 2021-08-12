import {
  APP_CODE_NAME,
  APP_CREDENTIALS,
  USER_CREDENTIALS_LOCAL_STORAGE_NAME,
  WORK_POLIGON_TYPES,
} from '../../constants/appCredentials';


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
      userAppCredentials = cred.creds;
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

  // Осталось проверить рабочие полигоны. Причем во взаимосвязи с полномочиями пользователя: конкретный тип полномочия
  // подразумевает конкретный тип рабочего полигона.
  if (!workPoligons || !workPoligons.length) {
    throw new Error('Для данного пользователя не определен рабочий полигон. Обратитесь к Администратору Системы')
  }

  let userCredsWithPoligons = [];
  let workPoligonExists = false; // будет true, если хотя бы для одного из типов полномочий существует хотя бы один рабочий полигон
  userAppCredentials.forEach((cred) => {
    const obj = { cred };
    if (cred === APP_CREDENTIALS.DSP_FULL) {
      obj.poligons = workPoligons.filter((poligon) => poligon.type === WORK_POLIGON_TYPES.STATION);
    } else if (cred === APP_CREDENTIALS.DNC_FULL) {
      obj.poligons = workPoligons.filter((poligon) => poligon.type === WORK_POLIGON_TYPES.DNC_SECTOR);
    } else if (cred === APP_CREDENTIALS.ECD_FULL) {
      obj.poligons = workPoligons.filter((poligon) => poligon.type === WORK_POLIGON_TYPES.ECD_SECTOR);
    }
    if (obj.poligons.length) {
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
    id: null,           // id пользователя
    name: '',         // имя
    fatherName: '',   // отчество
    surname: '',      // фамилия
    post: '',         // должность
    service: '',      // принадлежность службе
    token: null,
    possibleCredentialsWithPoligons: null, // все полномочия пользователя в данной системе с соответствующими возможными
                                           // рабочими полигонами (из них необходимо выбрать одно полномочие и один полигон)
    credential: null, // конкретное (одно) полномочие пользователя в данной системе
    workPoligon: null,  // информация о рабочем полигоне (одном) пользователя
    isAuthenticated: false, // true (прошел) либо false (не прошел) пользователь аутентификацию в системе
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
    getUserPostFIO(state) {
      return `${state.post} ${state.surname} ${state.name.charAt(0)}.` + `${state.fatherName ? state.fatherName.charAt(0) + '.' : ''}`;
    },
    getUserToken(state) {
      return state.token;
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
    isUserAuthenticated(state) {
      return state.isAuthenticated;
    },
  },

  mutations: {
    setUserCredential(state, credential) {
      if (credential) {
        state.credential = credential;

        const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
        locStorUserData.lastCredential = credential;
        localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
      }
    },

    setUserWorkPoligon(state, workPoligon) {
      if (workPoligon) {
        state.workPoligon = workPoligon;

        const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));
        locStorUserData.lastWorkPoligon = workPoligon;
        localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify(locStorUserData));
      }
    },

    /**
     *
     */
    login(state, payload) {
      const {
        userId,
        jtwToken,
        userInfo,
        credentials,
        workPoligons,
        lastCredential,
        lastWorkPoligon,
      } = payload;

      // Проверяем полученную информацию, предназначенную для входа пользователя в систему
      const userCredsWithPoligons = checkUserAuthData(payload);

      // Для пользователя, для которого определены lastCredential и/или lastWorkPoligon, проверяем,
      // если данные параметры среди userCredsWithPoligons и соответствуют ли они друг другу
      let trueLastCredential = false;
      let trueLastWorkPoligon = false;
      const credWithPoligons = !lastCredential ? null : userCredsWithPoligons.find((cred) => cred.cred === lastCredential);
      if (credWithPoligons) {
        trueLastCredential = true;
        const credPoligon = !lastWorkPoligon ? null : credWithPoligons.poligons.find((poligon) =>
          (poligon.type === lastWorkPoligon.type) && poligon.workPoligons.includes(lastWorkPoligon.code));
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
console.log(userCredential)
      // рабочий полигон, на котором будет работать пользователь (если удалось однозначно определить)
      const userWorkPoligon = trueLastWorkPoligon ? lastWorkPoligon :
        (!userCredential || userCredsWithPoligons[0].poligons[0].workPoligons.length > 1) ? null :
        {
          type: userCredsWithPoligons[0].poligons[0].type,
          code: userCredsWithPoligons[0].poligons[0].workPoligons[0],
        };
console.log(userWorkPoligon)
      localStorage.setItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME, JSON.stringify({
        userId,
        userToken: jtwToken,
        userInfo,
        userCredentials: credentials, // именно все полномочия во всех приложениях ГИД НЕМАН!
        userWorkPoligons: workPoligons,
        lastCredential: userCredential,
        lastWorkPoligon: userWorkPoligon,
      }));

      state.id = userId;
      state.token = jtwToken;
      state.name = userInfo.name;
      state.surname = userInfo.surname;
      state.fatherName = userInfo.fatherName ? userInfo.fatherName : '';
      state.post = userInfo.post;
      state.service = userInfo.service;
      state.possibleCredentialsWithPoligons = userCredsWithPoligons; // именно все возможные полномочия в данном приложении!
      state.credential = userCredential;
      state.workPoligon = userWorkPoligon;

      state.isAuthenticated = true;
    },

    /**
     *
     */
    tryLoginViaLocalStorage(state) {
      if (state.isAuthenticated) {
        return;
      }

      const locStorUserData = JSON.parse(localStorage.getItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME));

      if (!locStorUserData || !locStorUserData.userToken || !locStorUserData.userInfo ||
        !locStorUserData.userCredentials || !locStorUserData.userWorkPoligons) {
        return;
      }

      try {
        this.commit('login', {
          userId: locStorUserData.userId,
          jtwToken: locStorUserData.userToken,
          userInfo: locStorUserData.userInfo,
          credentials: locStorUserData.userCredentials,
          workPoligons: locStorUserData.userWorkPoligons,
          lastCredential: locStorUserData.lastCredential,
          lastWorkPoligon: locStorUserData.lastWorkPoligon,
        });

      } catch (e) {
        // do nothing
      }
    },

    /**
     *
     */
    logout(state) {
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

      localStorage.removeItem(USER_CREDENTIALS_LOCAL_STORAGE_NAME);

      state.isAuthenticated = false;
    },
  },
};
