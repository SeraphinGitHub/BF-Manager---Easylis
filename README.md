
Tout les modules Node sont déjà inclus dans l'archive ZIP,
l'application est donc toute prête à être testé;

Simplement entrer la commande "nodemon" dans le terminal;

Remplir le fichier de variables d'environnement .env avec vos propres données concernant la DB;

Si toutes les variables d'env. sont correctes et la DB déjà créée vous devriez avoir affiché:
<!--  -->
Listening on port (Port Choisi)
Connected to BF_Manager DataBase !
<!--  -->



L'application BF Manager contient toutes les exigences demandées, plus quelques extra (pour le plaisir de coder);

 ==> Fonctionalités exigées de base:
      - Création de parties
      - Suppression des parties créées
      - Une fois la partie rejointe, possibilité de terminer la partie
      - Différentiation des parties en cours et parties terminées
      - Compteur de parties en cours uniquement
      - Propagation en temps réel à tout les autres clients
      - Aucune identification n'est requise
      - Aucun rafraichissement de page n'est requis


 ==> Fonctionalités ajoutée en extra:

   <!-- Parties -->
      - Chaque partie est unique, pas de doublon
      - Suppression de partie uniquement si créateur sauf Admin
      - Compteur de joueurs connectés à chaque partie
      - Date de création et de modification (fin) de partie
      - Possibilité de sortir de la partie, et d'y retourner
      - Statuts et nom des joueurs se connectant ou sortant de la partie


   <!-- Chat -->
      - Ajout d'un Chat général
      - Ajout d'un Chat privé
      - Ajout d'un onglet social et voir tout les autres joueurs qui sont connectés
      - Affichage du nom du joueur et modification possible
      - Suppression des joueurs si Admin
   

   <!-- Utilisation Chat -->
      Pour communiquer avec un autre joueur en privé, allez dans l'onglet "Social" et clickez
      sur la bulle en face du nom du joueur;

      Attention ! ==> Si le joueur modifie son nom, il faudra reclicker sur la bulle du nouveau nom;
   

   <!-- Passage en mode Admin -->
      Rentrez un "Nom de joueur Admin" en variables d'environnement, celui ci doit être
      en dessous de 20 caractères et au dessus de 5, sans accents ni caractères spéciaux
      pour passé les RegEx client et backend.

      Simplement clicker sur "modifier votre nom" et entrer le même nom que celui en variables d'environnement.

      Si vous valider vous devriez voir une croix rouge à la droite de chaque partie et donc la possibilité de supprimer
      toutes les parties, même celles que vous n'avez pas créées.

      Également dans l'onglet social, vous devriez voir tous les joueurs enregistrés dans la DB en ligne orange avec une croix rouge également, avec la possibilité de supprimer chaque joueur.



Pour réaliser cette application j'ai utilisé:
      - Node.js
      - PostGreSQL sans ORM, SQL natif
      - Client JS vanilla
      - Librairie socket.io pour les web sockets