# DeepfakeGuard

An Explainable Hybrid CNN Framework for Real-Time Deepfake Detection in Digital Forensics.

BSc Final Year Project, Uganda Christian University
Student: Nimaro Patience Torach | Supervisor: Julius Torach

## Architecture

- **Spatial branch**: EfficientNet-B4 (1,792-dim features)
- **Temporal branch**: MediaPipe Face Mesh + LSTM eye-movement tracking (32-dim)
- **Fusion head**: 1,824 -> 256 -> 64 -> 1 (sigmoid)
- **Explainability**: Grad-CAM heatmaps on the EfficientNet-B4 spatial branch

## Tech Stack

| Layer    | Technology                                      |
|----------|------------------------------------------------|
| Backend  | Python 3.11, FastAPI, Uvicorn, ONNX Runtime   |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS       |
| Animation| Motion for React (motion.dev)                   |
| Charts   | Recharts                                        |
| Face Det.| MTCNN (facenet-pytorch)                         |
| Eye Track| MediaPipe Face Mesh                             |
| Database | SQLite + SQLModel                               |
| Deploy   | Docker Compose                                  |

## Quick Start (Windows, no Docker)

### 1. Clone and set up the backend

```bash
cd deepfakeguard
python -m venv venv
venv\Scripts\activate
cd backend
pip install -r requirements.txt
```

### 2. Start the backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend starts in **demo mode** if no ONNX weights are found in `backend/models/`.
Demo mode returns realistic mock results so the UI works without trained models.

### 3. Set up and start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Quick Start (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Model Weights

Place ONNX weights in `backend/models/`:

| File                          | Description                    |
|-------------------------------|--------------------------------|
| `hybrid_fusion.onnx`         | Full hybrid model (single file)|
| `efficientnet_b4_spatial.onnx` | Spatial branch only          |
| `eye_lstm_temporal.onnx`     | Temporal branch only           |
| `fusion_head.onnx`           | Fusion classifier only         |
| `mesonet4_baseline.onnx`     | MesoNet-4 baseline             |

To export from PyTorch checkpoints:
```bash
cd backend
python scripts/export_onnx.py --checkpoint path/to/model.pth --output models/hybrid_fusion.onnx
```

## API Endpoints

| Method | Path                      | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | /api/analyze/video        | Upload video, returns job_id       |
| POST   | /api/analyze/image        | Upload image, returns result       |
| GET    | /api/jobs/{job_id}        | Poll job status and results        |
| GET    | /api/history              | List past analyses                 |
| GET    | /api/history/{id}         | Get one stored result              |
| GET    | /api/history/{id}/report  | Download PDF forensic report       |
| GET    | /api/models               | List available models              |
| WS     | /ws/live                  | Live webcam analysis               |
| GET    | /api/health               | Health check                       |

## Project Structure

```
deepfakeguard/
  backend/
    app/
      main.py              # FastAPI app, CORS, lifespan
      api/
        analyze.py         # /api/analyze/video and /api/analyze/image
        jobs.py            # /api/jobs/{job_id}
        history.py         # /api/history endpoints
        models_api.py      # /api/models
        live.py            # WebSocket /ws/live
      services/
        video.py           # Video decoding, frame sampling
        faces.py           # MTCNN face detection
        inference.py       # ONNX inference, model registry
        eye.py             # MediaPipe EAR extraction
        gradcam.py         # Grad-CAM generation
        report.py          # PDF report generation
      models/
        registry.py        # Model registry pattern
        schemas.py         # Pydantic response models
      db/
        database.py        # SQLite + SQLModel setup
        models.py          # Analysis record ORM model
    scripts/
      export_onnx.py       # PyTorch to ONNX converter
    models/                # ONNX weight files go here
    tests/
      test_api.py
    requirements.txt
  frontend/
    src/
      main.tsx             # App entry, router, providers
      router.tsx           # Route definitions
      components/
        layout/
          AppLayout.tsx    # Shell with navbar + page transitions
          Navbar.tsx       # Sticky nav with sliding pill
        ui/
          Button.tsx       # Animated button
          Card.tsx         # Animated card
          Reveal.tsx       # Scroll-triggered reveal wrapper
        results/
          VerdictCard.tsx  # Radial gauge + verdict
          StatTiles.tsx    # 5 stat tiles
          GradCamGallery.tsx
          EarChart.tsx     # Eye movement chart
          TechnicalDetails.tsx
        landing/
          CapabilityTabs.tsx
          Faq.tsx
      pages/
        Landing.tsx
        Detect.tsx
        Live.tsx
        History.tsx
        Models.tsx
        About.tsx
      hooks/
        useJob.ts          # Job polling hook
        useHistory.ts      # History list hook
        useLiveSocket.ts   # WebSocket hook
      lib/
        api.ts             # API client (fetch wrapper)
        motion.ts          # Shared Motion variants
        types.ts           # TypeScript interfaces
      styles/
        tokens.css         # CSS variables, fonts
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    tailwind.config.js
    postcss.config.js
  docker-compose.yml
  .env.example
```

## Datasets

- **Training**: DFDC sample set (400 videos, 70/15/15 identity-aware split)
- **Cross-dataset testing**: Celeb-DF v2 (590 real + 5,639 fake = 6,229 videos)

## Limitations

- Cross-dataset generalisation gap (AUC drops from DFDC to Celeb-DF)
- CPU inference is slower than GPU; real-time webcam may lag on older hardware
- Dataset size is limited compared to production-scale detectors
- Results are probabilistic and support, not replace, expert forensic review
