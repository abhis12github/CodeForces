import express from "express";
import cors from "cors";
import dbConnect from "./db/connection.js";
import { PORT, FRONTEND_URL } from "./config/serverConfig.js";
import { router as apiRoutes } from "./routes/index.js";

const setUpAndStartServer=async()=>{
    const app=express();

    app.use(
        cors({
            origin: FRONTEND_URL,
            credentials: true,
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));

    // routes
    app.use("/api",apiRoutes);

    // connect to mongo database
    await dbConnect();

    // set the server at port
    app.listen(PORT,()=>{
        console.log(`Server listening at port ${PORT}`);
    });
    
}

setUpAndStartServer();