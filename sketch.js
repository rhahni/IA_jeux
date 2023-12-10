
let vcl;
let target;
let obstacles = [];
let vehicles = [];
let state = false;
let stars = [];

let imgVaisseau;
// Remplacez 5 par le nombre souhaité de véhicules
let nbVehicles = 5;  

function setup() {
  createCanvas(windowWidth, windowHeight);
  imgVaisseau = loadImage('assets/images/vaisseau.png');
  vcl = new Vehicle(random(width),random(height), imgVaisseau)
  vehicles.push(vcl);
  

  
  sliderRadiusSeperation=createSlider(15,210,28,2)
  sliderSeperation=createSlider(0,3,0.4,0.01)

  // On cree un obstalce au milieu de l'écran
  obstacle = new Obstacle(-width / 0.5, -height / 0.5, 100);
  obstacles.push(obstacle);
  
}


function draw() {
  // Background with a slight transparency for a trailing effect
  background(0, 0, 0, 100);
 // Mettez à jour la position de la cible avec la souris
 let targetS = createVector(mouseX, mouseY);


  // Dessin de la cible qui suit la souris
  fill(255, 0, 0);
  noStroke();
  for (let i = 0; i < 12; i++) {
    let angle = map(i, 0, 12, 0, TWO_PI);
    let x = targetS.x + 15 * cos(angle);
    let y = targetS.y + 15 * sin(angle);
    ellipse(x, y, 5, 5);
  }

  // Draw obstacles
  obstacles.forEach(o => {
    o.show();
  });


  // Behavior logic for vehicles
  if (state) {
    for (i = 0; i < vehicles.length; i++) {
      // Behavior for the lead vehicle
      if (i == 0) {
        vehicles[i].applyBehaviors(targetS, obstacles, vehicles);
        this.weightSeparation = 0;
      } else {
        // Behavior for follower vehicles
        let vehiculePrecedent = vehicles[i - 1];

        // Calculate a point behind the preceding vehicle for aiming
        let pointDerriere = vehiculePrecedent.vel.copy();
        pointDerriere.normalize();
        pointDerriere.mult(-50);
        pointDerriere.add(vehiculePrecedent.pos);

        // Display the point behind as a debug circle
        fill(255, 0, 0);
        circle(pointDerriere.x, pointDerriere.y, 5);

        // Apply behaviors for follower vehicles
        vehicles[i].applyBehaviors(pointDerriere, obstacles, vehicles);
        this.weightSeparation = 0;

        // If the vehicle is close to the target point and nearly stationary, stop
        if (vehicles[i].pos.dist(pointDerriere) < 20 && vehicles[i].vel.mag() < 0.01) {
          vehicles[i].weightArrive = 0;
          vehicles[i].weightObstacle = 0;
          vehicles[i].vel.setHeading(p5.Vector.sub(vehiculePrecedent.pos, vehicles[i].pos).heading());
        } else {
          vehicles[i].weightArrive = 0.3;
          vehicles[i].weightObstacle = 0.9;
        }
      }

      // Update and display each vehicle
      vehicles[i].update();
      vehicles[i].show();
    }
  } else {
    // Behavior logic for vehicles in an alternate state
    for (i = 0; i < vehicles.length; i++) {
      // Behavior for the lead vehicle
      if (i == 0) {
        vehicles[i].applyBehaviors(targetS, obstacles, vehicles);
        this.weightSeparation = 0;
      } else {
        // Behavior for follower vehicles
        let vehiculePrecedent = vehicles[0];

        // Calculate a point behind the preceding vehicle for aiming
        let pointDerriere = vehiculePrecedent.vel.copy();
        pointDerriere.normalize();
        pointDerriere.mult(-150);
        pointDerriere.add(vehiculePrecedent.pos);

        // Display the point behind as a debug circle
        fill(255, 0, 0);
        circle(pointDerriere.x, pointDerriere.y, 10);

        // Apply behaviors for follower vehicles
        vehicles[i].applyBehaviors(pointDerriere, obstacles, vehicles);
        // Set separation weight and radius using sliders
        vehicles[i].weightSeparation = sliderSeperation.value();
        vehicles[i].perceptionRadius = sliderRadiusSeperation.value();
      }

      // Update and display each vehicle
      vehicles[i].update();
      vehicles[i].show();
    }
  }

}

// Function called on mouse press to create obstacles
function mousePressed() {
  obstacle = new Obstacle(mouseX, mouseY, random(30, 100));
  obstacles.push(obstacle);
}

function keyPressed() {
  
  if (key == "w") {
    vehicles.push(new Vehicle(random(width), random(height), imgVaisseau));
  }
  if(key == "s"){
    state=!state
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }
  if (key == "t") {
    // Create nbVehicles vehicles
    for (let i = 0; i < nbVehicles; i++) {
      let vehicle = new Vehicle(random(width), random(height), imgVaisseau);
      vehicles.push(vehicle);
    }
  }
    


}