import re
from flask import Flask, render_template, jsonify
import requests
import feedparser

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html_content(content):
    """
    Optional preprocessing for the HTML content if needed.
    """
    return content

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        # Parse RSS/Atom feed
        feed = feedparser.parse(response.content)
        
        notes = []
        for entry in feed.entries:
            content_value = ""
            if 'content' in entry:
                content_value = entry.content[0].value
            elif 'summary' in entry:
                content_value = entry.summary
                
            # Extract categories from content (e.g. <h3>Feature</h3>, <h3>Issue</h3>, <h3>Announcement</h3>)
            # A single entry might contain multiple sub-updates under <h3> headings. 
            # We want to keep the entry structure but also parse it cleanly or split it if necessary, 
            # or just serve it as HTML. To make it extremely premium, we will parse the sub-entries 
            # so each feature/announcement can be selected, searched, and tweeted individually!
            
            # Find all <h3>...</h3> blocks and the HTML following them until the next <h3> or end.
            parts = re.split(r'(<h3>.*?</h3>)', content_value)
            
            sub_updates = []
            if len(parts) > 1:
                current_type = "Update"
                for part in parts:
                    part_stripped = part.strip()
                    if not part_stripped:
                        continue
                    if part_stripped.startswith("<h3>") and part_stripped.endswith("</h3>"):
                        current_type = part_stripped.replace("<h3>", "").replace("</h3>", "").strip()
                    else:
                        sub_updates.append({
                            "type": current_type,
                            "html": part_stripped
                        })
            else:
                # Fallback if no <h3> tags
                sub_updates.append({
                    "type": "Update",
                    "html": content_value
                })

            notes.append({
                "id": entry.id if 'id' in entry else entry.link,
                "title": entry.title,  # This is usually the date like "June 22, 2026"
                "updated": entry.updated if 'updated' in entry else "",
                "link": entry.link if 'link' in entry else "",
                "updates": sub_updates
            })
            
        return jsonify({
            "status": "success",
            "feed_title": feed.feed.title if 'title' in feed.feed else "BigQuery Release Notes",
            "notes": notes
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
