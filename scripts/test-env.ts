import "dotenv/config";
console.log("FIREBASE_SERVICE_ACCOUNT exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT);
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Starts with:", process.env.FIREBASE_SERVICE_ACCOUNT.slice(0, 20));
}
