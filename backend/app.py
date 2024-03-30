#passcode: R6BykARDXo2JIEEs
from flask import Flask, send_from_directory, request, jsonify, session
from flask_cors import CORS
import json
import os
import sys
from encryption import encrypt

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__, static_folder="../frontend/hw-view/public", static_url_path="/")
app.secret_key = "temp_secret_key"
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
          users.insert_one({"username": username, "password": encrypt(password, 2, 1)})
          return jsonify({"message": "Signup Successful"})


@app.route("/login", methods=["POST"])
def login():
     data = request.json 
     username = data.get("username")
     password = data.get("password")

     validUser = users.find_one({"username": username})

     if validUser is None:
          return jsonify({"error": "Invalid username or password"}), 401
     
     if encrypt(validUser["password"], 2, 1) == password:
        session['username'] = username
        return jsonify({"message": "Login Successful"}), 200
     else: 
        return jsonify({"error": "Invalid username or password"}), 401


@app.route("/get_project", methods=["GET"])
def get_project():
    data = request.json
    project_name = data.get('project_name')

    valid_project = projects.find_one({"project_name": project_name})
    if valid_project is None:
        return jsonify({"error": "Invalid project name"}), 401
    
    if session['user'] in valid_project['user_access']:
        return jsonify(valid_project)
    else:
        return jsonify({"error": "You don't have access to this project"}), 401


@app.route("/push_project", methods=["POST"])
def push_project():
     data = request.json #Need to contain: Project name, checking in/out, quantity, 
     project_name = data.get('project_name')
     quantity = data.get('quantity')
     check_in = data.get('check_in')    #checking out if false

     valid_project = projects.find_one({"project_name": project_name})

     if valid_project is None:
         return jsonify({"error": "Invalid project name"}), 401
     
     if session['user'] in valid_project['user_access']:
         if check_in:
            hardware_data = hardware.find_one({"tag": "global-info"})
            availability = hardware_data['availability']
            if availability >= quantity:
                availability -= quantity
                valid_project['quantity'] += quantity
         else:
             return jsonify(valid_project)
     else:
         return jsonify({"error": "You don't have access to this project"}), 401
         

@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.json #Need to contain: Project name, quantity, users
    project_name = data.get('project_name')
    quantity = data.get('quantity')
    users = data.get('users')

    if not data:
        return jsonify({"error": "Invalid project name"}), 401
    
    hardware_data = hardware.find_one({"tag": "global-info"})
    availability = hardware_data['availability']
    if availability >= quantity:
        availability -= quantity
        projects.insert_one({'project_name':project_name, 'quantity': quantity, 'users':users})
        return jsonify({"message": "Created Project Successfully"})
    else:
        return jsonify({"error": "You don't have access to this project"}), 401


@app.route("/logout")
def logout():
    session.pop('username', default=None)
    return '<p>Logged out</p>'


@app.route("/", methods=["GET"])
def index():
     return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=os.environ.get("PORT", 80))