const express = require("express");
const { getUserRepos, getRepoDetails } = require("../services/githubService");
const { classifyRepo } = require("../services/aiService");
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ message: "Please login first" });
};

function groupByFields(repos) {
  const grouped = {};

  repos.forEach((repo) => {
    repo.fields.forEach((field) => {
      if (!grouped[field]) {
        grouped[field] = { frequency: 0, repos: [] };
      }
      grouped[field].frequency += 1;
      grouped[field].repos.push({
        name: repo.name,
        url: repo.url,
      });
    });
  });

  return Object.fromEntries(
    Object.entries(grouped).sort((a, b) => b[1].frequency - a[1].frequency),
  );
}

router.get("/", isAuthenticated, async (req, res) => {
  const { username, accessToken } = req.user;

  try {
    console.log(`Fetching repos for: ${username}`);
    const rawRepos = await getUserRepos(username, accessToken);
    console.log(`Found ${rawRepos.length} repos`);

    const results = [];

    for (let i = 0; i < rawRepos.length; i += 5) {
      const batch = rawRepos.slice(i, i + 5);
      console.log(`Processing batch ${Math.floor(i / 5) + 1}...`);

      const batchResults = await Promise.all(
        batch.map(async (repo) => {
          const details = await getRepoDetails(
            username,
            repo.name,
            accessToken,
          );
          const classification = await classifyRepo({
            name: repo.name,
            description: repo.description,
            ...details,
          });

          return {
            name: repo.name,
            url: repo.html_url,
            fields: classification.fields,
            techStack: classification.techStack,
          };
        }),
      );

      results.push(...batchResults);

      if (i + 5 < rawRepos.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const groupedByFields = groupByFields(results);

    res.json({
      username,
      total_repos: results.length,
      repos: results,
      groupedByFields,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
