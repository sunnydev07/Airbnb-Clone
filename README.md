# 🏠 Airbnb Clone

A full-stack vacation rental marketplace built with **Node.js**, **Express**, **MongoDB**, and **EJS**. Users can browse listings, create their own, leave reviews, and view locations on an interactive Google Map — all with secure authentication.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **User Registration & Login** — Secure signup/login with username or email using Passport.js
- **Password Hashing** — Passwords are hashed and salted automatically via `passport-local-mongoose`
- **Session Management** — Persistent sessions stored in MongoDB using `connect-mongo`
- **Authorization Middleware** — Only listing owners can edit/delete their own listings; only review authors can delete their own reviews
- **Login Redirect** — Users are redirected back to the page they tried to visit after logging in

### 🏡 Listings (CRUD)
- **Browse All Listings** — View all available vacation rentals on the homepage
- **Create a Listing** — Add a new listing with title, description, price, location, country, and an image
- **View Listing Details** — See full details including host info, description, price, reviews, and map
- **Edit & Delete** — Owners can update or remove their listings
- **Image Upload** — Images are uploaded and stored on **Cloudinary** via `multer` + `multer-storage-cloudinary`

### 🗺️ Interactive Maps & Geocoding
- **Google Maps Integration** — Each listing page displays an interactive map centered on the listing's location
- **Client-Side Geocoding** — The listing's `location + country` text is geocoded via Google Maps Geocoding Service to show the accurate pin on the map
- **Server-Side Geocoding** — Coordinates are also fetched from OpenStreetMap Nominatim API and stored in the database for faster loading
- **Marker with Info Window** — Clicking the map marker shows the listing title and location

### ⭐ Reviews
- **Leave a Review** — Logged-in users can rate (1–5 stars) and write comments on any listing
- **Star Rating UI** — Beautiful animated star rating widget
- **Delete Reviews** — Only the review author can delete their review
- **Cascading Deletes** — When a listing is deleted, all its reviews are automatically removed

### 🛡️ Data Validation & Error Handling
- **Server-Side Validation** — Request data is validated using **Joi** schemas
- **Custom Error Pages** — Friendly 404 and error pages
- **Flash Messages** — Success and error notifications using `connect-flash`

---

## 🛠️ Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| **Backend**  | Node.js, Express 5                             |
| **Database** | MongoDB Atlas, Mongoose ODM                    |
| **Templating** | EJS, ejs-mate (layouts)                      |
| **Auth**     | Passport.js, passport-local-mongoose           |
| **File Upload** | Multer, Cloudinary                          |
| **Maps**     | Google Maps JavaScript API                     |
| **Geocoding** | Google Maps Geocoder (client), Nominatim (server) |
| **Sessions** | express-session, connect-mongo                 |
| **Validation** | Joi                                          |
| **Styling**  | Bootstrap 5, Custom CSS                        |

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)
- [Cloudinary](https://cloudinary.com/) account (for image uploads)
- [Google Maps API Key](https://console.cloud.google.com/) with **Maps JavaScript API** enabled

### 1. Clone the Repository

```bash
git clone https://github.com/sunnydev07/Airbnb-Clone.git
cd Airbnb-Clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
GOOGLE_MAP_API_KEY=your_google_maps_api_key
ATLASDB_URL=your_mongodb_atlas_connection_string
SECRRET_KEY=your_session_secret_key
```

> **Note:** Make sure your Google Maps API key has the **Maps JavaScript API** enabled in the [Google Cloud Console](https://console.cloud.google.com/apis/library).

### 4. Seed the Database (Optional)

To populate the database with sample listings:

```bash
node init/index.js
```

### 5. Start the Server

```bash
# Using Node.js
node app.js

# Or using nodemon (for development)
npx nodemon app.js
```

The app will be running at **http://localhost:8080**

---

## 📁 Project Structure

```
Airbnb-Clone/
├── app.js                  # Main Express application
├── cloudConfig.js          # Cloudinary configuration
├── middleware.js            # Auth & validation middleware
├── Schema.js               # Joi validation schemas
├── .env                    # Environment variables (not committed)
│
├── models/
│   ├── listing.js          # Listing Mongoose model
│   ├── review.js           # Review Mongoose model
│   └── user.js             # User model (with passport plugin)
│
├── routes/
│   ├── listing.js          # Listing routes (CRUD)
│   ├── review.js           # Review routes
│   └── user.js             # Auth routes (signup/login/logout)
│
├── controllers/
│   ├── listings.js         # Listing controller logic
│   ├── reviews.js          # Review controller logic
│   └── users.js            # Auth controller logic
│
├── utils/
│   ├── ExpressError.js     # Custom error class
│   ├── wrapAsync.js        # Async error wrapper
│   └── geocoding.js        # Nominatim geocoding utility
│
├── views/
│   ├── layouts/            # EJS layout templates
│   ├── includes/           # Reusable partials (navbar, footer)
│   ├── listings/           # Listing pages (index, show, edit, new)
│   └── users/              # Auth pages (login, signup)
│
├── public/
│   ├── css/                # Stylesheets
│   └── js/                 # Client-side JavaScript
│
└── init/
    ├── data.js             # Sample listing data
    └── index.js            # Database seed script
```

---

## 🔑 API Keys Setup Guide

### Google Maps
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Library**
4. Enable **Maps JavaScript API**
5. Go to **APIs & Services → Credentials**
6. Create an API key and add it to your `.env` file

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Find your **Cloud Name**, **API Key**, and **API Secret** on the dashboard
3. Add them to your `.env` file

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Get the connection string and add it to your `.env` file as `ATLASDB_URL`

---

## 📸 Screenshots

> Visit the live app or run locally to see the full UI in action!

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">Made with ❤️ by <a href="https://github.com/sunnydev07">sunnydev07</a></p>
