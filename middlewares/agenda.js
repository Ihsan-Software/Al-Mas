const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Contract = require('../models/contractModel');

dayjs.extend(utc);
dayjs.extend(timezone);

const BAGHDAD_TZ = 'Asia/Baghdad';

cron.schedule('*/30 * * * * *', async () => {
  try {
    const nowBaghdad = dayjs().tz(BAGHDAD_TZ).format('YYYY-MM-DD hh:mm A')
      .replace('AM', 'ص')
      .replace('PM', 'م');

    console.log(`time ⏱️  for test is  : ${nowBaghdad}`);

    const expiredContracts = await Contract.find({
      returnDate: { $lte: nowBaghdad },
      notified: { $ne: true }
    });

     if (expiredContracts.length > 0) {

      global.io.emit('expiredContracts', expiredContracts);

      console.log(`number of contract which is ending is: ${expiredContracts.length} `);
      console.log(expiredContracts)
      for (const contract of expiredContracts) {
        contract.notified = true;
        await contract.save();
      }
    } else {
      console.log('no contract was ended ');
      global.io.emit('expiredContracts', expiredContracts);

    }
  } catch (err) {
    console.error(' خطأ أثناء فحص العقود المنتهية:', err);
  }
});
