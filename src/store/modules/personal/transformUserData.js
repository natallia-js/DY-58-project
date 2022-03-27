export const getUserFIOString = ({ name, fatherName, surname }) => {
  return `${surname || ''} ${name && name.length ? name.charAt(0) + '.' : ''}${fatherName && fatherName.length ? fatherName.charAt(0) + '.' : ''}`;
};

export const getUserPostFIOString = ({ post, name, fatherName, surname }) => {
  return `${post} ${getUserFIOString({ name, fatherName, surname })}`;
};
