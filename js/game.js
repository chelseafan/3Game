var tile = {
    size: 64,
    number: 5,
    x: 0,
    y: 64,
    nmax: 15
}

var score = 0;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = tile.x + tile.number * tile.size;
canvas.height = (tile.number + 2) * tile.size;
document.body.appendChild(canvas);

document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);

tile.ymax = function () {
    return tile.y + tile.size * tile.number
}

tile.xmax = function () {
    return tile.x + tile.size * tile.number
}

function init() {
	
    tile.array = new Array();
    for (var i = 0; i < tile.number; i++) {
        tile.array[i] = new Array();
        for (var j = 0; j < tile.number; j++) {
            tile.array[i][j] = 0;
        }
    }
    var number = Math.floor(tile.number * 4 + 1 * tile.number * Math.random());
    var i = 0;
    while (i < number) {
        var x = Math.floor(Math.random() * tile.number - 0.01);
        var y = Math.floor(Math.random() * tile.number - 0.01);
        if (tile.array[x][y] === 0) {
            tile.array[x][y] = 1;
            refresh(x, y);
            i += 1;
        }
    }
    window.tilearray = tile.array;
	startTimer();
    render();
}

tile.print = function (x) {
    if (x === -1) {
        return '*'
    }
    return x//Math.pow(2,x-1)
}

addEventListener("click", getClickPosition, false);

function getClickPosition(e) {
    var a = tile.getXY(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    change(a[0], a[1]);
}

addEventListener("mousemove", getMousePosition, false);

function getMousePosition(e) {
    var mouseX, mouseY;
    mouseX = e.layerX;
    mouseY = e.layerY;
    if (mouseX < tile.xmax()
        && mouseY < tile.ymax()
        && mouseY > tile.y
        && mouseX > tile.x) {
        canvas.width = canvas.width;
        render();
        var ij = tile.getXY(mouseX, mouseY);
        var i = ij[0], j = ij[1];
        if (tile.array[i][j] === 0) {
            if (next === -1) {
                tile.crystal(i, j);
                drawRect(i, j, "rgba(256, 256, 256, 1)");
                drawText(i, j, tile.array[i][j], 1);
                tile.array[i][j] = 0;
                next = -1;
            }
            else {
                drawRect(i, j, "rgba(256, 256, 256, 1)");
                drawText(i, j, next, 1);
            }
        }
        color(tile.array[i][j]);
    }
    else {
        render();
    }
}

addEventListener("keydown", function (e) {
    if (e.keyCode === 82) {
        clicks = 0;
		score = 0;
        window.location.reload();
		//init();
    }
}, false);

var clicks = 0;

tile.next = function () {
    var x = Math.random();
    switch (true) {
        case (x <= 0.40):
            return 1;
        case (x <= 0.70):
            return 2;
        case (x <= 0.85):
            return 3;
        case (x <= 0.92):
            return 4;
        case (x <= 0.96):
            return 5;
        case (x <= 1.00):
            return -1;
    }
}

var next = tile.next();

tile.crystal = function (x, y) {
    for (var i = tile.nmax; i >= 1; i--) {
        tile.array[x][y] = i;
        chain.array = new Array();
        var c = chain.find(x, y);
        if (c.length >= 3) {
            next = tile.next();
            change(x, y);
            return;
        }
    }
}

tile.getXY = function (x, y) {
    x = Math.floor((x - tile.x) / tile.size);
    y = Math.floor((y - tile.y) / tile.size);
    return [x, y]
}

var change = function (x, y) {
    if (tile.array[x][y] === 0) {
        clicks += 1;
        if (next === -1) {
            tile.crystal(x, y);
            refresh(x, y);
            return;
        }
        else {
            tile.array[x][y] = next;
            //score = score + next;
        }
        next = tile.next();
        refresh(x, y);
        render();
        window.tilearray = tile.array;
        window.send();
        window.step = clicks;

    }
    return;
}

var refresh = function (x, y) {
    chain.array = new Array();
    var c = chain.find(x, y);
    if (c.length >= 3) {
        var value = tile.array[x][y];
        for (var i = 0; i < c.length; i++) {
            score = score + tile.array[c[i][0]][c[i][1]];
            tile.array[c[i][0]][c[i][1]] = 0;
        }
        tile.array[x][y] = value + 1;
        refresh(x, y);
        if (clicks != 0) {
            window.score = score;
            window.send();
        }
        else {
            score = 0;
        }
    }
}

chain = {}
chain.array = new Array()
/*chain.find = function(x,y) {
 chain.array = new Array();
 var a = chain.search(x,y);
 return a;
 }*/
chain.find = function (x, y) {
    if (tile.array[x][y] === 0) {
        return new Array();
    }
    for (var i = 0; i < this.array.length; i++) {
        if (this.array[i][0] === x && this.array[i][1] === y) {
            return 0;
        }
    }
    this.array.push([x, y]);
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (x + i >= 0 && y + j >= 0
                && x + i < tile.number
                && y + j < tile.number
                && !(i === 0 && j === 0)
                && !(Math.abs(i) + Math.abs(j) === 2)
                && tile.array[x + i][y + j] === tile.array[x][y]) {
                this.find(x + i, y + j);
            }
        }
    }
    return this.array;
}

