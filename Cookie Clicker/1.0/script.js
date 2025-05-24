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
let price_multiplicator = 1.013;
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
    document.getElementById("cookiePointsPotentiels").innerText = "Cookie Point potentiels : +" + pointsPotentiels;
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
        this.valeur_a *= reductionPrix
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
            this.stock += (this.P_a * this.n)/10;           
            let produite = Math.floor(this.stock);    
            if (produite > 0) {
                Four.n += produite;                    
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
        this.valeur_a *= reductionPrix
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
            this.stock += (this.P_a * this.n)/10;         
            let produite = Math.floor(this.stock);
            if (produite > 0) {
                Robot.n += produite;             
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
        this.valeur_a *= reductionPrix
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
            this.stock += (this.P_a * this.n)/10;       
            let produite = Math.floor(this.stock);     
            if (produite > 0) {
                Usine.n += produite;                  
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
        "Four à chaleur (" + formater(Four.n.toFixed(0)) + ")<br>" +
        '<img src="assets/Four.png" alt="Four" style="width:50px;height:auto;"><br>' +
        "+" + formater((Four.n*Four.PC).toFixed(2)) + "$/s<br>" + formater(Four.valeurC.toFixed(2)) + "$";

    // Robot
    document.getElementById("btnRobot").innerHTML =
        "Robot Pâtissier (" + formater(Robot.n.toFixed(0)) + ")<br>" +
        '<img src="assets/Robot.png" alt="Robot" style="width:50px;height:auto;"><br>' +
        "+" + formater((Robot.P_a*Robot.n).toFixed(2)) + " Fours/s<br>" +
        formater(Robot.valeurC.toFixed(2)) + "$ + " + formater(Robot.valeur_a) + " Fours";

    // Usine
    document.getElementById("btnUsine").innerHTML =
        "Usine à cookies (" + formater(Usine.n.toFixed(0)) + ")<br>" +
        '<img src="assets/Usine.png" alt="Usine" style="width:50px;height:auto;"><br>' +
        "+" + formater((Usine.P_a*Usine.n).toFixed(2)) + " Robots/s<br>" +
        formater(Usine.valeurC.toFixed(2)) + "$ + " + formater(Usine.valeur_a) + " Robots";

    // Mamie
    document.getElementById("btnMamie").innerHTML =
        "Mamie pâtissière (" + formater(Mamie.n.toFixed(0)) + ")<br>" +
        '<img src="assets/Mamie.png" alt="Mamie" style="width:50px;height:auto;"><br>' +
        "+" + formater((Mamie.P_a*Mamie.n).toFixed(2)) + " Usines/s<br>" +
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
    Money_par_s = Four.n * Four.PC * (1+(overall_boost/100)) * multiplicateurRevenus; 
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
    let CPC_1_decimal = valeur_clic.toFixed(2);
    document.getElementById("ClicValue").innerText = "Valeur de clic : " + CPC_1_decimal;
}

function compte() {
    money += valeur_clic;
    overall_cookiesClick();
    UpdateScore();

    const sonClick2 = document.getElementById('clickSound2');
    if (sonClick2) {
        sonClick2.currentTime = 0; // pour pouvoir rejouer rapidement
        sonClick2.play();
    }
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
    afficherAmeliorations();
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
    return Math.floor(overall_cookies / (1000 * (1.01 ** overall_Cookie_Point)));
}
// === Rebirth ===

function Rebirth() {
    Cookie_point = calculerCookiePointsPotentiels();
    if (Cookie_point >= 1) {
        overall_Cookie_Point += Cookie_point;
        justRebirthed = true;

        CalculBoost();

        // Reset des améliorations classiques uniquement
        ameliorations.forEach(am => {
            am.achete = false;
        });

        // Reset des autres variables
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

        valeur_clic = 1 * (1 + overall_boost / 100);

        // Tu peux réappliquer les effets des améliorationsRebirth ici s’il y a lieu
        ameliorationsRebirth.forEach(am => {
            if (am.achete) {
                am.effet();
            }
        });

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
        confirm("Il faut au minimum 1 cookie point pour pouvoir Rebirth !");
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

const ameliorations = [
    {
        id: "amelioration_clic_1",
        nom: "Doigt Agile",
        description: "+1 valeur de clic",
        cout: 100,
        effet: () => { valeur_clic += 1;},
        achete: false
    },
    {
        id: "amelioration_four_1",
        nom: "Fours au charbon",
        description: "+3% de production des Fours",
        cout: 400,
        effet: () => { four_bonus += 0.03; },
        achete: false
    },
    {
        id: "amelioration_clic_2",
        nom: "Index de Titan",
        description: "+3 valeur de clic",
        cout: 2000,
        effet: () => { valeur_clic += 3; },
        achete: false
    },
    {
        id: "amelioration_four_2",
        nom: "Fours au charbon",
        description: "+4% de production des Fours",
        cout: 2500,
        effet: () => { four_bonus += 0.04; },
        achete: false
    },
    {
        id: "amelioration_robot_1",
        nom: "Engrenages huilés",
        description: "+3% de production des Robots",
        cout: 3000,
        effet: () => {usine_bonus += 0.03;},
        achete : false
    },
    {
        id: "amelioration_four_3",
        nom: "Fours en acier",
        description: "+5% de production des Fours",
        cout: 4000,
        effet: () => { four_bonus += 0.05; },
        achete: false
    },
    {
        id: "amelioration_four_4",
        nom: "Ventilation optimisée",
        description: "+6% de production des Fours",
        cout: 10000,
        effet: () => { four_bonus += 0.06; },
        achete: false
    },
    {
        id: "amelioration_four_5",
        nom: "Combustion propre",
        description: "+7% de production des Fours",
        cout: 25000,
        effet: () => { four_bonus += 0.07; },
        achete: false
    },
    {
        id: "amelioration_four_6",
        nom: "Isolation thermique",
        description: "+8% de production des Fours",
        cout: 50000,
        effet: () => { four_bonus += 0.08; },
        achete: false
    },
    {
        id: "amelioration_four_7",
        nom: "Brûleurs turbo",
        description: "+9% de production des Fours",
        cout: 100000,
        effet: () => { four_bonus += 0.09; },
        achete: false
    },
    {
        id: "amelioration_four_8",
        nom: "Réfractaire renforcé",
        description: "+10% de production des Fours",
        cout: 150000,
        effet: () => { four_bonus += 0.10; },
        achete: false
    },
    {
        id: "amelioration_four_9",
        nom: "Flammes bleues",
        description: "+11% de production des Fours",
        cout: 250000,
        effet: () => { four_bonus += 0.11; },
        achete: false
    },
    {
        id: "amelioration_four_10",
        nom: "Contrôle numérique",
        description: "+12% de production des Fours",
        cout: 1000000,
        effet: () => { four_bonus += 0.12; },
        achete: false
    },
    {
        id: "amelioration_four_11",
        nom: "Fournaises intelligentes",
        description: "+13% de production des Fours",
        cout: 1500000,
        effet: () => { four_bonus += 0.13; },
        achete: false
    },
    {
        id: "amelioration_four_12",
        nom: "Fours à plasma",
        description: "+14% de production des Fours",
        cout: 2000000,
        effet: () => { four_bonus += 0.14; },
        achete: false
    },
    {
        id: "amelioration_four_13",
        nom: "Nano-conduction",
        description: "+15% de production des Fours",
        cout: 2500000,
        effet: () => { four_bonus += 0.15; },
        achete: false
    },
    {
        id: "amelioration_four_14",
        nom: "Optimisation quantique",
        description: "+16% de production des Fours",
        cout: 3000000,
        effet: () => { four_bonus += 0.16; },
        achete: false
    },
    {
        id: "amelioration_four_15",
        nom: "Fours à fusion",
        description: "+17% de production des Fours",
        cout: 3500000,
        effet: () => { four_bonus += 0.17; },
        achete: false
    },
    {
        id: "amelioration_four_16",
        nom: "Énergie noire contrôlée",
        description: "+18% de production des Fours",
        cout: 4000000,
        effet: () => { four_bonus += 0.18; },
        achete: false
    },
    {
        id: "amelioration_four_17",
        nom: "Fours cosmiques",
        description: "+19% de production des Fours",
        cout: 5000000,
        effet: () => { four_bonus += 0.19; },
        achete: false
    },
    {
        id: "amelioration_four_18",
        nom: "Flammes dimensionnelles",
        description: "+20% de production des Fours",
        cout: 7000000,
        effet: () => { four_bonus += 0.20; },
        achete: false
    },
    {
        id: "amelioration_four_19",
        nom: "Surchauffe maîtrisée",
        description: "+21% de production des Fours",
        cout: 8000000,
        effet: () => { four_bonus += 0.21; },
        achete: false
    },
    {
        id: "amelioration_four_20",
        nom: "Réalité thermique alternée",
        description: "+22% de production des Fours",
        cout: 10000000,
        effet: () => { four_bonus += 0.22; },
        achete: false
    },
    {
        id: "amelioration_robot_2",
        nom: "Capteurs améliorés",
        description: "+4% de production des Robots",
        cout: 5000,
        effet: () => { robot_bonus += 0.04; },
        achete: false
    },
    {
        id: "amelioration_robot_3",
        nom: "Moteurs silencieux",
        description: "+5% de production des Robots",
        cout: 12000,
        effet: () => { robot_bonus += 0.05; },
        achete: false
    },
    {
        id: "amelioration_robot_4",
        nom: "IA basique",
        description: "+6% de production des Robots",
        cout: 15000,
        effet: () => { robot_bonus += 0.06; },
        achete: false
    },
    {
        id: "amelioration_robot_5",
        nom: "Reflexes assistés",
        description: "+7% de production des Robots",
        cout: 20000,
        effet: () => { robot_bonus += 0.07; },
        achete: false
    },
    {
        id: "amelioration_robot_6",
        nom: "Structures allégées",
        description: "+8% de production des Robots",
        cout: 30000,
        effet: () => { robot_bonus += 0.08; },
        achete: false
    },
    {
        id: "amelioration_robot_7",
        nom: "Lithium haute densité",
        description: "+9% de production des Robots",
        cout: 50000,
        effet: () => { robot_bonus += 0.09; },
        achete: false
    },
    {
        id: "amelioration_robot_8",
        nom: "Exosquelettes renforcés",
        description: "+10% de production des Robots",
        cout: 75000,
        effet: () => { robot_bonus += 0.10; },
        achete: false
    },
    {
        id: "amelioration_robot_9",
        nom: "Intelligence prédictive",
        description: "+11% de production des Robots",
        cout: 100000,
        effet: () => { robot_bonus += 0.11; },
        achete: false
    },
    {
        id: "amelioration_robot_10",
        nom: "Autonomie AI",
        description: "+12% de production des Robots",
        cout: 150000,
        effet: () => { robot_bonus += 0.12; },
        achete: false
    },
    {
        id: "amelioration_robot_11",
        nom: "Conscience semi-autonome",
        description: "+13% de production des Robots",
        cout: 200000,
        effet: () => { robot_bonus += 0.13; },
        achete: false
    },
    {
        id: "amelioration_robot_12",
        nom: "Logiciel prédictif",
        description: "+14% de production des Robots",
        cout: 400000,
        effet: () => { robot_bonus += 0.14; },
        achete: false
    },
    {
        id: "amelioration_robot_13",
        nom: "Matériaux intelligents",
        description: "+15% de production des Robots",
        cout: 500000,
        effet: () => { robot_bonus += 0.15; },
        achete: false
    },
    {
        id: "amelioration_robot_14",
        nom: "Refroidissement quantique",
        description: "+16% de production des Robots",
        cout: 700000,
        effet: () => { robot_bonus += 0.16; },
        achete: false
    },
    {
        id: "amelioration_robot_15",
        nom: "Transfert neural",
        description: "+17% de production des Robots",
        cout: 1000000,
        effet: () => { robot_bonus += 0.17; },
        achete: false
    },
    {
        id: "amelioration_robot_16",
        nom: "Nano-réparations",
        description: "+18% de production des Robots",
        cout: 2000000,
        effet: () => { robot_bonus += 0.18; },
        achete: false
    },
    {
        id: "amelioration_robot_17",
        nom: "Machines pensantes",
        description: "+19% de production des Robots",
        cout: 5000000,
        effet: () => { robot_bonus += 0.19; },
        achete: false
    },

    {
        id: "amelioration_usine_1",
        nom: "Ere industriel",
        description: "+3% de production des Usines",
        cout: 1200000,
        effet: () => { usine_bonus += 0.03; },
        achete: false
    },
    {
        id: "amelioration_usine_2",
        nom: "Production automatisée",
        description: "+6% de production des Usines",
        cout: 1700000,
        effet: () => { usine_bonus += 0.06; },
        achete: false
    },
    {
        id: "amelioration_usine_3",
        nom: "Robots d’assemblage",
        description: "+7% de production des Usines",
        cout: 220000,
        effet: () => { usine_bonus += 0.07; },
        achete: false
    },
    {
        id: "amelioration_usine_4",
        nom: "Maintenance prédictive",
        description: "+8% de production des Usines",
        cout: 3000000,
        effet: () => { usine_bonus += 0.08; },
        achete: false
    },
    {
        id: "amelioration_usine_5",
        nom: "Flux optimisé",
        description: "+9% de production des Usines",
        cout: 4000000,
        effet: () => { usine_bonus += 0.09; },
        achete: false
    },
    {
        id: "amelioration_usine_6",
        nom: "Chaînes modulaires",
        description: "+10% de production des Usines",
        cout: 6000000,
        effet: () => { usine_bonus += 0.10; },
        achete: false
    },
    {
        id: "amelioration_usine_7",
        nom: "Usines verticales",
        description: "+11% de production des Usines",
        cout: 800000,
        effet: () => { usine_bonus += 0.11; },
        achete: false
    },
    {
        id: "amelioration_usine_8",
        nom: "Systèmes cybernétiques",
        description: "+12% de production des Usines",
        cout: 10000000,
        effet: () => { usine_bonus += 0.12; },
        achete: false
    },
    {
        id: "amelioration_usine_9",
        nom: "Production par drones",
        description: "+13% de production des Usines",
        cout: 12500000,
        effet: () => { usine_bonus += 0.13; },
        achete: false
    },
    {
        id: "amelioration_usine_10",
        nom: "Réseau logistique intégré",
        description: "+14% de production des Usines",
        cout: 15000000,
        effet: () => { usine_bonus += 0.14; },
        achete: false
    },
    {
        id: "amelioration_usine_11",
        nom: "Fibre industrielle",
        description: "+15% de production des Usines",
        cout: 20000000,
        effet: () => { usine_bonus += 0.15; },
        achete: false
    },
    {
        id: "amelioration_usine_12",
        nom: "Énergie verte",
        description: "+16% de production des Usines",
        cout: 25000000,
        effet: () => { usine_bonus += 0.16; },
        achete: false
    },
    {
        id: "amelioration_usine_13",
        nom: "IA de régulation",
        description: "+17% de production des Usines",
        cout: 30000000,
        effet: () => { usine_bonus += 0.17; },
        achete: false
    },
    {
        id: "amelioration_usine_14",
        nom: "Modules nanofab",
        description: "+18% de production des Usines",
        cout: 40000000,
        effet: () => { usine_bonus += 0.18; },
        achete: false
    },
    {
        id: "amelioration_usine_15",
        nom: "Production parallèle",
        description: "+19% de production des Usines",
        cout: 50000000,
        effet: () => { usine_bonus += 0.19; },
        achete: false
    },

    // --- Améliorations Mamies (3) ---
    {
        id: "amelioration_mamie_1",
        nom: "La vieillesse n'est pas un problème",
        description: "+5% de production des Mamies",
        cout: 1200000000,
        effet: () => { mamie_bonus += 0.05; },
        achete: false
    },
    {
        id: "amelioration_mamie_2",
        nom: "Confitures énergétiques",
        description: "+10% de production des Mamies",
        cout: 2000000000,
        effet: () => { mamie_bonus += 0.10; },
        achete: false
    },
    {
        id: "amelioration_mamie_3",
        nom: "Repassage ultra-rapide",
        description: "+15% de production des Mamies",
        cout: 5000000000,
        effet: () => { mamie_bonus += 0.15; },
        achete: false
    },
    {
        id: "amelioration_clic_3",
        nom: "Phalange renforcée",
        description: "+5 valeur de clic",
        cout: 8000,
        effet: () => { valeur_clic += 5; },
        achete: false
    },
    {
        id: "amelioration_clic_4",
        nom: "Doigt d’acier",
        description: "+7 valeur de clic",
        cout: 12000,
        effet: () => { valeur_clic += 7; },
        achete: false
    },
    {
        id: "amelioration_clic_5",
        nom: "Pouce hydraulique",
        description: "+10 valeur de clic",
        cout: 20000,
        effet: () => { valeur_clic += 10; },
        achete: false
    },
    {
        id: "amelioration_clic_6",
        nom: "Main en carbone",
        description: "+13 valeur de clic",
        cout: 30000,
        effet: () => { valeur_clic += 13; },
        achete: false
    },
    {
        id: "amelioration_clic_7",
        nom: "Gantelet de puissance",
        description: "+16 valeur de clic",
        cout: 45000,
        effet: () => { valeur_clic += 16; },
        achete: false
    },
    {
        id: "amelioration_clic_8",
        nom: "Main cybernétique",
        description: "+20 valeur de clic",
        cout: 75000,
        effet: () => { valeur_clic += 20; },
        achete: false
    },
    {
        id: "amelioration_clic_9",
        nom: "Doigt supersonique",
        description: "+25 valeur de clic",
        cout: 100000,
        effet: () => { valeur_clic += 25; },
        achete: false
    },
    {
        id: "amelioration_clic_10",
        nom: "Mécanisme de frappe",
        description: "+30 valeur de clic",
        cout: 150000,
        effet: () => { valeur_clic += 30; },
        achete: false
    },
    {
        id: "amelioration_clic_11",
        nom: "Tactique numérique",
        description: "+35 valeur de clic",
        cout: 200000,
        effet: () => { valeur_clic += 35; },
        achete: false
    },
    {
        id: "amelioration_clic_12",
        nom: "Réflexe éclair",
        description: "+40 valeur de clic",
        cout: 270000,
        effet: () => { valeur_clic += 40; },
        achete: false
    },
    {
        id: "amelioration_clic_13",
        nom: "Main bionique",
        description: "+50 valeur de clic",
        cout: 350000,
        effet: () => { valeur_clic += 50; },
        achete: false
    },
    {
        id: "amelioration_clic_14",
        nom: "Surcharge tactile",
        description: "+60 valeur de clic",
        cout: 500000,
        effet: () => { valeur_clic += 60; },
        achete: false
    },
    {
        id: "amelioration_clic_15",
        nom: "Commandant du clic",
        description: "+75 valeur de clic",
        cout: 700000,
        effet: () => { valeur_clic += 75; },
        achete: false
    },
    {
        id: "amelioration_clic_16",
        nom: "Impact fractal",
        description: "+90 valeur de clic",
        cout: 800000,
        effet: () => { valeur_clic += 90; },
        achete: false
    },
    {
        id: "amelioration_clic_17",
        nom: "Réacteur digital",
        description: "+110 valeur de clic",
        cout: 900000,
        effet: () => { valeur_clic += 110; },
        achete: false
    },
    {
        id: "amelioration_clic_18",
        nom: "Explosion tactile",
        description: "+130 valeur de clic",
        cout: 1200000,
        effet: () => { valeur_clic += 130; },
        achete: false
    },
    {
        id: "amelioration_clic_19",
        nom: "Main quantique",
        description: "+150 valeur de clic",
        cout: 1500000,
        effet: () => { valeur_clic += 150; },
        achete: false
    },
    {
        id: "amelioration_clic_20",
        nom: "Créateur de l’infini",
        description: "+175 valeur de clic",
        cout: 2000000,
        effet: () => { valeur_clic += 175; },
        achete: false
    }    
];

function afficherAmeliorations() {
    const shopDiv = document.getElementById("Upgrades");
    shopDiv.innerHTML = "";

    const types = ["clic", "four", "robot", "usine", "mamie"];
    const aAfficher = [];

    for (const type of types) {
        const am = ameliorations.find(am =>
            !am.achete && am.id.startsWith(`amelioration_${type}_`)
        );
        if (am) {
            aAfficher.push(am);
        }
    }

    aAfficher.forEach(am => {
        const btn = document.createElement("button");
        btn.id = am.id;
        btn.innerText = `${am.nom}\n${am.description}\nCoût : ${formater(am.cout)}$`;
        btn.onclick = () => acheterAmelioration(am.id);
        shopDiv.appendChild(btn);
        shopDiv.appendChild(document.createElement("br"));
    });
}


function acheterAmelioration(id) {
    const am = ameliorations.find(a => a.id === id);
    if (!am || am.achete) return;
    if (money >= am.cout) {
        money -= am.cout;
        am.effet();
        am.achete = true;
        UpdateScore();
        UpdateCPC();
        UpdateBoost();
        afficherAmeliorations();
    } else {
        alert("Pas assez d'argent !");
    }
}



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
                afficherAmeliorationsRebirth();
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
        valeur_clic: valeur_clic,
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
        ameliorationsEtat: ameliorations.map(a => ({ achete: a.achete})),
    };

    const sauvegardeJSON = JSON.stringify(sauvegarde);
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
    valeur_clic = sauvegarde.valeur_clic
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

        if (sauvegarde.ameliorationsEtat) {
            sauvegarde.ameliorationsEtat.forEach((etat, i) => {
                ameliorations[i].achete = etat.achete;
                // applique effet si acheté
                if (etat.achete && ameliorations[i].effet) ameliorations[i].effet();
            });
        }

        if (sauvegarde.ameliorationsRebirthEtat) {
            sauvegarde.ameliorationsRebirthEtat.forEach((etat, i) => {
                ameliorationsRebirth[i].achete = etat.achete;
                // applique effet si acheté
                if (etat.achete && ameliorationsRebirth[i].effet) ameliorationsRebirth[i].effet();
            });
        }

}
    console.log("Partie chargée !");
}

function resetPartie() {
    if (confirm("Es-tu sûr de vouloir réinitialiser la partie ?")) {
        localStorage.removeItem("sauvegarde");

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
        ameliorations.forEach(am => am.achete = false);


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

        UpdateScore();
        UpdateCPS();
        UpdateCPC();
        UpdateBoost();

    }
}

window.onload = () => {
    chargerPartie(); 
    valeur_clic = 1 * (1 + overall_boost / 100);  
    UpdateScore(); 
    updateBoutons();
    UpdateBoost()
};
