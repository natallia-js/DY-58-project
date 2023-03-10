function formUserInfoString(user) {
  if (!user) return '';

  const userInfoArray = [];
  if (user.post) userInfoArray.push(user.post);
  if (user.surname) userInfoArray.push(user.surname);
  if (user.name) userInfoArray.push(user.name);
  if (user.fatherName) userInfoArray.push(user.fatherName);
  if (user.appsCredentials?.length) userInfoArray.push(' / имеет полномочия ' + user.appsCredentials.join(', '));
  if (user.contactData) userInfoArray.push(' / ' + user.contactData);
  return userInfoArray.join(' ');
}

export default formUserInfoString;
