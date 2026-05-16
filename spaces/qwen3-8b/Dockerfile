FROM python:3.10-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
RUN pip install --no-cache-dir \
    gradio==5.20.0 \
    spaces==0.50.2 \
    transformers==4.51.0 \
    torch==2.5.1 \
    accelerate==1.6.0 \
    numpy

# Copy app
COPY app.py /app/app.py

EXPOSE 7860

CMD ["python", "app.py"]
