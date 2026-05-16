---
title: ModernFinBERT
emoji: 📈
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 5.4.0
app_file: app.py
pinned: false
---

# ModernFinBERT Space (ZeroGPU)

A Hugging Face Space that hosts [`tabularisai/ModernFinBERT`](https://huggingface.co/tabularisai/ModernFinBERT) for financial sentiment analysis, accelerated with **ZeroGPU**.

- **Model size**: 0.1B parameters
- **Hardware**: ZeroGPU (dynamic GPU allocation)
- **SDK**: Gradio 5.x

## API usage

The Gradio API is exposed automatically. You can call it from your backend with a simple HTTP `POST` to `/run/predict`.

Example payload:
```json
{
  "fn_index": 0,
  "data": ["Revenue grew 15% YoY\nFed raises rates by 0.75bps"]
}
```
