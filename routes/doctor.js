import express from "express";
import Doctor from "../models/DoctorSchema.js"
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

   
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {

      const ext = file.originalname.split('.').pop();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
})

const upload = multer({ storage: storage })

router.post("/addDoctors", upload.single('image'), async(req,res)=> {
    try {
        const { name, specialty, description, experienceYears } = req.body;

        const image = req.file ? req.file.filename : null
    if(!name || !specialty|| !description || !experienceYears || !image)
     return res.status(400).json({message:"all Fields are required"})

    const newDoctor  = new Doctor({
      name,
      specialty,
      description,
      experienceYears,
      image:req.file?.filename
     

    })

    const savedDoctors = await newDoctor.save()

     res.status(201).json(savedDoctors);
    } catch (error) {
      console.error(error);
    res.status(500).json({ message:error  });
    }
    



})

router.get("/allDoctors", async(req,res)=> {
    const doctors = await Doctor.find()

    res.json(doctors);
})



router.get("/count",async(req,res)=>{
  try {
    const count = await Doctor.countDocuments()
     res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors count" });
  }
})


router.get("/doctors/bySpecialty/:specialty",async(req,res)=>{
  try {
    const {specialty} = req.params;
    console.log('Searching for specialty:', specialty)
    const doctors = await Doctor.find({
      specialty : { $regex: new RegExp(specialty, 'i')}

    })

     console.log('Found doctors:', doctors.length);
    res.json(doctors);
  } catch (error) {
      console.error("error",error)
      res.status(500).json({message:error.message})
  }

})


router.get("/:id", async(req,res)=> {
    const doctor = await Doctor.findById(req.params.id)
    if(!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);

})

export default router;

