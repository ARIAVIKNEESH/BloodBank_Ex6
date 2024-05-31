const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/bloodbankl_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const infoSchema = new mongoose.Schema({
    name: String,
    email: String,
    bloodGroup: String,
    donorNumber: Number,
    address: String
});
const Info = mongoose.model('Info', infoSchema);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

app.get('/api/information', async (req, res) => {
    try {
        const info = await Info.find();
        res.json(info);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch information' });
    }
});

app.post('/api/information', async (req, res) => {
    const { name, email, bloodGroup, donorNumber, address } = req.body;
    const info = new Info({ name, email, bloodGroup, donorNumber, address });
    try {
        await info.save();
        res.status(201).json({ message: 'Information added successfully', info });
    } catch (err) {
        res.status(400).json({ message: 'Failed to add information', error: err.message });
    }
});

app.put('/api/information/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, bloodGroup, donorNumber, address } = req.body;
    try {
        const info = await Info.findByIdAndUpdate(id, { name, email, bloodGroup, donorNumber, address }, { new: true });
        if (!info) {
            return res.status(404).json({ message: 'Information not found' });
        }
        res.json({ message: 'Information updated successfully', info });
    } catch (err) {
        res.status(400).json({ message: 'Failed to update information', error: err.message });
    }
});

app.delete('/api/information/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const info = await Info.findByIdAndDelete(id);
        if (!info) {
            return res.status(404).json({ message: 'Information not found' });
        }
        res.json({ message: 'Information deleted successfully', info });
    } catch (err) {
        res.status(400).json({ message: 'Failed to delete information', error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));