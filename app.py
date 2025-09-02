from flask import Flask, render_template, request, jsonify
import calendar
import datetime
import os
from expense import Expense

def save_expense_to_file(expense: Expense, expense_file_path):
    print(f"🎯 Saving User Expense: {expense} to {expense_file_path}")
    with open(expense_file_path, "a", encoding='utf-8') as f:
        f.write(f"{expense.name},{expense.amount},{expense.category}\n")

def summarize_expenses(expense_file_path, budget):
    print(f"🎯 Summarizing User Expense")
    expenses: list[Expense] = []
    with open(expense_file_path, "r", encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            if line.strip():  # Skip empty lines
                expense_name, expense_amount, expense_category = line.strip().split(",")
                line_expense = Expense(
                    name=expense_name,
                    amount=float(expense_amount),
                    category=expense_category,
                )
                expenses.append(line_expense)

    amount_by_category = {}
    for expense in expenses:
        key = expense.category
        if key in amount_by_category:
            amount_by_category[key] += expense.amount
        else:
            amount_by_category[key] = expense.amount

    total_spent = sum([x.amount for x in expenses])
    remaining_budget = budget - total_spent

    now = datetime.datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    remaining_days = days_in_month - now.day
    daily_budget = remaining_budget / remaining_days if remaining_days > 0 else 0

    return {
        "by_category": amount_by_category,
        "total_spent": total_spent,
        "remaining_budget": remaining_budget,
        "daily_budget": daily_budget,
        "expenses": [{"name": e.name, "amount": e.amount, "category": e.category} for e in expenses]
    }

# Flask app setup
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/add_expense', methods=['POST'])
def handle_add_expense():
    data = request.json
    expense = Expense(
        name=data['name'],
        amount=float(data['amount']),
        category=data['category']
    )
    save_expense_to_file(expense, "expenses.csv")
    return jsonify({"status": "success"})

@app.route('/get_expenses', methods=['GET'])
def handle_get_expenses():
    expenses = []
    with open("expenses.csv", 'r', encoding='utf-8') as f:
        for line in f.readlines():
            if line.strip():
                name, amount, category = line.strip().split(',')
                expenses.append({
                    "name": name,
                    "amount": float(amount),
                    "category": category
                })
    return jsonify(expenses)

@app.route('/get_summary', methods=['GET'])
def get_summary():
    budget = float(request.args.get('budget', 3000))  # Default budget of 3000
    summary = summarize_expenses("expenses.csv", budget)
    return jsonify({
        "remaining_budget": summary["remaining_budget"],
        "total_spent": summary["total_spent"],
        "daily_budget": summary["daily_budget"],
        "amount_by_category": summary["by_category"]
    })

if __name__ == '__main__':
    app.run(debug=False, port=3467) 