$(document).ready(function() {
    var mouseDown;
    var cv = {
        canvas : document.createElement("canvas"),
        render : function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas, document.body.childNodes[1]);
        }
    };
    cv.render();
    var c = cv.canvas;
    var div = document.getElementById("lines");
    var size = 2;
    var ctx = c.getContext("2d");
    ctx.translate(c.width/2, c.height/2);
    var trans = {
        x: c.width / 2,
        y: c.height / 2
    }
    drawGrid();
    var mousePos = {
        lastX: 0,
        lastY: 0,
        x: 0,
        y:0
    };
    var color = {
        r: 0,
        g: 0,
        b: 0
    }
    var lines = [];
    var isDecimal = false;

    function Line(coord1, coord2) { 
        this.color = {
            r: color.r,
            g: color.g,
            b: color.b
        }

        this.equation = {
            fin: false,
            m: 0,
            b: 0
        }
        this.size = 2;

        this.startCoord = coord1;
        this.endCoord = coord2;
        this.id = lines.length;
        this.ife = false;
    }

    $(c).mousemove(mouseMove);
    c.addEventListener('mousedown', function(evt) {
        let mp = getMousePos(evt);
        let rect = c.getBoundingClientRect();
        mousePos.lastX = mp.x;
        mousePos.lastY = mp.y;
        mouseDown = true;
        drawMousePos();
    });

    function drawMousePos() {
        ctx.font = "30px Arial";
        let c = new Coord(mousePos.x, mousePos.y);
        let wc = getWierdCoord(c);
        ctx.fillText(wc.x+", "+wc.y,c.x,c.y);
    }

    c.addEventListener('mouseup', function() {
        let line = new Line(new Coord(mousePos.lastX, mousePos.lastY), new Coord(Math.round(mousePos.x), Math.round(mousePos.y)));
        pushLine(line);
        drawLines();
        mouseDown=false;
    });

    function getMousePos(evt) {
        let rect = c.getBoundingClientRect();
        var mp = {
            lastX: mousePos.lastX,
            lastY: mousePos.lastY,
            x: evt.clientX - rect.left - trans.x,
            y: evt.clientY - rect.top - trans.y
        }
        return mp;
    }

    function mouseMove(evt) {
        mousePos = getMousePos(evt);
        drawLines();
        drawMousePos();
        

        ctx.beginPath();
        ctx.moveTo(mousePos.lastX, mousePos.lastY);
        ctx.strokeStyle = "rgb("+color.r+","+color.g+","+color.b+")";

        if(mouseDown) {
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(mousePos.x,mousePos.y);
            ctx.stroke();

            drawEquation();
        }
    }

    function drawEquation() {
        let l = new Line(new Coord(mousePos.lastX, mousePos.lastY), new Coord(mousePos.x, mousePos.y));
        let equation = getEquationDecimal(l);
        ctx.font = "30px Arial";
        ctx.fillText(equation, mousePos.x, mousePos.y+30)
    }

    function pushLine(line) {
        lines.push(line);
        appendLine(line);
    }

    function appendLine(line) {
        var l = line;
        var wc1 = getWierdCoord(l.startCoord);
        var wc2 = getWierdCoord(l.endCoord);;
        var coord1 = "("+wc1.x+","+wc1.y+")";
        var coord2 = "("+wc2.x+","+wc2.y+")";
        $("#lines").append('<tr><td>'+coord1+'</td><td>'+coord2+'</td><td><p>'+getEquation(l)+'</p></td><td><input type="submit" value="X" id="deleteLine" lineid="'+line.id+'" class="delete"></td></tr>');
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,$("p:last")[0]]);
    }

    function getWierdCoord(coord) {
        let y = coord.y;
        let newY = y;
        newY = newY.toString();
        if (y < 0) {
            newY = newY.substr(1, newY.length);
        } else if (y == 0) {
            
        } else if (y > 0) {
            newY = "-"+newY;
        }
        newY = parseInt(newY);
        
        let newCoord = new Coord(coord.x, newY);
        return newCoord;
    }

    function getEquation(line) {
        if (line.equation.fin) {
            let e = "y = "+line.equation.m+"x + "+line.equation.b;
            return e;
        }
        let coord1 = getSuperWierdCoord(line.startCoord);
        let coord2 = getSuperWierdCoord(line.endCoord);
        let cy = coord1.y-coord2.y;
        let cx = coord1.x-coord2.x;
        let m = -(cy/cx);
        let b = (coord1.y - (-m*coord1.x));
        if (line.ife) b = -b;

        let stringm = m;
        let stringb = b;
        if(!isDecimal) {
            let mtf = decimalToFraction(m);
            let btf = decimalToFraction(b);
            if (mtf["denominator"] == 1) {
                stringm = m;
            } else {
                let whole = mtf["whole"];
                if(whole == 0) {
                    stringm = "\\("+mtf["numerator"]+" \\over "+mtf["denominator"]+"\\)";
                } else {
                    stringm = mtf["whole"]+"\\("+mtf["numerator"]+" \\over "+mtf["denominator"]+"\\)";
                }
            }

            if (btf["denominator"] == 1) {
                stringb = b;
            } else {
                let whole = btf["whole"];
                if(whole == 0) {
                    stringb = "\\("+btf["numerator"]+" \\over "+btf["denominator"]+"\\)";
                } else {
                    stringb = btf["whole"]+"\\("+btf["numerator"]+" \\over "+btf["denominator"]+"\\)";
                }
            }
        }
        
        let equation = "y = "+stringm+"x + "+stringb;
        return equation;
    }

    function getEquationDecimal(line) {
        if (line.equation.fin) {
            let e = "y = "+line.equation.m+"x + "+line.equation.b;
            return e;
        }
        let coord1 = getSuperWierdCoord(line.startCoord);
        let coord2 = getSuperWierdCoord(line.endCoord);
        let cy = coord1.y-coord2.y;
        let cx = coord1.x-coord2.x;
        let m = -(cy/cx);
        let b = (coord1.y - (-m*coord1.x));
        if (line.ife) b = -b;

        let stringm = m;
        let stringb = b;
        
        let equation = "y = "+stringm+"x + "+stringb;
        return equation;
    }

    function getSuperWierdCoord(coord) {
        let y = coord.y;
        let newY = y;
        newY = newY.toString();
        if (y < 0) {
            newY = newY.substr(1, newY.length);
        } else if (y == 0) {
            
        } else if (y > 0) {
            newY = "-"+newY;
        }
        newY = parseInt(newY);

        let x = coord.x;
        let newX = x;
        newX = newX.toString();

        if (x < 0) {
            newX = newX.substr(1, newX.length);
        } else if (x == 0) {
            
        } else if (x > 0) {
            newX = "-"+newX;
        }
        newX = parseInt(newX);
        
        let newCoord = new Coord(newX, newY);
        return newCoord;
    }

    function getLineFromEquation(oldEquation) {
        let equation = oldEquation.replace(/\s/g, '');
        let m = equation.substr(2, equation.indexOf('x')-2);
        let b = parseInt(equation.substr(2+m.length+2, equation.length));
        m = parseInt(m);
        
        // if (b < 0) b-=2;
        // else if (b == 0) b=0;
        // else b+=2;

        let x1 = c.width*2;
        let y1 = m * x1 + b;

        let x2 = -c.width*2;
        let y2 = m * x2 + b;

        let line = new Line(new Coord(x1, -y1), new Coord(x2, -y2));
        //let line = new Line(new Coord(x1-(trans.x/m), c.height-y1), new Coord(x2-(trans.x/m), c.height-y2));
        line.ife = true;
        line.equation.fin = true;
        line.equation.m = m;
        line.equation.b = b;
        return line;
    }
    $("#equationInput").on('keyup', function(e) {
        if (e.keyCode == 13) { //13 = enter
            let str = $("#equationInput").val();
            let line = getLineFromEquation(str);
            pushLine(line);
            drawLines();
        }
    });

    function roundEquations() {
        clearLinesTable();
        isDecimal = !isDecimal;
        writeLinesTable();
    }

    function writeLinesTable() {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            appendLine(line);
        }
    }

    function drawLines() {
        ctx.clearRect(-c.width, c.height, c.width*2, -c.height*2);
        drawGrid();

        for(var num = 0; num < lines.length; num++) {
            i=lines[num]
            ctx.beginPath();
            // ctx.moveTo(i.startCoord.x-(c.width/2), i.startCoord.y-(c.height/2));
            ctx.moveTo(i.startCoord.x, i.startCoord.y);
            ctx.strokeStyle = "rgb("+i.color.r+","+i.color.g+","+i.color.b+")";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            //ctx.lineTo(i.endCoord.x-(c.width/2),i.endCoord.y-(c.height/2));
            ctx.lineTo(i.endCoord.x,i.endCoord.y);
            ctx.stroke();
            ctx.closePath();
        }
    }

    function decimalToFraction(decimal) {
        var d = new Fraction(decimal);
        var ans = d.toFraction(true);
        var whole = ans.substr(0, ans.indexOf(' '));
        ans = ans.substr(ans.indexOf(' '));
        var numerator = ans.substr(0, ans.indexOf('/'));

        ans = ans.substr(ans.indexOf('/'));
        var denominator = ans.substr(1, ans.length);   

        var answer = {
            whole: whole,
            numerator: numerator,
            denominator: denominator
        };
        return answer;
    }

    $("#lines").on("click", function(e) {
        if(e.target.id == "deleteLine") {
            var id = e.target.attributes[3].value;
            writeLinesWithout(id);
            drawLines();
            e.target.parentNode.parentNode.remove();
        }
    });

    $("#locrl").click(()=>{
        location.reload(true);
    });

    function writeLinesWithout(id) {
        var newlines = [];
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.id != id) {
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
            $('#round').animate({"margin-left": '-='+moveLength});
        } else {
            $('#lines-table').animate({"margin-left": '+='+moveLength});
            $('#show-lines-table').animate({"margin-left": '+='+moveLength});
            $('#round').animate({"margin-left": '+='+moveLength});
        }
    });

    $('#round').click(function() {
        roundEquations();
        if(isDecimal) {
            $('#round').val("Decimal");
        } else {
            $('#round').val("Rounded Fraction");
        }
    });

    function clearLinesTable() {
        $('#lines').children().remove();
    }

    function drawGrid() {
        let height = c.height;
        let width = c.width;

        let numOfGridLinesY = 50;
        let numOfGridLinesX = 24;

        for(let i = -numOfGridLinesX; i < numOfGridLinesX; i++) {
            let y = i*(height/numOfGridLinesX);
            
            ctx.beginPath();
            ctx.moveTo(-width, y);
            ctx.strokeStyle = "#a9cfd1";
            if(i == 0) ctx.strokeStyle = "#6f8889";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        for(let i = -numOfGridLinesY; i < numOfGridLinesY; i++) {
            let x = i*(width/numOfGridLinesY)
            ctx.beginPath();
            ctx.moveTo(x, -height);
            ctx.strokeStyle = "#a9cfd1";
            if(i == 0) ctx.strokeStyle = "#6f8889";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    function Coord(x, y) {
        this.x = x;
        this.y = y;

        this.add = function(coord) {
            this.x += coord.x;
            this.y -= coord.y;
        }
    }
});