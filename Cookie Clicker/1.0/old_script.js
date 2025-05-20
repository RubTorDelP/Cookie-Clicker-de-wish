console.log("Javascript lancé");

let valeur_clic = 1;
let money = 0;
let bonus_cookie = 0;
let Money_par_s = 0;
let cookie_niveau = 0;
let overall_boost = 0;
let four_bonus = 1;
let robot_bonus = 1;
let usine_bonus = 1;
let mamie_bonus = 1;

setInterval(() => {
    RevenuPassif();
    ProductionAutomatique();
    UpdateCPC();
    UpdateCPS();
}, 1000);


const Four = {
    n: 0,
    get PC() {
        return 0.1 * (overall_boost + four_bonus);
    },
    valeurC: 10,
  
    achat() {
        if (money >= this.valeurC){
            this.n += 1;
            this.valeurC = Math.floor(this.valeurC * 1.05);
        }
    }
};


const Robot = {
    n: 0,
    get P_a() {
        return Math.floor(1 * (overall_boost + robot_bonus));
    },
    valeur_a: 100,
    valeurC: 1000,
  
    achat() {
      if (Four.n >= this.valeur_a && money >= this.valeurC) {
        this.n += 1;
        money -= this.valeurC;
        Four.n -= this.valeur_a;
        this.valeurC = Math.floor(this.valeurC * 1.05);
      }
    },
  
    prod() {
      Four.n += this.n * this.P_a;
    }
};


const Usine = {
    n: 0,
    get P_a() {
        return Math.floor(1 * (overall_boost + usine_bonus));
    },       
    valeur_a: 10000,   
    valeurC: 1000000,
  
    achat() {
      if (Robot.n >= this.valeur_a && money >= this.valeurC) {
        this.n += 1;
        money -= this.valeurC;
        Four.n -= this.valeur_a
        this.valeurC = Math.floor(this.valeurC * 1.05);
      }
    },
  
    prod() {
      Robot.n += this.n * this.P_a;
    }
};

const Mamie = {
    n: 0,
    get P_a() {
        return Math.floor(1 * (overall_boost + mamie_bonus));
    },         
    valeur_a: 1000000,  
    valeurC: 1000000000,
  
    achat() {
      if (Usine.n >= this.valeur_a && money >= this.valeurC) {
        this.n += 1;
        money -= this.valeurC;
        Four.n -= this.valeur_a
        this.valeurC = Math.floor(this.valeurC * 1.05);
      }
    },
  
    prod() {
      Usine.n += this.n * this.P_a;
    }
};

function ProductionAutomatique() {
    Mamie.prod();
    Usine.prod();
    Robot.prod();
}

  
function UpdateScore(){
    let money_1_decimal = money.toFixed(1);
    let Money_Display = document.getElementById("Score");
    Money_Display.innerText = money_1_decimal + "$"
}

function UpdateCPS(){
    let CPS_1_decimal = Money_par_s.toFixed(1);
    let CPS_Display = document.getElementById("CPS");
    CPS_Display.innerText = "Revenu Passif :" + CPS_1_decimal
}

function UpdateCPC(){
    ProductionAutomatique();
    let CPC_1_decimal = valeur_clic.toFixed(1);
    let CPC_Display = document.getElementById("ClicValue");
    CPC_Display.innerText = "Valeur de clic :" + CPC_1_decimal
}

function UpdateCookieStatus(l){
    CSD = document.getElementById("CookieStatus");
    CSD.innerText = "Cookie Actuel : " + l;
}

function compte(){
    money += valeur_clic;
    UpdateScore()
}

function achat(prix, y){
    if (money >= prix){
        valeur_clic += y * (bonus_cookie/100 + 1);
        money -= prix;
        UpdateScore()
        UpdateCPC()
    }
}


function RevenuPassif(){
    money += (Money_par_s * (bonus_cookie/100 + 1))/10;
    UpdateScore()
}

setInterval(RevenuPassif, 100);   

function achatps(prix, y){
    if (money >= prix){
        Money_par_s += y * (bonus_cookie/100 + 1);
        money -= prix;
        UpdateCPS()
        UpdateScore()
    }
}

function achatC(prix, y, x){
    if (money >= prix && cookie_niveau < x){
        bonus_cookie = y;
        money -= prix;
        cookie_niveau = x;
        UpdateCookieStatus()
        ChangeCookieSkin()
        UpdateScore()
        UpdateCPS()
        UpdateCPC()
    }
}

function ChangeCookieSkin(){
    switch(cookie_niveau){
        case 1:
            document.getElementById('cookie').classList.toggle('niveau1');
            UpdateCookieStatus("Cookie ordinaire (+10%)")
            break;
        case 2:
            document.getElementById('cookie').classList.toggle('niveau2');
            UpdateCookieStatus("Cookie en Bronze (+50%)")
            break;
        case 3:
            document.getElementById('cookie').classList.toggle('niveau3');
            UpdateCookieStatus("Cookie en Argent (+100%)")
            break;
        case 4:
            document.getElementById('cookie').classList.toggle('niveau4');
            UpdateCookieStatus("Cookie en Or (+1000%)")
            break;
    }
    
}