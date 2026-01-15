const asyncHandler = require("express-async-handler");
const dayjs = require("dayjs");

const Contract = require("../models/contractModel");
const Car = require("../models/carModel")
const Booking = require("../models/bookingModel")
const Export  = require("../models/exportModel");
const ImportModel  = require("../models/importModel");
const Fines = require("../models/finesModel");
const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const UserInfo = require("../models/userInfoModel");

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
      $match: {
        temporarilyDeleted: false
      }
    },
    {
      $group: {
        _id: "$carStatus",
        count: { $sum: 1 }
      }
    }
  ]);
  const statusMap = {
    "متاحة": "Available",
    "محجوزة": "Booked",
    "مؤجرة": "Rented",
    "تحت الصيانة": "Under Maintenance",
    "غير متاحة": "Unavailable"
  };

  // Initialize object with all statuses = 0
const carsByStatusObj = Object.values(statusMap).reduce((acc, englishKey) => {
  acc[englishKey] = 0;
  return acc;
}, {});

// Fill with actual counts
carsByStatus.forEach(item => {
  let key = item._id?.trim().replace(/['"]+/g, "");
  const englishKey = statusMap[key] || key;
  carsByStatusObj[englishKey] = item.count;
});

  //imports
  const currentDate = dayjs()
      .tz("Asia/Baghdad")
      .format("YYYY-MM-DD hh:mm A")
      .replace("AM", "ص")
      .replace("PM", "م");
    //console.log(currentDate)
  const contractsOverTime = await Contract.find({returnDate:{ $lte: currentDate },isCarBack:false}).countDocuments();

  // --- Other counts ---
  const contractsCount = await Contract.countDocuments();
  const exportsCount = await Export.countDocuments();
  const tenantsCount = await Tenant.countDocuments();
  // update reset balance
  const startOfYear = dayjs()
  .tz("Asia/Baghdad")
  .startOf("year")
  .utc()
  .toDate();

const endOfYear = dayjs()
  .tz("Asia/Baghdad")
  .endOf("year")
  .utc()
  .toDate();

  
   const exportTotalResult = await Export.aggregate([

    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
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
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPriceAfterDiscount: { $sum: "$pricePaid" },
      },
    },
  ]);

  const importsPrice = await ImportModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalImportsPrice: { $sum: "$price" },
      },
    },
  ]);
const totalImportsPrice = importsPrice[0]?.totalImportsPrice || 0;

// Total contract after discount
const totalContractAfterDiscount =
  (contractTotalResult[0]?.totalPriceAfterDiscount || 0) + totalImportsPrice;
  // --- Final balance ---
  let balance = 0;
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

exports.getCarStatistics = asyncHandler(async (req, res, next) => {
  const result = await Car.aggregate([
    // 1) Lookup contracts per car
    {
      $lookup: {
        from: "contracts",
        localField: "_id",
        foreignField: "carID",
        as: "contracts"
      }
    },
    {
      $addFields: {
        totalContractPrice: { $sum: "$contracts.pricePaid" },
        contractsCount: { $size: "$contracts" }
      }
    },

    // 2) Lookup imports per car
    {
      $lookup: {
        from: "imports",
        localField: "_id",
        foreignField: "carID",
        as: "imports"
      }
    },
    {
      $addFields: {
        totalImportPrice: { $sum: "$imports.price" },
        importsCount: { $size: "$imports" }
      }
    },

    // 3) Lookup exports per car
    {
      $lookup: {
        from: "exports",
        localField: "_id",
        foreignField: "carID",
        as: "exports"
      }
    },
    {
      $addFields: {
        totalExportPrice: { $sum: "$exports.price" },
        exportsCount: { $size: "$exports" }
      }
    },

    // 4) Calculate net total (contracts + imports - exports)
    {
      $addFields: {
        netProfit: {
          $subtract: [
            { $add: ["$totalContractPrice", "$totalImportPrice"] },
            "$totalExportPrice"
          ]
        }
      }
    },

    // 5) Shape the output
    {
      $project: {
        _id: 0,
        carID: "$_id",
        carName: "$name",
        carNumber: "$carNumber",
        contractsCount: 1,
        totalContractPrice: 1,
        importsCount: 1,
        totalImportPrice: 1,
        exportsCount: 1,
        totalExportPrice: 1,
        netProfit: 1
      }
    }
  ]);

  res.status(200).json({
    results: result.length,
    data: result
  });
});