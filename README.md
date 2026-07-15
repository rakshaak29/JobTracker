# Job Application Tracker API

A Spring Boot REST API to track job applications as you go through a job search — replacing messy spreadsheets with status history logs, follow-up reminders, and search/stats dashboards.

## Features

- **CRUD Operations**: Add, edit, view, and delete job applications.
- **Status History Log**: Every transition (e.g. `APPLIED` → `INTERVIEW` → `OFFER`) is automatically recorded in a timeline.
- **Follow-up Reminders**: Set follow-up tasks for specific applications, check what is due this week, or check overdue items.
- **Analytics Dashboard**: Get response rates, average response time in days, and application counts grouped by status.
- **Filtered Search**: Search and filter applications by company name (case-insensitive, partial matching) and status.

## Tech Stack

- **Java 17**
- **Spring Boot 3.x** (Web, JPA, H2)
- **H2 Database** (In-memory, local development console enabled)
- **Maven** (Dependency management & builds)
- **Lombok** (Boilerplate code reduction)

---

## Getting Started

### Prerequisites

- Java 17+
- Maven

### Run the Application

From the root directory:

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

### Database Console
You can access the H2 database web interface at `http://localhost:8080/h2-console` using:
- **JDBC URL**: `jdbc:h2:mem:jobtracker`
- **Username**: `sa`
- **Password**: *(leave empty)*

---

## API Endpoints

### 1. Job Applications (`/applications`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications` | Create a new job application |
| `GET` | `/applications` | List all applications (supports optional query filters: `?status=...` and `?company=...`) |
| `GET` | `/applications/{id}` | Get application details by ID |
| `PUT` | `/applications/{id}` | Update application details (logs status changes automatically) |
| `DELETE` | `/applications/{id}` | Delete an application |

#### Create Application Example
```bash
curl -X POST http://localhost:8080/applications \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Google",
    "roleTitle": "Software Engineer",
    "dateApplied": "2026-07-15",
    "source": "LinkedIn",
    "notes": "Referred by university alum"
  }'
```

#### Filtered List Example
```bash
curl "http://localhost:8080/applications?company=goo&status=APPLIED"
```

---

### 2. Status History (`/applications/{id}/history`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/applications/{id}/history` | Get the status transition history for a specific application |

#### View History Example
```bash
curl http://localhost:8080/applications/1/history
```

---

### 3. Follow-up Reminders (`/follow-ups` & `/applications/{id}/follow-ups`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications/{appId}/follow-ups` | Add a follow-up reminder for an application |
| `GET` | `/applications/{appId}/follow-ups` | List all follow-ups for a specific application |
| `GET` | `/follow-ups/due-this-week` | Get all pending follow-ups due between today and Sunday |
| `GET` | `/follow-ups/overdue` | Get all pending follow-ups due before today |
| `PUT` | `/follow-ups/{id}/complete` | Mark a follow-up reminder as completed |

#### Create Follow-up Example
```bash
curl -X POST http://localhost:8080/applications/1/follow-ups \
  -H "Content-Type: application/json" \
  -d '{"dueDate":"2026-07-18","note":"Send connection request on LinkedIn"}'
```

---

### 4. Stats & Dashboard (`/applications/stats`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/applications/stats` | Retrieve metrics (counts, response rates, avg response times) |

#### Query Stats Example
```bash
curl http://localhost:8080/applications/stats
```
