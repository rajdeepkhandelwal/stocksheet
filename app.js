var express = require("express"),
    app     = express({ mergeParams: true }),
    mongoose= require("mongoose"),
    methodOverride= require('method-override'),
    flash   = require("express-flash"),
    Car    = require("./models/cars"),
    Admin = require("./models/admin"),
    bodyParser=require("body-parser"),
    passport =require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalStrategy=require("passport-local-mongoose");
mongoose.connect("mongodb://localhost/datasheet",{ useNewUrlParser: true });    
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    //  res.locals.error=req.flash("error");
    // res.locals.success=req.flash("success");
    next();
});
app.use(require('express-session')({
    secret:"mykey",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

// ============
// Index Routes
// ============
app.get("/",function(req,res){
    res.render("front",{currentUser:req.user});
})

app.get("/cars",function(req,res){
        Car.find({},function(err,foundCar){
        if(err){
            console.log(err);
        }else{
            res.render("home",{cars:foundCar,currentUser:req.user});
        }
    });
});
// ============
// search Route
// ============
app.get("/getdata",function(req,res){
    var noMatch;
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');

        Car.find({$or:[{company:regex}, {carName:regex},{location:regex},{insurance:regex}]},function(err,foundCar){
        if(err){
            console.log(err);
        }else{
            
            if(foundCar.length<1){
                noMatch="No Search Result Found";
            }
            res.render("searchdata",{cars:foundCar,noMatch:noMatch,currentUser:req.user});
        }
    });
});

// ===========
// Admin Route
// ===========
app.get("/admin",isLoggedIn,function(req,res){
    Car.find({},function(err,foundCar){
        if(err){
            console.log(err);
        }else{
            res.render("new",{cars:foundCar,currentUser:req.user});
        }
    });
});
app.post("/cars",function(req,res){
    //create car collection
    Car.create(req.body.car,function(err,newCars){
        if(err){
            console.log(err);
        }else{
            res.redirect("/admin");
        }
    });
});
//============
//Delete Route    
//============ 
app.delete("/cars/:id",function(req,res){
    Car.findByIdAndRemove(req.params.id,function(err,removeCar){
        if(err){
            console.log(err);
        }else{
            res.redirect("/cars");
        }
    });
});
// ==============
// Edit Routes
// ==============
app.get("/cars/:id/edit",function(req,res){
    Car.findById(req.params.id,function(err,foundCar){
        if(err){
            console.log(err);
        }else{
            res.render("carsedit",{cars:foundCar,currentUser:req.user});
        }
    })
})
app.put("/cars/:id",function(req,res){
    Car.findByIdAndUpdate(req.params.id,req.body.car,function(err,updateCar){
        if(err){
            console.log(err);
        }else{
            res.redirect("/cars")
        }
    });
});

// ===============
// Authenticate Routes
// ================
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,res){
    var newUser = new Admin({username:req.body.username});
    Admin.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            // req.flash("error",err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            // req.flash("success","Welcome "+user.username);
            res.redirect("/login");
        });
    });
});

app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",
    { 
        successRedirect:"/admin",
        failureRedirect:"/login"
    }),function(req,res){
});

app.get("/logout",function(req,res){
    req.logout();
    // req.flash("success","successfully logout");
    res.redirect("/cars");
});
// Autosearch function
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
// middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please login first");
    res.redirect("/login");
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server is on");
});


