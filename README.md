# Incubus - Polygon NFT Játékdisztribúciós Platform

**Átfogó Projekt Dokumentáció**

*Verzió: 1.0.0*
*Dátum: 2025. március 27.*

---

## Tartalomjegyzék

- [Incubus - Polygon NFT Játékdisztribúciós Platform](#incubus---polygon-nft-játékdisztribúciós-platform)
  - [Tartalomjegyzék](#tartalomjegyzék)
  - [Bevezetés](#bevezetés)
    - [A projekt áttekintése](#a-projekt-áttekintése)
    - [Célkitűzések](#célkitűzések)
    - [Célközönség](#célközönség)
  - [Architektúra](#architektúra)
    - [Magas szintű architektúra](#magas-szintű-architektúra)
    - [Komponens diagram](#komponens-diagram)
    - [Adatfolyam diagram](#adatfolyam-diagram)
    - [Rendszerkövetelmények](#rendszerkövetelmények)
  - [Technológiai Stack](#technológiai-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Adatbázis](#adatbázis)
    - [Blockchain integráció](#blockchain-integráció)
    - [Infrastruktúra](#infrastruktúra)
  - [Adatbázis Séma](#adatbázis-séma)
    - [Entitás kapcsolati diagram](#entitás-kapcsolati-diagram)
    - [Adatmodell](#adatmodell)
    - [Migrációs stratégia](#migrációs-stratégia)
    - [Adatbázis indexelés](#adatbázis-indexelés)
  - [Állapotkezelés](#állapotkezelés)
    - [Frontend állapotkezelés](#frontend-állapotkezelés)
    - [Szerver oldali állapotkezelés](#szerver-oldali-állapotkezelés)
  - [Biztonsági Megfontolások](#biztonsági-megfontolások)
    - [Hitelesítés és engedélyezés](#hitelesítés-és-engedélyezés)
    - [API biztonság](#api-biztonság)
    - [Adatbázis biztonság](#adatbázis-biztonság)
    - [Frontend biztonság (todo)](#frontend-biztonság-todo)
  - [Telepítési Eljárások](#telepítési-eljárások)
    - [Fejlesztői környezet beállítása](#fejlesztői-környezet-beállítása)
  - [Tesztelési Módszertan](#tesztelési-módszertan)
    - [Egységtesztek](#egységtesztek)
    - [Integrációs tesztek](#integrációs-tesztek)
    - [E2E tesztek](#e2e-tesztek)
  - [Felhasználói Folyamatok](#felhasználói-folyamatok)
    - [Felhasználói regisztráció és bejelentkezés](#felhasználói-regisztráció-és-bejelentkezés)
    - [Játékvásárlás](#játékvásárlás)
    - [Játéktárgy vásárlás](#játéktárgy-vásárlás)
    - [Piactér használata](#piactér-használata)
    - [Adminisztrációs folyamatok (todo)](#adminisztrációs-folyamatok-todo)
  - [Nemzetköziesítés és Lokalizáció](#nemzetköziesítés-és-lokalizáció)
    - [Támogatott nyelvek](#támogatott-nyelvek)
    - [Fordítási folyamat](#fordítási-folyamat)
    - [Lokalizációs stratégia](#lokalizációs-stratégia)
  - [API Dokumentáció](#api-dokumentáció)
    - [RESTful API-k](#restful-api-k)
    - [Végpontok](#végpontok)
    - [Kérés/válasz formátumok](#kérésválasz-formátumok)
    - [Hibakezelés](#hibakezelés)
    - [Hitelesítés](#hitelesítés)
  - [Jövőbeli Fejlesztési Terv](#jövőbeli-fejlesztési-terv)
    - [Tervezett funkciók](#tervezett-funkciók)
    - [Technológiai fejlesztések](#technológiai-fejlesztések)
    - [Skálázási stratégia](#skálázási-stratégia)
  - [Függelék](#függelék)
    - [Fogalomtár](#fogalomtár)
    - [Referenciák](#referenciák)

---

## Bevezetés

### A projekt áttekintése

Az Incubus egy innovatív, decentralizált játékdisztribúciós platform, amely a Polygon blockchain technológiát használja a játékok és játékon belüli tárgyak NFT-ként (nem helyettesíthető tokenként) való kezelésére. A platform célja, hogy forradalmasítsa a digitális játékok tulajdonjogát, lehetővé téve a felhasználók számára, hogy valódi tulajdonjoggal rendelkezzenek a megvásárolt digitális tartalmak felett, és azokat szabadon kereskedhessék egy biztonságos, decentralizált piactéren.

Az Incubus platform a Next.js keretrendszerre épül, amely biztosítja a modern, gyors és reszponzív felhasználói élményt, miközben a háttérben a Polygon blockchain technológia gondoskodik a biztonságos és költséghatékony tranzakciókról. A platform integrálja a Web3 technológiákat a hagyományos webes fejlesztéssel, létrehozva egy hibrid alkalmazást, amely egyesíti a centralizált és decentralizált rendszerek előnyeit.

### Célkitűzések

Az Incubus platform fő célkitűzései:

1. **Valódi digitális tulajdonjog biztosítása**: A játékok és játékon belüli tárgyak NFT-ként való kezelése, amely lehetővé teszi a felhasználók számára a valódi tulajdonjogot és a másodlagos piacon történő kereskedést.

2. **Biztonságos és átlátható tranzakciók**: A blockchain technológia használata a tranzakciók biztonságának és átláthatóságának biztosítására.

3. **Fejlesztőbarát környezet**: Egyszerű és hatékony eszközök biztosítása a játékfejlesztők számára, hogy integrálhassák játékaikat a platformba.

4. **Felhasználóbarát élmény**: Intuitív és könnyen használható felület biztosítása mind a játékosok, mind a fejlesztők számára, minimalizálva a blockchain technológia használatának komplexitását.

5. **Skálázhatóság**: A Polygon blockchain használata a skálázhatóság és az alacsony tranzakciós díjak biztosítására.

6. **Nemzetközi elérhetőség**: Többnyelvű támogatás és globális hozzáférhetőség biztosítása.

### Célközönség

Az Incubus platform célközönsége:

1. **Játékosok**: Akik valódi tulajdonjoggal szeretnének rendelkezni a digitális játékaik és tárgyaik felett, és részt szeretnének venni a másodlagos piacon.

2. **Játékfejlesztők és kiadók**: Akik új bevételi forrásokat keresnek, és szeretnék kihasználni a blockchain technológia előnyeit.

3. **Digitális gyűjtők**: Akik ritka és értékes digitális tárgyakat gyűjtenek.

4. **Blockchain és NFT enthusiasták**: Akik érdeklődnek az új blockchain alkalmazások és az NFT technológia iránt.

5. **Befektetők**: Akik a digitális eszközök értéknövekedésében látnak potenciált.

---

## Architektúra

### Magas szintű architektúra

Az Incubus platform egy modern, többrétegű architektúrát követ, amely egyesíti a hagyományos webes technológiákat a blockchain infrastruktúrával. Az architektúra fő komponensei:

1. **Frontend réteg**: Next.js alapú, React komponensekkel, amely biztosítja a felhasználói felületet és a kliens oldali logikát.

2. **API réteg**: RESTful API-k, amelyek kezelik a kliens-szerver kommunikációt és a backend szolgáltatásokhoz való hozzáférést.

3. **Backend szolgáltatások**: Node.js alapú szolgáltatások, amelyek kezelik az üzleti logikát, az adatbázis műveleteket és a blockchain interakciókat.

4. **Adatbázis réteg**: PostgreSQL adatbázis, amely tárolja a felhasználói adatokat, játék metaadatokat és egyéb nem-blockchain adatokat.

5. **Blockchain réteg**: Polygon blockchain integráció, amely kezeli az NFT-ket, a smart contractokat és a tranzakciókat.

6. **Tárolási réteg**: Hibrid tárolási megoldás, amely kombinálja a centralizált tárolást (játék tartalmak, képek) és a decentralizált tárolást (IPFS a metaadatok és NFT-k számára).

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|  Felhasználói     |     |  Admin            |     |  Fejlesztői       |
|  Felület          |     |  Felület          |     |  Portál           |
|                   |     |                   |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|  Next.js          |     |  Next.js          |     |  Next.js          |
|  Frontend         |     |  Admin            |     |  Fejlesztői       |
|                   |     |                   |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         v                         v                         v
+-----------------------------------------------------------+
|                                                           |
|                     API Gateway                           |
|                                                           |
+--------+------------------------+------------------------+
         |                        |                        |
         v                        v                        v
+----------------+    +----------------------+    +----------------+
|                |    |                      |    |                |
| Felhasználói   |    | Játék és NFT         |    | Piactér       |
| Szolgáltatások |    | Szolgáltatások       |    | Szolgáltatások |
|                |    |                      |    |                |
+--------+-------+    +----------+-----------+    +--------+-------+
         |                       |                         |
         v                       v                         v
+-----------------------------------------------------------+
|                                                           |
|                  Prisma ORM Réteg                         |
|                                                           |
+--------+------------------------+------------------------+
         |                        |                        |
         v                        v                        v
+----------------+    +----------------------+    +----------------+
|                |    |                      |    |                |
| PostgreSQL     |    | Polygon Blockchain   |    | IPFS Tárolás  |
| Adatbázis      |    | Integráció           |    |                |
|                |    |                      |    |                |
+----------------+    +----------------------+    +----------------+
```

### Komponens diagram

Az Incubus platform fő komponensei és azok kapcsolatai:

1. **Frontend komponensek**:
   - Felhasználói felület komponensek (UI)
   - Állapotkezelő komponensek (Context API)
   - Pénztárca integrációs komponensek
   - Nemzetköziesítési komponensek

2. **Backend komponensek**:
   - API végpontok
   - Autentikációs szolgáltatás
   - Játék szolgáltatás
   - NFT szolgáltatás
   - Piactér szolgáltatás
   - Blockchain integráció szolgáltatás
   - Tárolási szolgáltatás

3. **Adatbázis komponensek**:
   - Felhasználói adatok
   - Játék metaadatok
   - Tranzakciós adatok
   - Analitikai adatok

4. **Blockchain komponensek**:
   - Smart contractok
   - NFT tokenek
   - Tranzakció kezelés
   - Blockchain esemény figyelés

### Adatfolyam diagram

Az Incubus platformon belüli fő adatfolyamok:

1. **Felhasználói regisztráció és hitelesítés**: (kész)
   - Felhasználói adatok → Autentikációs szolgáltatás → Adatbázis
   - Pénztárca csatlakoztatás → Blockchain integráció → Adatbázis

2. **Játék vásárlás**: (ui, folyamatban)
   - Felhasználói kérés → Játék szolgáltatás → Blockchain integráció → Smart contract → NFT létrehozás → Adatbázis frissítés

3. **Játéktárgy vásárlás**: (ui, folyamatban)
   - Felhasználói kérés → NFT szolgáltatás → Blockchain integráció → Smart contract → NFT létrehozás → Adatbázis frissítés

4. **Piactér tranzakciók**: (ui, folyamatban)
   - Eladási ajánlat → Piactér szolgáltatás → Blockchain integráció → Smart contract → Adatbázis frissítés
   - Vásárlási kérés → Piactér szolgáltatás → Blockchain integráció → Smart contract → NFT tulajdonjog átruházás → Adatbázis frissítés

5. **Játék letöltés és játék**: (ui, folyamatban)
   - Felhasználói kérés → Játék szolgáltatás → NFT tulajdonjog ellenőrzés → Tárolási szolgáltatás → Játék tartalom

### Rendszerkövetelmények

**Szerver oldali követelmények**:
- Node.js 18.x vagy újabb
- PostgreSQL 14.x vagy újabb
- Docker és Docker Compose (opcionális, de ajánlott)
- Minimum 4GB RAM, 2 CPU mag
- 100GB SSD tárhely
- Linux operációs rendszer (Ubuntu 22.04 LTS ajánlott)

**Kliens oldali követelmények**:
- Modern webböngésző (Chrome, Firefox, Safari, Edge legújabb verziói)
- Metamask vagy más Web3 pénztárca bővítmény
- Minimum 8GB RAM a fejlesztői környezethez
- Node.js 18.x vagy újabb a fejlesztéshez

**Blockchain követelmények**:
- Polygon RPC hozzáférés
- Polygon hálózati kapcsolat
- Gas díjak fizetéséhez MATIC token

---

## Technológiai Stack

### Frontend

Az Incubus platform frontend technológiai stackje:

1. **Next.js 15.x**: React keretrendszer szerver oldali renderelési (SSR) és statikus oldal generálási (SSG) képességekkel.

2. **React 19.x**: Komponens alapú UI könyvtár.

3. **TypeScript**: Típusos JavaScript a jobb kód minőség és fejlesztői élmény érdekében.

4. **Tailwind CSS**: Utility-first CSS keretrendszer a reszponzív és modern UI fejlesztéshez.

5. **next-intl**: Nemzetköziesítési könyvtár a Next.js alkalmazásokhoz.

6. **Web3 integrációk**:
   - Metamask és más pénztárca csatlakoztatási lehetőségek
   - Polygon blockchain interakciók

7. **Egyéb könyvtárak**:
   - `clsx` és `tailwind-merge`: CSS osztályok kezelése
   - `lucide-react`: Ikonok
   - `sonner`: Értesítések

**Pénztárca csatlakoztatás komponens működése** (ui, folyamatban)

A pénztárca csatlakoztatás komponens (WalletConnect) a felhasználói felület egyik kulcsfontosságú eleme, amely lehetővé teszi a felhasználók számára a blockchain pénztárcájuk csatlakoztatását a platformhoz. A komponens a következő funkciókat valósítja meg:

1. **Pénztárca típus kiválasztása**: A felhasználó választhat a támogatott pénztárca típusok közül (MetaMask, WalletConnect, Coinbase Wallet) rádió gombok segítségével.

2. **Csatlakoztatási folyamat kezelése**: A komponens kezeli a csatlakoztatási folyamatot, beleértve a betöltési állapotot és a hibaüzeneteket.

3. **Csatlakoztatott állapot megjelenítése**: Ha a pénztárca már csatlakoztatva van, a komponens megjeleníti a pénztárca címét és egy másolás gombot.

4. **Többnyelvű támogatás**: A komponens a next-intl könyvtárat használja a szövegek lokalizálásához, így minden szöveg a felhasználó által választott nyelven jelenik meg.

5. **Reszponzív design**: A komponens Tailwind CSS-t használ a reszponzív és modern megjelenés biztosításához, amely különböző képernyőméreteken is jól működik.

A komponens két fő állapotot kezel: a nem csatlakoztatott állapotot, ahol a felhasználó kiválaszthatja a pénztárca típusát és kezdeményezheti a csatlakoztatást, valamint a csatlakoztatott állapotot, ahol a felhasználó láthatja a pénztárca címét és másolhatja azt.

### Backend

Az Incubus platform backend technológiai stackje:

1. **Node.js**: JavaScript futtatókörnyezet a szerver oldali kód számára.

2. **Next.js API Routes**: API végpontok a Next.js alkalmazáson belül.

3. **Prisma ORM**: Típusos adatbázis kliens és migrációs eszköz.

4. **PostgreSQL**: Relációs adatbázis a felhasználói és alkalmazás adatok tárolására.

5. **better-auth**: Autentikációs könyvtár különböző bejelentkezési módokkal.

6. **Zod**: Séma validációs könyvtár.

7. **Pino**: Strukturált naplózási könyvtár.

8. **Web3.js / ethers.js**: Ethereum/Polygon blockchain interakciós könyvtárak.

**Játékok lekérdezése API végpont működése**

A játékok lekérdezéséért felelős API végpont a Next.js API Routes funkcionalitását használja, és a következő főbb funkciókat valósítja meg:

1. **Lapozás és rendezés kezelése**:
   - A végpont támogatja a lapozott lekérdezést (pagination), ahol megadható az oldalszám és az oldalméret
   - Különböző rendezési lehetőségeket biztosít (pl. megjelenési dátum, cím, ár szerint)
   - Alapértelmezetten a játékok megjelenési dátum szerint csökkenő sorrendben jelennek meg

2. **Szűrési lehetőségek**:
   - Műfaj (genre) szerinti szűrés
   - Kiadó (publisher) szerinti szűrés
   - Kiemelt játékok szűrése
   - Szöveges keresés a címben és leírásban

3. **Adatlekérés optimalizálása**:
   - Párhuzamos lekérdezések használata a játékok és a teljes darabszám egyidejű lekérdezéséhez
   - Csak a szükséges kapcsolódó adatok lekérése (publisher, műfajok, címkék, borítókép)
   - Kapcsolódó számlálók lekérése (értékelések és licencek száma)

4. **Válasz formázása**:
   - Strukturált, lapozott válasz formátum
   - Metaadatok a lapozáshoz (aktuális oldal, oldalméret, összes elem, összes oldal)
   - Hibakezelés és megfelelő státuszkódok

A végpont a Prisma ORM-et használja az adatbázis-műveletek végrehajtásához, ami típusbiztonságot és hatékony lekérdezéseket biztosít. A válaszok JSON formátumban kerülnek visszaküldésre, és tartalmazzák a játékok összes szükséges adatát a felhasználói felületen való megjelenítéshez.

### Adatbázis

Az Incubus platform adatbázis technológiái:

1. **PostgreSQL**: Elsődleges relációs adatbázis.

2. **Prisma**: ORM (Object-Relational Mapping) eszköz a típusos adatbázis hozzáféréshez és migrációkhoz.

3. **Adatbázis séma**: Komplex relációs modell, amely kezeli a felhasználókat, játékokat, NFT-ket, tranzakciókat és egyéb entitásokat.

4. **Migrációk**: Verziókezelt adatbázis séma változtatások a Prisma segítségével.

5. **Indexelés**: Teljesítmény optimalizált indexek a gyakori lekérdezésekhez.

**Kódrészlet: Prisma séma részlet (játék és NFT modellek)**

**Adatbázis séma leírása: Játék és Játéklicenc modellek**

Az Incubus platform adatbázis sémája a Prisma ORM segítségével van definiálva, amely típusbiztos adatbázis-hozzáférést biztosít. A két legfontosabb modell a játékokhoz kapcsolódóan:

**Game (Játék) modell**:
- Egyedi azonosítóval (UUID) rendelkezik
- Alapvető információkat tárol: cím, slug (URL-barát név), leírás, rövid leírás
- Kapcsolódik egy kiadóhoz (Publisher) és több fejlesztőhöz (Developer)
- Tartalmazza az árazási adatokat: alapár és kedvezményes ár
- Státusz jelzőket tárol: aktív-e, kiemelt-e
- Tartalom besorolást és rendszerkövetelményeket tárol
- Több kapcsolódó entitással rendelkezik:
  - Címkék (tags) és műfajok (genres)
  - Verziók, licencek és játékon belüli tárgyak
  - Értékelések és tartalom fájlok
  - Borítókép, képernyőképek és előzetes videó
  - Piactéri listázások
- Időbélyegeket tárol a létrehozás és frissítés idejéről

**GameLicense (Játéklicenc) modell**:
- Egyedi azonosítóval (UUID) rendelkezik
- Kapcsolódik egy játékhoz és egy pénztárcához
- NFT-azonosítókat és gyűjtemény-azonosítókat tárol
- Licenc típust tárol (STANDARD, PREMIUM, COLLECTOR, SUBSCRIPTION, TRIAL)
- Státusz és időbeli információkat tárol: aktív-e, beszerzés ideje, lejárat ideje
- Metaadatokat tárolhat JSON formátumban
- Tranzakciós történetet tárol
- Egyedi megszorítást tartalmaz, hogy egy pénztárca csak egy licenccel rendelkezhet egy játékhoz

A licenc típusok enum-ként vannak definiálva, amely a különböző licenc kategóriákat reprezentálja, mindegyik különböző jogosultságokkal és funkciókkal.

Ez az adatbázis struktúra lehetővé teszi a játékok, licencek és kapcsolódó entitások hatékony tárolását és lekérdezését, miközben biztosítja az adatok integritását a megfelelő kapcsolatok és megszorítások révén.

### Blockchain integráció

Az Incubus platform blockchain integrációs technológiái:

1. **Polygon (Matic) Blockchain**: Ethereum Layer 2 megoldás az alacsony tranzakciós díjak és a gyors tranzakciók érdekében.

2. **Smart Contractok**: Solidity nyelven írt okos szerződések a játéklicencek, játéktárgyak és piactér funkcionalitás kezelésére.

3. **NFT Szabványok**: ERC-721 és ERC-1155 szabványok implementálása a játéklicencek és játéktárgyak számára.

4. **Web3 könyvtárak**: Web3.js és ethers.js a blockchain interakciókhoz.

5. **Wallet kapcsolódás**: MetaMask, WalletConnect és más pénztárca integrációk.

**Kódrészlet: Blockchain tranzakció kezelés**

**Blockchain tranzakció kezelés folyamata**

A játéklicenc vásárlási folyamat során a rendszer a következő lépéseket hajtja végre a blockchain tranzakció kezelése során:

1. **Adatbázis ellenőrzések**:
   - A rendszer ellenőrzi, hogy a megadott játék létezik-e az adatbázisban
   - Ellenőrzi, hogy a felhasználó pénztárcája regisztrálva van-e a rendszerben
   - Hiba esetén a folyamat megszakad és hibaüzenet kerül visszaadásra

2. **Smart contract interakció előkészítése**:
   - Kapcsolódás a Polygon blockchain hálózathoz egy RPC szolgáltatón keresztül
   - A platform privát kulcsának használata a tranzakciók aláírásához
   - A játéklicenc smart contract példányosítása a megfelelő ABI-val és címmel

3. **Tranzakció végrehajtása**:
   - A mintLicense függvény meghívása a smart contracton
   - A felhasználó pénztárca címének, a játék azonosítójának és az árnak az átadása
   - Gas limit beállítása a tranzakció sikeres végrehajtásához
   - A tranzakció elküldése a blockchain hálózatra

4. **Tranzakció nyugtázása**:
   - Várakozás a tranzakció feldolgozására és bekerülésére egy blokkba
   - A tranzakció nyugtájának (receipt) lekérése
   - Az NFT token azonosítójának kinyerése az eseményekből

5. **Adatbázis frissítése**:
   - Új játéklicenc rekord létrehozása az adatbázisban
   - A blockchain és az adatbázis adatainak összekapcsolása az NFT azonosító tárolásával
   - A licenc státuszának és időbélyegeinek beállítása
   - A létrehozott licenc visszaadása a hívó függvénynek

Ez a folyamat biztosítja, hogy a játéklicencek biztonságosan és átláthatóan kerüljenek létrehozásra a blockchain hálózaton, miközben a centralizált adatbázisban is tárolásra kerülnek a gyors lekérdezés és a felhasználói élmény optimalizálása érdekében.

### Infrastruktúra

Az Incubus platform infrastruktúrája:

1. **Konténerizáció**: Docker és Docker Compose a fejlesztéshez és telepítéshez.

2. **CI/CD**: GitHub Actions a folyamatos integrációhoz és telepítéshez.

3. **Felhő szolgáltatások**: AWS vagy Google Cloud Platform a skálázható infrastruktúrához.

4. **Adatbázis**: Managed PostgreSQL szolgáltatás (pl. AWS RDS, Google Cloud SQL).

5. **Tárolás**:
   - S3 vagy Google Cloud Storage a centralizált tároláshoz
   - IPFS a decentralizált tároláshoz

6. **CDN**: CloudFront vagy Cloudflare a statikus tartalmak gyorsítótárazásához.

7. **Blockchain infrastruktúra**:
   - Saját Polygon node vagy Infura/Alchemy szolgáltatás
   - IPFS node vagy Pinata/Infura IPFS szolgáltatás

---

## Adatbázis Séma

### Entitás kapcsolati diagram

Az Incubus platform adatbázis sémája komplex entitás kapcsolati modellt követ, amely lehetővé teszi a felhasználók, játékok, NFT-k, tranzakciók és egyéb entitások közötti kapcsolatok hatékony kezelését. Az alábbiakban a fő entitások és kapcsolataik láthatók:

```
+---------------+       +---------------+       +---------------+
|               |       |               |       |               |
|  Felhasználó  +-------+  Pénztárca    +-------+  Blockchain   |
|  (User)       |       |  (Wallet)     |       |  (Blockchain) |
|               |       |               |       |               |
+-------+-------+       +-------+-------+       +---------------+
        |                       |
        |                       |
+-------v-------+       +-------v-------+       +---------------+
|               |       |               |       |               |
|  Szervezet    |       |  Tranzakció   +-------+  Smart        |
|  (Organization)|      |  (Transaction) |       |  Contract    |
|               |       |               |       |               |
+-------+-------+       +-------+-------+       +---------------+
        |                       |
        |                       |
+-------v-------+       +-------v-------+       +---------------+
|               |       |               |       |               |
|  Kiadó        +-------+  Játék        +-------+  Játékverzió  |
|  (Publisher)  |       |  (Game)       |       |  (GameVersion)|
|               |       |               |       |               |
+---------------+       +-------+-------+       +---------------+
                                |
                                |
                        +-------v-------+       +---------------+
                        |               |       |               |
                        |  Játéklicenc  +-------+  NFT          |
                        |  (GameLicense)|       |  Gyűjtemény   |
                        |               |       |  (Collection) |
                        +---------------+       +---------------+
                                |
                                |
                        +-------v-------+       +---------------+
                        |               |       |               |
                        |  Játéktárgy   +-------+  Piactér      |
                        |  (GameItem)   |       |  Listing      |
                        |               |       |               |
                        +-------+-------+       +---------------+
                                |
                                |
                        +-------v-------+       +---------------+
                        |               |       |               |
                        |  Tárgy        |       |  Letét        |
                        |  Tulajdonlás  +-------+  (Escrow)     |
                        |  (Ownership)  |       |               |
                        +---------------+       +---------------+
```

### Adatmodell

Az Incubus platform adatbázis modellje a Prisma ORM segítségével van definiálva. A fő modellek a következők:

1. **Felhasználói modellek**:
   - `User`: Felhasználói fiók adatok
   - `Session`: Felhasználói munkamenetek
   - `Account`: Külső fiók kapcsolatok (pl. Google, GitHub)
   - `Verification`: E-mail ellenőrzések
   - `Passkey`: Passkey hitelesítési adatok

2. **Szervezeti modellek**:
   - `Organization`: Szervezetek (kiadók, fejlesztők)
   - `Member`: Szervezeti tagságok
   - `Invitation`: Meghívók

3. **Blockchain modellek**:
   - `Blockchain`: Támogatott blockchain hálózatok
   - `Wallet`: Felhasználói pénztárcák
   - `SmartContract`: Smart contract adatok
   - `Transaction`: Blockchain tranzakciók
   - `NFTCollection`: NFT gyűjtemények

4. **Játék modellek**:
   - `Game`: Játék metaadatok
   - `Publisher`: Játék kiadók
   - `Developer`: Játék fejlesztők
   - `GameVersion`: Játék verziók
   - `GameGenre`: Játék műfajok
   - `Genre`: Műfaj kategóriák
   - `GameTag`: Játék címkék
   - `Tag`: Címke kategóriák

5. **Tartalom modellek**:
   - `ContentFile`: Tartalom fájlok (képek, videók, játék fájlok)

6. **Licenc és tulajdonlás modellek**:
   - `GameLicense`: Játék licencek
   - `GameLicenseTransaction`: Licenc tranzakciók
   - `GameItem`: Játékon belüli tárgyak
   - `ItemOwnership`: Tárgy tulajdonlás
   - `ItemTransaction`: Tárgy tranzakciók

7. **Piactér modellek**:
   - `MarketplaceListing`: Piactér hirdetések
   - `Escrow`: Letéti tranzakciók
   - `EscrowTransaction`: Letéti műveletek

8. **Közösségi modellek**:
   - `GameReview`: Játék értékelések
   - `GameReviewVote`: Értékelés szavazatok
   - `Report`: Felhasználói jelentések
   - `DisputeCase`: Vitás ügyek

9. **Analitikai modellek**:
   - `AnalyticsEvent`: Analitikai események
   - `Report`: Jelentések

10. **Adminisztrációs modellek**:
    - `AuditLog`: Audit naplók
    - `CompliancePolicy`: Megfelelőségi szabályzatok
    - `UserConsent`: Felhasználói hozzájárulások

**Felhasználói és pénztárca modellek leírása**

Az Incubus platform két kulcsfontosságú adatbázis modellje a felhasználói és pénztárca modellek, amelyek a következő tulajdonságokkal és kapcsolatokkal rendelkeznek:

**Felhasználói modell (User)**:
- Alapvető azonosító és profil információkat tárol: egyedi azonosító, név, e-mail cím
- Biztonsági információkat kezel: e-mail ellenőrzés állapota, jelszó (nem közvetlenül tárolva)
- Felhasználói státusz adatokat tárol: szerepkör, kitiltás állapota és oka, kitiltás lejárati ideje
- Időbélyegeket tárol a létrehozás és frissítés idejéről
- Számos kapcsolattal rendelkezik más entitásokhoz:
  - Hitelesítési adatok: munkamenetek, fiókok, passkey-ek
  - Közösségi kapcsolatok: tagságok, meghívások
  - Játékkal kapcsolatos aktivitás: értékelések, szavazatok
  - Blockchain kapcsolatok: pénztárcák
  - Platform aktivitás: analitikai események, jelentések
  - Governance: javaslatok, szavazatok, vitaesetek
  - Adminisztratív: audit naplók, piactéri listázások, hozzájárulások
- Egyedi megszorítást tartalmaz az e-mail címre

**Pénztárca modell (Wallet)**:
- Egyedi azonosítóval (UUID) rendelkezik
- Kapcsolódik egy felhasználóhoz (a felhasználó több pénztárcával is rendelkezhet)
- Blockchain hálózati információkat tárol: blockchain azonosító, pénztárca cím
- Felhasználói beállításokat tárol: alapértelmezett-e, címke
- Egyenleg információkat és szinkronizálási adatokat tárol
- Időbélyegeket tárol a létrehozás és frissítés idejéről
- Számos kapcsolattal rendelkezik a blockchain aktivitásokhoz:
  - Tranzakciók
  - Játéklicencek és játéktárgyak tulajdonjoga
  - Letéti szerződések (escrow) mint letétbe helyező vagy kedvezményezett
  - Licenc és tárgy transzferek (kimenő és bejövő)
- Egyedi megszorítást tartalmaz a felhasználó, blockchain és cím kombinációjára

Ezek a modellek biztosítják a felhasználók és pénztárcáik hatékony kezelését, miközben lehetővé teszik a komplex kapcsolatok és műveletek követését a platformon belül.

### Migrációs stratégia

Az Incubus platform adatbázis migrációs stratégiája a Prisma Migrate eszközt használja a séma változtatások verziókezelésére és alkalmazására. A migrációs folyamat a következő lépésekből áll:

1. **Séma módosítás**: A `prisma/schema.prisma` fájl módosítása az új entitásokkal, mezőkkel vagy kapcsolatokkal.

2. **Migrációs fájl generálása**: A `prisma migrate dev` parancs futtatása, amely létrehozza a migrációs SQL fájlt.

3. **Migrációs fájl ellenőrzése**: A generált SQL fájl ellenőrzése és szükség esetén módosítása.

4. **Migráció alkalmazása fejlesztői környezetben**: A migráció alkalmazása a fejlesztői adatbázisban.

5. **Tesztelés**: Az új séma tesztelése a fejlesztői környezetben.

6. **Migráció alkalmazása teszt környezetben**: A migráció alkalmazása a teszt adatbázisban a `prisma migrate deploy` paranccsal.

7. **Migráció alkalmazása éles környezetben**: A migráció alkalmazása az éles adatbázisban a CI/CD folyamat részeként.

A migrációs stratégia biztosítja, hogy az adatbázis séma változtatások verziókezeltek legyenek, és biztonságosan alkalmazhatók legyenek a különböző környezetekben.

**Kódrészlet: Migrációs parancsok**

```bash
# Migrációs fájl generálása
npx prisma migrate dev --name add_new_feature

# Migráció alkalmazása teszt vagy éles környezetben
npx prisma migrate deploy

# Adatbázis séma szinkronizálása a Prisma klienssel
npx prisma generate
```

### Adatbázis indexelés

Az Incubus platform adatbázis indexelési stratégiája a gyakori lekérdezések optimalizálására összpontosít. A fő indexelési területek:

1. **Elsődleges kulcsok**: Minden tábla rendelkezik elsődleges kulcs indexszel.

2. **Idegen kulcsok**: Minden kapcsolati mező indexelve van a gyors összekapcsolások érdekében.

3. **Egyedi indexek**: Egyedi mezők, mint például a felhasználói e-mail címek vagy játék slug-ok indexelve vannak.

4. **Összetett indexek**: Gyakran együtt lekérdezett mezők összetett indexekkel rendelkeznek.

5. **Teljes szöveges keresési indexek**: A keresési mezők, mint például a játék címek és leírások, teljes szöveges keresési indexekkel rendelkeznek.

**Példa indexek**:

```sql
-- Felhasználói e-mail index
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- Játék slug index
CREATE UNIQUE INDEX "game_slug_key" ON "game"("slug");

-- Pénztárca összetett index
CREATE UNIQUE INDEX "wallet_userId_blockchainId_address_key" ON "wallet"("userId", "blockchainId", "address");

-- Tranzakció összetett index
CREATE INDEX "transaction_walletId_timestamp_idx" ON "transaction"("walletId", "timestamp");

-- Teljes szöveges keresési index
CREATE INDEX "game_title_description_idx" ON "game" USING GIN (to_tsvector('english', "title" || ' ' || "description"));
```

Az indexelési stratégia rendszeres felülvizsgálata és optimalizálása történik a teljesítmény monitorozás alapján, biztosítva a lekérdezések optimális teljesítményét a növekvő adatmennyiség mellett is.

---

## Állapotkezelés

### Frontend állapotkezelés

Az Incubus platform frontend állapotkezelése a React Context API-ra épül, amely lehetővé teszi a globális állapot hatékony kezelését a komponensek között. A fő állapotkezelési megoldások:

1. **Context API**: A globális állapot kezelésére használjuk a következő fő kontextusokkal:
   - `AuthContext`: Felhasználói hitelesítés és munkamenet kezelés
   - `WalletContext`: Pénztárca kapcsolatok és tranzakciók kezelése
   - `ThemeContext`: UI téma beállítások
   - `LocaleContext`: Nemzetköziesítési beállítások

2. **React Hooks**: Egyéni hook-ok a gyakori állapotkezelési feladatokhoz:
   - `useAuth()`: Hitelesítési állapot és műveletek
   - `useWallet()`: Pénztárca állapot és műveletek
   - `useTheme()`: Téma beállítások
   - `useTranslations()`: Fordítások

3. **Lokális komponens állapot**: A `useState` és `useReducer` hook-ok használata a komponens-specifikus állapotokhoz.

4. **Állapot perzisztencia**: A `localStorage` és `sessionStorage` használata a felhasználói beállítások és munkamenet adatok perzisztálására.

**Kódrészlet: Pénztárca Context Provider**

```tsx
// src/components/wallet/wallet-provider.tsx (részlet)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

type WalletContextType = {
  wallets: WalletInfo[];
  activeWallet: WalletInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  refreshBalance: (walletId: string) => Promise<void>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user wallets when authenticated
  useEffect(() => {
    const fetchWallets = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/wallets?userId=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch wallets');
          
          const data = await response.json();
          setWallets(data.data || []);
          
          // Set active wallet to default or first wallet
          const defaultWallet = data.data.find((w: WalletInfo) => w.isDefault) || data.data[0] || null;
          setActiveWallet(defaultWallet);
        } catch (err) {
          console.error('Error fetching wallets:', err);
          setError('Failed to load wallets');
        }
      } else {
        // Reset state when not authenticated
        setWallets([]);
        setActiveWallet(null);
      }
    };

    fetchWallets();
  }, [isAuthenticated, user]);

  // ... további implementáció ...

  return (
    <WalletContext.Provider value={{
      wallets,
      activeWallet,
      isConnecting,
      isConnected: !!activeWallet,
      error,
      connectWallet,
      disconnectWallet,
      setActiveWallet: changeActiveWallet,
      refreshBalance,
      sendTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
```

### Szerver oldali állapotkezelés

Az Incubus platform szerver oldali állapotkezelése a Next.js API Routes és a Prisma ORM köré épül. A fő állapotkezelési megoldások:

1. **API Routes**: A Next.js API Routes használata a RESTful API végpontok implementálására, amelyek kezelik a kliens kéréseket és az adatbázis műveleteket.

2. **Prisma ORM**: A Prisma ORM használata az adatbázis műveletek típusbiztos kezelésére.

3. **Munkamenet kezelés**: A felhasználói munkamenetek kezelése a `better-auth` könyvtárral.

4. **Állapot validáció**: A `zod` könyvtár használata a bejövő kérések validálására.

5. **Hibakezelés**: Strukturált hibaüzenetek és állapotkódok a kliensek számára.

**Kódrészlet: API végpont a pénztárcák lekérdezéséhez**

```typescript
// src/app/api/wallets/route.ts (részlet)
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "../utils/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse
} from "../utils/response";

export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Get user ID from query or session
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") || session.user.id;
    
    // Check if user has permission to view wallets
    if (userId !== session.user.id && session.user.role !== "admin") {
      return errorResponse("Unauthorized", 403);
    }
    
    // Fetch wallets with pagination
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId },
        // ... további lekérdezési opciók ...
      }),
      prisma.wallet.count({ where: { userId } })
    ]);

    return paginatedResponse(wallets, page, limit, total);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return errorResponse("Failed to fetch wallets", 500);
  }
}
```

---

## Biztonsági Megfontolások

### Hitelesítés és engedélyezés

Az Incubus platform hitelesítési és engedélyezési rendszere több rétegű biztonsági megközelítést alkalmaz:

1. **Felhasználói hitelesítés**:
   - Közösségi bejelentkezés (Google - OneTap)
   - Passkey támogatás (WebAuthn)
   - Kétfaktoros hitelesítés (2FA) (todo)

2. **Munkamenet kezelés**:
   - Session alapú munkamenet kezelés
   - Munkamenet időkorlát és automatikus kiléptetés (todo)
   - Munkamenet visszavonás és érvénytelenítés (todo)

3. **Szerepkör alapú hozzáférés-vezérlés (RBAC)**:
   - Felhasználói szerepkörök (felhasználó, kiadó, fejlesztő, admin)
   - Részletes jogosultságok a különböző erőforrásokhoz
   - Hierarchikus szerepkör struktúra

4. **Blockchain hitelesítés**: (todo)
   - Pénztárca alapú hitelesítés (aláírás kérés)
   - NFT tulajdonjog ellenőrzés
   - Smart contract interakció engedélyezés

### API biztonság

Az Incubus platform API biztonsági intézkedései:

1. **Bemeneti validáció**:
   - Szigorú séma validáció a Zod könyvtárral
   - Típusellenőrzés TypeScript segítségével
   - Sanitizáció a biztonsági sebezhetőségek elkerülésére

2. **Rate limiting**:
   - API kérések korlátozása felhasználónként és IP-címenként
   - Fokozatos korlátozás (exponential backoff)
   - Túlterheléses támadások (DDoS) elleni védelem

3. **CORS (Cross-Origin Resource Sharing)**:
   - Szigorú CORS szabályzat
   - Csak engedélyezett eredetekről érkező kérések elfogadása
   - Credential-alapú kérések kezelése

4. **API kulcsok és tokenek**:
   - API kulcs alapú hitelesítés
   - Rövid élettartamú hozzáférési session tokenek (todo)
   - Hosszú élettartamú frissítési session tokenek (todo)

### Adatbázis biztonság

Az Incubus platform adatbázis biztonsági intézkedései:

1. **Hozzáférés-vezérlés**:
   - Legkisebb jogosultság elve
   - Szerepkör alapú hozzáférés
   - Adatbázis felhasználók elkülönítése

2. **SQL injekció védelem**:
   - Paraméteres lekérdezések
   - ORM használata (Prisma)
   - Bemeneti validáció

3. **Adattitkosítás**:
   - Érzékeny adatok titkosítása
   - Transzparens adattitkosítás (TDE)
   - Kulcskezelés

4. **Biztonsági mentés és helyreállítás**: (todo)
   - Rendszeres biztonsági mentések
   - Point-in-time helyreállítás
   - Katasztrófa utáni helyreállítás (DR)

### Frontend biztonság (todo)

Az Incubus platform frontend biztonsági intézkedései:

1. **XSS (Cross-Site Scripting) védelem**:
   - Automatikus escape a React-ben
   - Content Security Policy (CSP)
   - HttpOnly és Secure cookie-k

2. **CSRF (Cross-Site Request Forgery) védelem**:
   - CSRF tokenek
   - SameSite cookie beállítások
   - Origin ellenőrzés

3. **Clickjacking védelem**:
   - X-Frame-Options fejléc
   - Frame-ancestors CSP direktíva
   - Beágyazás elleni védelem

4. **Érzékeny adatok kezelése**:
   - Érzékeny adatok minimalizálása a kliens oldalon
   - Memória tisztítás érzékeny műveletek után
   - Biztonságos tárolás a böngészőben

5. **Függőségek biztonsága**:
   - Rendszeres függőség frissítés
   - Biztonsági audit
   - Automatizált sebezhetőség ellenőrzés

---

## Telepítési Eljárások

### Fejlesztői környezet beállítása

Az Incubus platform fejlesztői környezetének beállítása a következő lépésekből áll:

1. **Előfeltételek telepítése**:
   - Node.js 18.x vagy újabb
   - npm 10.x vagy újabb
   - PostgreSQL 14.x vagy újabb
   - Git

2. **Projekt klónozása**:
   ```bash
   git clone https://github.com/incubus/incubus-react-nextjs.git
   cd incubus-react-nextjs
   ```

3. **Függőségek telepítése**:
   ```bash
   npm install
   ```

4. **Környezeti változók beállítása**:
   - `.env.local` fájl létrehozása a `.env.example` alapján
   - Szükséges API kulcsok és titkok beállítása

5. **Adatbázis beállítása**:
   ```bash
   # Adatbázis migrációk futtatása
   npx prisma migrate dev
   
   # Kezdeti adatok betöltése
   npx prisma db seed
   ```

6. **Fejlesztői szerver indítása**:
   ```bash
   npm run dev
   ```

---

## Tesztelési Módszertan

### Egységtesztek

Az Incubus platform egységtesztelési stratégiája a következő elveket és gyakorlatokat követi:

1. **Tesztelési keretrendszer**:
   - Jest: JavaScript tesztelési keretrendszer
   - React Testing Library: React komponensek teszteléséhez
   - Prisma Jest: Adatbázis műveletek teszteléséhez

2. **Tesztelési megközelítés**:
   - Izolált tesztek: Minden egység (függvény, komponens) izoláltan tesztelése
   - Mock-ok és stub-ok használata a függőségek helyettesítésére
   - Tiszta tesztkörnyezet minden teszt előtt

3. **Tesztelési területek**:
   - Utility függvények
   - React komponensek
   - API végpontok
   - Adatbázis műveletek
   - Validációs logika

4. **Kód lefedettség**:
   - Minimum 80% kód lefedettség
   - Kritikus komponensek 100% lefedettsége
   - Lefedettségi jelentések generálása

### Integrációs tesztek

Az Incubus platform integrációs tesztelési stratégiája a következő elveket és gyakorlatokat követi:

1. **Tesztelési keretrendszer**:
   - Jest: Alap tesztelési keretrendszer
   - Supertest: HTTP kérések teszteléséhez
   - Test konténerek: Adatbázis és egyéb szolgáltatások izolált teszteléséhez

2. **Tesztelési megközelítés**:
   - Komponensek közötti interakciók tesztelése
   - Valós adatbázis használata (teszt környezetben)
   - API végpontok teljes flow tesztelése

3. **Tesztelési területek**:
   - API végpontok és adatbázis interakciók
   - Autentikáció és engedélyezés

4. **Tesztadatok**:
   - Teszt adatbázis inicializálása ismert állapottal
   - Teszt adatok generálása és tisztítása
   - Migráció tesztelése

### E2E tesztek

Az Incubus platform end-to-end (E2E) tesztelési stratégiája a következő elveket és gyakorlatokat követi:

1. **Tesztelési keretrendszer**:
   - Cypress: Modern E2E tesztelési keretrendszer
   - Playwright: Alternatív E2E tesztelési keretrendszer
   - Percy: Vizuális regressziós tesztelés

2. **Tesztelési megközelítés**:
   - Valós felhasználói folyamatok szimulálása
   - Teljes alkalmazás tesztelése böngészőben
   - Kritikus üzleti folyamatok prioritizálása

3. **Tesztelési területek**:
   - Felhasználói regisztráció és bejelentkezés
   - Játék böngészés és vásárlás
   - Piactér használat

4. **Tesztelési környezet**:
   - Izolált teszt környezet
   - Előre feltöltött teszt adatok

---

## Felhasználói Folyamatok

### Felhasználói regisztráció és bejelentkezés

Az Incubus platform felhasználói regisztrációs és bejelentkezési folyamata a következő lépésekből áll:

1. **Közösségi bejelentkezés**:
   - Google fiókkal történő bejelentkezés
   - Közösségi fiók adatainak szinkronizálása

2. **Passkey alapú hitelesítés**: (todo)
   - Passkey regisztráció (WebAuthn)
   - Passkey használata bejelentkezéshez
   - Passkey kezelés (hozzáadás, törlés)

3. **Kétfaktoros hitelesítés (2FA)**: (todo)
   - 2FA beállítása (TOTP)
   - 2FA használata bejelentkezéskor
   - Biztonsági kódok generálása vészhelyzet esetére

4. **Jelszó kezelés**: (todo)
   - Jelszó visszaállítás
   - Jelszó módosítás
   - Jelszó erősség ellenőrzés

**Folyamatábra: Felhasználói regisztráció**

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| Regisztrációs     +---->+ Adatok            +---->+ E-mail            |
| űrlap kitöltése   |     | validálása        |     | küldése           |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +--------+----------+
                                                             |
                                                             v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| Felhasználói      +<----+ Fiók              +<----+ E-mail            |
| fiók létrehozva   |     | aktiválása        |     | megerősítés       |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```



### Játékvásárlás

Az Incubus platform játékvásárlási folyamata a következő lépésekből áll:

1. **Játék kiválasztás**:
   - Felhasználó böngészi a játékokat
   - Játék részletek megtekintése
   - Játék kiválasztása vásárlásra

2. **Vásárlási folyamat**: (todo)
   - Vásárlási opciók megjelenítése (különböző kiadások, árak)
   - Fizetési mód kiválasztása (kriptovaluta, bankkártya)
   - Vásárlás megerősítése

3. **Blockchain tranzakció**: (todo)
   - Smart contract interakció a játéklicenc NFT létrehozásához
   - Tranzakció aláírása a pénztárcával
   - Tranzakció követése a blockchain-en

4. **Licenc kiadás**: (todo)
   - NFT tulajdonjog ellenőrzése
   - Játéklicenc aktiválása a felhasználói fiókban
   - Játék metaadatok és tartalom hozzáférés biztosítása

5. **Letöltés és telepítés**: (todo)
   - Játék fájlok letöltése
   - Telepítési útmutató
   - Játék indítása

**Folyamatábra: Játékvásárlás**

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| Játék             +---->+ Vásárlási         +---->+ Fizetési mód      |
| kiválasztása      |     | opciók            |     | kiválasztása      |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +--------+----------+
                                                             |
                                                             v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| Játék             +<----+ NFT               +<----+ Blockchain        |
| letöltése         |     | licenc kiadása    |     | tranzakció        |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```

### Játéktárgy vásárlás

Az Incubus platform játéktárgy vásárlási folyamata a következő lépésekből áll:

1. **Játékon belüli bolt**:
   - Felhasználó böngészi a játékon belüli tárgyakat
   - Tárgy részletek és tulajdonságok megtekintése
   - Tárgy kiválasztása vásárlásra

2. **Vásárlási folyamat**: (todo)
   - Ár és részletek ellenőrzése
   - Fizetési mód kiválasztása
   - Vásárlás megerősítése

3. **Blockchain tranzakció**: (todo)
   - Smart contract interakció a tárgy NFT létrehozásához
   - Tranzakció aláírása a pénztárcával
   - Tranzakció követése a blockchain-en

4. **Tárgy kiadás**: (todo)
   - NFT tulajdonjog ellenőrzése
   - Tárgy aktiválása a játékon belül
   - Tárgy metaadatok és tulajdonságok szinkronizálása

5. **Tárgy használat**: (todo)
   - Tárgy hozzáadása a játékos leltárához
   - Tárgy felszerelése vagy használata
   - Tárgy tulajdonságok érvényesítése

### Piactér használata

Az Incubus platform piactér használati folyamata a következő lépésekből áll:

1. **Piactér böngészés**:
   - Felhasználó böngészi a piactér listázásokat
   - Szűrés kategória, ár, ritkaság szerint
   - Keresés név vagy tulajdonságok alapján

2. **Eladási folyamat**: (todo)
   - Felhasználó kiválasztja az eladni kívánt NFT-t
   - Ár és eladási feltételek beállítása
   - Listázás létrehozása

3. **Vásárlási folyamat**: (todo)
   - Felhasználó kiválasztja a megvásárolni kívánt NFT-t
   - Ár és részletek ellenőrzése
   - Vásárlás megerősítése

4. **Aukciós folyamat**: (todo)
   - Aukció létrehozása
   - Licitálás
   - Aukció lezárása és elszámolás

5. **Tranzakció elszámolás**: (todo)
   - Letéti szerződés kezelése
   - Jogdíjak kifizetése
   - Tulajdonjog átruházás

**Folyamatábra: Piactér eladás**

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| NFT               +---->+ Eladási           +---->+ Listázás          |
| kiválasztása      |     | feltételek        |     | jóváhagyása       |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +--------+----------+
                                                             |
                                                             v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
| Listázás          +<----+ NFT               +<----+ Blockchain        |
| aktív             |     | jóváhagyás        |     | tranzakció        |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```

### Adminisztrációs folyamatok (todo)

Az Incubus platform adminisztrációs folyamatai a következő területeket fedik le:

1. **Felhasználó kezelés**:
   - Felhasználói fiókok áttekintése
   - Felhasználói jogosultságok kezelése
   - Felhasználói fiókok felfüggesztése vagy törlése

2. **Tartalom moderáció**:
   - Játékok és tartalmak jóváhagyása
   - Jelentett tartalmak felülvizsgálata
   - Nem megfelelő tartalmak eltávolítása

3. **Tranzakció monitorozás**:
   - Tranzakciók áttekintése és ellenőrzése
   - Gyanús tevékenységek kivizsgálása
   - Tranzakciók visszavonása vagy visszatérítése

4. **Rendszer monitorozás**:
   - Teljesítmény metrikák figyelése
   - Hibajelentések kezelése
   - Rendszer állapot ellenőrzése

5. **Beállítások kezelése**:
   - Platform beállítások konfigurálása
   - Integrációk kezelése
   - Értesítési beállítások

---

## Nemzetköziesítés és Lokalizáció

### Támogatott nyelvek

Az Incubus platform a következő nyelveket támogatja:
   - Magyar (hu)
   - Angol (en)
   - Német (de)
   - Francia (fr)
   - Spanyol (es)
   - Hindi (hi)
   - Arab (ar)
   - Mandarin (zh)

A platform nyelvi támogatása kiterjed a felhasználói felületre, a tartalom leírásokra, a jogi dokumentumokra és a felhasználói kommunikációra.

### Fordítási folyamat

Az Incubus platform fordítási folyamata a következő lépésekből áll:

1. **Fordítási kulcsok kezelése**:
   - Fordítási kulcsok definiálása a forráskódban
   - Fordítási kulcsok kinyerése automatizált eszközökkel
   - Fordítási kulcsok kategorizálása és szervezése

2. **Fordítási munkafolyamat**:
   - Fordítási fájlok előkészítése
   - Fordítások elkészítése (emberi fordítók vagy gépi fordítás)
   - Fordítások ellenőrzése és jóváhagyása
   - Fordítások integrálása a kódbázisba

3. **Fordítási infrastruktúra**:
   - Fordítási menedzsment rendszer (TMS)
   - Verziókezelés a fordításokhoz
   - Fordítási memória és terminológiai adatbázis
   - Fordítási API-k és integráció

4. **Minőségbiztosítás**:
   - Fordítási ellenőrzések és tesztek
   - Kontextuális ellenőrzések
   - Fordítási konzisztencia ellenőrzés
   - Felhasználói visszajelzések kezelése

5. **Folyamatos fordítás**:
   - Új tartalmak fordítása
   - Meglévő fordítások frissítése
   - Fordítási hiányosságok kezelése
   - Fordítási teljesség monitorozása

A fordítási folyamat során a platform JSON formátumú fordítási fájlokat használ, amelyek hierarchikus struktúrában tartalmazzák a fordítási kulcsokat és értékeket. Minden támogatott nyelvhez külön fordítási fájl tartozik, amelyek a `messages` könyvtárban találhatók. A fordítási fájlok tartalmazzák az összes felhasználói felületi szöveget, hibaüzenetet, értesítést és egyéb szöveges tartalmat.

A fordítási kulcsok hierarchikus szervezése lehetővé teszi a fordítások logikus csoportosítását és könnyű kezelését. A fő kategóriák közé tartoznak az általános szövegek, autentikációs szövegek, pénztárca-kezelési szövegek, játékokkal kapcsolatos szövegek és piactér szövegek.

### Lokalizációs stratégia

Az Incubus platform lokalizációs stratégiája a következő területekre fókuszál:

1. **Technikai megvalósítás**:
   - Next-intl használata
   - Fordítási fájlok JSON formátumban
   - Fordítási kulcsok hierarchikus szervezése
   - Fordítási hiányok kezelése fallback mechanizmussal

2. **Felhasználói élmény**:
   - Nyelvválasztó komponens
   - Nyelvi preferencia tárolása
   - Automatikus nyelvfelismerés
   - Részleges fordítások kezelése

3. **Tartalom lokalizáció**:
   - Játék leírások és metaadatok lokalizációja
   - Jogi dokumentumok lokalizációja
   - Marketing anyagok lokalizációja
   - E-mail sablonok lokalizációja

4. **Kulturális adaptáció**:
   - Dátum és idő formátumok
   - Szám és pénznem formátumok
   - Mértékegységek konverziója
   - Kulturális referenciák adaptálása

5. **Lokalizációs tesztelés**:
   - Fordítási teljességi tesztek
   - Vizuális tesztek (UI elrendezés)
   - Funkcionális tesztek
   - Nyelv-specifikus tesztek

A platform a Next.js keretrendszer nemzetköziesítési képességeit használja, amely lehetővé teszi az URL-ek lokalizálását és a megfelelő fordítási fájlok betöltését a felhasználó nyelvi beállításai alapján. Az URL-ekben a nyelvi kód prefixként jelenik meg (pl. `/hu/games`, `/en/games`), ami lehetővé teszi a keresőmotorok számára a különböző nyelvi verziók megfelelő indexelését.

A felhasználói felületen egy nyelvválasztó komponens teszi lehetővé a felhasználók számára a nyelv egyszerű váltását. A kiválasztott nyelv a böngészőben tárolódik, így a felhasználó következő látogatásakor automatikusan betöltődik a preferált nyelv. Emellett a rendszer képes automatikusan felismerni a felhasználó böngészőjének nyelvi beállításait, és ennek megfelelően ajánlani a megfelelő nyelvet.

A tartalom lokalizációja kiterjed a játékok leírásaira, metaadataira, jogi dokumentumokra és marketing anyagokra. A játékok leírásai és metaadatai több nyelven is tárolódnak az adatbázisban, és a felhasználó nyelvi beállításainak megfelelően jelennek meg. A jogi dokumentumok és marketing anyagok szintén több nyelven elérhetők, és a megfelelő verzió jelenik meg a felhasználó számára.

A kulturális adaptáció során a rendszer figyelembe veszi a különböző nyelvek és kultúrák sajátosságait. A dátumok, időpontok, számok és pénznemek formázása a felhasználó nyelvi beállításainak megfelelően történik. A mértékegységek konverziója és a kulturális referenciák adaptálása szintén része a lokalizációs folyamatnak.

---

## API Dokumentáció

### RESTful API-k

Az Incubus platform RESTful API-kat biztosít a kliens alkalmazások számára, amelyek lehetővé teszik a platform funkcióinak programozott elérését. Az API-k a következő alapelveket követik:

1. **Erőforrás-orientált tervezés**:
   - Az API-k erőforrásokra épülnek (játékok, felhasználók, pénztárcák, stb.)
   - Az erőforrások egyedi URI-kon keresztül érhetők el
   - Az erőforrások különböző reprezentációkban érhetők el (JSON)
   - Az erőforrások állapota a HTTP metódusokkal módosítható

2. **HTTP metódusok használata**:
   - GET: Erőforrások lekérdezése
   - POST: Új erőforrások létrehozása
   - PUT/PATCH: Meglévő erőforrások módosítása
   - DELETE: Erőforrások törlése

3. **Állapotmentes kommunikáció**:
   - Minden kérés tartalmazza az összes szükséges információt
   - A szerver nem tárol kliens-specifikus állapotot a kérések között
   - A munkamenet-kezelés token alapú autentikációval történik

4. **Egységes interfész**:
   - Konzisztens URI struktúra
   - Konzisztens adatformátum (JSON)
   - Konzisztens hibajelzés
   - Konzisztens státuszkódok

5. **Verziókezelés**:
   - Az API-k verziókezelése az URL-ben történik
   - A visszafelé kompatibilitás biztosított a fő verziók között
   - Az elavult API-k fokozatosan kerülnek kivezetésre

Az API-k a Next.js API Routes funkcióját használják, amely lehetővé teszi a szerveroldali API végpontok egyszerű létrehozását és kezelését. Az API végpontok a `/api` útvonalon érhetők el, és a kérések és válaszok JSON formátumban történnek.

### Végpontok

Az Incubus platform a következő fő API végpontokat biztosítja:

1. **Felhasználói API-k**:
   - `/api/users`: Felhasználók kezelése
   - `/api/users/{id}`: Konkrét felhasználó kezelése
   - `/api/auth/*`: Autentikációs végpontok

2. **Játék API-k**:
   - `/api/games`: Játékok kezelése
   - `/api/games/{id}`: Konkrét játék kezelése
   - `/api/genres`: Műfajok kezelése
   - `/api/tags`: Címkék kezelése
   - `/api/publishers`: Kiadók kezelése

3. **Pénztárca API-k**:
   - `/api/wallets`: Pénztárcák kezelése
   - `/api/wallets/{id}`: Konkrét pénztárca kezelése
   - `/api/transactions`: Tranzakciók kezelése

4. **Blockchain API-k**:
   - `/api/blockchains`: Blockchain hálózatok kezelése
   - `/api/blockchains/{id}`: Konkrét blockchain hálózat kezelése

5. **Piactér API-k**:
   - `/api/marketplace/listings`: Piactér listázások kezelése
   - `/api/marketplace/listings/{id}`: Konkrét listázás kezelése
   - `/api/marketplace/listings/{id}/purchase`: Listázás vásárlása

6. **Admin API-k**: (todo)
   - `/api/admin/users`: Felhasználók adminisztrációja
   - `/api/admin/games`: Játékok adminisztrációja
   - `/api/admin/analytics`: Analitikai adatok lekérdezése
   - `/api/admin/moderation`: Moderációs funkciók

Minden API végpont támogatja a megfelelő HTTP metódusokat az erőforrások kezeléséhez. A GET kérések támogatják a szűrést, rendezést és lapozást a lekérdezési paramétereken keresztül.

### Kérés/válasz formátumok

Az Incubus platform API-jai a következő kérés és válasz formátumokat használják:

1. **Kérés formátumok**:
   - **GET kérések**: Paraméterek az URL-ben query string formájában
     - Szűrés: `?filter[field]=value`
     - Rendezés: `?sort=field` vagy `?sort=-field` (csökkenő sorrend)
     - Lapozás: `?page=1&limit=10`
     - Keresés: `?search=keyword`
   
   - **POST/PUT/PATCH kérések**: JSON formátumú törzsadatok
     ```
     {
       "field1": "value1",
       "field2": "value2",
       "nestedObject": {
         "nestedField": "nestedValue"
       }
     }
     ```

2. **Válasz formátumok**:
   - **Sikeres válaszok**: JSON formátumú adatok
     ```
     {
       "success": true,
       "data": { ... },
       "message": "Optional success message"
     }
     ```
   
   - **Lapozott válaszok**: JSON formátumú adatok metaadatokkal
     ```
     {
       "success": true,
       "data": [ ... ],
       "meta": {
         "page": 1,
         "limit": 10,
         "total": 100,
         "totalPages": 10
       }
     }
     ```
   
   - **Hibaválaszok**: JSON formátumú hibaadatok
     ```
     {
       "success": false,
       "error": "Error type",
       "message": "Error message",
       "details": { ... }
     }
     ```

3. **Státuszkódok**:
   - 200 OK: Sikeres GET, PUT, PATCH kérés
   - 201 Created: Sikeres POST kérés
   - 204 No Content: Sikeres DELETE kérés
   - 400 Bad Request: Érvénytelen kérés
   - 401 Unauthorized: Hiányzó vagy érvénytelen autentikáció
   - 403 Forbidden: Nincs jogosultság
   - 404 Not Found: Erőforrás nem található
   - 422 Unprocessable Entity: Validációs hiba
   - 429 Too Many Requests: Rate limit túllépés
   - 500 Internal Server Error: Szerver hiba

### Hibakezelés

Az Incubus platform API-jai a következő hibakezelési mechanizmusokat használják:

1. **Validációs hibák**:
   - A bemeneti adatok validálása a Zod könyvtárral történik
   - A validációs hibák részletes hibaüzeneteket tartalmaznak
   - A validációs hibák 422-es státuszkóddal térnek vissza
   - A hibaüzenetek tartalmazzák a hibás mezőket és a hiba okát

2. **Autentikációs hibák**:
   - A hiányzó vagy érvénytelen autentikáció 401-es státuszkóddal tér vissza
   - Az elégtelen jogosultságok 403-as státuszkóddal térnek vissza
   - Az autentikációs hibák tartalmazzák a hiba okát és a szükséges lépéseket

3. **Erőforrás hibák**:
   - A nem létező erőforrások 404-es státuszkóddal térnek vissza
   - Az erőforrás konfliktusok 409-es státuszkóddal térnek vissza
   - Az erőforrás hibák tartalmazzák az érintett erőforrás azonosítóját és a hiba okát

4. **Szerver hibák**:
   - A belső szerver hibák 500-as státuszkóddal térnek vissza
   - A szerver hibák naplózásra kerülnek a hibaelhárítás céljából
   - A szerver hibák általános hibaüzenetet tartalmaznak a felhasználók számára

5. **Rate limiting**:
   - A túl sok kérés 429-es státuszkóddal tér vissza
   - A válasz tartalmazza a Retry-After fejlécet, amely jelzi, hogy mikor próbálkozhat újra a kliens
   - A rate limit információk a válasz fejlécekben is megjelennek (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

A hibakezelés során a rendszer strukturált hibaválaszokat ad, amelyek tartalmazzák a hiba típusát, üzenetét és részleteit. A hibaüzenetek felhasználóbarát formában jelennek meg, és segítik a fejlesztőket a hibák gyors azonosításában és javításában.

### Hitelesítés

Az Incubus platform API-jai a következő hitelesítési mechanizmusokat használják:

1. **OAuth 2.0 integráció**:
   - Támogatott külső szolgáltatók: Google
   - Az OAuth flow a standard authorization code flow-t követi
   - A sikeres autentikáció után session token kerül kiállításra

---

## Jövőbeli Fejlesztési Terv

### Tervezett funkciók

Az Incubus platform jövőbeli fejlesztési terve a következő új funkciókat tartalmazza:

1. **Közösségi funkciók**:
   - Felhasználói profilok és barátlisták
   - Közösségi aktivitás feed
   - Játékos csoportok és klánok
   - Beépített üzenetküldés és chat
   - Közösségi játékajánlások

2. **Játék streaming**:
   - Játékok közvetlen streamelése böngészőben
   - Alacsony latenciájú streaming technológia
   - Játék streaming előfizetési modell
   - Mobil eszközökre optimalizált streaming
   - Többjátékos streaming támogatás

3. **Fejlesztői eszközök**:
   - Fejlesztői portál és dokumentáció
   - SDK a blockchain integrációhoz
   - Analitikai dashboardok fejlesztőknek
   - Automatizált minőségellenőrzés
   - Fejlesztői közösség és fórum

4. **Bővített piactér**:
   - Aukciós rendszer
   - Kölcsönzési rendszer
   - Csere rendszer
   - Bundling és kedvezmények
   - Szezonális események és promóciók

5. **Gamifikáció**:
   - Platform-szintű teljesítmények
   - Jutalom rendszer és tokenek
   - Ranglista és verseny rendszer
   - Napi kihívások és küldetések
   - Lojalitási program

A tervezett funkciók célja a platform felhasználói élményének javítása, a közösségépítés elősegítése, a fejlesztők támogatása és a piactér bővítése. A funkciók prioritása a felhasználói visszajelzések és piaci trendek alapján változhat.

### Technológiai fejlesztések

Az Incubus platform jövőbeli technológiai fejlesztései a következő területekre fókuszálnak:

1. **Blockchain technológia**:
   - Layer 2 megoldások integrálása (Polygon zkEVM, Optimism)
   - Cross-chain támogatás (Ethereum, Solana, Avalanche)
   - NFT metaadat szabványok fejlesztése
   - Gas-mentes tranzakciók (account abstraction)
   - Decentralizált identitás (DID) integráció

2. **Frontend technológia**:
   - React Server Components teljes kihasználása
   - Streaming SSR implementálása
   - PWA (Progressive Web App) támogatás
   - WebAssembly integráció a teljesítmény javításához
   - WebGPU támogatás a grafikus teljesítmény javításához

3. **Backend technológia**:
   - Microservice architektúra bevezetése
   - GraphQL API bevezetése
   - Event-driven architektúra
   - Serverless függvények használata
   - Edge computing integráció

4. **Adatbázis technológia**:
   - Hibrid adattárolási megoldások
   - Time-series adatbázis analitikához
   - Graph adatbázis a kapcsolatok kezeléséhez
   - Sharding és particionálás
   - Multi-region replikáció

5. **AI és gépi tanulás**:
   - Személyre szabott ajánlások
   - Tartalom moderáció
   - Csalás detektálás
   - Játékélmény optimalizálás
   - Prediktív analitika

A technológiai fejlesztések célja a platform teljesítményének, skálázhatóságának és biztonságának javítása, valamint új innovatív funkciók bevezetése. A fejlesztések a legújabb technológiai trendeket és bevált gyakorlatokat követik.

### Skálázási stratégia

Az Incubus platform skálázási stratégiája a következő területekre fókuszál:

1. **Infrastruktúra skálázás**:
   - Horizontális skálázás Kubernetes-szel
   - Auto-scaling konfigurációk
   - Multi-region deployment
   - Edge caching és CDN optimalizálás
   - Terheléselosztás és failover

2. **Adatbázis skálázás**:
   - Read replica-k olvasási műveletekhez
   - Sharding írási műveletek elosztásához
   - Adatbázis connection pooling
   - Adatbázis cache réteg
   - Időszakos adatok archiválása

3. **Alkalmazás skálázás**:
   - Microservice dekompozíció
   - Aszinkron feldolgozás
   - Batch műveletek
   - Rate limiting és throttling
   - Prioritizált erőforrás allokáció

4. **Blockchain skálázás**:
   - Layer 2 megoldások
   - Batch tranzakciók
   - Off-chain számítások
   - State channels
   - Optimalizált smart contractok

5. **Globális skálázás**:
   - Lokalizált tartalom és szolgáltatások
   - Regionális infrastruktúra
   - Geolokációs routing
   - Compliance és adatvédelmi megfelelés
   - Lokális fizetési módszerek

A skálázási stratégia célja, hogy a platform képes legyen kezelni a növekvő felhasználói bázist és tranzakciós volument, miközben fenntartja a magas teljesítményt és rendelkezésre állást. A stratégia rugalmas és adaptív, képes alkalmazkodni a változó igényekhez és technológiai lehetőségekhez.

A fejlesztési terv végrehajtása során a platform folyamatosan működik, minimális leállással a frissítések során. A nagyobb frissítések előtt béta tesztelési időszakok lesznek, ahol a felhasználók kipróbálhatják az új funkciókat és visszajelzést adhatnak. A visszajelzések alapján a funkciók finomhangolása történik a végleges kiadás előtt.

A hosszú távú cél egy teljesen integrált, skálázható és felhasználóbarát platform létrehozása, amely összeköti a hagyományos játékipart a blockchain technológia előnyeivel, miközben értéket teremt mind a játékosok, mind a fejlesztők számára.

---

## Függelék

### Fogalomtár

**Blockchain**: Elosztott főkönyvi technológia, amely biztonságos, átlátható és megváltoztathatatlan adatrögzítést tesz lehetővé.

**NFT (Non-Fungible Token)**: Egyedi, nem helyettesíthető token, amely digitális vagy fizikai eszközök tulajdonjogát képviseli a blockchain-en.

**Smart Contract**: Önvégrehajtó kód a blockchain-en, amely automatikusan végrehajtja a szerződés feltételeit.

**Gas**: Az Ethereum és Polygon hálózatokon a tranzakciók és smart contract műveletek végrehajtásáért fizetett díj.

**Layer 2**: A blockchain fő rétege (Layer 1) felett működő másodlagos protokoll, amely javítja a skálázhatóságot és csökkenti a tranzakciós költségeket.

**Wallet (Pénztárca)**: Szoftver vagy hardver eszköz, amely tárolja a kriptovaluták és NFT-k hozzáféréséhez szükséges privát kulcsokat.

**Metamask**: Népszerű böngésző bővítmény, amely Ethereum és Polygon pénztárcaként működik.

**IPFS (InterPlanetary File System)**: Elosztott fájlrendszer, amely decentralizált módon tárolja és osztja meg a tartalmat.

**DAO (Decentralized Autonomous Organization)**: Decentralizált autonóm szervezet, amelynek szabályait és döntéshozatali folyamatait smart contractok kódolják.

**Polygon**: Ethereum Layer 2 skálázási megoldás, amely gyorsabb és olcsóbb tranzakciókat tesz lehetővé.

**Next.js**: React keretrendszer, amely szerver oldali renderelést, statikus oldal generálást és API végpontokat biztosít.

**Prisma**: Következő generációs ORM (Object-Relational Mapping) Node.js és TypeScript alkalmazásokhoz.

**SSR (Server-Side Rendering)**: Szerveroldali renderelés, ahol a HTML a szerveren generálódik és küldetik el a kliensnek.

**API (Application Programming Interface)**: Alkalmazásprogramozási interfész, amely lehetővé teszi különböző szoftverek kommunikációját.

### Referenciák

1. **Hivatalos dokumentációk**:
   - [Next.js dokumentáció](https://nextjs.org/docs)
   - [React dokumentáció](https://reactjs.org/docs)
   - [Polygon dokumentáció](https://polygon.technology/developers)
   - [Prisma dokumentáció](https://www.prisma.io/docs)
   - [Tailwind CSS dokumentáció](https://tailwindcss.com/docs)

2. **Szabványok**:
   - [ERC-721: NFT szabvány](https://eips.ethereum.org/EIPS/eip-721)
   - [ERC-1155: Multi-token szabvány](https://eips.ethereum.org/EIPS/eip-1155)
   - [OpenAPI specifikáció](https://swagger.io/specification/)
   - [JSON:API specifikáció](https://jsonapi.org/)

3. **Könyvek és publikációk**:
   - "Mastering Ethereum" - Andreas M. Antonopoulos, Gavin Wood
   - "Building Blockchain Apps" - Michael Yuan
   - "Next.js in Action" - Adam Boduch
   - "Fullstack React with TypeScript" - Alain Chautard

4. **Közösségi források**:
   - [GitHub Repository](https://github.com/incubus-network/incubus-platform)
   - [Polygon Developer Discord](https://discord.gg/polygon)
   - [Next.js Discord](https://discord.gg/nextjs)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/nextjs+polygon)
