import app from "./src/app";
import dotenv from "dotenv";
dotenv.config();
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});