"""
LLM Client — Wrapper multi-provider
Supporte OpenAI (GPT-4o), Google (Gemini), Anthropic (Claude)
pour faciliter les tests comparatifs.
"""

import base64
import json
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import LLM_PROVIDER, LLM_MODELS, OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY


def _encode_image(image_path: str) -> str:
    """Encode une image en base64."""
    with open(image_path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")


def call_llm(prompt: str, images: list[str] = None, provider: str = None, json_output: bool = False) -> str:
    """
    Appelle le LLM sélectionné avec un prompt texte et des images optionnelles.

    Args:
        prompt: Le prompt texte
        images: Liste de chemins vers des images (pour l'analyse visuelle)
        provider: Forcer un provider ("openai" | "gemini" | "anthropic"), sinon utilise settings
        json_output: Si True, force une réponse JSON

    Returns:
        La réponse textuelle du LLM
    """
    provider = provider or LLM_PROVIDER
    model = LLM_MODELS.get(provider)

    if not model:
        raise ValueError(f"Provider inconnu : {provider}. Choix : openai, gemini, anthropic")

    if provider == "openai":
        return _call_openai(prompt, images, model, json_output)
    elif provider == "gemini":
        return _call_gemini(prompt, images, model, json_output)
    elif provider == "anthropic":
        return _call_anthropic(prompt, images, model, json_output)
    else:
        raise ValueError(f"Provider non implémenté : {provider}")


# ═══════════════════════════════════════════
# OPENAI
# ═══════════════════════════════════════════

def _call_openai(prompt: str, images: list[str], model: str, json_output: bool) -> str:
    try:
        from openai import OpenAI
    except ImportError:
        raise ImportError("pip install openai")

    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY manquante dans config/settings.py")

    client = OpenAI(api_key=OPENAI_API_KEY)

    content = []

    if images:
        for img_path in images:
            if Path(img_path).exists():
                b64 = _encode_image(img_path)
                ext = Path(img_path).suffix.lstrip(".").lower()
                mime = "image/png" if ext == "png" else "image/jpeg"
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime};base64,{b64}"}
                })

    content.append({"type": "text", "text": prompt})

    kwargs = {
        "model": model,
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 4096,
    }
    if json_output:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


# ═══════════════════════════════════════════
# GEMINI
# ═══════════════════════════════════════════

def _call_gemini(prompt: str, images: list[str], model: str, json_output: bool) -> str:
    try:
        import google.generativeai as genai
    except ImportError:
        raise ImportError("pip install google-generativeai")

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY manquante dans config/settings.py")

    genai.configure(api_key=GEMINI_API_KEY)
    llm = genai.GenerativeModel(model)

    parts = []

    if images:
        for img_path in images:
            if Path(img_path).exists():
                ext = Path(img_path).suffix.lstrip(".").lower()
                mime = "image/png" if ext == "png" else "image/jpeg"
                with open(img_path, "rb") as f:
                    parts.append({"mime_type": mime, "data": f.read()})

    parts.append(prompt)

    generation_config = {"max_output_tokens": 4096}
    if json_output:
        generation_config["response_mime_type"] = "application/json"

    response = llm.generate_content(parts, generation_config=generation_config)
    return response.text


# ═══════════════════════════════════════════
# ANTHROPIC
# ═══════════════════════════════════════════

def _call_anthropic(prompt: str, images: list[str], model: str, json_output: bool) -> str:
    try:
        import anthropic
    except ImportError:
        raise ImportError("pip install anthropic")

    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY manquante dans config/settings.py")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    content = []

    if images:
        for img_path in images:
            if Path(img_path).exists():
                b64 = _encode_image(img_path)
                ext = Path(img_path).suffix.lstrip(".").lower()
                media_type = "image/png" if ext == "png" else "image/jpeg"
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64}
                })

    final_prompt = prompt
    if json_output:
        final_prompt += "\n\nRéponds UNIQUEMENT avec du JSON valide, sans markdown ni texte autour."

    content.append({"type": "text", "text": final_prompt})

    response = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{"role": "user", "content": content}]
    )
    return response.content[0].text


# ═══════════════════════════════════════════
# UTILITAIRE : parse JSON depuis réponse LLM
# ═══════════════════════════════════════════

def parse_json_response(text: str) -> dict:
    """
    Parse une réponse JSON depuis un LLM, même si elle est entourée de markdown.
    """
    text = text.strip()

    # Retirer les blocs markdown ```json ... ```
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Tentative de trouver le JSON dans le texte
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Impossible de parser le JSON : {e}\n\nRéponse reçue :\n{text[:500]}")
