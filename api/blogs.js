const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/api/blogs", async (req, res) => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?access_token=${token}&content_type=blogs`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Contentful fetch error:", error);
    res.status(500).json({ error: "Failed to fetch blog data" });
  }
});

// Endpoint for fetching a single blog by slug

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
