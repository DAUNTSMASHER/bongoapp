import "dotenv/config";
const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
console.log("Raw exists:", !!saVar);
if (saVar) {
    try {
        const sa = JSON.parse(saVar);
        console.log("Parsed keys:", Object.keys(sa));
        console.log("Project ID:", sa.project_id);
        console.log("Private Key exists:", !!sa.private_key);
    } catch (e: any) {
        console.error("JSON Parse Error:", e.message);
    }
}
