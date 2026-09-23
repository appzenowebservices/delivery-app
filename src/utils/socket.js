

import { io } from "socket.io-client";
import { baseURL } from "../config";

const socket = io(baseURL, {
    transports: ["websocket"], // Use WebSocket transport
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    // auth: {
    //     token: localStorage.getItem("token"), // Auth token
    // },
});

// Handle successful connection
socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);


});


export default socket;
