# Workspaces API

How to call workspace-related endpoints: routes, JSON bodies, and responses. This complements [FRONTEND_API_ACCESS.md](./FRONTEND_API_ACCESS.md) (authentication).

## Base URL

- Example local backend: `http://localhost:8000`
- All workspace routes live under **`/workspaces/`**
- Django’s router uses **trailing slashes** (e.g. `/workspaces/`, not `/workspaces`).

Full examples:

- `http://localhost:8000/workspaces/`
- `http://localhost:8000/workspaces/workspace-paper/`
- `http://localhost:8000/workspaces/tag/`

## Authentication

- Use **Token authentication** (same as auth guide):

  `Authorization: Token <token>`

- Obtain `<token>` via `POST /auth/register/` or `POST /auth/login/`.
- Use **`Token`**, not `Bearer`.
- Send JSON where there is a body: `Content-Type: application/json`.

`WorkspaceViewSet` requires an authenticated user. You should send the header for **`workspace-paper`** and **`tag`** calls as well so `request.user` is set and rows are scoped to workspaces you own.

## Data model (mental map)

1. **Workspace** — owned by the logged-in user (`owner` is set server-side on create).
2. **WorkspacePaper** — links one **library `Paper`** (by numeric `paper` id) to a **workspace** (by UUID).
3. **Tag** — attaches to a **WorkspacePaper** row (not directly to a library paper).

Import order: create workspace → add paper to workspace → add tags to that workspace–paper link.

---

## 1. Workspaces (`WorkspaceViewSet`)

Router basename `workspace`, registered with an empty prefix, so URLs are directly under `/workspaces/`.

| Action | Method | URL | Notes |
|--------|--------|-----|--------|
| List my workspaces | `GET` | `/workspaces/` | Ordered by `-created_date`. Only workspaces owned by the user. |
| Create | `POST` | `/workspaces/` | Body below. `owner` is read-only and ignored from the client. |
| Retrieve | `GET` | `/workspaces/<uuid>/` | `<uuid>` is the workspace primary key. |
| Full update | `PUT` | `/workspaces/<uuid>/` | Same fields as create (see serializer). |
| Partial update | `PATCH` | `/workspaces/<uuid>/` | Typical use: `name` and/or `description`. |
| Delete | `DELETE` | `/workspaces/<uuid>/` | Returns `204 No Content`. |

### Create / update body (`WorkspaceSerializer`)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `name` | string | Yes on create | Max length 50 (model). Stripped server-side. |
| `description` | string | No | May be empty; max 500 (model). |

Example **create**:

```json
{
  "name": "Literature review",
  "description": "Papers for the NLU section."
}
```

Example **success response** (`201` create / `200` retrieve): shape includes server-set fields:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "created_date": "2026-05-01",
  "description": "Papers for the NLU section.",
  "name": "Literature review",
  "owner": 42
}
```

- `id`: UUID string.
- `created_date`: date string (`auto_now_add`).
- `owner`: Django user primary key (integer).

Errors: `400` with field errors from the serializer; `404` if the workspace is missing or not owned by you (detail/update/delete).

---

## 2. Workspace papers (`WorkspacePaperViewSet`)

Base path: **`/workspaces/workspace-paper/`**

| Action | Method | URL | Notes |
|--------|--------|-----|--------|
| List | `GET` | `/workspaces/workspace-paper/` | Rows whose workspace is owned by the user. |
| Create | `POST` | `/workspaces/workspace-paper/` | Adds an existing library `Paper` to a workspace. |
| Retrieve | `GET` | `/workspaces/workspace-paper/<id>/` | `<id>` is the **WorkspacePaper** integer id (not the paper id). |
| Update | `PUT` / `PATCH` | `/workspaces/workspace-paper/<id>/` | Updates `workspace` / `paper` if allowed by serializer (avoid changing uniqueness). |
| Delete | `DELETE` | `/workspaces/workspace-paper/<id>/` | Removes the link only (does not delete the library paper). `204`. |

### Create body (`WorkspacePaperSerializer`)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `workspace` | UUID | Yes | Must be a workspace **you own**. |
| `paper` | integer | Yes | Primary key of `library.Paper` (bigint). |

Example:

```json
{
  "workspace": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "paper": 918273645566778899
}
```

Example **success** (`201`):

```json
{
  "id": 17,
  "workspace": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "paper": 918273645566778899,
  "tags": []
}
```

- `tags`: read-only list of tag **names** (`StringRelatedField`) for convenience.

### Uniqueness

- Only one row per `(workspace, paper)`. Duplicate create returns **`400`** with a validation message such as “This paper is already in this workspace.” (serializer `UniqueTogetherValidator` or service `IntegrityError` handling).

---

## 3. Tags (`TagViewSet`)

Base path: **`/workspaces/tag/`**

| Action | Method | URL | Notes |
|--------|--------|-----|--------|
| List | `GET` | `/workspaces/tag/` | Tags on workspace papers in workspaces you own. |
| Create | `POST` | `/workspaces/tag/` | Body below. |
| Retrieve | `GET` | `/workspaces/tag/<id>/` | Tag integer id. |
| Update | `PUT` / `PATCH` | `/workspaces/tag/<id>/` | Standard model serializer update. |
| Delete | `DELETE` | `/workspaces/tag/<id>/` | `204`. |

Custom **create** uses the service layer: send **`workspace_paper`** and **`name`**.

### Create body (`TagSerializer`)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `workspace_paper` | integer | Yes | **WorkspacePaper** id (the link id), not the library paper id. |
| `name` | string | Yes | Max length 20 (model). Stripped server-side; empty after strip → `400`. |

Example:

```json
{
  "workspace_paper": 17,
  "name": "must-read"
}
```

Example **success** (`201`):

```json
{
  "id": 5,
  "workspace_paper": 17,
  "name": "must-read"
}
```

### Uniqueness

- One tag **name** per **workspace paper**. Duplicate returns **`400`** (“This tag already exists for this paper.”).

---

## Typical client flow

1. `POST /auth/login/` → save `token`.
2. `POST /workspaces/` → save workspace `id` (UUID).
3. `POST /workspaces/workspace-paper/` with `workspace` + library `paper` id → save **workspace-paper** `id`.
4. `POST /workspaces/tag/` with `workspace_paper` + `name` as needed.
5. `GET /workspaces/workspace-paper/` (or detail) to read rows including **`tags`** names.

## Error summary

| Code | Typical cause |
|------|----------------|
| `400` | Validation (duplicate paper/tag, empty name, bad FK). |
| `401` | Missing or invalid `Authorization` token (workspace CRUD). |
| `404` | Workspace or workspace-paper not found **for your user**, or invalid ids. |
| `204` | Successful delete (workspace or workspace-paper or tag). |

---

## OpenAPI / schema

If you enable **drf-spectacular**, generate or browse the schema from your running server for machine-readable paths and schemas.
