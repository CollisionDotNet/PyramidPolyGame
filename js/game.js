class Helper { 
    
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    static getRandElement(arr) {
        return arr[Helper.getRandomInt(0, arr.length)];
    }

    static tickToTime(tick) {
        let secs = Math.floor(tick / 1000);
        return secs;
    }
}

class Game {
    //#region gameWindow
    //game window and its scales shortcuts
    static gameWindow = document.getElementById('gamewindow');
    static get windowTopBorder() { return 0; }
    static get windowBottomBorder() { return Game.gameWindow.getBoundingClientRect().height; }
    static get windowLeftBorder() { return 0; }
    static get windowRightBorder() { return Game.gameWindow.getBoundingClientRect().width; }
    //#endregion

    //#region temp 
    static gameObjects = [];
    static curLevel;
    static gameTimer;
    static levelScore;
    static totalScore;
    static states = { help: 1, game: 2, pause: 3, result: 4 };

    static curState;

    static players;

    static decreasingPortal;
    static increasingPortal;
    static tickInterval;
    //#endregion

    //#region gameplay Values
    //gameplay influencing values
    static get portalMovementSpeed() { return 10; }

    static defaultGravity;
    static gravityMultiplier = 1;
    static get gravity() { return Game.defaultGravity * Game.gravityMultiplier }

    static defaultPyramidSpeed;
    static pyramidSpeedMultiplier = 1;
    static get pyramidSpeed() { return Game.defaultPyramidSpeed * Game.pyramidSpeedMultiplier }

    static get tickTime() { return 16; }
    static diskSpawnRate = 0.05;
    static bonusSpawnRate = 0.01;

    static disksArbitraryOrder;
    //#endregion

    //#region Keys
    //key code consts and pressed keys array
    static get upKeyCode() { return 87; }
    static get downKeyCode() { return 83; }
    static get leftKeyCode() { return 65; }
    static get rightKeyCode() { return 68; }
    static get escKeyCode() { return 27; }

    static pressedKeys = {};
    //#endregion

    //#region UI Elements
   
    static continueButton = document.getElementById('continuebtn');

    static gameInfoUIElement = document.getElementById('gameinfo');
    static levelUIElement = document.getElementById('levelinfo');
    static timeUIElement = document.getElementById('timeinfo');
    static scoreUIElement = document.getElementById('scoreinfo');
    static totalScoreUIElement = document.getElementById('totalscoreinfo');

    static resultUIElement = document.getElementById('gameresult');
    static helpUIElement = document.getElementById('gamehelp');

    //#region help reps
    static level1rep1 = 'Добро пожаловать в игру "Пирамидка"! В этой игре вам необходимо управлять пирамидкой, ловя диски, которые падают с неба.';
    static level1rep2 = '<img src="../image/pyramid.png" style="vertical-align:middle; width: 10%; height: auto;"/> Это ваша пирамидка. Нажмите клавишу A, чтобы двигаться влево, и D, чтобы двигаться вправо<br/>';
    static level1rep3 = '<img src="../image/disk.png" style="vertical-align:middle; width: 10%; height: auto;"/> Это диск. Он случайно падает с неба и может иметь разный размер. Диск можно поймать пирамидкой, если она будет ровно под диском. При этом класть на пирамидку новый диск можно только если он меньше самого верхнего диска в пирамидке<br/>';
    static level1rep4 = 'Цель игры - набрать как можно больше очков. Чем больше дисков вы соберете за ограниченное время и чем большего размера они будут - тем больше очков вы получите<br/>';
    static level1rep5 = 'Всего в игре три уровня. На следующих уровнях правила будут меняться<br/>';
    static level1rep6 = 'Удачи!';

