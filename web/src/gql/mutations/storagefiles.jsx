import gql from "graphql-tag";

export const CREATE_STORAGEFILE = gql`
  mutation CreateStorageFile($details: StorageFileInput!) {
    createStorageFile(details: $details) {
      _id
    }
  }
`;

export const UPDATE_STORAGEFILE = gql`
  mutation UpdateStorageFile($fileId: String!, $version: Int!) {
    updateStorageFile(id: $fileId, version: $version)
  }
`;

export const DELETE_STORAGEFILE = gql`
  mutation DeleteStorageFile($fileId: String!) {
    deleteStorageFile(id: $fileId)
  }
`;
