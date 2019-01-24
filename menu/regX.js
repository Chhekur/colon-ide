function colon_version() {
    return require('../package.json').version;
}


// return current time
function date() {
    return new Date();
}

// return system username
function user() {
    return require("os").userInfo().username;
}

// register functions
let app = {
    ide_version:colon_version,
    date: date,
    user: user
};

// compile the template using /\{%([A-Za-z_]+)%\}/g
function compile(data) {
    return new Promise(function (resolve, reject) {

        // invoke registered functions on string
        // and remove the string if function is defined for regX
        data.replace(/\{%([A-Za-z_]+)%\}/g, (x)=>{
            let s = x.substring(2, x.length - 2);
            if (s in app) {
                data = data.replace('{%' + s + '%}', app[s]());
            }
            else {
                data = data.replace('{%' + s + '%}', '');
            }
        });
        resolve(data);
    });
}

// export public function
module.exports = {
    compile
};
