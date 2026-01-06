import gql from "graphql-tag";

export const GET_MEMBERS = gql`
  query Members($clubInput: SimpleClubInput!) {
    members(clubInput: $clubInput) {
      _id
      cid
      uid
      poc
      roles {
        name
        startYear
        endYear
        approved
        rejected
        deleted
      }
    }
  }
`;

export const GET_CURRENT_MEMBERS = gql`
  query CurrentMembers($clubInput: SimpleClubInput!) {
    currentMembers(clubInput: $clubInput) {
      _id
      cid
      uid
      poc
      roles {
        name
        startYear
        endYear
        approved
        rejected
        deleted
      }
    }
  }
`;

export const GET_PENDING_MEMBERS = gql`
  query PendingMembers {
    pendingMembers {
      _id
      cid
      uid
      poc
      roles {
        rid
        name
        startYear
        endYear
        approved
        rejected
        deleted
      }
    }
  }
`;

export const GET_MEMBER = gql`
  query Member($memberInput: SimpleMemberInput!, $userInput: UserInput!) {
    member(memberInput: $memberInput) {
      _id
      uid
      cid
      poc
      roles {
        startYear
        rid
        name
        endYear
        deleted
        approved
        approvalTime
        rejected
        rejectionTime
      }
      creationTime
      lastEditedTime
    }
    userProfile(userInput: $userInput) {
      firstName
      lastName
      gender
      email
    }
    userMeta(userInput: $userInput) {
      img
    }
  }
`;

export const DOWNLOAD_MEMBERS_DATA = gql`
  query DownloadMembersData($details: MemberInputDataReportDetails!) {
    downloadMembersData(details: $details) {
      csvFile
    }
  }
`;
