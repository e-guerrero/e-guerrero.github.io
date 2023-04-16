const express = require('express');
const app = express();
const githubToken = process.env.GITHUB_TOKEN; // Access the GitHub API token from environment variables

app.get('/github-token', (req, res) => {
  res.send({ token: githubToken });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});