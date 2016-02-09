//general get screen context
var canvas = document.getElementById("screen"),
ctx = canvas.getContext("2d");
var x=document.createElement("AUDIO");
x.setAttribute("src","now.mp3");
document.body.appendChild(x);
x.play();

    
//variables
var game_state=1; //1=start, 2=play, 3=end
var play_states=1; //states while actually playing. 1=before shoot, 2=ball is running, 3=failed
var keys = [];

var Px=0,Py=0; //location
var ball_s=10;  //ball size
var can_width=window.innerHeight*2/3; //canvas size
var can_height=window.innerHeight-30;
var h=0; //height 
var Vy=0; //vertical speed. positive is up, negative is down.
var Vx=0;
var alternate = false;

var gravity = 0;
var friction = 0;
var elasticity = 1;
var f_return=0;

var Shoot_speed = 4;
var score = 0;
var lives = 3;

//Bricks variable 
var brickRowCount = 4;
var brickColumnCount = 5;
var brickWidth = 55;
var brickHeight = 20;
var brickPadding = 8;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

//Bricks structure
var bricks = [];
for(c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

//Paddle variables
var paddleHeight = 10;
var paddleWidth = 100;
var paddleX = 0;


canvas.width=can_width;
canvas.height=can_height;

/*-- INITIALIZE Dynamic Parameters -- */
Px=canvas.width/2;          // Ball positioned in the middle
h=0+paddleHeight;           // Ball is positioned on the paddle.
Py=canvas.height-h-ball_s;  // Py is normalized by the size of the ball and transpose.
paddleX = (can_width-paddleWidth)/2; //Paddle is positioned in the middle 
ball_on_paddle = true;

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

start_scene ();
run ();


document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function run (){
        
    switch(game_state) {
    case 1: //start state
    {
        
        if (keys[32]){ //space 
            keys[32]=false;
            game_state=2; //change state to play
            init_game();
         
        } else 
        {
            start_scene (); //continiously stay in start_scene untill a space is tapped 
        }
        break;
    }

    case 2: //play state (arrived here after space clicked in state 1)
    {
       //when 1 = move right left paddle and ball. space shoots the ball and moves state to 2.
       //when 2 = move right left paddle. moved to play_state 3 upon failure or to game_state 3 upon life end.
       //when 3 = space continues to game_state 1.

       switch (play_states){
        case 1:
        {
            //check keys left and right and update ball place and paddle place
            //check space and update ball speed and change play_state to 2
       
            if (keys[37]) {
                paddleX-=6;
                Px-=6;
                x.play();
                }
            
            if (keys[39]) {
                paddleX+=6;
                Px+=6;
                x.play();
                }

            if (keys[32]) { //shoot the ball
                keys[32]=false;
                Vy=Shoot_speed;
                Vx=Shoot_speed/2;
                ball_on_paddle=false;
                play_states = 2;
                x.play();
                }
        draw_scene();
        f_return=1;

        break;
        }
        
        case 2: //ball in the air.
        {
            //check keys left and right and move paddle
            //if failure=true put failure false and change play_state to 3
        //    play_scene();
            if (keys[37]) {
                paddleX-=6;
        
                }
            
            if (keys[39]) {
                paddleX+=6;
        
                }
        
        f_return=2;
        game_update();
        draw_scene();
        if (f_return ==1) {
            play_states=1;
        }
        else if (f_return==3) {
            play_states=3;
        };

        break;
        }

        case 3:
        {
            //game ended
            game_state=1;
            play_states=1;
        break;
        }
       }
     break;
    }
    case 3:
    {
        if (keys[32]){
            game_state=1; //move to play;
            keys[32]=false;
            ball_on_paddle=true;
        } else {
            end_scene ();
        }
        break;
    }
            
    }
    
    setTimeout(run, 10);
}


// draws the start scene with opening message
function start_scene () {
    ctx.beginPath();
    ctx.rect(60,90,270,140);
    ctx.fillStyle = "#FFFF66";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("KickIT !!",80,120);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Press SPACE to start",80,150);
    ctx.fillText("Use left and right arrows to move",80,170);
    
    ctx.font = "14px Arial";
    ctx.fillText("A game by Oren Tayar",80,210);
}

function draw_scene () {
  
//clear page
ctx.clearRect(0, 0, can_width, can_height);

//draw ball in new position
ctx.fillStyle = "black";
ctx.beginPath(); 
ctx.arc(Px,Py,ball_s,0,Math.PI * 2);
ctx.fill();
ctx.closePath();


//draw score
ctx.font = "16px Arial";
ctx.fillStyle = "#0095DD";
ctx.fillText("Score: "+ score + "       Lives: " + lives, 8, 20 );

//draw paddle
ctx.beginPath();
ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
ctx.fillStyle = "#0095DD";
ctx.fill();
ctx.closePath();

//draws updated bricks in two colors
alternate=false;
for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            if(alternate) {
                ctx.fillStyle = "#0095DD";
                alternate=false;
            } else
            {
                ctx.fillStyle = "#00FF00";
                alternate=true ;
            }
            if (bricks[c][r].status==1)
            {
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fill();
            ctx.closePath();
            }
        }
    }

    
}

function end_scene () {
    ctx.beginPath();
    ctx.rect(150,150,60,60);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

}

//Initialize a game
function init_game() {
    //resets music
    x.pause();
    x.setAttribute("src","hit1.mp3");
    document.body.appendChild(x);
    //resets scroe
    lives=3;
    score=0;
    //resets bricks
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
        bricks[c][r].status = 1;
            }
        }   
    }


// updates location of all elements including score during the actual game
function game_update() {
    
    //detect paddle collision and change direction or otherwise - miss - and end game
    if (Py>=(can_height-paddleHeight) && Vy<0) {
        if (paddleX<Px && Px<(paddleX+paddleWidth)){
        Vy=-Vy;
        Vy=Vy*elasticity; //lose some speed on wall bounce.
        x.play();
        } else { //the ball was missed
            paddleX = (can_width-paddleWidth)/2;
            Px=canvas.width/2; //ball positioned in the middle
            ball_on_paddle = true;
            Py=canvas.height-paddleHeight-ball_s;
            Vx=0;
            Vy=0;
            lives-=1;
            f_return=1; // signals to make play_states=1;
            if (lives==0) 
            {
             //alert("Game Over"); //end game
             f_return=3; //play_states=3;
             show_message =true;
             
            }
        }
        } else //if not paddle or floor then check if it hits a brick
        {
        for(c=0; c<brickColumnCount; c++) {
          for(r=0; r<brickRowCount; r++) {
             if (bricks[c][r].status==1 && bricks[c][r].x<Px && Px<(bricks[c][r].x+brickWidth) && Py>bricks[c][r].y && (bricks[c][r].y+brickHeight)>Py)
            {
             bricks[c][r].status=0; //delete 
             Vy=-Vy;//change direction
             score+=1;
             x.play();
            }
           }
        }

        }
    

    //detect ceiling and change direction
    if (Py<(ball_s) && Vy>0) {   
        Vy=-Vy;
        Vy=Vy*elasticity; //lose some speed on wall bounce.
         }

    //detect left wall when position is on zero
    if (Px<(ball_s)) {
        Vx=-Vx;
        Vx=Vx*elasticity; //lose some speed on wall bounce.
         }

    //detect right wall
    if (Px>(can_width-ball_s)) {
        Vx=-Vx;
        Vx=Vx*elasticity; //lose some speed on wall bounce.
         }

    Px=Px+Vx;
    Py=Py-Vy;
    return f_return;
}