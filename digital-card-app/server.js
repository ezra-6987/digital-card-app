const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require ('fs');
const multer = require ('multer');
const app = express();
const port = 3000;

let orders = {};  // Store order details in memory
let messages = []; // Initialize empty array to store contact form submissions

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/image-selection', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image-selection.html'));
  });
  
app.get('/image/:id', (req, res) => {
    const imageId = req.params.id;
    const filePath = path.join(__dirname, 'public', `image${imageId}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
  } else {
      res.status(404).send('File not found');
  }
  });

  const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 10},
    { name: 'anotherField', maxCount: 5}
  ]);

  app.post('/submit-order', uploadMultiple, (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const orderDetails = req.body;
    const orderNumber = Math.floor(Math.random() * 1000000).toString(); // Generate a random order number
    
    if (req.files && req.files.length > 0) {
        orderDetails.uploadedImages = req.files.map(file => file.filename); 
    } else {
        orderDetails.uploadedImages = [];
    }
    
    orders[orderNumber] = orderDetails;
    console.log('Order Details:', orderDetails);
    res.redirect(`/acknowledgment?orderNumber=${orderNumber}`);
});

app.get('/acknowledgment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'acknowledgment.html'));
});

app.get('/track-order', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'track-order.html'));
  });
  
app.get('/order-details', (req, res) => {
    const orderNumber = req.query.orderNumber;
    const orderDetails = orders[orderNumber];
    if (orderDetails) {
      res.json(orderDetails);
    } else {
      res.status(404).send('Order not found');
    }
  });
  
// Admin view for submitted orders
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/upload-images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    const uploadedFiles = req.files.map(file => file.filename);
    res.json({ uploadedFiles });
} catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).send('Error uploading files.');
}
});
 
// Handle contact form submission
app.post('/submit-contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  const submission = {
    id: Date.now(), // Unique identifier for the submission
    name,
    email,
    subject,
    message,
    submittedAt: new Date()
  };
  messages.push(submission); // Store the submission in memory (can be replaced with DB storage)
  console.log('Contact Form Submitted:', submission);
  res.redirect('/success');
});

// Route to serve success page
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Route to fetch all messages for admin view
app.get('/messages', (req, res) => {
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
