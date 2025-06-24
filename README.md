# 🚀 RocketQuest – Employee Gamification Platform

RocketQuest este o platformă modernă pentru motivarea echipelor prin gamificare. Include taskuri, questuri, quizuri AI, feedback și management de echipe – totul într-un sistem modular, modern și extensibil.

##  Funcționalități

- Autentificare cu JWT
- Management taskuri și echipe
- Questuri cu puncte și XP
- Quizuri generate automat cu AI
- Ajutor rezolvare Task-uri cu AI și chat liber cu AI
- Calendar absențe și feedback intern
- Clasamente, badge-uri și niveluri

---

## ⚙️ Rulare aplicație locală

### 🔹 1. Backend (Django)
```bash
# Activează mediul virtual
.\env\Scripts\activate

# Rulează serverul Django
python manage.py runserver

Aplicația backend va rula implicit la:
http://127.0.0.1:8000

În alt terminal separat rulam pentru frontend:

cd gamification-frontend
npm install
npm start
