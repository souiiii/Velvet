# Velvet

Velvet is a secure file sharing platform that enables controlled, expiring, and trackable public file links while preserving user ownership and access control.

The system is designed with a strong emphasis on link governance, authentication security, and controlled public exposure.

---

## Showcase

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/a6d64c36-ec69-4409-9572-ebd63ddbaf87" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/fb4153dc-000c-4290-afa3-6dfd0000974a" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/fb4153dc-000c-4290-afa3-6dfd0000974a" />

---

## Overview

Velvet allows authenticated users to:

- Upload files with defined size limits  
- Generate shareable public links  
- Set link expiration rules  
- Track downloads  
- Revoke links at any time  
- Monitor storage usage  

The platform separates authenticated user operations from controlled public access routes to ensure secure distribution.

---

## Problem Statement

Most file-sharing platforms provide limited control once a file link is generated. Common limitations include:

- No structured expiration enforcement  
- Weak revocation mechanisms  
- Limited download tracking  
- Insufficient separation between private and public routes  

Velvet addresses these concerns by implementing controlled link lifecycle management and secure backend validation.

---

## Core Features

- Multi-file upload (maximum 5 per session)  
- File size validation (100MB limit)  
- Controlled link creation  
- Link expiration enforcement  
- Download tracking  
- Link revocation  
- Storage usage analytics  
- Secure authentication system  

---

## Architecture Overview

High-level architecture:

Client → API Layer → Authentication Middleware → Storage Layer → Database

### Design Principles

- All private routes are protected by authentication middleware.
- Public routes are token-based and isolated from user dashboards.
- Link expiration is validated at request time.
- Download events are recorded transactionally.
- Revocation state is enforced at the middleware level.

---

## Security Design

Velvet is built around layered security controls:

### Transport Security
- HTTPS/TLS encryption in transit  

### Authentication
- Token-based authentication (e.g., JWT)  
- Middleware-protected private routes  
- Optional HTTP-only cookie strategy (if implemented)

### Access Control
- Tokenized public access links  
- Expiration validation on every download request  
- Revocation state verification  

### Input Validation
- File type and size restrictions  
- Server-side validation for all requests  

### Exposure Minimization
- No direct file system exposure  
- Controlled public endpoint structure  

---

## Technology Stack

### Frontend
- React  
- TailwindCSS  

### Backend
- Node.js  
- Express  

### Database
- MongoDB  

### Authentication
- JWT-based authentication  

### File Storage
- (Specify: Local disk / Cloud storage / GridFS / etc.)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/velvet.git
cd velvet
```

Install dependencies:

```bash
npm install
```

Create a .env file in the root directory:

PORT=
MONGO_URI=
JWT_SECRET=
STORAGE_PATH=

Start the node server: 

```bash
npm start
```

Start the development server:
```bash
cd client
npm install
npm run dev
```
