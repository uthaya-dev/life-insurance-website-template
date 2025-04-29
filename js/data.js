// Utility function to fetch and process data from Contentful
function fetchContentFromContentful(contentType, environment = CONFIG.CONTENTFUL_ENVIRONMENT) {
    const spaceId = CONFIG.CONTENTFUL_SPACE_ID;
    const token = CONFIG.CONTENTFUL_DELIVERY_TOKEN;
    
    // Fetch the content from Contentful
    fetch(`https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?access_token=${token}&content_type=${contentType}`)
      .then((response) => response.json())
      .then((data) => processContent(data, contentType))
      .catch((err) => console.error(`Error fetching ${contentType}:`, err));
  }
  
  // General function to process the fetched content
  function processContent(data, contentType) {
    console.log(`All ${contentType} Entries:`, data); // Full response
  
    // Loop through all items
    data.items.forEach((item) => {
      console.log(`${contentType} Data:`, item.fields); // Log all fields
  
      // Specific logic based on contentType
      switch (contentType) {
        case 'blogs':
          handleBlog(item, data);
          break;
        // case 'employees':
        //   handleEmployee(item);
        //   break;
        // Add cases for other content types as needed
        default:
          console.log(`Unknown content type: ${contentType}`);
      }
    });
  }

  function renderRichText(nodes) {
    return nodes.map(node => {
      switch (node.nodeType) {
        case 'paragraph':
          return `<p>${node.content.map(renderNode).join('')}</p>`;
  
        case 'heading-1':
          return `<h1>${node.content.map(renderNode).join('')}</h1>`;
  
        case 'heading-2':
          return `<h2>${node.content.map(renderNode).join('')}</h2>`;
  
        case 'heading-3':
          return `<h3>${node.content.map(renderNode).join('')}</h3>`;
  
        case 'heading-4':
          return `<h4>${node.content.map(renderNode).join('')}</h4>`;
  
        case 'heading-5':
          return `<h5>${node.content.map(renderNode).join('')}</h5>`;
  
        case 'heading-6':
          return `<h6>${node.content.map(renderNode).join('')}</h6>`;
  
        case 'unordered-list':
          return `<ul>${node.content.map(renderNode).join('')}</ul>`;
  
        case 'ordered-list':
          return `<ol>${node.content.map(renderNode).join('')}</ol>`;
  
        case 'list-item':
          return `<li>${node.content.map(renderNode).join('')}</li>`;
  
        case 'blockquote':
          return `<blockquote>${node.content.map(renderNode).join('')}</blockquote>`;
  
        case 'hr':
          return `<hr />`;
  
        case 'hyperlink':
          return `<a href="${node.data.uri}" target="_blank" rel="noopener noreferrer">${node.content.map(renderNode).join('')}</a>`;
  
        case 'embedded-asset-block':
          const fileUrl = node.data.target.fields?.file?.url;
          const fileTitle = node.data.target.fields?.title || '';
          if (fileUrl) {
            return `<img src="${fileUrl}" alt="${fileTitle}" />`;
          }
          return '';
  
        case 'embedded-entry-block':
          // Handle nested entry block if needed
          return `<div class="embedded-entry-block">[Embedded Entry]</div>`;
  
        case 'embedded-entry-inline':
          return `<span class="embedded-entry-inline">[Inline Embedded Entry]</span>`;
  
        default:
          return '';
      }
    }).join('');
  }
  
  function renderNode(node) {
    if (node.nodeType === 'text') {
      let text = node.value;
      const marks = node.marks || [];
  
      marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            text = `<strong>${text}</strong>`;
            break;
          case 'italic':
            text = `<em>${text}</em>`;
            break;
          case 'underline':
            text = `<u>${text}</u>`;
            break;
          case 'code':
            text = `<code>${text}</code>`;
            break;
          default:
            break;
        }
      });
  
      return text;
    }
  
    // If nested node inside another node
    return renderRichText([node]);
  }
  
  
  // Function to handle blog-specific data processing
  function handleBlog(blogItem, data) {
    const blogListContainer = document.getElementById('blog-list');
  
    const blogTitle = blogItem.fields.blogTitle.slice(0, 50) + '...';
    const blogDescription = renderRichText(blogItem.fields.blogDescription.content); 
    const truncatedDescription = blogDescription.slice(0, 100) + '...'; // limit characters
    const blogAuthor = blogItem.fields.blogAuthor;
    const blogDate = blogItem.fields.blogDate;
    const blogSlug = blogItem.fields.blogSlug;
    const blogTag = blogItem.fields.blogTag;
    
    // Check if the blog thumbnail image is available
    const thumbnailLinkId = blogItem.fields.blogThumbnailImage?.sys?.id;
    let thumbnailUrl = '';
    if (thumbnailLinkId) {
      const thumbnailAsset = data.includes.Asset.find((asset) => asset.sys.id === thumbnailLinkId);
      console.log('thumbnailAsset',thumbnailAsset)
      if (thumbnailAsset) {
        thumbnailUrl = thumbnailAsset.fields.file.url;
      }
    }
  
   // Create the blog item
   const blogElement = document.createElement('div');
   blogElement.classList.add('col-lg-6', 'col-xl-4', 'wow', 'fadeInUp');
   blogElement.setAttribute('data-wow-delay', '0.2s');
 
   blogElement.innerHTML = `
     <div class="blog-item">
       <div class="blog-img">
         ${thumbnailUrl ? `<img src="${thumbnailUrl}" class="img-fluid rounded-top w-100" alt="${blogTitle}" />` : `<p>No Image</p>`}
         <div class="blog-categiry py-2 px-4">
           <span>${blogTag || 'General'}</span>
         </div>
       </div>
       <div class="blog-content p-4">
         <div class="blog-comment d-flex justify-content-between mb-3">
           <div class="small">
             <span class="fa fa-user text-primary"></span> ${blogAuthor || 'Admin'}
           </div>
           <div class="small">
             <span class="fa fa-calendar text-primary"></span> ${formatDate(blogDate)}
           </div>
           <div class="small">
             <span class="fa fa-comment-alt text-primary"></span> 0 Comments
           </div>
         </div>
         <a href="/blog-detail.html?slug=${blogSlug}" class="h4 d-inline-block mb-3">
           ${blogTitle}
         </a>
         <p class="mb-3">
           ${truncatedDescription}
         </p>
         <a href="/blog-detail.html?slug=${blogSlug}" class="btn p-0">
           Read More <i class="fa fa-arrow-right"></i>
         </a>
       </div>
     </div>
   `;

   blogListContainer.appendChild(blogElement);
 }
 
 // Helper function to format date
 function formatDate(dateString) {
   if (!dateString) return '';
   const options = { day: 'numeric', month: 'short', year: 'numeric' };
   return new Date(dateString).toLocaleDateString('en-US', options);
 
  }
  
  
  // Function to handle employee-specific data processing (example)
//   function handleEmployee(employeeItem) {
//     console.log('Employee Name:', employeeItem.fields.name);
//     console.log('Employee Role:', employeeItem.fields.role);
//     console.log('Employee Department:', employeeItem.fields.department);
//     // Add more employee-specific fields here
//   }
  
  // Usage example
  fetchContentFromContentful('blogs'); // For fetching blog content
//   fetchContentFromContentful('employees'); // For fetching employee content
  