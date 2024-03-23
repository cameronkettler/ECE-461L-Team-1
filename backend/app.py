#passcode: R6BykARDXo2JIEEs
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import json
import os
import sys

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__, static_folder="../frontend/hw-view/public", static_url_path="/")
CORS(app)

uri = "mongodb+srv://andrewjli121:R6BykARDXo2JIEEs@ece461l.orvvqud.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

database = client["ECE461LSemesterProject"]
hardware = database["HardwareComponents"]
projects = database["Projects"]
users = database["Users"]

@app.route("/signup", methods=["POST"])
def signUp():
     data = request.json 
     username = data.get("username")
     password = data.get("password")

     if users.find_one({"username": username}):
          return jsonify({"error": "Username already exists, please select another Username"}), 400
     
     else:
          users.insert_one({"username": username, "password": password})
          return jsonify({"message": "Signup Successful"})

@app.route("/login", methods=["POST"])
def login():
     data = request.json 
     username = data.get("username")
     password = data.get("password")

     validUser = users.find_one({"username": username})

     if validUser is None:
          return jsonify({"error": "Invalid username or password"}), 401
     
     if validUser["password"] == password:
        return jsonify({"message": "Login Successful"}), 200
     else: 
        return jsonify({"error": "Invalid username or password"}), 401


@app.route("/", methods=["GET"])
def index():
     return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=os.environ.get("PORT", 80))