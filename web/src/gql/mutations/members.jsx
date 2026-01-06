import gql from "graphql-tag";

export const CREATE_MEMBER = gql`
  mutation CreateMember($memberInput: FullMemberInput!) {
    createMember(memberInput: $memberInput) {
      _id
    }
  }
`;

export const EDIT_MEMBER = gql`
  mutation EditMember($memberInput: FullMemberInput!) {
    editMember(memberInput: $memberInput) {
      _id
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation DeleteMember($memberInput: SimpleMemberInput!) {
    deleteMember(memberInput: $memberInput) {
      _id
    }
  }
`;

export const APPROVE_MEMBER = gql`
  mutation ApproveMember($memberInput: SimpleMemberInput!) {
    approveMember(memberInput: $memberInput) {
      _id
    }
  }
`;

export const REJECT_MEMBER = gql`
  mutation RejectMember($memberInput: SimpleMemberInput!) {
    rejectMember(memberInput: $memberInput) {
      _id
    }
  }
`;
