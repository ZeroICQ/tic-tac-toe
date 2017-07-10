"use strict"
$(document).ready(function() {
    const CROSS = 1;
    const ZERO = -1;
    const FREE = 0;

    const GAME_END = 0;
    const AI_TURN = 1;
    const HUMAN_TURN = 2;
    const TIE = 3;

    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand; 
    }

    function setCross(cell) {
        cell.html("<img style='display:none' src='img/cross.png'>");
		cell.find("img").fadeIn(200);
        console.log('set cross');
    }

    function setZero(cell) {
        cell.html("<img style='display:none' src='img/zero.png'>");
		cell.find("img").fadeIn(200);
        console.log('set zero');
    }


    var EasyAi = function () {};

    EasyAi.prototype.getWinTurn = function(cellState, game){
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                if (cellState[i][j] === FREE) {
                    cellState[i][j] = ZERO;
                    if (game.checkWin()) {
                        cellState[i][j] = FREE;
                        return [i, j];
                    }
                    else 
                        cellState[i][j] = FREE;
                }
            }
        }
        return false;
    };

    EasyAi.prototype.getRandomTurn = function(cellState, game){
        var randCell = randomInteger(1, 9 - game.turnCount);
        var c = 0;
        for (let y = 0; y < 3; ++y) {
            for (let x = 0; x < 3; ++x) {
                if (cellState[x][y] === FREE)
                    c++;

                if (c === randCell) {
                    return [x, y];
                }
            }
        }
    };

    EasyAi.prototype.makeTurn = function(game) {
        var that = this;
        console.log("easy ai")
        setTimeout(function (game) {
            var cellState = game.cellState;
            var aiWinTurn = that.getWinTurn(cellState, game);

            if (aiWinTurn)
                game.makeTurn(aiWinTurn[0], aiWinTurn[1]);
            else {
                var randTurn = that.getRandomTurn(cellState, game);
                game.makeTurn(randTurn[0], randTurn[1]);
            }
        }, randomInteger(200, 2000), game);
    };

    var HardAI = function() {
        EasyAi.call(this);
    };

    HardAI.prototype = Object.create(EasyAi.prototype);

    HardAI.prototype.getHumanWinTurn = function(cellState, game){
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                if (cellState[i][j] === FREE) {
                    cellState[i][j] = CROSS;
                    if (game.checkWin()) {
                        cellState[i][j] = FREE;
                        return [i, j];
                    }
                    else 
                        cellState[i][j] = FREE;
                }
            }
        }
        return false;
    };

    HardAI.prototype.makeTurn = function(game){
        var that = this;
        console.log("hard ai")
        setTimeout(function (game) {
            var cellState = game.cellState;
            var aiWinTurn = that.getWinTurn(cellState, game);
            var humanWinTurn = that.getHumanWinTurn(cellState, game);

            if (aiWinTurn)
                game.makeTurn(aiWinTurn[0], aiWinTurn[1]);
            else if (humanWinTurn) 
                game.makeTurn(humanWinTurn[0], humanWinTurn[1]);
            else {
                var randTurn = that.getRandomTurn(cellState, game);
                game.makeTurn(randTurn[0], randTurn[1]);
            }
        }, randomInteger(500, 2000), game);
    };

    var Player = function (game) {
        $(".game-cell").click(function(event) {
            var id = ($(this).attr("id")).split("-");
            game.userClick(id[1], id[2]);
        });
    };

    Player.prototype.clearListeners = function(argument){
        $(".game-cell").off('click');
    };

    var Game = function(ttt, AI) {
        this.ttt = ttt; 
        this.AI = AI;
        this.cellState = [[], [], []];
        this.gameState = HUMAN_TURN;
        this.turnCount = 0;

        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {   
                this.cellState[i][j] = FREE;
            }
        }
    };

    Game.prototype.userClick = function(x, y){
        console.log('user clicked '+x+' '+y);
        if (this.gameState === HUMAN_TURN)
            this.makeTurn(x, y);
    };
    Game.prototype.makeTurn = function(x, y){
        if (this.gameState === GAME_END)
            return;

        var cell = $("#c-"+x+"-"+y);

        if (this.gameState === HUMAN_TURN) {
            if(this.cellState[x][y] === FREE) {
                this.cellState[x][y] = CROSS;
                setCross(cell);
            }
            else
                return;
        }
        else if (this.gameState === AI_TURN) {
            console.log('comp end thinking');
            
            this.cellState[x][y] = ZERO; 
            setZero(cell);
        }

        ttt.redrawPossibleTurns(this.cellState);

        if(this.checkWin() === true) {
            this.end();
            return;
        }
        else if (this.turnCount === 8) {//last turn
            this.end(TIE)
            return;
        }
        //change turn
        if (this.gameState === HUMAN_TURN) {
            this.gameState = AI_TURN;
            console.log('comp start thinking');
            this.ttt.setAIThinking();
            this.AI.makeTurn(this);
        }
        else if (this.gameState === AI_TURN) {
            ttt.setAIDefault();
            this.gameState = HUMAN_TURN;
        }

        this.turnCount++;

    };

    Game.prototype.start = function(argument){
        ttt.redrawPossibleTurns(this.cellState);
    };

    Game.prototype.end = function(isTie = 0){
        if (isTie)
            this.ttt.end(TIE);
        else
            this.ttt.end((this.gameState === HUMAN_TURN ? 1 : 0));
        this.gameState = GAME_END;
    };

    Game.prototype.checkWin = function(argument){
        var cellState = this.cellState;
        for (let i = 0; i < 3; ++i)
            if(checkRow(i) || checkColl(i))
                return  true;

        var a = cellState[0][0] === cellState[1][1];
        var b = cellState[1][1] === cellState[2][2];
        var c = cellState[1][1] !== 0;

        var d = cellState[0][2] === cellState[1][1];
        var e = cellState[1][1] === cellState[2][0];
        //diagonal
        if ((a && b && c) || (d && e && c)) {
            return true;
        }

        return false;
    
    
        function checkRow(row) {
            return cellState[row][0] === cellState[row][1] 
                && cellState[row][1] === cellState[row][2]
                && cellState[row][0] !== FREE;
        };

        function checkColl(coll) {
            return cellState[0][coll] === cellState[1][coll] 
                && cellState[1][coll] === cellState[2][coll]
                && cellState[0][coll] !== FREE;
        };
    };

    var TTT = function() {
        //is ok?
        var ttt = this;
        this.AIChoose = 0;
        this.AI = [EasyAi, HardAI];
        $('#play-btn').click(function () {ttt.start()});
        $("#ai-choose button").click(function(event) {
            $("#ai-choose button").removeClass('active-btn');
            $(this).addClass('active-btn');
            ttt.AIChoose = ($(this).attr("id").split("-"))[1];
        });
    };


    TTT.prototype.showMenu = function () {
        console.log('show menu');
        var menu = $("#menu");

        menu.finish().show(0)
        console.log('finished?');

        menu.animate({'top': '0px'}, 1000);
    }

    TTT.prototype.hideMenu = function() {
        var menu = $("#menu");

        console.log('hide menu');
        menu.animate({'top': '-512px'}, 1000, function() {
            menu.hide(0)
            $("#win").hide(0);
            $("#loose").hide(0);
            $("#tie").hide(0);
        });
    };

    TTT.prototype.start = function() {
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {   
                $('#c-'+j+'-'+i).html('')
            }
        }
        this.setAIDefault();
        this.hideMenu();
        var ai = new this.AI[this.AIChoose]();
        var game = new Game(this, ai);
        this.player = new Player(game);
        game.start();
    };

    TTT.prototype.end = function(status){
        var ttt = this;
        this.player.clearListeners();
        setTimeout(function () {
            ttt.showMenu();
        }, 200);

        switch (status) {
            case 1:
                $("#win").show(0);
                this.setAILost();
                break;
            case 0:
                $("#loose").show(0);
                this.setAIWon();
                break;
            case 3:
                $("#tie").show(0);
                break;
            default:
                break;
        }
    
    };

    TTT.prototype.redrawPossibleTurns = function(cellState){ 
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {   
                if(cellState[i][j] === FREE) 
                    $('#c-'+i+'-'+j).addClass('highlight');
                else
                    $('#c-'+i+'-'+j).removeClass('highlight');
            }
        }
    };

    TTT.prototype.setAIThinking = function(){
        $('#enemy').css('background-image', 'url("img/enemy-think.png")');
    };

    TTT.prototype.setAIDefault = function(){
        $('#enemy').css('background-image', 'url("img/enemy-default.png")');
    };

    TTT.prototype.setAILost = function(){
        $('#enemy').css('background-image', 'url("img/enemy-lost.png")');
    };

    TTT.prototype.setAIWon = function(){
        $('#enemy').css('background-image', 'url("img/enemy-won.png")');
    };

    var ttt  = new TTT();
    // ttt.start();
});
