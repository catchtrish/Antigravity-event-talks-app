# BigQuery Release Notes Web Application

We will build a responsive and beautiful web application using **Python Flask** and **Vanilla HTML, JS, and CSS**.

## Features Included
1. **Interactive Sidebar / Main Feed Layout**:
   - Sidebar filters (Filter by Category: Feature, Issue, Announcement, etc.).
   - Search bar to filter updates dynamically.
   - Clean timeline structure.
2. **Beautiful and Modern Design**:
   - Google Cloud / BigQuery theme colors (sleek dark mode and tailored blues).
   - Glassmorphic card design, responsive grids, and modern sans-serif typography.
   - Hover transformations and micro-interactions.
3. **Smooth Spinner and Fetch State**:
   - Refresh button with rotating spinner indicator.
   - Smooth transitions when updates are reloaded.
4. **Tweet Integration**:
   - Select individual updates or paragraphs.
   - Dynamic Twitter/X share button that formats the title, category, date, and link into a tweet template.
5. **Robust Feed Parsing**:
   - Clean parsing of Atom XML feeds.
   - Fallback error handling if network or parsing issues occur.

## Project Structure
- `app.py`: The Flask server that handles fetching, caching, and serving JSON endpoints.
- `templates/index.html`: The HTML file.
- `static/css/styles.css`: Custom CSS with clean Google Cloud aesthetics.
- `static/js/main.js`: Main Javascript containing API fetch logic, UI rendering, search/filters, and Tweet sharing.
