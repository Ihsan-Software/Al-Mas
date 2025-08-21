const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");

const Contract = require("../models/contractModel");
const Car = require("../models/carModel")
const Booking = require("../models/bookingModel")
const Export  = require("../models/exportModel");
const Fines = require("../models/finesModel");
const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const UserInfo = require("../models/userInfoModel");

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

  res.status(200).json({ result });
});

// imports 
exports.getImportsPricesByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required in query' });
  }

  // Start of month
  const startDate = new Date(date);
  startDate.setDate(1); // first day of month
  startDate.setHours(0, 0, 0, 0);

  // End of month
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1); // go to next month
  endDate.setDate(0); // last day of current month
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
        carStatus: { $first: 'تاجير' },
        contractDate: { $first: '$contractDate' },
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

exports.getStatistics = asyncHandler(async (req, res, next) => {

  // --- Cars grouped by status ---
  const carsByStatus = await Car.aggregate([
    {
      $group: {
        _id: "$carStatus",
        count: { $sum: 1 },
      },
    },
  ]);
  const statusMap = {
    "متاحة": "Available",
    "محجوزة": "Booked",
    "مؤجرة": "Rented",
    "تحت الصيانة": "Under Maintenance",
    "غير متاحة": "Unavailable"
  };

  // Convert array → object with English keys
  const carsByStatusObj = carsByStatus.reduce((acc, item) => {
    // Normalize string (remove quotes/spaces)
    let key = item._id.trim().replace(/['"]+/g, "");
    const englishKey = statusMap[key] || key;
    acc[englishKey] = item.count;
    return acc;
  }, {});

  //imports
  const currentDate = dayjs().format("YYYY-MM-DD HH:mm");
  const contractsOverTime = await Contract.find({returnDate:{ $lte: currentDate },isCarBack:false}).countDocuments();

  // --- Other counts ---
  const contractsCount = await Contract.countDocuments();
  const exportsCount = await Export.countDocuments();
  const tenantsCount = await Tenant.countDocuments();
   const exportTotalResult = await Export.aggregate([
    {
      $group: {
        _id: null,
        totalPrice: { $sum: "$price" },
      },
    },
  ]);
  const totalExportPrice = exportTotalResult[0]?.totalPrice || 0;
  
   // --- Total contract priceAfterDiscount ---
  const contractTotalResult = await Contract.aggregate([
    {
      $group: {
        _id: null,
        totalPriceAfterDiscount: { $sum: "$priceAfterDiscount" },
      },
    },
  ]);
  const totalContractAfterDiscount =
    contractTotalResult[0]?.totalPriceAfterDiscount || 0;

  // --- Final balance ---
  let balance;
    if (totalExportPrice > totalContractAfterDiscount) {
      balance = totalExportPrice - totalContractAfterDiscount;
    } else if (totalContractAfterDiscount > totalExportPrice) {
      balance = totalContractAfterDiscount - totalExportPrice;
    } 

    res.status(200).json({
    status: "success",
    data: {
      cars: carsByStatusObj,
      counts: {
        overTime:contractsOverTime,
        contracts: contractsCount,
        exports: exportsCount,
        tenants: tenantsCount,
      },
      exports: {
        totalPrice: totalExportPrice,
      },
      imports: {
        totalPrice: totalContractAfterDiscount,
      },
      balance, 
    },
  });
});