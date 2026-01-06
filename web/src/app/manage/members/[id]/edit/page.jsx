import { notFound } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_MEMBER } from "gql/queries/members";

import MemberForm from "components/members/MemberForm";

export const metadata = {
  title: "Edit Member",
};

function transformMember(member) {
  return {
    ...member,
    roles:
      member?.roles?.map((role, key) => ({
        ...role,
        id: role?.rid || key,
      })) || [],
  };
}

export default async function EditMember(props) {
  const params = await props.params;
  const { id } = params;

  try {
    const { data: { member, userMeta, userProfile } = {} } =
      await getClient().query(GET_MEMBER, {
        memberInput: {
          cid: id?.split(encodeURIComponent(":"))[0],
          uid: id?.split(encodeURIComponent(":"))[1],
          rid: null,
        },
        userInput: {
          uid: id?.split(encodeURIComponent(":"))[1],
        },
      });

    if (userMeta === null || userProfile === null) {
      notFound();
    }

    return (
      <Container>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            mb: 3,
          }}
        >
          Edit Member Details
        </Typography>
        <MemberForm defaultValues={transformMember(member)} action="edit" />
      </Container>
    );
  } catch (error) {
    notFound();
  }
}
