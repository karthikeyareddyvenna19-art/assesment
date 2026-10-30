// Select DOM elements (ensure your IDs match your Part 1 HTML)
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const resultCountEl = document.getElementById('result-count'); // Optional element for result count enhancement

searchForm.addEventListener('submit', async (event) => {
    // 1. Catch the search & prevent page reload
    event.preventDefault();
    
    const query = searchInput.value.trim();
    
    // 4. Ignore empty searches
    if (!query) return;
    
    // 3. Clear old results before rendering new ones
    resultsContainer.innerHTML = '';
    if (resultCountEl) resultCountEl.textContent = '';

    // 2. Build request URL with encodeURIComponent for multi-word safety (e.g., "new york")
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata`;

    try {
        // Fetch data
        const response = await fetch(url);
        
        // Check response.ok before parsing
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle no results found
        if (!data.query || !data.query.pages) {
            resultsContainer.innerHTML = `<p class="no-results">No images found for "${query}". Try another search term.</p>`;
            return;
        }
        
        const pages = Object.values(data.query.pages);
        
        // Enhancement: Display result count
        if (resultCountEl) {
            resultCountEl.textContent = `Showing ${pages.length} results for "${query}"`;
        }
        
        // 3. Render the results by looping over items
        pages.forEach(page => {
            if (!page.imageinfo || !page.imageinfo[0]) return;
            
            const imageUrl = page.imageinfo[0].url;
            // Clean up Wikimedia file prefixes and extensions for a clean title
            const rawTitle = page.title.replace(/^File:/, '').replace(/\.[^/.]+$/, '');
            const title = rawTitle.length > 45 ? rawTitle.substring(0, 42) + '...' : rawTitle;
            
            // Enhancement: Extract author metadata when available
            const author = page.imageinfo[0].extmetadata?.Artist?.value || 'Wikimedia Commons Contributor';
            
            // Build card structure using document.createElement(...)
            const card = document.createElement('div');
            card.className = 'image-card';
            
            // Enhancement: Wrap card in a link opening full image in a new tab
            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = title;
            img.loading = 'lazy'; // Improves performance for image grids
            
            const caption = document.createElement('div');
            caption.className = 'card-caption';
            caption.innerHTML = `
                <h3 class="card-title">${title}</h3>
                <p class="card-author">By ${author}</p>
            `;
            
            link.appendChild(img);
            link.appendChild(caption);
            card.appendChild(link);
            
            // Add to results container
            resultsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to fetch images:', error);
        resultsContainer.innerHTML = `<p class="error-message">Something went wrong while fetching images. Please check your connection and try again.</p>`;
    }
});