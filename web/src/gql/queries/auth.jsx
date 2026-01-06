import gql from "graphql-tag";

export const GET_USER = gql`
  query GetUser($userInput: UserInput) {
    userMeta(userInput: $userInput) {
      uid
      role
      img
    }
    userProfile(userInput: $userInput) {
      email
      firstName
      lastName
    }
  }
`;
