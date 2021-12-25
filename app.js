window.rolling = 0;
window.joueur = null;
window.joueurMax = 1;
window.infinite = false;
window.scoreSelected = null;
window.continu = false;
window.ShowScoreIncomplete = true;

function rollDice() {
    let newTurn = setScore();
    ShowScore(calculScrore(null))
    buttonLabel()
    if ((!newTurn) || (window.continu)) {
        const dice = [...document.querySelectorAll(".die-list")];
        dice.forEach(die => {
            if (!die.classList.contains("selected")) {
                window.rolling++;
                toggleClasses(die);
                die.dataset.roll = getRandomNumber(1, 6);
            }
        });
        document.getElementById("roll-button").disabled = true;
        window.nbTour--;
    }
}



function setScore() {
    if (window.scoreSelected != null) {
        window.scoreSelected.dataset.score = window.scoreSelected.dataset.possibleScore;
        window.scoreSelected.dataset.possibleScore = 0;
        window.scoreSelected.classList.remove("selected");
        window.scoreSelected = null;
        CalculateTotal()
        setNewTurn()
        return true
    }
    return false
}

function CalculateTotal() {
    const jScore = document.querySelector(`.joueur[data-joueur="${window.joueur}"]`);
    var sup = 0;
    var inf = 0;
    var bonus = 0;
    var allSup = true;
    var allInf = true;
    const allItem = [...jScore.querySelectorAll("[data-score]")]
    for (const iterator of allItem) {
        if (iterator.dataset.score >= 0) {
            if (iterator.dataset.scoreIndex < 6) {
                sup += parseInt(iterator.dataset.score)
            } else {
                inf += parseInt(iterator.dataset.score)

            }
        } else {
            if (iterator.dataset.scoreIndex < 6) {
                allSup = false
            } else {
                allInf = false
            }
        }

    }
    if ((sup > 0) && (window.ShowScoreIncomplete || allSup)) {

        if (sup >= 63) {
            jScore.querySelector(".sup .bonus").textContent = 35
            bonus = 35;
        }
        jScore.querySelector(".sup .total").textContent = sup + bonus
    }

    if ((inf > 0) && (window.ShowScoreIncomplete || allInf)) {
        jScore.querySelector(".inf .total").textContent = inf
    }

    if (((sup + inf) > 0) && (window.ShowScoreIncomplete || (allSup && allInf))) {
        jScore.querySelector(".inf .totalScore").textContent = 0 + sup + inf + bonus
    }
}

function buttonLabel() {
    const strDe = `Roule les dés (${window.nbTour}), `
    const strTour = `Fini ton tour, `
    if (window.scoreSelected != null) {
        document.getElementById("roll-button").textContent = strTour;
        document.getElementById("roll-button").disabled = false;
    } else {
        if ((window.nbTour > 0) || window.infinite) {
            document.getElementById("roll-button").textContent = strDe;
        } else {
            document.getElementById("roll-button").textContent = strTour;
            document.getElementById("roll-button").disabled = true;
        }
    }
}

function toggleClasses(die) {
    die.classList.toggle("odd-roll");
    die.classList.toggle("even-roll");
}

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectDice() {
    if (window.nbTour < 3) {
        this.classList.toggle("selected");
    }
}

function getDiceValue() {
    des = Array();
    const dice = [...document.querySelectorAll(".die-list")];
    dice.forEach(die => {
        des.push(die.dataset.roll)
    })
    return des;
}

function endRoll() {
    window.rolling--;
    if (window.rolling <= 0) {
        window.rolling = 0;
        document.getElementById("roll-button").disabled = false;
        console.log(calculScrore(getDiceValue()))
        ShowScore(calculScrore(getDiceValue()))
        buttonLabel()
    }
}

function setNewTurn() {
    if (window.joueur == null) {
        window.joueur = 0;
    }
    window.joueur++;
    if (window.joueur > window.joueurMax) {
        window.joueur = 1
    }
    window.nbTour = 3;
    const dice = [...document.querySelectorAll(".die-list")];
    dice.forEach(die => { die.classList.remove("selected") })
    setJoueurActif()
}

