const BASE_URL = "http://localhost:3000";
const LOGIN_API_URL = `${BASE_URL}/v1/auth/login`;

async function request(url, object) {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(object),
  });
}

async function authRequest(url, object) {
  const token = sessionStorage.getItem("authToken");
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(object),
  });
}

export async function login(username, password) {
  const response = await request(LOGIN_API_URL, { username, password });

  if (response.ok) {
    const { token } = await response.json();
    return token;
  }

  throw new Error(`${response.status} ${response.statusText}`);
}
