// Line Chart
const ctx1 = document.getElementById('lineChart').getContext('2d');

new Chart(ctx1, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Portfolio Value',
      data: [800000, 900000, 950000, 1100000, 1200000, 1250000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true
    }]
  }
});

// Pie Chart
const ctx2 = document.getElementById('pieChart').getContext('2d');

new Chart(ctx2, {
  type: 'pie',
  data: {
    labels: ['Equity', 'Gold', 'Debt'],
    datasets: [{
      data: [60, 20, 20],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
    }]
  }
});
