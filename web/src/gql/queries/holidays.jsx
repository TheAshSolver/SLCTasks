import gql from "graphql-tag";

export const GET_HOLIDAYS = gql`
  query GetHolidays {
    holidays {
      _id
      name
      date
      description
    }
  }
`;

export const GET_HOLIDAY = gql`
  query GetHoliday($id: String!) {
    holiday(id: $id) {
      _id
      name
      date
      description
    }
  }
`;
