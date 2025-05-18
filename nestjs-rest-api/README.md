## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
$ npm run start

$ npm run start:dev

$ npm run start:prod
```

## Run tests

```bash
$ npm run test

$ npm run test:e2e

$ npm run test:cov
```

## Sample Requests

### Authentication

# Register
curl -X POST http://localhost:3000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"biba","password":"Parol123!!#"}'

# Login
curl -X POST http://localhost:3000/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"username":"biba","password":"Parol123!!#"}'

Response:
{
  "accessToken": "<JWT_TOKEN>"
}

### Articles

# Create Article
curl -X POST http://localhost:3000/articles \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Politics","description":"Trump&PutinCall","publishedDate":"2025-05-17T12:00:00Z"}'

# List Articles (cached)
curl http://localhost:3000/articles?limit=5&offset=0

# Get Article by ID (cached)
curl http://localhost:3000/articles/1

# Update Article
curl -X PATCH http://localhost:3000/articles/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Updated Title"}'

# Delete Article
curl -X DELETE http://localhost:3000/articles/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"

### Migrate Database
npm run db:migrate    