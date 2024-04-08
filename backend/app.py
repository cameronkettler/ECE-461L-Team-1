
#passcode: R6BykARDXo2JIEEs
from flask import Flask, send_from_directory, request, jsonify, session
from flask_cors import CORS
import json
import os
import sys


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


def encrypt(input: str, n: int, d: int):
    result = ""
    for char in input[::-1]:
        val = ord(char)
        change = (d * n)
        for _ in range(0, change, d):
            val += d
            if val < 34:
                val = 126
            elif val > 126:
                val = 35
        result += chr(val)
    return result

def decrypt(input: str, n: int, d: int):
    result = ""
    for char in reversed(input):
        val = ord(char)
        change = (-1 * d * n)
        for _ in range(0, change, -1 * d):
            val += (-1 * d)
            if val < 34:
                val = 126
            elif val > 126:
                val = 35
        result += chr(val)
    return result

app = Flask(__name__, static_folder="../frontend/hw-view/public", static_url_path="/")
# app.secret_key = "temp_secret_key"
CORS(app)#, origins='http://localhost:3000')

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
          encryptedPass = encrypt(password, 2, 1)
          print(encryptedPass)
          users.insert_one({"username": username, "password": encryptedPass, "projects": []})
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
def get_projects():
    username = request.args.get('username')

    user = users.find_one({"username": username})
    if user is None:
        return jsonify({"error": "Invalid User"}), 404
    
    result = []
    for project_name in user.get('projects', []):
        valid_project = projects.find_one({'project_name': project_name})
        hwSet1 = hardware.find_one({'name': 'HWSet1'})
        hwSet2 = hardware.find_one({'name': 'HWSet2'})
        if valid_project:
            project_data = {
                'name': valid_project['project_name'],
                'listAuthorizedUsers': ', '.join(valid_project.get('users', [])),
                'HWSet1': f"{hwSet1.get('availability')}/1000",
                'HWSet2': f"{hwSet2.get('availability')}/1000",
                'alreadyJoined': username in valid_project.get('users', []),
                'authorizedUsers': valid_project['authorized users'],
            }
            result.append(project_data)
        else:
            continue

    print(result)

    return jsonify({"projects": result})


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
    data = request.json
    username = data.get('username')

    authorizedUsers = data.get('authorizedUsers')

    print(data)

    # Check if request data is valid
    if not data or 'project_name' not in data:
        return jsonify({"error": "Invalid request data"}), 400
    
    project_name = data['project_name']
    
    # Check if project with the same name already exists
    if projects.find_one({"project_name": project_name}):
        return jsonify({"error": "A project with this name already exists"}), 400
    
    # Insert new project into the database
    current_user = users.find_one({'username': username})
    projects.insert_one({'project_name': project_name, 'HWSet1': 0, 'HWSet2': 0, 'users': [current_user['username']], 'authorized users': authorizedUsers})
    users.update_one({'username': username}, {'$push': {'projects': project_name}}) 
  
    # Return success message
    return jsonify({"message": "Project created successfully"}), 200

@app.route('/join_project', methods=['POST'])
def join_project():
    data = request.json
    projectName = data.get('projectName')
    username = data.get('username')

    print(data)

    if not projectName or not username:
        return jsonify({"error": "Project ID and username are required"}), 400

    project = projects.find_one({"project_name": projectName})

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if username not in project['authorized users']:
        return jsonify({"error": "You are not authorized to join this project"}), 403
    
    current_user = users.find_one({'username': username})
    if projectName not in current_user['projects']:
        projects.update_one({"project_name": projectName}, {"$push": {"users": username}})
        users.update_one({"username": username}, {"$push": {"projects": projectName}})

    return jsonify({"message": "User successfully joined the project"}), 200

@app.route("/check_in", methods=["POST"])
def check_in():
    data = request.json
    hwSet = data.get('HWSet')
    projName = data.get('projName')
    valToCheckIn = data.get('amtCheckIn')
    project = projects.find_one({'project_name': projName})
    currHWSet = hardware.find_one({'name': hwSet})
    newVal = project[hwSet] - valToCheckIn

    if newVal >= 0:
        projects.update_one({'project_name': projName}, {'$set': {hwSet: newVal}})
        newAvailability = currHWSet['availability'] + valToCheckIn
        hardware.update_one({'name': hwSet}, {'$set': {'availability': newAvailability}})
        return jsonify({'newAvailability': newAvailability})
    else:
        return jsonify({"error": "Insufficient quantity to check in"}), 404

@app.route("/check_out", methods=["POST"])
def check_out():
    data = request.json
    hwSet = data.get('HWSet')
    projName = data.get('projName')
    valToCheckOut = data.get('amtCheckOut')
    project = projects.find_one({'project_name': projName})
    currHWSet = hardware.find_one({'name': hwSet})
    newVal = currHWSet['availability'] - valToCheckOut

    if newVal >= 0:
        newAmtHdwr = project[hwSet] + valToCheckOut
        projects.update_one({'project_name': projName}, {'$set': {hwSet: newAmtHdwr}})
        newAvailability = currHWSet['availability'] - valToCheckOut
        hardware.update_one({'name': hwSet}, {'$set': {'availability': newAvailability}})
        return jsonify({'newAvailability': newAvailability})
    else:
        return jsonify({"error": "Insufficient quantity to check out"}), 404

@app.route("/join_leave_project", methods=["POST"])
def join_leave_project():
    data = request.json
    action = data.get('action')
    projName = data.get('projName')
    username = data.get('user')
    project = projects.find_one({'project_name': projName})
    if project:
        if action:
            projects.update_one({'project_name': project['project_name']}, {'$addToSet': {'users': username}})
        else:
            projects.update_one({'project_name': project['project_name']}, {'$pull': {'users': username}})
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Project not found"}), 404


@app.route("/logout")
def logout():
    hardware.update_one({'name': 'HWSet1'}, {"$set": {'username': ''}})
    return '<p>Logged out</p>'


@app.route("/", methods=["GET"])
def index():
     return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(host="127.0.0.1", debug=True, port=os.environ.get("PORT", 80))