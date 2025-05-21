console.log("Javascript lancé");

let valeur_clic = 1;
let money = 0;
let Money_par_s = 0;

let overall_boost = 0;
let overall_cookies = 0;
let overall_cookiesPa = 0;
let overall_cookiesClicks = 0;
let Cookie_point = 0; 
let overall_Cookie_Point = 0;
let Click_bonus = 0; 
let Rebirth_Counter = 0;
let four_bonus = 0;
let robot_bonus = 0;
let usine_bonus = 0;
let mamie_bonus = 0;
let price_multiplicator = 1.024;
let multiplicateurRevenus = 1;
let reductionPrix = 1;
let justRebirthed = false;




setInterval(() => {
    CalculerRevenuPassif();
    RevenuPassif();
    ProductionAutomatique();
    UpdateCPC();
    UpdateCPS();
    updateBoutons();
    
}, 100);

setInterval(() => {
    sauvegarderPartie();
    console.log("Sauvegarde automatique effectuée !");
    document.getElementById("autosave").textContent = "Sauvegarde automatique à " + new Date().toLocaleTimeString();
}, 30000);

setInterval(() => {
    overall_cookiesP();
    overall_cookies_calcul();
    const pointsPotentiels = calculerCookiePointsPotentiels();
    document.getElementById("cookiePointsPotentiels").innerText = "Cookie Point potentiels : " + pointsPotentiels;
    document.getElementById("OverallCookieDisplay").innerText = "Cookie Totaux : " + formater(overall_cookies.toFixed(2))
}, 1000);




// === OBJETS ===

const Four = {
    n: 0,
    get PC() {
        return 0.1 * (four_bonus + 1 +(overall_boost/100));
    },
    valeurC: 15,
     
    UpdateC() {
        this.valeurC = (15*(price_multiplicator**Four.n))*reductionPrix;
    },

    achat() {
        this.UpdateC()
        if (money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            UpdateScore();
        }
    }
};

const Robot = {
    n: 0,
    get P_a() {
        return 0.05 * (1+(overall_boost/100) + robot_bonus);
    },
    stock: 0,
    valeur_a: 50,
    valeurC: 500,

    UpdateC() {
        this.valeurC = (500*(price_multiplicator**Robot.n))*reductionPrix;
    },

    achat() {
        this.UpdateC();
        if (Four.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Four.n -= this.valeur_a;
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
            Four.n += (this.n*this.P_a)/10;
        };
    }
};


const Usine = {
    n: 0,
    get P_a() {
        return 0.05 * (1+(overall_boost/100) + usine_bonus);
    },
    stock :0,
    valeur_a: 500,
    valeurC: 1000000,

    UpdateC() {
        (this.valeurC = 1000000*(price_multiplicator**Usine.n))*reductionPrix;
    },

    achat() {
        this.UpdateC();
        if (Robot.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Robot.n -= this.valeur_a;
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
            Robot.n += (this.n*this.P_a)/10;
        }
    }
};

const Mamie = {
    n: 0,
    get P_a() {
        return 0.05 * (1+(overall_boost/100) + mamie_bonus);
    },
    stock: 0,
    valeur_a: 5000,
    valeurC: 1000000000,

    UpdateC() {
        this.valeurC = (1000000000*(price_multiplicator**Mamie.n))*reductionPrix;
    },

    achat() {
        this.UpdateC();
        if (Usine.n >= this.valeur_a && money >= this.valeurC) {
            this.n += 1;
            money -= this.valeurC;
            Usine.n -= this.valeur_a;
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
            Usine.n += (this.n*this.P_a)/10;
        }
    }
};
// === AFFICHAGE HTML ===


function updateBoutons() {
    // Four
    document.getElementById("btnFour").innerHTML =
        "Four à chaleur (" + formater(Four.n.toFixed(0)) + ")<br>+" + formater((Four.n*Four.PC).toFixed(2)) + "$/s<br>" + formater(Four.valeurC.toFixed(2)) + "$";

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
    } else if (nombre>=10**9 && nombre<10**12){
        return (nombre/(10**9)).toFixed(2) + "B"
    } else if (nombre>=10**12 && nombre<10**15){
        return (nombre/(10**12)).toFixed(2) + "T"
    } else if (nombre>=10**15 && nombre<10**18){
        return (nombre/(10**15)).toFixed(2) + "Qa"
    } else if (nombre>=10**18 && nombre<10**21){
        return (nombre/(10**18)).toFixed(2) + "Qi"
    } else if (nombre>=10**21 && nombre<10**24){
        return (nombre/(10**21)).toFixed(2) + "Sx"
    } else if (nombre>=10**24 && nombre<10**27){
        return (nombre/(10**24)).toFixed(2) + "Sp"
    } else if (nombre>=10**27 && nombre<10**30){
        return (nombre/(10**27)).toFixed(2) + "Oc"
    } else if (nombre>=10**30 && nombre<10**33){
        return (nombre/(10**30)).toFixed(2) + "No"
    } else if (nombre>=10**33 && nombre<10**36){
        return (nombre/(10**33)).toFixed(2) + "Dc"
    } else if (nombre>=10**36 && nombre<10**39){
        return (nombre/(10**36)).toFixed(2) + "Ud"
    } else if (nombre>=10**39 && nombre<10**42){
        return (nombre/(10**39)).toFixed(2) + "Dd"
    } else if (nombre>=10**42 && nombre<10**45){
        return (nombre/(10**42)).toFixed(2) + "Td"
    } else if (nombre>=10**45 && nombre<10**48){
        return (nombre/(10**45)).toFixed(2) + "Qad"
    } else if (nombre>=10**48 && nombre<10**51){
        return (nombre/(10**48)).toFixed(2) + "Qid"
    } else if (nombre>=10**51 && nombre<10**54){
        return (nombre/(10**51)).toFixed(2) + "Sxd"
    } else if (nombre>=10**54 && nombre<10**57){
        return (nombre/(10**54)).toFixed(2) + "Spd"
    } else if (nombre>=10**57 && nombre<10**60){
        return (nombre/(10**57)).toFixed(2) + "Ocd"
    }   else if (nombre>=10**60 && nombre<10**63){
        return (nombre/(10**60)).toFixed(2) + "Nod"
    } else {
        return String(nombre)
    }
}



