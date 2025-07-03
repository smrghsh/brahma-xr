---
title: Setup Example
description: Example setup for using the Brahma XR Server with HTTPS and WebSocket.
---

# ⚙️ Setup Example

This section shows how to configure and run the **Brahma XR Server**.



## 🧾 Create a Server File

Create a new file called `index.js` in your project root and add the following code:

```js
// Import the BrahmaServer class from the package
import { BrahmaServer } from "brahma-xr-server";

// Initialize the server with configuration options
const server = new BrahmaServer({
  port: 8080,
  certPath: "/path/to/fullchain.pem", // Path to your SSL certificate (e.g., Let's Encrypt)
  keyPath: "/path/to/privkey.pem"     // Path to your private key
});

// Set up HTTPS server, WebSocket, and REST API
server.initialize();

// Start the server and begin listening for connections
server.run();
```

## Run the Server

```bash
node index.js
```

[Methods →](/docs/configurations)