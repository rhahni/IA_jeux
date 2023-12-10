function findProjection(pos, a, b) {
  let v1 = p5.Vector.sub(a, pos);
  let v2 = p5.Vector.sub(b, pos);
  v2.normalize();
  let sp = v1.dot(v2);
  v2.mult(sp);
  v2.add(pos);
  return v2;
}
  
  class Vehicle {
    static debug = false;
  
    constructor(x, y, imageVaisseau) {
      this.imageVaisseau = imageVaisseau;
      // position du véhicule
      this.pos = createVector(x, y);
      // vitesse du véhicule
      this.vel = createVector(0, 0);
      // accélération du véhicule
      this.acc = createVector(0, 0);
      // vitesse maximale du véhicule
      this.maxSpeed = 4;
      // force maximale appliquée au véhicule
      this.maxForce = 0.7;
      this.color = "white";
      // à peu près en secondes
      this.dureeDeVie = 5;
  
      this.r_pourDessin = 16;
      // rayon du véhicule pour l'évitement
      this.r = this.r_pourDessin * 3;
  
      // Pour évitement d'obstacle
      this.largeurZoneEvitementDevantVaisseau = this.r / 2;
      this.distanceAhead = 30;
  
      // chemin derrière vaisseaux
      this.path = [];
      this.pathMaxLength = 30;
    }
 //fonction pour simuler un mouvement de dérive aléatoire
 drift() {
  // Point devant le véhicule, défini à une distance fixe devant la direction actuelle de déplacement
  let driftPoint = this.vel.copy();
  driftPoint.setMag(100);
  driftPoint.add(this.pos);

  // Rayon du cercle autour du point de dérive
  let driftRadius = 50;

  // Angle (theta) pour déterminer la position sur le cercle de dérive
  let theta = this.driftTheta + this.vel.heading();

  // Calcul des coordonnées (x, y) sur le cercle de dérive
  let x = driftRadius * cos(theta);
  let y = driftRadius * sin(theta);

  // Ajout des coordonnées au point de dérive
  driftPoint.add(x, y);

  // Calcul de la force de direction vers le point de dérive
  let steer = driftPoint.sub(this.pos);

  // Normalisation et application de la force maximale
  steer.setMag(this.maxForce);
  this.applyForce(steer);

  // Paramètres pour la variation aléatoire de la dérive
  this.displaceRange = 0.3;
  this.driftTheta += random(-this.displaceRange, this.displaceRange);
}

  // Méthode pour appliquer les comportements seek et avoid
applyBehaviors(target, obstacles, vehicles) {
  // Force résultante de l'approche de la cible
  let arriveForce = this.arrive(target);
  // Force résultante de l'évitement d'obstacles amélioré
  let avoidForce = this.avoid(obstacles, vehicles, false);
  // Force résultante de la séparation entre les véhicules
  let separationForce = this.separation(vehicles);
  // Application des poids à chaque force résultante
  arriveForce.mult(this.weightArrive);
  avoidForce.mult(this.weightObstacle);
  separationForce.mult(this.weightSeparation);

  // Application des forces résultantes
  this.applyForce(arriveForce);
  this.applyForce(avoidForce);
  this.applyForce(separationForce);
}

// Méthode pour appliquer la séparation entre les véhicules
separation(vehicles) {
  // Vecteur de direction résultant de la séparation
  let steering = createVector();

  // Compteur pour suivre le nombre de véhicules pris en compte dans la séparation
  let total = 0;

  // Parcours de tous les autres véhicules
  for (let other of vehicles) {
      // Calcul de la distance entre ce véhicule et les autres
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

      // Vérification si l'autre véhicule n'est pas celui-ci et est dans la perceptionRadius
      if (other != this && d < this.perceptionRadius) {
          // Calcul du vecteur différence et ajustement par inverse carré de la distance
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(d * d);

          // Addition du vecteur différence au vecteur de direction résultant
          steering.add(diff);

          // Incrémentation du compteur
          total++;
      }
  }

  // S'il y a au moins un autre véhicule pris en compte
  if (total > 0) {
      // Calcul de la moyenne des vecteurs de direction
      steering.div(total);

      // Normalisation et ajustement à la vitesse maximale
      steering.setMag(this.maxSpeed);

      // Soustraction de la vélocité actuelle
      steering.sub(this.velocity);

      // Limitation à la force maximale
      steering.limit(this.maxForce);
  }

  // Retourne le vecteur de direction résultant
  return steering;
}

// Méthode d'évitement d'obstacle, implémente le comportement avoid
// renvoie une force (un vecteur) pour éviter l'obstacle
avoid(obstacles) {
  // calcul d'un vecteur ahead devant le véhicule
  // il regarde par exemple 50 frames devant lui
  let ahead = this.vel.copy();
  ahead.mult(this.distanceAhead);
  // on l'ajoute à la position du véhicule
  let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);

  if (Vehicle.debug) {
    // on le dessine avec ma méthode this.drawVector(pos vecteur, color)
    this.drawVector(this.pos, ahead, color(255, 0, 0));
    // On dessine ce point au bout du vecteur ahead pour debugger
    fill("lightgreen");
    noStroke();
    circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);

    // On dessine ce point au bout du vecteur ahead pour debugger
    fill("lightgreen");
    noStroke();
    circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
  }

  // Calcule de ahead2, deux fois plus petit que le premier
  let ahead2 = ahead.copy();
  ahead2.mult(0.5);
  let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);
  if (Vehicle.debug) {

    // on le dessine avec ma méthode this.drawVector(pos vecteur, color)
    this.drawVector(this.pos, ahead2, color("lightblue"));
    // On dessine ce point au bout du vecteur ahead pour debugger
    fill("orange");
    noStroke();
    circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 10);
  }
  // Detection de l'obstacle le plus proche
  let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

  // Si pas d'obstacle, on renvoie un vecteur nul
  if (obstacleLePlusProche == undefined) {
    return createVector(0, 0);
  }

  // On calcule la distance entre le centre du cercle de l'obstacle 
  // et le bout du vecteur ahead
  let distance = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead);
  // et pour ahead2
  let distance2 = obstacleLePlusProche.pos.dist(pointAuBoutDeAhead2);
  // et pour la position du vaiseau
  let distance3 = obstacleLePlusProche.pos.dist(this.pos);

  let plusPetiteDistance = min(distance, distance2);
  plusPetiteDistance = min(plusPetiteDistance, distance3);

  let pointLePlusProcheDeObstacle = undefined;
  let alerteRougeVaisseauDansObstacle = false;

  if (distance == plusPetiteDistance) {
    pointLePlusProcheDeObstacle = pointAuBoutDeAhead;
  } else if (distance2 == plusPetiteDistance) {
    pointLePlusProcheDeObstacle = pointAuBoutDeAhead2;
  } else if (distance3 == plusPetiteDistance) {
    pointLePlusProcheDeObstacle = this.pos;
    // si le vaisseau est dans l'obstacle, alors alerte rouge !
    if (distance3 < obstacleLePlusProche.r) {
      alerteRougeVaisseauDansObstacle = true;
      obstacleLePlusProche.color = color("red");
    } else {
      obstacleLePlusProche.color = "green";
    }
  }

  
  // On dessine la zone d'évitement
  // Pour cela on trace une ligne large qui va de la position du vaisseau
  // jusqu'au point au bout de ahead
  if (Vehicle.debug) {
    stroke(255, 200, 0, 90);
    strokeWeight(this.largeurZoneEvitementDevantVaisseau);
    line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
  }
  // si la distance est < rayon de l'obstacle
  // il y a collision possible et on dessine l'obstacle en rouge

  if (plusPetiteDistance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
    // collision possible

    // calcul de la force d'évitement. C'est un vecteur qui va
    // du centre de l'obstacle vers le point au bout du vecteur ahead
    let force = p5.Vector.sub(pointLePlusProcheDeObstacle, obstacleLePlusProche.pos);

    // on le dessine en jaune pour vérifier qu'il est ok (dans le bon sens etc)
    if(Vehicle.debug)
      this.drawVector(obstacleLePlusProche.pos, force, "yellow");

    // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
    // on limite ce vecteur à la longueur maxSpeed
    // force est la vitesse désirée
    force.setMag(this.maxSpeed);
    // on calcule la force à appliquer pour atteindre la cible avec la formule
    // que vous commencez à connaitre : force = vitesse désirée - vitesse courante
    force.sub(this.vel);
    // on limite cette force à la longueur maxForce
    force.limit(this.maxForce);

    if (alerteRougeVaisseauDansObstacle) {
      return force.setMag(this.maxForce * 2);
    } else {
      return force;
    }

  } else {
    // pas de collision possible
    return createVector(0, 0);
  }
}   

