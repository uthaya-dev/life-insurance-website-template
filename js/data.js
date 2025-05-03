// Fetch blog content from your own backend API
function fetchBlogsFromBackend() {
  fetch("http://localhost:5000/api/blogs")
    .then((response) => response.json())
    .then((result) => {
      console.log("Fetched blog data:", result); // Log entire result to inspect

      // Ensure 'items' is present and is an array
      if (!result || !Array.isArray(result.items)) {
        console.error("Missing or invalid 'items' in response.");
        console.log("Actual response:", result); // Log actual response to inspect structure
        return;
      }

      console.log("Includes object:", result.includes);

      result.items.forEach((item) => {
        const blogItem = transformBlogData(item, result.includes); // pass includes here
        renderBlog(blogItem);
      });
    })
    .catch((err) => console.error("Error fetching blogs:", err));
}

// Transform Contentful item into blog object
function transformBlogData(item, includes) {
  const fields = item.fields;
  let blogThumbnailImage = "";

  const imageId = fields.blogThumbnailImage?.sys?.id;
  if (imageId && includes?.Asset) {
    const imageAsset = includes.Asset.find((asset) => asset.sys.id === imageId);
    if (imageAsset) {
      let url = imageAsset.fields.file.url;
      if (url && !url.startsWith("https:")) {
        url = "https:" + url;
      }
      blogThumbnailImage = url;
    }
  }

  // Process blogDescription from rich text
  const blogDescription = convertRichTextToHtml(fields.blogDescription);

  return {
    blogTitle: fields.blogTitle || "No Title",
    blogSlug: fields.blogSlug || "",
    blogDescription, // Processed HTML content
    blogDate: fields.blogDate || "",
    blogAuthor: fields.blogAuthor || "",
    blogTag: fields.blogTag || "",
    blogThumbnailImage,
  };
}

// Convert rich text to HTML
function convertRichTextToHtml(richText) {
  if (!richText || !richText.content) return ""; // Return empty if invalid or empty content

  let htmlContent = "";

  richText.content.forEach((node) => {
    if (node.nodeType === "paragraph") {
      let paragraph = "";
      node.content.forEach((textNode) => {
        if (textNode.nodeType === "text") {
          const text = textNode.marks.length
            ? `<strong>${textNode.value}</strong>`
            : textNode.value;
          paragraph += text;
        }
      });
      htmlContent += `<p>${paragraph}</p>`;
    }
  });

  return htmlContent;
}

// Render a single blog
function renderBlog(blogItem) {
  console.log("Rendering blog item:", blogItem);
  const blogListContainer = document.getElementById("blog-list");

  const blogTitle = blogItem.blogTitle.slice(0, 50) + "...";
  const truncatedDescription = blogItem.blogDescription.slice(0, 100) + "...";

  const blogElement = document.createElement("div");
  blogElement.classList.add("col-lg-6", "col-xl-4", "wow", "fadeInUp");
  blogElement.setAttribute("data-wow-delay", "0.2s");

  blogElement.innerHTML = `
    <div class="blog-item">
      <div class="blog-img">
        ${
          blogItem.blogThumbnailImage
            ? `<img src="${blogItem.blogThumbnailImage}" class="img-fluid rounded-top w-100" alt="${blogTitle}" />`
            : `<p>No Image</p>`
        }
        <div class="blog-categiry py-2 px-4">
          <span>${blogItem.blogTag || "General"}</span>
        </div>
      </div>
      <div class="blog-content p-4">
        <div class="blog-comment d-flex justify-content-between mb-3">
          <div class="small"><span class="fa fa-user text-primary"></span> ${
            blogItem.blogAuthor || "Admin"
          }</div>
          <div class="small"><span class="fa fa-calendar text-primary"></span> ${formatDate(
            blogItem.blogDate
          )}</div>
          <div class="small"><span class="fa fa-comment-alt text-primary"></span> 0 Comments</div>
        </div>
        <a href="/blog-detail.html?slug=${
          blogItem.blogSlug
        }" class="h4 d-inline-block mb-3">
          ${blogTitle}
        </a>
        <p class="mb-3">${truncatedDescription}</p>
        <a href="/blog-detail.html?slug=${blogItem.blogSlug}" class="btn p-0">
          Read More <i class="fa fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;

  blogListContainer.appendChild(blogElement);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Call the function
fetchBlogsFromBackend();
