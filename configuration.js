//configuration.js
/**
 *  Module for the return/creating of a settings file/object.
 * @module configuration
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
const fs = require('fs');

/**
 * Function for the return/creating of a settings file/object.
 * @return {Object} settings - Object of all the settings.
 */
module.exports = () => {
   if (!fs.existsSync(__dirname + '/settings.json')) {
      //Template for settings.json if not available.
      var settings = {
         'env' : 'dev',
         'database' : 'localhost/roosterio',
         "localDatabase" : true,
         "webHost" : '0.0.0.0',
         'webPort' : 1024,
         'torHost' : 'localhost',
         'torPort' : 9050,
         'amountOfHours' : 7,
         'encryptionKey': 'JMU6DAQpzt32hJ2WndJxFvk3WHWqFcscq9yMMYkr8kgTtsam',
         'times' : [
            '8:45 - 9:45',
            '9:45 - 10:45',
            '11:10 - 12:10',
            '12:10 - 13:10',
            '13:40 - 14:40',
            '14:40 - 15:40',
            '15:40 - 16:40'
         ],
         'schoolID' : 934,
         'linkbar' : {
            'Roostersite': ['http://roosters5.gepro-osi.nl/roosters/rooster.php?school=INSERTYOURSCHOOLID', '#CCCC99'],
            'Magister': ['http://INSERTYOURMAGISTER.magister.net', '#0C5489'],
            'Mail': ['https://login.microsoftonline.com/', '#C41824']
         },
         'spiderTimeout' : 1000
      }
      //Write it to file as pretty printed JSON.
      fs.writeFileSync(__dirname + '/settings.json', JSON.stringify(settings, null, 2));

      return settings;
   }
   else {
      return JSON.parse(fs.readFileSync(__dirname + '/settings.json'));
   }
}

//Testing command when passed a test argument in the commandline
if (process.argv[2] == 'test') {
   console.log(module.exports());
}
