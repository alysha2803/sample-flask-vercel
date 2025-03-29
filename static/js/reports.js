// Import Firebase modules directly from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBMtsowwpvfKiGKoW2yajOl5a4AtrWMCyg",
    authDomain: "cubachups1.firebaseapp.com",
    projectId: "cubachups1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('category-filter');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportsTableBody = document.querySelector('.reports-table tbody');
    const loadingIndicator = document.getElementById('loading-data');

    // Load initial data
    fetchImages(categoryFilter.value);

    // Fetch and display images from Firestore
    async function fetchImages(category = "") {
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
            reportsTableBody.innerHTML = '';

            if (querySnapshot.empty) {
                reportsTableBody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.image_name || 'Unnamed'}</td>
                    <td>${data.prediction || 'Unclassified'}</td>
                `;
                reportsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching images:", error);
            reportsTableBody.innerHTML = `<tr><td colspan="2">Error fetching data: ${error.message}</td></tr>`;
        } finally {
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    // Generate PDF Report
    function generatePDFReport(category = "") {
        try {
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

    // Category filter event listener
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        fetchImages(selectedCategory);
    });

    // Generate Report button event listener
    generateReportBtn.addEventListener('click', () => {
        const selectedCategory = categoryFilter.value;
        generatePDFReport(selectedCategory);
    });
});