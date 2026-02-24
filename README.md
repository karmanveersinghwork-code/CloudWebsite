# Cloud CRUD Web Application

This repository contains a modern CRUD web application using HTML, CSS, and JavaScript for the frontend and Node.js/Express for the backend. It integrates with an AWS S3 bucket (`bucket-for-cloud-project`) to manage files and versions.

## Features

- **Authentication**: Simple username/password login with session management.
- **Responsive UI**: Clean dashboard with file listing in card layout.
- **AWS S3 Integration**: Upload, download, delete, and view versions of files.
- **Versioning**: Uses S3 object versioning to preserve file history.
- **REST API**: Backend endpoints for frontend interaction.
- **Security**: Credentials via IAM roles / environment variables.

## Project Structure

```
frontend/
  index.html
  dashboard.html
  style.css
  script.js
backend/
  server.js
  package.json
  routes/
    auth.js
    files.js
  controllers/
    authController.js
    fileController.js
.env.example
README.md
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo_url> "CloudWebsite"
   cd "CloudWebsite"
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in any needed values. The AWS region and bucket are pre-filled.
   - Ensure AWS credentials are available via environment variables or IAM role.

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Run the backend server**
   ```bash
   npm run start   # or npm run dev if you have nodemon
   ```
   The API will be available at `http://localhost:3000/api`.

5. **Serve the frontend**
   - Option A: Use a static file server, e.g. open `frontend/index.html` via Live Server extension or `python -m http.server` in the `frontend` directory.
   - Option B: Access via the backend static middleware by going to `http://localhost:3000/index.html`.

6. **Login credentials**
   - `admin` / `password123`
   - `user` / `userpass`

## Using the Application

- Visit the login page, enter credentials, and submit.
- After successful login, you will be redirected to the dashboard.
- Upload files using the form, view existing files, download or delete them.
- Click "Versions" to see past versions and download specific ones.
- Use the Logout link to end the session.

## AWS Considerations

- Make sure the bucket `bucket-for-cloud-project` exists and has versioning enabled.
- The backend uses the AWS SDK v3; credentials are retrieved from the environment or IAM role.
- Do **not** hardcode AWS secrets in source code.

## Notes

- The authentication system is a simple mock and should not be used in production.
- Error handling is implemented on both frontend and backend, with user-friendly messages.
- The UI is built with pure HTML/CSS/JS and is responsive and modern.

Enjoy!