    static level2rep1 = 'Уровень 2';
    static level2rep2 = 'На втором уровне кроме дисков с неба будут также падать бонусы. Их можно подбирать, как диски, ради временных полезных эффектов';
    static level2rep3 = '<img src="../image/cyanbonus.png" style="vertical-align:middle;"/> Голубой бонус замедляет падение всех дисков и бонусов';
    static level2rep4 = '<img src="../image/greenbonus.png" style="vertical-align:middle;"/> Зеленый бонус ускоряет движение пирамидки';
    static level2rep5 = '<img src="../image/orangebonus.png" style="vertical-align:middle;"/> Оранжевый бонус позволяет ловить диски в произвольном порядке';
    static level2rep6 = '<img src="../image/magentabonus.png" style="vertical-align:middle;"/> Фиолетовый бонус останавливает все диски и бонусы, в течении небольшого промежутка времени их можно перетаскивать на пирамидку при помощи мыши';

    static level3rep1 = 'Уровень 3';
    static level3rep2 = 'На третьем уровне появляются порталы размера. Внешне они похожи на диски, но тоньше и не подвержены гравитации. Порталы двигаются горизонтально. Есть два вида порталов:';
    static level3rep3 = '<img src="../image/bigportal.png" style="vertical-align:middle;"/> Розовый портал при соприкосновении с диском увеличивает его размер';
    static level3rep4 = '<img src="../image/smallportal.png" style="vertical-align:middle;"/> Зеленый портал при соприкосновении с диском уменьшает его размер'; 
    //#endregion
    //#endregion

    //#region Static Methods
    static Init() {
        Game.levelScore = 0;
        Game.totalScore = 0;
        Game.curLevel = 0;
        Game.curState = Game.states.help;
        Game.disksArbitraryOrder = false;
        Game.continueButton.onclick = Game.onContinueButtonClick;        
        Game.openHelp();       
    }  

    static onContinueButtonClick() {                                    
        if (Game.curState == Game.states.result) {
            Game.closeResult();
            Game.openHelp();
        }                  
        else if (Game.curState == Game.states.help) {
            Game.closeHelp();
            Game.startLevel();
        }
    }

