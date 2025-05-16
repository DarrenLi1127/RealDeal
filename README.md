# RealDeal

RealDeal is a social media platform where users can create posts, interact through likes, stars, and comments, and discover content through a personalized recommendation system.

## Features

- User authentication with Clerk
- Post creation with multi-image support
- Comments and nested replies
- Like and star interactions
- Genre-based content categorization
- Experience points and leveling system
- Personalized content recommendations

## Architecture

### Backend (Spring Boot)

The backend follows a standard layered architecture with these modules:

- **Authentication Module**: User registration, profiles, and authentication
- **Post Module**: Post creation, retrieval, updating, and deletion
- **Comment Module**: Comment and reply functionality
- **Genre Module**: Content categorization system
- **Experience Module**: User leveling and progression system
- **Recommendation Module**: Personalized content discovery

Each module contains:
- **Controller Layer**: REST endpoints for API interactions
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access through JPA
- **Model Layer**: Domain entities and DTOs

### Frontend (React + TypeScript)

- **Routes**: Main pages including Dashboard, CreatePost, SearchResults
- **User Profile**: Profile management components (ProfileGate, UpdateProfile)
- **Catalog**: Post display with pagination and client-side caching
- **Comments**: Comment creation and nested replies
- **UI Components**: Reusable elements like ExpBar and SearchBar

## Dependencies

### Backend
- Java 17 or higher
- Spring Boot 3.x
- PostgreSQL 14.x
- Lombok
- Spring Data JPA

### Frontend
- Node.js 16.x or higher
- React 18.x
- TypeScript 4.x
- Clerk Authentication
- React Router 6.x

## Running the Application

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/realdeal.git
cd realdeal
```

2. Configure database in `application.properties`
```properties
spring.application.name=Backend

# Database Configuration
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update

# AWS S3 Configuration
aws.s3.bucket-name =
aws.s3.region      = 

aws.s3.access-key  = 
aws.s3.secret-key  =

# Post Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=20MB

# Redis Connection
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.type=redis
```

3. Run the Spring Boot application
```bash
mvn package
mvn spring-boot:run
```

### Frontend Setup
1. Navigate to the client directory
```bash
cd client
```

2. Install dependencies
```bash
npm install
npm install @clerk/clerk-react
npm install -D @playwright/test@latest
npx playwright install
npm i @clerk/testing --save-dev
npm i --save-dev @types/node
```

3. Frontend testing
```bash
cd client
npm run test:e2e 
```

4. Configure environment variables in a `.env` file
```
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

CLERK_FRONTEND_API=

TEST_USER1_EMAIL=
TEST_USER1_PASSWORD=
```

5. Start the development server
```bash
npm run dev
```

6. Access the application at http://localhost:5173

## Tech Stack

- **Backend**: Java 17, Spring Boot, JPA, PostgreSQL
- **Frontend**: React, TypeScript, Clerk Authentication
