import gql from "graphql-tag";

export const APPLY_FOR_CC = gql`
  mutation CCApply($ccRecruitmentInput: CCRecruitmentInput!) {
    ccApply(ccRecruitmentInput: $ccRecruitmentInput)
  }
`;
