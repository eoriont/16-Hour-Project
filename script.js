$(document).ready(function() {
    var mouseDown;

    var cv = {
        canvas : document.createElement("canvas"),
        render : function() {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = window.innerHeight;
            //this.canvas.style.left = '400px';
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
            endY: mousePos.y,
            id: lines.length
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
        lines.push(line);                                                            //getEquation(line)
        var coord1 = "("+line.startX+","+line.startY+")";
        var coord2 = "("+line.endX+","+line.endY+")";
        $("#lines").append('<tr><td>'+coord1+'</td><td>'+coord2+'</td><td>'+getEquation(line)+'</td><td><input type="submit" value="X" id="deleteLine" lineid="'+line.id+'" class="delete"></td></tr>');
    }

    function getEquation(line) {
        var coord1 = {x:line.startX,y:line.startY};
        var coord2 = {x:line.endX,y:line.endY};
        var cy = coord1.y-coord2.y;
        var cx = coord1.x-coord2.x;
        var m = cy/cx;
        var part = m * coord1.x;
        var b = coord1.y - part;
        if(fractionToDecimal(m*-1).length < (m*-1).length) {
            m = fractionToDecimal(m*-1);
        } else {
            m = m*-1;
        }
        if(fractionToDecimal(b).length < b.length) {
            b = fractionToDecimal(b);
        }
        var equation = "y = "+m+"x + "+b;
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

    function fractionToDecimal(fraction) {
        var gcd = function(a, b) {
        if (b < 0.0000001) return a;

        return gcd(b, Math.floor(a % b));
        };
        var len = fraction.toString().length - 2;

        var denominator = Math.pow(10, len);
        var numerator = fraction * denominator;

        var divisor = gcd(numerator, denominator);

        numerator /= divisor;
        denominator /= divisor;

        var answer;
        if(Math.floor(denominator) == 1) {
            answer = Math.floor(numerator);
        } else if(Math.floor(denominator) == -1) {
            answer = Math.floor(numerator)*-1;
        } else {
            answer = Math.floor(numerator) + '/' + Math.floor(denominator);
        }
        return answer;
    }

    $("#lines").on("click", function(e) {
        if(e.target.id == "deleteLine") {
            var id = e.target.attributes[3].value;
            writeLinesWithout(id);
            //console.log(lines);
            drawLines();
            e.target.parentNode.parentNode.remove();
            
        }
    });

    function writeLinesWithout(id) {
        var newlines = [];
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(!(line.id == id)) {
                newlines.push(line);
            }
        }
        lines = newlines;
    }

    $('#show-lines-table').click(function() {
        var moveLength = 400;
        $("#lines-table").css("width", moveLength+"px");
        $("#lines-table").css("left", 225-moveLength+"px");
        $(".lines-tab").css("left", 30+"px")
        if($(this).css("margin-left") == moveLength+"px") {
            $('#lines-table').animate({"margin-left": '-='+moveLength});
            $('#show-lines-table').animate({"margin-left": '-='+moveLength});
        } else {
            $('#lines-table').animate({"margin-left": '+='+moveLength});
            $('#show-lines-table').animate({"margin-left": '+='+moveLength});
        }
    });
});