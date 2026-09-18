import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,unique:true,index:true},
  method:{type:String,enum:["upi","bank"],required:true,index:true},
  upiId:{type:String,default:null,trim:true,maxlength:100},
  accountHolderName:{type:String,default:null,trim:true,maxlength:120},
  accountNumberLast4:{type:String,default:null,trim:true,maxlength:4},
  ifsc:{type:String,default:null,trim:true,uppercase:true,maxlength:11},
  providerFundAccountId:{type:String,default:null,trim:true,maxlength:200,select:false},
  verifiedAt:{type:Date,default:null}
},{timestamps:true});
export default mongoose.model("ReferralPayoutDestination",schema);