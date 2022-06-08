const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 8081;
const ws_PORT = process.env.ws_PORT || 8080;

// create website server
const express = require('express');
const app = express();

// create websocket server
const ws = require('ws')
const wss = new ws.Server({ port: ws_PORT });

app.use(cors());
app.use(express.static('frontend/dist/frontend'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

const lobbies = {};

// handle websocket connections
wss.on('connection', socket => {
    
    // handle receiving messages
    socket.on('message', (data, isBinary) => {
        const user = Math.random(); // create unique id for user
        const received = JSON.parse(data);

        if (received.meta === "join") { // join lobby
            console.log(`Connection made by User(${user}) from room ${received.lobby}`);
            if (!lobbies[received.lobby]) lobbies[received.lobby] = {};
            if (!lobbies[received.lobby][user]) lobbies[received.lobby][user] = socket;
        } else { // send message to everyone in lobby
            Object.entries(lobbies[received.lobby]).forEach(([ ,client]) => {
                client.send(data, { binary: isBinary })
            });
        }
    })
});

// use angular for frontend
app.get('/', (req, res) => {
    res.sendFile('index');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
})
