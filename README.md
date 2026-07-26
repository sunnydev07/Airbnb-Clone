# 🏡 Airbnb Clone — Full-Stack Vacation Rental Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-black?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)

A full-stack MVC vacation rental marketplace built with Express 5, MongoDB Mongoose, Cloudinary image management, and Passport.js authentication.

---

## ✨ Features

- 🗺️ **Interactive Listing Search & Map View**: Browse property listings on interactive Google Maps and OpenStreetMap.
- 🔐 **Authentication & Authorization**: Passport.js user registration, login, and password reset flows.
- 🏡 **Listing & Booking Management**: Full CRUD operations for owner-managed property listings, availability, and reservations.
- 🖼️ **Cloudinary Image Uploads**: Multi-file media hosting and automated thumbnail generation.
- 💬 **Messaging & Host Portal**: Listing-based messaging between hosts and guests with analytics dashboards.

---

## 🛠️ Tech Stack

- **Backend Architecture**: Node.js, Express 5, MVC pattern
- **Database & ODM**: MongoDB, Mongoose
- **Frontend & Views**: EJS Templating, Bootstrap 5, Custom CSS
- **Authentication**: Passport.js Local Strategy
- **Media & Geocoding**: Cloudinary SDK, Google Maps API & Nominatim
- **Input Validation**: Joi schemas

---

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/sunnydev07/Airbnb-Clone.git
cd Airbnb-Clone
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create `.env` in the root directory:

```env
SECRET_KEY=your_session_secret
ATLASDB_URL=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
GOOGLE_MAP_API_KEY=your_google_maps_key
PORT=8080
```

### 3. Seed Database & Run

```bash
# Seed initial sample listings
node init/index.js

# Start application server
npm start
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser.

---

## 📄 License

Distributed under the ISC License. Created by [Sunny Kumar Dev](https://github.com/sunnydev07).
