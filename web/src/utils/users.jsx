export function getUserNameFromUID(uid) {
  const [firstName, lastName] = uid.split(".");

  return {
    firstName: `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`,
    lastName: `${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`,
  };
}
