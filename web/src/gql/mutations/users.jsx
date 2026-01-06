import gql from "graphql-tag";

export const UPDATE_USERDATA = gql`
  mutation UpdateUserData($userDataInput: UserDataInput!) {
    updateUserData(userDataInput: $userDataInput)
  }
`;

export const UPDATE_USERPHONE = gql`
  mutation UpdateUserPhone($userDataInput: PhoneInput!) {
    updateUserPhone(userDataInput: $userDataInput)
  }
`;
