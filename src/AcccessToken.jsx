const getAccessToken = async () => {
  const clientId = "9d8407ebc28244c2a7047346c8b1fd5d";
  const clientSecret = "770470c49d8c4352a9260e2796198062";

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // btoa: Base64 인코딩
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  console.log("Access Token:", data.access_token);
  return data.access_token;
};
