// Import Firebase modules directly from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
    // Your Firebase configuration - consider using environment variables in production
    const firebaseConfig = {
        apiKey: "AIzaSyBMtsowwpvfKiGKoW2yajOl5a4AtrWMCyg",
        authDomain: "cubachups1.firebaseapp.com",
        projectId: "cubachups1"
    };

    // Check if we're on Vercel and need to fetch Firebase status
    const checkFirebaseStatus = async () => {
        try {
            const response = await fetch('/api/firebase-config');
            const data = await response.json();
            return data.status === 'connected';
        } catch (error) {
            console.error("Error checking Firebase status:", error);
            return false;
        }
    };

    // Initialize Firebase with error handling
    const initializeFirebase = async () => {
        try {
            // First check if our backend Firebase is properly configured
            const isBackendFirebaseAvailable = await checkFirebaseStatus();

            if (!isBackendFirebaseAvailable) {
                console.warn("Backend Firebase is not available. Some features may not work.");
            }

            // Initialize client-side Firebase anyway
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            setupUIHandlers(db);
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            showError("Failed to initialize Firebase. Please check console for details.");
        }
    };

    // Start initialization
    initializeFirebase();
});

function setupUIHandlers(db) {
    const categoryFilter = document.getElementById('category-filter');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportsTableBody = document.querySelector('.reports-table tbody');
    const loadingIndicator = document.getElementById('loading-data');

    if (!categoryFilter || !generateReportBtn || !reportsTableBody) {
        console.error("Required DOM elements not found");
        return;
    }

    // Load initial data
    fetchImages(db, categoryFilter.value, reportsTableBody, loadingIndicator);

    // Category filter event listener
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        fetchImages(db, selectedCategory, reportsTableBody, loadingIndicator);
    });

    // Generate Report button event listener
    generateReportBtn.addEventListener('click', () => {
        const selectedCategory = categoryFilter.value;
        generatePDFReport(selectedCategory);
    });
}

// Fetch and display images from Firestore
async function fetchImages(db, category = "", tableBody, loadingIndicator) {
    if (!db || !tableBody) {
        console.error("Missing required parameters");
        return;
    }

    try {
        // Show loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        let q;
        if (category && category !== "") {
            q = query(collection(db, 'test_collection'), where('prediction', '==', category));
        } else {
            q = collection(db, 'test_collection');
        }

        const querySnapshot = await getDocs(q);

        // Clear existing table rows
        tableBody.innerHTML = '';

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.image_name || 'Unnamed'}</td>
                <td>${data.prediction || 'Unclassified'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching images:", error);
        tableBody.innerHTML = `<tr><td colspan="2">Error fetching data: ${error.message}</td></tr>`;
    } finally {
        // Hide loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// Generate PDF Report (same as your original implementation)
function generatePDFReport(category = "") {
    try {
        // Check if jsPDF is available
        if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
            console.error("jsPDF library not loaded");
            alert("Report generation failed: PDF library not loaded. Please refresh the page and try again.");
            return;
        }

        const doc = new jspdf.jsPDF();

        // Add title
        const title = category ? `Recycling Classification Report - ${category} Items` : 'Recycling Classification Report - All Items';
        doc.setFontSize(16);
        doc.text(title, 14, 22);

        // Add timestamp
        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Generated on: ${date}`, 14, 30);

        const tableColumn = ["Image Name", "Prediction"];
        const tableRows = [];

        const tableBodyRows = document.querySelectorAll('.reports-table tbody tr');

        if (tableBodyRows.length === 0 ||
           (tableBodyRows.length === 1 && tableBodyRows[0].textContent.includes('No data available'))) {
            alert('No data available to generate report');
            return;
        }

        tableBodyRows.forEach(row => {
            const columns = row.querySelectorAll('td');
            if (columns.length >= 2) {
                tableRows.push([
                    columns[0].textContent,
                    columns[1].textContent
                ]);
            }
        });

        // Check if autoTable plugin is available
        if (typeof doc.autoTable !== 'function') {
            console.error("jsPDF autoTable plugin not loaded");
            alert("Report generation failed: PDF table plugin not loaded. Please refresh the page and try again.");
            return;
        }

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [66, 135, 245] }
        });

        // Add summary at the bottom
        const totalItems = tableRows.length;
        const currentY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total items: ${totalItems}`, 14, currentY);

        const filename = `recycling_report_${category || 'all'}_${date.replace(/\//g, '-')}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Failed to generate PDF: ${error.message}`);
    }
}

function showError(message) {
    const reportsTableBody = document.querySelector('.reports-table tbody');
    if (reportsTableBody) {
        reportsTableBody.innerHTML = `<tr><td colspan="2">${message}</td></tr>`;
    }

    const loadingIndicator = document.getElementById('loading-data');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}