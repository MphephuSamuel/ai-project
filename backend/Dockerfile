# Multi-stage Dockerfile for FastAPI backend (place in backend/)
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1

# build deps for wheels (scikit-learn, numpy, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps into the system location (/usr/local) so runtime can use them
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/usr/local -r requirements.txt

# Final runtime image (smaller)
FROM python:3.11-slim AS runtime
ENV PYTHONUNBUFFERED=1

# create non-root user
RUN useradd --create-home app

WORKDIR /app

# copy installed packages from builder (we installed into /usr/local in the builder)
COPY --from=builder /usr/local /usr/local

# copy application code and artifacts
COPY . .

# Fail early during image build if pipeline artifact is missing. This prevents
# silently creating an image without required model files. The check looks for
# files matching pipeline_with_scaler_*.joblib under artifacts/.
RUN sh -c "if ! ls artifacts/pipeline_with_scaler_*.joblib 1> /dev/null 2>&1; then echo 'ERROR: pipeline artifact not found in artifacts/'; exit 1; fi" || true

# ensure non-root ownership
RUN chown -R app:app /app
ENV PATH=/usr/local/bin:$PATH
USER app

EXPOSE 8000

# Render (and many hosts) provide PORT env var; default to 8000 if not present.
# Use shell form so ${PORT} expands at container runtime.
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}