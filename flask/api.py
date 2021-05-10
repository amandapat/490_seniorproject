from flask import Flask
from flask_cors import CORS
from flask import request, jsonify, abort, Response
import json
import csv
from urllib.parse import urlparse
import re
import sys
from joblib import dump, load
import spacy
import mechanicalsoup
from textstat import textstat

app = Flask(__name__)
CORS(app)
# app.config["CORS_SUPPORTS_CREDENTIALS"] = True

@app.route("/")
def home():
    return Response(headers={'Access-Control-Allow-Origin':'*'})

@app.route('/endpoint/', methods=['GET','POST'])
def create_task():
    if request.method == "POST":
        content = request.get_json()
        news = filter_for_news(content)
        return get_biases_for_news(news)
    else:
        return jsonify({'success':True})

@app.route('/endpoint2/', methods=['GET','POST'])
def log_sites():
    if request.method == "POST":
        content = request.get_json()
        save_html(content)
        # print("ENDPOINT 2 HERE")
        return jsonify({'success':True})
        # news = filter_for_news(content)
        # return get_biases_for_news(news)
    else:
        return jsonify({'success':False})


def save_html(html_json):
    start = html_json.index('"body": "') + len('"body": "')
    url = html_json[20:(start-12)]
    if is_it_news(url):
        html = html_json[start:-4]
        with open('saved_html.csv', 'r+') as csvfile:
            csv.field_size_limit(sys.maxsize)
            csv_reader = csv.reader(csvfile, delimiter=",")
            already_saved = 0
            for row in csv_reader:
                # print(row[0])
                if row[0] == url:
                    already_saved = 1
                    break
            if not already_saved:
                clf = load('../bias_classifier/filename.joblib') 
                bias = clf.predict([get_classifiers(html)])
                # do I want to convert the classifier here?
                writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
                writer.writerow([url, bias, html])


# {'title': 'Technology - The New York Times', 'url': 'https://www.nytimes.com/section/technology', 
# 'lastVisit': 'Mon Mar 01 2021 20:27:36 GMT-0500 (Eastern Standard Time)', 'count': '1'}
def get_biases_for_news(news_dict):
    with open('../all_bias.csv', 'r', newline='') as csvfile: 
        spamreader = csv.reader(csvfile, delimiter=',')
        biasdict = {rows[0]:[rows[1], rows[2], rows[3], rows[4]] for rows in spamreader}
    data = {}
    data['history'] = []
    with open('saved_html.csv', 'r', newline='') as csvfile: 
        csv.field_size_limit(sys.maxsize)
        spamreader = csv.reader(csvfile, delimiter=',')
        classifier_dict = {rows[0]:rows[1] for rows in spamreader}
    for entry in news_dict:
        parsed = urlparse(entry['url'])
        url = parsed.netloc
        if re.match(r"^www\..+\.", url):
                url = re.sub(r"^www\.", "", url, 1)
        classifier_bias = "none"
        if entry['url'] in classifier_dict:
            classifier_bias = classifier_dict[entry['url']]
        if url in biasdict:
            data['history'].append({
                'domain': url,
                'mbfc_bias' : biasdict[url][1].replace(" ", ""),
                'allsides_bias': biasdict[url][2].replace(" ", ""),
                'classifier_bias': classifier_bias,
                'mbfc_fake': biasdict[url][3].replace(" ", ""),
                'source_title': biasdict[url][0],
                'title': entry['title'],
                'url': entry['url']
            })
        else: 
            data['history'].append({
                'domain': url,
                'mbfc_bias' : "none",
                'allsides_bias': "none",
                'classifier_bias': classifier_bias,
                'mbfc_fake': "none",
                'source_title': url,
                'title': entry['title'],
                'url': entry['url']
            })
    my_json = json.dumps(data)
    return my_json

def filter_for_news(history_dict):
    with open('../all_news.csv', 'r', newline='') as csvfile: 
        spamreader = csv.reader(csvfile, delimiter=',')
        mydict = {rows[0]:"news" for rows in spamreader}
    news = []
    for entry in history_dict['history']:
        parsed = urlparse(entry['url'])
        url = parsed.netloc
        if re.match(r"^www\..+\.", url):
                url = re.sub(r"^www\.", "", url, 1)
        if url in mydict:
            news.append(entry)
    return news

def is_it_news(url):
    with open('../all_news.csv', 'r', newline='') as csvfile: 
        spamreader = csv.reader(csvfile, delimiter=',')
        mydict = {rows[0]:"news" for rows in spamreader}
        parsed = urlparse(url)
        url = parsed.netloc
        if re.match(r"^www\..+\.", url):
                url = re.sub(r"^www\.", "", url, 1)
        if url in mydict:
            return True 
        else:
            return False


