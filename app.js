const express = require('express');
const path = require('path');
const morgan = require('morgan');

/* For pdf File*/
const ejs = require('ejs');
const puppeteer = require('puppeteer-core'); // puppeteer-core doesn't include Chromium


// utils requires

const ApiError = require("./utils/apiError");
const globalError = require('./middlewares/errorMiddleware')

const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");

const app = express();


// Middleware to parse JSON and form data if needed
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get("/", (req, res) => {
  res.send("Hi Again,dear...");
});
// Route to render and generate PDF
/*app.get('/gg', async (req, res) => {
  // Replace with actual data you want to pass to the EJS template
  const data = { name: 'Example Name' };

  try {
    // Render the EJS template to HTML string
    const html = await ejs.renderFile(path.join(__dirname, 'views', 'home.ejs'), data);

    // Launch Puppeteer with path to your installed Chromium or Chrome
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Custom function below
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    
    // Set HTML content
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1
    });
    await page.setContent(html, { waitUntil: 'networkidle0' });


    // Generate PDF as buffer
    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '210mm', // A4 width
      height: '297mm', // A4 height
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });


    await browser.close();

    // Send the PDF to the browser
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="form.pdf"'
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).send('Failed to generate PDF');
  }
});*/

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.all('/*splat', (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
})

// Global Error Handle Middleware For Express
app.use(globalError);
module.exports = app;
