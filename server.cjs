const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");

const app = express();

const port = process.env.PORT || 3000;

const username = process.env.BASIC_AUTH_USER || "admin";
const password = process.env.BASIC_AUTH_PASSWD;

if (process.env.BASIC_AUTH_ENABLED === "true") {
  app.use(
    basicAuth({
      users: {
        [username]: password,
      },
      challenge: true,
      realm: "Protected",
    })
  );

  console.log("Basic authentication enabled");
}

app.use(express.static(path.join(__dirname, "dist")));

app.get("/{*splat}", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
