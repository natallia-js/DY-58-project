export const getUserFIOString = ({ name, fatherName, surname, additionalInfo }) => {
  return `${surname || ''} ${name && name.length ? name.charAt(0) + '.' : ''}${fatherName && fatherName.length ? fatherName.charAt(0) + '.' : ''}${additionalInfo ? ', ' + additionalInfo : ''}`;
};

export const getUserPostFIOString = ({ post, name, fatherName, surname, additionalInfo }) => {
  return `${post} ${getUserFIOString({ name, fatherName, surname, additionalInfo })}`;
};
