export const socialsData = {
  website: {
    label: "Website",
    icon: "mdi:web",
    color: "#fc7a0a",
    darkcolor: "#fbaf41",
  },
  facebook: {
    label: "Facebook",
    icon: "ic:baseline-facebook",
    regex:
      "(?:(?:http|https)://)?(?:www.)?facebook.com/(?:(?:w)*#!/)?(?:pages/)?(?:[?w-]*/)?(?:profile.php?id=(?=d.*))?([w-]*)?",
    color: "#3C5999",
    darkcolor: "#0868ff",
  },
  instagram: {
    label: "Instagram",
    icon: "mdi:instagram",
    validation: "instagram.com",
    color: "#E94475",
    darkcolor: "#E94475",
  },
  twitter: {
    label: "Twitter/X",
    icon: "ri:twitter-x-fill",
    // validation: "twitter.com",
    regex: "(?:twitter.com|x.com)",
    color: "#000",
    darkcolor: "#fff",
  },
  linkedin: {
    label: "LinkedIn",
    icon: "mdi:linkedin",
    regex: "http(s)?://([w]+.)?linkedin.com/(?:company/|in/)[A-z0-9_-]+/?",
    color: "#027FB1",
    darkcolor: "#e9e9ea",
  },
  discord: {
    label: "Discord",
    icon: "ic:baseline-discord",
    regex:
      "^(https?://)?(www.)?((discord.(gg|io|me|li))|(discordapp.com/invite|discord.com/invite))/[A-z0-9_-]+$",
    color: "#5865F3",
    darkcolor: "#5865f2",
  },
  youtube: {
    label: "YouTube",
    icon: "mdi:youtube",
    regex:
      "^(?:https?://)?(?:www.|gaming.|studio.)?youtube.com/(?:channel/|user/|@)([a-zA-Z0-9-_]+)/?(?:[?#]?.*)$",
    color: "#FF3333",
    darkcolor: "#FF3333",
  },
  whatsapp: {
    label: "WhatsApp Group/Community",
    icon: "mdi:whatsapp",
    regex: "^(https?://)?chat.whatsapp.com/(?:invite/)?([a-zA-Z0-9_-]{22})$",
    color: "#008069",
    darkcolor: "#25D366",
  },
};
