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

📌 Este necesară o bază de date MySQL configurată în `.env`.

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
📁 Structură generală

employee-gamification/
│
├── gamification-frontend/     # Interfața React
│   └── src/                   # Componente, pagini, API
│
├── gamification-backend/      # API Django
│   ├── core/                  # Aplicația principală Django
│   ├── manage.py
│   └── .env                   
│
├── requirements.txt
├── .gitignore
└── README.md


