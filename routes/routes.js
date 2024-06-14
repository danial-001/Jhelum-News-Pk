const express = require("express");
const router = express.Router();
const News = require("../models/users"); // Assuming this is correct
const multer = require("multer");
const fs = require("fs");
const User = require("../models/User");
const session = require("express-session");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/send-feedback", (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "officialforwork113@gmail.com",
      pass: "Farhan+2003",
    },
  });

  // Set up email data
  const mailOptions = {
    from: email,
    to: "officialforwork113@gmail.com",
    subject: "New Feedback from Contact Us Form",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Error sending email: " + error.message);
    }
    res.send("Feedback sent successfully!");
  });
});
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// Multer configuration...
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// ---------------------------------------------------------------------------

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/signin");
}

function noCache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
}

// ---------------------------------------------------------------------------

// Update the route handler for /about_us
router.get("/about_us", async (req, res) => {
  try {
    const user = await User.findOne({
      /* Add your query condition here */
    }).exec();
    res.render("about_us", {
      title: "About Us",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error fetching user data");
  }
});

// Get All News Route
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ newsCreationTime: -1 }).exec();
    res.render("user", { news, path_to_logo: "/public/images/logo.png" });
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign In" });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.get("/jhelum_news", async (req, res) => {
  try {
    const news = await News.find({ category: "JHELUM" })
      .sort({ newsCreationTime: -1 })
      .exec();
    res.render("jhelum_news", { news });
  } catch (err) {
    res.status(500).send("Database query failed");
  }
});

router.get("/international_news", async (req, res) => {
  try {
    const internationalNews = await News.find({
      category: "INTERNATIONAL",
    })
      .sort({ newsCreationTime: -1 })
      .exec();
    res.render("international_news", {
      title: "International News",
      news: internationalNews,
    });
  } catch (error) {
    console.error("Error fetching International news:", error);
    res.status(500).send("Error fetching International news");
  }
});

router.get("/national_news", async (req, res) => {
  try {
    const nationalNews = await News.find({ category: "NATIONAL" })
      .sort({ newsCreationTime: -1 })
      .exec();
    res.render("national_news", {
      title: "National News",
      news: nationalNews,
    });
  } catch (error) {
    console.error("Error fetching National news:", error);
    res.status(500).send("Error fetching National news");
  }
});

router.get("/news/:id", async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsItem = await News.findById(newsId).exec();
    if (newsItem) {
      // console.log('News item:', newsItem); // Debugging line
      res.render("news_detail", { article: newsItem });
    } else {
      res.status(404).send("News not found");
    }
  } catch (err) {
    res.status(500).send("Database query failed");
  }
});

router.get("/about_us", (req, res) => {
  res.render("about_us", { title: "About Us" });
});

router.get("/contact_us", (req, res) => {
  res.render("contact_us", { title: "Contact Us" });
});

router.get("/index", isAuthenticated, noCache, async (req, res) => {
  try {
    const newsData = await News.find().sort({ newsCreationTime: -1 }).exec();
    res.render("index", { title: "Home", News: newsData });
  } catch (error) {
    console.error("Error fetching news data:", error);
    res.status(500).send("Error fetching news data");
  }
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    await user.save();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing up user");
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).send("Invalid password");
    }
    req.session.user = { email };
    res.redirect("/index");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing in user");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    // -----------------------------------------------------------------------------
    res.clearCookie("connect.sid");
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    // -----------------------------------------------------------------------------

    res.redirect("/");
  });
});

router.get("/addnews/jhelum", isAuthenticated, (req, res) => {
  res.render("addJhelumNews", { title: "Add Jhelum News" });
});

router.get("/addnews/national", isAuthenticated, (req, res) => {
  res.render("addNationalNews", { title: "Add National News" });
});

router.get("/addnews/international", isAuthenticated, (req, res) => {
  res.render("addInternationalNews", { title: "Add International News" });
});

router.post("/addnews/:category", upload, async (req, res) => {
  const { category } = req.params;
  const news = new News({
    newsHeading: req.body.newsHeading,
    description: req.body.description,
    image: req.file ? req.file.filename : "",
    newsCreationTime: req.body.newsCreationTime,
    category: category.toUpperCase(),
  });

  try {
    await news.save();
    req.session.message = {
      type: "success",
      message: "News added successfully!",
    };
    res.redirect("/index");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/edit/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.findById(id).exec();
    if (!news) {
      res.redirect("/");
    } else {
      res.render("editUsers", {
        title: "Edit News",
        News: news,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/index");
  }
});

router.post("/update/:id", isAuthenticated, upload, async (req, res) => {
  const id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await News.findByIdAndUpdate(id, {
      newsHeading: req.body.newsHeading,
      description: req.body.description,
      image: new_image,
    }).exec();
    req.session.message = {
      type: "success",
      message: "News updated successfully!",
    };
    res.redirect("/index");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/delete/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await News.findByIdAndDelete(id).exec();
    if (result && result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    req.session.message = {
      type: "success",
      message: "News deleted successfully!",
    };
    res.redirect("/index");
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
