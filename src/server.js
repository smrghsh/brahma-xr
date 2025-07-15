import fs from "fs";
import https from "https";
import WebSocket from "ws";
import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";

/**
 *  BrahmaServer
 *  A real-time WebSocket server for synchronized avatar embodiment and simulation control.
 *
 * ## Features
 * - Secure HTTPS and WebSocket communication
 * - Real-time avatar data (HMD, controllers, color)
 * - Unique username and pastel color assignment
 * - Simulation time control and state broadcasting
 * - Tracks all active interlocutors
 *
 * @example <caption>Create a server file (e.g. index.js)</caption>
 * import { BrahmaServer } from "brahma-xr-server";
 *
 * const server = new BrahmaServer({
 *   port: 8080,
 *   certPath: "/path/to/fullchain.pem", // Use Let's Encrypt or self-signed certs
 *   keyPath: "/path/to/privkey.pem"
 * });
 *
 * server.initialize();
 * server.run();
 */

export class BrahmaServer {
  /**
   * Create a new BrahmaServer.
   * @param {Object} options - Configuration options.
   * @param {number} [options.port=8080] - Port number for the HTTPS server.
   * @param {string} [options.certPath="../cert/cert.pem"] - Path to the SSL certificate.
   * @param {string} [options.keyPath="../cert/key.pem"] - Path to the SSL private key.
   */
  constructor({
    port = 8080,
    certPath = "../cert/cert.pem",
    keyPath = "../cert/key.pem",
  } = {}) {
    console.log("Initializing BrahmaServer...");

    this.port = port;
    this.certPath = certPath;
    this.keyPath = keyPath;

    this.app = express();
    this.interlocutors = {};
    this.simulationTime = 0;
    this.simulationPlaying = false;
    this.simulationRate = 1;
    this.server = null;
    this.wss = null;
  }

   /**
   * Initializes the server with HTTPS, WebSocket, and REST API endpoints.
   */

    initialize() {
    const serverConfig = {
      cert: fs.readFileSync("/etc/letsencrypt/live/brahma.xrss.org/fullchain.pem"),
      key: fs.readFileSync("/etc/letsencrypt/live/brahma.xrss.org/privkey.pem"),
    };

    // Create HTTPS server
    this.server = https.createServer(serverConfig, this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.app.use(cors());

    /**
     * GET /uniqueUsernameAndColor
     * Returns a unique username and pastel color.
     * @name GET /uniqueUsernameAndColor
     * @function
     * @returns {Object} JSON response with `username` and `color`
     */
    this.app.get("/uniqueUsernameAndColor", (req, res) => {
      const username = this._generateUsername();
      const color = this._generatePastelColor();
      res.json({ username, color });
    });

    /**
     * GET /activeInterlocutors
     * Returns all active interlocutors.
     * @name GET /activeInterlocutors
     * @function
     * @returns {Object} JSON response containing active interlocutors
     */
    this.app.get("/activeInterlocutors", (req, res) => {
      res.json(this.interlocutors);
    });

    this.wss.on("connection", (ws) => {
      console.log("Secure client connected");
      ws.on("message", (message) => {
        // console.log("Received: %s", message);
        try {
          const data = JSON.parse(message);

          if (data.name && data.color) {
            // this means with high confidence that the interlocutor is attempting to send name, color, and avatar embodiment data

            if (!this.interlocutors[data.name]) {
              // interlocutor introducing itself, as it doesn't exist yet in the interlocutors object
              this.interlocutors[data.name] = { name: data.name, color: data.color };
              this.interlocutors[data.name].timeJoined = Date.now();
              console.log(
                `New interlocutor created: ${data.name}, color: ${data.color}`
              );
            }

            if (data.HMDPosition && data.LController && data.RController) {
              // these three are what's used for avatar embodiment
              this.interlocutors[data.name].HMDPosition = data.HMDPosition;
              this.interlocutors[data.name].LController = data.LController;
              this.interlocutors[data.name].RController = data.RController;
              this.interlocutors[data.name].lastUpdated = Date.now();
              // i used to have code to clear inactive interlocutors
            }
            //&& data.simulationRate
          } else if (
            Object.hasOwn(data, "type") &&
            data.type == "timeCommand"
          ) {
            // here, or in a similar manner, you would handle other types of messages from the client
            // the client should also be able to update the timescrubber, callouts etc.
            this.simulationTime = data.simulationtime;
            this.simulationRate = data.simulationrate;
            this.simulationPlaying = data.simulationplaying;
            console.log(
              "Received time command: " +
                data.simulationtime +
                " " +
                data.simulationrate +
                " " +
                data.simulationplaying
            );
          } else {
            console.log("Invalid message: missing name or color");
          }
        } catch (error) {
          console.error("Error processing message from client:", error);
          ws.send("Error: Invalid message format");
        }
      });
      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    console.log("BrahmaServer (backend) initialized");
  }

  /**
   * Starts the WebSocket server on the configured port.
   */
  run() {
    console.log("BrahmaServer is running...");
    this.server.listen(this.port, () => {
      console.log(`🛜 WebSocket server started on ws://localhost:${this.port}`);
    });
  }
  /**
   * Generates a unique alphanumeric username.
   * @private
   * @returns {string} A unique username like "User-X9".
   */
  _generateUsername() {
    const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let username;
    do {
      username = "User-";
      for (let i = 0; i < 2; i++) {
        username += alphanumeric.charAt(
          Math.floor(Math.random() * alphanumeric.length)
        );
      }
    } while (Object.keys(this.interlocutors).includes(username)); // Ensure unique username
    return username;
  }
  /**
   * Generates a random pastel color in hex format.
   * @private
   * @returns {string} A pastel hex color like "0xffaacc".
   */
  _generatePastelColor() {
    const randomHex = () => Math.floor(Math.random() * 128 + 127); // Pastel color component
    const red = randomHex().toString(16).padStart(2, "0");
    const green = randomHex().toString(16).padStart(2, "0");
    const blue = randomHex().toString(16).padStart(2, "0");

    return `0x${red}${green}${blue}`;
  }
  /**
   * Broadcasts all active interlocutor data to all connected clients.
   * @private
   */
  _broadcast() {
    // for each interlocutor, if the lastUpdated is more than 5 minutes ago, delete them
    // const now = Date.now();
    // Object.keys(this.interlocutors).forEach((name) => {
    //   if (now - this.interlocutors[name].lastUpdated > 300000) {
    //     delete this.interlocutors[name];
    //   }
    // });
    let packet = Object.values(this.interlocutors).map(
      ({ name, color, HMDPosition, LController, RController }) => ({
        name,
        color,
        HMDPosition,
        LController,
        RController,
      })
    );

    packet = JSON.stringify(packet);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(packet);
      }
    });
  }

  /**
   * Sends the current simulation time and state to all clients.
   * @private
   */
  _broadcastTime() {
    let type = "timePacket";
    let timePacket = {
      type: type,
      simulationTime: this.simulationTime,
      simulationPlaying: this.simulationPlaying,
      simulationRate: this.simulationRate,
    };

    timePacket = JSON.stringify(timePacket);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(timePacket);
      }
    });
  }
}
