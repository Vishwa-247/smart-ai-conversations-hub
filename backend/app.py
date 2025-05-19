
from flask import Flask, jsonify
from flask_cors import CORS
from routers.chat import chat_router

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], supports_credentials=True)

# Register blueprints
app.register_blueprint(chat_router)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API server is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
