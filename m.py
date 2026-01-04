from flask import Flask, render_template, request, jsonify
import re
import pymongo
import random
from datetime import datetime

app = Flask(__name__)

# MongoDB Configuration
mongo_uri = "mongodb://localhost:27017/"
database_name = "chatbot"
collection_name = "logindetails"
collection_name2 = "chatresponse"
collection_name_feedback = "feedback"
client = pymongo.MongoClient(mongo_uri)
db = client[database_name]
collection = db[collection_name]
collection2 = db[collection_name2]
collection_feedback = db[collection_name_feedback]

# Function to generate a random string for unknown user input
def random_string():
    random_list = [
        "Please try writing something more descriptive.",
        "Oh! It appears you wrote something I don't understand yet",
        "Do you mind trying to rephrase that?",
        "I'm terribly sorry, I didn't quite catch that.",
        "I can't answer that yet, please try asking something else."
    ]
    return random.choice(random_list)

# Function to retrieve the best response from MongoDB based on user input
def get_response(input_string):
    split_message = re.split(r'\s+|[,;?!.-]\s*', input_string.lower())
    best_response = random_string()
    max_score = 0
    for response in collection2.find():
        required_words = response["required_words"]
        score = sum(1 for word in split_message if word in required_words)
        if score > max_score:
            max_score = score
            best_response = response["bot_response"]
    if not input_string:
        return "Please type something so we can chat :("
    if max_score == 0:
        return random_string()
    return best_response

# Route for the index page
@app.route('/')
def index():
    return render_template('index.html')

# Route for getting bot responses
@app.route('/get-response', methods=['POST'])
def get_bot_response():
    user_input = request.form.get('userInput', '')
    bot_response = get_response(user_input)
    return jsonify({'botResponse': bot_response})

# Function to validate user login credentials
def login(username, password):
    user = collection.find_one({"username": username, "password": password})
    if user:
        userid = user.get("id")
        UName = user.get("name")
        return True, UName, userid
    else:
        return False, "NULL", 0

# Route for user login
@app.route('/get-response-login', methods=['POST'])
def get_bot_login():
    username = request.form.get('username', '')
    password = request.form.get('password', '')
    response, name, Uid = login(username, password)
    bot_response = f"{response}\nUsername = {name}\nUser ID = {Uid}"
    return jsonify({'botResponse': bot_response, 'userId': Uid})

# Function to validate user ID
def user_valid(userid, collection):
    try:
        user = collection.find_one({"id": userid})
        if user:
            return user
        else:
            return "User not found"
    except Exception as e:
        return f"Error: {e}"

# Route for user validation
@app.route('/get-response-user', methods=['POST'])
def get_user_validation():
    userid = request.form.get('uid')
    bot_response = user_valid(userid, collection)  # Pass the collection parameter
    return jsonify({'botResponse': bot_response})

# Route for feedback submission
@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    feedback = request.form.get('feedback')
    current_time = datetime.now()  # Get current date and time
    # Save the feedback with date and time to the database
    collection_feedback.insert_one({"feedback": feedback, "timestamp": current_time})
    bot_response = "Thank you for your feedback: " + feedback
    return jsonify({'botResponse': bot_response})

if __name__ == '__main__':
    app.run(debug=True)
