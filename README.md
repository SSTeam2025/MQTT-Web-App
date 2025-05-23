# MQTT-Web-App
Documentație Backend - Platformă Recepție și Procesare Imagini prin MQTT

1. Recepția și salvarea imaginilor transmise prin MQTT

Platforma se conectează la un broker MQTT și se abonează la topicurile de tip images/{deviceId} pentru a primi imagini de la dispozitive mobile. Fiecare mesaj conține o imagine codificată în Base64 însoțită de metadate precum formatul, numele fișierului și ID-ul dispozitivului. Imaginile sunt decodificate, redimensionate pentru optimizare și salvate local. Metadatele sunt stocate în baza de date PostgreSQL.

2. Autentificare și gestionare utilizatori

Sistemul include o componentă de autentificare bazată pe JWT și permite gestionarea utilizatorilor cu roluri distincte (admin, operator, vizualizator). Accesul la endpointurile REST este securizat, iar utilizatorii pot fi înregistrați și autentificați prin mecanisme standard de login. Tokenul JWT este necesar pentru accesarea majorității resurselor API.

3. Vizualizarea și gestionarea dispozitivelor conectate

Dispozitivele mobile care trimit imagini sunt înregistrate automat în sistem pe baza ID-ului. Starea dispozitivelor (online/offline) este determinată din mesajele MQTT primite:

Când un dispozitiv trimite pentru prima dată o imagine, este adăugat ca "online".

Dacă dispozitivul trimite pe topicul command/{deviceId} un mesaj {"command": "disconnect"}, este marcat ca "offline".

Administratorii pot vizualiza lista dispozitivelor si pot alege dintre modurile de operare.

4. Moduri de operare: normal și live

Platforma suportă două moduri de transmitere a imaginilor:

Modul normal (periodic și la cerere):

Periodic: Dispozitivele trimit automat imagini la intervale regulate.

La cerere: Frontend-ul face un request POST /api/capture?deviceId=..., iar backend-ul publică un mesaj MQTT pe command/{deviceId} cu {"command": "capture"}. Dispozitivul răspunde prin trimiterea unei imagini pe images/{deviceId}, iar frontendul ia ultima imagine uploadata de catre acel device din backend.

Modul live:

Dispozitivul trimite continuu imagini pe device/{deviceId}/live.

Frontend-ul se conectează direct la brokerul MQTT prin WebSocket și afișează în timp real imaginile.

5. Procesarea imaginilor

Imaginile recepționate sunt procesate automat pentru optimizare (ex. redimensionare la dimensiune standard). Platforma include suport pentru filtre de bază (contrast, luminozitate, grayscale) și poate realiza analiză simplă precum histogramă de culori sau detecția muchiilor.

6. Descărcarea și vizualizarea imaginilor

Utilizatorii pot accesa o galerie unde pot vizualiza și filtra imaginile în funcție de dispozitiv și interval temporal. Endpointurile REST permit obținerea celei mai recente imagini, precum și servirea directă a fișierului imagine pentru descărcare sau afișare în interfață.

7. Arhitectura generală și canale de comunicare

MQTT (TLS):

images/{deviceId} – trimiterea imaginilor de la dispozitive

command/{deviceId} – comenzi de tip "capture", "disconnect"

device/{deviceId}/live – stream live de imagini (modul live)

HTTP REST (backend Spring Boot):

/capture – solicitare captură imagine

/images/{deviceId}/latest – returnează ultima imagine ca fișier

/live – trimite comenzi live (start/stop)

PostgreSQL:

Folosit pentru stocarea metadatelor imaginilor și a dispozitivelor înregistrate

Aceste canale sunt organizate clar pentru a asigura separarea responsabilităților între backend, frontend și dispozitive mobile.

