var express = require('express');
var app = express();
var engine = require('ejs-locals');
var uuid = require('node-uuid');
var route = require('./route');
var router = express.Router();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.set('views', __dirname+'/views');
app.use(express.static(__dirname + '/public/'));
app.engine('ejs', engine);

// Routing
router.get('/', route.index);
// router.get('/home', route.home);


app.use('/', router);
app.use(route.error404);
//----------------------------

// GAME

var userInputs = []

var environment = {
 players: {},
 food: {}
};



function generateFood()
{
	var player_id = uuid.v1()

	environment.food[player_id] = {
		x: Math.random() * 1000,
		y: Math.random() * 600,
		radius:5,
		color:'#'+ Math.floor(Math.random() * 16777215).toString(16)
	}

}


function newConnection(socket) {

	var player_id = uuid.v1()

	environment.players[player_id] = {
		x: Math.random() * 1000,
		y: Math.random() * 600,
    targetx: Math.random() * 1000,
		targety: Math.random() * 600,
		radius:30,
		color:'#'+ Math.floor(Math.random() * 16777215).toString(16)
	}


	socket.emit("player_id", { player_id:player_id })


	socket.on('order', function(order){
		//userInputs.push(order)
		var player = environment.players[order.player_id]
    console.log( " test  "+ order.x);

		try{
      player.targetx = order.x
			player.targety = order.y
      updatePlayers(order.player_id);
      //console.log(player.player_id + " receive  "+ environment.players[order.player_id].targetx)
      //console.log(player_id + " removed")
		}
		catch(err)
		{
			console.log(player_id + " removed")
			//delete environment.players[player_id]
		}


	});

	socket.on('disconnect', function(){
     	delete environment.players[player_id]
  	});

}

function vitesse(radius){
//Fonction permettant de ralentir le player si il est trop gros
	return 10/Math.log(radius);
}

/*
function updateEnvironment() {

	input = userInputs.pop()

	while(input !== undefined){
		switch(input.cmd) {
			case 'UP_PRESSED':
			environment.players[input.player_id].y -= 1;
			break;
			case 'UP_RELEASED':
			environment.players[input.player_id].y += 1;
			break;
		}

		input = userInputs.pop()
	}

}
*/

function updatePlayers(playerId) {
  var player = environment.players[playerId];
  var distance = Math.sqrt( Math.pow( ( player.targetx - player.x ) ,2 ) + Math.pow(  (player.targety - player.y) ,2) ) ;

  var directionx = ( ( player.targetx - player.x) / distance ) * Math.min( 10 , parseInt(distance) ) * vitesse( player.radius );
  var directiony = ( ( player.targety - player.y) / distance ) * Math.min( 10 , parseInt(distance) ) * vitesse( player.radius );

  environment.players[playerId].x = environment.players[playerId].x + directionx;
  environment.players[playerId].y = environment.players[playerId].y + directiony;
}

function foodColision(playerId) {
  var player=environment.players[playerId];

  for (var i in environment.food)  {
     var food =environment.food[i];
     if ( (Math.abs(food.x - player.x))<=2 )  {
       delete environment.food[i]
     }
     //console.log("toto " +player.x);
   }
}

function colision() {

}


function gameLoop() {
	//updateEnvironment();
	//console.log(environment)
  //Object.keys(environment.players).forEach(updatePlayers);
  Object.keys(environment.players).forEach(foodColision);
	io.emit('updateEnvironment', environment);
}






io.on('connection', newConnection);




setInterval(gameLoop, 1000/30);
setInterval(generateFood, 800);
server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


server.listen(8080);
