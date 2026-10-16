# Backend Refactoring Prompt

Read:

- ai/skills.yaml
- ai/instruction.md

Now inspect the existing V.R. Hospital backend.

The current backend is working, but the Controller contains logic that
should be separated.

Refactor ONLY the backend.

Create the following structure:

controller/
    AppointmentController.java

service/
    AppointmentService.java

repository/
    AppointmentRepository.java

model/
    Appointment.java

Move business logic from the Controller to AppointmentService.

Keep database operations inside AppointmentRepository.

Keep AppointmentController responsible only for REST API handling.

IMPORTANT:

- Do not modify the frontend.
- Do not change existing API endpoints.
- Do not change MongoDB field names.
- Do not break appointment booking.
- Do not break admin functionality.
- Do not add unnecessary dependencies.
- Preserve all existing functionality.

First analyze the existing backend and identify what needs to be moved.

Then perform the refactoring.

Finally, compile the backend and report any errors.