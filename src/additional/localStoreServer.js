import crypto from 'crypto';

// название БД приложения в IndexedDB
const DB_NAME = 'dy58DB';
// название хранилища объектов распоряжений в IndexedDB
const ORDERS_STORE_NAME = 'dy58Orders';
// название хранилища информации о рабочем полигоне в IndexedDB
const WORK_POLIGON_STORE_NAME = 'workPoligon';
// название ключа записей в хранилищах IndexedDB
const OBJECT_KEY = '_id';

/**
 * Класс, позволяющий хранить НСИ последнего пользователя и массив объектов распоряжений в IndexedDB,
 * а также поддерживать содержимое локальной базы объектов распоряжений в "актуальном" состоянии.
 */
class LocalStoreServer {
  constructor(maxTimeStoreDataInLocalDB) {
    // "выдержка" данных из хранилища распоряжений IndexedDB (основные - оперативные - данные, которые
    // позволят поддерживать хранилище в актуальном состоянии без необходимости к нему обращаться, если
    // данные не изменились)
    this.lastOrdersShortData = [];
    // максимальное время хранения объектов распоряжений в IndexedDB (в миллисекундах)
    this.maxTimeStoreDataInLocalDB = maxTimeStoreDataInLocalDB;
    // ссылка на NoSQL-базу данных браузера (IndexedDB)
    this.db = null;
    // ошибка создания хранилища
    this.createStoreError = null;
    // ошибка чтения хранилища
    this.readStoreError = null;
    // ошибка записи в хранилище информации о распоряжениях
    this.writeStoreOrdersError = null;
    // ошибка записи в хранилище информации о рабочем полигоне
    this.writeStoreWorkPoligonDataError = null;

    // открываем NoSQL-базу данных, которую можно использовать внутри любого браузера для хранения
    // большого количества данных;
    // 1 - это версия нашей локальной БД
    const openRequest = indexedDB.open(DB_NAME, 1);

    const localStoreServerObject = this;

    // срабатывает, если на клиенте нет базы данных;
    // выполняет инициализацию
    openRequest.onupgradeneeded = function(event) {
      // сохраняем ссылку на базу данных
      localStoreServerObject.db = event.target.result;
      // создадим хранилище объектов распоряжений, если его нет (ключ данных в хранилище - поле OBJECT_KEY)
      if (!localStoreServerObject.db.objectStoreNames.contains(ORDERS_STORE_NAME)) {
        localStoreServerObject.db.createObjectStore(ORDERS_STORE_NAME, { keyPath: OBJECT_KEY });
      }
      // создадим хранилище объекта информации о рабочем полигоне, если его нет (ключ данных в хранилище - поле OBJECT_KEY)
      if (!localStoreServerObject.db.objectStoreNames.contains(WORK_POLIGON_STORE_NAME)) {
        localStoreServerObject.db.createObjectStore(WORK_POLIGON_STORE_NAME, { keyPath: OBJECT_KEY });
      }
    };

    openRequest.onerror = function(event) {
      localStoreServerObject.createStoreError =
        `Ошибка создания хранилища в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${openRequest.error}`;
    };

    // срабатывает после завершения onupgradeneeded, а также срабатывает после обновления страницы
    openRequest.onsuccess = function(event) {
      localStoreServerObject.readStoreError = null;

      // получаем и сохраняем ссылку на БД
      localStoreServerObject.db = event.target.result;

      // Далее, из IndexedDB извлекаем "оперативные" данных всех объектов распоряжений и сохраняем их в оперативной памяти.
      // В дальнейшем эти данные понадобятся для отслеживания изменений в массиве объектов распоряжений, чтобы
      // поддерживать хранилище распоряжений IndexedDB в актуальном состоянии.
      const transaction = localStoreServerObject.db.transaction([ORDERS_STORE_NAME], 'readonly');
      // Получаем хранилище объектов распоряжений из транзакции
      const store = transaction.objectStore(ORDERS_STORE_NAME);
      // Извлекаем из хранилища все распоряжения
      const request = store.getAll();

      request.onsuccess = function() {
        if (request.result) {
          // если в хранилище есть распоряжения, то сохраняем в памяти их базовые данные
          localStoreServerObject.lastOrdersShortData = request.result.map((order) => ({
            _id: order._id,
            hash: order.hash,
            createDateTime: order.createDateTime,
          }));
        }
      };

      request.onerror = function(event) {
        localStoreServerObject.readStoreError =
          `Ошибка чтения хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
      };
    };
  }

  /**
   * Для заданной строки dataString вычисляет и возвращает хэш-значение.
   * Предполагается, что строка - сериализованный объект.
   */
  static getDataHash(dataString) {
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  /**
   * Позволяет выяснить, какие объекты из массива data новые, а какие - изменились;
   * при этом оперирует только данными, хранящимися в оперативной памяти, не трогая БД.
   * Как все происходит.
   * Функция вычисляет хэш-значение для каждого входного объекта из массива data.
   * Сравнивает вычисленное значение с хэш-значением аналогичного объекта (поиск по _id) в оперативной памяти.
   * Если хотя бы одно значение не совпадает либо получен объект, которого нет в оперативной памяти, то
   * формируется соответствующий массив (новых / измененных объектов), который возвращается функцией.
   */
  getObjectsChanges(data) {
    // сюда поместим новые объекты (которых нет в БД)
    const newObjects = [];
    // сюда поместим изменившиеся объекты (они есть в БД, но их содержимое изменилось)
    const modifiedObjects = [];

    // выясняем, какие объекты из data новые, а какие - изменились;
    // при этом оперируем только данными, хранящимися в оперативной памяти, не трогая БД
    data.forEach((order) => {
      const serializedData = JSON.stringify(order);
      const hash = LocalStoreServer.getDataHash(serializedData);
      const existingObject = this.lastOrdersShortData.find((item) => item._id === order._id);
      const orderObject = {
        _id: order._id,
        serializedData,
        hash,
        createDateTime: order.createDateTime,
      };
      if (!existingObject) {
        newObjects.push(orderObject);
      } else if (existingObject.hash !== hash) {
        modifiedObjects.push(orderObject);
      }
    });

    return {
      newObjects,
      modifiedObjects,
    };
  }

  /**
   * Проверяет, есть ли среди входных объектов-распоряжений такой, которого нет в БД либо значение которого
   * изменилось. Если да, то обновляет данные в локальной БД.
   * При обновлении данных в БД также проводится проверка хранящихся в ней распоряжений на "актуальность":
   * "просроченые" распоряжения удаляются.
   * Полагаем, что data - массив АКТУАЛЬНЫХ (рабочих) распоряжений (тех, с которыми работает пользователь).
   */
  async checkAndSaveOrdersIfNecessary(data) {
    if (!data || !this.db) return;

    // выясняем, какие объекты из data новые, а какие - изменились
    const { newObjects, modifiedObjects } = this.getObjectsChanges(data);
    // изменений не было - больше ничего не делаем
    if (!newObjects.length && !modifiedObjects.length) {
      return;
    }

    // Изменения в БД вносим только в том случае, если есть что изменять

    // считываем данные, хранящиеся в БД
    const transaction = this.db.transaction([ORDERS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(ORDERS_STORE_NAME);
    const request = store.getAll();

    const localStoreServerObject = this;
    // сюда поместим данные, которые заменят текущие данные в БД
    let newDBData = [];

    // id всех рабочих распоряжений
    const activeOrdersIds = data.map((el) => el._id);

    request.onsuccess = function() {
      localStoreServerObject.writeStoreOrdersError = null;

      if (request.result) {
        // удаляю неактуальные данные (неактуальное распоряжение - такое, которое было издано более
        // maxTimeStoreDataInLocalDB миллисекунд назад, при этом его нет среди data, т.е. нет в массиве
        // рабочих распоряжений)
        newDBData = request.result.filter((el) =>
          (new Date() - el.createDateTime) <= this.maxTimeStoreDataInLocalDB ||
          activeOrdersIds.includes(el._id));
      }
      // добавляем новые данные
      newObjects.forEach((order) => newDBData.push(order));
      // редактируем изменившиеся данные
      modifiedObjects.forEach((order) => {
        const newDBDataObjectIndex = newDBData.findIndex((obj) => obj._id === order._id);
        if (newDBDataObjectIndex >= 0) {
          newDBData[newDBDataObjectIndex] = order;
        } else {
          newDBData.push(order);
        }
      });
      // теперь в newDBData содержится та информация, которая должна быть запомнена локально, а также
      // сохранена в БД; применяем ее, предварительно очистив хранилище в БД
      store.clear();
      newDBData.forEach((order) => {
        // Добавляем распоряжение в хранилище объектов
        store.add(order);
      });
    };

    request.onerror = function(event) {
      localStoreServerObject.writeStoreOrdersError =
        `Ошибка обновления хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
    };

    // Когда все эти запросы будут завершены, завершится и транзакция.
    // Здесь мы уже уверены, что все успешно сохранено в БД, потому сохраняем копию нужных
    // данных в оперативной памяти.
    transaction.oncomplete = () => {
      localStoreServerObject.writeStoreOrdersError = null;

      // обновляем данные в памяти
      localStoreServerObject.lastOrdersShortData = newDBData.map((order) => ({
        _id: order._id,
        hash: order.hash,
        createDateTime: order.createDateTime,
      }));
    };

    transaction.onerror = (event) => {
      localStoreServerObject.writeStoreOrdersError =
        'error renewing orders (code: ' + event.target.errorCode + '): ' + JSON.stringify(event);
    };
  }

  /**
   *
   */
  async checkWorkPoligonDataHash(hashToCheck) {
    if (!hashToCheck || !this.db) return false;
    try {
      const workPoligonData = await this.getLocallySavedUserWorkPoligon();
      return workPoligonData && workPoligonData.hash === hashToCheck ? true : false;
    } catch {
      return false;
    }
  }

  /**
   *
   */
   async checkAdjacentSectorsDataHash(hashToCheck) {
    if (!hashToCheck || !this.db) return false;
    try {
      const workPoligonData = await this.getLocallySavedUserWorkPoligon();
      return workPoligonData && workPoligonData.adjacentSectorsDataHash === hashToCheck ? true : false;
    } catch {
      return false;
    }
  }

  /**
   *
   */
   async checkNearestSectorsDataHash(hashToCheck) {
    if (!hashToCheck || !this.db) return false;
    try {
      const workPoligonData = await this.getLocallySavedUserWorkPoligon();
      return workPoligonData && workPoligonData.nearestSectorsDataHash === hashToCheck ? true : false;
    } catch {
      return false;
    }
  }

  /**
   *
   */
  async getAllLocallySavedOrders() {
    const localStoreServerObject = this;

    return new Promise((resolve, reject) => {
      const transaction = localStoreServerObject.db.transaction([ORDERS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(ORDERS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = function() {
        resolve(request.result || []);
      };

      request.onerror = function(event) {
        localStoreServerObject.readStoreError =
          `Ошибка чтения хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
        reject(new Error(localStoreServerObject.readStoreError));
      };
    });
  }

  /**
   *
   */
  async saveWorkPoligonData(dataToSave) {
    // считываем данные, хранящиеся в БД
    const transaction = this.db.transaction([WORK_POLIGON_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WORK_POLIGON_STORE_NAME);
    store.clear();
    const dataToSaveLocally = {
      _id: dataToSave.ECDS_ID || dataToSave.DNCS_ID,
      serializedData: JSON.stringify(dataToSave),
      hash: dataToSave.hash,
      adjacentSectorsDataHash: dataToSave.adjacentSectorsDataHash,
      nearestSectorsDataHash: dataToSave.nearestSectorsDataHash,
    };
    const request = store.add(dataToSaveLocally);

    const localStoreServerObject = this;

    request.onerror = function(event) {
      localStoreServerObject.writeStoreWorkPoligonDataError =
        `Ошибка обновления хранилища информации о рабочем полигоне в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
    };

    // Когда все эти запросы будут завершены, завершится и транзакция.
    // Здесь мы уже уверены, что все успешно сохранено в БД
    transaction.oncomplete = () => {
      localStoreServerObject.writeStoreWorkPoligonDataError = null;
    };

    transaction.onerror = (event) => {
      localStoreServerObject.writeStoreWorkPoligonDataError =
        'error renewing work poligon data (code: ' + event.target.errorCode + '): ' + JSON.stringify(event);
    };
  }

  /**
   *
   */
  async getLocallySavedUserWorkPoligon() {
    const localStoreServerObject = this;

    return new Promise((resolve, reject) => {
      const transaction = localStoreServerObject.db.transaction([WORK_POLIGON_STORE_NAME], 'readonly');
      const store = transaction.objectStore(WORK_POLIGON_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = function() {
        resolve(request.result && request.result[0] ? JSON.parse(request.result[0].serializedData) : null);
      };

      request.onerror = function(event) {
        localStoreServerObject.readStoreError =
          `Ошибка чтения хранилища информации о рабочем полигоне в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
        reject(new Error(localStoreServerObject.readStoreError));
      };
    });
  }
}

export default LocalStoreServer;
