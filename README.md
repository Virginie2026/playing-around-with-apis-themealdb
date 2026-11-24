# World Cuisine Explorer

A responsive web app to discover recipes from around the world and learn about their country of origin. Built for the **"Playing Around with APIs"** assignment.

**Author:** Virginie ([@Virginie2026](https://github.com/Virginie2026))

---

## Table of contents
1. [Quick links](#quick-links)
2. [Features](#features)
3. [APIs and resources](#apis-and-resources)
4. [Project structure](#project-structure)
5. [Run locally](#run-locally)
6. [Deployment](#deployment)
7. [Error handling](#error-handling)
8. [Challenges](#challenges)
9. [Credits](#credits)

---

## Quick links

| What | Link |
|------|------|
| Live site (load balancer) | https://www.virginie2026.tech |
| Demo video (max 2 min) | [add link here] |
| Web01 | http://35.179.128.255 |
| Web02 | http://18.169.158.197 |
| Repository | https://github.com/Virginie2026/playing-around-with-apis-themealdb |

No login or API key is needed to use the app.

---

## Features

- **Search** recipes by name (button or Enter key)
- **Filter** by category or by country (countries grouped by continent)
- **Sort** A-Z or Z-A
- **Save** favorite recipes (stored in the browser with `localStorage`)
- **Recipe details:** photo, ingredients, instructions, country info and flag
- **Clear messages** for loading, empty results and network errors
- **Responsive design** inspired by African textile patterns (kente and bogolan)

---

## APIs and resources

| Resource | Used for | Link |
|----------|----------|------|
| **TheMealDB** | Recipe data (search, filters, details) | https://www.themealdb.com/api.php |
| **Flagcdn** | Country flag images | https://flagcdn.com |
| **Google Fonts** | Poppins and Playfair Display | https://fonts.google.com |
| `data/countries.json` | Capital, language, currency | Compiled by me from [write your real source, e.g. Wikipedia] |

**API key:** TheMealDB is used with its free public test key `1`, which is part of the URL and is not a secret. No key is stored in this repository.

---

## Project structure

```
.
├── index.html            Page structure
├── css/style.css         Responsive styles
├── js/
│   ├── api.js            Calls to TheMealDB and the local country data
│   ├── ui.js             Cards, details window, sorting, favorites
│   └── app.js            Events: search, filters, sort, start-up
├── data/countries.json   Country info (capital, language, currency, flag code)
├── deploy/               Deployment configuration
└── codevibe-reports/     CodeVibe report
```

---

## Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Virginie2026/playing-around-with-apis-themealdb.git
   cd playing-around-with-apis-themealdb
   ```
2. Open the folder in VS Code and start it with the **Live Server** extension (Go Live).
3. Any static server also works. The page must be served over http, not opened as a file, because it loads `data/countries.json`.

---

## Deployment

The app is a static site (HTML, CSS, JavaScript) served by **Nginx** on two web servers, behind an **HAProxy** load balancer.

| Server | Role | IP |
|--------|------|----|
| 7341-web-01 | Web server (Nginx) | 35.179.128.255 |
| 7341-web-02 | Web server (Nginx) | 18.169.158.197 |
| 7341-lb-01 | Load balancer (HAProxy) | 13.135.172.216 |

### 1. Web servers (Web01 and Web02)

Nginx was already installed on both servers. From WSL, I connected with my SSH key, gave my user ownership of the web root, and copied the project with `scp`:

```bash
ssh -i ~/.ssh/school ubuntu@<WEB_IP> "sudo chown -R ubuntu:ubuntu /var/www/html"
scp -i ~/.ssh/school -r index.html css js data ubuntu@<WEB_IP>:/var/www/html/
```

I ran both commands for Web01 and Web02 (replace `<WEB_IP>` with each server's IP). Each server adds an `X-Served-By` header with its hostname, so I can see which one answered.

### 2. Load balancer (Lb01)

HAProxy on Lb01 was already installed. I checked its configuration, which is valid:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

How it works:
- **Port 80** redirects to HTTPS (301).
- **Port 443** uses a TLS certificate for the domain and forwards to `web-backend`.
- **`web-backend`** uses `balance roundrobin` across Web01 and Web02, with `check` (health checks).

### 3. Testing the load balancer

```bash
for i in 1 2 3 4 5 6; do curl -sI https://www.virginie2026.tech | grep -i x-served-by; done
```

Result (requests alternate between the two servers):

```
x-served-by: 7341-web-02
x-served-by: 7341-web-01
x-served-by: 7341-web-02
x-served-by: 7341-web-01
x-served-by: 7341-web-02
x-served-by: 7341-web-01
```

### Updating the site

After changing the code, repeat the `scp` command for both web servers. The load balancer needs no change.

---

## Error handling

| Situation | What the user sees |
|-----------|--------------------|
| Network or server error | Red message: "Unable to reach TheMealDB. Please check your connection and try again." |
| No results | "No recipes found. Try another search." |
| Empty search box | "Type a meal name first." |
| Country missing from `data/countries.json` | The recipe still opens, with "Country info unavailable for this recipe." |
| Recipe cannot be loaded | "Unable to load this recipe. Please try again." |

---

## Challenges

- **REST Countries stopped working.** My first version used REST Countries, but the browser showed a 301 redirect blocked by CORS. Opening the URL directly showed that API version 3.1 is deprecated. I replaced it with my own dataset, `data/countries.json`.
- **Wrong list from the API.** `getAreas()` returned 14 items because I had swapped `c=list` (categories) and `a=list` (areas). Testing in the browser console helped me find it.
- **Typos.** Several small typos (`encodeURIComponent`, `addEventListener`, a missing `r` in `strIngredient`) broke whole files. I used the browser console to find them.
- **SSH access.** My private key was in WSL, not in Windows, and protected by a passphrase.
- **Case-sensitive `grep`.** The load balancer returns `x-served-by` in lowercase over HTTPS, so I used `grep -i`.
- [Add your own challenge here, in your own words.]

---

## Credits

- Recipe data: [TheMealDB](https://www.themealdb.com)
- Flags: [Flagcdn](https://flagcdn.com)
- Fonts: [Google Fonts](https://fonts.google.com)
- Design inspired by African textiles (kente and bogolan patterns)