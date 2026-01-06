import gql from "graphql-tag";

export const GET_ALL_FILES = gql`
  query GetStorageFiles($filetype: String!) {
    storagefiles(filetype: $filetype) {
      _id
      title
      filename
      filetype
      latestVersion
      modifiedTime
    }
  }
`;

export const GET_FILE = gql`
  query GetFile($fileId: String!) {
    storagefile(fileId: $fileId) {
      _id
      title
      filename
      filetype
      latestVersion
      modifiedTime
      creationTime
    }
  }
`;
