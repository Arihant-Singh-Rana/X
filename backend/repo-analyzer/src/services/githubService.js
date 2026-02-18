const axios = require("axios");

const GITHUB_API = "https://api.github.com";

const getHeaders = (token) => ({
  Accept: "application/vnd.github.v3+json",
  Authorization: `token ${token}`,
});

async function getUserRepos(username, token) {
  const repos = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
      headers: getHeaders(token),
      params: { per_page: 100, page, sort: "updated" },
    });

    if (!data.length) break;
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }

  return repos;
}

async function getRepoDetails(username, repoName, token) {
  const [readme, languages, topics] = await Promise.allSettled([
    axios
      .get(`${GITHUB_API}/repos/${username}/${repoName}/readme`, {
        headers: getHeaders(token),
      })
      .then((r) =>
        Buffer.from(r.data.content, "base64").toString("utf-8").slice(0, 1500),
      ),

    axios
      .get(`${GITHUB_API}/repos/${username}/${repoName}/languages`, {
        headers: getHeaders(token),
      })
      .then((r) => Object.keys(r.data)),

    axios
      .get(`${GITHUB_API}/repos/${username}/${repoName}/topics`, {
        headers: {
          ...getHeaders(token),
          Accept: "application/vnd.github.mercy-preview+json",
        },
      })
      .then((r) => r.data.names),
  ]);

  return {
    readme: readme.status === "fulfilled" ? readme.value : "",
    languages: languages.status === "fulfilled" ? languages.value : [],
    topics: topics.status === "fulfilled" ? topics.value : [],
  };
}

module.exports = { getUserRepos, getRepoDetails };
