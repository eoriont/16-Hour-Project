$(document).ready(function() {
    var mouseDown;

    var cv = {
        canvas : document.createElement("canvas"),
        render : function() {
            this.canvas.width = document.body.clientWidth; //1900
            this.canvas.height = window.innerHeight;//document.body.clientHeight; //880
            this.canvas.style.left = '400px';
            console.log(window.innerHeight);
            this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas, document.body.childNodes[1]);
        }
    };
    cv.render();
    var c = cv.canvas;
    var div = document.getElementById("lines");
    var size = 2;
    var ctx = c.getContext("2d");
    var mousePos = {
        lastX: 0,
        lastY: 0,
        x: 0,
        y:0
    };
    var lastLine = {
        lastX: 0,
        lastY: 0,
        x: 0,
        y: 0
    }
    var color = {
        r: 0,
        g: 0,
        b: 0
    }
    var lines = [];

    $(c).mousemove(mouseMove);
    c.addEventListener('mousedown', function(evt) {
    mousePos.lastX=evt.clientX-c.getBoundingClientRect().left;
    mousePos.lastY=evt.clientY-c.getBoundingClientRect().top;
    lastLine=mousePos;
    mouseDown=true;});
    c.addEventListener('mouseup', function() {
        var line = {
            colorr: color.r,
            colorg: color.g,
            colorb: color.b,
            size: size,
            startX: mousePos.lastX,
            startY: mousePos.lastY,
            endX: mousePos.x,
            endY: mousePos.y
        }
        pushLine(line);
        drawLines();
        mouseDown=false;
    });


    function getMousePos(canvas, evt) {
        var rect = c.getBoundingClientRect();
        return {
            lastX: mousePos.lastX,//mousePos.x,
            lastY: mousePos.lastY,//mousePos.y,
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function mouseMove(evt) {
        lastLine = mousePos;
        mousePos = getMousePos(c, evt);
        ctx.clearRect(0, 0, c.width, c.height);
        drawLines();

        ctx.beginPath();
        ctx.moveTo(mousePos.lastX, mousePos.lastY);
        ctx.strokeStyle = "rgb("+color.r+","+color.g+","+color.b+")";

        if(mouseDown) {
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(mousePos.x,mousePos.y);
            ctx.stroke();
        }
    }

    function pushLine(line) {
        lines.push(line);
        console.log(line);
        
        $("#lines").append('<tr><td>'+line.startX+'</td><td>'+line.startY+'</td><td>'+getEquation(line)+"</td>");
    }

    function getEquation(line) {
        var coord1 = {x:line.startX,y:line.startY};
        var coord2 = {x:line.endX,y:line.endY};
        var cy = coord1.y-coord2.y;
        var cx = coord1.x-coord2.x;
        var m = cy/cx;
        var part = m * coord1.x;
        var b = coord1.y - part;
        var equation = "y = "+m*-1+"x + "+b;
        return equation;
    }

    function drawLines() {
        ctx.clearRect(0, 0, c.width, c.height);

        for(var num = 0; num < lines.length; num++) {
            i=lines[num]
            ctx.beginPath();
            ctx.moveTo(i.startX, i.startY);
            ctx.strokeStyle = "rgb("+i.colorr+","+i.colorg+","+i.colorb+")";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(i.endX,i.endY);
            ctx.stroke();
        }
    }
});