import gradio as gr
import spaces
import json
import re
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"

print(f"Loading {MODEL_ID}...")
# Load model on CUDA at module level.
# Outside @spaces.GPU a PyTorch CUDA emulation is active.
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype="auto",
    device_map="auto",
)
print("Model ready on cuda.")


SYSTEM_PROMPT = (
    "You are a senior quantitative finance analyst. "
    "Analyze the provided market context and filtered news, then output a JSON object with:\n"
    "- signal: one of ['buy', 'sell', 'hold']\n"
    "- confidence: a float between 0.0 and 1.0\n"
    "- summary: a concise 1-2 sentence rationale\n"
    "- keyRisk: the single biggest risk factor\n"
    "Respond ONLY with valid JSON. No markdown, no explanations outside the JSON."
)


def extract_json(text: str) -> dict:
    """Try to extract a JSON object from the model output."""
    # Try direct JSON parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Look for JSON block inside markdown or raw text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Fallback
    return {
        "signal": "hold",
        "confidence": 0.0,
        "summary": "Failed to parse model output.",
        "keyRisk": "Model response parsing failed",
        "raw": text,
    }


@spaces.GPU(duration=90)
def analyze_market(market_context: str, news_summary: str) -> dict:
    """
    Generates a trading signal from market context + filtered news.
    """
    if not market_context:
        market_context = "No market data provided."
    if not news_summary:
        news_summary = "No news provided."

    user_content = (
        f"Market Context:\n{market_context}\n\n"
        f"Filtered News:\n{news_summary}\n\n"
        "Provide your analysis as JSON."
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_p=0.8,
        top_k=20,
    )
    output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
    raw_text = tokenizer.decode(output_ids, skip_special_tokens=True)

    return extract_json(raw_text)


with gr.Blocks(title="Qwen2.5-7B Financial Analyst") as demo:
    gr.Markdown("""
    # Qwen2.5-7B Financial Analyst
    Market signal generator powered by [`Qwen/Qwen2.5-7B-Instruct`](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct).
    Accelerated with Hugging Face **ZeroGPU**.
    """)

    with gr.Row():
        with gr.Column(scale=1):
            market_input = gr.Textbox(
                lines=6,
                label="Market Context",
                placeholder="Price action, indicators, macro data...",
            )
            news_input = gr.Textbox(
                lines=6,
                label="Filtered News",
                placeholder="Headlines already filtered by sentiment...",
            )
            submit_btn = gr.Button("Generate Signal", variant="primary")
        with gr.Column(scale=1):
            output_json = gr.JSON(label="Signal")

    submit_btn.click(
        fn=analyze_market,
        inputs=[market_input, news_input],
        outputs=output_json,
        api_name="predict",
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
