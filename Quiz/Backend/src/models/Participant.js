const mongoose = require('mongoose')
const participantSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:120},
  rollNumber:{type:String,required:true,trim:true,maxlength:80},
  mobile:{type:String,required:true,trim:true,maxlength:20},
  email:{type:String,required:true,trim:true,lowercase:true,maxlength:180},
  college:{type:String,required:true,trim:true,maxlength:180},
  degree:{type:String,required:true,trim:true,maxlength:80},
  branch:{type:String,required:true,trim:true,maxlength:120},
  semesterYear:{type:String,required:true,trim:true,maxlength:60},
  city:{type:String,required:true,trim:true,maxlength:100},
  state:{type:String,required:true,trim:true,maxlength:100},
  bio:{type:String,trim:true,maxlength:240,default:''},
},{timestamps:true})
participantSchema.index({email:1},{unique:true})
module.exports=mongoose.model('QuizParticipant',participantSchema)
