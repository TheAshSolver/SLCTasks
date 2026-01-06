import gql from "graphql-tag";

export const GET_SIGNED_UPLOAD_URL = gql`
  query SignedUploadURL($details: SignedURLInput!) {
    signedUploadURL(details: $details) {
      url
    }
  }
`;
