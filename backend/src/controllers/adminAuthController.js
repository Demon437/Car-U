const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// ===============================
// LOGIN ADMIN
// POST /api/admin/login
// ===============================

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRE || "7d",
      }
    );

    res.json({
      message: "Login successful",

      token,

      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ===============================
// FORGOT PASSWORD
// POST /api/admin/forgot-password
// ===============================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    // Always same response
    if (!admin) {
      return res.json({
        message:
          "If account exists, reset link sent",
      });
    }

    // Generate token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Save token
    admin.resetPasswordToken = resetToken;

    // 15 minutes expiry
    admin.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await admin.save();

    // Frontend reset URL
    const resetUrl =
      `${process.env.FRONTEND_URL}` +
      `/admin/reset-password/${resetToken}`;

    // Mail transporter
    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    // Email template
    const mailOptions = {
      from: process.env.EMAIL_USER,

      to: admin.email,

      subject: "Password Reset Request",

      html: `
        <div style="font-family:sans-serif;">
          <h2>Password Reset</h2>

          <p>
            Click the button below to reset your password.
          </p>

          <a 
            href="${resetUrl}"
            style="
              background:#2563eb;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:20px;">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message:
        "If account exists, reset link sent",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ===============================
// RESET PASSWORD
// POST /api/admin/reset-password/:token
// ===============================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password required",
      });
    }

    const admin = await Admin.findOne({
      resetPasswordToken: token,

      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!admin) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Save new password
    admin.password = hashedPassword;

    // Clear reset fields
    admin.resetPasswordToken = undefined;

    admin.resetPasswordExpire = undefined;

    await admin.save();

    res.json({
      message:
        "Password reset successful",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};