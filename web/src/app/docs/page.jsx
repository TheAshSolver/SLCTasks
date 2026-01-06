import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_ALL_FILES } from "gql/queries/storagefiles";

import DocsList from "components/docs/DocsList";

export const metadata = {
  title: "Important Documents | Life @ IIIT-H",
};

export default async function Docs() {
  const { data: { storagefiles } = {} } = await getClient().query(
    GET_ALL_FILES,
    {
      filetype: "pdf",
    },
  );

  const { data: { userMeta, userProfile } = {} } = await getClient().query(
    GET_USER,
    { userInput: null },
  );
  const user = { ...userMeta, ...userProfile };
  const isPriviliged = user?.role == "cc" ? true : false;

  return <DocsList allFiles={storagefiles} priviliged={isPriviliged} />;
}
