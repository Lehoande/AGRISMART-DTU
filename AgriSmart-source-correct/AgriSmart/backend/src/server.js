require('dotenv').config();
const express=require('express'),cors=require('cors'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),{body,validationResult}=require('express-validator'),pool=require('./db'),{auth,allowRoles}=require('./middleware');
const app=express();app.use(cors({origin:process.env.CLIENT_ORIGIN||true}));
app.use('/api/payments/sepay/webhook',express.json({limit:'1mb',verify:(req,_res,buf)=>{req.rawBody=Buffer.from(buf)}}));
app.use(express.json({limit:'1mb'}));
const run=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const check=(req,res,next)=>{const e=validationResult(req);if(!e.isEmpty())return res.status(400).json({message:e.array()[0].msg});next()};
app.get('/api/health',(q,s)=>s.json({status:'ok'}));
app.use('/api/public',require('./routes/public'));
app.use('/api/admin',require('./routes/admin'));
app.get('/api/categories',run(async(q,s)=>{const [rows]=await pool.query('SELECT id,name,slug FROM categories ORDER BY name');s.json(rows)}));
app.post('/api/auth/register',[body('name').trim().isLength({min:2,max:120}),body('email').isEmail().normalizeEmail(),body('password').isLength({min:8}),body('phone').optional({nullable:true}).isLength({max:30}),body('address').optional({nullable:true}).isLength({max:5000})],check,run(async(q,s)=>{const {name,email,password}=q.body;const phone=q.body.phone?String(q.body.phone).trim():null,address=q.body.address?String(q.body.address).trim():null;if(phone&&!/^[+\d][\d\s.-]{7,14}$/.test(phone))return s.status(400).json({message:'Số điện thoại không hợp lệ'});const [old]=await pool.query('SELECT id FROM users WHERE email=?',[email]);if(old.length)return s.status(409).json({message:'Email đã được đăng ký.'});const hash=await bcrypt.hash(password,12);const [r]=await pool.query('INSERT INTO users(name,email,password_hash,phone,address) VALUES(?,?,?,?,?)',[name,email,hash,phone,address]);s.status(201).json({id:r.insertId,message:'Account created.'})}));
app.post('/api/auth/register-seller',[
  body('name').trim().isLength({min:2,max:120}), body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:8}), body('phone').trim().matches(/^[+\d][\d\s.-]{7,14}$/),
  body('farm_name').trim().isLength({min:2,max:180}), body('farm_address').trim().isLength({min:5,max:500}),
],check,run(async(q,s)=>{
  const {name,email,password,phone,farm_name,farm_address}=q.body;
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [old]=await conn.query('SELECT id FROM users WHERE email=? FOR UPDATE',[email]);
    if(old.length){await conn.rollback();return s.status(409).json({message:'Email đã được đăng ký.'})}
    const hash=await bcrypt.hash(password,12);
    const [created]=await conn.query('INSERT INTO users(name,email,password_hash,phone,address,role) VALUES(?,?,?,?,?,\'seller\')',[name.trim(),email,hash,phone.trim(),farm_address.trim()]);
    await conn.query("INSERT INTO seller_profiles(user_id,farm_name,farm_address,status) VALUES(?,?,?,'pending')",[created.insertId,farm_name.trim(),farm_address.trim()]);
    await conn.commit();
    s.status(201).json({id:created.insertId,message:'Seller account created.'});
  } catch(error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}));
