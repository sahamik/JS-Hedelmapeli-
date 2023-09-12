

let bankAmount = 50;
let currentBet = 1;
let lockedRolls = [false, false, false, false];
let rolls = [
    document.getElementById("roll1"),
    document.getElementById("roll2"),
    document.getElementById("roll3"),
    document.getElementById("roll4")
];
let fruits = [
    "apple.jpg",
    "cherry.jpg",
    "pear.jpg",
    "watermelon.png",
    "seiska.png"
];
let interval;
let currentRoll = 0;
let rollIndex = 0;
let allowLock = false; // Asetetaan rullien lukituspainikkeiden lukitsemis mahdollisuus falseksi alussa


// Panoksen vaihtaminen
function changeBet(bet) {
    currentBet = bet;
    document.getElementById("currentBet").textContent = currentBet;
    playBtnState();
}

//Panoksen asettaminen
function setBet() {
    if (bankAmount < currentBet) {
        document.getElementById("winText").textContent = "EI TARPEEKSI RAHAA PELATTAVAKSI"
        return;
    }
    bankAmount = bankAmount - currentBet;
    document.getElementById("bankAmount"). textContent = bankAmount;
    playBtnState();
}

// Arvotaan rulliin kuvat satunnaisesti
function rollUpdate(rollIndex) {
    if (lockedRolls[rollIndex]) {
        return;
    }

    let random = Math.floor(Math.random() * fruits.length);
    let randomFruit = fruits[random];
    let img = "/images/" + randomFruit;
    rolls[rollIndex].innerHTML = '<img src="' + img + '">';

    currentRoll++;

    if (currentRoll === rolls.length) {
        clearInterval(interval);
        currentRoll = 0;
    }
}

//Kun painetaan pelaa painiketta, tutkitaan onko rullia lukittu ja pyöräytetään rullia kutsumalla spinNextRoll() funktiota
function play() {
    document.getElementById("winText").innerText = ""; // Tyhjennetään voitto tekstikenttä
    let allLocked = true;

    for (let i = 0; i < lockedRolls.length; i++) {
        if (!lockedRolls[i]) {
            allLocked = false;
            break;
        }
    }

    if (allLocked) {
        return;
    }

    allowLock = !allowLock; // Muutetaan rullien lukitseminen mahdolliseksi
    interval = setInterval(spinNextRoll, 400);
}

//Toiminto jolla pyöräytetään rullia yksitellen järjestyksessä ja jonka jälkeen tarkastetaan voitto
function spinNextRoll() {
    rollUpdate(rollIndex);
    rollIndex++;
    allowLock = !allowLock;

    if ( rollIndex < rolls.length) {
        setTimeout(spinNextRoll, 200);
    } else {
        setTimeout(function () {
            //Luodaan uusi reels taulukko, joka sisältää kaikki rullat ja otetaan rullista kuvat talteen voiton tarkistamksta varten
            const reels = rolls.map(roll => roll.querySelector("img"));
            const multiplier = checkWin(reels);
    
            if (multiplier > 0) {
                const winAmount = currentBet * multiplier;
                bankAmount = bankAmount + winAmount;
                document.getElementById("bankAmount").textContent = bankAmount;
                document.getElementById("winText").textContent = "VOITIT " + winAmount + "€";
                allowLock = false;
                playBtnState();
            } else {
                document.getElementById("winText").textContent = "EI VOITTOA!";
                playBtnState();
            }
            
            rollIndex = 0; // Nollataan rullien indeksi, jotta niitä pystyy pyöräyttämään uudelleen

            for (let i = 0; i < lockedRolls.length; i++) {
                lockedRolls[i] = false;
                rolls[i].classList.remove("locked");
                document.getElementById("lockBtn" + (i + 1)).querySelector("img").src = "/images/lock0.png";
            }
            clearInterval(interval);
        }, 800);
    }
}

// Rullien lukitseminen
function toggleLock(btnId) {
    let rollIndex = parseInt(btnId.slice(-1)) - 1;
    let lockBtn = document.getElementById(btnId);
    let img = lockBtn.querySelector("img");

    // Rullien lukitsemismahdollisuus on aina jokatoisella pyöräytyksellä. Jos true, niin koodi suoritetaan.
    if (!allowLock) {
        return;
    }
    if (img.src.endsWith("/images/locked.png")) {
        img.src = "/images/lock0.png";
        lockedRolls[rollIndex] = false;
        rolls[rollIndex].classList.remove("locked");
    } else {
        img.src = "/images/locked.png";
        lockedRolls[rollIndex] = true;
        rolls[rollIndex].classList.add("locked");
    }

    for (let i = 0; i < lockedRolls.length; i++) {
        if (lockedRolls[i]) {
            clearInterval(interval);
        }
    }
}

// Voittorivit ja kerroin lopussa
const winCombinations = [
    ["apple.jpg", "apple.jpg", "apple.jpg", "apple.jpg", 6],
    ["cherry.jpg", "cherry.jpg", "cherry.jpg", "cherry.jpg", 3],
    ["pear.jpg", "pear.jpg", "pear.jpg", "pear.jpg", 4],
    ["watermelon.png", "watermelon.png", "watermelon.png", "watermelon.png", 5],
    ["seiska.png", "seiska.png", "seiska.png", "seiska.png", 10]
];

//Tutkitaan tuliko voittoa
function checkWin(roll) {
    for (let winningCombination of winCombinations) {
        const [fruit1, fruit2, fruit3 ,fruit4, multiplier] = winningCombination;

        if (roll[0].src.endsWith(fruit1) &&
            roll[1].src.endsWith(fruit2) &&
            roll[2].src.endsWith(fruit3) &&
            roll[3].src.endsWith(fruit4) 
        ) {
        return multiplier; // Voitto ja otetaan kerroin
     }
    }
    return 0; // Ei voittoa
}

// Tutkitaan onko pelaajalla rahaa jäljellä pelaamiseen, jos ei niin pelaa painike deaktivoidaan ja jos on niin aktivoidaan päälle.
function playBtnState() {
    const playBtn = document.getElementById("playBtn");

    if (bankAmount <= 0) {
        playBtn.disabled = true;
        document.getElementById("winText").textContent = "RAHAT LOPPUI, ALOITA UUSI PELI!";
    } else if (bankAmount < currentBet && bankAmount > 0) {
        playBtn.disabled = true;
        document.getElementById("winText").textContent = "PIENENNÄ PANOSTA PELATAKSESI!";
    } else {
        playBtn.disabled = false;
    }
}

//Uusi peli funktio, joka resetoi pelin ja aloittaa uuden pelin alusta
function newGame() {
    bankAmount = 50;
    currentBet = 1;

    document.getElementById("bankAmount").textContent = bankAmount;
    document.getElementById("currentBet").textContent = currentBet;

    //Poistetaan lukitukset jos niitä on
    for (let i = 0; i < lockedRolls.length; i++) {
        lockedRolls[i] = false;
        rolls[i].classList.remove("locked");
        document.getElementById("lockBtn" + (i + 1)).querySelector("img").src = "/images/lock0.png";
    }

    //Ajastetaan pelin aloitusteksti, niin että se näkyy vain hetken ja sitten tekstikenttä tyhjenee
    document.getElementById("winText").textContent = "UUSI PELI ALOITETTU";
    setTimeout(function () {
        document.getElementById("winText").textContent = "";
    }, 1500);
    //Aktivoidaan pelaa painike
    playBtnState();
}