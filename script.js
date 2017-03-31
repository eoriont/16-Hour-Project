$(document).ready(function() {
    var mouseDown;
    var cv = {
        canvas : document.createElement("canvas"),
        render : function() {
            this.canvas.width = document.body.clientWidth;
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
    drawGrid();
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
    var isDecimal = false;

    function Line(coord1, coord2) { 
        this.color = {
            r: color.r,
            g: color.g,
            b: color.b
        }

        this.size = 2;

        this.startCoord = coord1;
        this.endCoord = coord2;
        this.id = lines.length;
        this.ick = false;
    }

    $(c).mousemove(mouseMove);
    c.addEventListener('mousedown', function(evt) {
        mousePos.lastX=evt.clientX-c.getBoundingClientRect().left;
        mousePos.lastY=evt.clientY-c.getBoundingClientRect().top;
        lastLine=mousePos;
        mouseDown=true;
    });

    c.addEventListener('mouseup', function() {
        let line = new Line(new Coord(mousePos.lastX, mousePos.lastY), new Coord(mousePos.x, mousePos.y));
        line.ick = true;
        pushLine(line);
        drawLines();
        mouseDown=false;
    });

    function getMousePos(canvas, evt) {
        let rect = c.getBoundingClientRect();
        return {
            lastX: mousePos.lastX,
            lastY: mousePos.lastY,
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
        appendLine(line);
    }

    function appendLine(line) {
        var coord1 = "("+line.startCoord.x+","+line.startCoord.y+")";
        var coord2 = "("+line.endCoord.x+","+line.endCoord.y+")";
        $("#lines").append('<tr><td>'+coord1+'</td><td>'+coord2+'</td><td><p>'+getEquation(line)+'</p></td><td><input type="submit" value="X" id="deleteLine" lineid="'+line.id+'" class="delete"></td></tr>');
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,$("p:last")[0]]);
    }

    function getEquation(line) {
        let coord1 = new Coord(line.startCoord.x, line.startCoord.y);
        let coord2 = new Coord(line.endCoord.x, line.endCoord.y);
        let cy = coord1.y-coord2.y;
        let cx = coord1.x-coord2.x;
        let m = (cy/cx);
        if (line.ick) m = -(cy/cx);
        let part = m * coord1.x;
        let b = coord1.y - part;

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

    function getLineFromEquation(oldEquation) {
        let equation = oldEquation.replace(/\s/g, '');
        let m = equation.substr(2, equation.indexOf('x')-2);
        let b = parseInt(equation.substr(2+m.length+2, equation.length));
        m = parseInt(m);

        let x1 = 0;
        let y1 = m * x1 + b;

        let x2 = -1000;
        let y2 = m * x2 + b;

        let middle = {
            x: c.width / 2,
            y: c.height / 2
        }

        x1 = x1+middle.x;
        y1 = y1+middle.y;

        x2 = x2+middle.x;
        y2 = y2+middle.y;

        let line = new Line(new Coord(x1, y1), new Coord(x2, y2));
        return line;
    }
    $("#equationInput").on('keyup', function(e) {
        if (e.keyCode == 13) { //13 = enter
            let str = $("#equationInput").val();
            let line = getLineFromEquation(str);
            pushLine(line);
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
        ctx.clearRect(0, 0, c.width, c.height);
        drawGrid();

        for(var num = 0; num < lines.length; num++) {
            i=lines[num]
            ctx.beginPath();
            ctx.moveTo(i.startCoord.x, i.startCoord.y);
            ctx.strokeStyle = "rgb("+i.color.r+","+i.color.g+","+i.color.b+")";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(i.endCoord.x,i.endCoord.y);
            ctx.stroke();
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

        for(let i = 0; i < numOfGridLinesX; i++) {
            let y = i*(height/numOfGridLinesX)
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.strokeStyle = "#a9cfd1";
            if(i == numOfGridLinesX/2) ctx.strokeStyle = "#6f8889";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        for(let i = 0; i < numOfGridLinesY; i++) {
            let x = i*(width/numOfGridLinesY)
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.strokeStyle = "#a9cfd1";
            if(i == numOfGridLinesY/2) ctx.strokeStyle = "#6f8889";
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalCompositeOperation = "source-over";
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    function getCoords(coord) {
        let mid = {
            x: c.width / 2,
            y: c.height / 2
        };
        let coords = new Coord(coord.x+mid.x, coord.y-mid.y);
        return coords;
    }

    function ungetCoords(coord) {
         let mid = {
            x: c.width / 2,
            y: c.height / 2
        };

        let coords = new Coord(coord.x-mid.x, coord.y+mid.y);
        return coords;
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