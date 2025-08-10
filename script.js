// ---------------------- Default Covers ----------------------
const defaultCovers = [
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844145/60ac9991-e83e-4de4-bfb4-c341129237e0_ssywaf.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754825471/frame-harirak-iPwHUd19R38-unsplash_h0t7ig.jpg", 
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844145/8499bcf4-2b41-46f2-8bce-fea5c3882997_alkw4v.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754825480/mikkel-bech-OwMIhcZu_X8-unsplash_cs78l3.jpg", 
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844145/5e23b28e-0a67-43da-b13e-b90342ac5d35_cosrfe.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754825473/leo-wieling-bG8U3kaZltE-unsplash_nzv8gm.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844145/Aqui_o_endere%C3%A7o_%C3%A9_Jos%C3%A9_Lins_do_rego_89_Bairro_Tupi_grhesh.jpg", 
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754825480/kevin-mccutcheon-TcSckNRL9J8-unsplash_a1qyag.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844145/0a140df0-9fa6-49e0-8e93-bb1c2458d529_hw3ta9.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754825482/lee-campbell-QVnw_3l_n0Y-unsplash_h7kk6d.jpg"  ,
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844147/clef-593912_e1hdpa.jpg",
    "https://res.cloudinary.com/dva6xndtq/image/upload/v1754844146/e12c8b7b-5453-40f7-824b-11e1d04d4c3e_ec0a9i.jpg"
];

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

    let cover = document.getElementById('cover').value.trim();
    if (!cover) {
        cover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];
    }

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
