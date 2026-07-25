import mongoose from "mongoose";

const email = process.argv[2]?.trim().toLowerCase();
const mongoUri = process.env.MONGO_URI;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: npm run admin:provision -- admin@example.com");
    process.exitCode = 1;
} else if (!mongoUri) {
    console.error("MONGO_URI is not configured.");
    process.exitCode = 1;
} else {
    try {
        await mongoose.connect(mongoUri, { bufferCommands: false });
        const result = await mongoose.connection.collection("users").updateOne(
            { email },
            { $set: { isAdmin: true } }
        );

        if (result.matchedCount === 0) {
            console.error(`No existing user was found for ${email}. Sign up first.`);
            process.exitCode = 1;
        } else {
            console.log(`Administrator access granted to ${email}.`);
        }
    } catch {
        console.error("Unable to provision the administrator account.");
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}
