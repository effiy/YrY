---
title: Ai Response 1785675057571
lifecycle: active
status: stable
type: template
category: knowledge-curator/notes
roles:
- knowledge-curator
benefit: notes searchable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"review_cycle: quarterly
tacit: false
related:
  - ../README.md
  - ../INDEX.md
---

GitHub's **Trending** page ([https://github.com/trending](https://github.com/trending)) shows the hottest open-source projects by language and repo type (e.g. Popular / Recent). Below are several methods to fetch and parse this ranking list:

---

### **1. Visit the GitHub Trending page directly**
- **Default category**:
  By default it shows **All** (all languages) **Popular** (hot) projects, sorted by stars.
- **Filter**:
  Click the filter at the top of the page (e.g. **All**, **JavaScript**, **Python**) to categorize by language.
  Choose **Popular** (hot) or **Recent** (recent) to adjust the sort.

---

### **2. Fetch data via the GitHub API**
GitHub provides an official API to obtain Trending lists.
**API documentation**: [https://developer.github.com/v3/repos/](https://developer.github.com/v3/repos/)

#### **Request example (fetch hot projects across all languages)**
```bash
GET https://api.github.com/search/repositories?q=language:python+sort=stars+order=desc
```
- **Parameter explanation**:
  - `q`: search query (e.g. `language:python` means Python).
  - `sort`: sort method (`stars`, `forks`, `updated`).
  - `order`: ascending (`asc`) or descending (`desc`).

#### **Python example code**
```python
import requests

url = "https://api.github.com/search/repositories"
params = {
    "q": "language:python",
    "sort": "stars",
    "order": "desc"
}
headers = {"Accept": "application/vnd.github.v3+json"}

response = requests.get(url, params=params, headers=headers)
data = response.json()

for repo in data["items"]:
    print(f"{repo['name']} - {repo['html_url']} - {repo['stargazers_count']} stars")
```

---

### **3. Use third-party tools or sites**
- **GitHub Trending sites**:
  [https://githubtrending.com](https://githubtrending.com) provides a friendlier UI, supporting filters by language, repo type, and time scope.
- **GitHub Trending databases**:
  Some developers maintain datasets of GitHub Trending (e.g. [GitHub Trending GitHub](https://github.com/trending)).

---

### **4. Parse the GitHub Trending page HTML**
If you need to scrape page content directly, use tools like **Selenium** or **BeautifulSoup** (note anti-scraping measures).

#### **Example (Python + BeautifulSoup)**
```python
import requests
from bs4 import BeautifulSoup

url = "https://github.com/trending"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

for repo in soup.select(".repo-list-item"):
    name = repo.select_one("h3 a").text.strip()
    link = repo.select_one("h3 a")["href"]
    stars = repo.select_one(".repo-stats .octicon-star").text
    print(f"{name} - {link} - {stars} stars")
```

---

### **Notes**
1. **API rate limits**: GitHub API has rate limits (60 requests/hour for unauthenticated users, 5000 for authenticated).
2. **Data freshness**: Trending data updates in real time; refresh regularly.
3. **Anti-scraping**: Direct page scraping may trigger anti-bot measures; prefer the API or legitimate tools.

---

If you need more specific help (e.g. filter by language, export data, etc.), explain your needs further!
