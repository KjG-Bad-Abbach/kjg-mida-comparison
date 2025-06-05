# Use the official Python image as the base
FROM python:3.13.4-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /docs

# Install mkdocs and optionally mkdocs-material theme
RUN pip install --no-cache-dir mkdocs mkdocs-material

# Expose the default MkDocs port
EXPOSE 8000

# Default command to serve the site
CMD ["mkdocs", "serve", "--dev-addr=0.0.0.0:8000"]
