# docs/api/README.md
# Documentation API

## Authentification
### POST /api/auth/login
Body: { email, password }
Response: { token, user }

### POST /api/auth/logout
Headers: Authorization: Bearer {token}

## Naissances
### GET /api/births
Headers: Authorization: Bearer {token}
Response: { births: BirthRecord[] }

### POST /api/births
Headers: Authorization: Bearer {token}
Body: { firstName, lastName, birthDate, birthPlace, ... }

## Documents
### GET /api/documents
Headers: Authorization: Bearer {token}
Response: { documents: Document[] }

### POST /api/documents/upload
Headers: Authorization: Bearer {token}
Body: FormData { file }

## Tâches
### GET /api/tasks
Headers: Authorization: Bearer {token}
Response: { tasks: Task[] }

### POST /api/tasks
Headers: Authorization: Bearer {token}
Body: { title, description, assignee, dueDate, priority }
