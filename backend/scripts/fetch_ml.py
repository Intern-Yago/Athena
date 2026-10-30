import urllib.request
import re

url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG4e29Mm1htBaWLwh_DavT_6cC9NO3nq6od18bNMGxlhz3EKvv4Rd832sjoMxAY7omJYgzIvmnzmlNniuhYytvMGdNuQyrkPTic--m1AGc8FMAuRo4fR-JeJrexYIhC8jOj82qOtkHrpaEtv_9jNAZbe2-Ogaku_SUSQGEzR0RaE_yiPRGPI4_Ag_ZXycu5u-ylZhcrLbmxc09-fZQFIL5wPg=="
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    real_url = resp.geturl()
    print("Real URL:", real_url)
    html = resp.read().decode("utf-8", errors="ignore")
    imgs = re.findall(r"https://http2\.mlstatic\.com/D_NQ_NP_[a-zA-Z0-9_\-\.]+", html)
    print(f"ML images found: {len(imgs)}")
    for i in list(set(imgs))[:5]:
        print(" ", i)
except Exception as e:
    print("Error:", e)
