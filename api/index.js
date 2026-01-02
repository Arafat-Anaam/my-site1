const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <title>موقعي الأول</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      text-align: center;
      padding-top: 80px;
    }
    h1 {
      color: #222;
    }
    p {
      font-size: 18px;
      color: #555;
    }
  </style>
</head>
<body>
  <h1>🚀 مرحبًا بك</h1>
  <p>هذا موقع Node.js مرفوع من الهاتف على Vercel</p>
</body>
</html>
  `);
});

module.exports = app;