    static loadDataToJSON(content, fileName, contentType) {       
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    static openHelp() {
        Game.curState = Game.states.help;
        Game.helpUIElement.style.display = 'block';
        Game.curLevel++;
        let curline;
        switch (Game.curLevel) {            
            case 1:
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep1;
                curline.className = 'gamefont helpline centering';
                curline.style.textAlign = 'center';
                curline.style.fontSize = 'calc(20px + 20%)'
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep2;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep3;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep4;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep5;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level1rep6;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                break;
            case 2:
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep1;
                curline.className = 'gamefont helpline centering';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep2;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep3;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep4;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep5;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level2rep6;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                break;
            case 3:
                curline = document.createElement('div');
                curline.innerHTML = Game.level3rep1;
                curline.className = 'gamefont helpline centering';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level3rep2;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level3rep3;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                curline = document.createElement('div');
                curline.innerHTML = Game.level3rep4;
                curline.className = 'gamefont helpline';
                Game.helpUIElement.appendChild(curline);
                break;

        }      
        Game.continueButton.innerHTML = 'Играть';
    }

    static closeHelp() {
        Game.helpUIElement.innerHTML = '';
        Game.helpUIElement.style.display = 'none';
    }

    static startLevel() {
        Game.curState = Game.states.game;
        Game.continueButton.style.display = 'none';
        Game.gameWindow.style.width = '90%';
        Game.gameInfoUIElement.style.display = 'block';
        Game.levelScore = 0;
        Game.gameTimer = 30000;
        new Pyramid(0, 0, Pyramid.pyramidWidth, Pyramid.pyramidHeight);
        Pyramid.instance.centerX = Game.windowRightBorder / 2;
        Pyramid.instance.y = Game.windowBottomBorder - Pyramid.pyramidHeight;
        
        Game.tickInterval = setInterval(Game.Tick, Game.tickTime);
        switch (Game.curLevel) {
            case 1:
                Game.defaultGravity = 7;
                Game.defaultPyramidSpeed = 8;
                break;
            case 2:
                Game.defaultGravity = 8;
                Game.defaultPyramidSpeed = 7;
                break;
            case 3:
                Game.defaultGravity = 8;
                Game.defaultPyramidSpeed = 6;
                Game.decreasingPortal = new SizePortal(0, Game.windowBottomBorder / 2 - 100, SizePortal.types.decreasing, SizePortal.directions.right);
                Game.increasingPortal = new SizePortal(Game.windowRightBorder - 100, Game.windowBottomBorder / 2 + 100, SizePortal.types.increasing, SizePortal.directions.left);
                break;
        }
        Game.levelUIElement.innerHTML = 'Уровень: ' + Game.curLevel;
        Game.timeUIElement.innerHTML = 'Времени осталось: ' + Helper.tickToTime(Game.gameTimer);
        Game.scoreUIElement.innerHTML = 'Очки: ' + Math.round(Game.levelScore);
        Game.totalScoreUIElement.innerHTML = 'Очки всего: ' + Math.round(Game.totalScore);
    }

    static endLevel() {              
        for (let i = 0; i < Game.gameObjects.length; i++) {
            Game.gameObjects[i].domElement.remove();
        }
        Game.gameObjects = [];
        Pyramid.instance = null;
        Game.decreasingPortal = null;
        Game.increasingPortal = null;        
        Game.gameWindow.style.width = '100%';
        Game.gameInfoUIElement.style.display = 'none'; 
        clearInterval(Game.tickInterval);
        switch (Game.curLevel) {
            case 1:
                localStorage.setItem('firstscore', Game.levelScore);
                break;
            case 2:
                localStorage.setItem('secondscore', Game.levelScore);
                break;
            case 3:
                localStorage.setItem('thirdscore', Game.levelScore);
                localStorage.setItem('totalscore', Game.totalScore);
                break;
        }
        Game.showResult();

    }

    static showResult() {
        Game.curState = Game.states.result;
        Game.continueButton.style.display = 'block';
        Game.resultUIElement.style.display = 'block';

        let curline = document.createElement('div');
        curline.innerHTML = 'Уровень ' + Game.curLevel + ' пройден!';
        curline.className = 'gamefont helpline centering';
        curline.style.textAlign = 'center';
        curline.style.fontSize = 'calc(26px + 20%)';
        Game.resultUIElement.appendChild(curline);

        curline = document.createElement('div');
        curline.innerHTML = 'Очки: ' + Game.levelScore;
        curline.className = 'gamefont helpline';
        curline.style.fontSize = 'calc(20px + 20%)'
        Game.resultUIElement.appendChild(curline);

        curline = document.createElement('div');
        curline.innerHTML = 'Очков всего: ' + Game.totalScore;
        curline.className = 'gamefont helpline';
        curline.style.fontSize = 'calc(20px + 20%)';
        Game.resultUIElement.appendChild(curline);

        if (Game.curLevel == 3) {

            let player = {
                name: localStorage.getItem('playername'),
                firstscore: localStorage.getItem('firstscore'),
                secondscore: localStorage.getItem('secondscore'),
                thirdscore: localStorage.getItem('thirdscore'),
                totalscore: localStorage.getItem('totalscore'),
            };
            let playersArr = JSON.parse(localStorage.getItem('players'));
            if (playersArr === null)
                playersArr = [];
            playersArr.push(JSON.stringify(player));
            localStorage.setItem('players', JSON.stringify(playersArr));

            Game.continueButton.innerHTML = 'Открыть рейтинг';
            Game.continueButton.onclick = function () { window.location.href = '../html/rating.html'; };
        }
        else {
            Game.continueButton.innerHTML = 'Далее';
        }
    }

    static closeResult() {
        Game.resultUIElement.innerHTML = '';
        Game.resultUIElement.style.display = 'none';
    }

    static Tick() {
        //#region pressed Keys Calculation
        window.onkeyup = function (e) {
            if (e.keyCode == Game.escKeyCode) {
                if (Game.curState == Game.states.game)
                    Game.curState = Game.states.pause;
                else if (Game.curState == Game.states.pause)
                    Game.curState = Game.states.game;
            }

            Game.pressedKeys[e.keyCode] = false;
        }

        window.onkeydown = function (e) {
            Game.pressedKeys[e.keyCode] = true;
        }
        //#endregion

        if (Game.curState == Game.states.game) {
            Game.gameTimer -= Game.tickTime;
            if (Game.gameTimer < 0) {
                Game.endLevel();
                return;
            }
            Game.timeUIElement.innerHTML = 'Времени осталось: ' + Helper.tickToTime(Game.gameTimer);
            for (let i = 0; i < Game.gameObjects.length; i++) {
                if (Game.gameObjects[i].domElement.classList.contains('gravitable')) {
                    Game.gameObjects[i].y += Game.gravity;
                    if (Game.gameObjects[i].y > Game.windowBottomBorder) {
                        Game.gameObjects[i].Kill();
                        continue;
                    }
                    if (Game.curLevel == 3 && Game.gameObjects[i].domElement.classList.contains('disk')) {
                        if (GameObject.Intersects(Game.gameObjects[i], Game.decreasingPortal))
                            Game.gameObjects[i].width = Math.max(Disk.diskMinWidth, Game.gameObjects[i].width * 0.97);
                        else if (GameObject.Intersects(Game.gameObjects[i], Game.increasingPortal))
                            Game.gameObjects[i].width = Math.min(Disk.diskMaxWidth, Game.gameObjects[i].width * 1.03);
                    }

                }

                if (Game.gameObjects[i].domElement.classList.contains('pickable')) { // GO is pickable
                    if (Pyramid.instance.pickHitbox.absoluteContains(Game.gameObjects[i].centerX, Game.gameObjects[i].domElement.classList.contains('draggable') ? Game.gameObjects[i].centerY : Game.gameObjects[i].bottom)) { // GO is picked
                        if (Game.gameObjects[i].domElement.classList.contains('disk') && Pyramid.instance.diskList.length < Pyramid.maxDisksCount && (Game.disksArbitraryOrder || Pyramid.instance.diskList.length == 0 || Game.gameObjects[i].width < Pyramid.instance.diskList[Pyramid.instance.diskList.length - 1].width)) {
                            Pyramid.instance.addDisk(Game.gameObjects[i]);
                            if (Pyramid.instance.diskList.length == Pyramid.maxDisksCount)
                                Game.endLevel();
                        }
                        else if (Game.curLevel >= 2 && Game.gameObjects[i].domElement.classList.contains('bonus')) {
                            Game.activateBonus(Game.gameObjects[i]);
                        }
                    }
                }
            }
            //#region pyramid Movement 
            Game.pyramidMovement();
            //#endregion
            if (Game.curLevel == 3)
                Game.portalsMovement();
            //#region disk Spawn
            if (Math.random() < Game.diskSpawnRate)
                Game.spawnRandomDisk();

            if (Game.curLevel >= 2 && Math.random() < Game.bonusSpawnRate)
                Game.spawnRandomBonus();
            //#endregion
        }

    }

    static pyramidMovement() {
        if (Game.pressedKeys[Game.leftKeyCode])
            Pyramid.instance.x -= Game.pyramidSpeed;
        if (Game.pressedKeys[Game.rightKeyCode])
            Pyramid.instance.x += Game.pyramidSpeed;
    }

    static portalsMovement() {
        // console.log(Game.decreasingPortal.x + ' ' + Game.windowRightBorder);
        if (Game.decreasingPortal.direction == SizePortal.directions.left) {
            Game.decreasingPortal.x -= Game.portalMovementSpeed;
            if (Game.decreasingPortal.x - Game.portalMovementSpeed < 0)
                Game.decreasingPortal.direction = SizePortal.directions.right;
        }
        else if (Game.decreasingPortal.direction == SizePortal.directions.right) {
            Game.decreasingPortal.x += Game.portalMovementSpeed;
            if (Game.decreasingPortal.right + Game.portalMovementSpeed > Game.windowRightBorder)
                Game.decreasingPortal.direction = SizePortal.directions.left;
        }

        if (Game.increasingPortal.direction == SizePortal.directions.left) {
            Game.increasingPortal.x -= Game.portalMovementSpeed;
            if (Game.increasingPortal.x - Game.portalMovementSpeed < 0)
                Game.increasingPortal.direction = SizePortal.directions.right;
        }
        else if (Game.increasingPortal.direction == SizePortal.directions.right) {
            Game.increasingPortal.x += Game.portalMovementSpeed;
            if (Game.increasingPortal.right + Game.portalMovementSpeed > Game.windowRightBorder)
                Game.increasingPortal.direction = SizePortal.directions.left;
        }
    }

    static spawnRandomDisk() {
        let width = Helper.getRandomInt(Disk.diskMinWidth, Disk.diskMaxWidth);
        let disk = new Disk(Helper.getRandomInt(Pyramid.leftDiskCenterSpawnBorder - width / 2, Pyramid.rightDiskCenterSpawnBorder - width / 2), -Disk.diskHeight, width, Disk.diskHeight, Helper.getRandElement(Disk.colors));
        disk.domElement.classList.add('gravitable');
    }

    static spawnRandomBonus() {
        let bonus = new Bonus(Helper.getRandomInt(Pyramid.leftDiskCenterSpawnBorder - Bonus.bonusSize / 2, Pyramid.rightDiskCenterSpawnBorder - Bonus.bonusSize / 2), -Bonus.bonusSize, Helper.getRandomInt(0, Object.keys(Bonus.types).length));
        bonus.domElement.classList.add('gravitable');
    }

    static activateBonus(obj) {
        switch (obj.bonusType) {
            case 0:
                Game.activateSlowFall();
                setTimeout(Game.deactivateSlowFall, 5000);
                break;
            case 1:
                Game.activateDisksArbitraryOrder();
                setTimeout(Game.deactivateDisksArbitraryOrder, 10000);
                break;
            case 2:
                Game.activateSpeedup();
                setTimeout(Game.deactivateSpeedup, 5000);
                break;
            case 3:
                Game.activateDragging();
                setTimeout(Game.deactivateDragging, 3000);
                break;
        }
        obj.Kill();
    }

    static activateSlowFall() {
        Game.gravityMultiplier = 0.7;
    }

    static deactivateSlowFall() {
        Game.gravityMultiplier = 1;
    }

    static activateSpeedup() {
        Game.pyramidSpeedMultiplier = 1.5;
    }

    static deactivateSpeedup() {
        Game.pyramidSpeedMultiplier = 1;
    }

    static activateDisksArbitraryOrder() {
        Game.disksArbitraryOrder = true;
    }

    static deactivateDisksArbitraryOrder() {
        Game.disksArbitraryOrder = false;
    }

    static activateDragging() {
        Game.gravityMultiplier = 0;
        Game.bonusSpawnRate = 0;
        Game.diskSpawnRate = 0;
        Pyramid.instance.pickHitbox.y -= 30;
        Pyramid.instance.pickHitbox.height += 30;
        console.log(Pyramid.instance.pickHitbox.height);
        for (let i = 0; i < Game.gameObjects.length; i++) {
            if (Game.gameObjects[i].domElement.classList.contains('disk') || Game.gameObjects[i].domElement.classList.contains('bonus'))
                Game.gameObjects[i].MakeDraggable();
        }
    }

    static deactivateDragging() {
        Game.gravityMultiplier = 1;
        Game.bonusSpawnRate = 0.01;
        Game.diskSpawnRate = 0.03;
        Pyramid.instance.pickHitbox.y += 30;
        Pyramid.instance.pickHitbox.height -= 30;
        for (let i = 0; i < Game.gameObjects.length; i++) {
            Game.gameObjects[i].MakeUndraggable();
        }
    }
    //#endregion
}

class GameObject {

