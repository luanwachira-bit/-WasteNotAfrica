import os
import json
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_alert(sensor_data):
    """
    Generate a localized spoilage alert in Swahili or English
    Input: { temperature: float, humidity: float }
    Output: {
        "alert_sw": str,
        "alert_en": str,
        "risk_level": "high"|"medium"|"low",
        "timestamp": iso_string
    }
    """
    temp = sensor_data['temperature']
    humidity = sensor_data['humidity']
    timestamp = datetime.now().isoformat()

    # Determine risk level
    if humidity > 70:
        risk = "high"
        action = "hamisha matomato kwenye mahali pana uvua"
    elif humidity > 50:
        risk = "medium"
        action = "angalia unyevu kila saa"
    else:
        risk = "low"
        action = "hakuna hatari ya uchafuzi"

    # Swahili prompt
    prompt_sw = f"""
    Una data ya kuwepo kwa unyevu wa {humidity}% katika kumbukumbu ya matomato.
    Unapokuwa ni mwanasheria wa kilimo wa Kenya, ujumbe ni ufupi sana (maneno 12).
    Utoe ushauri wa haraka kuhusu: {action}.
    Jibu tu kwa Kiswahili.
    """

    # English prompt
    prompt_en = f"""
    You are an agricultural advisor in Kenya.
    Sensor shows humidity = {humidity}%, temperature = {temp}°C.
    Give one short tip (max 10 words) to prevent spoilage.
    Respond only in English.
    """

    try:
        response_sw = model.generate_content(prompt_sw)
        response_en = model.generate_content(prompt_en)

        return {
            "alert_sw": response_sw.text.strip(),
            "alert_en": response_en.text.strip(),
            "risk_level": risk,
            "timestamp": timestamp
        }
    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        return {
            "alert_sw": "Tatizo la mtandao, angalia baadaye",
            "alert_en": "Network error, check later",
            "risk_level": "unknown",
            "timestamp": timestamp
        }

# Example usage
if __name__ == "__main__":
    test_data = {"temperature": 28, "humidity": 75}
    result = generate_alert(test_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))