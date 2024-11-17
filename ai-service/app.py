import os
import re
from flask import Flask, request, jsonify
from groq import Groq

# Initialize Groq client
client = Groq(
    api_key="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"
)

# Initialize Flask app
app = Flask(__name__)

def format_to_array_of_objects(raw_string):
    # Extract individual questions using regex to capture the question text, options, and correct answer
    pattern = re.compile(
        r'\"questionText\":\s*\"(.*?)\".*?\"options\":\s*\[(.*?)\].*?\"correctAnswer\":\s*\"(\d)\"',
        re.DOTALL
    )
    matches = pattern.findall(raw_string)
    
    formatted_questions = []

    # Process each match and convert it into the desired object format
    for match in matches:
        question_text = match[0]
        options = [opt.strip().strip('\"') for opt in match[1].split(',')]
        correct_answer_index = int(match[2]) - 1  # Convert to 0-based index
        correct_answer = options[correct_answer_index]
        
        formatted_questions.append({
            "questionText": question_text,
            "options": options,
            "correctAnswer": correct_answer
        })

    return formatted_questions

# Function to generate the hint
def generate_hint(question, complexity, answer):
    if complexity == 'Easy':
        prompt = f"Explain the answer to this question briefly, in no more than two sentences:\n\nQuestion: {question}\nAnswer: {answer}"
    elif complexity == 'Medium':
        prompt = f"Provide a brief step-by-step approach to solving this question in no more than two sentences. Do not give the answer directly:\n\nQuestion: {question}\nAnswer: {answer}"
    elif complexity == 'Hard':
        prompt = f"Give a small hint to help the student make progress, but in no more than two sentences. Do not reveal the full answer:\n\nQuestion: {question}\nAnswer: {answer}"
    else:
        raise ValueError("Invalid complexity level! Choose from: Easy, Medium, Hard")
    
    # Call Groq API with the prompt
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": question}
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )

    # Aggregate the streamed response
    generated_response = ""
    for chunk in completion:
        generated_response += chunk.choices[0].delta.content or ""
    
    return generated_response

def generate_question(title, grade, subject, totalQuestions, difficulty):
    # Build the prompt for generating the questions based on the provided parameters
    prompt = f"""
    You are an expert question creator for school exams. Create {totalQuestions} multiple-choice questions for the following:

    Title: {title}
    Grade: {grade}
    Subject: {subject}
    Difficulty: {difficulty}

    Use the following structure for each question:
    {{
        "questionText": "<Question>",
        "options": ["<Option1>", "<Option2>", "<Option3>", "<Option4>"],
        "correctAnswer": "<CorrectAnswer>"
    }}

    Ensure that questions follow the subject and grade level, and provide only relevant multiple-choice questions with a correct answer.
    give me the response in json format only which contains the questions as array of object. don't include any other information.
    """

    # Call Groq API with the prompt
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": prompt},
            # {"role": "user", "content": }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )

    # Aggregate the streamed response
    generated_response = ""
    for chunk in completion:
        generated_response += chunk.choices[0].delta.content or ""
    
    return generated_response

# Flask route to create API endpoint
@app.route('/generate-hint', methods=['POST'])
def generate_hint_endpoint():
    try:
        data = request.json
        question = data.get('question')
        complexity = data.get('complexity')
        answer = data.get('answer')

        if not question or not complexity or not answer:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Generate the hint
        hint = generate_hint(question, complexity, answer)
        
        # Return the generated hint
        return jsonify({'hint': hint}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/generate-questions', methods=['POST'])
def generate_question_endpoint():
    try:
        data = request.json

        if not data:
            return jsonify({'error': 'Missing required parameters'}), 400

        title = data.get('title')
        grade = data.get('grade')
        subject = data.get('subject')
        totalQuestions = data.get('totalQuestions')
        difficulty = data.get('difficulty')

        question = generate_question(title, grade, subject, totalQuestions, difficulty)
        print(question)

        return jsonify({'questions': question}), 200


        # formatted_questions = format_to_array_of_objects(question)
        # print("Formatted Questions")
        # print(formatted_questions)

        # return jsonify({'questions': formatted_questions}), 200


    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
