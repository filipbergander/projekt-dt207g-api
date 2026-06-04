# Projektuppgift | Backend-baserad webbutveckling DT207G

## Webbtjänst för fiktiv restaurang

Uppgiften består av tre delar, en webbtjänst, en admin-sida och publik webbplats. I detta repo skapade jag webbtjänsten för Trattorian Lema som övriga webbplatser använder och hämtar information från.
Webbtjänsten skapades med databasservern **MongoDB Atlas**, paketen **Mongoose** och **Express**, samt NodeJS och JavaScript. Scheman och routes skapades för att definiera databasens struktur.
Autentisering för skyddade routes och sessionshantering gjordes från middleware genom **JSON Web Tokens**(JWT) och vid inloggning hashas lösenorden genom paketet **Bcrypt**.

Funktionalitet för CRUD är implementerat genom CREATE, READ, DELETE och PUT. Felmeddelanden genereras från servern när användaren försöker anropa en endpoint utan behörighet eller när något gått fel.
Till databasen och restaurangen finns CRUD med för att skapa användare, logga in, boka bord samt hantera maträtter genom kategorier och bilder. Genom detta valde jag att skapa mer funktionalitet än grundkravet, vilket var att presentera en matsedel eller meny.

### Länk
En liveversion av API:et finns tillgänglig på: https://fb-backend-api-p9fp.onrender.com/  
För hemsidan användes Render vilket även innebär att servern vanligtvis ligger i viloläge, och det kan ta lite tid för att den ska vakna till liv vid ett första anrop.

## Installation av databas
En dotenv-fil används för anslutningsmöjligheter och finns som exempel inom filen, *.env.sample*. Klona ner källkodsfilerna, kör kommando npm install för att installera nödvändiga npm-pkaet. Alla paket som använts i laborationen hittas i *package.json* under dependencies.

### Scheman
**Användare:**
| Fält          | Typ     | Beskrivning |
|---------------|----------|-------------|
| _id           | ObjectId | Automatiskt genererat ID |
| username      | String   | Användarnamn |
| email         | String   | Mejl-adress |
| password      | String   | Lösenord |
| role      | String   | Roll |
| createdAt    | Date     | När kontot skapades |

**Nyhetsinlägg:**
| Fält          | Typ     | Beskrivning |
|---------------|----------|-------------|
| _id           | ObjectId | Automatiskt genererat ID |
| headline      | String   | Rubrik |
| content         | String   | Nyhetens innehåll |
| author      | String   | Skribent |
| createdAt    | Date     | Publiceringsdatum |

Det lagras maximalt ett nyhetsinlägg på servern och hemsidan, eftersom jag inte ville att Trattorian skulle ha alltför många element som skapar oreda eller inte tillför något väsentligt.

**Bokning:**
| Fält          | Typ     | Beskrivning |
|---------------|----------|-------------|
| _id           | ObjectId | Automatiskt genererat ID |
| name      | String   | Besökarens namn |
| email         | String   | Besökarens email |
| guests      | Number   | Antal gäster |
| date      | Date   | Datum för bokningen |
| time      | String   | Tid för bokningen |
| phone      | String   | Besökarens telefonnummer |
| message      | String   | Eventuell kommentar |
| approved      | Boolean   | Godkänd/nekad |
| createdAt    | Date     | Publiceringsdatum |

*Approved* användes inte till någon funktionalitet i databasen. All information som användaren anger används inte på något vis för att göra anrop mot personuppgifterna som lämnas i bokningsformuläret. Ingen kontakt sker mot användaren.

**Kvällsmeny:**
| Fält          | Typ     | Beskrivning |
|---------------|----------|-------------|
| _id           | ObjectId | Automatiskt genererat ID |
| category      | String   | Kategori för maträtten |
| namn         | String   | Maträttens namn |
| description      | String   | Beskrivning av maträtten |
| price      | Number   | Maträttens pris |
| createdAt    | Date     | När maträtten skapades |

