// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för en ny användare
const userSchema = new mongoose.Schema({

    // Användarnamn
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Mejl
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Lösenord
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    // Roll
    role: {
        type: String,
        require: true,
        default: "Personal"
    },

    // Timestamp när kontot blev skapat
    account_created: {
        type: Date,
        default: Date.now
    }
});

// Lösenordet hashas innan det sparas genom pre
userSchema.pre("save", async function() {
    // Provar hasha lösenord
    try {
        if (this.isNew || this.isModified("password")) {
            const hashedPassword = await bcrypt.hash(this.password, 10); // 10 salter för det hashade lösenordet
            this.password = hashedPassword;
        }
        // Felmeddelande om något gick fel
    } catch (error) {
        throw Error;
    }
});

// Registrerar en ny användare
userSchema.statics.register = async function(username, email, password, role) {
    try {
        const newUser = new this({ username, email, password, role }); // Ny användare
        await newUser.save();
        return newUser;
    } catch (error) {
        throw error;
    }
};

// Lägger till den tillagda användaren inom collection user i MongoDB
const User = mongoose.model("user", userSchema);
// Export för att använda inom resten av filerna
module.exports = User;