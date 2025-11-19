# 🏠 HomeHero Backend – Local Household Service Finder

**HomeHero Backend** manages all server-side operations for the HomeHero web application.  
It handles data storage, service logic, authentication, and secure communication between client and server.

---

## 📖 Overview

The backend provides a **REST API** to manage services, bookings, and user data.  
It ensures that all operations are **secure, reliable, and efficient** for both users and service providers.

---

## ✨ Key Features

- **REST API Endpoints:** For Services, Bookings, and Users  
- **Authentication:** Email/Google login using Firebase & JWT  
- **CRUD Operations:** Create, Read, Update, Delete services and bookings  
- **Private Routes:** Secured using JWT verification  
- **Price Filtering & Search:** Optional filtering using MongoDB operators  
- **Error Handling & Notifications:** Standardized API responses  

---

## 🛠️ Technologies Used

- **Node.js** – Server runtime  
- **Express.js** – API and routing framework  
- **MongoDB** – Database for storing services, bookings, and users  
- **Firebase Authentication** – User login & security  
- **JWT (JSON Web Token)** – Securing private routes  
- **dotenv** – Environment variable management  
- **cors** – Cross-origin resource sharing  

---

## 🖥️ Server Details

- Handles all user and service logic  
- Stores data in MongoDB collections: `services` and `bookings`  
- Secures routes and user sessions using Firebase Auth and JWT  
- Provides endpoints for CRUD operations, booking restrictions, and reviews  

---

## 📌 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mdsamimprogramer/homehero-a10-server.git