def get_classifiers(text, url=False):
    nlp = spacy.load("en_core_web_sm")
    if url:
        text = get_text(text)
    # tokens = get_phrases()
    # tokens = ['19', '2020', 'ad', 'ago', 'american', 'april 2021', 'best', 'biden', 'black', 'business', 'chauvin', 'city', 'com', 'content', 'covid', 'covid 19', 'culture', 'day', 'don', 'facebook', 'family', 'floyd', 'force', 'government', 'health', 'law', 'like', 'make', 'military', 'mr', 'national', 'party', 'pm', 'police', 'politics', 'president', 'prince', 'reply', 'say', 'says', 'share', 'social', 'subscribe', 'support', 'trump', 'twitter', 'vaccine', 'video', 'white', 'york']
    # tokens = ['according', 'american', 'campaign', 'clinton', 'country', 'day', 'did', 'don', 'donald', 'donald trump', 'going', 'government', 'house', 'just', 'know', 'like', 'make', 'mr', 'mr trump', 'national', 'new', 'news', 'obama', 'party', 'people', 'police', 'political', 'president', 'republican', 'say', 'says', 'state', 'states', 'think', 'time', 'told', 'trump', 'twitter', 'united', 'united states', 'want', 'way', 'white', 'women', 'world', 'year', 'years']
    tokens = ['000', 'according', 'american', 'campaign', 'city', 'clinton', 'country', 'day', 'did', 'don', 'donald', 'donald trump', 'going', 'government', 'house', 'including', 'just', 'know', 'like', 'make', 'million', 'mr', 'national', 'new', 'new york', 'news', 'obama', 'officials', 'people', 'percent', 'police', 'president', 'say', 'says', 'state', 'states', 'think', 'time', 'told', 'trump', 'united', 'united states', 'way', 'week', 'white', 'world', 'year', 'years']
    result = []

    lex_count = textstat.lexicon_count(text)
    sent_count = textstat.sentence_count(text)
    flesch_score = textstat.flesch_reading_ease(text)
    smog_score = textstat.smog_index(text)
    auto_readability_score = textstat.automated_readability_index(text)

    for word in tokens:
        if word in text:
            result.append(1)
        else:
            result.append(0)

    doc = nlp(text)
    adj = adp = adv = aux = conj = det = intj = noun = num = part = pron = propn = punct = sconj = sym = verb = x = 0 
    div = len(doc)
    for token in doc:
        if token.pos_ == "ADJ":
            adj+=1 
        elif token.pos_ == "APD":
            adp +=1
        elif token.pos_ == "ADV":
            adv+=1 
        elif token.pos_ == "AUX":
            aux+= 1 
        elif token.pos_ == "NOUN":
            noun+= 1
        elif token.pos_ == "PRON":
            pron+=1 
        elif token.pos_ == "VERB":
            verb+=1 
        elif token.pos == "CONJ":
            conj+=1 
        elif token.pos == "DET":
            det+=1 
        elif token.pos == "INTJ":
            intj+=1
        elif token.pos == "NUM":
            num+=1
        elif token.pos == "PART":
            part+=1
        elif token.pos == "PROPN":
            propn+=1
        elif token.pos == "PUNCT":
            punct+=1
        elif token.pos == "SCONJ":
            sconj+=1
        elif token.pos == "SYM":
            sym+=1
        elif token.pos == "X":
            x+=1
        
    add = [lex_count, sent_count, flesch_score, smog_score, auto_readability_score, adj/div, adp/div, adv/div, aux/div, noun/div, pron/div, verb/div, conj/div, det/div, intj/div, num/div, part/div, propn/div, punct/div, sconj/div, sym/div, x/div]
    # col_names = ['lex_count', 'sent_count', 'flesch_score', 'smog_score', 'auto_readability_score', 'adj/div', 'adp/div', 'adv/div', 'aux/div', 'noun/div', 'pron/div', 'verb/div', 'conj/div', 'det/div', 'intj/div', 'num/div', 'part/div', 'propn/div', 'punct/div', 'sconj/div', 'sym/div', 'x/div']

    result.extend(add)
    return result


def get_text(url):
    browser = mechanicalsoup.Browser()
    page = browser.get(url)
    body = page.soup.body
    total_strings = " "
    total_strings = total_strings.join(body.strings)
    if "404" in total_strings:
        raise Exception("404 error")
    return total_strings


if __name__ == '__main__':
    app.run(host='localhost', debug=True)