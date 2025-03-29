document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    // Fetch data from our backend API which gets data from Firebase
    fetchDataAndRenderCharts();
});

async function fetchDataAndRenderCharts() {
    try {
        const response = await fetch('/api/summary');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.length === 0) {
            document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
                placeholder.innerHTML = '<p>No data available</p>';
            });
            return;
        }
        
        // Update summary statistics
        updateStatistics(data);
        
        // Prepare data for charts
        const labels = data.map(item => item.prediction);
        const counts = data.map(item => item.count);
        
        // Render charts
        renderPieChart(labels, counts);
        renderBarChart(labels, counts);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
            placeholder.innerHTML = '<p>Error loading chart data</p>';
        });
    }
}

function updateStatistics(data) {
    // Calculate total classifications
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    document.getElementById('total-classifications').textContent = totalCount.toLocaleString();
    
    // Find most common item
    const mostCommonItem = data.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current
    );
    document.getElementById('most-common').textContent = mostCommonItem.prediction;
}

function renderPieChart(labels, counts) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Classification Distribution'
                }
            }
        }
    });
}

function renderBarChart(labels, counts) {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Items',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weekly Classifications'
                }
            }
        }
    });
}