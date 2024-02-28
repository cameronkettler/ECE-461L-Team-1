from flask import Flask, send_from_directory,request,json
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder="./build", static_url_path="/")
CORS(app)

global firstNameInput

@app.route("/", methods=["GET"])
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/firstname/", methods=["POST"])
def getter_firstName():
    print('post request working')
    data = request.json
    global firstNameInput
    firstNameInput = data['firstname']
    print(firstNameInput)
    return '1'

@app.route("/lastname/", methods=["GET"])
def lastName():
    print('GET request working')
    nameList = {"Abhay": "Samant"}
    returnValue = ""

    for firstName in nameList:
        if (firstNameInput == firstName):
            returnValue = nameList[firstName]
        else:
            returnValue = "User Not Found"

    return json.dumps({'lastname':returnValue})

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=False, port=os.environ.get("PORT", 80))