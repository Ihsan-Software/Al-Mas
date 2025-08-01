const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: 'config.env' })

const app = require('./app');

mongoose.connect(process.env.ATLAS_DATABASE).then(() => {
    console.log("Connected To Database Success...🚀");
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`Server Starting At Port ${PORT}...✨`);
})

// Handle Rejection Error Outside Express
process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Error ${err.name}| ${err.message}`);
    server.close(() => {
        console.log('Shouting Down...')
        process.exit(1);
    })
})