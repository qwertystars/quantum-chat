FROM python:3.11-slim

WORKDIR /app

# Disable Python bytecode generation (for read-only filesystem)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-compile Python bytecode
RUN python -m compileall -b .

# Create necessary directories for tmpfs mounts
RUN mkdir -p /tmp

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
