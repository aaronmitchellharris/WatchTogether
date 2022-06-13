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

// send message to everyone in lobby
sendToLobby = (lobby, message) => {
    Object.entries(lobbies[lobby]['users']).forEach(([ ,client]) => {
        // send message
        client.send(JSON.stringify(message)); 
    });
};

// handle websocket connections
wss.on('connection', socket => {
    const user = Math.floor(Math.random() * 1000000000); // create unique id for user
    let nickname = user;
    let message;
    // handle receiving messages
    socket.on('message', (data, isBinary) => { 
        const received = JSON.parse(data);
        let lobby = received.lobby;

        // join lobby
        if (received.meta === "join") {
            nickname = received.nickname ? received.nickname : user;
            console.log(`Connection made by User(${user}) from room ${received.lobby}`);
            // create lobby if it doesn't exist
            if (!lobbies[received.lobby]) lobbies[received.lobby] = {'messageLog': [], 'users': {}, 'videoId': ''};
            if (!lobbies[received.lobby]['users'][user]) lobbies[received.lobby]['users'][user] = socket;
            // send message log
            socket.send(JSON.stringify({
                meta: 'initial',
                lobby: received.lobby,
                content: lobbies[received.lobby]['messageLog'],
                user: user,
                nickname: nickname
            }));
            // announce entrance to lobby
            message = {meta: 'system', lobby: received.lobby, content: 'has joined', user: user, nickname: nickname};
            lobbies[received.lobby]['messageLog'].push(message); // save message in log
            sendToLobby(received.lobby, {meta: 'system', lobby: received.lobby, content: lobbies[received.lobby]['messageLog'], user: user, nickname: nickname});
            console.log(Object.keys(lobbies[received.lobby]['users']));
        
        // update nickname
        } else if (received.meta === "nickname") {
            nickname = received.nickname;
            lobbies[received.lobby]['messageLog'].map(msg => {if (msg.user == received.user) msg.nickname = received.nickname});
            sendToLobby(received.lobby, {
                meta: 'log',
                lobby: received.lobby,
                content: lobbies[received.lobby]['messageLog']
            })
        } else if (received.meta === "video") {
            lobbies[received.lobby]['videoId'] = received.content;
            message = {meta: 'system', lobby: received.lobby, content: 'changed the video', user: user, nickname, nickname};
            lobbies[received.lobby]['messageLog'].push(message)
            sendToLobby(received.lobby, {
                meta: 'video',
                lobby: received.lobby,
                content: {
                    videoId: received.content, 
                    messageLog: lobbies[received.lobby]['messageLog']
                }
            })

        // send message to everyone in lobby
        } else {
            lobbies[received.lobby]['messageLog'].push(received); // save message in log
            sendToLobby(received.lobby, received);
        }
    });

    // handle closing connection
    socket.on('close', () => {
        Object.keys(lobbies).forEach(lobby => {
            if (Object.keys(lobbies[lobby]['users']).length === 1) {
                delete lobbies[lobby];
            } else {
                message = {meta: 'system', lobby: lobby, content: 'has left', user: user, nickname: nickname};
                lobbies[lobby]['messageLog'].push(message); // save message in log
                sendToLobby(lobby, {meta: 'system', lobby: lobby, content: lobbies[lobby]['messageLog'], user: user, nickname: nickname})
                delete lobbies[lobby]['users'][user];
            }
            console.log(`Connection ended by User(${user}) from room ${lobby}`);
            try {
            console.log(Object.keys(lobbies[lobby]['users']));
            } catch{}
        })
    });
});

// get list of existing lobbies
app.get('/lobbies', (req, res) => {
    res.json({ lobbies: Object.keys(lobbies) });
});

// use angular for frontend
app.get('/', (req, res) => {
    res.sendFile('index');
});

// start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
})
