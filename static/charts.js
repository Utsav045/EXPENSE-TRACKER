document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const recentExpensesList = document.getElementById('recentExpenses');
    let expenseChart = null; // Initialize chart variable

    // Initialize the app
    fetchExpenseData();

    // Form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expenseData = {
            name: document.getElementById('expenseName').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            category: document.getElementById('expenseCategory').value
        };

        // Basic validation
        if (!expenseData.name || isNaN(expenseData.amount) || !expenseData.category) {
            alert('Please fill all fields correctly');
            return;
        }

        fetch('/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                expenseForm.reset();
                fetchExpenseData();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add expense');
        });
    });

    // Fetch data from Flask backend
    function fetchExpenseData() {
        fetch('/get_summary?budget=2000')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                updateSummary(data);
                updateChart(data.amount_by_category);
                updateRecentExpenses(data.expenses);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Initialize chart with empty data if fetch fails
                updateChart({
                    '🍔 Food': 0,
                    '🏠 Home': 0,
                    '💼 Work': 0,
                    '🎉 Fun': 0,
                    '✨ Misc': 0
                });
            });
    }

    // Update summary cards
    function updateSummary(data) {
        document.getElementById('remaining-budget').textContent = 
            `$${data.remaining_budget.toFixed(2)}`;
        document.getElementById('total-spent').textContent = 
            `$${data.total_spent.toFixed(2)}`;
        document.getElementById('daily-budget').textContent = 
            `$${data.daily_budget.toFixed(2)}`;
    }

    // Create/update the chart
    function updateChart(categoryData) {
        const ctx = document.getElementById('expenseChart');
        
        // Check if canvas exists
        if (!ctx) {
            console.error('Canvas element not found!');
            return;
        }

        // Prepare data
        const categories = Object.keys(categoryData).map(cat => {
            const emoji = cat.match(/\p{Emoji}/u)?.[0] || '';
            return `${emoji} ${cat.replace(emoji, '').trim()}`;
        });
        const amounts = Object.values(categoryData);

        // Color palette matching your design
        const backgroundColors = [
            'rgba(76, 201, 240, 0.7)',  // #4cc9f0
            'rgba(72, 149, 239, 0.7)',  // #4895ef
            'rgba(67, 97, 238, 0.7)',    // #4361ee
            'rgba(63, 55, 201, 0.7)',    // #3f37c9
            'rgba(114, 9, 183, 0.7)'     // #7209b7
        ];

        // Destroy previous chart if exists
        if (expenseChart) {
            expenseChart.destroy();
        }

        // Create new chart
        expenseChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Inter', sans-serif"
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 16
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 14
                        },
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // Update recent expenses list
    function updateRecentExpenses(expenses) {
        recentExpensesList.innerHTML = '';
        
        if (!expenses || expenses.length === 0) {
            recentExpensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses recorded yet</p>
                </div>
            `;
            return;
        }

        // Show last 5 expenses (newest first)
        expenses.slice(-5).reverse().forEach(expense => {
            const emoji = expense.category.match(/\p{Emoji}/u)?.[0] || '💰';
            const categoryName = expense.category.replace(emoji, '').trim();
            
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <div class="expense-emoji">${emoji}</div>
                <div class="expense-details">
                    <h4>${expense.name}</h4>
                    <p>${categoryName} • ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="expense-amount">-$${expense.amount.toFixed(2)}</div>
            `;
            recentExpensesList.appendChild(expenseItem);
        });
    }

    // Initialize chart with empty data on first load
    updateChart({
        '🍔 Food': 0,
        '🏠 Home': 0,
        '💼 Work': 0,
        '🎉 Fun': 0,
        '✨ Misc': 0
    });
});