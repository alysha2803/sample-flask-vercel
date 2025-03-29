document.addEventListener("DOMContentLoaded", function () {
    console.log("Upload page loaded");

    const form = document.querySelector("form");
    const fileInput = document.getElementById("file-upload");
    const previewContainer = document.querySelector(".image-preview");
    const resultPlaceholder = document.querySelector(".result-placeholder");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Stop form from redirecting

        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        // Show image preview
        const reader = new FileReader();
        reader.onload = function (e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);

        // Send AJAX request
        fetch("https://recycler-api.onrender.com/predict", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            resultPlaceholder.innerHTML = `<p>Prediction: <strong>${data.prediction}</strong></p>`;
        })
        .catch(error => {
            console.error("Error:", error);
            resultPlaceholder.innerHTML = `<p style="color: red;">Failed to classify. Try again.</p>`;
        });
    });
});
