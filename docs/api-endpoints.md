##  API Endpoints

The Brahma XR Server exposes the following HTTP GET endpoints:

| Endpoint                   | Method | Description                                      |
|----------------------------|--------|--------------------------------------------------|
| `/uniqueUsernameAndColor` | GET    | Returns a unique username and a pastel color     |
| `/activeInterlocutors`    | GET    | Returns all currently active interlocutors       |



### 📥 Example Response

 (`/uniqueUsernameAndColor`)

```json
{
  "username": "User-X7",
  "color": "0xa1c3f2"
}
