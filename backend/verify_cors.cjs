const http = require('http');

function check(path) {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET',
        headers: {
            'Origin': 'http://localhost:8080'
        }
    }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            console.log(`Path: ${path}`);
            console.log(`Status: ${res.statusCode}`);
            console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
            console.log('Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
            // If error, print snippet
            if (res.statusCode >= 400) {
                console.log('Body snippet:', rawData.slice(0, 200));
            }
            console.log('---');
        });
    });
    req.on('error', (e) => {
        console.log(`Path: ${path}`);
        console.error(`Error: ${e.message}`);
        console.log('---');
    });
    req.end();
}

check('/health');
check('/api/products');