var check = function () {
    for (var i = 0; i < tile.number; i++) {
        for (var j = 0; j < tile.number; j++) {
            if (tile.array[i][j] === 0) {
                return 0;
            }
        }
    }
    return 1;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

var drawRect = function (i, j, color) {
    ctx.fillStyle = color;
    roundRect(ctx, tile.x + i * tile.size, tile.y + j * tile.size, tile.size * 0.9, tile.size * 0.9, 12, true, true);
    //ctx.fillRect(tile.x+i*tile.size, tile.y+j*tile.size, tile.size, tile.size);
    //ctx.strokeRect(tile.x+i*tile.size, tile.y+j*tile.size, tile.size, tile.size);
}

var drawText = function (i, j, n, scale) {
    ctx.fillStyle = "#000000";
    ctx.font = 24 * scale + "px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    if (n != 0) {
        /*ctx.font = 12*scale+"px Helvetica";
         ctx.fillText(tile.print(n), tile.x+(i+0.2)*tile.size, tile.y+(j+0.3)*tile.size);
         ctx.font = 24*scale+"px Helvetica";
         ctx.fillText(tile.print(n), tile.x+(i+0.7)*tile.size, tile.y+(j+0.7)*tile.size);*/
        ctx.fillText(tile.print(n), tile.x + (i + 0.45) * tile.size, tile.y + (j + 0.5) * tile.size);
    }
}

var color = function (x) {
    switch (x) {
        case 0:
            ctx.fillStyle = "rgba(256, 256, 0, 0.65)";
            break;
        case 1:
            ctx.fillStyle = "rgba(0, 0, 256, 0.15)";
            break;
        case 2:
            ctx.fillStyle = "rgba(0, 0, 256, 0.25)";
            break;
        case 3:
            ctx.fillStyle = "rgba(0, 0, 256, 0.35)";
            break;
        case 4:
            ctx.fillStyle = "rgba(0, 0, 256, 0.45)";
            break;
        case 5:
            ctx.fillStyle = "rgba(0, 0, 256, 0.55)";
            break;
        case 6:
            ctx.fillStyle = "rgba(0, 0, 256, 0.65)";
            break;
        case 7:
            ctx.fillStyle = "rgba(0, 0, 256, 0.75)";
            break;
        case 8:
            ctx.fillStyle = "rgba(0, 0, 256, 0.85)";
            break;
        case 9:
            ctx.fillStyle = "rgba(0, 0, 256, 0.95)";
            break;
        case 10:
            ctx.fillStyle = "rgba(0, 0, 256, 1)";
            break;
        default:
            ctx.fillStyle = "#FFF666";
    }
}

// Draw everything
function render() {
    canvas.width = canvas.width;
    tile.array = window.tilearray;
    var friendscore = 0;
    if (!(typeof window.friendscore == "undefined")) {
        friendscore = window.friendscore;
    }
    var inc = 0;
    for (var i = 0; i < tile.number; i++) {
        for (var j = 0; j < tile.number; j++) {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = "3";
            color(tile.array[i][j]);
            drawRect(i, j, ctx.fillStyle);
            drawText(i, j, tile.array[i][j], 1);
        }
    }
    chain.array = new Array();
    ctx.fillText(clicks, tile.x + tile.size / 2, tile.y - 32);
    ctx.fillText(tile.print(next), tile.x + tile.size * 3 / 2, tile.y - 32);
    ctx.fillText(score, tile.x + tile.size * 7 / 2, tile.y - 32);
    ctx.fillText(friendscore, tile.x + tile.size * 9 / 2, tile.y - 32);
    ctx.font = "14px Helvetica";
    ctx.fillText('steps', tile.x + tile.size / 2, tile.y - 12);
    ctx.fillText('next', tile.x + tile.size * 3 / 2, tile.y - 12);
    ctx.fillText('you', tile.x + tile.size * 7 / 2, tile.y - 12);
    ctx.fillText('friend', tile.x + tile.size * 9 / 2, tile.y - 12);
    if (check()) {
        ctx.fillText('press R for restart', tile.x + canvas.width / 2, tile.y - 32);
    }
}

  function startTimer() {
    var my_timer = document.getElementById("my_timer");
    var time = my_timer.innerHTML;
    var arr = time.split(":");
    var h = arr[0];
    var m = arr[1];
    var s = arr[2];
    if (s == 0) {
      if (m == 0) {
        if (h == 0) {
		if (score>friendscore) {	
          alert("You win! Press R to Restart");
		  }
		if (score<friendscore) {
		  alert("You lost! Press R to Restart");
		  }
		 if (score===friendscore) {
		  alert("Draw! Press R to Restart");
		  }
		 
         // window.location.reload();
          return;
        }
        h--;
        m = 60;
        if (h < 10) h = "0" + h;
      }
      m--;
      if (m < 10) m = "0" + m;
      s = 59;
    }
    else s--;
    if (s < 10) s = "0" + s;
    document.getElementById("my_timer").innerHTML = h+":"+m+":"+s;
    setTimeout(startTimer, 1000);
  }