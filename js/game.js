
$(document).ready(function() {
    const CROSS = 1;
    const ZERO = -1;
    const FREE = 0;

    const GAME_END = 0;
    const AI_TURN = 1;
    const HUMAN_TURN = 2;

    var cellState = [[], [], []];
    var gameState;
    var turnCount;

    initialize();

    $(".game-cell").click(function(event) {
        var id = ($(this).attr("id")).split("-");
        userClick($(this), id[1], id[2]);
    });

    $('#restart').click(initialize);

    function initialize() {
        turnCount = 0;
        gameState = HUMAN_TURN;
        hideMenu();
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 3; ++j) {
                cellState[i][j] = FREE;
                $('#c-'+j+'-'+i).text('')
            }
    }

    function userClick(cell, x, y) {
        if (gameState !== HUMAN_TURN)
            return;

        console.log("user clicked: " + x + y);
        if (cellState[x][y] === FREE) {
            makeTurn(x, y, 1);
            AITurn();
        }
    }


    function makeTurn(x, y, isHuman = 0) {
        var cell = $("#c-"+x+"-"+y);

        if (isHuman) {
            cellState[x][y] = CROSS;
            cell.text("X");
            gameState = AI_TURN;
        }
        else {
            cellState[x][y] = ZERO;
            cell.text("O");
            gameState = HUMAN_TURN;
        }

        if (checkWin()) 
            endGame(isHuman);

        turnCount++;
    }

    function AITurn() {
        if (gameState !== AI_TURN)
            return;

        var ai = easyAI;
        ai();
    }

    function easyAI() {
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 3; ++j) {
                if (cellState[i][j] === FREE) {
                    cellState[i][j] = ZERO;
                    if (checkWin()) {
                        makeTurn(i, j);
                        return;
                    }
                    else 
                        cellState[i][j] = FREE;
                }
            }

        var randCell = randomInteger(1, 9 - turnCount);
        var c = 0;
        for (let y = 0; y < 3; ++y)
            for (let x = 0; x < 3; ++x) {
                if (cellState[x][y] === FREE)
                    c++;

                if (c === randCell) {
                    makeTurn(x,y);
                    return;
                }
            }
    }

    function endGame(isHumanWin) {
        gameState = GAME_END;
        console.log('HUMAN WIN' + isHumanWin);
        showMenu();
    }

    function checkWin() {
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
    }
    
    function checkRow(row) {
        return cellState[row][0] === cellState[row][1] 
            && cellState[row][1] === cellState[row][2]
            && cellState[row][0] !== FREE;
    }

    function checkColl(coll) {
        return cellState[0][coll] === cellState[1][coll] 
            && cellState[1][coll] === cellState[2][coll]
            && cellState[0][coll] !== FREE;
    }

    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    }


    function showMenu() {
        console.log('show menu');
        var menu = $("#menu");
        if (menu.is(":visible"))
            return;

        menu.show(0)
        menu.animate({'top': '0%'}, 1000);
    }

    function hideMenu() {
        var menu = $("#menu");
        if (menu.is(":hidden"))
            return;
        console.log('hide menu');
        menu.animate({'top': '-100%'}, 1000, function() {menu.hide(0)});
    }
});

// function showMenu() {
//     console.log('show menu');
//     $("#menu").animate({'top': '0%'}, 500);
// }

// function hideMenu() {
//     console.log('hide menu');
//     $("#menu").animate({'top': '-100%'}, 500);
// }