function CalculerRevenuPassif() {
    Money_par_s = Four.n * Four.PC * (1+(overall_boost/100)) * multiplicateurRevenus; // Ajout du boost
}


function ProductionAutomatique() {
    Mamie.prod();
    Usine.prod();
    Robot.prod();

    Four.UpdateC();
    Robot.UpdateC();
    Usine.UpdateC();
    Mamie.UpdateC();
}

function UpdateScore() {
    let money_1_decimal = formater(money.toFixed(2));
    document.getElementById("Score").innerText = money_1_decimal + "$";
}

function UpdateCPS() {
    let CPS_1_decimal = Money_par_s.toFixed(1);
    document.getElementById("CPS").innerText = "Revenu Passif : " + CPS_1_decimal;
}

function UpdateBoost() {
    document.getElementById("boost").innerText = "Boost Actuel : " + (overall_boost) + "%";

}

function UpdateCPC() {
    let CPC_1_decimal = (valeur_clic).toFixed(2);
    document.getElementById("ClicValue").innerText = "Valeur de clic : " + CPC_1_decimal;
}

function compte() {
    money += valeur_clic;
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
    document.getElementById("OngletShop").style.display = "none";
    const pointsPotentiels = calculerCookiePointsPotentiels();
    document.getElementById("cookiePointsPotentiels").innerText = "Cookie Point potentiels : +" + pointsPotentiels;
    document.getElementById("OverallCookieDisplay").innerText = "Cookie Totaux : " + formater(overall_cookies.toFixed(2))
    afficherAmeliorationsRebirth()

}


function OngletCookie() {
    console.log("clic cookie");
    document.getElementById("OngletCookie").style.display = "block";
    document.getElementById("OngletRebirth").style.display = "none";
    document.getElementById("OngletShop").style.display = "none";
    UpdateBoost()
}
function OngletShop(){
    document.getElementById("OngletCookie").style.display = "none";
    document.getElementById("OngletRebirth").style.display = "none";
    document.getElementById("OngletShop").style.display = "block";
}

function overall_cookiesP(){
    overall_cookiesPa +=  Money_par_s/10
}

function overall_cookiesClick(){
    overall_cookiesClicks += valeur_clic
}

function CalculBoost(){
    overall_boost = overall_Cookie_Point;
}

function overall_cookies_calcul(){
    overall_cookies = (overall_cookiesClicks/10 + overall_cookiesPa)*10
}

function calculerCookiePointsPotentiels() {
    return Math.floor(overall_cookies / (1000 * (1.01 ** overall_Cookie_Point))); // Exemple
}
// === Rebirth ===

function Rebirth() {
    // Calcul d'abord
    Cookie_point = calculerCookiePointsPotentiels();
    if (Cookie_point >= 1){
        overall_Cookie_Point += Cookie_point;
        justRebirthed = true;

        // Calculer le boost avant d'appliquer
        CalculBoost();

        // Reset
        money = 0;
        overall_cookies = 0;
        Rebirth_Counter += 1;
        four_bonus = 0;
        robot_bonus = 0;
        usine_bonus = 0;
        mamie_bonus = 0;
        Money_par_s = 0;
        overall_cookiesPa = 0;
        Four.n = 0;
        Four.valeurC = 15;
        Robot.n = 0;
        Robot.valeurC = 10000;
        Robot.stock = 0;
        Usine.n = 0;
        Usine.valeurC = 100000000;
        Usine.stock = 0;
        Mamie.n = 0;
        Mamie.valeurC = 1000000000000;
        Mamie.stock = 0;

        valeur_clic = 1 * (1 + overall_boost / 100);  // Reset valeur clic de base * boost
        
        // Mise à jour de l'affichage
        UpdateCPC();
        UpdateCPS();
        UpdateScore();
        updateBoutons();
        overall_cookiesP();
        overall_cookies_calcul();

        document.getElementById("OverallCookieDisplay").innerText = "Cookie Totaux : " + formater(overall_cookies.toFixed(2));
        document.getElementById("cookiePoints").innerText = "Cookie Points : " + overall_Cookie_Point.toFixed(2);
        document.getElementById("Prix").innerText = "1 Cookie Point : " + formater(Math.floor(1000 * (1.01 ** overall_Cookie_Point))) + " Cookies Totaux";
    } else {
        confirm("Il faut au minimun 1 cookie point pour pouvoir Rebirth !");
    }

    UpdateBoost();
    localStorage.clear();
    afficherAmeliorationsRebirth();
    sauvegarderPartie();
    chargerPartie();
    
}

