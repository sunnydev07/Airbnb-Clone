# Airbnb Clone

A full-stack vacation rental marketplace built with Node.js, Express, MongoDB, EJS, Passport, Cloudinary, and Google Maps. Users can browse stays, search destinations, create listings, manage their profile dashboard, leave reviews, and view listing locations on a map.

## Features

- User signup, login, logout, and persistent sessions with Passport.js.
- Username or email login support.
- Listing CRUD with owner-only edit and delete permissions.
- Destination search from the Airbnb-style header using `GET /listings?q=...`.
- Search matches listing title, description, location, and country.
- Profile dashboard with account details, listing count, review count, average price, and recent owned listings.
- Redesigned create-listing form with responsive styling and image upload or image URL fallback.
- Review creation and deletion with author-only permissions.
- Google Maps display on listing detail pages.
- Server-side geocoding with OpenStreetMap Nominatim.
- Joi validation, flash messages, custom error pages, and no-database fallback messaging.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Views | EJS, express-ejs-layouts |
| Auth | Passport.js, passport-local-mongoose |
| Sessions | express-session, connect-mongo |
| Uploads | Multer, Cloudinary |
| Maps | Google Maps JavaScript API |
| Geocoding | Google Maps Geocoder, Nominatim |
| Validation | Joi |
| Styling | Bootstrap 5, custom CSS |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB Atlas connection string
- Cloudinary account for image uploads
- Google Maps API key with Maps JavaScript API enabled

### Clone

```bash
git clone https://github.com/sunnydev07/Airbnb-Clone.git
cd Airbnb-Clone
```

### Install Dependencies

If normal install hits a peer dependency conflict, use the legacy peer flag.

```bash
npm install --legacy-peer-deps
```

### Configure Environment

Create a `.env` file in the project root. Do not commit this file.

```env
SECRET_KEY=your_session_secret
ATLASDB_URL=your_mongodb_atlas_connection_string

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

GOOGLE_MAP_API_KEY=your_google_maps_api_key
```

Notes:

- `SECRET_KEY` is required for sessions.
- `ATLASDB_URL` is required to load real listings, users, and reviews.
- If `ATLASDB_URL` is missing, the app still starts and shows a clear database-offline message instead of crashing.
- Uploaded listing images require the Cloudinary variables.
- Listing maps require `GOOGLE_MAP_API_KEY`.

### Run

```bash
npm start
```

Open:

```text
http://127.0.0.1:8080
```

### Seed Sample Data

Optional:

```bash
node init/index.js
```

## Main Routes

| Route | Description |
| --- | --- |
| `/listings` | Browse listings |
| `/listings?q=delhi` | Search listings by destination-style text |
| `/listings/createNew` | Create listing form, login required |
| `/listings/:id` | Listing detail page |
| `/listings/:id/edit` | Edit listing, owner only |
| `/profile` | Account dashboard, login required |
| `/signup` | Signup page |
| `/login` | Login page |
| `/logout` | Logout |

## Project Structure

```text
Airbnb-Clone/
|-- app.js
|-- cloudConfig.js
|-- middleware.js
|-- Schema.js
|-- package.json
|-- controllers/
|   |-- listings.js
|   |-- reviews.js
|   `-- user.js
|-- models/
|   |-- listing.js
|   |-- review.js
|   `-- user.js
|-- routes/
|   |-- listing.js
|   |-- review.js
|   `-- user.js
|-- utils/
|   |-- database.js
|   |-- geocoding.js
|   |-- ExpressError.js
|   `-- wrapAsync.js
|-- views/
|   |-- includes/
|   |-- layouts/
|   |-- listings/
|   `-- users/
|-- public/
|   |-- css/
|   `-- js/
`-- init/
    |-- data.js
    `-- index.js
```

## Recent UI Updates

- Rebuilt the profile page into a dashboard instead of plain username/email text.
- Restyled the new-listing form to match the polished edit-form direction.
- Converted the header search pill into a functional listings search form.
- Added result counts, clear-search action, and empty states for search.
- Added responsive fixes for desktop and mobile layouts.

## Troubleshooting

### App starts but listings are unavailable

Check that `.env` contains `ATLASDB_URL` and that the MongoDB Atlas user/IP allowlist are configured.

### `npm install` fails with a peer dependency conflict

Use:

```bash
npm install --legacy-peer-deps
```

### Image upload fails

Check `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET`.

### Map does not appear on listing pages

Check `GOOGLE_MAP_API_KEY` and confirm Maps JavaScript API is enabled.

## License

ISC

