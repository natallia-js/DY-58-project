import { LOCAL_STORAGE_KEY } from '@/constants/appCredentials';


export const saveInLocalStorage = (key, value) => {
  if (key) {
    localStorage.setItem(key, value);
  }
}

export const saveUserDataInLocalStorage = (data) => {
  saveInLocalStorage(LOCAL_STORAGE_KEY, data);
}

export const getUserDataFromLocalStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}

export const updateUserDataInLocalStorage = (objectWithDataToUpdate) => {
  if (objectWithDataToUpdate) {
    let localStorageUserData = getUserDataFromLocalStorage();
    if (localStorageUserData) {
      localStorageUserData = JSON.parse(localStorageUserData);
      for (let prop in objectWithDataToUpdate) {
        localStorageUserData[prop] = objectWithDataToUpdate[prop];
      }
      saveUserDataInLocalStorage(JSON.stringify(localStorageUserData));
    }
  }
}
