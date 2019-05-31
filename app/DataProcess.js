const path = require('path');

module.exports = {
    oldDataPython: function() {
        const {PythonShell} = require('python-shell')
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            args: [path.join(__dirname,'../ressources/app/output/old/jeb.biologists.org.2019.articles.json'), path.join(__dirname,'../ressources/app/train/eda_training_set.txt')]
        };

        PythonShell.run(path.join(__dirname,'/python/npm.py'), options, function (err, result) {
            if (err) throw err;
            console.log(result);
        });
    }
};