# BigQuery Release Hub (PC-event-talks-app)

A modern, responsive, and beautiful web application built to fetch, categorize, and browse Google BigQuery release notes. It provides client-side filters, search, and a Twitter composer to share updates directly on X/Twitter.

## Features
- **Daily Grouping & Categorization**: Slices Google's unified daily update feed into separate entries (Features, Announcements, Issues, Deprecations) for granular viewing.
- **Client-Side Live Filtering & Search**: Filter updates by category type or use the dynamic search input to find specific keywords instantly.
- **Interactive Twitter Composer**: Draft, count characters, copy, and tweet individual updates directly.
- **Modern User Interface**: Responsive dashboard featuring glassmorphic designs, Google Cloud themed colors, skeleton loader states, and sleek micro-animations.

## Tech Stack
- **Backend**: Python 3 (Flask, Requests, Feedparser)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), FontAwesome Icons

## Project Structure
```text
├── app.py                  # Flask Application Backend
├── templates/
│   └── index.html          # Frontend HTML Structure
├── static/
│   ├── css/
│   │   └── styles.css      # Custom UI Styles & Layouts
│   └── js/
│       └── main.js         # Client-Side Logic & API Fetching
├── .gitignore              # Git Ignore File
└── README.md               # Project Documentation
```

## Getting Started

### Prerequisites
- Python 3.8 or higher installed on your machine.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/catchtrish/Antigravity-event-talks-app.git
   cd Antigravity-event-talks-app
   ```
2. Install the required Python dependencies:
   ```bash
   pip install flask requests feedparser
   ```

### Running Locally
1. Run the Flask development server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to:
   ```text
   http://127.0.0.1:5000
   ```
3. Click the **Refresh** button to pull the latest feed data live from Google.
