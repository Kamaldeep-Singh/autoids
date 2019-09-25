const exec = require('child_process').exec;

module.exports = {
    execute: async (command) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                const res = { error, stdout, stderr }
                console.log(`----- ${command} -----`)
                console.log(stdout)
                console.log(stderr)
                if (error !== null) {
                    console.log(error)
                    reject(res.error)
                } else {
                    resolve(res.stdout)
                }
            })
        })
    }
}