**Bild till maträttens kategori:**
| Fält          | Typ     | Beskrivning |
|---------------|----------|-------------|
| _id           | ObjectId | Automatiskt genererat ID |
| category      | String   | Bildens kategori |
| image         | String   | Bildfilen |
| alt      | String   | Alt-text till bilden |
| createdAt    | Date     | När maträtten skapades |

Kvällsmenyn består av fyra kategorier: **Förrätt, Huvudrätt, Efterrätt** samt **Dryck.** Webbtjänsten tillsammans med admin-sidan ger möjlighet att ladda upp en bild för varje kategori. Det är frivilligt att lägga till bilder, men tjänsten stödjer maximalt fyra bilder, en per kategori. Bilderna hanterades till en början lokalt med paketen *Multer* och *Sharp*. Det valdes att användas *Cloudinary* samt *Streamifier* för att lagra bilderna, eftersom tjänsten Render hade en maxgräns för filens totala storlek samt att bilderna försvinner när servern går ned i viloläge eller vid omstart. Genom Cloudinary kunde bilderna även optimeras och beskäras, vilket gjorde att jag exkluderade Sharp.

## Användning och routes:
Beskrivning hur man når API:et på olika vis:

**Grundläggande:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| GET   | /                      | Välkomstmeddelande         |

**Användare:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| POST | /register    | Registrerar en ny användare (Skyddad route, kräver JWT)    |
| POST | /login       | Loggar in en användare    |

**Nyhetsinlägg:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| GET | /news    | Hämtar nyhetsinlägget    |
| GET | /news:id    | Hämtar det specifika nyhetsinlägget (Skyddad route, kräver JWT)    |
| POST | /news       | Skapar nytt nyhetsinlägg (Skyddad route, kräver JWT)    |
| DELETE | /news/:id    | Raderar nyhetsinlägget (Skyddad route, kräver JWT)    |
| PUT | /news/:id       | Uppdaterar nyhetsinlägget (Skyddad route, kräver JWT)    |

**Bokning:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| GET | /dinner/booking    | Hämtar bokningar (Skyddad route, kräver JWT)    |
| POST | /dinner/booking       | Skapar ny bokning   |
| DELETE | /dinner/booking/:id    | Raderar specifik bokning (Skyddad route, kräver JWT)    |

**Kvällsmeny:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| GET | /dinner    | Hämtar alla maträtter    |
| GET | /dinner/:id    | Hämtar specifik maträtt (Skyddad route, kräver JWT)    |
| POST | /dinner       | Skapar en maträtt (Skyddad route, kräver JWT)    |
| DELETE | /dinner/:id    | Raderar en maträtt (Skyddad route, kräver JWT)    |
| PUT | /dinner/:id       | Uppdaterar en maträtt (Skyddad route, kräver JWT)    |

**Kategoribilder:**
| Metod | Ändpunkt              | Beskrivning                                      |
|-------|------------------------|--------------------------------------------------|
| GET | /dinner/category-images    | Hämtar alla bilder    |
| GET | /dinner/category-images/:id    | Hämtar specifik bild (Skyddad route, kräver JWT)    |
| POST | /dinner/category-images       | Laddar upp en bild (Skyddad route, kräver JWT)    |
| DELETE | /dinner/category-images/:id    | Raderar en bild (Skyddad route, kräver JWT)    |
| PUT | /dinner/category-images/:id       | Uppdaterar en bild (Skyddad route, kräver JWT)    |

För kategoribilderna valdes det att implementera funktionalitet för att uppdatera bildens alt-texten och kategorin, det är alltså bildens information som uppdateras inte själva filen. Detta eftersom varje kategori endast behöver en bild, och det är mer användbart att kunna ändra text och kategori än att byta filen. Om en bildfil behöver bytas ut kan det i stället göras genom DELETE och POST. 

### Exempel:
Ett nyhetsinlägg skickas exempelvis som JSON-objekt med följande struktur:
```
 {
  "_id" : "6a200570a7c7048e7597fa9a",
  "headline" : "Sommarpremiär vid ån!",
  "content": "Uteserveringen är öppen! Benvenuti Trattoria Lema",
  "author": "Kocken Thomas",
  "createdAt": "2026-06-03T10:44:00.908Z"
}
```

*Filip Bergander Mittuniversitetet*
