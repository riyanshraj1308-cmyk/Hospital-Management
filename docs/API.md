# MediCore API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/login
```json
{ "email": "admin@medicore.com", "password": "Admin@123" }
```
Returns: `{ token, user }`

### POST /auth/register *(admin only)*
```json
{ "name": "Jane Doe", "email": "jane@medicore.com", "password": "Pass@123", "role": "receptionist" }
```

### GET /auth/me
Returns current user object.

### PUT /auth/change-password
```json
{ "currentPassword": "...", "newPassword": "..." }
```

---

## Patients

### GET /patients
Query: `search`, `status`, `page`, `limit`

### GET /patients/:id

### POST /patients
```json
{
  "name": "Rahul Verma", "age": 45, "gender": "Male",
  "phone": "+91-9XXXXXXX", "email": "rahul@ex.com",
  "bloodGroup": "B+", "address": "...",
  "allergies": ["Penicillin"],
  "emergencyContact": { "name": "Sunita", "phone": "...", "relation": "Wife" }
}
```

### PUT /patients/:id
### DELETE /patients/:id *(admin only — archives)*
### GET /patients/:id/history
Returns: `{ appointments, records, invoices }`

---

## Doctors

### GET /doctors
Query: `search`, `specialization`, `isActive`

### GET /doctors/specializations

### POST /doctors *(admin only)*
```json
{
  "name": "Dr. Arjun Sharma", "specialization": "Cardiology",
  "qualification": "MBBS, MD", "experience": 12,
  "phone": "...", "email": "...", "consultationFee": 800,
  "availableDays": ["Monday","Tuesday"],
  "availableSlots": ["09:00","09:30","10:00"]
}
```

### GET /doctors/:id
### PUT /doctors/:id
### GET /doctors/:id/available-slots?date=2024-01-15
Returns: `{ availableSlots, bookedSlots, allSlots }`

---

## Appointments

### GET /appointments
Query: `date`, `doctorId`, `patientId`, `status`, `page`, `limit`

### GET /appointments/today

### POST /appointments
```json
{
  "patient": "<patientId>", "doctor": "<doctorId>",
  "date": "2024-01-15", "timeSlot": "10:00",
  "type": "consultation", "notes": "Chest pain",
  "fee": 800
}
```

### GET /appointments/:id
### PUT /appointments/:id
### PUT /appointments/:id/status
```json
{ "status": "completed", "cancelReason": "Patient request" }
```

---

## Medical Records

### GET /records/:patientId

### POST /records
```json
{
  "patient": "<patientId>", "doctor": "<doctorId>",
  "visitDate": "2024-01-15", "chiefComplaint": "Chest pain",
  "diagnosis": ["Hypertension"], "symptoms": ["Headache"],
  "vitalSigns": { "bloodPressure": "140/90", "heartRate": 85 },
  "prescriptions": [
    { "medicine": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "30 days" }
  ],
  "doctorNotes": "Review in 2 weeks",
  "followUpDate": "2024-01-29"
}
```

### GET /records/single/:id
### PUT /records/:id
### DELETE /records/:id *(admin only)*

---

## Billing

### GET /billing
Query: `patientId`, `status`, `page`, `limit`

### GET /billing/stats

### POST /billing/invoice
```json
{
  "patient": "<patientId>", "doctor": "<doctorId>",
  "items": [
    { "description": "Consultation", "quantity": 1, "unitPrice": 800, "total": 800 },
    { "description": "Lab Tests", "quantity": 1, "unitPrice": 500, "total": 500 }
  ],
  "discount": 0,
  "tax": 18,
  "dueDate": "2024-01-30"
}
```

### GET /billing/:id
### PUT /billing/:id
### PUT /billing/:id/pay
```json
{ "amountPaid": 1000, "paymentMethod": "upi" }
```

---

## Dashboard

### GET /dashboard/stats
### GET /dashboard/appointments-chart
### GET /dashboard/revenue-chart
### GET /dashboard/department-stats

---

## Roles & Permissions

| Role | Patients | Doctors | Appointments | Records | Billing |
|---|---|---|---|---|---|
| admin | Full | Full | Full | Full | Full |
| doctor | Read/Write | Read | Full | Full | Read |
| nurse | Read/Write | Read | Read/Write | Create | Read |
| receptionist | Read/Write | Read | Full | Read | Full |
