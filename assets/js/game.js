class Drawable {
    constructor(game) {
        this.game = game;
        this.x =0;
        this.y =0;
        this.w =0;
        this.h =0;
        this.offsets = {
            x: 0,
            y: 0
        }
    }
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "element " + this.constructor.name.toLowerCase();
        $('.elements').append(this.element);
    }

    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }
//отрисовка
    draw() {
        this.element.style = `
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.w}px;
        height: ${this.h}px;
        `;
    }

    //удаление элемента из верстки
    removeElement() {
        this.element.remove();
    }

    //метот для определения колизии ловим координаты верхний левый и нижний правый углы.
    isCollision(element) {
        let a = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h
        };
        let b = {
            x1: element.x,
            x2: element.x + element.w,
            y1: element.y,
            y2: element.y + element.h
        };
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    }
}

//пуля
class Bullet extends Drawable {
    constructor(game, x, y) {
        super(game);
        this.w = 5;
        this.h = 15;
        this.x = x - this.w / 2;
        this.y = y;
        this.speed = -10; // Движение вверх
        this.createElement();
        this.element.className = "bullet";
    }
    update() {
        this.y += this.speed;

        // Удаляем пулю, если она вышла за пределы экрана
        if (this.y + this.h < 0) {
            this.game.remove(this);
            this.removeElement();
            return;
        }

        // Проверяем столкновения с астероидами
        for (let i = 0; i < this.game.elements.length; i++) {
            const element = this.game.elements[i];
            if (element instanceof Asteroids && this.isCollision(element)) {
                this.game.points++; // Начисляем очки
                this.game.remove(element);
                element.removeElement();
                this.game.remove(this);
                this.removeElement();
                break;
            }
        }
    }
}

class Asteroids extends Drawable {
    constructor(game) {
        super(game);
        this.w = 70;
        this.h = 70;
        this.y = 60; //чтобы появлялтся под панелью
        this.x = random(0, window.innerWidth - this.w);
        this.offsets.y = 3;
        this.createElement();
    }
//метод начисления поинтов и отнятия жизни
    update() {
        if (this.isCollision(this.game.player)) this.takePoint(); //метод начисления поинта
        if (this.y > window.innerHeight) this.notTakePoint();
        if (this.isCollision(this.game.player)) {
            this.game.hp = 0; // Завершаем игру
            this.game.remove(this);
            this.removeElement();
            return;
        }
        super.update();
    }

    //насчитывает очки и удаляет элемент
    takePoint() {
        if (this.game.remove(this)) {
            this.removeElement(); //отрабатывает метод
            this.game.points++; //добавляем очки
        }
    }

    //удаляет очки
    notTakePoint() {
        if (this.game.remove(this)) {
            this.removeElement(); //отрабатывает метод
            this.game.points--; //добавляем очки
        }
    }

    //отнимаются жизни
    takeDamage() {
        if (this.game.remove(this)) {
            this.removeElement(); //отрабатывает метод
            this.game.hp--;
        }
    }
}

class Asteroid extends Asteroids {
    constructor(game) {
        super(game);
    }
}

class Asteroid_fire extends Asteroids {
    constructor(game) {
        super(game);
        this.offsets.y = 3;
    }
}

class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = window.innerWidth / 2 - this.w / 2;
        this.y = window.innerHeight - this.h;
        this.speedPerFrame = 10;
        this.fireCooldown = 0; // Таймер задержки между выстрелами
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.createElement();
        this.bindKeyEvents();
    }

    bindKeyEvents() {
        document.addEventListener('keydown', ev => {
            this.changeKeyStatus(ev.code, true);
            if(ev.code === "Space") {
                this.shoot(); // Выстрел при нажатии пробела
                ev.preventDefault(); // Предотвращаем прокрутку страницы
            }
        });
        document.addEventListener('keyup', ev => this.changeKeyStatus(ev.code, false));
    }

    changeKeyStatus(code, value) {
        if(code in this.keys) {
            this.keys[code] = value;
        }
    }

    shoot() {
        // Проверяем задержку между выстрелами
        if(this.fireCooldown <= 0) {
            // Создаем пулю в центре корабля
            const bullet = new Bullet(this.game, this.x + this.w/2, this.y);
            this.game.elements.push(bullet);
            this.fireCooldown = 1; // Устанавливаем задержку
        }
    }

    update() {
        // Движение корабля
        if(this.keys.ArrowLeft && this.x > 0) this.offsets.x = -this.speedPerFrame;
        else if(this.keys.ArrowRight && this.x < window.innerWidth - this.w)
            this.offsets.x = this.speedPerFrame;
        else this.offsets.x = 0;

        // Уменьшаем таймер задержки
        if(this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        super.update();
    }
}

