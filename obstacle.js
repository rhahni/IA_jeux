class Obstacle {
  // Constructeur de la classe avec des paramètres x, y et r
  constructor(x, y, r) {
    // Création d'un vecteur de position avec les coordonnées x et y
    this.pos = createVector(x, y);
    
    // Attribution d'un rayon à l'obstacle
    this.r = r;
    
    // Attribution de la couleur rose par défaut à l'obstacle
    this.color = color('#3E8EDE');
  }

  // Méthode pour afficher l'obstacle
  show() {
    // Sauvegarde de l'état graphique actuel
    push();
    
    // Remplissage de la forme avec la couleur définie pour l'obstacle 
    fill(255);
    
    // Définition de la couleur des contours en gris
    stroke('#AFDBF5');
    
    // Définition de l'épaisseur des contours
    strokeWeight(2);
    
    // Dessin d'une ellipse à la position spécifiée avec une taille égale au double du rayon de l'obstacle
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    
    // Dessin d'un contour octogonal autour de l'ellipse
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = map(i, 0, 8, 0, TWO_PI);
      let x = this.pos.x + cos(angle) * this.r;
      let y = this.pos.y + sin(angle) * this.r;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Restauration de l'état graphique précédent
    pop();
  }
}
