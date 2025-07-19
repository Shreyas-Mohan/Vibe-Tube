# Vibe-Tube-Inspired-from-YouTube

## Overview
Vibe-Tube is a backend-only web application inspired by YouTube, built with Node.js, Express, and MongoDB. The backend provides user registration, authentication, and media upload features using Cloudinary. All API testing is done using Postman. 
**No frontend will be created for this project.**

## Features
- User registration with avatar and cover image upload
- Authentication with JWT access and refresh tokens
- MongoDB database integration
- MongoDB aggregation pipelines for advanced queries
- Cloudinary integration for media storage
- Error handling and validation
- API endpoints for user management

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose, Aggregation Pipelines)
- Cloudinary
- Multer (for file uploads)

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   - `PORT`
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Usage
- Base URL: `http://localhost:8000/api/v1/`
- Register User: `POST /users/register`
  - Form-data fields: `fullname`, `email`, `username`, `password`, `avatar` (file), `coverimage` (file, optional)

## Development Status
**This project is still under development.**
- More features and endpoints are coming soon.

## Contributing
Feel free to fork the repo and submit pull requests. Suggestions and improvements are welcome!

## License
Apache License 2.0