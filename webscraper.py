from bs4 import BeautifulSoup
import requests

url = 'http://ethans_fake_twitter_site.surge.sh/'
response = requests.get(url, timeout=5)
content = BeautifulSoup(response.content, "html.parser")
print(content)
for wrap in content.find_all('p',{"class":"content"}):
    print(wrap.text)
#date = content.findAll('h5', attrs={"class": "dateTime"}).text
#print(date)
