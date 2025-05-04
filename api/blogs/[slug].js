import fetch from "node-fetch";
import cors from "cors"; // Import the cors package

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://kaathaditechsolution.in"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !token) {
    return res
      .status(500)
      .json({ error: "Contentful credentials are missing." });
  }

  // Construct the query params for Contentful API
  const queryParams = new URLSearchParams({
    content_type: "blogs",
    "fields.blogSlug": slug, // Filter by the slug field
    access_token: token,
  });

  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${queryParams}`;

  try {
    // Make the API call to Contentful
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Contentful: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      res.status(200).json({
        items: data.items,
        includes: data.includes,
      });
    } else {
      res.status(404).json({ error: "Blog not found" });
    }
  } catch (error) {
    console.error("Error fetching blog data:", error);
    res
      .status(500)
      .json({ error: "Error fetching blog data. Please try again later." });
  }
}
