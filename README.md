# 💼 Expense Tracker

Track every rupee, optimize every spend.  
A minimalist, full-stack Expense Tracker web app that empowers users to manage their personal finances with clarity and control.

---

## 🧠 Overview

Built using **PHP**, **MySQL**, and a clean **HTML/CSS/JavaScript** frontend, this project lets users:

- Record income and expenses on the go  
- View real-time summaries (total balance, income, expenses)  
- Stay logged in with secure authentication  
- Experience intuitive, responsive UI with seamless interaction

> 💡 Ideal for students, freelancers, and anyone who wants a lightweight self-hosted finance tracker.

---

## ⚙️ Tech Stack

| Layer      | Technology            |
|------------|------------------------|
| Frontend   | HTML5, CSS3, JavaScript |
| Backend    | PHP (Vanilla)          |
| Database   | MySQL                  |

---

## 🚀 Getting Started

### 1. Clone the repository

## 2. Setup the database
- Create a database named `expense_tracker`.
- Import the `expense_tracker.sql` file via **phpMyAdmin** or **CLI**.

## 3. Configure DB credentials in `db.php`

$host = "localhost";
$user = "root";
$password = "";
$dbname = "expense_tracker";

## 4. Run locally
- Place the project folder in `htdocs` (for XAMPP).
- Start **Apache** and **MySQL**.
- Visit: [http://localhost/EXPENSE-TRACKER](http://localhost/EXPENSE-TRACKER)

---

## 🧩 Project Structure
├── assets/ # Stylesheets & media

├── db.php # Database connector

├── login.php # Login system

├── register.php # New user signup

├── dashboard.php # Expense dashboard

├── add_expense.php # Logic to add new entries

├── delete_expense.php # Logic to delete entries

└── expense_tracker.sql # MySQL DB schema


yaml
Copy
Edit

---

## 📊 Coming Soon
- Transaction filters & categories  
- Visual analytics via Chart.js  
- Dark mode toggle  
- Export to CSV/PDF  
- Mobile-first responsive design  

---

## 🤝 Contributing
Want to collaborate or suggest a feature? Fork the repo, build your magic, and open a pull request. Let’s build it better—together.

---

## 📇 Author
**Utsav Charkhawala**  
🔗 [LinkedIn](https://www.linkedin.com/in/utsavcharkhawala) • 🛠️ [GitHub](https://github.com/Utsav045)
