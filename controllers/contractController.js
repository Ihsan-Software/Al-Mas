const path = require('path');
const ejs = require('ejs');

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const fs = require("fs").promises;

const chromium = require('chrome-aws-lambda');
//const puppeteer = require('puppeteer-core');

const puppeteer = require("puppeteer");

const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Contract = require("../models/contractModel");
const Car = require("../models/carModel")
const statistics = require("./statisticsController")

//  **** Admin CRUD ****

// @desc    Get list of Contract
// @route   GET /Contract
// @access  Private/ Admin, Manager
exports.getContracts = asyncHandler(async (req, res, next) => {
const { returnDate } = req.query;
  let filter = {};

  const currentDate = dayjs().format("YYYY-MM-DD HH:mm");

  if (returnDate === "true") {
    filter.isCarBack = false
    filter.returnDate = { $lte: currentDate };
  } else if (returnDate === "false") {
    filter.returnDate = { $gt: currentDate };
  }

  const contracts = await Contract.find(filter).populate([
    { path: 'carID', select: 'name'},
    { path: 'tenantID', select: 'name'},
  ]).select('contractDate');

  res.status(200).json({
    results: contracts.length,
    data: contracts,
  });

});

// @desc    Get specific Contract by id
// @route   GET /Contract/:id
// @access  Private/ Admin, Manager
exports.getContract = factory.getOne(Contract,'',' -createdAt -updatedAt -__v');

// @desc    Create Contract
// @route   POST  /Contract
//  @access  Private/ Admin, Manager
exports.createContract =  asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.body.carID)
  req.body.dailyPrice = car.dailyPrice 
    req.body.userID = req.user._id
    // calculate total price, priceAfterDiscount and pricePaid and RemainingPrice
    const multipliers = {
    hour: 1/24 ,   // 1 hour = 1/24 of a day
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
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = new Date().toISOString();
    req.body.contractDate = dayjs(now)
  .tz("Asia/Baghdad")
  .format("YYYY-MM-DD hh:mm A").replace("AM", "ص").replace("PM", "م");
  
    req.body.returnDate = dayjs(now).add(req.body.duration,req.body.timeUnit).tz("Asia/Baghdad")
  .format("YYYY-MM-DD hh:mm A")
  .replace("AM","ص").replace("PM","م");
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
exports.updateContract = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.userInfoID.role === "admin";

  // If not admin → remove dailyPrice from update data
  if (!isAdmin && req.body.dailyPrice !== undefined) {
    delete req.body.dailyPrice;
  }

  // Fetch existing contract first (to keep values like dailyPrice, pricePaid, etc.)
  let contract = await Contract.findById(req.params.id);
  if (!contract) {
    return next(new ApiError(`No contract for this id ${req.params.id}`, 404));
  }

  // --- 🔹 Recalculate logic if duration/timeUnit is updated ---
  if (req.body.duration !== undefined || req.body.timeUnit !== undefined) {
    const duration = req.body.duration ?? contract.duration;
    const timeUnit = (req.body.timeUnit ?? contract.timeUnit).toLowerCase();

    const multipliers = {
    hour: 1/24 ,   // 1 hour = 1/24 of a day
    day: 1,         // 1 day = 1 day
    week: 7,        // 1 week = 7 days
    month: 30       // approx 1 month = 30 days
  };


    const unitMultiplier = multipliers[timeUnit];
    if (unitMultiplier === undefined) {
      return next(new ApiError(`Invalid time unit: ${timeUnit}`, 400));
    }

    const dailyPrice = contract.dailyPrice; // keep existing dailyPrice
    const discount = req.body.discount ?? contract.discount;
    const pricePaid = req.body.pricePaid ?? contract.pricePaid;

    const totalPrice = dailyPrice * duration * unitMultiplier;
    const priceAfterDiscount = totalPrice - (totalPrice * (discount / 100));
    const RemainingPrice = priceAfterDiscount - pricePaid;

    // Calculate dates
    const returnDate = dayjs(contract.contractDate).add(duration, timeUnit).format("YYYY-MM-DD HH:mm");

    // Put into update body
    req.body.totalPrice = totalPrice;
    req.body.priceAfterDiscount = priceAfterDiscount;
    req.body.RemainingPrice = RemainingPrice;
    req.body.returnDate = returnDate;
  }

  // --- 🔹 Now update ---
  contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ data: contract });
});
// @desc    Delete specific Contract
// @route   DELETE /Contract/:id
// @access  Private/ Admin, Manager
exports.deleteContract = asyncHandler(async (req, res, next) => {

  const contract = await Contract.findByIdAndDelete(req.params.id);

  if (!contract) {
    return next(new ApiError(`No contract for this id ${req.params.id}`, 404));
  }

  if (contract.carID) {
    await Car.findByIdAndUpdate(
      contract.carID,
      { carStatus: "متاحة" },
      { new: true, runValidators: true }
    );
  }

  res.status(204).send();
});


