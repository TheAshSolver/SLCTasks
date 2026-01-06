import { Container } from "@mui/material";

import { getClient } from "gql/client";
import { GET_MEMBERS } from "gql/queries/members";

import LocalUsersGrid from "components/users/LocalUsersGrid";

import {
  advisorWords,
  executiveBoardWords,
  extendedMembersWords,
  techTeamWords,
} from "constants/ccMembersFilterWords";

import Content from "./content.mdx";

export const metadata = {
  title: "About | Clubs Council @ IIIT-H",
};

export default async function ClubsCouncil() {
  const { data: { members } = {} } = await getClient().query(GET_MEMBERS, {
    clubInput: {
      cid: "clubs",
    },
  });

  const executiveMembers = members
    ?.map((member) => {
      const { roles } = member;
      const executiveBoardRoles = filterRoles(
        roles,
        executiveBoardWords,
        techTeamWords,
      );
      const newMember = { ...member, roles: executiveBoardRoles };
      return newMember;
    })
    ?.filter((member) => {
      return member.roles.length > 0;
    })
    ?.sort((a, b) => {
      const roleNameA = a.roles[0]?.name.toLowerCase();
      const roleNameB = b.roles[0]?.name.toLowerCase();
      if (roleNameA < roleNameB) {
        return -1;
      }
      if (roleNameA > roleNameB) {
        return 1;
      }
      return 0;
    });

  const advisoryMembers = members
    ?.map((member) => {
      const { roles } = member;
      const advisorWordsCombined = advisorWords.concat(executiveBoardWords);
      const advisorRoles = filterRoles(
        roles,
        advisorWordsCombined,
        techTeamWords,
      );
      const newMember = { ...member, roles: advisorRoles };
      return newMember;
    })
    ?.filter((member) => {
      if (member.roles.length <= 0) return false;

      const role0 = member.roles[0]?.name.toLowerCase();
      const matchesAdvisoryFilterWords = advisorWords.some((word) =>
        role0.includes(word),
      );
      return matchesAdvisoryFilterWords;
    });

  const extendedMembers = members
    ?.map((member) => {
      const { roles } = member;
      const extendedMembersRoles = filterRoles(roles, extendedMembersWords);
      const newMember = { ...member, roles: extendedMembersRoles };
      return newMember;
    })
    ?.filter((member) => {
      return member.roles.length > 0;
    });

  return (
    <Container>
      <Content
        ccMembers={
          executiveMembers?.length ? (
            <LocalUsersGrid users={executiveMembers} />
          ) : null
        }
        advisoryMembers={
          advisoryMembers?.length ? (
            <LocalUsersGrid users={advisoryMembers} />
          ) : null
        }
        extendedMembers={
          extendedMembers?.length ? (
            <LocalUsersGrid users={extendedMembers} />
          ) : null
        }
      />
    </Container>
  );
}

const filterRoles = (roles, filterWords, unfilterWords = []) => {
  // Filter roles that meet the filterWords criteria and are not in the unfilterWords list
  let filteredRoles = roles?.filter((role) => {
    const { name, endYear } = role;
    const lowercaseName = name.toLowerCase();
    const matchesFilterWords = filterWords.some((word) =>
      lowercaseName.includes(word),
    );
    const matchesUnfilterWords = unfilterWords.some((word) =>
      lowercaseName.includes(word),
    );
    return matchesFilterWords && !matchesUnfilterWords && endYear === null;
  });

  // If any roles are filtered, return those that match filterWords and not unfilterWords
  if (filteredRoles?.length > 0) {
    return roles
      ?.filter((role) => {
        const { name } = role;
        const lowercaseName = name.toLowerCase();
        const matchesFilterWords = filterWords.some((word) =>
          lowercaseName.includes(word),
        );
        const matchesUnfilterWords = unfilterWords.some((word) =>
          lowercaseName.includes(word),
        );
        return matchesFilterWords && !matchesUnfilterWords;
      })
      ?.sort((a, b) => {
        // Place roles with endYear=null at the top
        if (a.endYear === null && b.endYear !== null) {
          return -1;
        } else if (a.endYear !== null && b.endYear === null) {
          return 1;
        } else {
          // Sort based on endYear in descending order
          return b.endYear - a.endYear;
        }
      });
  } else {
    return filteredRoles;
  }
};
