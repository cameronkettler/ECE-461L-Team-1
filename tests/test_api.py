from backend.app import app
from flask import jsonify
import json
import pytest

def test_signup():
    data = {'username': 'username', 'password': 'password'}
    response = app.test_client().post('/signup', data=data)
    print(jsonify(response))