// **** Contract CRUD ****

// @desc    Get Logged Contract data
// @route   GET /Contract getMe
// @access  Private/Protect
exports.getContractUseName = asyncHandler(async (req, res, next) => {
 const name = req.query.name|| " ";

  const allContracts = await Contract.find().select('-createdAt -updatedAt -__v').populate("tenantID", "name")

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

  const elevenDaysAgo = dayjs().subtract(11, "day").format("YYYY-MM-DD HH:mm");

  const result = await Contract.aggregate([
    {
      $match: {
        returnDate: { $lte: elevenDaysAgo },
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
        _id: 1, // Contract ID
        tenantName: '$tenant.name',
        carName: '$car.name',
        insuranceType: 1,
        returnDate: 1
      }
    }
  ]);

  res.status(200).json({ result});
});

exports.insuranceNotification = asyncHandler(async (req, res) => {

  const elevenDaysAgo = dayjs().subtract(11, "day").format("YYYY-MM-DD HH:mm");

  const result = await Contract.aggregate([
    {
      $match: {
        returnDate: { $lte: elevenDaysAgo },
        isReturn: false,
        insuranceNotification:false
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
        _id: 1, // Contract ID
        tenantName: '$tenant.name',
        carName: '$car.name',
        insuranceType: 1,
        returnDate: 1
      }
    }
  ]);
  
    // extract ids from result
  const ids = result.map(r => r._id);

  // update all found contracts
  if (ids.length > 0) {
    await Contract.updateMany(
      { _id: { $in: ids } },
      { $set: { insuranceNotification: true } }
    );
  }
  res.status(200).json({ Notification:result.length });
});


exports.getOneInsurance = factory.getOne(Contract,'',' governorate insuranceType');

// imports 
exports.getImportsPricesByDate = statistics.getImportsPricesByDate

// get contract info for inject it in pdf from client
exports.getContractInfo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let newQuery
  const contract = await Contract.findById(id).populate([
    { path: 'tenantID' },
    { path: 'carID'},
    { path: 'userID'}
  ]);
  if (!contract) {
    return next(new ApiError(`No contract found for ID ${id}`, 404));
  }

  res.status(200).json({ data: contract });

});

exports.sendHtmlPage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let newQuery
  const contract = await Contract.findById(id).populate([
    { path: 'tenantID' },
    { path: 'carID'},
    { path: 'userID'}
  ]);
  if (!contract) {
    return next(new ApiError(`No contract found for ID ${id}`, 404));
  }

  if(req.query.htmlName=='contract' && !contract.driverName){
      newQuery = 'contract1'
    }
    else if(req.query.htmlName=='contract' && contract.driverName){
      newQuery = 'contract2'
    }
    else{
      newQuery = 'invoice'
    }
  const html = await ejs.renderFile(
      path.join(__dirname, '../views', `${newQuery}.ejs`),
      { contract }
    );

    // Send rendered HTML to client
    res.set('Content-Type', 'text/html');
    res.send(html);
});



exports.sendEjsFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let newQuery
  const contract = await Contract.findById(id).populate([
    { path: 'tenantID' },
    { path: 'carID'},
    { path: 'userID'}
  ]);
  if (!contract) {
    return next(new ApiError(`No contract found for ID ${id}`, 404));
  }
  if(req.query.pdfName=='contract' && !contract.driverName){
    newQuery = 'contract1'
  }
  else if(req.query.pdfName=='contract' && contract.driverName){
    newQuery = 'contract2'
  }
  else{
    newQuery = 'invoice'
  }

 res.render(`${newQuery}.ejs`, { contract });
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


exports.updateReturnContract = asyncHandler(async (req, res, next) => {

  const contract = await Contract.findByIdAndUpdate(
    req.params.id,
    { isCarBack: true },
    { new: true, runValidators: true }
  );

  if (!contract) {
    return next(new ApiError(`No contract for this id ${req.params.id}`, 404));
  }

  if (contract.carID) {
    await Car.findByIdAndUpdate(
      contract.carID,
      { carStatus: "متاحة" },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    message: "successful"
  });
});

