const path = require("path");
const express = require("express");

const app = express();
const port = Number(process.env.PREVIEW_PORT || 4173);

app.use(express.static(path.join(__dirname, "..", "..", "public")));

app.listen(port, "127.0.0.1", () => {
  console.log(`Static preview: http://127.0.0.1:${port}`);
});
