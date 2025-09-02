// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const expensesList = document.getElementById('expenses-list');
    const budgetDisplay = document.getElementById('remaining-budget');
    const totalSpentDisplay = document.getElementById('total-spent');
    const dailyBudgetDisplay = document.getElementById('daily-budget');
    const dailyBudgetHeader = document.getElementById('daily-budget-header');
    const totalSpentHeader = document.getElementById('total-spent-header');
    const budgetProgressBar = document.getElementById('budget-progress-bar');
    const updateBudgetBtn = document.getElementById('update-budget-btn');
    const totalBudgetInput = document.getElementById('total-budget');
    const chartContainer = document.getElementById('category-chart');
    
    // Global variables
    let currentBudget = 3000; // Default budget
    let expenseChart = null;

    // Initialize the app
    loadExpenses();
    updateBudgetDisplay(currentBudget);

    // Event Listeners
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    updateBudgetBtn.addEventListener('click', handleBudgetUpdate);
    totalBudgetInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBudgetUpdate();
        }
    });

    // Functions
    function handleBudgetUpdate() {
        const newBudget = parseFloat(totalBudgetInput.value);
        if (newBudget && newBudget > 0) {
            currentBudget = newBudget;
            updateBudgetDisplay(currentBudget);
            // Clear the input after successful update
            totalBudgetInput.value = '';
        } else {
            alert('Please enter a valid budget amount greater than 0');
        }
    }

    function handleExpenseSubmit(e) {
        e.preventDefault();
        
        const expenseData = {
            name: document.getElementById('expense-name').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            category: document.getElementById('expense-category').value
        };

        if (!expenseData.name || isNaN(expenseData.amount) || !expenseData.category) {
            alert('Please fill all fields correctly');
            return;
        }

        addExpense(expenseData)
            .then(() => {
                expenseForm.reset();
                loadExpenses();
                updateBudgetDisplay(currentBudget);
            })
            .catch(error => {
                console.error('Error adding expense:', error);
                alert('Failed to add expense. Please try again.');
            });
    }

    async function addExpense(expenseData) {
        const response = await fetch('/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add expense');
        }
        return response.json();
    }

    async function loadExpenses() {
        try {
            const response = await fetch('/get_expenses');
            const expenses = await response.json();
            renderExpenses(expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    function updateBudgetDisplay(totalBudget) {
        fetch('/get_summary?budget=' + totalBudget)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update budget displays
                budgetDisplay.textContent = '$' + data.remaining_budget.toFixed(2);
                totalSpentDisplay.textContent = '$' + data.total_spent.toFixed(2);
                dailyBudgetDisplay.textContent = '$' + data.daily_budget.toFixed(2);
                
                // Update header displays
                totalSpentHeader.textContent = '$' + data.total_spent.toFixed(2);
                dailyBudgetHeader.textContent = '$' + data.daily_budget.toFixed(2);
                
                // Update progress bar
                const spentPercentage = (data.total_spent / totalBudget) * 100;
                budgetProgressBar.style.width = Math.min(spentPercentage, 100) + '%';
                
                // Update remaining days
                const now = new Date();
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const remainingDays = daysInMonth - now.getDate();
                document.getElementById('remaining-days').textContent = remainingDays;
                
                // Update chart
                updateChart(data.amount_by_category);
            })
            .catch(error => {
                console.error('Error:', error);
                // Set default values if there's an error
                budgetDisplay.textContent = '$0.00';
                totalSpentDisplay.textContent = '$0.00';
                dailyBudgetDisplay.textContent = '$0.00';
                totalSpentHeader.textContent = '$0.00';
                dailyBudgetHeader.textContent = '$0.00';
                budgetProgressBar.style.width = '0%';
                document.getElementById('remaining-days').textContent = '0';
            });
    }

    function renderExpenses(expenses) {
        expensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: #adb5bd;"></i>
                    <p>No expenses added yet</p>
                </div>
            `;
            return;
        }
        
        // Display last 5 expenses (most recent first)
        const recentExpenses = expenses.slice(-5).reverse();
        
        recentExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            const emoji = expense.category.match(/\p{Emoji}/u)?.[0] || '💰';
            const categoryName = expense.category.replace(emoji, '').trim();
            
            expenseItem.innerHTML = `
                <div class="expense-info">
                    <span class="emoji">${emoji}</span>
                    <div class="expense-details">
                        <h4>${expense.name}</h4>
                        <p>${categoryName}</p>
                    </div>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            `;
            
            expensesList.appendChild(expenseItem);
        });
    }
    

    function updateChart(categoryData) {
        // Prepare chart data
        const categories = Object.keys(categoryData).map(cat => {
            const emoji = cat.match(/\p{Emoji}/u)?.[0] || '';
            return cat.replace(emoji, '').trim();
        });
        
        const amounts = Object.values(categoryData);
        
        // Color palette for chart
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];

        // Create or update chart
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);
        
        if (expenseChart) {
            expenseChart.destroy();
        }
        
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
});