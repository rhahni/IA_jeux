Mini projet à rendre” !

- Ce projet vise à créer un système multi-agents en utilisant la bibliothèque p5.js. 
L'objectif est d'implémenter divers comportements pour les véhicules, notamment le suivi de leader,
le comportement de serpent, l'évitement d'obstacles, et l'exploration aléatoire (wander).

- Fonctionnalités Implémentées
  + Comportement d'Évitement d'Obstacles
    Tous les véhicules sont programmés pour éviter les obstacles présents dans l'environnement.
    La méthode avoid est utilisée dans la méthode applyBehaviors pour générer une force d'évitement.
 + Comportement Wander
    Les véhicules peuvent avoir un comportement de dérive aléatoire (wander) pour ajouter une composante d'exploration à leur mouvement.
    La méthode drift a été implémentée pour simuler un mouvement de dérive aléatoire.
- Les touche
    La touche "s" changer les modes (leader/Snake).
    La touche "d" active le mode de débogage.
    Un clic de souris crée un nouvel obstacle.
    La touche "w" crée un nouveau véhicule qui suit le point ou le cercle rouge.
    La touche "f" crée 5 véhicules qui suivent le leader ou le serpent.
Comportement du Transparent Précédent (Suivi de Leader avec Séparation et Évasion)
La méthode applyBehaviors a été étendue pour inclure le suivi de leader avec séparation et évasion.
La méthode avoidHead a été implémentée pour empêcher les véhicules de se positionner devant le leader.
Ajout de Véhicules avec Comportements Wander + Évitement d'Obstacles + Repoussés par les Bords(Pour repoussés par les bords de l'écran j'ai codé mais elle fonctionne pas)
  
