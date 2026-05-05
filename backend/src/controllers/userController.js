const User = require("../models/UserSchema");

exports.addUser = async (req, res) => {
    try {
        const { name, role } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (role && !['admin', 'employee'].includes(role)) {
            return res.status(400).json({ message: "Role must be either 'admin' or 'employee'" });
        }

        const existing = await User.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ 
            name, 
            role: role || 'employee' 
        });

        res.status(201).json({
            message: "✅ User added",
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ===== GET USERS ===== */
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        
        let filter = {};
        if (role && ['admin', 'employee'].includes(role)) {
            filter.role = role;
        }
        
        const users = await User.find(filter).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};