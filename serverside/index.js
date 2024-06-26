const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const multer = require('multer');

/* multer setup for original fliename */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
/* cors setup */
app.use(cors({
    // origin: 'http://es.multidynamic.com.au:4000',
    methods: ['GET', 'POST','DELETE']
}));

/* uploadin the image in the uploads folder */
app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file);
    res.send('file uploaded successfully')
}) 


app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);


    fs.exists(filePath, (exists) => {
        if (exists) {
            // Stream the file to the client
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            // File not found
            res.status(404).send('File not found.');
        }
    });
});

// DELETE endpoint to remove an image from the "uploads" directory
app.delete('/delete/:imagePath', (req, res) => {
    const { imagePath } = req.params; // Extract the image path from the URL
    const fullPath = path.join(__dirname, 'uploads', imagePath); // Create the full path

    // Check if the file exists before trying to delete it
    if (!fs.existsSync(fullPath)) {
        return res.status(404).send('File not found'); // If not, return a 404 error
    }

    // Try to delete the file
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error('Error deleting file:', err); // Log errors if any
            return res.status(500).send('Error deleting file'); // Return a 500 status code for server errors
        }

        res.send('File deleted successfully'); // Success message on successful deletion
    });
});

app.get('/uploads', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const imageFiles = files.filter(file => {
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
        });


        const imagesMarkup = imageFiles.map(file => {
            const imagePath = `http://es.multidynamic.com.au:3000/uploads/${file}`; // Path to the image
            return { imagePath, fileName: file };
        });

        // Send the HTML markup as the response
        res.send(imagesMarkup);
    });
});


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});