import { config } from "dotenv";

config();

const PORT=process.env.PORT;
const FRONTEND_URL=process.env.FRONTEND_URL;
const MONGOOSE_URI=process.env.MONGOOSE_URI;

export{
    PORT,
    FRONTEND_URL,
    MONGOOSE_URI
}