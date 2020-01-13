var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
	res.send('<h1>Hello world</h1>');
});

io.on('connection', function (socket) {
	console.log('user connect');
	io.clients((error, clients) => {
		if (error) throw error;
		io.emit('snake users', {users: clients.map(id => { return {id}})});
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('snake gameover', function({points}){
		io.emit('snake gameover', {user: socket.id, points});
	});

	socket.on('snake move', function({snake}){
		socket.broadcast.emit('snake move', {user: socket.id, snake});
	});

	socket.on('snake eat', ({points}) => {
		socket.broadcast.emit('snake eat',
			{
				user: socket.id,
				point: points,
			}
		);
	})
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});