    //#region Static Methods
    static Intersects(obj1, obj2) {

        if (obj1.x == obj1.right || obj1.y == obj1.bottom || obj2.x == obj2.right || obj2.y == obj2.bottom) {
            return false;
        }

        if (obj1.x > obj2.right || obj2.x > obj1.right) {
            return false;
        }

        if (obj1.bottom < obj2.y || obj2.bottom < obj1.y) {
            return false;
        }

        return true;
    }
    //#endregion

    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.yBoundsIgnore = false;
        this.xBoundsIngore = false;
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gameobject');
        this.domElement.style.left = x + 'px';
        this.domElement.style.top = y + 'px';
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
        Game.gameWindow.appendChild(this.domElement);
        Game.gameObjects.push(this);
    }

    //#region Accessors
    get absX() {
        return Pyramid.instance.x + this._x;
    }

    get absY() {
        return Pyramid.instance.y + this._y;
    }


    get x() {
        return this._x;
    }
    set x(value) { //out of bounds check for x
        if (value == this._x)
            return;
        if (!this.xBoundsIngore) {
            if (value < 0)
                value = 0;
            if (value + this._width > Game.windowRightBorder)
                value = Game.windowRightBorder - this._width;
        }
        this._x = value;
        this.domElement.style.left = value + 'px';
    }

