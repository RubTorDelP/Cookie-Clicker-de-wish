console.log("Javascript lancé");

let valeur_clic = 1;
let money = 0;
let Money_par_s = 0;

let overall_boost = 1;
let overall_cookies = 0;
let overall_cookiesPa = 0;
let overall_cookiesClicks = 0;
let Cookie_point = 0; 
let overall_Cookie_Point = 0;
let Click_bonus = 0; 
let Rebirth_Counter = 0;
let four_bonus = 1;
let robot_bonus = 1;
let usine_bonus = 1;
let mamie_bonus = 1;




setInterval(() => {
    CalculerRevenuPassif();
    RevenuPassif();
    ProductionAutomatique();
    UpdateCPC();
    UpdateCPS();
    updateBoutons();
    overall_cookiesP();
    overall_cookies_calcul();
}, 100);

setInterval(() => {
    sauvegarderPartie();
    console.log("Sauvegarde automatique effectuée !");
    document.getElementById("autosave").textContent = "Sauvegarde automatique à " + new Date().toLocaleTimeString();
}, 30000);




// === OBJETS ===

const Four = {
    n: 0,
    get PC() {
        return 0.1 * (four_bonus);
    },
    valeurC: 15,

    achat() {
        if (money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            this.valeurC = this.valeurC * 1.024;
            UpdateScore();
        }
    }
};

const Robot = {
    n: 0,
    get P_a() {
        return 0.05 * (overall_boost + robot_bonus);
    },
    stock: 0,
    valeur_a: 1000,
    valeurC: 10000,

    achat() {
        if (Four.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Four.n -= this.valeur_a;
            this.valeurC = this.valeurC * 1.024;
            UpdateScore();
        }
    },
    
    prod() {
        if (this.n*this.P_a < 1) {
            this.stock += (this.P_a * this.n)/10;           // 1. Accumuler la production
            let produite = Math.floor(this.stock);     // 2. Combien d'unités entières produire ?
            if (produite > 0) {
                Four.n += produite;                     // 3. Ajouter à Four.n
                this.stock -= produite; 
            }
        } else if (this.n*this.P_a >= 1) {
            Four.n += this.n*this.P_a;
        };
    }
};


const Usine = {
    n: 0,
    get P_a() {
        return 0.05 * (overall_boost + usine_bonus);
    },
    stock :0,
    valeur_a: 100000,
    valeurC: 1000000,

    achat() {
        if (Robot.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Robot.n -= this.valeur_a;
            this.valeurC = this.valeurC * 1.024;
            UpdateScore();
        }
    },

    prod() {
        if (this.n*this.P_a < 1) {
            this.stock += (this.P_a * this.n)/10;           // 1. Accumuler la production
            let produite = Math.floor(this.stock);     // 2. Combien d'unités entières produire ?
            if (produite > 0) {
                Robot.n += produite;                     // 3. Ajouter à Four.n
                this.stock -= produite; 
            }
        } else if (this.n*this.P_a >= 1) {
            Robot.n += this.n*this.P_a;
        }
    }
};

const Mamie = {
    n: 0,
    get P_a() {
        return 0.05 * (overall_boost + mamie_bonus);
    },
    stock: 0,
    valeur_a: 100000000,
    valeurC: 1000000000,

    achat() {
        if (Usine.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Usine.n -= this.valeur_a;
            this.valeurC = this.valeurC * 1.024;
            UpdateScore();
        }
    },

    prod() {
        if (this.n*this.P_a < 1) {
            this.stock += (this.P_a * this.n)/10;           // 1. Accumuler la production
            let produite = Math.floor(this.stock);     // 2. Combien d'unités entières produire ?
            if (produite > 0) {
                Usine.n += produite;                     // 3. Ajouter à Four.n
                this.stock -= produite; 
            }
        } else if (this.n*this.P_a >= 1) {
            Usine.n += this.n*this.P_a;
        }
    }
};
// === AFFICHAGE HTML ===


