  <h1 align="center">🚀 RocketQuest – Employee Gamification Platform</h1>

<p align="center">
  <strong>O platformă modernă pentru motivarea echipelor prin gamificare</strong><br/>
  Taskuri, questuri, quizuri AI, feedback, niveluri, calendar de absențe și multe altele – totul într-un singur sistem!
</p>

<p align="center">
  <img src="https://img.shields.io/badge/backend-Django-092E20?logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/AI-OpenAI-412991?logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/license-MIT-blue"/>
</p>

---

## 🔥 Funcționalități cheie

✅ Autentificare securizată cu JWT  
📋 Management complet al taskurilor și echipelor  
🧠 Quizuri generate automat cu AI (GPT)  
💬 Chat liber + asistent pentru rezolvarea taskurilor cu AI  
🏆 Questuri, XP, niveluri și badge-uri  
📅 Calendar pentru absențe + cereri de concediu  
📊 Clasamente și feedback între colegi  

---

## ⚙️ Rulare aplicație locală

📌 Este necesară o bază de date MySQL configurată în `settings.py`.

### 🔹 Backend – Django

```bash
# Activează mediul virtual
.\env\Scripts\activate

# Rulează serverul Django
python manage.py runserver


```
Acces backend:
```bash
http://127.0.0.1:8000
```

### 🔹 Frontend – React
```bash
cd gamification-frontend
npm install
npm start
```
Acces frontend:
```bash
http://localhost:3000
```
## 📁 Structură generală a proiectului

employee-gamification/
│
├── gamification-frontend/ # Interfața React
│ └── src/ # Componente, pagini, stiluri
│
├── gamification-backend/ # Backend Django
│ ├── core/ # Aplicația principală
│ ├── manage.py
│ └── .env # Variabile de mediu (IGNORAT în Git)
│
├── requirements.txt # Dependențe Python
├── .gitignore # Fișiere ignorate
└── README.md



---

## 🧪 Dependențe importante

### 🔸 Backend – Django

| 📦 Pachet               | 🛠 Funcționalitate principală                     |
|-------------------------|--------------------------------------------------|
| `djangorestframework`   | Creare de API REST                              |
| `djoser`                | Autentificare JWT + endpointuri standard        |
| `django-cors-headers`   | Permite cereri din React (CORS)                 |
| `python-dotenv`         | Încarcă variabile din fișier `.env`             |
| `openai`                | Integrare cu GPT (quizuri, AI helper)           |
| `Pillow`                | Gestionare imagini și fișiere media             |
| `drf-yasg`              | Generare automată documentație Swagger          |

---

### 🔸 Frontend – React

| 📦 Pachet            | 🛠 Funcționalitate principală             |
|----------------------|------------------------------------------|
| `react-router-dom`   | Navigare între pagini în React SPA       |
| `axios`              | Cereri HTTP către backend Django         |
| `jwt-decode`         | Decodare tokenuri JWT                    |
| `tailwindcss`        | Stiluri rapide și responsive             |
| `react-icons`        | Bibliotecă de pictograme UI              |

---

## 🔐 Fișier `.env` (pentru backend)

Creează un fișier `.env` în folderul `gamification-backend/` cu următorul conținut:

```env
DJANGO_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=mysql://user:password@localhost:3306/rocketquest
```
![Untitled](https://github.com/user-attachments/assets/5fbb8675-0ab9-4893-a705-394fdb05a5bf)

![image](https://github.com/user-attachments/assets/19760111-8971-4d12-88c0-689410794eb6)

![image](https://github.com/user-attachments/assets/d796c1f0-80a1-4d54-9b6f-4f93d049f788)

![image](https://github.com/user-attachments/assets/84de1d3f-ccd3-43f7-b378-6ecfec44f092)

![image](https://github.com/user-attachments/assets/552daa4e-95af-4744-8c52-1dd5bf5d6ce5)

![image](https://github.com/user-attachments/assets/a4389907-d4af-4326-816f-0f7a284deb7f)

![image](https://github.com/user-attachments/assets/5e126695-79fa-483d-a546-d8d275fd3fc1)

![image](https://github.com/user-attachments/assets/2879dbd1-8559-4d49-8cae-ed5e77bb7661)

![image](https://github.com/user-attachments/assets/febfdabe-093c-4814-ac51-4dee151e0bc6)

![image](https://github.com/user-attachments/assets/5c0a292d-b7e9-430a-a518-cfa5eeb5cd17)

![image](https://github.com/user-attachments/assets/4ec0fe3c-8a96-43f9-9a12-13a43bff4dd6)

---
### Drepturi de autor
📚 Acest proiect a fost realizat ca parte a lucrării de licență de către Nagy Gabriel - Răzvan

🎓 Scopul său este academic, demonstrativ și poate fi extins pentru uz real în companii.

📄 Distribuirea codului este permisă sub licență MIT.




