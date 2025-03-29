document.addEventListener("DOMContentLoaded", function () {
    console.log("Upload page loaded");

    const form = document.querySelector("form");
    const fileInput = document.getElementById("file-upload");
    const previewContainer = document.querySelector(".image-preview");
    const resultPlaceholder = document.querySelector(".result-placeholder");
    const submitButton = form.querySelector("button[type='submit']");

    let isSubmitting = false; // Flag to prevent multiple requests


     // Auto display image preview when file is selected
    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Stop form from redirecting

        if (isSubmitting) return; // Prevent multiple submissions
        isSubmitting = true;
        submitButton.disabled = true;
        submitButton.innerHTML = `Processing <span class="loading-spinner"></span>`;


        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first!");
            resetButton(); // Reset button if no file selected
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

     
    // **Create a timeout promise for 5 seconds**
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ error: "Timeout" }), 20000); // If no response in 5s, resolve with error
    });

    // **Send AJAX request with timeout handling**
    Promise.race([
        fetch("https://recycler-api.onrender.com/predict", { method: "POST", body: formData })
            .then(response => response.json()), // API request
        timeoutPromise // Timeout handling
    ])
    .then(data => {
        if (data.error === "Timeout") {
            resultPlaceholder.innerHTML = `<p style="color: red;">Server is taking too long. Try again later.</p>`;
        } else if (data.prediction) {
            resultPlaceholder.innerHTML = `<p>Prediction: <strong>${data.prediction}</strong></p>`;
        } else {
            resultPlaceholder.innerHTML = `<p style="color: red;">Failed to classify. Try again.</p>`;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        resultPlaceholder.innerHTML = `<p style="color: red;">Failed to classify. Try again.</p>`;
    })
    .finally(() => {
        resetButton(); // Always reset button after processing
    });
});
     // Function to reset button after processing
    function resetButton() {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.innerHTML = "Classify Now";
    }
});
