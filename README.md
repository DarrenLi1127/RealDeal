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
## Testing
### Backend unit test
#### User Profile Tests
- **Existence Endpoint Delegation** – verifies `/exists/{id}` simply forwards to the service and echoes the boolean result. 
- **Existence – true / false** – confirms the controller returns the correct boolean when the service reports a user present or absent. 
- **Fetch Profile** – asserts `/api/users/{id}` returns a populated DTO when the user exists.
- **User Registration Happy Path** – checks that a new profile is persisted and HTTP 201 is returned. 
- **Duplicate Email / Username Validation** – ensures the service blocks registration when either field is already taken.

#### Experience Service Tests
- **Arbitrary EXP Addition** – adds an EXP amount, verifying the user’s total and reviewer-level are updated. 
- **Daily Login Bonus** – guarantees the “daily-login” award is granted at most once per calendar day. 

#### Post Service Tests
- **Create Post** – uploads files to S3, preserves image order, and persists the post. 
- **Pagination Delegation** – confirms `getPaginatedPosts()` passes page/size to the repository unchanged.
- **Full-text Search** – verifies the service forwards search terms and returns the repo’s paged result.
- **Search Helpers** – checks helper methods for content snippets and total hit count use the correct repo calls. 

#### Post Controller Tests
- **Feed Endpoint** – asserts `/api/posts/all` maps query params, enriches posts with usernames, and returns HTTP 200 JSON.
- **Create Endpoint** – ensures multipart `/api/posts/create` responds with a DTO and HTTP 201. 

#### Reaction Service Tests
- **Toggle Like – Add** – when not previously liked, saves a like, increments the counter and awards EXP to the owner. 
- **Toggle Like – Remove** – removes an existing like, decrements the counter and deducts EXP.
- **Self-Like Guard** – confirms owners receive no EXP when liking their own post. 
- **Toggle Star – Add / Remove** – mirrors the same assertions for post stars (bookmarks). 

#### Comment Tests
- **Toggle Comment Like – Add** – adds a like and bumps the comment’s like count. 
- **Toggle Comment Like – Remove** – removes an existing like and decrements the count.

#### Genre Tests
- **List Genres (Service)** – returns all genres sorted alphabetically.
- **Get Genre By Id** – throws `NOT_FOUND` for unknown ids.
- **List Genres (Controller)** – controller serialises the service list to JSON (slice test).

#### Recommendation Service Tests
- **Genre-Aware Ranking** – bubbles posts that share genres with the viewer to the top. 
- **Null Viewer Guard** – returns the original list unchanged when no user id is provided. 
- **No Genre Preferences** – same behaviour when the viewer has no saved genres. 

#### Upload Tests
- **S3 Upload Mechanics** – builds a unique object key, sets `PUBLIC_READ` ACL, and returns a public URL. 
- **Controller Happy Path** – `/api/upload` responds with HTTP 200 and the URL body for a multipart file. 

### Frontend e2e test
#### Post Related
```
    test('user can create a post with title, content, image and genre')
    test('user can view posts in the catalog with pagination')
    test('user can open post details in modal')
    test('user can search for posts')
    test('user can like and star posts')
    test('user can view their own posts')
```
#### Comment Related
```
    test('user can view comments on a post')
    test('user can add a new comment to a post')
    test('user can reply to an existing comment')
    test('user can like a comment')
    test('user can show and hide comment replies')
    test('user can navigate between pages of comments')
```
#### Profile Related
```
test('user can change username')
test('user must keep the username within 3 to 20 character')
test('user can select and deselect genres')
test('user cannot select more than 3 genres')

```
## Tech Stack

- **Backend**: Java 17, Spring Boot, JPA, PostgreSQL
- **Frontend**: React, TypeScript, Clerk Authentication
