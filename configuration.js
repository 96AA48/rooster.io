//configuration.js
var fs = require('fs');

//Function for loading and returning the settings.json file, makes one if there isn't one.
module.exports = function () {
   if (!fs.existsSync(__dirname + '/settings.json')) {
      //Template for settings.json if not available.
      var settings = {
         'env' : 'dev',
         'database' : 'example.com/database',
         'web_port' : 1024,
         'tor_host' : 'example.com',
         'tor_port' : 9050,
         'amount_of_hours' : 7,
         'hour_times' : [
            '8:45 - 9:45',
            '9:45 - 10:45',
            '11:10 - 12:10',
            '12:10 - 13:10',
            '13:40 - 14:40',
            '14:40 - 15:40',
            '15:40 - 16:40'
         ],
         'school_id' : 934,
         'linkbar' : {
            'Roostersite': ['http://roosters5.gepro-osi.nl/roosters/rooster.php?school=INSERTYOURSCHOOL_ID', '#CCCC99'],
            'Magister': ['http://INSERTYOURMAGISTER.magister.net', '#0C5489'],
            'Mail': ['https://login.microsoftonline.com/', '#C41824']
         },
         'spider_timeout' : 1000
      }
      //Write it to file as pretty printed JSON.
      fs.writeFileSync(__dirname + '/settings.json', JSON.stringify(settings, null, 2));

      return settings;
   }
   else {
      return JSON.parse(fs.readFileSync(__dirname + '/settings.json'));
   }
}

if (process.argv[2] == 'test') {
   console.log(module.exports());
}