app.post('/api/auth/login',[body('email').isEmail().normalizeEmail(),body('password').notEmpty()],check,run(async(q,s)=>{const [rows]=await pool.query('SELECT id,name,email,password_hash,role,two_factor_enabled FROM users WHERE email=?',[q.body.email]);const u=rows[0];if(!u||!await bcrypt.compare(q.body.password,u.password_hash))return s.status(401).json({message:'Email or password không chính xác.'});if(u.two_factor_enabled)return s.json({requires_two_factor:true,challenge_token:jwt.sign({sub:u.id,purpose:'2fa-login'},process.env.JWT_SECRET,{expiresIn:'5m'})});const user={id:u.id,name:u.name,email:u.email,role:u.role};s.json({token:jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'7d'}),user})}));
app.get('/api/auth/me',auth(),run(async(q,s)=>{const [r]=await pool.query('SELECT id,name,email,phone,address,ward,district,province,role,avatar_url,created_at FROM users WHERE id=?',[q.user.id]);s.json(r[0]||{})}));
app.patch('/api/auth/avatar',auth(),run(async(q,s)=>{const avatar=q.body.avatar_url;if(avatar!==null&&(typeof avatar!=='string'||avatar.length>60000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(avatar)))return s.status(400).json({message:'Ảnh đại diện không hợp lệ hoặc quá lớn.'});await pool.query('UPDATE users SET avatar_url=? WHERE id=?',[avatar,q.user.id]);s.json({avatar_url:avatar})}));
app.patch('/api/auth/me',[auth(),body('name').trim().isLength({min:2,max:120}),body('phone').optional({nullable:true}).isLength({max:30}),body('address').optional({nullable:true}).isLength({max:5000}),body('ward').optional({nullable:true}).isLength({max:120}),body('district').optional({nullable:true}).isLength({max:120}),body('province').optional({nullable:true}).isLength({max:120})],check,run(async(q,s)=>{const name=String(q.body.name).trim(),phone=q.body.phone?String(q.body.phone).trim():null,address=q.body.address?String(q.body.address).trim():null,ward=q.body.ward?String(q.body.ward).trim():null,district=q.body.district?String(q.body.district).trim():null,province=q.body.province?String(q.body.province).trim():null;if(phone&&!/^[+\d][\d\s.-]{7,14}$/.test(phone))return s.status(400).json({message:'Số điện thoại không hợp lệ'});await pool.query('UPDATE users SET name=?,phone=?,address=?,ward=?,district=?,province=? WHERE id=?',[name,phone,address,ward,district,province,q.user.id]);const [rows]=await pool.query('SELECT id,name,email,phone,address,ward,district,province,role,avatar_url,created_at FROM users WHERE id=?',[q.user.id]);s.json(rows[0])}));
app.use('/api/products',require('./routes/products'));
app.use('/api/seller/onboard',require('./routes/sellerOnboard'));
app.use('/api/seller',require('./routes/seller'));
// --- Khải Hoàn: cart, checkout/orders, inventory, stats, QR, notifications (xem src/routes) ---
app.use('/api/cart',require('./routes/cart'));
app.use('/api/orders',require('./routes/orders'));
app.use('/api/payments',require('./routes/payments'));
app.use('/api/promotions',require('./routes/promotions'));
app.use('/api/complaints',require('./routes/complaints'));
app.use('/api/inventory',require('./routes/inventory'));
app.use('/api/stats',require('./routes/stats'));
app.use('/api/qr',require('./routes/qr'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/security',require('./routes/security'));
app.get('/api/products/:id/reviews',run(async(q,s)=>{const [r]=await pool.query('SELECT r.*,u.name customer_name FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=? ORDER BY r.created_at DESC',[q.params.id]);s.json(r)}));
app.get('/api/reviews/mine',auth(),run(async(q,s)=>{const [[r]]=await pool.query('SELECT COUNT(*) AS total FROM reviews WHERE user_id=?',[q.user.id]);s.json({total:Number(r.total)})}));
app.post('/api/products/:id/reviews',auth(),run(async(q,s)=>{const rating=Number(q.body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return s.status(400).json({message:'Rating must be 1-5'});const [b]=await pool.query("SELECT oi.id FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.user_id=? AND oi.product_id=? AND o.status='completed' LIMIT 1",[q.user.id,q.params.id]);if(!b.length)return s.status(403).json({message:'Only verified buyers can review'});await pool.query('INSERT INTO reviews(user_id,product_id,rating,comment) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),comment=VALUES(comment)',[q.user.id,q.params.id,rating,String(q.body.comment||'').slice(0,2000)]);s.status(201).json({message:'Review saved'})}));
app.get('/api/recommendations',auth(false),run(async(q,s)=>{const [p]=await pool.query('SELECT id,name,price,unit,stock,origin,image_url,category_id FROM products WHERE is_active=1 AND stock>0');const interactions=[];if(q.user?.id){const [views]=await pool.query("SELECT p.category_id,b.event_type,COUNT(*) weight FROM browsing_events b JOIN products p ON p.id=b.product_id WHERE b.user_id=? AND b.created_at>=DATE_SUB(NOW(),INTERVAL 90 DAY) GROUP BY p.category_id,b.event_type",[q.user.id]);interactions.push(...views);const [purchases]=await pool.query("SELECT p.category_id,'purchase' event_type,SUM(oi.quantity) weight FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id WHERE o.user_id=? AND o.status<>'cancelled' GROUP BY p.category_id",[q.user.id]);interactions.push(...purchases)}const preferredCategoryId=Number(q.query.categoryId)||null;try{const r=await fetch(`${process.env.AI_SERVICE_URL||'http://localhost:8001'}/recommend`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:q.user?.id||null,products:p,interactions,preferred_category_id:preferredCategoryId}),signal:AbortSignal.timeout(3500)});if(r.ok)return s.json(await r.json())}catch{}const ranked=p.sort((a,b)=>Number(b.category_id===preferredCategoryId)-Number(a.category_id===preferredCategoryId)||b.stock-a.stock).slice(0,8).map(item=>({...item,reason:item.category_id===preferredCategoryId?'Đúng nhóm bạn chọn':'Còn hàng'}));s.json({strategy:'inventory-fallback',items:ranked,explanation:'AI service tạm thời không khả dụng; đang sắp xếp theo nhóm đã chọn và tồn kho.'})}));
app.use('/api/ai',require('./routes/ai'));
app.get('/api/admin/stats',auth(),allowRoles('admin','manager'),run(async(q,s)=>{const [[sales]]=await pool.query("SELECT COALESCE(SUM(total),0) revenue,COUNT(*) orders FROM orders WHERE status IN ('confirmed','shipping','completed')");const [[prod]]=await pool.query('SELECT COUNT(*) products,COALESCE(SUM(stock),0) inventory_units FROM products WHERE is_active=1');const [[cust]]=await pool.query("SELECT COUNT(*) customers FROM users WHERE role='customer'");const [topProducts]=await pool.query("SELECT oi.product_name,SUM(oi.quantity) sold FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status<>'cancelled' GROUP BY oi.product_name ORDER BY sold DESC LIMIT 5");s.json({...sales,...prod,...cust,topProducts})}));
app.use(require('./lib/errorHandler'));
const orderService = require('./services/orderService');
const expirePaymentOrders = () => orderService.expireUnpaidBankTransfers().catch((error) => console.error('Payment expiry sweep failed:', error.message));
const paymentExpiryTimer = setInterval(expirePaymentOrders, 10_000);
paymentExpiryTimer.unref();
expirePaymentOrders();
app.listen(Number(process.env.PORT||4000),()=>console.log('AgriSmart API on port '+(process.env.PORT||4000)));
