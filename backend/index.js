const express=require("express")
const mongodb=require("mongodb")
const cors=require("cors")
const nodemailer = require("nodemailer")
require("dotenv").config()

const mongoClient=mongodb.MongoClient
const objectId=mongodb.ObjectID

const app=express()

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017"

const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())


app.post("/createNewUser",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        let data = await db.collection('UserDetails').insertOne(req.body)
        res.status(200).json({message : "User Created"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/checkUser/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        let data = await db.collection("UserDetails").find({ email : { $eq : req.params.useremail }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/changePassword/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        let data = await db.collection('UserDetails').updateOne( { email : req.params.useremail } , { $set : { password : req.body.password } });
        res.status(200).json({message : "Password Changed"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/addOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        await db.collection('UserDetails').updateOne( { email : req.params.useremail } , { $unset : { OTP : 1} });
        let data = await db.collection('UserDetails').updateOne( { email : req.params.useremail } , { $set : { OTP : req.body.OTP } });
        res.status(200).json({message : "OTP Added"})
        clientInfo.close()

        async function mailer(){
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: "vijaykumarspeaks57@gmail.com", 
                    pass: "icannotrevealthis",
                },
            });
        
            const info = await transporter.sendMail({
                from: "vijaykumarspeaks57@gmail.com", 
                to: req.params.useremail,
                subject: "Reset Password", 
                text: "Your OTP for Password Reset is: "+req.body.OTP,
            });
        
            console.log("<------------Message sent: %s------------->", info.response);
        }
        mailer().catch(console.error);

    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/removeOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        let data = await db.collection('UserDetails').updateOne( { email : req.params.useremail } , { $unset : { OTP : 1} });
        res.status(200).json({message : "OTP Removed"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/checkOTP/:useremail",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserDB")
        let data = await db.collection("UserDetails").find({ email : { $eq : req.params.useremail }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})



app.listen(port,()=>{
    console.log("App started at port :",port)
})