function updateBoutons() {
    // Four
    document.getElementById("btnFour").innerHTML =
        "Four à chaleur (" + formater(Four.n.toFixed(0)) + ")<br>+" + formater((Four.n*Four.PC*overall_boost).toFixed(2)) + "$/s<br>" + formater(Four.valeurC.toFixed(2)) + "$";

    // Robot
    document.getElementById("btnRobot").innerHTML =
        "Robot Pâtissier (" + formater(Robot.n.toFixed(0)) + ")<br>+" + formater((Robot.P_a*Robot.n).toFixed(2)) + " Fours/s<br>" +
        formater(Robot.valeurC.toFixed(2)) + "$ + " + formater(Robot.valeur_a) + " Fours";

    // Usine
    document.getElementById("btnUsine").innerHTML =
        "Usine à cookies (" + formater(Usine.n.toFixed(0)) + ")<br>+" + formater((Usine.P_a*Usine.n).toFixed(2)) + " Robots/s<br>" +
        formater(Usine.valeurC.toFixed(2)) + "$ + " + formater(Usine.valeur_a) + " Robots";

    // Mamie
    document.getElementById("btnMamie").innerHTML =
        "Mamie pâtissière (" + formater(Mamie.n.toFixed(0)) + ")<br>+" + formater((Mamie.P_a*Mamie.n).toFixed(2)) + " Usines/s<br>" +
        formater(Mamie.valeurC.toFixed(2)) + "$ + " + formater(Mamie.valeur_a) + " Usines";
}

// === FONCTIONS GLOBALES===

function formater(nombre){
    if (nombre>=1000 && nombre<1000000){
        return (nombre/1000).toFixed(2) + "k"
    } else if (nombre>=1000000 && nombre<10**9){
        return (nombre/1000000).toFixed(2) + "M"
    } else if (nombre>=10**9){
        return (nombre/(10**9)).toFixed(2) + "Md"
    } else {
        return String(nombre)
    }
}

function CalculerRevenuPassif() {
    Money_par_s = Four.n * Four.PC * overall_boost; // Ajout du boost
}


function ProductionAutomatique() {
    Mamie.prod();
    Usine.prod();
    Robot.prod();
}

function UpdateScore() {
    let money_1_decimal = money.toFixed(2);
    document.getElementById("Score").innerText = money_1_decimal + "$";
}

function UpdateCPS() {
    let CPS_1_decimal = Money_par_s.toFixed(1);
    document.getElementById("CPS").innerText = "Revenu Passif : " + CPS_1_decimal;
}

function UpdateCPC() {
    let CPC_1_decimal = (valeur_clic* overall_boost/10).toFixed(1);
    document.getElementById("ClicValue").innerText = "Valeur de clic : " + CPC_1_decimal;
}

function compte() {
    money += valeur_clic * overall_boost/10;
    overall_cookies += valeur_clic * overall_boost/10;
    overall_cookiesClick();
    UpdateScore();
}

function RevenuPassif() {
    money += (Money_par_s) / 10;
    overall_cookies += (Money_par_s) / 10;
    UpdateScore();
}
// === CHANGER D'ONGLET ===
function OngletRebirth() {
    document.getElementById("OngletCookie").style.display = "none";
    document.getElementById("OngletRebirth").style.display = "block";

    // Mise à jour des points potentiels
    const pointsPotentiels = calculerCookiePointsPotentiels();
    document.getElementById("cookiePointsPotentiels").innerText = "Cookie Point potentiels : " + pointsPotentiels;
}


function OngletCookie() {
    console.log("clic cookie");
    document.getElementById("OngletCookie").style.display = "block";
    document.getElementById("OngletRebirth").style.display = "none";
}


function overall_cookiesP(){
    overall_cookiesPa +=  Money_par_s
}

function overall_cookiesClick(){
    overall_cookiesClicks += valeur_clic
}

function overall_cookies_calcul(){
     overall_cookies = overall_cookiesClicks + overall_cookiesPa
}

function calculerCookiePointsPotentiels() {
    return Math.floor(overall_cookies / 1000); // Exemple
}
// === Rebirth ===

function Rebirth() {
    // Calcul d'abord
    Cookie_point = overall_cookies / (10000 * 1.01 ** overall_Cookie_Point);
    overall_Cookie_Point += Cookie_point;
    overall_boost = overall_Cookie_Point * 0.1;

    // Puis reset
    money = 0;
    Rebirth_Counter += 1;
    four_bonus = 1;
    robot_bonus = 1;
    usine_bonus = 1;
    mamie_bonus = 1;
    Four.n = 0;
    Four.valeurC = 15;
    Robot.n = 0;
    Robot.valeurC = 10000;
    Robot.stock = 0;
    Usine.n = 0;
    Usine.valeurC = 1000000;
    Usine.stock = 0;
    Mamie.n = 0;
    Mamie.valeurC = 1000000000;
    Mamie.stock = 0;
    overall_cookies = 0;

    document.getElementById("cookiePoints").innerText = "Cookie Points : " + overall_Cookie_Point.toFixed(2);
    
}



