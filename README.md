# MediConnect

MediConnect is a comprehensive healthcare management platform that allows users to book appointments with trusted doctors, manage their profiles, and access healthcare services seamlessly. The platform includes three main modules: **Admin Panel**, **Medical Frontend**, and **Backend API**.

---

## Table of Contents

- [MediConnect](#mediconnect)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Admin Panel](#admin-panel)
    - [Medical Frontend](#medical-frontend)
    - [Backend API](#backend-api)
  - [Technologies Used](#technologies-used)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Project Structure](#project-structure)
    - [Key Files](#key-files)
  - [Setup Instructions](#setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

### Admin Panel
- Add new doctors with details like name, specialization, fees, and availability.
- Manage doctor availability.
- View all appointments and doctor lists.

### Medical Frontend
- User registration and login.
- Browse doctors by specialization.
- Book and cancel appointments.
- View user profile and update details.
- Payment integration using Stripe.

### Backend API
- Secure authentication for users and admins.
- CRUD operations for doctors and appointments.
- Cloudinary integration for image uploads.
- Stripe integration for payments.

---

## Technologies Used

### Frontend
- **React**: For building the user interface.
- **React Router**: For navigation.
- **Tailwind CSS**: For styling.
- **Axios**: For API requests.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: For building RESTful APIs.
- **MongoDB**: For database management.
- **Mongoose**: For MongoDB object modeling.
- **Cloudinary**: For image storage.
- **Stripe**: For payment processing.

---

## Project Structure

### Key Files
- **Admin Panel**:
  - `admin/src/pages/Admin/AddDoctor.jsx`: Add new doctors.
  - `admin/src/pages/Admin/DoctorsList.jsx`: Manage doctor availability.
- **Medical Frontend**:
  - `medical/src/pages/Doctors.jsx`: Browse doctors by specialization.
  - `medical/src/pages/Appointment.jsx`: Book appointments.
- **Backend API**:
  - `backend/controllers/userController.js`: User-related APIs.
  - `backend/controllers/adminController.js`: Admin-related APIs.
  - `backend/controllers/doctorController.js`: Doctor-related APIs.

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account
- Stripe account

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/MediConnect.git
   cd MediConnect

2.Install dependencies for each module:

cd admin
npm install
cd ../medical
npm install
cd ../backend
npm install  

User APIs
POST /api/user/register: Register a new user.
POST /api/user/login: Login a user.
GET /api/user/get-profile: Get user profile.
POST /api/user/update-profile: Update user profile.
POST /api/user/book-appointment: Book an appointment.
GET /api/user/appointments: List user appointments.
POST /api/user/cancel-appointment: Cancel an appointment.
Admin APIs
POST /api/admin/login: Admin login.
POST /api/admin/add-doctor: Add a new doctor.
POST /api/admin/all-doctors: Get all doctors.
POST /api/admin/change-availability: Change doctor availability.
Doctor APIs
GET /api/doctor/list: Get the list of doctors.
License
This project is licensed under the MIT License.


  