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
Instalare Django
```bash
pip install django
django-admin --version ->verificam instalarea
```
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

![image](https://github.com/user-attachments/assets/661f5911-7b8a-453e-906d-b57f378ab789)

![image](https://github.com/user-attachments/assets/11c57812-117a-4d36-bcf5-5e13aec2f96e)

![image](https://github.com/user-attachments/assets/208936f3-a684-4097-80cf-d9e36b7c88ca)

![image](https://github.com/user-attachments/assets/b49032f8-d663-4a35-b2f8-d11c39073560)

![image](https://github.com/user-attachments/assets/77d938b6-5c1d-4297-9d51-ac4164958e78)

![image](https://github.com/user-attachments/assets/8bd6cb43-b8d1-4067-8845-64f310ee8427)

![image](https://github.com/user-attachments/assets/b435a74b-04ec-40a6-8c74-7f49a62020d4)

![image](https://github.com/user-attachments/assets/f4f3f057-bb06-46c6-984c-519e62cb3b81)

![image](https://github.com/user-attachments/assets/3b505855-641b-4987-af12-2da3d72e10e1)

![image](https://github.com/user-attachments/assets/8fe0adef-a38d-4770-92d1-7aa033ed80d7)

---
### Drepturi de autor
📚 Acest proiect a fost realizat ca parte a lucrării de licență de către Nagy Gabriel - Răzvan

🎓 Scopul său este academic, demonstrativ și poate fi extins pentru uz real în companii.

📄 Distribuirea codului este permisă sub licență MIT.




