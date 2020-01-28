const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        min: 5,
        max: 10,
        lowercase: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error("Please valid email");
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate: (value) => {
            if (value < 0) {
                throw new Error("Age should be greater than 18");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user
};

userSchema.methods.genAuthToken = function () {
    const user = this;
    const token = jwt.sign({id: user._id.toString()}, process.env.JWT_KEY);
    user.tokens.push({token});
    user.save();
    return token;
};

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});
userSchema.pre("remove", async function(next) {
   const user = this;
   await Task.deleteMany({owner: user._id});
   next();
});

const User = new mongoose.model("User", userSchema);


module.exports = User;
