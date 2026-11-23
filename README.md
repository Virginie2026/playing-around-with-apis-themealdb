# World Cuisine Explorer

A responsive web app to discover recipes from around the world and learn about their country of origin. Built for the "Playing Around with APIs" assignment.

## Links
- **Live site (load balancer):** https://www.virginie2026.tech
- **Demo video:** [add link here]
- **Web01:** http://35.179.128.255
- **Web02:** http://18.169.158.197

## Features
- Search recipes by name (button or Enter key)
- Filter by category or by country (countries grouped by continent)
- Sort A-Z or Z-A
- Save favorite recipes (stored in the browser with localStorage)
- Recipe details: photo, ingredients, instructions, country info and flag
- Clear messages for loading, empty results and network errors

## APIs and resources
- **TheMealDB** (https://www.themealdb.com/api.php): recipe data. It uses the free public test key `1`, which is not a secret, so no key is stored in the repository.
- **Flagcdn** (https://flagcdn.com): country flag images.
- **Country data** (capital, language, currency): compiled by me in `data/countries.json` from [write your real source, e.g. Wikipedia].
- **Google Fonts:** Poppins and Playfair Display.

## Run locally
1. Clone the repository:
   ```
   git clone https://github.com/Virginie2026/playing-around-with-apis-themealdb.git
   ```
2. Open the folder in VS Code and start it with the Live Server extension (Go Live).
3. Any static server also works. The page must be served over http, not opened as a file, because it loads `data/countries.json`.

## Deployment
The app is a static site (HTML, CSS, JavaScript), served by Nginx on two web servers behind an HAProxy load balancer.

| Server | Role | IP |
|--------|------|----|
| 7341-web-01 | Web server (Nginx) | 35.179.128.255 |
| 7341-web-02 | Web server (Nginx) | 18.169.158.197 |
| 7341-lb-01 | Load balancer (HAProxy) | 13.135.172.216 |

### Web servers
Nginx was already installed on both servers. I connected from WSL with my SSH key, gave my user ownership of the web root, and copied the project with `scp`:

```
ssh -i ~/.ssh/school ubuntu@<WEB_IP> "sudo chown -R ubuntu:ubuntu /var/www/html"
scp -i ~/.ssh/school -r index.html css js data ubuntu@<WEB_IP>:/var/www/html/
```

I ran this for both Web01 and Web02. Each server adds an `X-Served-By` header (its hostname), which lets me see which server answered.

### Load balancer
HAProxy on Lb01 was already set up. I checked the configuration with `sudo haproxy -c -f /etc/haproxy/haproxy.cfg` (valid). It works like this:
- Port 80 redirects to HTTPS (301).
- Port 443 uses a TLS certificate for the domain and forwards to `web-backend`.
- `web-backend` uses `balance roundrobin` across Web01 and Web02, with `check` (health checks).

### Testing
```
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

## Error handling
- Network or server errors show a red message: "Unable to reach TheMealDB. Please check your connection and try again."
- Empty results show "No recipes found. Try another search."
- If a country is missing from `data/countries.json`, the recipe still opens with "Country info unavailable for this recipe."

## Challenges
- **REST Countries stopped working.** My first version used REST Countries, but the browser showed a 301 redirect blocked by CORS. Opening the URL directly showed that API version 3.1 is deprecated. I replaced it with my own dataset, `data/countries.json`.
- **Wrong list from the API.** `getAreas()` returned 14 items because I had swapped `c=list` (categories) and `a=list` (areas). Testing in the console helped me find it.
- **Typos.** Several small typos (`encodeURIComponent`, `addEventListener`, a missing `r` in `strIngredient`) broke whole files. I used the browser console to find them.
- **SSH access.** The private key was in WSL, not in Windows, and protected by a passphrase.
- **Case-sensitive grep.** The load balancer returns `x-served-by` in lowercase over HTTPS, so I used `grep -i`.
- [Add your own challenge here, in your own words.]

## Credits
- Recipe data: TheMealDB
- Flags: Flagcdn
- Fonts: Google Fonts
- Design inspired by African textiles (kente and bogolan patterns)
