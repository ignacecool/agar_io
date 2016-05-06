var $ = require("jquery");
var socket = require('socket.io-client')();
var CanvasGrid = require('canvas-grid');

var environment = {
 players: {},
 food: {}
};

var player = {
	x:0,
	y:0,
	radius:0,
	color:""
}

var MOUSE_X = 0
var MOUSE_Y = 0

var player_id = ""
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

var SERVER_WIDTH=10000
var SERVER_HEIGHT=10000

//------------------------------------
// Drawing functions
//------------------------------------
function drawCircle(x,y,r,c){

	var half_width_screen = WIDTH/2
	var half_height_screen = HEIGHT/2

  var distance_gauche_x=half_width_screen

  var distance_gauche_y=half_height_screen

  var distance_droit_x=half_width_screen

  var distance_droit_y=half_height_screen


	var main_cell_x = environment.players[player_id.player_id].x
	var main_cell_y = environment.players[player_id.player_id].y

	var x_distance = Math.abs(main_cell_x - x)
	var y_distance = Math.abs(main_cell_y - y)

  if (main_cell_x < half_width_screen){
    distance_gauche_x = main_cell_x
    distance_droit_x = (half_width_screen * 2) -distance_gauche_x
  }

  if (main_cell_y < half_height_screen){
    distance_gauche_y = main_cell_y
    distance_droit_y = (half_height_screen * 2) -distance_gauche_y
  }

  var draw_x=0
  var draw_y=0

	 /*if(x_distance > half_width_screen)
	 	return
	 else if(y_distance > half_height_screen)
	 	return


	if( (main_cell_x-x)>0 ){
    		x = distance_gauche_x - x_distance
        draw_x=1
  }
	else{
      	x = distance_gauche_x + x_distance
        draw_x=1
  }



	if( (main_cell_y-y)>0 ){
    y = distance_gauche_y - y_distance
    draw_y=1
  }
	else{
    y = distance_gauche_y + y_distance
    draw_y=1
  }*/

  if( (main_cell_x-x)>=0 ){
    if ( x_distance <= distance_gauche_x ){
      x = distance_gauche_x - x_distance
    }
    else if ( x_distance > distance_gauche_x ) return
  }

  if( (main_cell_x-x)<=0 ){
    if ( x_distance <= distance_droit_x )
    {
         x = distance_gauche_x + x_distance
    }
  else if ( x_distance > distance_droit_x ) return
  }

  if( (main_cell_y-y)>=0 ){
    if ( y_distance <= distance_gauche_y ){
      y = distance_gauche_y - y_distance
    }
    else if ( y_distance > distance_gauche_y ) return
  }

  if( (main_cell_y-y)<=0 ){
    if ( y_distance <= distance_droit_y ){
        y = distance_gauche_y + y_distance
    }
    else if ( y_distance > distance_droit_y ) return
  }


	//x = main_cell_x - x
	//y = main_cell_y - y

	 var start = 0;
	 var finish = 2*Math.PI;
	 ctx.fillStyle = c;
	 ctx.beginPath();
	 ctx.arc(x,y,r,start, finish);
	 ctx.fill();
	 ctx.stroke();
}

function drawPlayer(playerId) {
	var player = environment.players[playerId];
	drawCircle(player.x,player.y,player.radius,player.color)
}

function drawFood(foodId) {
	var food = environment.food[foodId];
	drawCircle(food.x,food.y,food.radius,food.color)
}

function renderLoop(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  /*var grid = new CanvasGrid(canvas, {
    borderColor: '#777'
  });

  var activeColor = '#ff0beb';

  grid.drawMatrix({
    x: 16,
    y: 4
  });*/
	Object.keys(environment.players).forEach(drawPlayer);
	Object.keys(environment.food).forEach(drawFood);
	moveCell()

	//environment.food.forEach(drawFood);
	window.requestAnimationFrame(renderLoop);
}

//---------------------------------------------
// Movements of cell
//---------------------------------------------

function moveCell(){

	try{
		if(environment.players[player_id.player_id])
		{
			order = {
				player_id:player_id.player_id,
				mouse_x: MOUSE_X,
				mouse_y: MOUSE_Y
			}
			socket.emit('order',order);
		}
	}
	catch(e)
	{
		console.log('movecell '+e)
	}

}


$("#canvas").on('mousemove', function(event) {
    var rect = canvas.getBoundingClientRect();
	  MOUSE_X = event.clientX * (SERVER_WIDTH / WIDTH)
    MOUSE_Y = event.clientY * (SERVER_HEIGHT / HEIGHT)
});


//-------------------------------------------------

socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
	//console.log(environment)
});

socket.on('player_id',function(id) {
	player_id = id
	renderLoop()
});

socket.on('game_over',function(id) {
	socket.emit('connection',{});


});




socket.emit('connection',{});
