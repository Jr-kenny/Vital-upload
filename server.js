const express = require('express');
const multer = require('multer');
const path = require('path'); // We need to add this line
const Irys = require('@irys/sdk');
require('dotenv').config();

const app = express();
const port = 3000;

// Use a more robust path to serve the static files
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getIrys = async () => {
    const network = "devnet";
    const providerUrl = "https://sepolia.base.org";
    const token = "ethereum";
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) throw new Error("PRIVATE_KEY not found in environment variables.");

    return new Irys({ network, token, key: privateKey, config: { providerUrl } });
};

app.post('/upload', upload.single('fileToUpload'), async (req, res) => {
    const creatorName = req.body.creatorName;
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    if (!creatorName || !fileBuffer) {
        return res.status(400).json({ error: 'Creator name and file are required.' });
    }

    try {
        const irys = await getIrys();
        const tags = [
            { name: 'Content-Type', value: req.file.mimetype },
            { name: 'App-Name', value: 'Perma-Cert' },
            { name: 'Creator-Name', value: creatorName },
            { name: 'Original-Filename', value: fileName },
            { name: 'Timestamp', value: Date.now().toString() }
        ];

        const response = await irys.upload(fileBuffer, { tags });
        const url = `https://gateway.irys.xyz/${response.id}`;

        console.log(`Successfully uploaded ${fileName} for ${creatorName}. URL: ${url}`);
        res.status(200).json({ success: true, url: url });

    } catch (e) {
        console.error("Error during upload:", e);
        res.status(500).json({ error: 'Failed to upload to Irys.', details: e.message });
    }
});

// Export the app for Vercel
module.exports = app;
