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
app.get("/api/blogs/:slug", (req, res) => {
  const slug = req.params.slug;

  // Query Contentful API to get the specific blog based on the slug
  const query = {
    content_type: "blogs",
    "fields.blogSlug": slug,
  };

  contentfulClient
    .getEntries(query)
    .then((entries) => {
      if (entries.items.length > 0) {
        res.json({ items: entries.items, includes: entries.includes });
      } else {
        res.status(404).json({ message: "Blog not found." });
      }
    })
    .catch((err) => {
      console.error("Error fetching blog:", err);
      res.status(500).json({ message: "Error fetching blog." });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
