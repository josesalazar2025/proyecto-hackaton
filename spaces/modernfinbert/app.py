import gradio as gr
import spaces
from transformers import pipeline

print("Loading tabularisai/ModernFinBERT on cuda...")
classifier = pipeline(
    "text-classification",
    model="tabularisai/ModernFinBERT",
    device="cuda",
)
print("Model ready on cuda.")


@spaces.GPU
def predict_sentiment(text_block):
    """
    Accepts multiple lines of text, classifies each one.
    Returns a JSON list of {label, score} dicts.
    """
    if not text_block:
        return []

    texts = [t.strip() for t in text_block.splitlines() if t.strip()]
    if not texts:
        return []

    raw_results = classifier(texts, batch_size=32)

    results = [
        {"label": r["label"], "score": float(r["score"])}
        for r in raw_results
    ]
    return results


with gr.Blocks(title="ModernFinBERT") as demo:
    gr.Markdown("""
    # ModernFinBERT Sentiment Analysis
    Financial sentiment classifier powered by
    [`tabularisai/ModernFinBERT`](https://huggingface.co/tabularisai/ModernFinBERT).
    Accelerated with Hugging Face **ZeroGPU**.
    """)

    with gr.Row():
        with gr.Column(scale=1):
            input_box = gr.Textbox(
                lines=10,
                label="Input texts",
                placeholder="Paste one headline / sentence per line...",
            )
            submit_btn = gr.Button("Analyze", variant="primary")
        with gr.Column(scale=1):
            output_json = gr.JSON(label="Results")

    submit_btn.click(fn=predict_sentiment, inputs=input_box, outputs=output_json, api_name="predict")

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
