// State variables
let notesData = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const notesFeed = document.getElementById('notes-feed');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const filterItems = document.querySelectorAll('.filter-item');
const tweetModal = document.getElementById('tweet-modal');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCount = document.getElementById('char-count');
const closeModalBtn = document.getElementById('close-modal');
const btnCopyTweet = document.getElementById('btn-copy-tweet');
const btnSendTweet = document.getElementById('btn-send-tweet');

// Fetch and load notes from Flask API
async function fetchReleaseNotes() {
    // Show spinner and skeleton
    const spinnerIcon = refreshBtn.querySelector('.spinner-icon');
    spinnerIcon.classList.add('spinning');
    refreshBtn.disabled = true;

    notesFeed.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    `;

    try {
        const response = await fetch('/api/release-notes');
        const data = await response.json();
        
        if (data.status === 'success') {
            notesData = data.notes;
            renderFeed();
            updateCounts();
        } else {
            renderError(data.message || 'Failed to fetch release notes.');
        }
    } catch (error) {
        console.error(error);
        renderError('Could not connect to the server. Please try again.');
    } finally {
        spinnerIcon.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

// Render feed matching filter and search
function renderFeed() {
    if (notesData.length === 0) {
        renderError('No release notes found.');
        return;
    }

    let filteredNotes = [];

    notesData.forEach(day => {
        // Filter sub-updates within each day
        const matchedUpdates = day.updates.filter(update => {
            const matchesFilter = currentFilter === 'all' || update.type.toLowerCase() === currentFilter;
            
            // Basic text matches search in HTML/text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = update.html;
            const plainText = tempDiv.textContent || tempDiv.innerText || "";
            
            const matchesSearch = searchQuery === '' || 
                plainText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                update.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                day.title.toLowerCase().includes(searchQuery.toLowerCase());
                
            return matchesFilter && matchesSearch;
        });

        if (matchedUpdates.length > 0) {
            filteredNotes.push({
                ...day,
                updates: matchedUpdates
            });
        }
    });

    if (filteredNotes.length === 0) {
        notesFeed.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-square-rss"></i>
                <h3>No matching updates</h3>
                <p>Try refining your search or changing the filter.</p>
            </div>
        `;
        return;
    }

    // Build timeline DOM
    notesFeed.innerHTML = '';
    filteredNotes.forEach(day => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';

        const dateBadge = document.createElement('div');
        dateBadge.className = 'date-badge';
        dateBadge.innerHTML = `<i class="fa-regular fa-calendar-days" style="margin-right: 0.5rem;"></i> ${day.title}`;
        dateGroup.appendChild(dateBadge);

        day.updates.forEach(update => {
            const typeClass = update.type.toLowerCase();
            const card = document.createElement('div');
            card.className = `update-card ${typeClass}`;
            
            // Clean content text for tweet sharing
            const cleanText = getCleanTextContent(update.html);
            const rawHtml = update.html;

            card.innerHTML = `
                <div class="card-header">
                    <span class="category-tag">${update.type}</span>
                    <div class="card-actions">
                        <button class="icon-btn copy-btn" title="Copy text"><i class="fa-regular fa-copy"></i></button>
                        <button class="icon-btn share-btn" title="Compose Tweet"><i class="fa-brands fa-x-twitter"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    ${rawHtml}
                </div>
            `;

            // Action: Copy Update text
            card.querySelector('.copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(cleanText);
                showToast('Text copied to clipboard!');
            });

            // Action: Compose Tweet
            card.querySelector('.share-btn').addEventListener('click', () => {
                openTweetComposer(update.type, day.title, cleanText, day.link);
            });

            dateGroup.appendChild(card);
        });

        notesFeed.appendChild(dateGroup);
    });
}

// Convert HTML content from Atom/RSS to plain text
function getCleanTextContent(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Add spaces/newlines for list items so they don't mash together
    const listItems = temp.querySelectorAll('li');
    listItems.forEach(li => {
        li.textContent = `• ${li.textContent}\n`;
    });

    return temp.textContent || temp.innerText || "";
}

// Count dynamic stats for the sidebar list
function updateCounts() {
    let counts = {
        all: 0,
        feature: 0,
        announcement: 0,
        issue: 0,
        deprecation: 0
    };

    notesData.forEach(day => {
        day.updates.forEach(update => {
            const type = update.type.toLowerCase();
            counts.all++;
            if (counts.hasOwnProperty(type)) {
                counts[type]++;
            }
        });
    });

    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-feature').textContent = counts.feature;
    document.getElementById('count-announcement').textContent = counts.announcement;
    document.getElementById('count-issue').textContent = counts.issue;
    document.getElementById('count-deprecation').textContent = counts.deprecation;
}

// Error state display
function renderError(message) {
    notesFeed.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-issue);"></i>
            <h3>An error occurred</h3>
            <p>${message}</p>
            <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="fetchReleaseNotes()">
                <i class="fa-solid fa-arrows-rotate"></i> Retry
            </button>
        </div>
    `;
}

// Toast notification helper
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Quick inline styling for the toast notification
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        boxShadow: 'var(--card-shadow)',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);
    
    // Trigger transition
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Twitter Modal Logic
function openTweetComposer(type, date, text, link) {
    // Generate a default format tweet content (280 characters limit)
    // Format: "[Feature] BigQuery (June 22, 2026): Oracle metadata transfer is in preview. Details: https://..."
    const prefix = `[${type}] BigQuery (${date}): `;
    
    // Clean spacing/newlines from the text
    let bodyText = text.replace(/\s+/g, ' ').trim();
    if (bodyText.length > 150) {
        bodyText = bodyText.substring(0, 147) + '...';
    }
    
    const suffix = `\n\nInfo: ${link}`;
    
    tweetTextarea.value = `${prefix}${bodyText}${suffix}`;
    updateCharCounter();
    
    tweetModal.classList.add('active');
    tweetTextarea.focus();
}

function updateCharCounter() {
    const len = tweetTextarea.value.length;
    charCount.textContent = len;
    if (len > 280) {
        charCount.style.color = 'var(--color-issue)';
        btnSendTweet.disabled = true;
    } else {
        charCount.style.color = 'var(--text-muted)';
        btnSendTweet.disabled = false;
    }
}

// Event Listeners
refreshBtn.addEventListener('click', fetchReleaseNotes);

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFeed();
});

filterItems.forEach(item => {
    item.addEventListener('click', () => {
        filterItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFilter = item.getAttribute('data-type');
        renderFeed();
    });
});

closeModalBtn.addEventListener('click', () => {
    tweetModal.classList.remove('active');
});

tweetTextarea.addEventListener('input', updateCharCounter);

btnCopyTweet.addEventListener('click', () => {
    navigator.clipboard.writeText(tweetTextarea.value);
    showToast('Tweet text copied!');
});

btnSendTweet.addEventListener('click', () => {
    const text = encodeURIComponent(tweetTextarea.value);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    tweetModal.classList.remove('active');
});

// Close modal when clicking outside
tweetModal.addEventListener('click', (e) => {
    if (e.target === tweetModal) {
        tweetModal.classList.remove('active');
    }
});

// Initial Fetch
document.addEventListener('DOMContentLoaded', fetchReleaseNotes);
