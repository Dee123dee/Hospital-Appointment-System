# Backend Instructions

This project is the V.R. Hospital Appointment Management System.

The backend uses Java Spring Boot, Maven, MongoDB, and REST APIs.

The backend must follow this architecture:

Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB

## Controller

The Controller must:

- Handle HTTP requests.
- Define REST endpoints.
- Receive request data.
- Call the Service.
- Return HTTP responses.

The Controller must not contain business logic or direct database operations.

## Service

The Service must:

- Contain business logic.
- Validate appointment-related rules.
- Process appointment operations.
- Call the Repository.

## Repository

The Repository must:

- Handle MongoDB operations.
- Save appointment data.
- Retrieve appointment data.
- Update or delete data when required.

Use Spring Data MongoDB.

## Important Rules

- Inspect the existing backend before changing anything.
- Preserve existing API endpoints.
- Preserve existing MongoDB field names.
- Preserve existing functionality.
- Do not modify the frontend.
- Do not introduce unnecessary dependencies.
- Do not rewrite unrelated code.

The main goal is to separate the existing backend Controller logic into
Controller, Service, and Repository layers without breaking the application.