getObstacleLePlusProche(obstacles) {
  let plusPetiteDistance = 100000000;
  let obstacleLePlusProche;

  // Parcours de tous les obstacles dans le tableau
  obstacles.forEach(o => {
      // Je calcule la distance entre le vaisseau et l'obstacle
      const distance = this.pos.dist(o.pos);

      // Vérification si la distance est plus petite que la plus petite distance connue
      if (distance < plusPetiteDistance) {
          // Mise à jour de la plus petite distance et de l'obstacle le plus proche
          plusPetiteDistance = distance;
          obstacleLePlusProche = o;
      }
  });

  // Retourne l'obstacle le plus proche
  return obstacleLePlusProche;
}

getVehiculeLePlusProche(vehicules) {
  let plusPetiteDistance = Infinity;
  let vehiculeLePlusProche;

  vehicules.forEach(v => {
    if (v != this) {
      // Je calcule la distance entre le vaisseau et le vehicule
      const distance = this.pos.dist(v.pos);
      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        vehiculeLePlusProche = v;
      }
    }
  });

  return vehiculeLePlusProche;
}


arrive(target) {
   // 2nd argument true enables the arrival behavior
    return this.seek(target, true);
}

seek(target, arrival = false) {
  let force = p5.Vector.sub(target, this.pos);
  let desiredSpeed = this.maxSpeed;
  if (arrival) {
      let slowRadius = 100;
      let distance = force.mag();
      if (distance < slowRadius) {
          desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
  }
  force.setMag(desiredSpeed);
  force.sub(this.vel);
  force.limit(this.maxForce);
  return force;
}

// inverse de seek !
flee(target) {
  // Utilisation du comportement inverse de seek pour fuir la cible
  return this.seek(target).mult(-1);
} 
 /* Poursuite d'un point devant la target !
    cette methode renvoie la force à appliquer au véhicule
 */
pursue(vehicle) {
      let target = vehicle.pos.copy();
      let prediction = vehicle.vel.copy();
      prediction.mult(10);
      target.add(prediction);
      fill(0, 255, 0);
      circle(target.x, target.y, 16);
      return this.seek(target);
}

evade(vehicle) {
  let pursuit = this.pursue(vehicle);
  pursuit.mult(-1);
  return pursuit;
}

  
  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteurr force au vecteur accélération
  applyForce(force) {
   this.acc.add(force);
  }

  update() {
    // on ajoute l'accélération à la vitesse. L'accélération est un incrément de vitesse
    // (accélératiion = dérivée de la vitesse)
    this.vel.add(this.acc);
    // on contraint la vitesse à la valeur maxSpeed
    this.vel.limit(this.maxSpeed);
    // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
    // (la vitesse est la dérivée de la position)
    this.pos.add(this.vel);

    // on remet l'accélération à zéro
    this.acc.set(0, 0);
    // Ajout de la vérification pour les bords de l'écran
    this.edges();

    // mise à jour du path (la trainée derrière)
    this.ajoutePosAuPath();
    

    // durée de vie
    this.dureeDeVie -= 0.01;
  }
  
  ajoutePosAuPath() {
    // on rajoute la position courante dans le tableau
    this.path.push(this.pos.copy());

    // si le tableau a plus de 50 éléments, on vire le plus ancien
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
  }
  // On dessine le véhicule, le chemin etc.
  show() {
    // dessin du chemin
    this.drawPath();
    // dessin du vehicule
    this.drawVehicle();
  }
  
  drawVehicle() {
    // formes fil de fer en rouge
    stroke(255, 0, 0); 
    // épaisseur du trait = 3
    strokeWeight(3);
    // sauvegarde du contexte graphique (couleur pleine, fil de fer, épaisseur du trait, 
    // position et rotation du repère de référence)
    push();
    // on déplace le repère de référence.
    translate(this.pos.x, this.pos.y);
    // et on le tourne. heading() renvoie l'angle du vecteur vitesse (c'est l'angle du véhicule)
    rotate(this.vel.heading());
  
    imageMode(CENTER);
    rotate(PI/2);
    image(this.imageVaisseau, 0, 0, this.r_pourDessin * 2, this.r_pourDessin * 2);
    pop();
    this.drawVector(this.pos, this.vel, color(0, 255, 0));
  
    // triangle pour évitement entre vehicules et obstacles
    if (Vehicle.debug) {
      stroke(255);
      noFill();
      circle(this.pos.x, this.pos.y, this.r);
    }
  }
  
  
drawPath() {
      push();
      stroke(255);
      noFill();
      strokeWeight(1);
  
      fill(this.color);
      // dessin du chemin
      this.path.forEach((p, index) => {
        if (!(index % 5)) {
          circle(p.x, p.y, 1);
        }
      });
      pop();
    }

    // Méthode pour dessiner un vecteur
    drawVector(pos, v, color) {
      push();
      // Dessin du vecteur vitesse
      // Il part du centre du véhicule et va dans la direction du vecteur vitesse
      strokeWeight(3);
      stroke(color);
      line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
      // dessine une petite fleche au bout du vecteur vitesse
      let arrowSize = 5;
      translate(pos.x + v.x, pos.y + v.y);
      rotate(v.heading());
      translate(-arrowSize / 2, 0);
      triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
      pop();
    }
// Méthode pour ajuster la position du véhicule aux bords de l'espace de travail
edges() {
  if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
  } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
  }
  if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
  } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
  }}




}


  
  
 class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(5);
    }
  
  }
  

    // Add this class for bullets at the beginning of your sketch.js file
  class Bullet extends Vehicle {
    constructor(x, y, target) {
      super(x, y);
      this.maxSpeed = 12; // Adjust the speed of bullets as needed
      this.target = target;
    }

    update() {
      // Override the update method to make bullets seek the target
      let seekForce = this.seek(this.target.pos);
      this.applyForce(seekForce);
      super.update();
    }

     

// Méthode pour afficher la cible
show() {
  push(); // Sauvegarde du contexte graphique
  stroke(144, 238, 144); // Couleur des contours
  strokeWeight(7); // Épaisseur des contours
  push(); // Nouvelle sauvegarde du contexte graphique
  translate(this.pos.x, this.pos.y); // Translation à la position de la cible
  rect(0, 0, 2, 2); 
  pop(); // Restauration du contexte graphique précédent

  pop(); // Restauration du contexte graphique initial
}
  }