// === SAUVEGARDE/CHARGER ===

function sauvegarderPartie() {
    const sauvegarde = {
        money: money,
        overall_boost: overall_boost,
        overall_cookies: overall_cookies,
        Cookie_point: Cookie_point,
        overall_Cookie_Point: overall_Cookie_Point,
        Click_bonus: Click_bonus,
        Rebirth_Counter: Rebirth_Counter,
        four_bonus: four_bonus,
        robot_bonus: robot_bonus,
        usine_bonus: usine_bonus,
        mamie_bonus: mamie_bonus,
        overall_cookiesPa: overall_cookiesPa,
        overall_cookiesClicks: overall_cookiesClicks,
        four_n: Four.n,
        four_ValeurC: Four.valeurC,
        robot_n: Robot.n,
        Robot_ValeurC: Robot.valeurC,
        usine_n: Usine.n,
        usine_ValeurC: Usine.valeurC,
        mamie_n: Mamie.n,
        mamie_ValeurC: Mamie.valeurC,
    };

    // Étape 2 : convertir en JSON
    const sauvegardeJSON = JSON.stringify(sauvegarde);

    // Étape 3 : stocker dans localStorage
    localStorage.setItem("sauvegarde_cookie", sauvegardeJSON);

    console.log("Partie sauvegardée !");
}

function chargerPartie() {
    const sauvegardeJSON = localStorage.getItem("sauvegarde_cookie");
    if (!sauvegardeJSON) {
        console.log("Aucune sauvegarde trouvée.");
        return;
    }

    const sauvegarde = JSON.parse(sauvegardeJSON);

    money = sauvegarde.money;
    overall_boost = sauvegarde.overall_boost;
    Cookie_point = sauvegarde.Cookie_point;
    Click_bonus = sauvegarde.Click_bonus;
    Rebirth_Counter = sauvegarde.Rebirth_Counter;
    overall_cookies = sauvegarde.overall_cookies;
    overall_Cookie_Point = sauvegarde.overall_Cookie_Point;
    four_bonus = sauvegarde.four_bonus;
    robot_bonus = sauvegarde.robot_bonus;
    usine_bonus = sauvegarde.usine_bonus;
    overall_cookiesPa = sauvegarde.overall_cookiesPa || 0;
    overall_cookiesClicks = sauvegarde.overall_cookiesClicks || 0;
    mamie_bonus = sauvegarde.mamie_bonus;
    Four.valeurC = sauvegarde.four_ValeurC;
    Robot.valeurC = sauvegarde.Robot_ValeurC;
    Usine.valeurC = sauvegarde.usine_ValeurC;
    Mamie.valeurC = sauvegarde.mamie_ValeurC;
    Four.n = sauvegarde.four_n;
    Robot.n = sauvegarde.robot_n;
    Usine.n = sauvegarde.usine_n;
    Mamie.n = sauvegarde.mamie_n;

    console.log("Partie chargée !");
}

function resetPartie() {
    if (confirm("Es-tu sûr de vouloir réinitialiser la partie ?")) {
        // Supprimer la sauvegarde
        localStorage.removeItem("sauvegarde");

        // Réinitialiser les variables principales
        money = 0;
        overall_boost = 1;
        Cookie_point = 0;
        overall_cookies = 0;
        overall_cookiesClicks = 0;
        overall_cookiesPa = 0;
        Rebirth_Counter = 0;
        four_bonus = 1;
        robot_bonus = 1;
        usine_bonus = 1;
        mamie_bonus = 1;

        // Réinitialiser les objets
        Four.n = 0;
        Four.valeurC = 15;

        Robot.n = 0;
        Robot.valeurC = 10000;
        Robot.stock = 0;

        Usine.n = 0;
        Usine.valeurC = 1000000;
        Usine.stock = 0;

        Mamie.n = 0;
        Mamie.valeurC = 1000000000;
        Mamie.stock = 0;

        // Mettre à jour l'affichage
        UpdateScore();
        UpdateCPS();
        UpdateCPC();
    }
}

// ====== FONCTIONS NON UTILISÉES POUR L’INSTANT ======

// function achat(prix, y) { ... }
// function achatps(prix, y) { ... }
// function achatC(prix, y, x) { ... }
// function ChangeCookieSkin() { ... }
// function UpdateCookieStatus(l) { ... }

window.onload = () => {
    chargerPartie(); // Recharge les données sauvegardées
    UpdateScore(); // Affiche l'argent après chargement
    UpdateCPS();
    UpdateCPC();
    updateBoutons();
};
