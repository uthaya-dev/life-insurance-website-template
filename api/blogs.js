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

app.get("/api/blogs/:slug", async (req, res) => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";
  const { slug } = req.params;

  const queryParams = new URLSearchParams({
    content_type: "blogs",
    "fields.blogSlug": slug,
    access_token: token,
  });

  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // DEBUG LOGS
    console.log("Request slug:", slug);
    console.log("Contentful response:", JSON.stringify(data, null, 2));

    if (data.items && data.items.length > 0) {
      res.json({
        items: data.items,
        includes: data.includes,
      });
    } else {
      res.status(404).send("Blog not found");
    }
  } catch (error) {
    console.error("Error fetching blog from Contentful:", error);
    res.status(500).send("Error fetching blog data");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
