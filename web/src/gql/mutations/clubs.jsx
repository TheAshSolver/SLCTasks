import gql from "graphql-tag";

export const CREATE_CLUB = gql`
  mutation CreateClub($clubInput: FullClubInput!) {
    createClub(clubInput: $clubInput) {
      cid
      state
      name
    }
  }
`;

export const EDIT_CLUB = gql`
  mutation EditClub($clubInput: FullClubInput!) {
    editClub(clubInput: $clubInput) {
      cid
      name
      state
    }
  }
`;

export const DELETE_CLUB = gql`
  mutation DeleteClub($clubInput: SimpleClubInput!) {
    deleteClub(clubInput: $clubInput) {
      cid
      name
      state
    }
  }
`;

export const RESTART_CLUB = gql`
  mutation RestartClub($clubInput: SimpleClubInput!) {
    restartClub(clubInput: $clubInput) {
      cid
      name
      state
    }
  }
`;
