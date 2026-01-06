import gql from "graphql-tag";

export const CREATE_EVENT = gql`
  mutation CreateEvent($details: InputEventDetails!) {
    createEvent(details: $details) {
      _id
    }
  }
`;

export const EDIT_EVENT = gql`
  mutation EditEvent($details: InputEditEventDetails!) {
    editEvent(details: $details) {
      _id
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($eventid: String!) {
    deleteEvent(eventid: $eventid) {
      _id
    }
  }
`;

export const PROGRESS_EVENT = gql`
  mutation ProgressEvent(
    $eventid: String!
    $ccProgressBudget: Boolean
    $ccProgressRoom: Boolean
    $ccApprover: String
    $slcMembersForEmail: [String!]
  ) {
    progressEvent(
      eventid: $eventid
      ccProgressBudget: $ccProgressBudget
      ccProgressRoom: $ccProgressRoom
      ccApprover: $ccApprover
      slcMembersForEmail: $slcMembersForEmail
    ) {
      _id
    }
  }
`;

export const REJECT_EVENT = gql`
  mutation REJECT_EVENT($eventid: String!, $reason: String!) {
    rejectEvent(eventid: $eventid, reason: $reason) {
      _id
    }
  }
`;

export const UPDATE_BILLS_STATUS = gql`
  mutation UpdateBillsStatus($details: InputBillsStatus!) {
    updateBillsStatus(details: $details) {
      state
      sloComment
    }
  }
`;

export const ADD_BILL = gql`
  mutation AddBill($details: InputBillsUpload!) {
    addBill(details: $details)
  }
`;

export const ADD_EVENT_REPORT = gql`
  mutation AddEventReport($details: InputEventReport!) {
    addEventReport(details: $details) {
      eventid
      summary
      attendance
      prizes
      prizesBreakdown
      winners
      photosLink
      feedbackCc
      feedbackCollege
      submittedBy
      submittedTime
    }
  }
`;

export const EDIT_EVENT_REPORT = gql`
  mutation EditEventReport($details: InputEventReport!) {
    editEventReport(details: $details) {
      eventid
      summary
      attendance
      prizes
      prizesBreakdown
      winners
      photosLink
      feedbackCc
      feedbackCollege
      submittedBy
      submittedTime
    }
  }
`;

export const REMIND_SLO = gql`
  mutation RemindSlo($eventid: String!) {
    remindSLO(eventid: $eventid)
  }
`;
