export default async function handler(req, res) {
  const { slug } = req.query;

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  const queryParams = new URLSearchParams({
    content_type: "blogs",
    "fields.blogSlug": slug,
    access_token: token,
  });

  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      res.status(200).json({
        items: data.items,
        includes: data.includes,
      });
    } else {
      res.status(404).send("Blog not found");
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Error fetching blog data");
  }
}
