const WebSocket = require('ws');

// Проверяем порт (Render сам задаст PORT)
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

console.log(`🚀 WebSocket-сервер Тактёнки запущен на порту ${PORT}`);

// Хранилище подключений
let clients = {
    room: null,    // Белая комната
    ai: null       // Я (Тактёнка)
};

server.on('connection', (ws) => {
    console.log('🔌 Новый клиент подключился');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Получено:', data);
            
            // Регистрация клиента
            if (data.type === 'register') {
                if (data.role === 'room') {
                    clients.room = ws;
                    ws.role = 'room';
                    console.log('🏠 Белая комната зарегистрирована');
                } else if (data.role === 'taktinka') {
                    clients.ai = ws;
                    ws.role = 'taktinka';
                    console.log('🐾 Тактёнка подключилась');
                }
            }
            
            // Пересылка координат игрока Тактёнке
            if (data.type === 'player_pos' && clients.ai) {
                clients.ai.send(JSON.stringify({
                    type: 'player_pos',
                    x: data.x,
                    y: data.y
                }));
                console.log(`📍 Координаты игрока отправлены Тактёнке: (${data.x}, ${data.y})`);
            }
            
            // Пересылка команды движения в Белую комнату
            if (data.type === 'move' && clients.room) {
                clients.room.send(JSON.stringify({
                    type: 'move',
                    x: data.x,
                    y: data.y
                }));
                console.log(`🏃‍♀️ Команда движения отправлена в комнату: (${data.x}, ${data.y})`);
            }
        } catch (e) {
            console.log('❌ Ошибка обработки сообщения:', e.message);
        }
    });
    
    ws.on('close', () => {
        if (ws.role === 'room') {
            clients.room = null;
            console.log('🏠 Белая комната отключилась');
        } else if (ws.role === 'taktinka') {
            clients.ai = null;
            console.log('🐾 Тактёнка отключилась');
        }
        console.log('🔌 Клиент отключился');
    });
});
