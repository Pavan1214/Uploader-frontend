// DOM Elements
const form = document.getElementById('songForm');
const songFileInput = document.getElementById('songFile');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');
const spinner = document.getElementById('spinner');
const statusMessage = document.getElementById('statusMessage');


// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset UI
    statusMessage.classList.add('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    progressContainer.style.display = 'block';

    // Disable submit button and show spinner
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    submitBtn.querySelector('.button-text').textContent = 'Uploading...';

    const file = songFileInput.files[0];
    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();
    const genre = document.getElementById("genre").value.trim();
    const language = document.getElementById("language").value.trim();

    const rawDuration = document.getElementById('duration').value.trim();
    const duration = rawDuration || "3"; // Default to 3 if empty

    const cover = document.getElementById('cover').value.trim();


    const cloudinaryURL = `https://api.cloudinary.com/v1_1/dodrw52td/video/upload`;
    const uploadPreset = "songscafe1214";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        // Upload to Cloudinary with progress tracking
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressText.textContent = percentComplete + '%';
            }
        });

        const cloudResponse = await new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error("Cloudinary upload failed"));
                    }
                }
            };

            xhr.open('POST', cloudinaryURL, true);
            xhr.send(formData);
        });

        if (!cloudResponse.secure_url) {
            throw new Error("Cloudinary upload failed - no URL returned");
        }

        const url = cloudResponse.secure_url;
        const public_id = cloudResponse.public_id;

        const songData = {
            title,
            artist,
            cover,
            url,
            public_id,
            duration,
            genre,
            language
        };

        if (cover) songData.cover = cover;


        // Send to backend
        const backendRes = await fetch('https://uploader-backend-1.onrender.com/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(songData),
        });

        const result = await backendRes.json();

        // Show success message
        statusMessage.textContent = result.message || '✅ Song uploaded successfully!';
        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('success');

        // Reset form after successful upload
        form.reset();
        progressContainer.style.display = 'none';
    } catch (err) {
        console.error("Upload error:", err);

        // Show error message
        statusMessage.textContent = "❌ Upload failed: " + (err.message || "Please try again later");
        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('error');
    } finally {
        // Re-enable submit button and hide spinner
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        submitBtn.querySelector('.button-text').textContent = 'Upload';
    }
});

