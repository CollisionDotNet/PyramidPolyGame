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


class Index {
    static logoUIElement = document.getElementById('gamelogo');
    static logoInterval;
    static letterCount = 0;
    static logoLetters = ['П', 'И', 'Р', 'А', 'М', 'И', 'Д', 'К', 'А'];
    static nameLabelUIElement = document.getElementById('namelabel');
    static nameUIElement = document.getElementById('namefield');
    static continueButton = document.getElementById('continuebtn');

    static Init() {       
        Index.continueButton.disabled = true;
        Index.nameUIElement.oninput = function () { Index.nameUIElement.value.length == 0 ? Index.continueButton.disabled = true : Index.continueButton.disabled = false; };
        Index.initStartScreen();
        Index.continueButton.onclick = Index.onContinueButtonClick;
    }

    static initStartScreen() {
        Index.logoInterval = setInterval(Index.createLogoLetter, 1000);
    }
    static createLogoLetter() {
        Index.letterCount++;
        let letter = document.createElement('div');
        letter.className = 'gamefont logoletter';
        letter.style.height = 160 - 10 * Index.letterCount + 'px';
        letter.innerHTML = Index.logoLetters[Index.letterCount - 1];
        letter.style.backgroundColor = Helper.getRandElement(['red', 'yellow', 'green', 'blue']);
        Index.logoUIElement.appendChild(letter);
        letter.style.borderRadius = (letter.clientWidth / 2) + 'px';
        if (Index.letterCount == 1)
            document.getElementById('gamelogobase').style.marginLeft = 'calc(50% - ' + letter.clientWidth * 4.5 + 'px)';
        if (Index.letterCount >= Index.logoLetters.length)
            clearInterval(Index.logoInterval);

    }
    static onContinueButtonClick() {
        localStorage.setItem('playername', Index.nameUIElement.value);
        window.location.href = 'html/game.html';
    }
} 

Index.Init();