    get y() {
        return this._y;
    }
    set y(value) {
        if (value == this._y)
            return;
        if (!this.yBoundsIgnore) { //out of bounds check for y, depends on type of game object
            if (value < 0)
                value = 0;
            if (value + this._height > Game.windowBottomBorder)
                value = Game.windowBottomBorder - this._height;
        }
        this._y = value;
        this.domElement.style.top = value + 'px';
    }

    get width() {
        return this._width;
    }
    set width(value) {
        if (value <= 0 || value == this._width)
            return;
        //left side get more of width, lose less of width
        let widthChange = value - this._width;
        let leftWidthChange = Math.ceil(widthChange / 2);
        let rightWidthChange = Math.floor(widthChange / 2);
        let newLeft = this._x - leftWidthChange;
        let newRight = this.right + rightWidthChange
        if (newLeft < 0 || newRight > Game.windowRightBorder)
            return;
        this.x = newLeft;
        this._width = value;
        this.domElement.style.width = this._width + 'px';
    }

    get height() {
        return this._height;
    }
    set height(value) {
        console.log(value);
        this._height = value;
        this.domElement.style.height = this._height + 'px';
        console.log(this.domElement.style.height);
    }

    get right() {
        return this._x + this._width;
    }

    get bottom() {
        return this._y + this._height;
    }

