const jwt=require('jsonwebtoken');
function auth(required=true){return(req,res,next)=>{const h=req.headers.authorization||'',token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)return required?res.status(401).json({message:'Please log in.'}):next();try{req.user=jwt.verify(token,process.env.JWT_SECRET);next()}catch{return res.status(401).json({message:'Invalid or expired token.'})}}}
function allowRoles(...roles){return(req,res,next)=>req.user&&roles.includes(req.user.role)?next():res.status(403).json({message:'Access denied.'})}
module.exports={auth,allowRoles};
