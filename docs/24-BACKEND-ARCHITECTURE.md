# 24 — BACKEND ARCHITECTURE & SERVICE LAYER
**Platform:** Gujarat SentinelX API Core  
**Engine:** FastAPI + SQLAlchemy 2.0 Async + Pydantic v2  

---

## 1. Modular Service Architecture
The backend is structured into distinct, decoupled domains:
1. `app.core`: Settings, security, database session factories, structured logging, and standardized exceptions.
2. `app.models`: Declarative SQLAlchemy models covering 15 database tables.
3. `app.schemas`: Strongly typed Pydantic request/response data transfer objects.
4. `app.services`: Business logic layer containing `journey_service`, `alert_service`, `audit_service`, and `demo_service`.
5. `app.api.v1`: RESTful endpoints mounted under `/api/v1` and WebSocket broadcast manager.

---

## 2. Structured Error Handling
Exceptions are trapped and returned in strict compliance with the government platform standard:
```json
{
  "error": {
    "code": "CAMERA_NOT_FOUND",
    "message": "Camera was not found in registry",
    "request_id": "c88f1234-9ab2-..."
  }
}
```