class Game {
    constructor() {
        //пареметры
        this.name = name;
        this.elements = [];
        this.player = this.generate(Player);
        this.counterForTimer = 0;
        this.asteriods = [Asteroid_fire, Asteroid];
        this.points = 0;
        this.hp = 1;
        this.time = { //секундомер
            m1: 0,
            m2: 0,
            s1: 3,
            s2: 0
        };
        this.name = localStorage.getItem('userName') || 'Player';
        this.isTester = this.name.toLowerCase() === 'tester';
        // Применяем стиль сразу при создании игры
        if (this.isTester) {
            $('#name').style.color = 'red';}

        this.ended = false; //по умолчанию игра не окончена
        this.pause = false;
        this.keyEvents(); //прослушка esc

    }

    generateBullet(x, y) {
        const bullet = new Bullet(this, x, y);
        this.elements.push(bullet);
        return bullet;
    }
    generate(className) {
        let element = new className(this);
        this.elements.push(element);
        return element;
    }
    start(){
        this.loop();
    }

    keyEvents() {
        addEventListener('keydown', ev => {
            if(ev.code === "Escape") this.pause = !this.pause;
        })
    }

    loop() {
        requestAnimationFrame(() => {
            if(!this.pause) {
                this.counterForTimer++;
                if (this.counterForTimer % 60 === 0) {
                    this.randomAsteroidGenerate();
                    this.timer(); //новый метод таймер
                }
                if(this.hp === 0) this.end();
                $('.pause').style.display = 'none';
                this.updateElements();
                this.setParams();
            } else if(this.pause) {
                $('.pause').style.display = 'flex';
            }
            if(!this.ended) this.loop(); //вызов только если игра не окончена
        });
    }

    remove(element) {
        const index = this.elements.indexOf(element);
        if(index !== -1) {
            this.elements.splice(index, 1);
            return true;
        }
        return false;
    }

    //метод для обратного таймера, чтобы шло время
    timer() {
        let time = this.time; //переменная чтобы постоянно не пистаь this.time
        time.s2--;
        if(time.s2 < 0) {
            time.s2 = 9;
            time.s1--;
        }
        if(time.s1 < 0) {
            time.s1 = 5;
            time.m2--;
        }
        if(time.m2 < 0) {
            time.m1 = 0;
            time.m2 = 0;
            time.s1 = 0;
            time.s2 = 0;

        }
        if (time.m1 <= 0 && time.m2 <= 0 && time.s1 <= 0 && time.s2 <= 0) {  // условие, что при окончании таймера игра заканчивается
            this.end(true);
        }
        //квери селектор
        $("#timer").innerHTML = `${time.m1}${time.m2}:${time.s1}${time.s2}`;
    }

    //рандомит астероиды
    randomAsteroidGenerate() {
        this.generate(this.asteriods[random(0, 1)]); //ПОТОМУ ЧТО 2 ЭЛЕМЕНТА!!!!!!!!!!!!!!!
    }
//отрисовывает элементы
    updateElements() {
        this.elements.forEach((el) => {
            el.update();
            el.draw();
        })
    }

    //метод удаления элементоа
    remove(el) {
        let idx = this.elements.indexOf(el);
        //проверка сучествует ли этот конструкт
        if(idx !== -1) {
            this.elements.splice(idx, 1); //чтобы нормально считалось и удалялось, берет индекс тек.эл и удаляет
            return true;
        }
        return false
    }

    setParams() {
        let params = ['name', 'points', 'hp']; //отрисовка параметров
        let values = [this.name, this.points, this.hp]; //привязка параметров
        params.forEach((el, index) => {
            $(`#${el}`).innerHTML = values[index];
            if (el === 'name' && this.isTester) {
                $(`#${el}`).style.color = 'red';}
        })
    }

    //ококнчание игры  ИСПРАВИТЬ!!!!!!!!!
    end() {
        this.ended = true; //как только хп < 0 ended становится true
        let time = this.time;
        let hp = this.hp;
        if((time.s1 === 0 && time.m2 === 0 && time.m1 === 0) && (hp !== 0)){
            $('#playerName').innerHTML = `Поздравляем, ${this.name}!`;
            $('#collectedFruits').innerHTML = `Вы уничтожили ${this.points} астероидов`;
            $('#congratulation').innerHTML = `Вы выиграли!`;
        } else if((hp === 0) && (time.s1 >= 0 && time.m2 >= 0 && time.m1 >= 0)) {
            $('#playerName').innerHTML = `Жаль, ${this.name}!`;
            $('#collectedFruits').innerHTML = `Вы уничтожили ${this.points - 1} астероидов`;
            $('#congratulation').innerHTML = `Вы проиграли`;
        }
        go('end', 'panel d-flex justify-content-center align-items-center');
    }
}
