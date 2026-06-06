# Airbnb Clone

A full-stack vacation rental marketplace built with Express, MongoDB, and EJS.

## Features

- Search and browse listings with list and map views
- Sign up, log in with username or email, and reset passwords
- Create, edit, and delete owner-managed listings
- Upload listing images through Cloudinary
- Book stays, review trips, and manage guest or host reservations
- Message hosts through listing-based conversations
- View profile statistics, reviews, bookings, revenue, and listing activity

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB, Mongoose
- **Frontend:** EJS, Bootstrap 5, custom CSS
- **Authentication:** Passport.js
- **Storage:** Cloudinary
- **Maps:** Google Maps and OpenStreetMap Nominatim
- **Validation:** Joi

## Setup

### 1. Clone and install

```bash
git clone https://github.com/sunnydev07/Airbnb-Clone.git
cd Airbnb-Clone
npm install --legacy-peer-deps
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
SECRET_KEY=your_session_secret
ATLASDB_URL=your_mongodb_connection_string

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

GOOGLE_MAP_API_KEY=your_google_maps_api_key

EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password

PORT=8080
```

`SECRET_KEY` is required. The app can start without MongoDB, but database-backed features remain unavailable. Cloudinary, Google Maps, and email settings are needed for uploads, maps, and password-reset emails respectively.

### 3. Run

```bash
npm start
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

To load the included sample listings:

```bash
node init/index.js
```

## License

ISC
