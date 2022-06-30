import crypto from 'crypto';

const STORE_NAME = 'dy58Orders';
const DB_NAME = 'lastOrdersDB';
const OBJECT_KEY = '_id';

/**
 * Класс, позволяющий хранить массив объектов распоряжений в IndexedDB и поддерживать
 * содержимое локальной базы в "актуальном" состоянии.
 */
class LocalStoreServer {
  constructor(maxTimeStoreDataInLocalDB) {
    // "выдержка" данных из хранилища распоряжений IndexedDB (основные - оперативные - данные, которые
    // позволят поддерживать хранилище в актуальном состоянии без необходимости к нему обращаться, если
    // данные не изменились)
    this.lastOrdersShortData = [];
    // максимальное время хранения данных (в миллисекундах)
    this.maxTimeStoreDataInLocalDB = maxTimeStoreDataInLocalDB;
    // ссылка на NoSQL-базу данных браузера (IndexedDB)
    this.db = null;
    // название хранилища объектов распоряжений в IndexedDB
    this.storeName = STORE_NAME;
    // ошибка создания хранилища
    this.createStoreError = null;
    // ошибка чтения хранилища
    this.readStoreError = null;
    // ошибка записи в хранилище
    this.writeStoreError = null;

    // открываем NoSQL-базу данных, которую можно использовать внутри любого браузера для хранения большого количества данных;
    // 1 - это версия нашей локальной БД
    const openRequest = indexedDB.open(DB_NAME, 1);

    const localStoreServerObject = this;

    // срабатывает, если на клиенте нет базы данных;
    // выполняет инициализацию
    openRequest.onupgradeneeded = function(event) {
      // сохраняем ссылку на базу данных
      localStoreServerObject.db = event.target.result;
      // создадим хранилище объектов, если его нет (ключ данных в хранилище - поле _id)
      if (!localStoreServerObject.db.objectStoreNames.contains(localStoreServerObject.storeName)) {
        localStoreServerObject.db.createObjectStore(localStoreServerObject.storeName, { keyPath: OBJECT_KEY });
      }
    };

    openRequest.onerror = function(event) {
      localStoreServerObject.createStoreError =
        `Ошибка создания хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${openRequest.error}`;
    };

    // срабатывает после завершения onupgradeneeded, а также срабатывает после обновления страницы
    openRequest.onsuccess = function(event) {
      localStoreServerObject.readStoreError = null;

      // получаем и сохраняем ссылку на БД
      localStoreServerObject.db = event.target.result;

      // Далее, из IndexedDB извлекаем "оперативные" данных всех объектов распоряжений и сохраняем их в памяти.
      // В дальнейшем эти данные понадобятся для отслеживания изменений в массиве объектов
      // для поддержания хранилища распоряжений IndexedDB в актуальном состоянии.
      const transaction = localStoreServerObject.db.transaction([localStoreServerObject.storeName], 'readonly');
      // Получаем хранилище объектов распоряжений из транзакции
      const store = transaction.objectStore(localStoreServerObject.storeName);
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
   * Для данной строки dataString вычисляет и возвращает хэш-значение.
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
   * Проверяет, есть ли среди входных объектов такой, которого нет в БД либо значение которого
   * изменилось. Если да, то обновляет данные в локальной БД.
   * При обновлении данных в БД также проводится проверка хранящихся в ней распоряжений на "актуальность":
   * "просроченые" распоряжения удаляются.
   * Полагаем, что data - массив АКТУАЛЬНЫХ (рабочих) распоряжений (тех, с которыми работает пользователь).
   */
  async checkAndSaveDataIfNecessary(data) {
    if (!data || !this.db) return;

    // выясняем, какие объекты из data новые, а какие - изменились
    const { newObjects, modifiedObjects } = this.getObjectsChanges(data);
    // изменений не было - больше ничего не делаем
    if (!newObjects.length && !modifiedObjects.length) {
      return;
    }

    // Изменения в БД вносим только в том случае, если есть что изменять

    // считываем данные, хранящиеся в БД
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    const localStoreServerObject = this;
    // сюда поместим данные, которые заменят текущие данные в БД
    let newDBData = [];

    // id всех рабочих распоряжений
    const activeOrdersIds = data.map((el) => el._id);

    request.onsuccess = function() {
      localStoreServerObject.writeStoreError = null;

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
      localStoreServerObject.writeStoreError =
        `Ошибка обновления хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
    };

    // Когда все эти запросы будут завершены, завершится и транзакция.
    // Здесь мы уже уверены, что все успешно сохранено в БД, потому сохраняем копию нужных
    // данных в оперативной памяти.
    transaction.oncomplete = () => {
      localStoreServerObject.writeStoreError = null;

      // обновляем данные в памяти
      localStoreServerObject.lastOrdersShortData = newDBData.map((order) => ({
        _id: order._id,
        hash: order.hash,
        createDateTime: order.createDateTime,
      }));
    };

    transaction.onerror = (event) => {
      localStoreServerObject.writeStoreError =
        'error renewing orders (code: ' + event.target.errorCode + '): ' + JSON.stringify(event);
    };
  }

  async getAllData() {
    const localStoreServerObject = this;

    return new Promise((resolve, reject) => {
      const transaction = localStoreServerObject.db.transaction([localStoreServerObject.storeName], 'readonly');
      const store = transaction.objectStore(localStoreServerObject.storeName);
      const request = store.getAll();

      request.onsuccess = function() {
        resolve(request.result || []);
      };

      request.onerror = function(event) {
        localStoreServerObject.readStoreError =
          `Ошибка чтения хранилища объектов распоряжений в IndexedDB. Код ошибки ${event?.target?.errorCode || '?'}. Ошибка: ${request.error}`;
        reject(event);
      };
    });
  }
}

export default LocalStoreServer;
