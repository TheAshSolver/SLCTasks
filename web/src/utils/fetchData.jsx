"use server";

import { cache } from "react";
import { notFound } from "next/navigation";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { GET_CLUB } from "gql/queries/clubs";
import { GET_EVENT, GET_FULL_EVENT } from "gql/queries/events";
import { GET_USER_PROFILE } from "gql/queries/users";

export const getClub = cache(async (id) => {
  try {
    const { data: { club } = {} } = await getClient().query(GET_CLUB, {
      clubInput: { cid: id },
    });

    return club;
  } catch (error) {
    notFound();
  }
});

export const getEvent = cache(async (id) => {
  // console.log("Fetching event with id:", id);
  try {
    const { data: { event } = {} } = await getClient().query(GET_EVENT, {
      eventid: id,
    });

    return event;
  } catch (error) {
    notFound();
  }
});

export const getFullEvent = cache(async (id) => {
  // console.log("Fetching full event with id:", id);
  try {
    const { data: { event } = {} } = await getClient().query(GET_FULL_EVENT, {
      eventid: id,
    });

    return event;
  } catch (error) {
    notFound();
  }
});

export const getUserProfile = cache(async (id) => {
  const userInput = { uid: id };

  try {
    const { data: { userProfile, userMeta } = {} } = await getClient().query(
      GET_USER_PROFILE,
      {
        userInput,
      },
    );

    if (userProfile === null || userMeta === null) notFound();

    return { ...userMeta, ...userProfile };
  } catch (error) {
    notFound();
  }
});

export const getCurrentUser = cache(async () => {
  try {
    const { data: { userMeta, userProfile } = {} } = await getClient().query(
      GET_USER,
      { userInput: null },
    );

    if (userMeta === null || userProfile === null) return null;

    return { ...userMeta, ...userProfile };
  } catch (error) {
    return null;
  }
});
