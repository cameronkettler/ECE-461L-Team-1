#passcode: R6BykARDXo2JIEEs
from flask import Flask, send_from_directory, request, jsonify, session
from flask_cors import CORS
import json
import os
import sys
from encryption import encrypt, decrypt

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
          users.insert_one({"username": username, "password": encrypt(password, 2, 1), projects: []})
          return jsonify({"message": "Signup Successful"})


@app.route("/login", methods=["POST"])
def login():
     data = request.json 
     username = data.get("username")
     password = data.get("password")

     validUser = users.find_one({"username": username})

     if validUser is None:
          return jsonify({"error": "Invalid username or password"}), 401
     
     if decrypt(validUser["password"], 2, 1) == password:
        hardware.update_one({'name': 'HWSet1'}, {"$set": {'username': username}})
        return jsonify({"message": "Login Successful"}), 200
     else: 
        return jsonify({"error": "Invalid username or password"}), 401


@app.route("/get_projects", methods=["GET"])
def get_project():
    data = request.json
    username = data.get('user')

    user = users.find_one({"username": username})
    if user is None:
        return jsonify({"error": "Invalid project name"}), 401
    
    result = {'projects': []}
    for project_name in user['projects']:
        valid_project = projects.find_one({'project_name': project_name})
        if valid_project:
            result['projects'].append(jsonify(valid_project))
        else:
            return jsonify({"error": "Couldn't find project"}), 401
        
    return jsonify(result)


@app.route("/push_project", methods=["POST"])
def push_project():
     data = request.json #Need to contain: Project name, checking in/out, quantity, hw_set#
     project_name = data.get('project_name')
     quantity = data.get('quantity')
     check_in = data.get('check_in')    #checking out if false
     hwset = data.get('hw_set')

     valid_project = projects.find_one({"project_name": project_name})

     if valid_project is None:
         return jsonify({"error": "Invalid project name"}), 401
     
     current_user = hardware.find_one({'name': 'HWSet1'})
     if current_user['username'] in valid_project['user_access']:
         if check_in:
            hardware_data = hardware.find_one({"name": f"HWSet{hwset}"})
            availability = hardware_data['availability']
            if availability >= quantity:
                availability -= quantity
                new_quantity = valid_project[f'HWSet{str(hwset)}'] + quantity
                projects.find_one({"project_name": project_name}, {'$set': {f'HWSet{str(hwset)}': new_quantity}})
         else:
             if valid_project[f'HWSet{str(hwset)}'] >= quantity:
                 new_quantity = valid_project[f'HWSet{str(hwset)}'] - quantity
                 projects.find_one({"project_name": project_name}, {'$set': {f'HWSet{str(hwset)}': new_quantity}})
         return jsonify(valid_project)
     
     else:
         return jsonify({"error": "You don't have access to this project"}), 401
         

@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.json #Need to contain: Project name, quantity, users
    if not data:
        return jsonify({"error": "Invalid project name"}), 401
    project_name = data.get('project_name')
    exist = projects.find_one({"project_name": project_name})

    if not exist:
        current_user = hardware.find_one({'name': 'HWSet1'})
        projects.insert_one({'project_name':project_name, 'HWSet1': 0, 'HWSet2': 0, 'users': [current_user['username']]})
        return jsonify({"message": "Created Project Successfully"})
    else:
        return jsonify({"error": "A project with this name already exists"}), 401


@app.route("/logout")
def logout():
    hardware.update_one({'name': 'HWSet1'}, {"$set": {'username': ''}})
    return '<p>Logged out</p>'


@app.route("/", methods=["GET"])
def index():
     return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=os.environ.get("PORT", 80))