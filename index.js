const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const BlogModel = require("./Schemas/Blog");
const cors = require("cors");
const AdminModel = require("./Schemas/Admin");
app.use(express.json());
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const ContactModel = require("./Schemas/Contact");
const {localityModel} = require("./Schemas/Locality");

app.use(cors({
	origin: ["http://localhost:3000", "http://localhost:5500", 'https://knock-dubai-admin.vercel.app', "https://knock-dubai-frontend.vercel.app"]
}))


mongoose.connect(process.env.MONGODB_URL)
	.then(() => {
		console.log("Database Connected")
	})
	.catch((err) => {
		console.log(err.message)
	})

app.get("/get-blogs", async (req, res) => {
	try {
		const blogs = await BlogModel.find({})
		res.json({
			error: false,
			message: "Blog Fetched Succesfully!",
			blogs: blogs
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			blogs: undefined
		})
	}
})

app.get("/get-blog/:_id", async (req, res) => {
	try {
		const blog = await BlogModel.findById(req.params._id)
		res.json({
			error: false,
			message: "Blog Fetched Succesfully!",
			blog: blog
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			blogs: undefined
		})
	}
})

app.post("/create", async (req, res) => {
	try {
		const newBlog = await BlogModel.create(req.body);
		res.json({
			error: false,
			message: "Blog Created Succesfully!",
			blog: newBlog
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			blog: undefined
		})
	}
})

// app.post("/contact", async (req, res) => {
// 	try {
// 		const newContact = await ContactModel.create(req.body);
// 		res.json({
// 			error: false,
// 			message: "Successful!",
// 			contact: newContact
// 		})
// 	} catch (error) {
// 		res.json({
// 			error: true,
// 			message: error.message,
// 			contact: undefined
// 		})
// 	}
// })

// app.get("/contact", async (req, res) => {
// 	try {
// 		const contacts = await ContactModel.find({});
// 		res.json({
// 			error: false,
// 			message: "Successful!",
// 			contacts: contacts
// 		})
// 	} catch (error) {
// 		res.json({
// 			error: true,
// 			message: error.message,
// 			contacts: undefined
// 		})
// 	}
// })

app.post("/admin/signin", async (req, res) => {
	try {
		const admin = await AdminModel.findOne({ username: req.body.username });
		if (admin) {
			if (await bcrypt.compare(req.body.password, admin.password)) {
				res.json({
					error: false,
					message: "Succesful!",
					token: await jwt.sign({ _id: admin._id, role: "admin" }, "knock-dubai")
				})
			} else {
				res.json({
					error: true,
					message: "Incorrect password",
					token: undefined
				})
			}
		} else {
			res.json({
				error: true,
				message: "User not found!",
				token: undefined
			})
		}
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			blog: undefined
		})
	}
})

app.post("/admin/signup", async (req, res) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt)
		const admin = await AdminModel.create({ ...req.body, password: hashedPassword });
		const token = await jwt.sign({ role: "admin", _id: admin._id }, "knock-dubai");
		res.json({
			error: false,
			message: "Signed Up Succesfully!",
			token: token
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			token: undefined
		})
	}
})

app.patch("/update/:_id", async (req, res) => {
	try {
		const updatedBlog = await BlogModel.findByIdAndUpdate(req.params._id, req.body, {
			returnOriginal: false
		});
		res.json({
			error: false,
			message: "Blog Updated Succesfully!",
			blog: updatedBlog
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
			blog: undefined
		})
	}
})

app.delete("/delete/:_id", async (req, res) => {
	try {
		await BlogModel.findByIdAndDelete(req.params._id);
		res.json({
			error: false,
			message: "Blog Deleted Succesfully!",
		})
	} catch (error) {
		res.json({
			error: true,
			message: error.message,
		})
	}
})

// Add Locality
app.post("/add-area", async(req, res) => {
	const data = req.body;
	try {
		const findArea = await localityModel.find({ 
			$and:[{ country: data.country }, 
			{ city: data.city }] 
		});

		if(findArea.length == 0) {
			const insertQuery = await new localityModel(data).save();
	
			if(insertQuery) {
				res.json({
					error: false,
					message: "Data Inserted",
					response: insertQuery,
				});
			}
			else {
				res.json({
					error: true,
					message: "Some Issue Occurs",
				});
			}
		}
		else {
			res.json({
				error: true,
				message: "Data Already Exists",
			});
		}
	}
	catch(error) {
		res.json({
			error: true,
			message: error.message,
		})
	}
})

// get All Locality
app.get("/get-locality", async(req, res) => {
	try {
		const getLocality = await localityModel.distinct('city');

		if(getLocality.length != 0) {
			res.json({ 
				error: false,
				message: "Data Fetched",
				response: getLocality,
			})
		}
		else {
			res.json({
				error: true,
				message: "No Data Found"
			})
		}
	}
	catch(error) {
		res.json({
			error: true,
			message: error.message,
		})
	}
})

// Fetch Blogs by Location
app.post("/blogs-by-location", async(req, res) => {
	try {
		const getLocation = await localityModel.find({ city: req.body.city });
		if(getLocation != 0) {
			const getBlogs =  await BlogModel.find({ city: req.body.city });
			if(getBlogs.length != 0) {
				res.json({
					error: false,
					message: "Data Fetched",
					response: getBlogs,
				});
			}
			else {
				res.json({
					error: true,
					message: "No Data Found",
				});
			}
		}
		else {
			res.json({
				error: true,
				message: "Location Does Not Exists",
			})
		}
	}
	catch(error) {
		res.json({
			error: true,
			message: error.message,
		});
	}
})

// app.post("/contact", async (req, res) => {
// 	try {
// 		const newContact = await ContactModel.create(req.body);
// 		res.json({
// 			error: false,
// 			message: "Successful!",
// 			contact: newContact
// 		})
// 	} catch (error) {
// 		res.json({
// 			error: true,
// 			message: error.message,
// 			contact: undefined
// 		})
// 	}
// })

// Contact Us Form
app.post("/contact-us", async(req, res) => {
	const data = req.body;
	try {		
		const transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
			  user: process.env.ADMIN_EMAIL,
			  pass: process.env.EMAIL_PASSWORD, 
			},
			authMethod: 'PLAIN',
		});
	
		// Composing Email
		const mailOptions = {
			from: process.env.ADMIN_EMAIL,
			to: process.env.ADMIN_EMAIL,
			subject: `Query related to ${ data.queryType }`,
			text: data.message,
		};

		// Sending the email
		const sendEmail = transporter.sendMail(mailOptions);

		if(sendEmail) {
			
			const query = await ContactModel(data).save();
			if(query) {
				res.json({
					error: false,
					message: "Data Inserted",
					response: query,
				});
			}
		}
		else {
			res.json({
				error: true,
				message: "Some Issue Occurs"
			})
		}
	}
	catch(error) {
		res.json({
			error: true,
			message: error.message,
		})
	}
})

app.listen(process.env.PORT, () => {
	console.log("Server Started")
})