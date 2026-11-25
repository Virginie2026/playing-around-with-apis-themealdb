# World Cuisine Explorer

> Discover recipes from around the world and learn about the countries they come from.

Built for the **"Playing Around with APIs"** assignment by **Virginie** ([@Virginie2026](https://github.com/Virginie2026)).

---

## Quick links

| | |
|---|---|
| **Live site** (via load balancer) | https://www.virginie2026.tech |
| **Demo video** (under 2 min) | https://youtu.be/FxG4H5K1Mw4 |
| **Repository** | https://github.com/Virginie2026/playing-around-with-apis-themealdb |
| **Web01** | http://35.179.128.255 |
| **Web02** | http://18.169.158.197 |

> No login and no API key are needed to use the app.

---

## Table of contents
1. [About the project](#about-the-project)
2. [Features](#features)
3. [APIs and resources](#apis-and-resources)
4. [Project structure](#project-structure)
5. [Run locally](#run-locally)
6. [Deployment](#deployment)
7. [Error handling](#error-handling)
8. [Challenges and solutions](#challenges-and-solutions)
9. [Credits](#credits)

---

## About the project

I love cooking, eating and traveling, so I wanted an app that brings these together. World Cuisine Explorer helps people find something to cook and learn where a dish comes from. Users can search recipes, filter them by category or country, and open a recipe to see its ingredients, instructions, and key facts about the country of origin (capital, language, currency and flag).

The interface is responsive, and its design is inspired by African textile patterns (kente and bogolan).

---

## Features

- **Search** recipes by name (button or Enter key)
- **Filter** by category or by country, with countries grouped by continent
- **Sort** recipes A-Z or Z-A
- **Save** favorite recipes, kept in the browser with `localStorage`
- **Recipe details**: photo, ingredients, instructions, country info and flag
- **Clear feedback** for loading, empty results and network errors
- **Responsive design** that works on phones and computers

---

## APIs and resources

| Resource | Used for | Link |
|----------|----------|------|
| **TheMealDB** | Recipe data (search, filters, details) | https://www.themealdb.com/api.php |
| **Flagcdn** | Country flag images | https://flagcdn.com |
| **Google Fonts** | Poppins and Playfair Display | https://fonts.google.com |
| `data/countries.json` | Capital, language, currency | Compiled by me, using this document as a reference: [List of countries, capitals and currency (PDF)](https://pdf.bankexamstoday.com/raman_files/LIst-of-countries-and-capitals-and-currency.pdf) |

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
├── deploy/
│   ├── deploy.sh         Copies the site to a web server with scp
│   └── haproxy.cfg       Backend section of the load balancer config
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
3. Any static server also works. The page must be served over http, not opened directly as a file, because it loads `data/countries.json`.

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

I ran both commands on Web01 and Web02 (replacing `<WEB_IP>` with each server's IP). Each server adds an `X-Served-By` header containing its hostname, so I can see which one answered a request.

### 2. Load balancer (Lb01)

HAProxy was already installed on Lb01. I checked that its configuration is valid:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

How it is configured:
- **Port 80** redirects to HTTPS (301).
- **Port 443** uses a TLS certificate for the domain and forwards traffic to `web-backend`.
- **`web-backend`** uses `balance roundrobin` across Web01 and Web02, with `check` (health checks), so a server that is down stops receiving traffic.

The backend section is saved in `deploy/haproxy.cfg`.

### 3. Testing the load balancer

```bash
for i in 1 2 3 4 5 6; do curl -sI https://www.virginie2026.tech | grep -i x-served-by; done
```

Requests alternate between the two servers, which proves the traffic is balanced:

```
x-served-by: 7341-web-01
x-served-by: 7341-web-02
x-served-by: 7341-web-01
x-served-by: 7341-web-02
x-served-by: 7341-web-01
x-served-by: 7341-web-02
```

### 4. Updating the site

After changing the code, repeat the `scp` command for both web servers (or run `deploy/deploy.sh <WEB_IP>`). The load balancer needs no change.

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

## Challenges and solutions

- **Finding an original idea and the right API.** I wanted a project that matched what I love: cooking, eating and traveling. It was not easy to turn that into a useful app and to find an API that fit. I compared several options and chose TheMealDB because it has recipes, photos, categories and countries of origin, which let me combine food and travel in one app.
- **REST Countries stopped working.** My first version also used REST Countries for country information, but the browser showed a 301 redirect blocked by CORS. Opening the URL directly showed that API version 3.1 is deprecated. I replaced it with my own dataset, `data/countries.json`, so the app no longer depends on that service.
- **Wrong list from the API.** `getAreas()` returned 14 items because I had swapped `c=list` (categories) and `a=list` (areas). Testing in the browser console helped me find the mistake.
- **Typos that broke whole files.** Small mistakes (`encodeURIComponent`, `addEventListener`, a missing `r` in `strIngredient`) stopped files from loading. I fixed them one by one using the console error messages.
- **Setting up the tools.** Installing the CodeVibe extension and getting Git and VS Code to work together was complicated at the beginning. I had "command not found" errors because VS Code was connected to WSL. I fixed it by cloning the repository in a normal Windows window and installing the extension there.
- **Finding and accessing the servers.** I did not know at first where my server details were. I found the IP addresses and the username on the school intranet, but there was no password. The servers needed an SSH key, and my connection kept failing with "Permission denied (publickey)". I tested my keys one by one and found that the key called `school` worked.
- **The SSH key passphrase.** The key was protected by a passphrase, and I did not know where it had been created. I discovered it was stored in WSL, not in Windows, so I ran all my `ssh` and `scp` commands from WSL.
- **Case-sensitive `grep`.** The load balancer returns `x-served-by` in lowercase over HTTPS, so my first test showed nothing. Using `grep -i` fixed it.
- **Working with an AI assistant.** I used an AI assistant to get explanations and examples, and I typed, tested and corrected the code myself. Many of my fixes came from reading console errors and understanding what each function does.

---

## Credits

- Recipe data: [TheMealDB](https://www.themealdb.com)
- Flag images: [Flagcdn](https://flagcdn.com)
- Fonts: [Google Fonts](https://fonts.google.com) (Poppins, Playfair Display)
- Reference used to complete the country data: [bankexamstoday.com](https://pdf.bankexamstoday.com/raman_files/LIst-of-countries-and-capitals-and-currency.pdf)
- Design inspired by African textiles (kente and bogolan patterns)