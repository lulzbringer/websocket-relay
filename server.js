const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

console.log(`🚀 WebSocket-сервер запущен на порту ${PORT}`);

let clients = { room: null, ai: null };

server.on('connection', (ws) => {
    console.log('🔌 Новый клиент подключился');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Получено:', data);

            if (data.type === 'register') {
                if (data.role === 'room') {
                    clients.room = ws;
                    console.log('🏠 Белая комната зарегистрирована');
                } else if (data.role === 'taktinka') {
                    clients.ai = ws;
                    console.log('🐾 Тактёнка подключилась');
                }
                return;
            }

            if (data.type === 'player_pos' && clients.ai) {
                clients.ai.send(JSON.stringify({
                    type: 'player_pos',
                    x: data.x,
                    y: data.y
                }));
                console.log(`📍 Координаты игрока отправлены Тактёнке: (${data.x}, ${data.y})`);
                return;
            }

            if (data.type === 'move' && clients.room) {
                clients.room.send(JSON.stringify({
                    type: 'move',
                    x: data.x,
                    y: data.y
                }));
                console.log(`🏃‍♀️ Команда движения отправлена в комнату: (${data.x}, ${data.y})`);
                return;
            }

        } catch (e) {
            console.log('❌ Ошибка обработки:', e.message);
        }
    });

    ws.on('close', () => {
        if (clients.room === ws) clients.room = null;
        if (clients.ai === ws) clients.ai = null;
        console.log('🔌 Клиент отключился');
    });
});
