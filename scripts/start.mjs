import pkg from '../package.json' assert { type: 'json' };

const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

const promise = $`npm run start:webpack`;

await delay(1000);

await (async function waitForDevServer (times = 0) {
    if(times > 1000) {
        throw new Error('Development service startup timed out, please try again');
    }
    try {
        const resp = await fetch(`http://127.0.0.1:${pkg.serve.port}/lib/UIExtension.full.js`);
        if(resp.status < 400) {
            return;
        } else {}
    } catch (error) {
    }
    await delay(1000);
    await waitForDevServer(times ++);
})();


$`npm run start:snapshot-server`;


await promise;