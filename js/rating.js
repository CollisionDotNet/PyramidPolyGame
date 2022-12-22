function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

class Rating {
    static ratingTable = document.getElementById('ratingtable');
    static players = [];
    static getAllPlayers() {
        let playersJSONed = JSON.parse(localStorage.getItem('players'));
        if (playersJSONed === null)
            return;
        for (let i = 0; i < playersJSONed.length; i++) {
            Rating.players.push(JSON.parse(playersJSONed[i]));
        }
        Rating.players = Rating.players.sort((a, b) => b.totalscore - a.totalscore);
        for (let j = 0; j < Rating.players.length; j++) {
            console.log(Rating.players[j].totalscore);
            let currow = Rating.ratingTable.insertRow(j + 1);
            if (Rating.players[j].name == localStorage.getItem('name'))
                currow.style.backgroundColor = 'red';
            let name = currow.insertCell(0);
            name.innerHTML = Rating.players[j].name;
            let fscore = currow.insertCell(1);
            fscore.innerHTML = Rating.players[j].firstscore;
            let sscore = currow.insertCell(2);
            sscore.innerHTML = Rating.players[j].secondscore;
            let tscore = currow.insertCell(3);
            tscore.innerHTML = Rating.players[j].thirdscore;
            let totscore = currow.insertCell(4);
            totscore.innerHTML = Rating.players[j].totalscore;
        }
    }
}
Rating.getAllPlayers();
