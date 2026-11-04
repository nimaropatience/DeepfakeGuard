# DeepfakeGuard

## Run locally

Start the API from the `backend` directory:

```powershell
python -m pip install -r .\requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In another terminal, start the frontend:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173` and uses the API at
`http://localhost:8000` by default. Set `VITE_API_URL` in a local
`frontend/.env` file to point it at another API. Copy `.env.example` for the
Docker Compose configuration.

Run both services with `docker compose up --build` from the repository root.

When model weights are not installed on the backend, it runs in demo mode and
returns simulated results. Demo results are for exploring the application only,
not for assessing real media.