function generateStackTrace() {
    const start = performance.now();
    const error = new Error('Sample error');
    console.log(error.stack);
    const end = performance.now();
    console.log(`Stack trace generation took ${end - start} milliseconds`);
}

function nothing() {
    const start = performance.now();
    console.log("hello world!!");
    const end = performance.now();
    console.log(`function took ${end - start} milliseconds`);
}

generateStackTrace();
nothing();
