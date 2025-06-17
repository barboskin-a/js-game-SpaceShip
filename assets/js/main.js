let name = '';
let game = {};
let panel = 'start';
let $ = function(domElement) { return document.querySelector(domElement); }

let nav = () => {
    document.onclick = (ev) => {
        ev.preventDefault();
        switch (ev.target.id) {
            case "startGame":
                go('game', 'd-block');
                break;
            case "restart":
                go('game', 'd-block');
                for(let child of $('.elements').querySelectorAll('.element')) {
                    child.remove();
                }
                break;
        }
    }
}

let go = (page, attribute) => {
    let pages = ['start', 'game', 'end'];
    panel = page;
    $(`#${page}`).setAttribute('class', attribute);
    pages.forEach(el => {
        if(page !== el) $(`#${el}`).setAttribute('class', 'd-none');
    })
}

let checkName = () => {
    name = $('#nameInput').value.trim();
    if(name !== '') {
        $('#startGame').removeAttribute('disabled');
        localStorage.setItem('userName', name);
    } else if(name === 'tester') {
        $('#nameInput').style.color = '#00ff00';
    } else {
        $('#startGame').setAttribute('disabled', 'disabled');
    }
}

let startLoop = () => {
    let inter = setInterval(() => {
        if(panel !== "start") clearInterval(inter);
        checkName();
    }, 100)
}

let checkStorage = () => {
    $('#nameInput').value = localStorage.getItem('userName') || '';
}

window.onload = () => {
    checkStorage();
    nav();
    startLoop();
    let inter = setInterval(() => {
        if(panel === 'game') {
            game = new Game();
            game.start();
            panel = 'game process';
            //clearInterval(inter);
        }
    }, 500)
}
//рандомит целые числа с округлением вверх и вниз
let random = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}