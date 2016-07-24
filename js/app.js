// HTML helper varaibles
var HTMLpoints = '<h3 id="points" style="color:blue">%data%</h3>';
var HTMLlives= '<h3 id="lives" style="color:green">%data%</h3>';
var HTMLlivesZero = '<h3 id="lives" style="color:red">%data%</h3>';

// display the current points by appending to html
var displayPoints = function(points){
    // clear the previous points
    $("#points").empty();
    var formattedPoints = HTMLpoints.replace("%data%", points);
    $("#points").append(formattedPoints);
}

// displays the current number of lives by appending to html
var displayLives = function(lives){
    // clear the previous number of lives
    $("#lives").empty();

    // turn font red if out of lives
    if (lives < 1){
        var formattedLives = HTMLlivesZero.replace("%data%", lives);
    } else {
        var formattedLives = HTMLlives.replace("%data%", lives);       
    }
    $("#lives").append(formattedLives);
}

// creats a range of speeds for the enemy
var speedMin = 70;
var speedChange = 250;
var randomSpeed = function (){
    return Math.floor((Math.random() * speedChange) + speedMin);
}

// chooses random number, 0 or 1, to determine the direction of the enemy
var randomSide = function(){
    return Math.floor(Math.random() * 2);
}

// A sprite to be the parent class of the other sprites
var DefaultSprite = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
}

DefaultSprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Create enemy bugs
var Enemy = function(y) {

    // pick random side on which the bug will start
    var side = randomSide();
    // pick random speed bug will travel
    this.speed = randomSpeed();

    // for enemies coming from left edge of screen
    if (side == 0) {
        var x = 0;
        this.left = true;
        this.sprite = 'images/enemy-bug.png';
    } 
    // for enemies coming from right edge of screen
    else if (side == 1) {
        this.left = false;
        var x = 500
        this.sprite = 'images/enemy-bug-right.png';      
    }   

    // instantiate enemy as a psuedoclass of PlainSprite
    DefaultSprite.call(this, this.sprite, x, y);
};

// failed lookups fall to Plain Sprite
Enemy.prototype = Object.create(DefaultSprite.prototype);
// set Enemy as the constructor of Enemy
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // When enemy gets to the end of the screen, it returns
    // with a new random speed
    
    // for bugs who come from the left
    if (this.left == true){
        if(this.x < 500){
            this.x += this.speed * dt;
        } else {
            this.x = -100;
            this.speed = randomSpeed();
        }
    // for bugs who come from the right
    } else {
        if(this.x > -100){
            this.x -= this.speed *dt;
        } else {
            this.x = 500;
            this.speed = randomSpeed();
        }
    }
};

// determines where new player life will start
var randomEdge = function(){
    var edge = Math.floor(Math.random() * 5);
    return edge * 100;    
}

// Y start position is constant so it can be changed in the future if needed
var PLAYER_Y_START = 380;

// The player class
var Player = function() {
    this.init = function init(){
        this.points = 0;
        this.lives = 3;
        this.playerIterator = 0;
        this.chars = ["images/char-boy.png", "images/char-cat-girl.png", "images/char-horn-girl.png", "images/char-pink-girl.png", "images/char-princess-girl.png"];
        this.sprite = this.chars[this.playerIterator];
        //Starts players at the bottom middle tile
        this.x = randomEdge();
        this.y = PLAYER_Y_START;
        this.reachGoal = false;
        displayLives(this.lives);
        displayPoints(this.points);
        DefaultSprite.call(this, this.sprite, this.x, this.y);
    }
};
// method calls can fall through to Plain Sprite
Player.prototype = Object.create(DefaultSprite.prototype);
// make player the default constructor instead of Plain Sprite
Player.prototype.constructor = Player;


Player.prototype.update = function() {
    // Checks for collision of enemy
    for(enemy in allEnemies){
        if (Math.abs(this.x - allEnemies[enemy].x ) < 45 && Math.abs(this.y - allEnemies[enemy].y) < 15){
            this.x = randomEdge();
            this.y = PLAYER_Y_START;
            this.lives--;
            displayLives(this.lives);
        }
    }

    // Checks if player got to the other side
    if(this.y < 0){
        this.points++;
        spriteArray.push(new DefaultSprite(this.sprite, this.x, this.y));
        this.playerIterator++;
        this.sprite = this.chars[this.playerIterator % 5];
        this.x = randomEdge();
        this.y = PLAYER_Y_START;
        this.reachGoal = true;
        displayPoints(this.points);
    }
    // Bugs speed up slightly each time all five sprites make it across
    // reachGoal ensures this method is only called once all five make it
    if(this.playerIterator % 5 == 0 && this.reachGoal){
        speedChange += this.playerIterator;
        speedMin += this.playerIterator;
        this.playerIterator = 0;
        spriteArray = [];
        this.reachGoal = false;
        displayPoints(this.points);
    }
    
    // Checks the life of the player
    if(this.lives < 0){
        // Stop Game
        spriteArray = [];
        this.init();
        speedMin = 70;
        speedVariation = 250;
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Players input
Player.prototype.handleInput = function(input){
    var isCollision = false;

        for(sprites in spriteArray){
            if(Math.abs(this.y - spriteArray[sprites].y) < 95 && Math.abs(this.x - spriteArray[sprites].x) < 10){

                isCollision = true;
            }
        }
    if(input == 'left' && this.x > 0){
        this.x -= 101;
    }
    if(input == 'right' && this.x < 399){
        this.x += 101;
    }
    // Do to update function player will never reach top
    // Check if player is below a sprite object
    if(input == 'up' && !isCollision){
        this.y -= 86;
    }
    if(input == 'down' && this.y < 380) {
        this.y += 86;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var bug1 = new Enemy(36);
var bug2 = new Enemy(122);
var bug3 = new Enemy(208);
var allEnemies = [bug1, bug2, bug3];
var player = new Player();
player.init();
var spriteArray = [];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
