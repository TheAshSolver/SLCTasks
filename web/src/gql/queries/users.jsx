import gql from "graphql-tag";

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userInput: UserInput!) {
    userProfile(userInput: $userInput) {
      firstName
      lastName
      email
      gender
      batch
      stream
      rollno
    }
    userMeta(userInput: $userInput) {
      uid
      img
      role
      phone
    }
  }
`;

export const GET_USER_LIST_BY_ROLE = gql`
  query GetUserListByRole($role: String!) {
    usersByRole(role: $role) {
      uid
      role
    }
  }
`;
