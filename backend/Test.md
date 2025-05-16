## Tests
Our JUnit/Mockito suite exercises the core API surface of Real Deal – from user management to posts, reactions and uploads – guaranteeing each layer behaves as expected.

### User Profile Tests
- **Existence Endpoint Delegation** – verifies `/exists/{id}` simply forwards to the service and echoes the boolean result. :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}  
- **Existence – true / false** – confirms the controller returns the correct boolean when the service reports a user present or absent. :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}  
- **Fetch Profile** – asserts `/api/users/{id}` returns a populated DTO when the user exists. :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}  
- **User Registration Happy Path** – checks that a new profile is persisted and HTTP 201 is returned. :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}  
- **Duplicate Email / Username Validation** – ensures the service blocks registration when either field is already taken. :contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9}  

### Experience Service Tests
- **Arbitrary EXP Addition** – adds an EXP amount, verifying the user’s total and reviewer-level are updated. :contentReference[oaicite:10]{index=10}:contentReference[oaicite:11]{index=11}  
- **Daily Login Bonus** – guarantees the “daily-login” award is granted at most once per calendar day. :contentReference[oaicite:12]{index=12}:contentReference[oaicite:13]{index=13}  

### Post Service Tests
- **Create Post** – uploads files to S3, preserves image order, and persists the post. :contentReference[oaicite:14]{index=14}:contentReference[oaicite:15]{index=15}  
- **Pagination Delegation** – confirms `getPaginatedPosts()` passes page/size to the repository unchanged. :contentReference[oaicite:16]{index=16}:contentReference[oaicite:17]{index=17}  
- **Full-text Search** – verifies the service forwards search terms and returns the repo’s paged result. :contentReference[oaicite:18]{index=18}:contentReference[oaicite:19]{index=19}  
- **Search Helpers** – checks helper methods for content snippets and total hit count use the correct repo calls. :contentReference[oaicite:20]{index=20}:contentReference[oaicite:21]{index=21}  

### Post Controller Tests
- **Feed Endpoint** – asserts `/api/posts/all` maps query params, enriches posts with usernames, and returns HTTP 200 JSON. :contentReference[oaicite:22]{index=22}:contentReference[oaicite:23]{index=23}  
- **Create Endpoint** – ensures multipart `/api/posts/create` responds with a DTO and HTTP 201. :contentReference[oaicite:24]{index=24}:contentReference[oaicite:25]{index=25}  

### Reaction Service Tests
- **Toggle Like – Add** – when not previously liked, saves a like, increments the counter and awards EXP to the owner. :contentReference[oaicite:26]{index=26}:contentReference[oaicite:27]{index=27}  
- **Toggle Like – Remove** – removes an existing like, decrements the counter and deducts EXP. :contentReference[oaicite:28]{index=28}:contentReference[oaicite:29]{index=29}  
- **Self-Like Guard** – confirms owners receive no EXP when liking their own post. :contentReference[oaicite:30]{index=30}:contentReference[oaicite:31]{index=31}  
- **Toggle Star – Add / Remove** – mirrors the same assertions for post stars (bookmarks). :contentReference[oaicite:32]{index=32}:contentReference[oaicite:33]{index=33}  

### Comment Tests
- **Toggle Comment Like – Add** – adds a like and bumps the comment’s like count. :contentReference[oaicite:34]{index=34}:contentReference[oaicite:35]{index=35}  
- **Toggle Comment Like – Remove** – removes an existing like and decrements the count. :contentReference[oaicite:36]{index=36}:contentReference[oaicite:37]{index=37}  

### Genre Tests
- **List Genres (Service)** – returns all genres sorted alphabetically. :contentReference[oaicite:38]{index=38}:contentReference[oaicite:39]{index=39}  
- **Get Genre By Id** – throws `NOT_FOUND` for unknown ids. :contentReference[oaicite:40]{index=40}:contentReference[oaicite:41]{index=41}  
- **List Genres (Controller)** – controller serialises the service list to JSON (slice test). :contentReference[oaicite:42]{index=42}:contentReference[oaicite:43]{index=43}  

### Recommendation Service Tests
- **Genre-Aware Ranking** – bubbles posts that share genres with the viewer to the top. :contentReference[oaicite:44]{index=44}:contentReference[oaicite:45]{index=45}  
- **Null Viewer Guard** – returns the original list unchanged when no user id is provided. :contentReference[oaicite:46]{index=46}:contentReference[oaicite:47]{index=47}  
- **No Genre Preferences** – same behaviour when the viewer has no saved genres. :contentReference[oaicite:48]{index=48}:contentReference[oaicite:49]{index=49}  

### Upload Tests
- **S3 Upload Mechanics** – builds a unique object key, sets `PUBLIC_READ` ACL, and returns a public URL. :contentReference[oaicite:50]{index=50}:contentReference[oaicite:51]{index=51}  
- **Controller Happy Path** – `/api/upload` responds with HTTP 200 and the URL body for a multipart file. :contentReference[oaicite:52]{index=52}:contentReference[oaicite:53]{index=53}  
