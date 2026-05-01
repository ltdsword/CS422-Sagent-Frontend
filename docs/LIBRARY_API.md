# Library API (papers)

Routes for the **`library`** app: CRUD on **`Paper`** and semantic/metadata search. See [FRONTEND_API_ACCESS.md](./FRONTEND_API_ACCESS.md) for obtaining a token.

## Base URL

- Example local backend: `http://localhost:8000`
- All library routes are under **`/library/`**
- The router uses **trailing slashes** (e.g. `/library/papers/`).

Examples:

- `http://localhost:8000/library/papers/`
- `http://localhost:8000/library/papers/search/`

## Authentication

- **`Authorization: Token <token>`** (same scheme as workspaces/auth docs).
- **`Content-Type: application/json`** for bodies with JSON.

All **`PaperViewSet`** actions require an authenticated user (**`IsAuthenticated`**).

---

## Papers (`PaperViewSet`)

Registered under **`papers`** → URLs below.

| Action | Method | URL | Serializer |
|--------|--------|-----|------------|
| List | `GET` | `/library/papers/` | `PaperListSerializer` |
| Create | `POST` | `/library/papers/` | `PaperDetailSerializer` |
| Retrieve | `GET` | `/library/papers/<id>/` | `PaperDetailSerializer` |
| Full update | `PUT` | `/library/papers/<id>/` | `PaperDetailSerializer` |
| Partial update | `PATCH` | `/library/papers/<id>/` | `PaperDetailSerializer` |
| Delete | `DELETE` | `/library/papers/<id>/` | — |

`<id>` is the paper primary key (**integer / bigint**).

### List response (`PaperListSerializer`)

Each element includes:

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer | Paper pk |
| `title` | string | |
| `year` | integer \| null | |
| `referenceCount` | integer | |
| `citationCount` | integer | |
| `venue` | object \| null | Nested **`VenueSerializer`** (`id`, `name`, `venue_type`, `venue_type_display`) |
| `authors` | string | **Display-only**: up to two names, then `", ..."` if more |
| `pdf_url` | string \| null | |

Example item:

```json
{
  "id": 918273645566778899,
  "title": "Example paper",
  "year": 2024,
  "referenceCount": 12,
  "citationCount": 34,
  "venue": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "arXiv",
    "venue_type": "preprint",
    "venue_type_display": "Preprint"
  },
  "authors": "A. Chen, B. Kumar",
  "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf"
}
```

### Detail response (`PaperDetailSerializer`)

Exposes **`embedding`** and **`needs_embedding`** only on the model; both are **excluded** from API output.

Returned fields include:

| Field | Type | Notes |
|-------|------|--------|
| `id` | integer | |
| `title` | string | |
| `abstract` | string \| null | |
| `year` | integer \| null | |
| `publication_date` | date string \| null | `YYYY-MM-DD` |
| `doi` | string \| null | |
| `pdf_url` | string \| null | |
| `referenceCount` | integer | |
| `citationCount` | integer | |
| `influentialCitationCount` | integer | |
| `authors` | array | **`AuthorSerializer`**: `{ "id", "name" }[]`, **read-only** |
| `venue` | object \| null | **`VenueSerializer`**, **read-only** |
| `fields` | array | **`FieldOfStudySerializer`**: `{ "id", "name" }[]` (research fields), **read-only** |
| `extracted_content` | object \| null | **`ExtractedContentSerializer`** (problem/methodology/etc.), **read-only** |

Nested **`authors`**, **`venue`**, **`fields`**, and **`extracted_content`** are **read-only** in this serializer: you cannot attach authors or venues by nesting objects in **`POST`/`PATCH`** unless the project adds write-capable fields or separate endpoints.

### Create / update body (practical subset)

What the API will typically accept matches **non–read-only model fields** still exposed by **`PaperDetailSerializer`**:

- **`id`** — usually required on **create** because **`Paper`** uses a non-auto **`BigIntegerField`** primary key (your client or upstream system supplies it).
- **`title`**
- **`abstract`** (optional)
- **`year`**, **`publication_date`**
- **`doi`**, **`pdf_url`**
- **`referenceCount`**, **`citationCount`**, **`influentialCitationCount`**

Server-side behavior:

- **Create** (`perform_create`): **`needs_embedding`** is set to **`true`** after save.
- **Update** (`perform_update`): **`needs_embedding`** is set to **`true`** only if **`title`** or **`abstract`** changed relative to the existing instance; otherwise it keeps the prior value.

Embedding vectors themselves are **not** writable through this serializer.

Minimal **create** example:

```json
{
  "id": 918273645566778899,
  "title": "My paper title",
  "abstract": "Abstract text.",
  "year": 2024,
  "referenceCount": 0,
  "citationCount": 0,
  "influentialCitationCount": 0
}
```

---

## Search (`POST /library/papers/search/`)

Semantic search (when **`query`** is provided) plus optional metadata filters. Implemented in **`PaperSearchService`** (`library/services.py`).

| Method | URL |
|--------|-----|
| `POST` | `/library/papers/search/` |

### Request body

All keys are optional except that **either** **`query`** **or** at least **one filter** must be meaningful; otherwise **`400`**:

```json
{
  "error": "Please provide a search query or apply at least one filter."
}
```

| Field | Type | Purpose |
|-------|------|---------|
| `query` | string \| null | Natural-language query; if set, backend embeds it and orders by **cosine distance** to **`Paper.embedding`** |
| `limit` | integer | Max rows (default **`10`**) |
| `start_year` | number \| string \| null | `year >= start_year` |
| `end_year` | number \| string \| null | `year <= end_year` |
| `venues` | array | Venue **names**; filters `venue__name__in` |
| `author` | string \| null | Substring match on **`authors__name`** |
| `keywords` | string \| null | Comma-separated tokens; each token must appear in **title**, **abstract**, or **field of study name** (OR within each token’s clause, combined with AND across tokens in code) |
| `sort_by` | string \| null | When **`query`** is **absent**: **`year`** (default, descending) or **`citation`** (`citationCount` descending) |

Example:

```json
{
  "query": "transformer architectures for NLP",
  "limit": 20,
  "start_year": 2020,
  "end_year": 2025,
  "venues": ["arXiv"],
  "author": "Chen",
  "keywords": "attention, segmentation",
  "sort_by": "year"
}
```

### Success response (`200`)

Uses **`PaperSearchSerializer`** (list shape **plus** **`distance`** when the queryset provides it).

```json
{
  "count": 10,
  "results": [
    {
      "id": 918273645566778899,
      "title": "...",
      "year": 2023,
      "referenceCount": 5,
      "citationCount": 42,
      "venue": { "...": "..." },
      "authors": "A. Chen, ...",
      "pdf_url": "...",
      "distance": 0.182
    }
  ]
}
```

- **`distance`**: Present when semantic search ran (**`query`** non-empty); interprets as embedding distance from **`PaperSearchService`** (smaller is closer). Exact semantics depend on **`CosineDistance`** / pgvector setup.

### Errors

| Status | When |
|--------|------|
| `400` | No **`query`** and no filter values |
| `500` | Uncaught exception (e.g. embedding provider failure); body includes **`{"error": "Internal server error: ..."}`** |

---

## Operational notes

- **Semantic search** requires papers with usable **`embedding`** rows and a working **`EmbeddingService`** (configuration outside this doc).
- **OpenAPI**: **`drf-spectacular`** is in dependencies; if wired in project URLs, generate the schema from a running server for machine-readable definitions.
