const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail, sendExitEmail} = require("../emails/account");

router.post("/users", async (req, res) => {

    const user = new User(req.body);
    try {
        const newUser = await user.save();
        sendWelcomeEmail(newUser.email, newUser.name);
        const token = await newUser.genAuthToken();
        res.status(201).send({user, token});
    } catch (err) {
        res.status(400).send(err);
    }

});

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.patch("/users/me", auth, async (req, res) => {
    const allowedUpdates = ["name", "email", "password", "age"];
    const newUpdates = Object.keys(req.body);
    console.log(newUpdates);
    const containsValidUpdates = newUpdates.every(value => allowedUpdates.includes(value));
    if (!containsValidUpdates) {
        res.status(400).send("Invalid update operation!");
        return;
    }
    try {
        newUpdates.forEach(value => req.user[value] = req.body[value]);
        await req.user.save();
        if (!req.user) {
            res.status(404).send();
        }
        res.send(req.user);
    } catch (err) {
        res.status(400).send();
    }
});

router.delete("/users/me", auth, async (req, res) => {

    try {
        await req.user.remove();
        sendExitEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = user.genAuthToken();
        res.send({user, token});
    } catch (err) {
        res.status(400).send(err);
    }
});

const upload = multer({
    limit: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (file.originalname.match(/\.(jpg|jpeg|png)\b/)) {
            return cb(undefined, true)
        }
        cb(new Error("File must be an image!"));
    }
}).single("avatar");
router.post("/users/me/avatar", auth, upload, async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer)
        .resize({
            width: 250,
            height: 250,
        })
        .png()
        .toBuffer();
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});

router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }

});

router.get("/users/:id/avatar", async(req, res)=> {
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error();
        }
        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send(error);
    }
});

module.exports = router;