    get centerX() {
        return this._x + this._width / 2;
    }
    set centerX(value) {
        this.x = value - this._width / 2;
    }

    get centerY() {
        return this._y + Math.floor(this.height / 2);
    }
    set centerY(value) {
        this.y = value - this._height / 2;
    }
    //#endregion

    //#region Methods
    absoluteContains(x, y) { //Checks if point is in game object hitbox
        return x >= this.absX && x <= this.absX + this.width && y >= this.absY && y <= this.absY + this.height;
    }    

    MakeDraggable() {
        var gameObj = this;
        var mouseX = 0, mouseY = 0;
        this.domElement.classList.add('draggable');
        this.domElement.onmousedown = dragMouseDown;

        function dragMouseDown(e) {            
            e = e || window.event;
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            let mouseXOffset = e.clientX - mouseX;
            let mouseYOffset = e.clientY - mouseY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            let newPosX = gameObj.x + mouseXOffset;
            let newPosY = gameObj.y + mouseYOffset;
            if (newPosX >= 0 && newPosX + gameObj.width <= Game.windowRightBorder)
                gameObj.x += mouseXOffset;
            if (newPosY >= 0 && newPosY + gameObj.height <= Game.windowBottomBorder)
                gameObj.y += mouseYOffset;
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    MakeUndraggable() {
        this.domElement.classList.remove('draggable');
        document.onmouseup = null;
        document.onmousemove = null;
        this.domElement.onmousedown = null;
    }

    Kill() {        
        this.domElement.remove();
        const index = Game.gameObjects.indexOf(this);
        if (index > -1)
            Game.gameObjects.splice(index, 1);
    }
    //#endregion
}

class Disk extends GameObject{
    //#region Consts
    static get diskMinWidth() { return 100; }
    static get diskMaxWidth() { return 300; }
    static get diskHeight() { return 50; }
    static get colors() { return ['red', 'yellow', 'green', 'blue']; }   
    //#endregion
    
    constructor(x, y, width, height, color) {
        super(x, y, width, height);
        this.yBoundsIgnore = true;
        this._color = color;
        this.domElement.classList.add('pickable');
        this.domElement.classList.add('disk');
        this.domElement.style.borderRadius = (Math.min(this.width, this.height) / 2) + 'px';
        this.domElement.style.backgroundColor = color;
    }
}

class Pyramid extends GameObject {
    static get maxDisksCount() { return 8; }
    static get pyramidWidth() { return Disk.diskMaxWidth; }
    static get pyramidHeight() { return 40; }
    static get axisWidth() { return 50; }
    static get axisHeight() { return Pyramid.maxDisksCount * Disk.diskHeight; }
    static get leftDiskCenterSpawnBorder() { return Pyramid.pyramidWidth / 2; }
    static get rightDiskCenterSpawnBorder() { return Game.windowRightBorder - Pyramid.pyramidWidth / 2; }
    static pickHitboxHeight = 15; 
    constructor(x, y, width, height) {
        if (Pyramid.instance)
            throw new Error('Singleton error!');
        super(x, y, width, height);
        Pyramid.instance = this;
        Pyramid.instance.domElement.classList.add('pyramid');
        Pyramid.instance.diskList = [];

        let axis = new GameObject(0, 0, Pyramid.axisWidth, Pyramid.axisHeight);
        Pyramid.instance.domElement.appendChild(axis.domElement);
        axis.yBoundsIgnore = true;
        axis.centerX = Pyramid.instance.width / 2;
        axis.y = -axis.height;
        axis.domElement.classList.add('axis');

        Pyramid.instance.pickHitbox = new GameObject(0, 0, Pyramid.axisWidth, Pyramid.pickHitboxHeight);
        Pyramid.instance.domElement.appendChild(Pyramid.instance.pickHitbox.domElement);
        Pyramid.instance.pickHitbox.yBoundsIgnore = true;
        Pyramid.instance.pickHitbox.centerX = Pyramid.instance.width / 2;
        Pyramid.instance.pickHitbox.y = -Pyramid.pickHitboxHeight;
        //Pyramid.instance.pickHitbox.domElement.style.border = '1px solid red';
    }

    addDisk(disk) {
        disk.MakeUndraggable();
        Pyramid.instance.diskList.push(disk);
        Pyramid.instance.domElement.appendChild(disk.domElement);
        disk.centerX = Pyramid.instance.width / 2;
        disk.y = -disk.height * Pyramid.instance.diskList.length;        
        disk.domElement.classList.remove('gravitable');
        Pyramid.instance.pickHitbox.y -= disk.height;
        Game.levelScore += Math.round(disk.width);
        Game.totalScore += Math.round(disk.width);
        Game.scoreUIElement.innerHTML = 'Очки: ' + Game.levelScore;
        Game.totalScoreUIElement.innerHTML = 'Очки всего: ' + Game.totalScore;
    }
}

class Bonus extends GameObject {

    static get bonusSize() { return 50; }
    static types = { slowFall: 0, arbitraryOrder: 1, speedup: 2, dragging: 3 };
    static get colors() { return ['cyan', 'orange', 'lawngreen', 'magenta']; }   

    constructor(x, y, bonustype) { //round bonuses
        super(x, y, Bonus.bonusSize, Bonus.bonusSize);
        this.yBoundsIgnore = true;
        this.domElement.classList.add('pickable');
        this.domElement.classList.add('bonus');
        this.bonusType = bonustype;
        this.domElement.style.backgroundColor = Bonus.colors[bonustype];
    }
}

class SizePortal extends GameObject {
    static get sizePortalWidth() { return 150; }
    static get sizePortalHeight() { return 30; }
    static types = { decreasing: 0, increasing: 1 };
    static directions = { left: 0, right: 1 };
    constructor(x, y, portaltype, direction) {
        super(x, y, SizePortal.sizePortalWidth, SizePortal.sizePortalHeight);
        this.portalType = portaltype;     
        this.direction = direction;
        this.domElement.style.borderRadius = (Math.min(this.width, this.height) / 2) + 'px';        
        if (portaltype == SizePortal.types.decreasing)
            this.domElement.style.backgroundColor = 'lightgreen';
        else if (portaltype == SizePortal.types.increasing)
            this.domElement.style.backgroundColor = 'lightpink';
    }
}

Game.Init();

