import mongoose from 'mongoose';

// OTP Schema for verification
const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

// Method to check if OTP has expired
otpVerificationSchema.methods.isOtpExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to mark OTP as verified
otpVerificationSchema.methods.verifyOtp = function() {
  this.verified = true;
  this.save();
};

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
export default OtpVerification;
