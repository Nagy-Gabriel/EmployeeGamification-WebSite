# 🚀 RocketQuest – Employee Gamification Platform

<p align="center">
  <strong>O platformă modernă pentru motivarea echipelor prin gamificare</strong>
</p>

<p align="center">
  Taskuri • Questuri • Quizuri AI • Feedback • Niveluri • Calendar de absențe • Asistent AI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/AI-OpenAI-412991?logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-blue"/>
</p>

---

## 📖 Despre proiect

RocketQuest este o platformă de gamificare destinată companiilor care doresc să crească implicarea și productivitatea angajaților.

Aplicația combină managementul taskurilor cu elemente de joc precum XP, niveluri, badge-uri și clasamente, integrând totodată funcționalități bazate pe Inteligență Artificială pentru generarea de quizuri și asistență utilizatorilor.

---

## ✨ Funcționalități principale

### 🔐 Autentificare și securitate

* Autentificare JWT
* Gestionare utilizatori
* Securizare API

### 📋 Management taskuri

* Creare și administrare taskuri
* Organizare echipe
* Monitorizare progres

### 🧠 Inteligență Artificială

* Generare quizuri cu GPT
* Chat AI pentru utilizatori
* Asistent pentru rezolvarea taskurilor

### 🏆 Gamificare

* XP și niveluri
* Badge-uri și realizări
* Questuri
* Clasamente între utilizatori

### 📅 Management concedii

* Cereri de concediu
* Aprobare și respingere
* Calendar centralizat

### 📊 Feedback și performanță

* Feedback între colegi
* Clasamente
* Monitorizare activitate

---

## 🛠️ Tehnologii utilizate

| Componentă    | Tehnologie            |
| ------------- | --------------------- |
| Frontend      | React                 |
| Backend       | Django REST Framework |
| Baza de date  | MySQL                 |
| AI            | OpenAI GPT            |
| Autentificare | JWT                   |
| Styling       | Tailwind CSS          |

---

## ⚙️ Rulare locală

### Instalare Django

```bash
pip install django
django-admin --version
```

### Backend – Django

```bash
# Activează mediul virtual
.\env\Scripts\activate

# Rulează serverul
python manage.py runserver
```

Acces backend:

```text
http://127.0.0.1:8000
```

### Frontend – React

```bash
cd gamification-frontend
npm install
npm start
```

Acces frontend:

```text
http://localhost:3000
```

---

## 🔐 Configurare .env

Creează fișierul `.env` și adaugă:

```env
OPENAI_API_KEY=your-openai-api-key
```

---

## 📂 Structura proiectului

```text
employee-gamification/
│
├── gamification-frontend/
│   ├── public/
│   └── src/
│       ├── data/
│       ├── pages/
│       └── styles/
│
├── gamification-backend/
│   ├── core/
│   ├── manage.py
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 📦 Dependențe Backend

| Pachet              | Funcționalitate    |
| ------------------- | ------------------ |
| djangorestframework | API REST           |
| djoser              | JWT Authentication |
| django-cors-headers | CORS               |
| python-dotenv       | Variabile mediu    |
| openai              | Integrare GPT      |
| Pillow              | Gestionare imagini |
| drf-yasg            | Swagger API Docs   |

---

## 📦 Dependențe Frontend

| Pachet           | Funcționalitate |
| ---------------- | --------------- |
| react-router-dom | Routing         |
| axios            | HTTP Requests   |
| jwt-decode       | JWT Decode      |
| tailwindcss      | Styling         |
| react-icons      | Iconuri UI      |

---

# 📸 Capturi de ecran



![image](https://github.com/user-attachments/assets/b9c619e6-2749-4778-b559-e9c4a47a0fa5)

![image](https://github.com/user-attachments/assets/da686174-3bcf-402a-9dd0-f2a1f5224a39)

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

<img src="https://github.com/user-attachments/assets/8fe0adef-a38d-4770-92d1-7aa033ed80d7" alt="image" width="500"/>


---

## 👨‍🎓 Autor

**Nagy Gabriel-Răzvan**

Proiect realizat în cadrul lucrării de licență.

---

## 📄 Licență

Acest proiect este distribuit sub licența **MIT**.
