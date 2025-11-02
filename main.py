import json
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import gemini_client

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__, static_folder='static')
CORS(app)  

gemini_client.init_gemini_client()

@app.route('/')
def serve_index():
    """Отдает главную страницу index.html."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Отдает другие статические файлы (CSS, JS)."""
    return send_from_directory(app.static_folder, path)

@app.route('/api/generate', methods=['POST'])
def generate_quiz():
    """
    API эндпоинт для генерации теста.
    Принимает JSON: {"prompt": "Тема теста", "lang": "ru"}
    Возвращает JSON с готовой структурой теста.
    """
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "Отсутствует поле 'prompt' в запросе"}), 400

    user_prompt = data['prompt']
    lang = data.get('lang', 'ru')

    if not user_prompt.strip():
        return jsonify({"error": "Поле 'prompt' не может быть пустым"}), 400

    logging.info(f"Получен запрос на генерацию теста по теме: '{user_prompt}' на языке: '{lang}'")
    
    json_string, error = gemini_client.generate_quiz_json(user_prompt, lang)

    if error:
        logging.error(f"Ошибка генерации от gemini_client: {error}")
        return jsonify({"error": f"Ошибка на стороне сервера: {error}"}), 500

    try:
        quiz_data = json.loads(json_string)
        logging.info("JSON от Gemini успешно распарсен.")
        return jsonify(quiz_data), 200
    except json.JSONDecodeError:
        logging.error(f"Ошибка парсинга JSON от Gemini. Ответ был: {json_string}")
        return jsonify({"error": "ИИ вернул невалидный JSON. Попробуйте еще раз."}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)