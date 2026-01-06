import gql from "graphql-tag";

export const CREATE_HOLIDAY = gql`
  mutation CreateHoliday($details: InputHolidayDetails!) {
    createHoliday(details: $details) {
      _id
    }
  }
`;

export const EDIT_HOLIDAY = gql`
  mutation EditHoliday($holidayId: String!, $details: InputHolidayDetails!) {
    editHoliday(id: $holidayId, details: $details) {
      _id
    }
  }
`;

export const DELETE_HOLIDAY = gql`
  mutation DeleteHoliday($holidayId: String!) {
    deleteHoliday(id: $holidayId)
  }
`;
