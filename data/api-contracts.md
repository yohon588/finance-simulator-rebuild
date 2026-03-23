# API Contracts V0

## POST /api/rooms

Request:

```json
{
  "teacherName": "Demo Teacher",
  "roomName": "Finance Class"
}
```

## POST /api/join

Request:

```json
{
  "roomCode": "FIN-ABC123",
  "displayName": "Student One",
  "roleId": "R2"
}
```

## GET /api/me

Header:

```text
Authorization: Bearer <token>
```

## GET /api/bootstrap

Returns current bootstrap state for frontend startup.
