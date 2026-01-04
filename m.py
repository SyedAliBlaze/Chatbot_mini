from flask import Flask, render_template, request, jsonify
import json
import random
import re

app = Flask(__name__)

# Load responses from sam.json
try:
    with open('sam.json', 'r') as file:
        response_data = json.load(file)
except FileNotFoundError:
    response_data = []
    print("Error: sam.json not found.")
except json.JSONDecodeError:
    response_data = []
    print("Error: sam.json is malformed.")

# Function to generate a random default response
def random_string():
    random_list = [
        "Please try writing something more descriptive.",
        "Oh! It appears you wrote something I don't understand yet",
        "Do you mind trying to rephrase that?",
        "I'm terribly sorry, I didn't quite catch that.",
        "I can't answer that yet, please try asking something else."
    ]
    return random.choice(random_list)

# Function to generate a response based on word matching and scoring
def get_bot_response(user_input):
    if not user_input:
        return "Please type something so we can chat :("

    # Normalize and split user input using regex
    split_message = re.split(r'\s+|[,;?!.-]\s*', user_input.lower().strip())
    split_message = [word for word in split_message if word]  # Remove empty strings

    best_response = random_string()
    max_score = 0

    # Iterate through response data
    for entry in response_data:
        required_words = [word.lower() for word in entry.get('required_words', [])]
        bot_response = entry.get('bot_response', '')

        # Calculate score based on matching words
        score = sum(1 for word in split_message if word in required_words)

        # Update best response if score is higher
        if score > max_score:
            max_score = score
            if isinstance(bot_response, list):
                best_response = random.choice(bot_response)
            else:
                best_response = bot_response

    # Return random default if no match (score == 0)
    if max_score == 0:
        return random_string()

    return best_response

# Route for the index page
@app.route('/')
def index():
    return render_template('index.html')

# Route for getting bot responses
@app.route('/get-response', methods=['POST'])
def get_bot_response_route():
    user_input = request.form.get('userInput', '')
    bot_response = get_bot_response(user_input)
    return jsonify({'botResponse': bot_response})

if __name__ == '__main__':
    app.run(debug=True)