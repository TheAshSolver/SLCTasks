"use client";

export function login(pathname) {
  if (pathname == "/") pathname = "";
  // redirect to CAS login with current page as redirect URL
  window.location.replace(`/login${pathname}`);
}

export async function logout(pathname) {
  // redirect to CAS logout
  window.location.replace("/logout");
}