function ShowScore(score) {

    const jScore = document.querySelector(`.joueur[data-joueur="${window.joueur}"]`);
    for (let index = 0; index < score.length; index++) {
        const element = score[index];
        let sdiv = jScore.querySelector(`[data-score-index="${index}"]`);
        if (element == null) {
            sdiv.dataset.possibleScore = "0";

        } else {
            sdiv.dataset.possibleScore = element;

        }

    }
}

function setJoueurActif() {
    const joueur = [...document.querySelectorAll(".joueur[data-joueur]")];
    for (const iterator of joueur) {
        if (iterator.dataset.joueur == window.joueur) {
            iterator.classList.add("actif")
        } else {
            iterator.classList.remove("actif")
        }
    }
    const playArea = document.querySelector(".play[data-joueur]")
    playArea.dataset.joueur = window.joueur
}

function scoreClick() {
    if (this.parentElement.parentElement.classList.contains("actif") && window.nbTour < 3) {
        if (this.dataset.score == "-1") {
            if (this.classList.contains("selected")) {
                window.scoreSelected.classList.remove("selected")
                window.scoreSelected = null;
            } else {
                if (window.scoreSelected != null) {
                    window.scoreSelected.classList.remove("selected")
                    window.scoreSelected = null;
                }
                window.scoreSelected = this;
                this.classList.add("selected");
            }
            buttonLabel()
        }
        // this.dataset.score = this.dataset.possibleScore
    }

}
document.getElementById("roll-button").addEventListener("click", rollDice);

const dice = [...document.querySelectorAll(".die-list")];
dice.forEach(die => {
    die.addEventListener("click", selectDice)
    die.addEventListener("transitionend", endRoll)
});

const score_item = [...document.querySelectorAll(".joueur .item")];
score_item.forEach(si => {
    si.addEventListener("click", scoreClick)
});
setNewTurn()
buttonLabel()

function calculScrore(des) {
    var pts = Array();
    var nbDe = Array()
    for (let index = 1; index <= 6; index++) {
        pts.push(calculatePointSuperieur(des, index));
        nbDe.push(getNbValeurDe(des, index))
    }
    pts.push(CalculatePareil(nbDe, 3))
    pts.push(CalculatePareil(nbDe, 4))
    pts.push(CalculateMainPleine(nbDe))
    pts.push(CalculateSuite(nbDe, 4))
    pts.push(CalculateSuite(nbDe, 5))
    pts.push(CalculateYatzhee(nbDe))
    pts.push(CalculateChance(nbDe))
    return pts;
}

function calculatePointSuperieur(des, valeur) {
    var pts = 0;
    if (des == null) {
        return null
    }
    for (const iterator of des) {
        if (iterator == valeur) {
            pts += valeur
        }
    }
    return pts
}

function getNbValeurDe(des, valeur) {
    var nb = 0;
    if (des == null) {
        return null
    }
    for (const iterator of des) {
        if (iterator == valeur) {
            nb++
        }
    }

    return nb
}

function CalculateChance(nbDe) {
    var pts = 0;
    if (nbDe[0] == null) {
        return null
    }
    for (let index = 0; index < nbDe.length; index++) {
        const element = nbDe[index];
        pts += (element * (index + 1))
    }
    return pts
}

function CalculatePareil(nbDe, nb) {
    if (nbDe[0] == null) {
        return null
    }
    for (const iterator of nbDe) {
        if (iterator >= nb) {
            return CalculateChance(nbDe);

        }
    }

    return 0;

}

function CalculateMainPleine(nbDe) {
    if (nbDe[0] == null) {
        return null
    }
    if ((nbDe.includes(3)) && (nbDe.includes(2))) {
        return 25
    }
    return 0
}

function CalculateSuite(nbDe, nb) {
    if (nbDe[0] == null) {
        return null
    }
    var nbSuite = 0;
    for (let index = 0; index < nbDe.length; index++) {
        const element = nbDe[index];
        if (element > 0) {
            nbSuite++;
            if (nbSuite >= nb) {
                return (nb - 1) * 10;
            }
        } else {
            nbSuite = 0;
        }

    }
    return 0
}

function CalculateYatzhee(nbDe) {
    if (nbDe[0] == null) {
        return null
    }
    if (nbDe.includes(5)) {
        return 50;
    }
    return 0;
}