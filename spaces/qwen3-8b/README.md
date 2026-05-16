---
title: Qwen2.5-7B Financial Analyst
emoji: 🧠
colorFrom: purple
colorTo: indigo
sdk: gradio
sdk_version: 5.4.0
app_file: app.py
pinned: false
---

# Qwen2.5-7B Financial Analyst (ZeroGPU)

A Hugging Face Space that hosts [`Qwen/Qwen2.5-7B-Instruct`](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) to generate trading signals from market context and filtered news, accelerated with **ZeroGPU**.

- **Model size**: 7.6B parameters
- **Hardware**: ZeroGPU (dynamic GPU allocation)
- **SDK**: Gradio 5.x

## API usage

The Gradio API is exposed automatically. Use a Gradio client to call `/predict`.

Example (JavaScript `@gradio/client`):
```js
const { Client } = require("@gradio/client");
const client = await Client.connect("your-username/qwen2-5-7b-financial");
const result = await client.predict("/predict", {
  market_context: "BTC up 5% today, RSI at 72...",
  news_summary: "Fed raises rates, institutional inflows...",
});
// result.data[0] → { signal, confidence, summary, keyRisk }
```
