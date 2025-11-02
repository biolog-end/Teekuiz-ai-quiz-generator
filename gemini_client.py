import os
import logging
import json
from google import genai
from google.genai import types
import google.auth
from google.api_core import exceptions as google_exceptions
from colorama import Fore, Style, init
from dotenv import load_dotenv
from prompts import MASTER_PROMPTS

init(autoreset=True)
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

gemini_client = None

BASE_GEMINI_MODEL = "gemini-2.0-flash" 

def init_gemini_client():
    """Инициализирует клиент Gemini API."""
    global gemini_client, BASE_GEMINI_MODEL
    logging.info("Инициализация клиента Gemini...")
    try:
        api_key = os.getenv("GOOGLE_API_KEY", "").strip()
        if not api_key:
             logging.info("GOOGLE_API_KEY не найден, попытка использовать Application Default Credentials (ADC)...")
             try:
                 credentials, project_id = google.auth.default()
                 gemini_client = genai.Client() 
                 logging.info(f"Используются ADC. Project ID: {project_id}")
             except google.auth.exceptions.DefaultCredentialsError:
                 raise ValueError("GOOGLE_API_KEY не установлен и Application Default Credentials не найдены.")
        else:
             logging.info("Используется GOOGLE_API_KEY из переменных окружения.")
             gemini_client = genai.Client(api_key=api_key) 

        gemini_client.models.list()
        logging.info(Fore.GREEN + "Клиент Gemini создан и аутентифицирован.")

        try:
             full_model_name = f'{BASE_GEMINI_MODEL}'
             gemini_client.models.get(model=full_model_name)
             logging.info(Fore.GREEN + f"Базовая модель '{BASE_GEMINI_MODEL}' (проверена как '{full_model_name}') доступна.")
        except Exception as model_err:
             logging.warning(Fore.YELLOW + f"Предупреждение: Не удалось проверить доступность модели '{BASE_GEMINI_MODEL}': {model_err}")
             logging.warning(Fore.YELLOW + f"Убедитесь, что модель '{BASE_GEMINI_MODEL}' существует и доступна вашему ключу/аккаунту.")

        return gemini_client 

    except ValueError as e:
        logging.error(Fore.RED + f"Ошибка инициализации Gemini: {e}")
        gemini_client = None
        return None
    except Exception as e:
        logging.error(Fore.RED + f"Неожиданная ошибка при инициализации Gemini: {e}", exc_info=True)
        gemini_client = None
        return None

def generate_quiz_json(user_prompt: str, lang: str = 'ru') -> tuple[str | None, str | None]:
    """Генерирует JSON-структуру для теста."""
    if not gemini_client:
        error_msg = "Клиент Gemini не был инициализирован. Проверь логи сервера."
        logging.error(error_msg)
        return None, error_msg

    prompt_template = MASTER_PROMPTS.get(lang, MASTER_PROMPTS['ru'])
    master_prompt = prompt_template.format(user_prompt=user_prompt)

    try:
        search_tool = types.Tool(
            google_search=types.GoogleSearchRetrieval()
        )
        generation_config = types.GenerateContentConfig(tools=[search_tool])
        logging.info("Конфигурация с инструментом Google Search успешно создана.")
    except Exception as e:
        logging.error(f"Не удалось создать конфигурацию для Google Search: {e}")
        
        generation_config = None


    try:
        logging.info(f"Отправка запроса к модели '{BASE_GEMINI_MODEL}'...")

        api_args = {
            "model": BASE_GEMINI_MODEL,
            "contents": master_prompt
        }

        if generation_config:
            api_args["config"] = generation_config
            logging.info(Fore.CYAN + "Запрос будет отправлен с включенным Google Search.")

        response = gemini_client.models.generate_content(**api_args)

        if response.text:
            generated_text = response.text.strip()
            if generated_text.startswith("```json"):
                generated_text = generated_text[7:-3].strip()

            logging.info("Ответ от Gemini API успешно получен.")
            return generated_text, None
        else:
            error_msg = "Модель вернула пустой ответ."
            logging.warning(f"{error_msg} (Промпт: {user_prompt})")
            return None, error_msg

    except Exception as e:
        error_msg = f"Ошибка при вызове client.models.generate_content: {e}"
        logging.error(f"{error_msg}", exc_info=True)
        return None, error_msg