const path = require('path');
const ejs = require('ejs');
const dayjs = require("dayjs");
const fs = require("fs").promises;

const chromium = require('chrome-aws-lambda');
//const puppeteer = require('puppeteer-core');

const puppeteer = require("puppeteer");

const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Contract = require("../models/contractModel");
const Car = require("../models/carModel")


//  **** Admin CRUD ****

// @desc    Get list of Contract
// @route   GET /Contract
// @access  Private/ Admin, Manager
exports.getContracts = factory.getAll(Contract);

// @desc    Get specific Contract by id
// @route   GET /Contract/:id
// @access  Private/ Admin, Manager
exports.getContract = factory.getOne(Contract);

// @desc    Create Contract
// @route   POST  /Contract
//  @access  Private/ Admin, Manager
exports.createContract =  asyncHandler(async (req, res, next) => {
    req.body.userID = req.user._id
    // calculate total price, priceAfterDiscount and pricePaid and RemainingPrice
    const multipliers = {
    hour: 1 / 24,   // 1 hour = 1/24 of a day
    day: 1,         // 1 day = 1 day
    week: 7,        // 1 week = 7 days
    month: 30       // approx 1 month = 30 days
  };

  const unitMultiplier = multipliers[req.body.timeUnit.toLowerCase()];

  if (unitMultiplier === undefined) {
    return next(new ApiError(`Invalid time unit: ${timeUnit}`, 400));
  }

  req.body.totalPrice = req.body.dailyPrice * req.body.duration * unitMultiplier;

  req.body.priceAfterDiscount = req.body.totalPrice -(req.body.totalPrice  * (req.body.discount/ 100))

  req.body.RemainingPrice = req.body.priceAfterDiscount - req.body.pricePaid 
  // end calculate total price, priceAfterDiscount and pricePaid and RemainingPrice

  // calculate print time
  if(!req.body.printTime){
    req.body.printTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });}
  // end calculate print time
  // calculate contract date and return date
    const now = new Date().toISOString();
    req.body.contractDate = dayjs(now).format("YYYY-MM-DD HH:mm")
    req.body.returnDate = dayjs(now).add(req.body.duration,req.body.timeUnit).format("YYYY-MM-DD HH:mm");
  // end calculate contract date and return date

    // update car status
    await Car.findByIdAndUpdate(req.body.carID, { carStatus: 'مؤجرة' });

    // create contract number
    const contractCount = await Contract.countDocuments();
    req.body.contractNumber = contractCount + 1;
    const contract = await Contract.create(req.body);

    res.status(200).json({ data: contract });
});

// @desc    Update specific Contract
// @route   PUT /Contract/:id
// @access  Private/ Admin, Manager
exports.updateContract = factory.updateOne(Contract)
// @desc    Delete specific Contract
// @route   DELETE /Contract/:id
// @access  Private/ Admin, Manager
exports.deleteContract = factory.deleteOne(Contract);


// **** Contract CRUD ****

// @desc    Get Logged Contract data
// @route   GET /Contract getMe
// @access  Private/Protect
exports.getContractUseName = asyncHandler(async (req, res, next) => {
 const name = req.query.name|| " ";

  const allContracts = await Contract.find();

  // Now filter based on populated `userID.name`
  const filteredContracts = allContracts.filter(contract =>
    contract.tenantID && contract.tenantID.name.toLowerCase().includes(name.toLowerCase())
  );

  res.status(200).json({
    data: filteredContracts
  });
});

//Insurance التامينات
exports.getInsurance = asyncHandler(async (req, res) => {

  const elevenDaysAgo = new Date();
  elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

  const result = await Contract.aggregate([
    {
      $match: {
        createdAt: { $lte: elevenDaysAgo },
        isReturn: false 
      }
    },
    // Lookup tenant info
    {
      $lookup: {
        from: 'tenants',
        localField: 'tenantID',
        foreignField: '_id',
        as: 'tenant'
      }
    },
    { $unwind: '$tenant' },

    // Lookup car info
    {
      $lookup: {
        from: 'cars',
        localField: 'carID',
        foreignField: '_id',
        as: 'car'
      }
    },
    { $unwind: '$car' },

    {
      $project: {
        _id: 0,
        tenantName: '$tenant.name',
        carName: '$car.name',
        insuranceType: 1,
        createdAt: 1
      }
    }
  ]);

  res.status(200).json({result});
});


// imports 
exports.getImportsPricesByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required in query' });
  }

  // Parse date range (same day from 00:00 to 23:59)
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const result = await Contract.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'carID',
        foreignField: '_id',
        as: 'car'
      }
    },
    { $unwind: '$car' },
    {
      $group: {
        _id: '$car.name',
        carStatus: { $first: 'تاجير' }, // single status
        contractDate: { $first: '$contractDate' }, // one date
        totalPriceAfterDiscount: { $sum: '$priceAfterDiscount' }
      }
    },
    {
      $group: {
        _id: null,
        perCar: {
          $push: {
            carName: '$_id',
            carStatus: '$carStatus',
            contractDate: '$contractDate',
            totalPriceAfterDiscount: '$totalPriceAfterDiscount'
          }
        },
        totalForAllCars: { $sum: '$totalPriceAfterDiscount' }
      }
    },
    {
      $project: {
        _id: 0,
        perCar: 1,
        totalForAllCars: 1
      }
    }
  ]);

  res.status(200).json(result[0] || { perCar: [], totalForAllCars: 0 });
});


exports.sendHtmlPage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const contract = await Contract.findById(id);
  if (!contract) {
    return next(new ApiError(`No contract found for ID ${id}`, 404));
  }


  const html = await ejs.renderFile(
      path.join(__dirname, '../views', `${req.query.htmlName}.ejs`),
      { contract }
    );

    // Send rendered HTML to client
    res.set('Content-Type', 'text/html');
    res.send(html);
});



exports.sendEjsFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let gg
  const contract = await Contract.findById(id);
  if (!contract) {
    return next(new ApiError(`No contract found for ID ${id}`, 404));
  }
  if(req.query.pdfName=='contract' && !contract.driverName){
    gg = 'contract1'
  }
  else if(req.query.pdfName=='contract' && contract.driverName){
    gg = 'contract2'
  }
  else{
    gg = 'invoice'
  }

 res.render(`${gg}.ejs`, { contract });
});

exports.createPdfFromEjsFile = asyncHandler(async (req, res, next) => {

    //const chromiumPath = '/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.168/chrome-linux64/chrome';
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(`${req.protocol}://${req.get('host')}`+`/contract/sendEjsFile/${req.params.id}?pdfName=${req.query.pdfName}`,{
      waitUntil:'networkidle2'
    })
    await page.setViewport({width:1680, height:1050})

    const pdf = await page.pdf()
    await browser.close()
      res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="contract_${req.params.id}.pdf"`,
  });

  res.send(pdf);
});