const ameliorationsRebirth = [
    {
        id: "boostClique",
        nom: "Boost Clic",
        niveau: 0,
        niveauMax: 10,
        baseCout: 10,
        effet: () => {
            valeur_clic *= 1.3;

        },
        description: "Augmente la valeur de clic de 30% par niveau"
    },
    {
        id: "boostCPS",
        nom: "Boost Revenu Passif",
        niveau: 0,
        niveauMax: 10,
        baseCout: 15,
        effet: () => {
            multiplicateurRevenus *= 1.25;
        },
        description: "Augmente le revenu passif de 25% par niveau"
    },
    {
        id: "reducPrix",
        nom: "Réduction des prix",
        niveau: 0,
        niveauMax: 8,
        baseCout: 25,
        effet: () => {
            reductionPrix *= 0.4;
        },
        description: "Réduit le prix des upgrades de 60% par niveau"
    }
];


function afficherAmeliorationsRebirth() {
    const container = document.getElementById("CookiePointShop");
    container.innerHTML = "";

    ameliorationsRebirth.forEach(amelioration => {
        const coutActuel = amelioration.baseCout *5**amelioration.niveau;

        const btn = document.createElement("button");
        btn.textContent = `${amelioration.nom} (Niv ${amelioration.niveau}/${amelioration.niveauMax}) - ${coutActuel} CP`;
        btn.disabled = (amelioration.niveau >= amelioration.niveauMax || Cookie_point < coutActuel);

        btn.onclick = function () {
            if (Cookie_point >= coutActuel && amelioration.niveau < amelioration.niveauMax) {
                Cookie_point -= coutActuel;
                amelioration.niveau++;
                amelioration.effet();
                updateCookiePointDisplay();
                afficherAmeliorationsRebirth(); // Refresh
            }
        };

        const description = document.createElement("p");
        description.textContent = amelioration.description;

        const bloc = document.createElement("div");
        bloc.appendChild(btn);
        bloc.appendChild(description);

        container.appendChild(bloc);
    });
}


function updateCookiePointDisplay() {
    document.getElementById("cookiePoints").textContent = `Cookie Point : ${Cookie_point}`;
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
        niveauxRebirth: ameliorationsRebirth.map(a => a.niveau),
    };

    // Étape 2 : convertir en JSON
    const sauvegardeJSON = JSON.stringify(sauvegarde);

    // Étape 3 : stocker dans localStorage
    localStorage.setItem("sauvegarde_cookie", sauvegardeJSON);

    console.log("Partie sauvegardée !");
}

function chargerPartie() {
    if (justRebirthed) return;

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

    if (sauvegarde.niveauxRebirth) {
        sauvegarde.niveauxRebirth.forEach((niveau, index) => {
            ameliorationsRebirth[index].niveau = niveau;
            for (let i = 0; i < niveau; i++) {
                ameliorationsRebirth[index].effet();
            }
        });
}
    console.log("Partie chargée !");
}

function resetPartie() {
    if (confirm("Es-tu sûr de vouloir réinitialiser la partie ?")) {
        // Supprimer la sauvegarde
        localStorage.removeItem("sauvegarde");

        // Réinitialiser les variables principales
        money = 0;
        overall_boost = 0;
        Cookie_point = 0;
        overall_Cookie_Point = 0;
        overall_cookies = 0;
        overall_cookiesClicks = 0;
        overall_cookiesPa = 0;
        Rebirth_Counter = 0;
        valeur_clic = 1;
        four_bonus = 0;
        robot_bonus = 0;
        usine_bonus = 0;
        mamie_bonus = 0;
        ameliorationsRebirth.forEach(am => {
            am.niveau = 0;
        });


        // Réinitialiser les objets
        Four.n = 0;
        Four.valeurC = 15;

        Robot.n = 0;
        Robot.valeurC = 10000;
        Robot.stock = 0;

        Usine.n = 0;
        Usine.valeurC = 100000000;
        Usine.stock = 0;

        Mamie.n = 0;
        Mamie.valeurC = 1000000000000;
        Mamie.stock = 0;

        // Mettre à jour l'affichage
        UpdateScore();
        UpdateCPS();
        UpdateCPC();
            UpdateBoost();

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
    UpdateBoost()
};
