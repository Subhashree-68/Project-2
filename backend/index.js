import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import validator from "validator";

const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://subhashree:Sonu%402003@cluster0.r5xg8nl.mongodb.net/loginsignup").then(() => console.log("DB connected"))
}
connectDB();


app.get("/", (req, res) => {
    res.send("running");
})

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

const createToken = (id) => {
    return jwt.sign({ id }, 'secret_login');
}
app.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;
    console.log(req.body)
    let check = await Users.findOne({ email });
    try {
        if (check) {
            return res.status(400).json({ success: false, errors: "existing user found with same email id" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "please enter valid email" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "please enter strong password" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new Users({
            name: name,
            email: email,
            password: hashedPassword
        })
        const user = await newUser.save();
        const token = createToken(user.id);
        res.json({ success: true, token,message:"signup successfully" });
    } catch (error) {
        console.log("error")
        res.json({ success: false, error: "errror" })
    }

})

app.post("/login", async (req, res) => {
    const{email,password}=req.body;
    try {
        const user=await Users.findOne({email});
        if(!user){
            res.json({success:false,message:"User doesn't exist"})
        }
        const isMatch= bcrypt.compare(password,user.password);
        if(!isMatch){
            res.json({success:false,message:"Invalid Password"})
        }
       const token=createToken(user.id);
       res.json({success:true,token,message:"login successfully"});
    } catch (error) {
      console.log(error);
      res.json({success:false,message:"error"});
    }
})

app.listen(port, () => {
    console.log(`server running on port ${port}`)
});