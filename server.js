// don't change the prewritten code
// change the code for 'join' event

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { messageModel } from './message.schema.js';

export const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log("Connection made.");

    socket.on("join", async (data) => {
        // Emit a welcome message to the user who joined
        socket.emit("previousMessages", { text: `Welcome, ${data.username}` });
        console.log("data", data);

        // Write your code here
        const startTime = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)); // Example: Load messages from the last 24 hours
        const endTime = new Date();
        const previousMessages = await messageModel.find({
            room: data.room,
            timestamp: { $gte: startTime, $lte: endTime }
        }).sort({ timestamp: 1 });

        // Emit previous messages to the user who joined
        socket.emit("previousMessages", previousMessages);
    });

    socket.on("sendMessage", async (data) => {
        const message = new messageModel({
            username: data.username,
            text: data.message,
            room: data.room
        });

        await message.save();

        // Broadcast the received message to all users in the same room
        io.to(data.room).emit("message", {
            username: data.username,
            text: data.message
        });
    });

    socket.on("disconnect", () => {
        console.log("Connection disconnected.");
    });
});

// io.on("connection", (socket) => {
//     console.log("Connection made.");

//     socket.on("join", async (data) => {
//         // Emit a welcome message to the user who joined
//         socket.emit("previousMessages", {text:`Welcome , ${data.username}`})
//         console.log("data", data);
//         // write your code here
//         const startTime = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)); // Example: Load messages from the last 24 hours
//         const endTime = new Date();
//         const previousMessages = await messageModel.find({
//             room: data.room,
//             timestamp: { $gte: startTime, $lte: endTime }
//         }).sort({ timestamp: 1 });
//         console.log("previousmessages",previousMessages)

//         // Emit previous messages to the user who joined
//         socket.emit("previousMessages", previousMessages);

//     });

//     socket.on("sendMessage", async (data) => {

//         const message = new messageModel({
//             username: data.username,
//             text: data.message,
//             room: data.room
//         })

//         await message.save();

//         // Broadcast the received message to all users in the same room
//         io.to(data.room).emit("message", {
//             username: data.username,
//             text: data.message
//         });
//     });

//     socket.on("disconnect", () => {
//         console.log("Connection disconnected.");
//     });
// });


