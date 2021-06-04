import requests
from flask_cors import CORS
from flask import Flask
import json

cmdString = "+READY>"
app = Flask(__name__)
CORS(app)

@app.route('/trace')
def get_trace():
    validJSON = False
    while not validJSON:
        r = requests.get("http://flaskosa.herokuapp.com/cmd/TRACE", timeout=10)
        try:
            isJSON = json.loads(r.content)
            validJSON = True
        except:
            pass
    return r.json()

@app.route('/idn')
def get_idn():
    r =requests.get("http://flaskosa.herokuapp.com/cmd/IDN", timeout=2)
    while (cmdString not in r.text):
        r =requests.get("http://flaskosa.herokuapp.com/cmd/IDN", timeout=2)
    return r.text

@app.route('/state')
def get_state():
    r =requests.get("http://flaskosa.herokuapp.com/cmd/STATE", timeout=2)
    while (cmdString not in r.text):
        r =requests.get("http://flaskosa.herokuapp.com/cmd/STATE", timeout=2)
    return r.text

@app.route('/stop')
def stop():
    r = requests.get("http://flaskosa.herokuapp.com/cmd/STOP", timeout=2)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/STOP", timeout=2)
    return r.text

@app.route('/start')
def start():
    r = requests.get("http://flaskosa.herokuapp.com/cmd/START", timeout=2)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/START", timeout=2)
    return r.text

@app.route('/single')
def get_single():
    r = requests.get("http://flaskosa.herokuapp.com/cmd/SINGLE", timeout=30)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/SINGLE", timeout=30)
    return r.text

@app.route('/lim')
def get_limits():
    r = requests.get("http://flaskosa.herokuapp.com/cmd/LIM", timeout=2)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/LIM", timeout=2)
    return r.text

@app.route('/setlim/<mini>/<maxi>')
def set_limits(mini, maxi):
    r = requests.get("http://flaskosa.herokuapp.com/cmd/LIM/["+ str(mini) + "," + str(maxi) + "]", timeout=2)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/LIM["+ str(maxi) + "," + str(maxi) + "]", timeout=2)
    return r.text

@app.route('/echo/<string>')
def echo(string):
    r = requests.get("http://flaskosa.herokuapp.com/cmd/ECHO/" + str(string), timeout=2)
    while (cmdString not in r.text):
        r = requests.get("http://flaskosa.herokuapp.com/cmd/ECHO/" + str(string), timeout=2)
    return r.text