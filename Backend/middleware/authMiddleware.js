import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ;

export const protectRoute = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("Decoded JWT:", decoded);
    
    req.user = { _id: decoded.userId };  
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
