import axios from "axios";

export async function getUserInfoByGoogle(access_token: string): Promise<unknown> {
  try {
    const resp = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    return resp.data;
  } catch (_error) {
    return null;
  }
}

export async function getUserDOBByGoogle(access_token: string): Promise<unknown> {
  try {
    const resp = await axios.get(
      "https://people.googleapis.com/v1/people/me?personFields=birthdays",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    return resp.data;
  } catch (_error) {
    return null;
  }
}
