"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Page() {  
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);  // ✅ Add loading state

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/summary") // ✅ Use 127.0.0.1 for localhost
            .then(response => {
                console.log("API Response:", response.data); // ✅ Debugging log
                setData(response.data);
            })
            .catch(error => console.error("Error fetching data:", error))
            .finally(() => setLoading(false)); // ✅ Set loading to false after fetch
    }, []);    

    // ✅ Show loading message while fetching data
    if (loading) return <p>Loading...</p>;

    // ✅ Show message if no data is available
    if (data.length === 0) return <p>No data available.</p>;

    const labels = data.map(item => item.prediction);
    const counts = data.map(item => item.count);

    const barChartData = {
        labels: labels,
        datasets: [{
            label: 'Prediction Count',
            data: counts,
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }]
    };

    const pieChartData = {
        labels: labels,
        datasets: [{
            data: counts,
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }]
    };

    return (
        <div style={{ width: '600px', margin: 'auto' }}>
            <h2>Prediction Summary</h2>
            <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Prediction Summary' } } }} />
            <h2>Prediction Distribution</h2>
            <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
    );
}
